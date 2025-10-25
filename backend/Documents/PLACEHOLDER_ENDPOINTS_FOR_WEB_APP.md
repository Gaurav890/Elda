# Placeholder Backend Endpoints for Caregiver Web App

**Date:** October 24, 2025
**Purpose:** Document endpoints needed by caregiver web app that don't exist yet
**Priority:** Implement later as needed

---

## Overview

The caregiver web app design includes features that require backend endpoints not yet implemented. This document tracks those endpoints so they can be added to the backend when needed.

**Status:** All endpoints listed below should be treated as **placeholders**. The frontend will show "Coming soon" messages or disable buttons for these features.

---

## Missing Endpoints

### 1. Generate Patient Connection Code ⚠️ Not Implemented

**Feature:** Generate 6-digit code + QR code for patient to link mobile app

**Endpoints Needed:**
```typescript
POST /api/v1/patients/{id}/generate-code
Response: {
  code: "123456",  // 6-digit code
  qr_code_url: "data:image/png;base64,...",  // QR code image
  expires_at: "2025-10-24T15:30:00Z",  // Expiration (10 minutes)
  device_setup_url: "eldercompanion://setup?code=123456"  // Deep link for mobile
}

GET /api/v1/patients/{id}/code
Response: {
  code: "123456",
  qr_code_url: "...",
  expires_at: "...",
  is_expired: boolean,
  is_used: boolean
}

POST /api/v1/patients/{id}/code/revoke
Response: { success: true }
```

**Used By:**
- "Generate Code" button in AddPatientModal success state
- Care Circle patient cards (quick action)

**Design Spec:** `/Documents/Design Documentation/CaregiverDesign.md` lines 87-96

**Implementation Notes:**
- Code should expire after 10 minutes
- Code can only be used once
- Store in `patient_connection_codes` table (needs migration)
- QR code generation: Use `qrcode` Python library
- Code format: 6 digits, random, unique

**Estimated Time:** 2 hours

---

### 2. Manual Trigger Reminder (Nudge) ⚠️ Not Implemented

**Feature:** Manually trigger a reminder or "nudge" a patient

**Endpoints Needed:**
```typescript
POST /api/v1/patients/{id}/trigger-reminder
Body: {
  reminder_id?: string,  // Optional: specific reminder to trigger
  message?: string  // Optional: custom message
}
Response: {
  success: boolean,
  reminder_sent_at: string,
  delivery_status: "sent" | "pending" | "failed"
}

POST /api/v1/patients/{id}/nudge
Body: {
  message?: string  // Optional custom nudge message
}
Response: {
  success: boolean,
  nudge_sent_at: string,
  delivery_status: "sent" | "pending" | "failed"
}
```

**Used By:**
- "Trigger Reminder" button in Care Circle patient cards
- "Trigger Reminder" button in Patient Detail header
- "Nudge" button in Patient Detail header
- "Nudge" button in Alert cards

**Design Spec:** Lines 75, 99, 129, 153

**Implementation Notes:**
- Should send push notification to patient's mobile app (Firebase)
- Optional: Send SMS via Twilio
- Should create activity log entry
- Should update patient's `last_active_at` when patient responds
- For "Trigger Reminder": send next pending reminder immediately
- For "Nudge": send generic check-in message

**Estimated Time:** 2-3 hours

---

### 3. Patient Notes to AI ⚠️ Not Implemented

**Feature:** Add contextual notes that help AI understand patient better

**Endpoints Needed:**
```typescript
POST /api/v1/patients/{id}/notes
Body: {
  content: string,  // Markdown or plain text
  tags?: string[],  // Optional tags (e.g., ["medication", "routine"])
  key_value_pairs?: Record<string, string>  // Structured data
}
Response: {
  note_id: string,
  version: number,
  created_at: string
}

PATCH /api/v1/patients/{id}/notes/{note_id}
Body: {
  content: string,
  tags?: string[],
  key_value_pairs?: Record<string, string>
}
Response: {
  note_id: string,
  version: number,  // Incremented
  updated_at: string
}

GET /api/v1/patients/{id}/notes
Response: {
  current_note: {
    note_id: string,
    content: string,
    tags: string[],
    key_value_pairs: Record<string, string>,
    version: number,
    created_at: string,
    updated_at: string
  },
  versions: [{  // Version history
    version: number,
    content: string,
    updated_at: string,
    updated_by: string  // Caregiver name
  }]
}

GET /api/v1/patients/{id}/notes/version/{version}
Response: {
  note_id: string,
  version: number,
  content: string,
  created_at: string
}
```

