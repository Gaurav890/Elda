# Elder Companion AI - API Testing with Postman

## Document Purpose

This document provides comprehensive Postman collections and testing strategies for the Elder Companion AI backend API. Use this to systematically test all endpoints during development and before deployment.

**Last Updated:** 2025-10-24

---

## Table of Contents

1. [Postman Setup](#postman-setup)
2. [Environment Variables](#environment-variables)
3. [Authentication Flow](#authentication-flow)
4. [API Collections](#api-collections)
5. [Testing Workflows](#testing-workflows)
6. [Common Test Scenarios](#common-test-scenarios)

---

## Postman Setup

### Installation

**Option 1: Postman Desktop App** (Recommended)
```bash
# Download from: https://www.postman.com/downloads/
# Install for your OS (Mac/Windows/Linux)
```

**Option 2: Postman Web**
- Go to: https://web.postman.co
- Sign up for free account
- Use browser-based version

### Import Collection

1. Create new Workspace: "Elder Companion AI"
2. Create new Collection: "Elder Companion API v1"
3. Import the collections provided below

---

## Environment Variables

### Create Environment: "Local Development"

```json
{
  "name": "Local Development",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api/v1",
      "enabled": true
    },
    {
      "key": "access_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "refresh_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "patient_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "caregiver_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "schedule_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "reminder_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "conversation_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "alert_id",
      "value": "",
      "enabled": true
    }
  ]
}
```

### Create Environment: "Railway Production"

```json
{
  "name": "Railway Production",
  "values": [
    {
      "key": "base_url",
      "value": "https://eldercompanion.up.railway.app/api/v1",
      "enabled": true
    },
    {
      "key": "access_token",
      "value": "",
      "enabled": true
    }
  ]
}
```

---

## Authentication Flow

### Auto-Save Tokens (Collection Pre-request Script)

Add this to Collection settings → Pre-request Scripts:

```javascript
// Auto-set Authorization header if access_token exists
if (pm.environment.get("access_token")) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get("access_token")
    });
}
```

### Auto-Extract Tokens (Collection Tests Script)

Add this to Collection settings → Tests:

```javascript
// Auto-extract tokens from login/register responses
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();

    if (jsonData.data && jsonData.data.access_token) {
        pm.environment.set("access_token", jsonData.data.access_token);
        console.log("✅ Access token saved");
    }

    if (jsonData.data && jsonData.data.refresh_token) {
        pm.environment.set("refresh_token", jsonData.data.refresh_token);
        console.log("✅ Refresh token saved");
    }

    if (jsonData.data && jsonData.data.caregiver_id) {
        pm.environment.set("caregiver_id", jsonData.data.caregiver_id);
        console.log("✅ Caregiver ID saved");
    }

    if (jsonData.data && jsonData.data.patient_id) {
        pm.environment.set("patient_id", jsonData.data.patient_id);
        console.log("✅ Patient ID saved");
    }
}
```

---

## API Collections

### Collection 1: Authentication

#### 1.1 Register Caregiver

```
POST {{base_url}}/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone_number": "+1234567890",
  "relationship": "son"
}
```

**Tests:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has access_token", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('access_token');
});

pm.test("Response has caregiver_id", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('caregiver_id');
});
```

---

#### 1.2 Login Caregiver

```
POST {{base_url}}/auth/login
```

**Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has tokens", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('access_token');
    pm.expect(jsonData.data).to.have.property('refresh_token');
});
```

---

#### 1.3 Refresh Token

```
POST {{base_url}}/auth/refresh
```

**Body (JSON):**
```json
{
  "refresh_token": "{{refresh_token}}"
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("New tokens received", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.access_token).to.not.equal(pm.environment.get("access_token"));
});
```

---

### Collection 2: Patients

#### 2.1 List Patients

```
GET {{base_url}}/patients
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
- `status` (optional): active | inactive | all
- `page` (optional): 1
- `limit` (optional): 10

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has patients array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('patients');
    pm.expect(jsonData.data.patients).to.be.an('array');
});
```

---

#### 2.2 Create Patient

```
POST {{base_url}}/patients
```

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "first_name": "Margaret",
  "last_name": "Chen",
  "preferred_name": "Maggie",
  "date_of_birth": "1947-03-15",
  "gender": "female",
  "phone_number": "+1234567890",
  "email": "margaret@example.com",
  "address": "123 Main St, Oakland, CA 94610",
  "timezone": "America/Los_Angeles",
  "medical_conditions": ["hypertension", "mild cognitive impairment"],
  "allergies": ["penicillin"],
  "emergency_notes": "Has pacemaker. Wears hearing aids.",
  "preferred_voice": "female",
  "communication_style": "friendly",
  "language": "en",
  "personal_context": {
    "family_members": [
      {
        "name": "Sarah",
        "relationship": "daughter",
        "details": "Lives in Seattle, nurse, calls every Sunday",
        "contact": "+1234567890",
        "primary_contact": true
      }
    ],
    "important_dates": [
      {
        "date": "1945-06-15",
        "event": "Wedding anniversary",
        "notes": "Husband passed 2022"
      }
    ],
    "hobbies": ["gardening", "knitting", "watching Jeopardy"],
    "favorite_topics": ["grandchildren", "old movies", "roses"],
    "sensitive_topics": ["late husband", "difficulty walking"],
    "special_notes": "Loves talking about roses. Gets emotional about husband."
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Patient ID saved to environment", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('patient_id');
    pm.environment.set("patient_id", jsonData.data.patient_id);
});

pm.test("Letta agent created", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('letta_agent_id');
});
```

---

#### 2.3 Get Patient Details

```
GET {{base_url}}/patients/{{patient_id}}
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Patient data complete", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('first_name');
    pm.expect(jsonData.data).to.have.property('personal_context');
    pm.expect(jsonData.data.personal_context).to.have.property('family_members');
});
```

---

#### 2.4 Update Patient

```
PUT {{base_url}}/patients/{{patient_id}}
```

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "preferred_name": "Maggie",
  "personal_context": {
    "family_members": [
      {
        "name": "Sarah",
        "relationship": "daughter",
        "details": "Lives in Seattle, nurse, has 2 kids - Tommy (7), Emma (5)",
        "contact": "+1234567890",
        "primary_contact": true
      }
    ]
  }
}
```

