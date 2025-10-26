#!/usr/bin/env python3
"""
Check which patients have device tokens registered
"""

from app.database.session import SessionLocal
from app.models.patient import Patient

def check_device_tokens():
    db = SessionLocal()

    try:
        print("\n" + "="*60)
        print("Device Token Registration Status")
        print("="*60 + "\n")

        patients = db.query(Patient).all()

        if not patients:
            print("❌ No patients found in database")
            return

        registered_count = 0

        for patient in patients:
            has_token = patient.device_token is not None and patient.device_token != ""
            status = "✅ REGISTERED" if has_token else "❌ No token"

            print(f"Patient: {patient.first_name} {patient.last_name}")
            print(f"  ID: {patient.id}")
            print(f"  Status: {status}")

            if has_token:
                # Show first 20 chars of token
                token_preview = patient.device_token[:20] + "..."
                print(f"  Token: {token_preview}")
                registered_count += 1

            print()

        print("="*60)
        print(f"Summary: {registered_count}/{len(patients)} patients have device tokens")
        print("="*60)

    finally:
        db.close()

if __name__ == "__main__":
    check_device_tokens()
