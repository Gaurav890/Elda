"""
Initialize Letta AI Agents for Existing Patients

This script creates Letta agents for all patients that don't have one.
Run this after setting up Letta Cloud credentials.

Usage:
    python -m app.scripts.init_letta_agents
"""

import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.patient import Patient
from app.services.letta_service import letta_service


async def create_agent_for_patient(patient: Patient) -> dict:
    """
    Create Letta agent for a single patient

    Args:
        patient: Patient object

    Returns:
        dict with status info
    """
    # Build patient context
    patient_context = {
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "age": patient.age,
        "medical_conditions": patient.medical_conditions or [],
        "medications": patient.medications or [],
        "allergies": patient.allergies or [],
        "dietary_restrictions": patient.dietary_restrictions or [],
        "personal_context": patient.personal_context or {},
        "preferred_name": patient.preferred_name or patient.first_name
    }

    print(f"  Creating agent for {patient.full_name} (ID: {patient.id})...")

    # Create agent
    agent_id = await letta_service.create_agent_for_patient(
        patient_id=str(patient.id),
        patient_context=patient_context
    )

    if agent_id:
        return {
            "patient_id": str(patient.id),
            "patient_name": patient.full_name,
            "agent_id": agent_id,
            "status": "created"
        }
    else:
        return {
            "patient_id": str(patient.id),
            "patient_name": patient.full_name,
            "agent_id": None,
            "status": "failed"
        }


async def init_all_agents():
    """
    Initialize Letta agents for all patients without one
    """
    print("=" * 70)
    print("🤖 LETTA AGENT INITIALIZATION")
    print("=" * 70)
    print("\nThis script will create Letta AI agents for all patients")
    print("that don't have one yet.\n")

    # Get database session
    db = SessionLocal()

    try:
        # Get all patients
        all_patients = db.query(Patient).all()
        print(f"📊 Found {len(all_patients)} total patients in database")

        # Filter patients without agents
        patients_without_agents = [p for p in all_patients if not p.letta_agent_id]
        patients_with_agents = [p for p in all_patients if p.letta_agent_id]

        print(f"✅ {len(patients_with_agents)} patients already have agents")
        print(f"🆕 {len(patients_without_agents)} patients need agents\n")

        if not patients_without_agents:
            print("✨ All patients already have Letta agents!")
            return

        print("=" * 70)
        print("🚀 CREATING AGENTS")
        print("=" * 70)
        print()

        results = []
        for i, patient in enumerate(patients_without_agents, 1):
            print(f"[{i}/{len(patients_without_agents)}] ", end="")
            result = await create_agent_for_patient(patient)
            results.append(result)

            if result["status"] == "created":
                # Update patient record
                patient.letta_agent_id = result["agent_id"]
                print(f"    ✅ Success! Agent ID: {result['agent_id']}")
            else:
                print(f"    ❌ Failed to create agent")

        # Commit all updates
        db.commit()

        # Summary
        print("\n" + "=" * 70)
        print("📊 SUMMARY")
        print("=" * 70)

        agents_created = len([r for r in results if r["status"] == "created"])
        agents_failed = len([r for r in results if r["status"] == "failed"])

        print(f"\n✅ Successfully created: {agents_created}/{len(patients_without_agents)}")
        print(f"❌ Failed:              {agents_failed}/{len(patients_without_agents)}")

        if agents_created > 0:
            print("\n🎉 Letta agents are now initialized!")
            print("   - Agents will automatically be used in voice interactions")
            print("   - Long-term memory will be built over time")
            print("   - Use the sync-conversations endpoint to backfill memory")

        print("\n" + "=" * 70)

    except Exception as e:
        print(f"\n❌ Error during initialization: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


def main():
    """Main entry point"""
    asyncio.run(init_all_agents())


if __name__ == "__main__":
    main()
