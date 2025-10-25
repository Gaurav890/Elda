# Backend Remaining Work - Prioritized Checklist

**Created:** 2025-10-24
**Status:** Ready to implement while Figma designs are in progress

---

## Quick Wins (High Impact, Low Effort) 🎯

### Phase 1: Activity Monitoring (30 minutes)
- [ ] Add POST `/api/v1/patients/{id}/heartbeat` endpoint
- [ ] Add GET `/api/v1/patients/{id}/activity` endpoint
- [ ] Test activity logging
- [ ] Update activity_log model if needed

**Why:** Critical for detecting patient inactivity, already have the table

### Phase 2: Enhanced Patient Profile (45 minutes)
- [ ] Add `profile_photo_url` field to patients table
- [ ] Add `timezone` field to patients table (default: UTC)
- [ ] Add `preferred_voice` field (male/female/neutral)
- [ ] Add `communication_style` field (friendly/formal/casual)
- [ ] Add `language` field (default: en)
- [ ] Add `app_version` field
- [ ] Add `last_heartbeat_at` field
- [ ] Create migration for new fields
- [ ] Update patient schemas
- [ ] Update patient endpoints

**Why:** Makes the system more personalized and production-ready

### Phase 3: Advanced Caregiver Preferences ✅ COMPLETED (30 minutes)
- [x] Add `preferences` JSONB field to caregivers table
- [x] Create migration (8ab72b20f47b)
- [x] Update caregiver schema to include preferences structure
- [x] Add endpoints: GET and PATCH /api/v1/auth/me/preferences
- [x] Add comprehensive Pydantic validation schemas
- [x] Test all functionality

**Preferences structure:**
```json
{
  "notifications": {
    "email": true,
    "sms": true,
    "push": false
  },
  "alert_threshold": "medium",
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00"
  },
  "daily_summary_time": "20:00"
}
```

**Why:** Better caregiver experience, needed for production

---

## Medium Priority (Medium Impact, Medium Effort) 🔧

### Phase 4: Communication Services Integration (2-3 hours)

#### Twilio SMS Service
- [ ] Create `app/services/communication/twilio_service.py`
- [ ] Implement `send_sms()` function
- [ ] Implement `send_voice_call()` function
- [ ] Add Twilio error handling
- [ ] Test with actual credentials (optional for now)
- [ ] Add fallback to console logging if no credentials

#### Firebase Push Notifications
- [ ] Create `app/services/communication/firebase_service.py`
- [ ] Implement `send_push_notification()` function
- [ ] Implement `send_bulk_notifications()` function
- [ ] Add Firebase credentials handling
- [ ] Test with actual credentials (optional for now)
- [ ] Add fallback to console logging if no credentials

#### Integration Points
- [ ] Update alert creation to send SMS to caregivers
- [ ] Update reminder creation to send push to patient
- [ ] Update daily summary to send email/SMS to caregivers
- [ ] Add notification preferences checking

**Why:** Essential for production, enhances demo if working

### Phase 5: Advanced Filtering & Pagination (1 hour)
- [ ] Add pagination to all list endpoints
- [ ] Add sorting options (created_at, updated_at, name)
- [ ] Add search by name on patients endpoint
- [ ] Add date range filtering on conversations
- [ ] Add severity filtering on alerts
- [ ] Add status filtering on schedules (active/inactive)

**Why:** Better UX for caregivers managing multiple patients

### Phase 6: Error Handling & Validation (1 hour)
- [ ] Add custom exception classes
- [ ] Improve error messages across all endpoints
- [ ] Add input validation error details
- [ ] Add database constraint error handling
- [ ] Add AI service error handling
- [ ] Create error response formatter
- [ ] Add request ID to error responses for debugging

**Why:** Better developer experience, easier debugging

---

## Nice-to-Have (Low Priority, Various Effort) ✨

### Phase 7: Basic Testing Suite (2-3 hours)
- [ ] Setup pytest configuration
- [ ] Add test database configuration
- [ ] Write tests for auth endpoints (login, register, refresh)
- [ ] Write tests for patient CRUD operations
- [ ] Write tests for schedule CRUD operations
- [ ] Write tests for reminder generation job
- [ ] Write tests for AI orchestrator (mocked)
- [ ] Add test coverage reporting

**Why:** Confidence in code quality, catch regressions

### Phase 8: Performance Optimizations (1-2 hours)
- [ ] Add database query optimization
- [ ] Add indexes on frequently queried fields
- [ ] Add database connection pooling tuning
- [ ] Add response caching for patient details
- [ ] Add lazy loading for relationships
- [ ] Profile slow endpoints
- [ ] Add query logging for debugging

**Why:** Better performance under load

### Phase 9: Monitoring & Observability (2 hours)
- [ ] Add structured logging (JSON format)
- [ ] Add request/response logging middleware
- [ ] Add performance timing middleware
- [ ] Create `/metrics` endpoint for Prometheus
- [ ] Add health check with dependency checks (DB, AI services)
- [ ] Add Sentry integration (optional)
- [ ] Add request ID tracking

**Why:** Production readiness, easier debugging

### Phase 10: Security Enhancements (1-2 hours)
- [ ] Add rate limiting middleware (slowapi)
- [ ] Add CORS origin validation
- [ ] Add request size limits
- [ ] Add SQL injection protection validation
- [ ] Add XSS protection headers
- [ ] Add CSRF protection for state-changing operations
- [ ] Add API key rotation mechanism
- [ ] Add password strength validation
- [ ] Add account lockout after failed logins

**Why:** Production security requirements

---

## Advanced Features (Future Enhancements) 🚀

