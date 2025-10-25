"""
Create test conversations for testing the frontend
"""

import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.append('/Users/gaurav/Elda/backend')

from app.database.session import SessionLocal
from app.models.conversation import Conversation
from app.models.patient import Patient

def create_test_conversations():
    """Create sample conversations for testing"""
    db: Session = SessionLocal()

    try:
        # Get first patient
        patient = db.query(Patient).first()

        if not patient:
            print("❌ No patients found. Please create a patient first.")
            return

        print(f"✅ Found patient: {patient.full_name or patient.display_name} (ID: {patient.id})")

        # Test conversations with various scenarios
        conversations = [
            # Conversation 1 - Recent, positive
            {
                "patient_id": patient.id,
                "patient_message": "Good morning! I just took my blood pressure medication.",
                "ai_response": "That's wonderful! I'm glad to hear you took your medication on time. How are you feeling today?",
                "conversation_type": "spontaneous",
                "sentiment": "positive",
                "health_mentions": ["medication"],
                "urgency_level": "none",
                "created_at": datetime.utcnow() - timedelta(minutes=15),
            },
            # Conversation 2 - With health concern
            {
                "patient_id": patient.id,
                "patient_message": "My knee is hurting a bit today. It's been bothering me since this morning.",
                "ai_response": "I'm sorry to hear about your knee pain. On a scale of 1-10, how would you rate the pain? Have you tried applying ice or taking any pain medication?",
                "conversation_type": "spontaneous",
                "sentiment": "negative",
                "health_mentions": ["knee", "pain"],
                "urgency_level": "low",
                "created_at": datetime.utcnow() - timedelta(hours=2),
            },
            # Conversation 3 - Meal related
            {
                "patient_id": patient.id,
                "patient_message": "I finished my breakfast. Had oatmeal with berries.",
                "ai_response": "Excellent choice! Oatmeal with berries is a healthy breakfast. Don't forget to drink plenty of water throughout the day.",
                "conversation_type": "check_in",
                "sentiment": "positive",
                "health_mentions": ["meal"],
                "urgency_level": "none",
                "created_at": datetime.utcnow() - timedelta(hours=4),
            },
            # Conversation 4 - Exercise
            {
                "patient_id": patient.id,
                "patient_message": "Just came back from my morning walk. Did about 20 minutes.",
                "ai_response": "That's fantastic! Regular walking is great for your health. How did you feel during the walk? Any shortness of breath or discomfort?",
                "conversation_type": "spontaneous",
                "sentiment": "positive",
                "health_mentions": ["exercise", "walk"],
                "urgency_level": "none",
                "created_at": datetime.utcnow() - timedelta(hours=5),
            },
            # Conversation 5 - Feeling tired
            {
                "patient_id": patient.id,
                "patient_message": "I'm feeling a bit tired today. Didn't sleep very well last night.",
                "ai_response": "I understand. Poor sleep can definitely make you feel tired. Is this the first time this week you've had trouble sleeping, or has it been happening more frequently?",
                "conversation_type": "spontaneous",
                "sentiment": "negative",
                "health_mentions": ["tired", "sleep"],
                "urgency_level": "low",
                "created_at": datetime.utcnow() - timedelta(days=1),
            },
            # Conversation 6 - Neutral check-in
            {
                "patient_id": patient.id,
                "patient_message": "Everything is fine today. Just relaxing and reading.",
                "ai_response": "That sounds lovely! It's important to have some quiet time. What are you reading? Anything interesting?",
                "conversation_type": "check_in",
                "sentiment": "neutral",
                "health_mentions": [],
                "urgency_level": "none",
                "created_at": datetime.utcnow() - timedelta(days=2),
            },
            # Conversation 7 - Dizzy spell (higher urgency)
            {
                "patient_id": patient.id,
                "patient_message": "I felt a little dizzy when I stood up earlier.",
                "ai_response": "That's concerning. Are you still feeling dizzy now? Please sit down and rest. Have you had anything to eat or drink today? I'm going to alert your caregiver about this.",
                "conversation_type": "spontaneous",
                "sentiment": "negative",
                "health_mentions": ["dizzy"],
                "urgency_level": "medium",
                "created_at": datetime.utcnow() - timedelta(days=3),
            },
            # Conversation 8 - Reminder response
            {
                "patient_id": patient.id,
                "patient_message": "Yes, I just took my evening medications now.",
                "ai_response": "Perfect! Thank you for taking your medications on time. Your caregiver will be happy to see your excellent adherence.",
                "conversation_type": "reminder_response",
                "sentiment": "positive",
                "health_mentions": ["medication"],
                "urgency_level": "none",
                "created_at": datetime.utcnow() - timedelta(days=4),
            },
        ]

        # Add conversations to database
        added_count = 0
        for conv_data in conversations:
            conversation = Conversation(**conv_data)
            db.add(conversation)
            added_count += 1

        db.commit()
        print(f"\n✅ Successfully created {added_count} test conversations for patient {patient.full_name or patient.display_name}")
        print("\n📝 Conversation summary:")
        print(f"  - Total conversations: {added_count}")
        print(f"  - Positive sentiment: {sum(1 for c in conversations if c['sentiment'] == 'positive')}")
        print(f"  - Negative sentiment: {sum(1 for c in conversations if c['sentiment'] == 'negative')}")
        print(f"  - Neutral sentiment: {sum(1 for c in conversations if c['sentiment'] == 'neutral')}")
        print(f"  - With health mentions: {sum(1 for c in conversations if c['health_mentions'])}")
        print(f"\n🌐 Now you can test the Conversations tab at:")
        print(f"   http://localhost:3000/patients/{patient.id}?tab=conversations")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_conversations()
