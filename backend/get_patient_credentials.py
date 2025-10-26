#!/usr/bin/env python3
"""
Quick script to get patient credentials for manual setup
Use this when QR code scanning doesn't work in simulator
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database.session import SessionLocal
from app.models.patient import Patient

def main():
    print("=" * 70)
    print("📱 PATIENT CREDENTIALS FOR MANUAL SETUP")
    print("=" * 70)

    db = SessionLocal()

    try:
        # Get all patients with setup tokens
        patients = db.query(Patient).filter(
            Patient.setup_token.isnot(None),
            Patient.device_setup_completed == False
        ).all()

        if not patients:
            print("\n❌ No patients with valid setup tokens found!")
            print("\nTry running: python -m app.seeds.mobile_test_seed")
            return

        print(f"\nFound {len(patients)} patient(s) ready for setup:\n")

        for i, patient in enumerate(patients, 1):
            letta_status = '✅ Active' if patient.letta_agent_id else '❌ Not Set'

            print(f"{'=' * 70}")
            print(f"PATIENT {i}: {patient.full_name} ({patient.preferred_name})")
            print(f"{'=' * 70}")
            print(f"\n📋 CREDENTIALS:")
            print(f"   Patient ID:")
            print(f"   {patient.id}")
            print(f"\n   Setup Token:")
            print(f"   {patient.setup_token}")
            print(f"\n📊 STATUS:")
            print(f"   Letta Agent: {letta_status}")
            print(f"   Age: {patient.age or 'N/A'}")
            print(f"   Medical Conditions: {len(patient.medical_conditions) if patient.medical_conditions else 0}")
            print(f"   Medications: {len(patient.medications) if patient.medications else 0}")

            if patient.medical_conditions:
                print(f"\n💊 Medical Conditions:")
                for condition in patient.medical_conditions[:3]:
                    print(f"   • {condition}")

            if patient.medications:
                print(f"\n💉 Medications:")
                for med in patient.medications[:3]:
                    print(f"   • {med}")

            print(f"\n📱 FOR MOBILE APP SETUP:")
            print(f"   1. Open Elder Companion app")
            print(f"   2. On setup screen, enter:")
            print(f"      Patient ID: {patient.id}")
            print(f"      Token: {patient.setup_token}")
            print(f"   3. Tap 'Complete Setup'")
            print()

        print("=" * 70)
        print("💡 RECOMMENDED FOR DEMO:")
        print("=" * 70)

        # Find best patient for demo
        best_patient = None
        for p in patients:
            if p.letta_agent_id:
                best_patient = p
                break

        if best_patient:
            print(f"\n✅ Use: {best_patient.full_name}")
            print(f"   Reason: Has Letta agent + complete data")
            print(f"\n   Patient ID: {best_patient.id}")
            print(f"   Token: {best_patient.setup_token}")
        else:
            print(f"\n⚠️  Warning: No patients have Letta agents set up!")
            print(f"   You may need to create Letta agents for better demo experience.")

        print("\n" + "=" * 70)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
