"""
Letta AI Service
Handles long-term memory, pattern recognition, and behavioral insights
"""

import httpx
from typing import Dict, Any, List, Optional
import logging
import json

from app.core.config import settings

logger = logging.getLogger(__name__)


class LettaService:
    """
    Service for interacting with Letta API
    Used for long-term memory management and pattern recognition
    """

    def __init__(self):
        """Initialize Letta client"""
        self.base_url = settings.LETTA_BASE_URL
        self.api_key = settings.LETTA_API_KEY
        self.project_id = settings.LETTA_PROJECT_ID
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        logger.info("Letta service initialized")

    async def create_agent_for_patient(
        self,
        patient_id: str,
        patient_context: Dict[str, Any]
    ) -> Optional[str]:
        """
        Create a new Letta agent for a patient

        Args:
            patient_id: Patient UUID
            patient_context: Patient information

        Returns:
            agent_id: Letta agent ID
        """
        try:
            async with httpx.AsyncClient() as client:
                # Create agent with patient context
                agent_data = {
                    "name": f"patient_{patient_id}",
                    "persona": self._build_patient_persona(patient_context),
                    "human": self._build_caregiver_human(),
                    "project_id": self.project_id
                }

                response = await client.post(
                    f"{self.base_url}/v1/agents",
                    headers=self.headers,
                    json=agent_data,
                    timeout=30.0
                )

                if response.status_code == 200:
                    agent = response.json()
                    agent_id = agent.get("id")
                    logger.info(f"Created Letta agent {agent_id} for patient {patient_id}")
                    return agent_id
                else:
                    logger.error(f"Failed to create Letta agent: {response.status_code} - {response.text}")
                    return None

        except Exception as e:
            logger.error(f"Error creating Letta agent: {str(e)}", exc_info=True)
            return None

    async def send_message_to_agent(
        self,
        agent_id: str,
        message: str,
        conversation_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send a message to Letta agent and get memory-aware response

        Args:
            agent_id: Letta agent ID
            message: Message to send
            conversation_context: Additional context

        Returns:
            Dict containing:
            - letta_response: Agent's response
            - memory_context: Relevant memories retrieved
            - patterns_detected: Behavioral patterns detected
        """
        try:
            async with httpx.AsyncClient() as client:
                message_data = {
                    "message": message,
                    "stream": False
                }

                response = await client.post(
                    f"{self.base_url}/v1/agents/{agent_id}/messages",
                    headers=self.headers,
                    json=message_data,
                    timeout=30.0
                )

                if response.status_code == 200:
                    letta_response = response.json()

                    # Extract memories and patterns
                    messages = letta_response.get("messages", [])
                    memory_context = self._extract_memory_context(messages)

                    return {
                        "letta_response": letta_response,
                        "memory_context": memory_context,
                        "patterns_detected": [],
                        "success": True
                    }
                else:
                    logger.error(f"Failed to send message to Letta: {response.status_code}")
                    return {
                        "letta_response": None,
                        "memory_context": {},
                        "patterns_detected": [],
                        "success": False
                    }

        except Exception as e:
            logger.error(f"Error sending message to Letta: {str(e)}", exc_info=True)
            return {
                "letta_response": None,
                "memory_context": {},
                "patterns_detected": [],
                "success": False,
                "error": str(e)
            }

    async def analyze_long_term_patterns(
        self,
        agent_id: str,
        analysis_type: str = "behavioral"
    ) -> Dict[str, Any]:
        """
        Analyze long-term patterns for a patient

        Args:
            agent_id: Letta agent ID
            analysis_type: Type of analysis (behavioral, health, mood)

        Returns:
            Dict containing insights and patterns
        """
        try:
            async with httpx.AsyncClient() as client:
                # Get agent memory
                response = await client.get(
                    f"{self.base_url}/v1/agents/{agent_id}/memory",
                    headers=self.headers,
                    timeout=30.0
                )

                if response.status_code == 200:
                    memory_data = response.json()

                    # Analyze patterns from memory
                    patterns = self._analyze_memory_patterns(memory_data, analysis_type)

                    return {
                        "patterns": patterns,
                        "memory_summary": memory_data,
                        "success": True
                    }
                else:
                    logger.error(f"Failed to get agent memory: {response.status_code}")
                    return {
                        "patterns": [],
                        "memory_summary": {},
                        "success": False
                    }

        except Exception as e:
            logger.error(f"Error analyzing patterns: {str(e)}", exc_info=True)
            return {
                "patterns": [],
                "memory_summary": {},
                "success": False,
                "error": str(e)
            }

    async def generate_insight(
        self,
        agent_id: str,
        patient_context: Dict[str, Any],
        recent_conversations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate behavioral insight using Letta's long-term memory

        Args:
            agent_id: Letta agent ID
            patient_context: Patient information
            recent_conversations: Recent conversation data

        Returns:
            Dict containing insight details
        """
        try:
            # Build analysis prompt
            conversation_summary = "\n".join([
                f"- {conv.get('created_at')}: {conv.get('sentiment', 'unknown')} sentiment"
                for conv in recent_conversations[:10]
            ])

            analysis_prompt = f"""Based on your long-term memory of this patient and recent conversations, provide an insight:

Recent conversations:
{conversation_summary}

Identify:
1. Any emerging behavioral patterns
2. Changes in mood or health concerns over time
3. Significant observations that caregivers should know

Provide a brief, actionable insight."""

            # Send to Letta agent
            result = await self.send_message_to_agent(
                agent_id=agent_id,
                message=analysis_prompt
            )

            if result.get("success"):
                letta_response = result.get("letta_response", {})
                messages = letta_response.get("messages", [])

                # Extract assistant message
                insight_text = ""
                for msg in messages:
                    if msg.get("role") == "assistant":
                        insight_text = msg.get("content", "")
                        break

                return {
                    "insight_text": insight_text,
                    "memory_context": result.get("memory_context", {}),
                    "confidence_score": 0.8,  # Could be calculated based on memory depth
                    "success": True
                }
            else:
                return {
                    "insight_text": "Unable to generate insight at this time",
                    "memory_context": {},
                    "confidence_score": 0.0,
                    "success": False
                }

        except Exception as e:
            logger.error(f"Error generating insight: {str(e)}", exc_info=True)
            return {
                "insight_text": f"Error generating insight: {str(e)}",
                "memory_context": {},
                "confidence_score": 0.0,
                "success": False
            }

    def _build_patient_persona(self, patient_context: Dict[str, Any]) -> str:
        """Build persona for Letta agent based on patient context"""
        first_name = patient_context.get("first_name", "Patient")
        age = patient_context.get("age", "")
        medical_conditions = patient_context.get("medical_conditions", [])

        persona = f"You are tracking the health and well-being of {first_name}"

        if age:
            persona += f", age {age}"

        if medical_conditions:
            persona += f". Medical conditions: {', '.join(medical_conditions)}"

        persona += ". Your role is to remember patterns, behaviors, and changes over time to help caregivers provide better care."

        return persona

    def _build_caregiver_human(self) -> str:
        """Build human description for Letta agent"""
        return "The caregiver is a family member or professional who cares for this patient. They want to understand behavioral patterns, health changes, and provide the best possible care."

    def _extract_memory_context(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract relevant memory context from Letta messages"""
        memory_context = {
            "recent_patterns": [],
            "mood_indicators": [],
            "health_notes": []
        }

        for message in messages:
            # Extract function calls that indicate memory retrieval
            if message.get("function_call"):
                func_name = message.get("function_call", {}).get("name", "")
                if "memory" in func_name or "recall" in func_name:
                    memory_context["recent_patterns"].append(message.get("content", ""))

        return memory_context

    def _analyze_memory_patterns(
        self,
        memory_data: Dict[str, Any],
        analysis_type: str
    ) -> List[Dict[str, Any]]:
        """Analyze patterns from memory data"""
        patterns = []

        # This would involve more sophisticated analysis of the memory structure
        # For now, return a placeholder structure

        if analysis_type == "behavioral":
            patterns.append({
                "type": "behavioral_pattern",
                "description": "Pattern analysis based on long-term memory",
                "confidence": 0.7
            })

        return patterns


# Global instance
letta_service = LettaService()
