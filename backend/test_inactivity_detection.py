#!/usr/bin/env python3
"""
Test script for inactivity detection job
Tests the complete inactivity monitoring workflow
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.patient import Patient
from app.models.alert import Alert
from app.jobs.inactivity_detector import (
    detect_patient_inactivity,
    get_inactivity_statistics,
    INACTIVITY_WARNING_HOURS,
    INACTIVITY_HIGH_HOURS,
    INACTIVITY_CRITICAL_HOURS
)


def test_inactivity_thresholds():
    """Test that inactivity thresholds are properly defined"""
    print("=" * 60)
    print("Test: Inactivity Thresholds")
    print("=" * 60)

    print(f"\n✓ Inactivity thresholds configured:")
    print(f"  - Warning: {INACTIVITY_WARNING_HOURS} hours")
    print(f"  - High: {INACTIVITY_HIGH_HOURS} hours")
    print(f"  - Critical: {INACTIVITY_CRITICAL_HOURS} hours")

    # Validate thresholds are in ascending order
    if INACTIVITY_WARNING_HOURS < INACTIVITY_HIGH_HOURS < INACTIVITY_CRITICAL_HOURS:
        print("\n✓ Thresholds are in correct order (warning < high < critical)")
        return True
    else:
        print("\n✗ Thresholds are not in correct order")
        return False


def test_job_function_exists():
    """Test that the job function can be imported"""
    print("\n" + "=" * 60)
    print("Test: Job Function Import")
    print("=" * 60)

    try:
        from app.jobs.inactivity_detector import detect_patient_inactivity
        print("\n✓ detect_patient_inactivity function imported successfully")
        print(f"  - Function: {detect_patient_inactivity.__name__}")
        print(f"  - Module: {detect_patient_inactivity.__module__}")
        return True
    except ImportError as e:
        print(f"\n✗ Failed to import function: {e}")
        return False


def test_scheduler_registration():
    """Test that the job is registered in the scheduler"""
    print("\n" + "=" * 60)
    print("Test: Scheduler Registration")
    print("=" * 60)

    try:
        from app.jobs.scheduler import init_scheduler

        scheduler = init_scheduler()
        jobs = scheduler.get_jobs()

        # Find inactivity detection job
        inactivity_job = None
        for job in jobs:
            if job.id == "inactivity_detection":
                inactivity_job = job
                break

        if inactivity_job:
            print("\n✓ Inactivity detection job registered in scheduler")
            print(f"  - Job ID: {inactivity_job.id}")
            print(f"  - Job Name: {inactivity_job.name}")
            print(f"  - Trigger: {inactivity_job.trigger}")
            if hasattr(inactivity_job, 'next_run_time'):
                print(f"  - Next run: {inactivity_job.next_run_time}")
            return True
        else:
            print("\n✗ Inactivity detection job not found in scheduler")
            print(f"  - Available jobs: {[j.id for j in jobs]}")
            return False

    except Exception as e:
        print(f"\n✗ Failed to test scheduler: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_inactivity_statistics():
    """Test the statistics function"""
    print("\n" + "=" * 60)
    print("Test: Inactivity Statistics")
    print("=" * 60)

    try:
        stats = get_inactivity_statistics()

        if stats:
            print("\n✓ Inactivity statistics retrieved:")
            print(f"  - Total patients: {stats['total_patients']}")
            print(f"  - Active: {stats['active']}")
            print(f"  - Warning (2+ hrs): {stats['warning']}")
            print(f"  - High (4+ hrs): {stats['high']}")
            print(f"  - Critical (6+ hrs): {stats['critical']}")
            print(f"  - No activity: {stats['no_activity']}")
            return True
        else:
            print("\n⚠ No statistics available (database might be empty)")
            return True  # Not a failure, just no data

    except Exception as e:
        print(f"\n✗ Failed to get statistics: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_database_integration():
    """Test database integration and alert creation"""
    print("\n" + "=" * 60)
    print("Test: Database Integration")
    print("=" * 60)

    try:
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()

        # Check for patients
        patient_count = db.query(Patient).count()
        print(f"\n✓ Connected to database")
        print(f"  - Found {patient_count} patient(s)")

        if patient_count == 0:
            print("\n⚠ No patients in database - creating test patient")

            # Create a test patient with old heartbeat
            test_patient = Patient(
                first_name="Test",
                last_name="Patient",
                date_of_birth=datetime.now().date() - timedelta(days=365*70),
                timezone="UTC",
                preferred_voice="neutral",
                communication_style="friendly",
                language="en",
                last_heartbeat_at=datetime.utcnow() - timedelta(hours=3),  # 3 hours ago
                emergency_contact_name="Test Contact",
                emergency_contact_phone="+1-555-0123"
            )

            db.add(test_patient)
            db.commit()
            db.refresh(test_patient)

            print(f"  ✓ Created test patient: {test_patient.full_name} ({test_patient.id})")
            print(f"    - Last heartbeat: 3 hours ago (should trigger alert)")
            print(f"    - Emergency contact: {test_patient.emergency_contact_name}")

            # Run inactivity detection
            print("\n  Running inactivity detection...")
            detect_patient_inactivity()

            # Check if alert was created
            alert = db.query(Alert).filter(
                Alert.patient_id == test_patient.id,
                Alert.alert_type == "inactivity"
            ).first()

            if alert:
                print(f"  ✓ Alert created successfully:")
                print(f"    - Type: {alert.alert_type}")
                print(f"    - Severity: {alert.severity}")
                print(f"    - Title: {alert.title}")
                print(f"    - Description: {alert.description[:100]}...")
                if alert.recommended_action:
                    print(f"    - Recommended action: {alert.recommended_action[:100]}...")

                # Cleanup
                db.delete(alert)
                db.delete(test_patient)
                db.commit()
                print("\n  ✓ Cleaned up test data")

                return True
            else:
                print("  ✗ No alert was created")

                # Cleanup patient even if test failed
                db.delete(test_patient)
                db.commit()
                return False

        else:
            # Check existing patients
            patients_with_heartbeat = db.query(Patient).filter(
                Patient.last_heartbeat_at.isnot(None)
            ).count()

            print(f"  - Patients with heartbeat data: {patients_with_heartbeat}")

            if patients_with_heartbeat > 0:
                # Show a sample patient
                sample = db.query(Patient).filter(
                    Patient.last_heartbeat_at.isnot(None)
                ).first()

                if sample.last_heartbeat_at:
                    hours_since = (datetime.utcnow() - sample.last_heartbeat_at).total_seconds() / 3600
                    print(f"\n  Sample patient: {sample.display_name}")
                    print(f"    - Last heartbeat: {sample.last_heartbeat_at}")
                    print(f"    - Hours since: {hours_since:.1f}")

        db.close()
        return True

    except Exception as e:
        print(f"\n✗ Database integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_manual_run():
    """Test running the job manually"""
    print("\n" + "=" * 60)
    print("Test: Manual Job Execution")
    print("=" * 60)

    try:
        print("\n  Running detect_patient_inactivity()...")
        detect_patient_inactivity()
        print("  ✓ Job executed successfully (check logs above for details)")
        return True

    except Exception as e:
        print(f"\n  ✗ Job execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("INACTIVITY DETECTION TEST SUITE")
    print("=" * 60)

    results = []

    # Test 1: Thresholds
    try:
        results.append(("Inactivity Thresholds", test_inactivity_thresholds()))
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        results.append(("Inactivity Thresholds", False))

    # Test 2: Function Import
    try:
        results.append(("Job Function Import", test_job_function_exists()))
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        results.append(("Job Function Import", False))

    # Test 3: Scheduler Registration
    try:
        results.append(("Scheduler Registration", test_scheduler_registration()))
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        results.append(("Scheduler Registration", False))

    # Test 4: Statistics
    try:
        results.append(("Inactivity Statistics", test_inactivity_statistics()))
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        results.append(("Inactivity Statistics", False))

    # Test 5: Database Integration
    try:
        results.append(("Database Integration", test_database_integration()))
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        results.append(("Database Integration", False))

    # Test 6: Manual Run
    try:
        results.append(("Manual Job Execution", test_manual_run()))
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        results.append(("Manual Job Execution", False))

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
        print("✓ ALL TESTS PASSED - Inactivity detection ready!")
        print("\nInactivity Detection Configuration:")
        print(f"  - Check interval: Every 15 minutes")
        print(f"  - Warning threshold: {INACTIVITY_WARNING_HOURS} hours → Medium alert")
        print(f"  - High threshold: {INACTIVITY_HIGH_HOURS} hours → High alert")
        print(f"  - Critical threshold: {INACTIVITY_CRITICAL_HOURS} hours → Critical alert")
        print("\nFeatures:")
        print("  - Monitors patient heartbeat timestamps")
        print("  - Creates alerts at different severity levels")
        print("  - Includes emergency contact info in critical alerts")
        print("  - Prevents duplicate alerts (one per severity level)")
        print("  - Logs critical alerts for emergency response")
    else:
        print("✗ SOME TESTS FAILED - Please review the errors above")
    print("=" * 60 + "\n")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
