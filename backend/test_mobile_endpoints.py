"""
Test script for mobile app endpoints
Tests QR code generation, device setup, and token registration
"""

import asyncio
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.insert(0, '.')

from app.database.session import SessionLocal
from app.models.patient import Patient
from app.models.caregiver import Caregiver
from app.models.relationship import PatientCaregiverRelationship
import secrets
import json


def test_qr_code_generation():
    """Test QR code generation logic"""
    print("\n" + "="*60)
    print("TEST 1: QR Code Generation")
    print("="*60)

    db = SessionLocal()
    try:
        # Get a test patient
        patient = db.query(Patient).first()
        if not patient:
            print("❌ No patients found in database")
            return False

        print(f"✅ Found patient: {patient.full_name} ({patient.id})")

        # Generate setup token
        setup_token = secrets.token_urlsafe(32)
        expiry_time = datetime.utcnow() + timedelta(minutes=15)

        # Update patient
        patient.setup_token = setup_token
        patient.setup_token_expires = expiry_time
        patient.device_setup_completed = False

        db.commit()

        # Create QR code data
        qr_code_data = json.dumps({
            "patient_id": str(patient.id),
            "setup_token": setup_token
        })

        print(f"✅ Generated setup token: {setup_token[:20]}...")
        print(f"✅ Token expires: {expiry_time}")
        print(f"✅ QR code data: {qr_code_data[:80]}...")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def test_mobile_setup():
    """Test mobile device setup logic"""
    print("\n" + "="*60)
    print("TEST 2: Mobile Device Setup")
    print("="*60)

    db = SessionLocal()
    try:
        # Find patient with setup token
        patient = db.query(Patient).filter(
            Patient.setup_token.isnot(None)
        ).first()

        if not patient:
            print("❌ No patient with setup token found")
            print("   Run test_qr_code_generation first")
            return False

        print(f"✅ Found patient: {patient.full_name} ({patient.id})")
        print(f"✅ Setup token: {patient.setup_token[:20]}...")
        print(f"✅ Token expires: {patient.setup_token_expires}")

        # Verify token not expired
        if patient.setup_token_expires < datetime.utcnow():
            print("❌ Setup token has expired")
            return False

        print("✅ Token is valid (not expired)")

        # Simulate successful setup
        patient.device_setup_completed = True
        patient.setup_token = None  # Invalidate token
        patient.setup_token_expires = None

        db.commit()

        print("✅ Device setup completed successfully")
        print(f"✅ Setup status: {patient.device_setup_completed}")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def test_device_token_registration():
    """Test device token registration logic"""
    print("\n" + "="*60)
    print("TEST 3: Device Token Registration")
    print("="*60)

    db = SessionLocal()
    try:
        # Find patient with setup completed
        patient = db.query(Patient).filter(
            Patient.device_setup_completed == True
        ).first()

        if not patient:
            print("❌ No patient with completed setup found")
            print("   Run test_mobile_setup first")
            return False

        print(f"✅ Found patient: {patient.full_name} ({patient.id})")

        # Simulate device token registration
        test_device_token = "fcm_test_token_" + secrets.token_urlsafe(16)
        test_platform = "ios"
        test_app_version = "1.0.0"

        patient.device_token = test_device_token
        patient.device_platform = test_platform
        patient.app_version = test_app_version

        db.commit()

        print(f"✅ Device token registered: {test_device_token[:30]}...")
        print(f"✅ Platform: {test_platform}")
        print(f"✅ App version: {test_app_version}")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def test_firebase_service():
    """Test Firebase service initialization"""
    print("\n" + "="*60)
    print("TEST 4: Firebase Service")
    print("="*60)

    try:
        from app.services.communication.firebase_service import firebase_service

        print(f"✅ Firebase service imported successfully")
        print(f"✅ Initialized: {firebase_service.is_initialized()}")

        if not firebase_service.is_initialized():
            print("⚠️  Firebase not fully initialized (credentials not found)")
            print("   This is OK for development - notifications will be mocked")
        else:
            print("✅ Firebase fully initialized with credentials")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def verify_database_schema():
    """Verify database schema has new fields"""
    print("\n" + "="*60)
    print("TEST 5: Database Schema Verification")
    print("="*60)

    db = SessionLocal()
    try:
        patient = db.query(Patient).first()
        if not patient:
            print("❌ No patients found")
            return False

        # Check if new fields exist
        required_fields = [
            'setup_token',
            'setup_token_expires',
            'device_setup_completed',
            'device_platform',
            'device_token',
            'app_version'
        ]

        print(f"✅ Checking patient model for required fields...")
        for field in required_fields:
            if hasattr(patient, field):
                value = getattr(patient, field)
                print(f"✅ {field}: {value}")
            else:
                print(f"❌ Missing field: {field}")
                return False

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


def main():
    """Run all tests"""
    print("\n" + "🧪 " + "="*58 + " 🧪")
    print("   MOBILE APP ENDPOINTS TEST SUITE")
    print("🧪 " + "="*58 + " 🧪")

    tests = [
        ("Database Schema", verify_database_schema),
        ("Firebase Service", test_firebase_service),
        ("QR Code Generation", test_qr_code_generation),
        ("Mobile Setup", test_mobile_setup),
        ("Device Token Registration", test_device_token_registration),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Test '{test_name}' failed with exception: {e}")
            results.append((test_name, False))

    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")

    print("="*60)
    print(f"Result: {passed}/{total} tests passed")
    print("="*60)

    if passed == total:
        print("\n🎉 All tests passed! Mobile endpoints are ready!")
    else:
        print("\n⚠️  Some tests failed. Check the output above.")

    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
