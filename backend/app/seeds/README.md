# 🌱 Database Seed Data

This directory contains scripts for populating the database with realistic test data.

## Comprehensive Seed Script

**File:** `comprehensive_seed.py`

### What It Does

Populates the database with realistic test data for all backend endpoints:

- **234** Activity Logs (spanning 30 days)
- **36** Conversations (with sentiment analysis)
- **12** Patient Insights (varying confidence levels)
- **20** Reminders (completed and missed)
- **9** Alerts (various severities)
- **7** Caregiver Notes (multiple categories)

**Total:** 318+ records across 2 patients

### How to Run

```bash
# From the backend directory
cd /Users/gaurav/Elda/backend

# Activate virtual environment
source venv/bin/activate

# Run the seed script
python -m app.seeds.comprehensive_seed
```

### Data Distribution

The seed script creates data for:
- **Patient 1:** `4c7389e0-9485-487a-9dde-59c14ab97d67` (Khina maya)
- **Patient 2:** `0a25b63d-eb49-4ba5-b2fa-9f1594162a7a` (Test Patient)
- **Caregiver:** `7b915bd8-c634-46e4-9250-7ce1b5a4add0` (test@example.com)

### Data Quality Features

✅ **Realistic Timestamps:** Data spans 30 days with natural distribution
✅ **Varied Content:** Multiple activity types, sentiments, categories
✅ **Relationship Integrity:** All foreign keys properly linked
✅ **Realistic Values:** Confidence scores, battery levels, response times
✅ **Status Variety:** Mix of completed/missed reminders, active/resolved alerts

### Verification

After running the seed script, verify data:

```bash
# Check record counts
psql elda_db -c "
SELECT
  'Activity Logs' as table_name, COUNT(*) as count FROM activity_logs
UNION ALL
SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'Patient Insights', COUNT(*) FROM patient_insights
UNION ALL
SELECT 'Reminders', COUNT(*) FROM reminders
UNION ALL
SELECT 'Alerts', COUNT(*) FROM alerts
UNION ALL
SELECT 'Caregiver Notes', COUNT(*) FROM caregiver_notes;
"
```

### Testing Endpoints

After seeding, test the endpoints:

```bash
# Get auth token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -s | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

PATIENT_ID="4c7389e0-9485-487a-9dde-59c14ab97d67"

# Test endpoints
curl -X GET "http://localhost:8000/api/v1/patients/$PATIENT_ID/notes" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

curl -X GET "http://localhost:8000/api/v1/patients/$PATIENT_ID/activity?limit=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

curl -X GET "http://localhost:8000/api/v1/conversations/patients/$PATIENT_ID/insights" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

curl -X GET "http://localhost:8000/api/v1/patients/$PATIENT_ID/reports?time_range=7d" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

## Notes

- The seed script is **idempotent-safe** but will add duplicate data if run multiple times
- To reset the database, truncate tables before re-running:
  ```sql
  TRUNCATE TABLE activity_logs, conversations, patient_insights, reminders, alerts, caregiver_notes CASCADE;
  ```
- All seeded data uses the existing patients and caregivers in the database
- Timestamps are generated relative to the current time for realistic date ranges