---

### Collection 3: Schedules

#### 3.1 List Schedules

```
GET {{base_url}}/patients/{{patient_id}}/schedules
```

**Query Parameters:**
- `active_only`: true | false
- `category`: medication | meal | exercise | social | hygiene | other

---

#### 3.2 Create Schedule (Medication)

```
POST {{base_url}}/patients/{{patient_id}}/schedules
```

**Body (JSON):**
```json
{
  "title": "Morning Medication",
  "description": "Lisinopril for blood pressure",
  "category": "medication",
  "schedule_type": "daily",
  "time_of_day": "08:00:00",
  "reminder_method": "push_with_voice",
  "max_retry_attempts": 3,
  "retry_interval_minutes": 10,
  "medication_name": "Lisinopril",
  "dosage": "10mg",
  "medication_color": "yellow pill",
  "medication_location": "kitchen table",
  "medication_instructions": "Take with food"
}
```

**Tests:**
```javascript
pm.test("Schedule created", function () {
    const jsonData = pm.response.json();
    pm.environment.set("schedule_id", jsonData.data.schedule_id);
});
```

---

#### 3.3 Create Schedule (Meal)

```
POST {{base_url}}/patients/{{patient_id}}/schedules
```

**Body (JSON):**
```json
{
  "title": "Breakfast Reminder",
  "description": "Time for breakfast",
  "category": "meal",
  "schedule_type": "daily",
  "time_of_day": "09:00:00",
  "reminder_method": "push_with_voice",
  "max_retry_attempts": 2,
  "retry_interval_minutes": 15
}
```

---

### Collection 4: Conversations

#### 4.1 Submit Patient Message (Mobile)

