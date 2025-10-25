"""
Chroma Vector Database Service
Handles semantic search of past conversations
"""

import chromadb
from typing import List, Dict, Any, Optional
import logging
from uuid import UUID

from app.core.config import settings

logger = logging.getLogger(__name__)


class ChromaService:
    """
    Service for interacting with Chroma vector database
    Used for semantic search of similar past conversations
    """

    def __init__(self):
        """Initialize Chroma client"""
        try:
            # Initialize local Chroma client using new API
            self.client = chromadb.PersistentClient(
                path=settings.CHROMA_PERSIST_DIRECTORY
            )

            # Get or create conversations collection
            self.conversations_collection = self.client.get_or_create_collection(
                name="patient_conversations",
                metadata={"description": "Patient conversation history for semantic search"}
            )

            logger.info("Chroma service initialized with local persistence")

        except Exception as e:
            logger.error(f"Error initializing Chroma service: {str(e)}", exc_info=True)
            raise

    async def add_conversation(
        self,
        conversation_id: str,
        patient_id: str,
        patient_message: str,
        ai_response: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add a conversation to the vector database

        Args:
            conversation_id: Conversation UUID
            patient_id: Patient UUID
            patient_message: Patient's message
            ai_response: AI's response
            metadata: Additional metadata (sentiment, health_mentions, etc.)

        Returns:
            bool: Success status
        """
        try:
            # Combine message and response for better semantic search
            combined_text = f"Patient: {patient_message}\nAI: {ai_response}"

            # Prepare metadata
            conv_metadata = {
                "patient_id": str(patient_id),
                "conversation_id": str(conversation_id),
                "patient_message": patient_message[:500],  # Truncate for metadata storage
                "sentiment": metadata.get("sentiment", "neutral") if metadata else "neutral"
            }

            # Add health mentions if available
            if metadata and metadata.get("health_mentions"):
                conv_metadata["health_mentions"] = ",".join(metadata["health_mentions"][:5])

            # Add to collection
            self.conversations_collection.add(
                documents=[combined_text],
                metadatas=[conv_metadata],
                ids=[str(conversation_id)]
            )

            logger.debug(f"Added conversation {conversation_id} to Chroma")
            return True

        except Exception as e:
            logger.error(f"Error adding conversation to Chroma: {str(e)}", exc_info=True)
            return False

    async def search_similar_conversations(
        self,
        patient_id: str,
        query_message: str,
        n_results: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for semantically similar past conversations

        Args:
            patient_id: Patient UUID to filter by
            query_message: Message to search for similar conversations
            n_results: Number of results to return
            filter_metadata: Additional metadata filters

        Returns:
            List of similar conversations with similarity scores
        """
        try:
            # Build where filter
            where_filter = {"patient_id": str(patient_id)}

            if filter_metadata:
                where_filter.update(filter_metadata)

            # Search for similar conversations
            results = self.conversations_collection.query(
                query_texts=[query_message],
                n_results=n_results,
                where=where_filter
            )

            # Format results
            similar_conversations = []

            if results and results.get("ids") and len(results["ids"]) > 0:
                for i, conv_id in enumerate(results["ids"][0]):
                    similarity_score = 1.0 - results["distances"][0][i] if results.get("distances") else 0.0

                    similar_conversations.append({
                        "conversation_id": conv_id,
                        "similarity_score": round(similarity_score, 3),
                        "patient_message": results["metadatas"][0][i].get("patient_message", ""),
                        "sentiment": results["metadatas"][0][i].get("sentiment", "neutral"),
                        "health_mentions": results["metadatas"][0][i].get("health_mentions", "").split(",") if results["metadatas"][0][i].get("health_mentions") else []
                    })

            logger.debug(f"Found {len(similar_conversations)} similar conversations for patient {patient_id}")
            return similar_conversations

        except Exception as e:
            logger.error(f"Error searching similar conversations: {str(e)}", exc_info=True)
            return []

    async def get_patient_conversation_summary(
        self,
        patient_id: str,
        topic: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get summary of patient's conversations, optionally filtered by topic

        Args:
            patient_id: Patient UUID
            topic: Optional topic to filter by (e.g., "pain", "medication")

        Returns:
            Dict containing conversation statistics
        """
        try:
            # Get all conversations for patient
            results = self.conversations_collection.get(
                where={"patient_id": str(patient_id)},
                include=["metadatas"]
            )

            total_conversations = len(results["ids"]) if results.get("ids") else 0

            # Analyze sentiments
            sentiments = {}
            health_topics = []

            if results.get("metadatas"):
                for metadata in results["metadatas"]:
                    sentiment = metadata.get("sentiment", "neutral")
                    sentiments[sentiment] = sentiments.get(sentiment, 0) + 1

                    health_mentions = metadata.get("health_mentions", "")
                    if health_mentions:
                        health_topics.extend(health_mentions.split(","))

            # Count unique health topics
            unique_health_topics = list(set(health_topics))

            return {
                "total_conversations": total_conversations,
                "sentiment_distribution": sentiments,
                "unique_health_topics": unique_health_topics[:10],  # Top 10
                "health_topic_count": len(unique_health_topics)
            }

        except Exception as e:
            logger.error(f"Error getting conversation summary: {str(e)}", exc_info=True)
            return {
                "total_conversations": 0,
                "sentiment_distribution": {},
                "unique_health_topics": [],
                "health_topic_count": 0
            }

    async def delete_patient_conversations(self, patient_id: str) -> bool:
        """
        Delete all conversations for a patient

        Args:
            patient_id: Patient UUID

        Returns:
            bool: Success status
        """
        try:
            # Get all conversation IDs for this patient
            results = self.conversations_collection.get(
                where={"patient_id": str(patient_id)},
                include=[]
            )

            if results.get("ids") and len(results["ids"]) > 0:
                # Delete conversations
                self.conversations_collection.delete(
                    ids=results["ids"]
                )
                logger.info(f"Deleted {len(results['ids'])} conversations for patient {patient_id}")

            return True

        except Exception as e:
            logger.error(f"Error deleting patient conversations: {str(e)}", exc_info=True)
            return False

    def get_collection_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the conversations collection

        Returns:
            Dict with collection statistics
        """
        try:
            count = self.conversations_collection.count()

            return {
                "total_conversations": count,
                "collection_name": self.conversations_collection.name,
                "status": "healthy"
            }

        except Exception as e:
            logger.error(f"Error getting collection stats: {str(e)}", exc_info=True)
            return {
                "total_conversations": 0,
                "collection_name": "unknown",
                "status": "error",
                "error": str(e)
            }


# Global instance
chroma_service = ChromaService()