### Phase 11: Enhanced AI Features (3-4 hours)
- [ ] Add conversation context window configuration
- [ ] Add AI model selection per patient
- [ ] Add custom system prompts per patient
- [ ] Add conversation summarization
- [ ] Add sentiment trend analysis
- [ ] Add topic extraction and trending
- [ ] Add proactive conversation starters
- [ ] Add mood tracking over time

**Why:** Better AI personalization

### Phase 12: Advanced Analytics (2-3 hours)
- [ ] Add patient dashboard statistics endpoint
- [ ] Add caregiver dashboard statistics endpoint
- [ ] Add adherence trends (weekly, monthly)
- [ ] Add conversation analytics (topics, sentiment over time)
- [ ] Add alert analytics (frequency, types, resolution time)
- [ ] Add export data endpoints (CSV, JSON)
- [ ] Add date range comparisons

**Why:** Better insights for caregivers

### Phase 13: Multi-tenancy & Scaling (3-4 hours)
- [ ] Add organization model for multi-facility support
- [ ] Add role-based access control (RBAC)
- [ ] Add facility-level admins
- [ ] Add patient transfer between facilities
- [ ] Add data isolation by organization
- [ ] Add organization-level settings
- [ ] Add billing/usage tracking

**Why:** Enterprise readiness

### Phase 14: Data Export & Compliance (2 hours)
- [ ] Add GDPR data export endpoint
- [ ] Add GDPR data deletion endpoint
- [ ] Add data retention policies
- [ ] Add audit log export
- [ ] Add consent tracking
- [ ] Add data anonymization utilities
- [ ] Add HIPAA compliance documentation

**Why:** Legal compliance, data privacy

---

## Recommended Implementation Order

### Week 1: Quick Wins + Communication (Most Impact)
**Day 1-2: Complete Phases 1-3 (2 hours total)**
- Activity monitoring
- Enhanced patient profile
- Caregiver preferences

**Day 3-4: Complete Phase 4 (3 hours)**
- Twilio integration
- Firebase integration
- Notification system

**Day 5: Complete Phase 5 (1 hour)**
- Advanced filtering
- Pagination

**Total: ~6 hours, High impact on demo and production readiness**

### Week 2: Quality & Testing
**Day 1-2: Complete Phase 6-7 (4 hours)**
- Error handling
- Basic testing suite

**Day 3: Complete Phase 8 (2 hours)**
- Performance optimizations

**Day 4-5: Complete Phase 9 (2 hours)**
- Monitoring & observability

**Total: ~8 hours, Major quality improvements**

### Week 3: Security & Advanced Features
**Day 1: Complete Phase 10 (2 hours)**
- Security enhancements

**Day 2-5: Pick from Phases 11-14 based on needs**
- Enhanced AI features
- Advanced analytics
- Multi-tenancy
- Compliance

**Total: ~10 hours, Production and enterprise readiness**

---

## Quick Start Guide

### To Get Started Right Now:

**Option A: Quick Wins (2 hours, maximum demo impact)**
```bash
# 1. Activity Monitoring (30 min)
# Add endpoints, test with Postman

# 2. Enhanced Patient Profile (45 min)
# Add fields, migration, update schemas

# 3. Caregiver Preferences (30 min)
# Add JSONB field, update endpoints
```

**Option B: Communication Services (3 hours, production critical)**
```bash
# 1. Twilio Service (1.5 hours)
# Create service, integrate into alerts

# 2. Firebase Service (1.5 hours)
# Create service, integrate into reminders
```

**Option C: Testing & Quality (3 hours, code confidence)**
```bash
# 1. Error Handling (1 hour)
# Improve error messages

# 2. Basic Tests (2 hours)
# Auth, patients, schedules tests
```

---

## Dependencies & Prerequisites

### For Communication Services (Phase 4):
- [ ] Get Twilio Account SID and Auth Token
- [ ] Get Twilio phone number
- [ ] Get Firebase service account JSON
- [ ] Update .env with credentials

### For Testing (Phase 7):
- [ ] Install pytest: `pip install pytest pytest-asyncio pytest-cov`
- [ ] Create test database
- [ ] Update requirements.txt

### For Monitoring (Phase 9):
- [ ] Install prometheus-client: `pip install prometheus-client`
- [ ] Install sentry-sdk: `pip install sentry-sdk`
- [ ] Get Sentry DSN (optional)

---

## Success Metrics

### After Quick Wins (Phases 1-3):
- ✅ Activity monitoring working
- ✅ Patient profiles have all recommended fields
- ✅ Caregivers can set preferences
- ✅ Database schema 100% complete

### After Communication Services (Phase 4):
- ✅ SMS alerts sent to caregivers
- ✅ Push notifications sent to patients
- ✅ Email summaries working
- ✅ Fallback to console logging if no credentials

### After Testing (Phase 7):
- ✅ 50%+ test coverage
- ✅ All auth flows tested
- ✅ Critical endpoints tested
- ✅ CI/CD can run tests

### After All Phases:
- ✅ Production-ready backend
- ✅ 90%+ test coverage
- ✅ Comprehensive monitoring
- ✅ Enterprise-grade security
- ✅ GDPR/HIPAA compliant

---

## Notes

**Parallel Work:**
- Phases 1-3 can be done while Figma designs are in progress
- Phase 4 needs testing with real devices (mobile app)
- Phases 7-14 can wait until after demo

**Demo Priorities:**
- Must have: Phases 1-3 (Quick wins)
- Should have: Phase 4 (Communication)
- Nice to have: Phase 5-6 (Polish)
- Can skip for demo: Phases 7-14

**Time Estimates:**
- Quick wins: 2 hours
- Communication: 3 hours
- Quality improvements: 8 hours
- Advanced features: 20+ hours

**Total remaining work: ~35 hours for 100% completion**
**Recommended for demo: ~5 hours (Phases 1-4)**