```
POST {{base_url}}/conversations/patient
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "patient_id": "{{patient_id}}",
  "message": "I'm feeling dizzy",
  "timestamp": "2025-10-24T14:30:00Z",
  "context": {
    "triggered_by": "manual",
    "last_interaction": "12:45 PM"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("AI response received", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('response');
    pm.expect(jsonData.data.response).to.be.a('string');
});

pm.test("Claude analysis included", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('claude_analysis');
    pm.expect(jsonData.data.claude_analysis).to.have.property('intent');
    pm.expect(jsonData.data.claude_analysis).to.have.property('severity');
});

pm.test("Conversation ID saved", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.conversation_id) {
        pm.environment.set("conversation_id", jsonData.data.conversation_id);
    }
});
```

---

#### 4.2 Get Conversation History

```
GET {{base_url}}/patients/{{patient_id}}/conversations
```

**Query Parameters:**
- `date`: 2025-10-24 (optional)
- `type`: reminder_followup | casual_chat | emergency | check_in | question
- `page`: 1
- `limit`: 20

---

#### 4.3 Semantic Search (Chroma)

```
GET {{base_url}}/conversations/search
```

**Query Parameters:**
- `patient_id`: {{patient_id}}
- `q`: knee pain
- `n_results`: 5

**Tests:**
```javascript
pm.test("Semantic search works", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('results');
    pm.expect(jsonData.data.results).to.be.an('array');
});

pm.test("Results have similarity scores", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.results.length > 0) {
        pm.expect(jsonData.data.results[0]).to.have.property('similarity_score');
    }
});
```

---

### Collection 5: Alerts

#### 5.1 List Alerts

```
GET {{base_url}}/alerts
```

**Query Parameters:**
- `patient_id`: {{patient_id}} (optional)
- `severity`: low | medium | high | critical
- `acknowledged`: true | false
- `page`: 1
- `limit`: 20

---

#### 5.2 Create Manual Alert (Testing)

```
POST {{base_url}}/alerts
```

**Body (JSON):**
```json
{
  "patient_id": "{{patient_id}}",
  "alert_type": "health_concern",
  "severity": "medium",
  "title": "Test Alert",
  "description": "Manual test alert for testing",
  "context": {
    "test": true
  }
}
```

**Tests:**
```javascript
pm.test("Alert created", function () {
    const jsonData = pm.response.json();
    pm.environment.set("alert_id", jsonData.data.alert_id);
});
```

---

#### 5.3 Acknowledge Alert

```
POST {{base_url}}/alerts/{{alert_id}}/acknowledge
```

**Body (JSON):**
```json
{
  "resolution_notes": "Checked on patient, all is well"
}
```

---

#### 5.4 Resolve Alert

```
POST {{base_url}}/alerts/{{alert_id}}/resolve
```

**Body (JSON):**
```json
{
  "resolution_notes": "Issue resolved, patient is safe",
  "resolution_action": "called_patient"
}
```

---

### Collection 6: Mobile Endpoints

#### 6.1 Send Heartbeat

```
POST {{base_url}}/mobile/heartbeat
```

**Body (JSON):**
```json
{
  "patient_id": "{{patient_id}}",
  "timestamp": "2025-10-24T14:30:00Z",
  "activity_type": "heartbeat",
  "app_state": "background",
  "last_interaction_at": "2025-10-24T14:15:00Z",
  "context": {
    "battery_level": 0.75,
    "movement_detected": true,
    "location": {
      "lat": 37.7749,
      "lng": -122.4194
    },
    "network_type": "wifi"
  }
}
```

---

#### 6.2 Emergency Button

```
POST {{base_url}}/mobile/emergency
```

**Body (JSON):**
```json
{
  "patient_id": "{{patient_id}}",
  "timestamp": "2025-10-24T15:45:23Z",
  "alert_type": "emergency_button",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "battery_level": 0.45
}
```

**Tests:**
```javascript
pm.test("Emergency alert created immediately", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.responseTime).to.be.below(5000); // < 5 seconds
});

pm.test("Caregiver notified", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('alert_sent');
    pm.expect(jsonData.data.alert_sent).to.be.true;
});
```

---

### Collection 7: Daily Summaries

#### 7.1 Get Daily Summaries

```
GET {{base_url}}/patients/{{patient_id}}/summaries
```

**Query Parameters:**
- `date`: 2025-10-24 (optional, defaults to today)
- `start_date`: 2025-10-01 (for range)
- `end_date`: 2025-10-24 (for range)

