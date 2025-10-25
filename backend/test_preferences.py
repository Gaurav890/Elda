#!/usr/bin/env python3
"""
Quick test script to verify Phase 3 implementation
Tests the preferences column and functionality
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, inspect
from app.core.config import settings
from app.models.caregiver import Caregiver
from app.schemas.auth import CaregiverPreferences, NotificationPreferences, QuietHours

def test_database_column():
    """Verify the preferences column exists in the database"""
    print("=" * 60)
    print("Phase 3 Test: Database Column Verification")
    print("=" * 60)

    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)

    # Get columns for caregivers table
    columns = inspector.get_columns('caregivers')
    column_names = [col['name'] for col in columns]

    print(f"\n✓ Found {len(columns)} columns in caregivers table")

    if 'preferences' in column_names:
        print("✓ preferences column exists in caregivers table")

        # Get column details
        prefs_col = next(col for col in columns if col['name'] == 'preferences')
        print(f"  - Type: {prefs_col['type']}")
        print(f"  - Nullable: {prefs_col['nullable']}")
        print(f"  - Default: {prefs_col.get('default', 'None')}")
        return True
    else:
        print("✗ preferences column NOT found in caregivers table")
        print(f"  Available columns: {', '.join(column_names)}")
        return False


def test_pydantic_schemas():
    """Verify Pydantic schemas work correctly"""
    print("\n" + "=" * 60)
    print("Phase 3 Test: Pydantic Schema Validation")
    print("=" * 60)

    try:
        # Test default initialization
        prefs = CaregiverPreferences()
        print("\n✓ Default preferences initialized:")
        print(f"  - Notifications: email={prefs.notifications.email}, sms={prefs.notifications.sms}, push={prefs.notifications.push}")
        print(f"  - Alert threshold: {prefs.alert_threshold}")
        print(f"  - Quiet hours: enabled={prefs.quiet_hours.enabled}, {prefs.quiet_hours.start}-{prefs.quiet_hours.end}")
        print(f"  - Daily summary time: {prefs.daily_summary_time}")

        # Test custom initialization
        custom_prefs = CaregiverPreferences(
            notifications=NotificationPreferences(email=True, sms=False, push=True),
            alert_threshold="high",
            quiet_hours=QuietHours(enabled=True, start="23:00", end="06:00"),
            daily_summary_time="19:30"
        )
        print("\n✓ Custom preferences initialized:")
        print(f"  - Notifications: email={custom_prefs.notifications.email}, sms={custom_prefs.notifications.sms}, push={custom_prefs.notifications.push}")
        print(f"  - Alert threshold: {custom_prefs.alert_threshold}")
        print(f"  - Quiet hours: enabled={custom_prefs.quiet_hours.enabled}, {custom_prefs.quiet_hours.start}-{custom_prefs.quiet_hours.end}")
        print(f"  - Daily summary time: {custom_prefs.daily_summary_time}")

        # Test serialization
        prefs_dict = custom_prefs.model_dump()
        print("\n✓ Serialization to dict works:")
        print(f"  {prefs_dict}")

        # Test deserialization
        recreated_prefs = CaregiverPreferences(**prefs_dict)
        print("\n✓ Deserialization from dict works")

        return True
    except Exception as e:
        print(f"\n✗ Schema validation failed: {e}")
        return False


def test_model_integration():
    """Test SQLAlchemy model integration"""
    print("\n" + "=" * 60)
    print("Phase 3 Test: SQLAlchemy Model Integration")
    print("=" * 60)

    try:
        # Check if Caregiver model has preferences attribute
        if hasattr(Caregiver, 'preferences'):
            print("\n✓ Caregiver model has 'preferences' attribute")

            # Get column info
            prefs_col = Caregiver.__table__.columns['preferences']
            print(f"  - Column type: {prefs_col.type}")
            print(f"  - Nullable: {prefs_col.nullable}")
            print(f"  - Default: {prefs_col.default}")

            return True
        else:
            print("\n✗ Caregiver model does NOT have 'preferences' attribute")
            return False
    except Exception as e:
        print(f"\n✗ Model integration test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("PHASE 3 IMPLEMENTATION TEST SUITE")
    print("Advanced Caregiver Preferences")
    print("=" * 60)

    results = []

    # Test 1: Database Column
    try:
        results.append(("Database Column", test_database_column()))
    except Exception as e:
        print(f"\n✗ Database test failed: {e}")
        results.append(("Database Column", False))

    # Test 2: Pydantic Schemas
    try:
        results.append(("Pydantic Schemas", test_pydantic_schemas()))
    except Exception as e:
        print(f"\n✗ Pydantic test failed: {e}")
        results.append(("Pydantic Schemas", False))

    # Test 3: Model Integration
    try:
        results.append(("Model Integration", test_model_integration()))
    except Exception as e:
        print(f"\n✗ Model test failed: {e}")
        results.append(("Model Integration", False))

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
        print("✓ ALL TESTS PASSED - Phase 3 implementation successful!")
        print("\nNew endpoints available:")
        print("  - GET  /api/v1/auth/me/preferences")
        print("  - PATCH /api/v1/auth/me/preferences")
    else:
        print("✗ SOME TESTS FAILED - Please review the errors above")
    print("=" * 60 + "\n")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
