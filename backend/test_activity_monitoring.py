#!/usr/bin/env python3
"""
Quick test script to verify Phase 1 implementation
Tests the activity monitoring endpoints and functionality
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.activity_log import ActivityLog
from app.models.patient import Patient
from app.schemas.patient import HeartbeatCreate, ActivityLogResponse

def test_activity_log_model():
    """Test ActivityLog model structure"""
    print("=" * 60)
    print("Phase 1 Test: ActivityLog Model Verification")
    print("=" * 60)

    try:
        # Check if ActivityLog has all required attributes
        required_attributes = [
            'id', 'patient_id', 'activity_type', 'details',
            'device_type', 'app_version', 'latitude', 'longitude',
            'battery_level', 'logged_at'
        ]

        for attr in required_attributes:
            if not hasattr(ActivityLog, attr):
                print(f"✗ ActivityLog missing attribute: {attr}")
                return False

        print(f"\n✓ ActivityLog model has all {len(required_attributes)} required attributes")

        # Check table name
        if ActivityLog.__tablename__ == "activity_logs":
            print("✓ Table name is correct: activity_logs")
        else:
            print(f"✗ Table name incorrect: {ActivityLog.__tablename__}")
            return False

        return True
    except Exception as e:
        print(f"\n✗ Model test failed: {e}")
        return False


def test_pydantic_schemas():
    """Test Pydantic schemas for activity monitoring"""
    print("\n" + "=" * 60)
    print("Phase 1 Test: Pydantic Schema Validation")
    print("=" * 60)

    try:
        # Test HeartbeatCreate schema with minimal data
        minimal_heartbeat = HeartbeatCreate()
        print("\n✓ Minimal heartbeat schema initialized:")
        print(f"  - Activity type: {minimal_heartbeat.activity_type}")
        print(f"  - Details: {minimal_heartbeat.details}")

        # Test HeartbeatCreate with full data
        full_heartbeat = HeartbeatCreate(
            activity_type="heartbeat",
            details={"screen": "home", "last_interaction": "2025-10-24T10:30:00Z"},
            device_type="iOS",
            app_version="1.0.0",
            latitude=37.7749,
            longitude=-122.4194,
            battery_level=85
        )
        print("\n✓ Full heartbeat schema initialized:")
        print(f"  - Activity type: {full_heartbeat.activity_type}")
        print(f"  - Device: {full_heartbeat.device_type} v{full_heartbeat.app_version}")
        print(f"  - Location: ({full_heartbeat.latitude}, {full_heartbeat.longitude})")
        print(f"  - Battery: {full_heartbeat.battery_level}%")

        # Test different activity types
        activity_types = ["conversation", "emergency", "app_open", "location_update"]
        print("\n✓ Testing different activity types:")
        for act_type in activity_types:
            hb = HeartbeatCreate(activity_type=act_type)
            print(f"  - {act_type}: OK")

        # Test validation - invalid battery level
        try:
            invalid_battery = HeartbeatCreate(battery_level=150)
            print("\n✗ Battery validation failed - accepted invalid value")
            return False
        except Exception:
            print("\n✓ Battery level validation working (rejected 150%)")

        # Test validation - invalid latitude
        try:
            invalid_lat = HeartbeatCreate(latitude=100)
            print("✗ Latitude validation failed - accepted invalid value")
            return False
        except Exception:
            print("✓ Latitude validation working (rejected 100)")

        # Test validation - invalid longitude
        try:
            invalid_lon = HeartbeatCreate(longitude=200)
            print("✗ Longitude validation failed - accepted invalid value")
            return False
        except Exception:
            print("✓ Longitude validation working (rejected 200)")

        return True
    except Exception as e:
        print(f"\n✗ Schema validation failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_database_integration():
    """Test database integration with real database"""
    print("\n" + "=" * 60)
    print("Phase 1 Test: Database Integration")
    print("=" * 60)

    try:
        # Create database engine and session
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()

        # Check if we have any patients to test with
        patient_count = db.query(Patient).count()
        print(f"\n✓ Connected to database")
        print(f"  - Found {patient_count} patient(s) in database")

        if patient_count == 0:
            print("  ⚠ No patients found - skipping activity log creation test")
            db.close()
            return True

        # Get first patient
        patient = db.query(Patient).first()
        print(f"  - Using patient: {patient.full_name} ({patient.id})")

        # Create a test activity log
        test_activity = ActivityLog(
            patient_id=patient.id,
            activity_type="heartbeat",
            details={"test": True, "timestamp": "2025-10-24T10:00:00Z"},
            device_type="iOS",
            app_version="1.0.0",
            latitude=37.7749,
            longitude=-122.4194,
            battery_level=85
        )

        db.add(test_activity)
        db.commit()
        db.refresh(test_activity)

        print(f"\n✓ Created test activity log:")
        print(f"  - ID: {test_activity.id}")
        print(f"  - Type: {test_activity.activity_type}")
        print(f"  - Logged at: {test_activity.logged_at}")

        # Query activity logs for this patient
        activity_count = db.query(ActivityLog).filter(
            ActivityLog.patient_id == patient.id
        ).count()
        print(f"\n✓ Patient now has {activity_count} activity log(s)")

        # Clean up test data
        db.delete(test_activity)
        db.commit()
        print("✓ Cleaned up test activity log")

        db.close()
        return True

    except Exception as e:
        print(f"\n✗ Database integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_endpoint_structure():
    """Test that endpoints are properly structured"""
    print("\n" + "=" * 60)
    print("Phase 1 Test: Endpoint Structure")
    print("=" * 60)

    try:
        # Import the router
        from app.api.v1.patients import router

        # Get all routes
        routes = [route for route in router.routes]
        print(f"\n✓ Found {len(routes)} routes in patients router")

        # Check for heartbeat endpoint
        heartbeat_route = None
        activity_route = None

        for route in routes:
            if hasattr(route, 'path') and hasattr(route, 'methods'):
                if '/heartbeat' in route.path and 'POST' in route.methods:
                    heartbeat_route = route
                    print(f"✓ Found POST heartbeat endpoint: {route.path}")
                if '/activity' in route.path and 'GET' in route.methods:
                    activity_route = route
                    print(f"✓ Found GET activity endpoint: {route.path}")

        if not heartbeat_route:
            print("✗ POST /heartbeat endpoint not found")
            return False

        if not activity_route:
            print("✗ GET /activity endpoint not found")
            return False

        print("\n✓ Both activity monitoring endpoints are registered")
        return True

    except Exception as e:
        print(f"\n✗ Endpoint structure test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("PHASE 1 IMPLEMENTATION TEST SUITE")
    print("Activity Monitoring Endpoints")
    print("=" * 60)

    results = []

    # Test 1: ActivityLog Model
    try:
        results.append(("ActivityLog Model", test_activity_log_model()))
    except Exception as e:
        print(f"\n✗ Model test failed: {e}")
        results.append(("ActivityLog Model", False))

    # Test 2: Pydantic Schemas
    try:
        results.append(("Pydantic Schemas", test_pydantic_schemas()))
    except Exception as e:
        print(f"\n✗ Schema test failed: {e}")
        results.append(("Pydantic Schemas", False))

    # Test 3: Endpoint Structure
    try:
        results.append(("Endpoint Structure", test_endpoint_structure()))
    except Exception as e:
        print(f"\n✗ Endpoint test failed: {e}")
        results.append(("Endpoint Structure", False))

    # Test 4: Database Integration
    try:
        results.append(("Database Integration", test_database_integration()))
    except Exception as e:
        print(f"\n✗ Database test failed: {e}")
        results.append(("Database Integration", False))

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
        print("✓ ALL TESTS PASSED - Phase 1 implementation successful!")
        print("\nNew endpoints available:")
        print("  - POST /api/v1/patients/{id}/heartbeat")
        print("  - GET  /api/v1/patients/{id}/activity")
        print("\nFeatures:")
        print("  - Track patient heartbeat and app activity")
        print("  - Record location, battery level, device info")
        print("  - Query activity history with pagination")
        print("  - Filter by activity type")
        print("  - Automatic patient last_active_at update")
    else:
        print("✗ SOME TESTS FAILED - Please review the errors above")
    print("=" * 60 + "\n")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