---

### Collection 8: Insights (Letta)

#### 8.1 Get Patient Insights

```
GET {{base_url}}/patients/{{patient_id}}/insights
```

**Query Parameters:**
- `insight_type`: response_pattern | timing_preference | communication_style | health_pattern | behavioral_change
- `is_active`: true | false
- `min_confidence`: 0.7 (0.0 - 1.0)

**Tests:**
```javascript
pm.test("Insights from Letta received", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('insights');
    pm.expect(jsonData.data.insights).to.be.an('array');
});

pm.test("Insights have confidence scores", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.insights.length > 0) {
        pm.expect(jsonData.data.insights[0]).to.have.property('confidence_score');
    }
});
```

---

## Testing Workflows

### Workflow 1: Complete User Registration & Patient Setup

**Order of execution:**

1. Register Caregiver (`POST /auth/register`)
2. Login Caregiver (`POST /auth/login`)
3. Create Patient (`POST /patients`)
4. Create Medication Schedule (`POST /patients/{id}/schedules`)
5. Create Meal Schedule (`POST /patients/{id}/schedules`)
6. Verify Letta Agent Created (check patient details)

**Expected Result:** Caregiver can manage patient with schedules

---

### Workflow 2: Conversation Pipeline Test

**Order of execution:**

1. Submit Patient Message (`POST /conversations/patient`)
   - Message: "I'm feeling dizzy"
2. Get Conversation History (`GET /patients/{id}/conversations`)
3. Search Similar Conversations (`GET /conversations/search?q=dizzy`)
4. Check if Alert Created (`GET /alerts?patient_id={id}`)

**Expected Result:**
- AI response generated
- Claude analysis included
- Similar conversations found (if pattern exists)
- Alert created if severity warrants

---

### Workflow 3: Emergency Flow Test

**Order of execution:**

1. Press Emergency Button (`POST /mobile/emergency`)
2. Verify Alert Created (`GET /alerts`)
3. Check Alert Severity is CRITICAL
4. Acknowledge Alert (`POST /alerts/{id}/acknowledge`)
5. Resolve Alert (`POST /alerts/{id}/resolve`)

**Expected Result:**
- Emergency alert created < 5 seconds
- Severity = critical
- Caregiver notified (check logs)
- Alert lifecycle works

---

### Workflow 4: AI Integration Test (Claude + Letta + Chroma)

**Order of execution:**

1. Create Patient (Letta agent created)
2. Have 3 conversations about same topic (e.g., "knee pain")
3. Check Letta Insights (`GET /insights`) - Should show pattern
4. Semantic Search for topic (`GET /conversations/search?q=knee`)
5. New conversation about same topic
6. Verify AI response uses context from Letta & Chroma

**Expected Result:**
- Letta learns pattern after multiple interactions
- Chroma finds similar conversations
- Claude response improves with context

---

## Common Test Scenarios

### Scenario 1: Medication Reminder Flow

**Steps:**
1. Create medication schedule at current time + 2 minutes
2. Wait for scheduler to trigger (check logs)
3. Verify reminder created in database
4. Simulate patient response via `/conversations/patient`
5. Check reminder marked as completed
6. Verify Letta updated with interaction

---

### Scenario 2: Missed Reminder Alert

**Steps:**
1. Create medication schedule
2. Wait for reminder trigger
3. Do NOT respond from mobile
4. Wait for retry attempts (2x)
5. Verify alert created after max retries
6. Check caregiver notified

---

### Scenario 3: Inactivity Detection

**Steps:**
1. Create patient
2. Send heartbeat (`POST /mobile/heartbeat`)
3. Wait 4+ hours (or manually trigger monitoring job)
4. Verify inactivity alert created
5. Check alert message mentions hours of inactivity

---

### Scenario 4: Chroma Semantic Search Accuracy

**Steps:**
1. Create conversations with variations:
   - "My knee hurts"
   - "Having trouble walking"
   - "Leg is bothering me"
2. Search for "knee pain"
3. Verify all 3 conversations returned
4. Check similarity scores

**Expected:** Semantic search finds related concepts, not just keywords

---

## Test Data Generator

### Quick Test Data Creation

