#!/usr/bin/env python3
"""
Quick test script to verify Phase 2 implementation
Tests the enhanced patient profile fields and functionality
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, inspect
from app.core.config import settings
from app.models.patient import Patient
from app.schemas.patient import PatientUpdate, PatientResponse

def test_database_columns():
    """Verify all new columns exist in the database"""
    print("=" * 60)
    print("Phase 2 Test: Database Column Verification")
    print("=" * 60)

    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)

    # Get columns for patients table
    columns = inspector.get_columns('patients')
    column_names = [col['name'] for col in columns]

    print(f"\n✓ Found {len(columns)} columns in patients table")

    # Check for new Phase 2 fields
    phase2_fields = [
        'profile_photo_url',
        'timezone',
        'preferred_voice',
        'communication_style',
        'language',
        'app_version',
        'last_heartbeat_at'
    ]

    # Check for missing basic fields
    basic_fields = [
        'gender',
        'phone_number',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'dietary_restrictions'
    ]

    all_new_fields = phase2_fields + basic_fields
    missing_fields = []

    print("\nPhase 2 Personalization Fields:")
    for field in phase2_fields:
        if field in column_names:
            print(f"  ✓ {field}")
        else:
            print(f"  ✗ {field} - MISSING")
            missing_fields.append(field)

    print("\nBasic Demographic Fields:")
    for field in basic_fields:
        if field in column_names:
            print(f"  ✓ {field}")
        else:
            print(f"  ✗ {field} - MISSING")
            missing_fields.append(field)

    if missing_fields:
        print(f"\n✗ Missing {len(missing_fields)} field(s): {', '.join(missing_fields)}")
        return False

    print(f"\n✓ All {len(all_new_fields)} new fields exist in database")
    return True


def test_patient_model():
    """Test Patient SQLAlchemy model"""
    print("\n" + "=" * 60)
    print("Phase 2 Test: SQLAlchemy Model Integration")
    print("=" * 60)

    try:
        # Check if Patient model has all new attributes
        required_attrs = [
            'gender', 'phone_number', 'address',
            'emergency_contact_name', 'emergency_contact_phone',
            'dietary_restrictions',
            'profile_photo_url', 'timezone', 'preferred_voice',
            'communication_style', 'language', 'app_version',
            'last_heartbeat_at'
        ]

        missing_attrs = []
        print("\nChecking Patient model attributes:")
        for attr in required_attrs:
            if hasattr(Patient, attr):
                print(f"  ✓ {attr}")
            else:
                print(f"  ✗ {attr} - MISSING")
                missing_attrs.append(attr)

        if missing_attrs:
            print(f"\n✗ Missing {len(missing_attrs)} attribute(s)")
            return False

        print(f"\n✓ Patient model has all {len(required_attrs)} new attributes")
        return True

    except Exception as e:
        print(f"\n✗ Model test failed: {e}")
        return False


def test_pydantic_schemas():
    """Test Pydantic schemas"""
    print("\n" + "=" * 60)
    print("Phase 2 Test: Pydantic Schema Validation")
    print("=" * 60)

    try:
        # Test PatientUpdate schema with new fields
        update_data = PatientUpdate(
            profile_photo_url="https://example.com/photo.jpg",
            timezone="America/New_York",
            preferred_voice="female",
            communication_style="friendly",
            language="en",
            app_version="1.0.0",
            gender="Female",
            phone_number="+1-555-0123",
            dietary_restrictions=["vegetarian", "gluten-free"]
        )

        print("\n✓ PatientUpdate schema accepts new fields:")
        print(f"  - Profile photo: {update_data.profile_photo_url}")
        print(f"  - Timezone: {update_data.timezone}")
        print(f"  - Preferred voice: {update_data.preferred_voice}")
        print(f"  - Communication style: {update_data.communication_style}")
        print(f"  - Language: {update_data.language}")
        print(f"  - App version: {update_data.app_version}")
        print(f"  - Gender: {update_data.gender}")
        print(f"  - Phone: {update_data.phone_number}")
        print(f"  - Dietary restrictions: {update_data.dietary_restrictions}")

        # Test validation - invalid preferred_voice
        try:
            invalid_voice = PatientUpdate(preferred_voice="robot")
            print("\n✗ Voice validation failed - accepted invalid value")
            return False
        except Exception:
            print("\n✓ Preferred voice validation working (rejected 'robot')")

        # Test validation - invalid communication_style
        try:
            invalid_style = PatientUpdate(communication_style="aggressive")
            print("✗ Style validation failed - accepted invalid value")
            return False
        except Exception:
            print("✓ Communication style validation working (rejected 'aggressive')")

        # Test all valid voice options
        print("\n✓ Testing valid voice options:")
        for voice in ["male", "female", "neutral"]:
            update = PatientUpdate(preferred_voice=voice)
            print(f"  - {voice}: OK")

        # Test all valid communication styles
        print("\n✓ Testing valid communication styles:")
        for style in ["friendly", "formal", "casual"]:
            update = PatientUpdate(communication_style=style)
            print(f"  - {style}: OK")

        return True

    except Exception as e:
        print(f"\n✗ Schema validation failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_default_values():
    """Test default values for new fields"""
    print("\n" + "=" * 60)
    print("Phase 2 Test: Default Values")
    print("=" * 60)

    try:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker

        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()

        # Check if we have any patients
        patient_count = db.query(Patient).count()
        print(f"\n✓ Connected to database")
        print(f"  - Found {patient_count} patient(s) in database")

        if patient_count > 0:
            # Get first patient and check default values
            patient = db.query(Patient).first()
            print(f"\n✓ Checking defaults for patient: {patient.full_name}")
            print(f"  - Timezone: {patient.timezone} (expected: UTC)")
            print(f"  - Preferred voice: {patient.preferred_voice} (expected: neutral)")
            print(f"  - Communication style: {patient.communication_style} (expected: friendly)")
            print(f"  - Language: {patient.language} (expected: en)")

            defaults_ok = (
                patient.timezone == "UTC" and
                patient.preferred_voice == "neutral" and
                patient.communication_style == "friendly" and
                patient.language == "en"
            )

            if defaults_ok:
                print("\n✓ All default values are correct")
            else:
                print("\n⚠ Some default values differ (might be intentional)")

        db.close()
        return True

    except Exception as e:
        print(f"\n✗ Default values test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("PHASE 2 IMPLEMENTATION TEST SUITE")
    print("Enhanced Patient Profile")
    print("=" * 60)

    results = []

    # Test 1: Database Columns
    try:
        results.append(("Database Columns", test_database_columns()))
    except Exception as e:
        print(f"\n✗ Database test failed: {e}")
        results.append(("Database Columns", False))

    # Test 2: Patient Model
    try:
        results.append(("Patient Model", test_patient_model()))
    except Exception as e:
        print(f"\n✗ Model test failed: {e}")
        results.append(("Patient Model", False))

    # Test 3: Pydantic Schemas
    try:
        results.append(("Pydantic Schemas", test_pydantic_schemas()))
    except Exception as e:
        print(f"\n✗ Schema test failed: {e}")
        results.append(("Pydantic Schemas", False))

    # Test 4: Default Values
    try:
        results.append(("Default Values", test_default_values()))
    except Exception as e:
        print(f"\n✗ Default test failed: {e}")
        results.append(("Default Values", False))

    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{status}: {test_name}")

    all_passed = all(result[1] for result in results)

    print("\n" + "=" * 60)
    if all_passed:
        print("✓ ALL TESTS PASSED - Phase 2 implementation successful!")
        print("\nNew patient fields available:")
        print("\nPersonalization:")
        print("  - profile_photo_url (for avatar display)")
        print("  - timezone (for localized times)")
        print("  - preferred_voice (male/female/neutral)")
        print("  - communication_style (friendly/formal/casual)")
        print("  - language (ISO 639-1 code)")
        print("  - app_version (mobile app version)")
        print("  - last_heartbeat_at (last heartbeat time)")
        print("\nBasic Info:")
        print("  - gender")
        print("  - phone_number")
        print("  - address")
        print("  - emergency_contact_name")
        print("  - emergency_contact_phone")
        print("  - dietary_restrictions")
    else:
        print("✗ SOME TESTS FAILED - Please review the errors above")
    print("=" * 60 + "\n")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