**Used By:**
- "Notes to AI" tab in Patient Detail page

**Design Spec:** Lines 98, 132-136

**Implementation Notes:**
- Should version notes (keep history)
- Should integrate with Letta agent (update agent's core memory)
- Should support key-value pairs for structured data:
  - Example: `{"medication_location": "kitchen counter", "preferred_name": "Grandma Mary"}`
- Should support templates (medication location, routine preferences, etc.)
- Should show version timeline in UI
- Table needed: `patient_notes` with columns:
  - id, patient_id, version, content, tags, key_value_pairs, created_by, created_at

**Estimated Time:** 3-4 hours

---

### 4. Daily Summary Audio Playback ⚠️ Not Implemented

**Feature:** Play audio version of daily summary

**Endpoints Needed:**
```typescript
POST /api/v1/conversations/patients/{id}/summaries/{summary_id}/generate-audio
Response: {
  audio_url: string,  // URL to audio file (MP3)
  duration_seconds: number,
  generated_at: string,
  expires_at: string  // Pre-signed URL expiration
}

GET /api/v1/conversations/patients/{id}/summaries/{summary_id}/audio
Response: {
  audio_url: string,
  duration_seconds: number
}
```

**Used By:**
- "Play Audio" button in Reports tab (Daily Summary cards)

**Design Spec:** Line 119

**Implementation Notes:**
- Use TTS service (OpenAI TTS or ElevenLabs)
- Generate audio from summary text
- Store in S3 or local storage
- Return pre-signed URL with expiration
- Cache audio for 24 hours
- Should use patient's preferred voice (male/female/neutral)

**Estimated Time:** 2-3 hours

---

### 5. Daily Summary PDF Export ⚠️ Not Implemented

**Feature:** Download daily summary as PDF

**Endpoints Needed:**
```typescript
POST /api/v1/conversations/patients/{id}/summaries/{summary_id}/generate-pdf
Response: {
  pdf_url: string,  // URL to PDF file
  generated_at: string,
  expires_at: string  // Pre-signed URL expiration
}

GET /api/v1/conversations/patients/{id}/summaries/{summary_id}/pdf
Response: {
  pdf_url: string
}
```

**Used By:**
- "Download PDF" button in Reports tab (Daily Summary cards)

**Design Spec:** Line 119

**Implementation Notes:**
- Use PDF generation library (ReportLab or WeasyPrint)
- Include: patient name, date, overview, stats, mood, events
- Brand with Elder Companion AI logo
- Store in S3 or local storage
- Return pre-signed URL with expiration
- Cache PDF for 24 hours

**Estimated Time:** 2-3 hours

---

### 6. Voice Escalation (Call Caregiver) ⚠️ Not Implemented

**Feature:** Enable automatic voice calls to caregiver for critical alerts

**Endpoints Needed:**
```typescript
PATCH /api/v1/auth/me/preferences
Body: {
  voice_escalation: {
    enabled: boolean,
    phone_number: string,
    threshold: "high" | "critical",  // Call on high or only critical
    quiet_hours_override: boolean  // Call during quiet hours?
  }
}

POST /api/v1/alerts/{alert_id}/voice-call
Body: {
  caregiver_id: string
}
Response: {
  call_initiated: boolean,
  call_sid: string,  // Twilio call SID
  call_status: "ringing" | "in-progress" | "completed" | "failed"
}
```

**Used By:**
- "Voice escalation toggle" in Settings page

**Design Spec:** Line 146

**Implementation Notes:**
- Use Twilio for voice calls
- Should only call if alert severity ≥ threshold
- Should respect quiet hours (unless critical and override enabled)
- Should include alert details in voice message (TTS)
- Should create activity log entry
- Should track call attempts (don't spam)

**Estimated Time:** 3 hours

---

### 7. Conversation Search ⚠️ Not Implemented

**Feature:** Search through conversation history

**Endpoints Needed:**
```typescript
GET /api/v1/conversations/patients/{id}/conversations/search
Query: {
  q: string,  // Search query
  type?: "keyword" | "semantic",  // Default: semantic (Chroma)
  limit?: number,
  offset?: number
}
Response: {
  total: number,
  results: [{
    conversation_id: string,
    patient_message: string,
    ai_response: string,
    similarity_score: number,  // For semantic search
    occurred_at: string,
    matched_text: string  // Highlighted match
  }]
}
```

**Used By:**
- Search bar in Conversations tab (mentioned as placeholder)

**Design Spec:** Not explicitly in design, but natural feature

**Implementation Notes:**
- Should use Chroma for semantic search (already integrated)
- Should support keyword search as fallback
- Should highlight matched text
- Should return conversation context (not just match)

**Estimated Time:** 2 hours (Chroma already integrated)

---

### 8. Profile Photo Upload ⚠️ Not Implemented

**Feature:** Upload profile photos for patients and caregivers

**Endpoints Needed:**
```typescript
POST /api/v1/patients/{id}/photo
Content-Type: multipart/form-data
Body: {
  file: File  // Image file (JPEG, PNG)
}
Response: {
  profile_photo_url: string,
  uploaded_at: string
}

POST /api/v1/auth/me/photo
Content-Type: multipart/form-data
Body: {
  file: File
}
Response: {
  profile_photo_url: string,
  uploaded_at: string
}
```

**Used By:**
- Add Patient modal (Step 1)
- Settings page (Profile section)

**Design Spec:** Lines 71, 144

**Implementation Notes:**
- Use S3 or local storage
- Resize images (max 512x512, compress)
- Validate file type (JPEG, PNG only)
- Limit file size (max 5MB)
- Generate thumbnails (128x128, 256x256)
- Return public URL
- Update patient/caregiver `profile_photo_url` field

**Estimated Time:** 2-3 hours

---

### 9. Bulk Alert Operations ⚠️ Not Implemented

**Feature:** Acknowledge multiple alerts at once

**Endpoints Needed:**
```typescript
POST /api/v1/alerts/bulk-acknowledge
Body: {
  alert_ids: string[],
  note?: string  // Optional note for all
}
Response: {
  acknowledged_count: number,
  failed_ids: string[]  // Alerts that failed to acknowledge
}
```

**Used By:**
- Global Alerts page (bulk select + "Acknowledge All" button)

**Design Spec:** Line 140 (mentioned as optional feature)

**Implementation Notes:**
- Should update all alerts in single transaction
- Should return list of failed IDs if any fail
- Should create activity log for bulk action
- Should trigger notifications if configured

**Estimated Time:** 1 hour

---

## Summary Table

| Feature | Endpoints | Priority | Estimated Time | Used By |
|---------|-----------|----------|----------------|---------|
| Connection Code | 3 endpoints | Medium | 2 hours | Add Patient, Care Circle |
| Trigger Reminder/Nudge | 2 endpoints | Medium | 2-3 hours | Multiple pages |
| Notes to AI | 4 endpoints | Low | 3-4 hours | Patient Detail (Notes tab) |
| Summary Audio | 2 endpoints | Low | 2-3 hours | Reports tab |
| Summary PDF | 2 endpoints | Low | 2-3 hours | Reports tab |
| Voice Escalation | 2 endpoints | Low | 3 hours | Settings |
| Conversation Search | 1 endpoint | Low | 2 hours | Conversations tab |
| Photo Upload | 2 endpoints | Medium | 2-3 hours | Add Patient, Settings |
| Bulk Alerts | 1 endpoint | Low | 1 hour | Global Alerts |
| **TOTAL** | **19 endpoints** | - | **18-24 hours** | - |

---

## Implementation Priority

### High Priority (Phase 4 - After Web App MVP)
1. **Connection Code** - Needed for patient onboarding
2. **Photo Upload** - Nice UX improvement
3. **Trigger Reminder/Nudge** - Useful caregiver action

### Medium Priority (Phase 5)
4. **Conversation Search** - Leverage existing Chroma
5. **Bulk Alert Operations** - Time-saving for caregivers

### Low Priority (Phase 6+)
6. **Notes to AI** - Advanced personalization
7. **Summary Audio/PDF** - Nice-to-have exports
8. **Voice Escalation** - Advanced alerting

---

## Frontend Handling (Current)

For all missing endpoints, the frontend will:

**Option 1: Disabled Button**
```typescript
<Button disabled title="Coming soon">
  Generate Code
</Button>
```

**Option 2: Toast Message**
```typescript
<Button onClick={() => toast({
  title: "Coming soon",
  description: "This feature will be available soon!"
})}>
  Generate Code
</Button>
```

**Option 3: Placeholder Component**
```typescript
<PlaceholderFeature
  title="Generate Connection Code"
  description="This feature is coming soon. You'll be able to generate a code for patients to link their mobile device."
/>
```

---

## Database Migrations Needed

When implementing these endpoints, the following database changes may be needed:

### 1. Connection Codes Table
```sql
CREATE TABLE patient_connection_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL UNIQUE,
  qr_code_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  device_linked_at TIMESTAMP
);

CREATE INDEX idx_connection_codes_patient ON patient_connection_codes(patient_id);
CREATE INDEX idx_connection_codes_code ON patient_connection_codes(code);
```

### 2. Patient Notes Table
```sql
CREATE TABLE patient_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  tags VARCHAR(50)[],
  key_value_pairs JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES caregivers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patient_notes_patient ON patient_notes(patient_id);
CREATE INDEX idx_patient_notes_version ON patient_notes(patient_id, version);
```

### 3. Voice Call Logs Table (Optional)
```sql
CREATE TABLE voice_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES caregivers(id),
  phone_number VARCHAR(20) NOT NULL,
  call_sid VARCHAR(100),  -- Twilio call SID
  call_status VARCHAR(20),  -- ringing, in-progress, completed, failed
  duration_seconds INTEGER,
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_voice_calls_alert ON voice_call_logs(alert_id);
CREATE INDEX idx_voice_calls_caregiver ON voice_call_logs(caregiver_id);
```

---

## Testing Plan (When Implementing)

For each endpoint group:

### Connection Code
- [ ] Generate code → valid 6-digit code created
- [ ] Code expires after 10 minutes
- [ ] Code can only be used once
- [ ] QR code image generated correctly
- [ ] Old codes automatically invalidated

### Trigger Reminder/Nudge
- [ ] Sends push notification via Firebase
- [ ] Creates activity log entry
- [ ] Returns delivery status
- [ ] Handles offline patient gracefully
- [ ] Rate limiting (max 5 per hour per patient)

### Patient Notes
- [ ] Creates note with versioning
- [ ] Updates Letta agent memory
- [ ] Retrieves current note
- [ ] Retrieves version history
- [ ] Supports key-value pairs

### Audio/PDF Export
- [ ] Generates audio file with correct voice
- [ ] Generates PDF with branding
- [ ] Returns pre-signed URL
- [ ] Caches for 24 hours
- [ ] Cleans up old files

### Photo Upload
- [ ] Accepts JPEG, PNG only
- [ ] Rejects files > 5MB
- [ ] Resizes to 512x512
- [ ] Generates thumbnails
- [ ] Updates profile_photo_url

---

## Notes for Implementation

### General Guidelines
1. **Use existing patterns:** Follow current backend code structure
2. **Add to documentation:** Update API guide when implementing
3. **Add tests:** Create test file for each new endpoint
4. **Update Postman:** Add to Postman collection
5. **Check frontend:** Verify frontend removes placeholder after implementing

### File Locations (Backend)
- **API endpoints:** `/backend/app/api/v1/`
- **Business logic:** `/backend/app/services/`
- **Database models:** `/backend/app/models/`
- **Migrations:** `/backend/alembic/versions/`
- **Tests:** `/backend/tests/`

### Integration Points
- **Twilio:** For SMS and voice calls
- **Firebase:** For push notifications
- **S3/Storage:** For file uploads
- **Chroma:** For semantic search (already integrated)
- **Letta:** For AI memory (already integrated)

---

## Contact Frontend Developer

When you implement these endpoints, please:
1. Update this document with ✅ status
2. Notify frontend developer to remove placeholders
3. Provide updated API documentation
4. Share Postman collection updates

---

**Document Status:** ✅ Complete
**Last Updated:** October 24, 2025
**To Be Updated:** As endpoints are implemented
