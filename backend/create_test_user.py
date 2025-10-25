#!/usr/bin/env python3
"""
Create a test caregiver user for testing the frontend
"""

import sys
from passlib.context import CryptContext
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env file")
    sys.exit(1)

print(f"📊 Connecting to database...")
print(f"   URL: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL}")

# Create password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Test user credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "password123"
TEST_FIRST_NAME = "Test"
TEST_LAST_NAME = "User"
TEST_PHONE = "+1-555-0100"

print(f"\n👤 Creating test user:")
print(f"   Email: {TEST_EMAIL}")
print(f"   Password: {TEST_PASSWORD}")
print(f"   Name: {TEST_FIRST_NAME} {TEST_LAST_NAME}")

# Hash password
password_hash = pwd_context.hash(TEST_PASSWORD)

try:
    # Connect to database
    engine = create_engine(DATABASE_URL)

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
                INSERT INTO caregivers (email, password_hash, first_name, last_name, phone_number, created_at, updated_at)
                VALUES (:email, :password_hash, :first_name, :last_name, :phone_number, NOW(), NOW())
            """),
            {
                "email": TEST_EMAIL,
                "password_hash": password_hash,
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
    print(f"\nPossible issues:")
    print(f"1. Database connection failed")
    print(f"2. Missing dependencies (passlib, bcrypt)")
    print(f"3. Database permissions issue")
    print(f"\nTry installing dependencies:")
    print(f"   pip install passlib bcrypt python-dotenv sqlalchemy")
    sys.exit(1)
