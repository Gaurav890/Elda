"""
Claude AI Service
Handles real-time conversation understanding and analysis
"""

import anthropic
from typing import Dict, Any, List, Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class ClaudeService:
    """
    Service for interacting with Claude API
    Used for real-time conversation analysis, sentiment detection, and health mention extraction
    """

    def __init__(self):
        """Initialize Claude client"""
        self.client = anthropic.Anthropic(api_key=settings.CLAUDE_API_KEY)
        self.model = "claude-3-5-sonnet-20241022"  # Latest Claude 3.5 Sonnet
        logger.info("Claude service initialized")

    async def analyze_conversation(
        self,
        patient_message: str,
        patient_context: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Analyze a patient's message and generate appropriate AI response

        Args:
            patient_message: The patient's spoken message
            patient_context: Patient information (name, medical conditions, medications, personal context)
            conversation_history: Recent conversation history for context

        Returns:
            Dict containing:
            - ai_response: The response to speak back to the patient
            - sentiment: Detected sentiment (positive, neutral, concerned, distressed)
            - health_mentions: List of health-related topics mentioned
            - urgency_level: Urgency level (none, low, medium, high, critical)
            - analysis: Detailed analysis for caregivers
        """
        try:
            # Build context prompt
            system_prompt = self._build_system_prompt(patient_context)

            # Build conversation messages
            messages = []

            # Add conversation history if available
            if conversation_history:
                for conv in conversation_history[-5:]:  # Last 5 conversations for context
                    messages.append({
                        "role": "user",
                        "content": conv.get("patient_message", "")
                    })
                    messages.append({
                        "role": "assistant",
                        "content": conv.get("ai_response", "")
                    })

            # Add current message
            messages.append({
                "role": "user",
                "content": patient_message
            })

            # Call Claude API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system=system_prompt,
                messages=messages
            )

            # Extract AI response
            ai_response = response.content[0].text

            # Analyze the conversation for metadata
            analysis = await self._extract_conversation_metadata(
                patient_message=patient_message,
                ai_response=ai_response,
                patient_context=patient_context
            )

            return {
                "ai_response": ai_response,
                "sentiment": analysis.get("sentiment", "neutral"),
                "health_mentions": analysis.get("health_mentions", []),
                "urgency_level": analysis.get("urgency_level", "none"),
                "analysis": analysis.get("detailed_analysis", ""),
                "response_successful": True
            }

        except Exception as e:
            logger.error(f"Error in Claude conversation analysis: {str(e)}", exc_info=True)
            return {
                "ai_response": "I'm having trouble understanding right now. Let me get your caregiver to help.",
                "sentiment": "neutral",
                "health_mentions": [],
                "urgency_level": "medium",  # Flag technical issues
                "analysis": f"Error occurred: {str(e)}",
                "response_successful": False
            }

    async def _extract_conversation_metadata(
        self,
        patient_message: str,
        ai_response: str,
        patient_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Extract metadata from the conversation for analytics

        Returns:
            - sentiment: Overall sentiment
            - health_mentions: Health topics mentioned
            - urgency_level: How urgent the matter is
            - detailed_analysis: Analysis for caregivers
        """
        try:
            analysis_prompt = f"""Analyze this conversation between an elderly patient and an AI companion:

Patient: {patient_message}
AI Response: {ai_response}

Patient Context:
- Medical Conditions: {patient_context.get('medical_conditions', [])}
- Medications: {patient_context.get('medications', [])}
- Age: {patient_context.get('age', 'unknown')}

Provide a JSON response with:
1. sentiment: (positive, neutral, concerned, distressed)
2. health_mentions: List of specific health topics mentioned (e.g., ["knee pain", "medication side effects"])
3. urgency_level: (none, low, medium, high, critical)
4. detailed_analysis: Brief analysis for caregiver (2-3 sentences)

Consider urgency_level:
- critical: Emergency situation, severe pain, falls, chest pain, breathing issues
- high: Significant health concerns, missed medications, severe discomfort
- medium: Moderate concerns, mild symptoms, questions about care
- low: Minor issues, general questions
- none: Social conversation, positive interactions

Return ONLY valid JSON."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=512,
                messages=[{
                    "role": "user",
                    "content": analysis_prompt
                }]
            )

            # Parse JSON response
            import json
            analysis_text = response.content[0].text

            # Extract JSON from response (handle markdown code blocks)
            if "```json" in analysis_text:
                analysis_text = analysis_text.split("```json")[1].split("```")[0].strip()
            elif "```" in analysis_text:
                analysis_text = analysis_text.split("```")[1].split("```")[0].strip()

            analysis = json.loads(analysis_text)
            return analysis

        except Exception as e:
            logger.error(f"Error extracting conversation metadata: {str(e)}", exc_info=True)
            return {
                "sentiment": "neutral",
                "health_mentions": [],
                "urgency_level": "none",
                "detailed_analysis": "Unable to analyze conversation"
            }

    def _build_system_prompt(self, patient_context: Dict[str, Any]) -> str:
        """
        Build system prompt for Claude with patient context
        """
        patient_name = patient_context.get("preferred_name") or patient_context.get("first_name", "there")
        age = patient_context.get("age", "")
        medical_conditions = patient_context.get("medical_conditions", [])
        medications = patient_context.get("medications", [])
        personal_context = patient_context.get("personal_context", {})

        prompt = f"""You are a compassionate AI companion for elderly care named Elda. You are speaking with {patient_name}"""

        if age:
            prompt += f", who is {age} years old"

        prompt += ".\n\n"

        if medical_conditions:
            prompt += f"Medical Conditions: {', '.join(medical_conditions)}\n"

        if medications:
            prompt += f"Current Medications: {', '.join(medications)}\n"

        if personal_context:
            prompt += f"\nPersonal Context:\n"
            for key, value in personal_context.items():
                prompt += f"- {key}: {value}\n"

        prompt += """
Your role:
1. Be warm, patient, and conversational
2. Use simple, clear language
3. Remember their medical conditions and medications
4. Listen for health concerns, pain, or distress
5. Encourage medication adherence and healthy habits
6. Provide companionship and emotional support
7. Alert caregivers if you detect emergencies or serious concerns
8. Keep responses brief and easy to understand (2-3 sentences max)

Important:
- NEVER provide medical advice or diagnose conditions
- If they mention severe pain, falls, breathing issues, or chest pain, acknowledge their concern and say you're alerting their caregiver
- Be conversational and natural, like a caring friend
- Use their personal context to make conversations meaningful
"""
        return prompt

    async def generate_daily_summary(
        self,
        conversations: List[Dict[str, Any]],
        reminders: List[Dict[str, Any]],
        patient_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered daily summary

        Args:
            conversations: List of conversations from the day
            reminders: List of reminders and their completion status
            patient_context: Patient information

        Returns:
            Dict containing:
            - summary: Human-readable summary
            - health_concerns: List of concerns
            - positive_highlights: List of positive moments
            - recommendations: List of recommendations for caregivers
        """
        try:
            # Build summary prompt
            conversation_summaries = "\n".join([
                f"- {conv.get('created_at', 'Time unknown')}: Patient: \"{conv.get('patient_message', '')}\" | Sentiment: {conv.get('sentiment', 'unknown')}"
                for conv in conversations[:20]  # Last 20 conversations
            ])

            completed_reminders = [r for r in reminders if r.get('status') == 'completed']
            missed_reminders = [r for r in reminders if r.get('status') == 'missed']

            adherence_rate = (len(completed_reminders) / len(reminders) * 100) if reminders else 0

            prompt = f"""Generate a daily summary for {patient_context.get('first_name', 'the patient')}.

Conversations today ({len(conversations)} total):
{conversation_summaries}

Reminders:
- Total: {len(reminders)}
- Completed: {len(completed_reminders)}
- Missed: {len(missed_reminders)}
- Adherence Rate: {adherence_rate:.1f}%

Provide a JSON response with:
1. summary: A warm, comprehensive summary (3-4 sentences) highlighting the day's activities, mood, and overall well-being
2. health_concerns: Array of specific health concerns noted today (if any)
3. positive_highlights: Array of positive moments or good behaviors
4. recommendations: Array of specific, actionable recommendations for caregivers

Return ONLY valid JSON."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Parse JSON response
            import json
            summary_text = response.content[0].text

            if "```json" in summary_text:
                summary_text = summary_text.split("```json")[1].split("```")[0].strip()
            elif "```" in summary_text:
                summary_text = summary_text.split("```")[1].split("```")[0].strip()

            summary_data = json.loads(summary_text)
            return summary_data

        except Exception as e:
            logger.error(f"Error generating daily summary: {str(e)}", exc_info=True)
            return {
                "summary": f"Had {len(conversations)} conversations today with {adherence_rate:.0f}% reminder adherence.",
                "health_concerns": [],
                "positive_highlights": [],
                "recommendations": ["Review conversation logs for any concerns"]
            }


# Global instance
claude_service = ClaudeService()
