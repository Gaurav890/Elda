#!/usr/bin/env python3
"""
Create a test caregiver user for testing the frontend
Uses the backend's own security module to ensure compatibility
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.security import hash_password
from app.core.config import settings

# Test user credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "password123"
TEST_FIRST_NAME = "Test"
TEST_LAST_NAME = "User"
TEST_PHONE = "+1-555-0100"

print(f"📊 Connecting to database...")
print(f"   URL: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else '...'}")

print(f"\n👤 Creating test user:")
print(f"   Email: {TEST_EMAIL}")
print(f"   Password: {TEST_PASSWORD}")
print(f"   Name: {TEST_FIRST_NAME} {TEST_LAST_NAME}")

try:
    # Hash password using backend's security module
    password_hash = hash_password(TEST_PASSWORD)

    # Connect to database
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # Check if user already exists
        result = conn.execute(
            text("SELECT email FROM caregivers WHERE email = :email"),
            {"email": TEST_EMAIL}
        )

        if result.fetchone():
            print(f"\n⚠️  User with email {TEST_EMAIL} already exists!")
            print(f"   You can login with:")
            print(f"   Email: {TEST_EMAIL}")
            print(f"   Password: {TEST_PASSWORD}")
            sys.exit(0)

        # Create user
        conn.execute(
            text("""
                INSERT INTO caregivers (
                    id, email, hashed_password, first_name, last_name, phone_number,
                    role, sms_notifications_enabled, email_notifications_enabled,
                    push_notifications_enabled, is_active, is_verified,
                    created_at, updated_at
                )
                VALUES (
                    gen_random_uuid(), :email, :hashed_password, :first_name, :last_name, :phone_number,
                    'primary_caregiver', true, true, true, true, true,
                    NOW(), NOW()
                )
            """),
            {
                "email": TEST_EMAIL,
                "hashed_password": password_hash,
                "first_name": TEST_FIRST_NAME,
                "last_name": TEST_LAST_NAME,
                "phone_number": TEST_PHONE
            }
        )
        conn.commit()

        print(f"\n✅ Test user created successfully!")
        print(f"\n🚀 You can now login at: http://localhost:3000/login")
        print(f"\n   Credentials:")
        print(f"   Email:    {TEST_EMAIL}")
        print(f"   Password: {TEST_PASSWORD}")
        print(f"\n💡 After login, try:")
        print(f"   1. Add a patient using 'Add Loved One' button")
        print(f"   2. View patient list")
        print(f"   3. Search patients by name")
        print(f"   4. Click 'View' to see patient details")

except Exception as e:
    print(f"\n❌ Error creating user: {e}")
    import traceback
    traceback.print_exc()
    print(f"\nIf you see a bcrypt error, try upgrading bcrypt:")
    print(f"   cd /Users/gaurav/Elda/backend")
    print(f"   source venv/bin/activate")
    print(f"   pip install --upgrade bcrypt")
    sys.exit(1)