**Run this collection to set up test data:**

```json
{
  "name": "Generate Test Data",
  "item": [
    {
      "name": "1. Register Test Caregiver",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"first_name\":\"Test\",\"last_name\":\"Caregiver\",\"email\":\"test@example.com\",\"password\":\"Test123!\",\"phone_number\":\"+1234567890\",\"relationship\":\"son\"}"
        }
      }
    },
    {
      "name": "2. Create Test Patient",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/patients",
        "body": {
          "mode": "raw",
          "raw": "{\"first_name\":\"Test\",\"last_name\":\"Patient\",\"preferred_name\":\"Testy\",\"date_of_birth\":\"1950-01-01\",\"gender\":\"female\",\"phone_number\":\"+1987654321\",\"timezone\":\"America/Los_Angeles\",\"medical_conditions\":[\"test condition\"],\"personal_context\":{\"family_members\":[{\"name\":\"Test Family\",\"relationship\":\"daughter\",\"primary_contact\":true}]}}"
        }
      }
    },
    {
      "name": "3. Create Medication Schedule",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/patients/{{patient_id}}/schedules",
        "body": {
          "mode": "raw",
          "raw": "{\"title\":\"Test Medication\",\"category\":\"medication\",\"schedule_type\":\"daily\",\"time_of_day\":\"08:00:00\",\"medication_name\":\"Test Med\",\"dosage\":\"10mg\"}"
        }
      }
    }
  ]
}
```

---

## Debugging Tips

### Enable Verbose Logging

In Postman Console (View → Show Postman Console):
- See all request/response details
- Check environment variable updates
- View console.log outputs from tests

### Common Issues

**Issue: 401 Unauthorized**
```
Solution: Check if access_token is set in environment
Debug: console.log(pm.environment.get("access_token"))
```

**Issue: 404 Not Found**
```
Solution: Check if base_url is correct
Debug: console.log(pm.environment.get("base_url"))
```

**Issue: 422 Validation Error**
```
Solution: Check request body matches schema
Debug: Look at response.data.detail for specific field errors
```

---

## Export & Share Collections

### Export Collection

1. Right-click collection → Export
2. Choose Collection v2.1 format
3. Save as `elder-companion-api-v1.postman_collection.json`
4. Commit to repository: `postman/collections/`

### Export Environment

1. Click gear icon → Export
2. Save as `local-dev.postman_environment.json`
3. Share with team (remove sensitive tokens first!)

---

## CI/CD Integration (Future)

### Run Postman with Newman CLI

```bash
# Install Newman
npm install -g newman

# Run collection
newman run elder-companion-api-v1.postman_collection.json \
  -e local-dev.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json

# Run specific folder
newman run collection.json \
  --folder "Authentication" \
  -e environment.json
```

---

## Postman Tips & Tricks

### 1. Use Collection Variables for Common Data

```javascript
pm.collectionVariables.set("test_email", "test@example.com");
pm.collectionVariables.set("test_password", "Test123!");
```

### 2. Use Pre-request Scripts for Dynamic Data

```javascript
// Generate random email
pm.environment.set("random_email", `test${Date.now()}@example.com`);

// Current timestamp
pm.environment.set("current_timestamp", new Date().toISOString());

// Random patient name
const names = ["Alice", "Bob", "Charlie", "Diana"];
pm.environment.set("random_name", names[Math.floor(Math.random() * names.length)]);
```

### 3. Use Tests for Automated Validation

```javascript
// Check response time
pm.test("Response time < 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);
});

// Check specific field value
pm.test("Patient status is active", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.is_active).to.be.true;
});

// Check array length
pm.test("At least one patient returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.patients.length).to.be.at.least(1);
});
```

---

## Conclusion

This Postman collection provides comprehensive API testing for the Elder Companion AI backend. Use it to:

- ✅ Test all endpoints during development
- ✅ Verify AI integrations (Claude, Letta, Chroma)
- ✅ Validate authentication flow
- ✅ Test complete user workflows
- ✅ Debug issues quickly
- ✅ Prepare for demo (test all demo paths)

**Remember:** Update this document as new endpoints are added!

**Last Updated:** 2025-10-24
