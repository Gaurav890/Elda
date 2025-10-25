# Elder Companion AI - Deployment Architecture

## Overview

This document outlines the complete deployment strategy for the Elder Companion AI system, including all three client applications and external services.

---

## System Components

### 1. Backend + Database
**Platform:** Railway.app
**Repository:** Main backend repository
**URL:** `https://eldercompanion.up.railway.app`

### 2. Web Dashboard (Caregiver Portal)
**Platform:** Vercel
**Repository:** Dashboard repository
**URL:** `https://eldercompanion.vercel.app`

### 3. Mobile App (Patient Application)
**Platform:** Expo Go (for demo) or EAS Build (for production)
**Repository:** Mobile repository
**Distribution:** QR code (Expo Go) or APK/IPA (EAS Build)

---

## Full Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   CLAUDE     │  │    LETTA     │  │   CHROMA     │             │
│  │  (Anthropic) │  │   (Cloud)    │  │  (Hosted/    │             │
│  │              │  │              │  │   Local)     │             │
│  │ - Real-time  │  │ - Long-term  │  │ - Semantic   │             │
│  │   AI         │  │   memory     │  │   search     │             │
│  │ - Analysis   │  │ - Patterns   │  │ - Vector DB  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────────────────┐               │
│  │   TWILIO     │  │       FIREBASE               │               │
│  │              │  │   (Cloud Messaging)          │               │
│  │ - SMS to     │  │                              │               │
│  │   caregivers │  │ - Push notifications         │               │
│  │ - Voice calls│  │   to patient app             │               │
│  └──────────────┘  └──────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND + DATABASE (Railway)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      FASTAPI APPLICATION                      │  │
│  │                                                               │  │
│  │  Core Services:                                               │  │
│  │  - REST API endpoints (v1)                                    │  │
│  │  - JWT authentication                                         │  │
│  │  - Request validation (Pydantic)                              │  │
│  │  - CORS (for mobile + dashboard)                              │  │
│  │                                                               │  │
│  │  Business Logic:                                              │  │
│  │  - Conversation processing pipeline                           │  │
│  │  - Alert creation and dispatch                                │  │
│  │  - Daily summary generation                                   │  │
│  │  - Activity monitoring                                        │  │
│  │                                                               │  │
│  │  Background Jobs (APScheduler):                               │  │
│  │  - Reminder scheduler (check every minute)                    │  │
│  │  - Activity monitor (check every 30 min)                      │  │
│  │  - Daily summary job (runs at midnight)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    POSTGRESQL DATABASE                        │  │
│  │                                                               │  │
│  │  Tables:                                                      │  │
│  │  - patients, caregivers, patient_caregiver_relationship      │  │
│  │  - schedules, reminders                                      │  │
│  │  - conversations, daily_summaries                            │  │
│  │  - alerts, patient_insights                                  │  │
│  │  - activity_logs, system_logs                                │  │
│  │                                                               │  │
│  │  Storage: 500MB (Railway free tier)                          │  │
│  │  Connections: Connection pooling via SQLAlchemy              │  │
│  │  Backups: Automatic daily backups (Railway)                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  URL: https://eldercompanion.up.railway.app/api/v1                │
│  Health Check: /health                                             │
│  API Docs: /docs (Swagger UI)                                      │
│  Logs: Railway dashboard                                           │
└─────────────────────────────────────────────────────────────────────┘
                     ↕                              ↕
┌──────────────────────────────────┐  ┌──────────────────────────────┐
│  CAREGIVER WEB DASHBOARD         │  │  PATIENT MOBILE APP          │
│  (Vercel)                        │  │  (Expo)                      │
├──────────────────────────────────┤  ├──────────────────────────────┤
│                                  │  │                              │
│  Framework: Next.js 14           │  │  Framework: React Native     │
│  Styling: Tailwind CSS           │  │  Voice: react-native-voice   │
│  State: React Query              │  │  Speech: expo-speech         │
│                                  │  │  Background: background-fetch│
│  Features:                       │  │                              │
│  - Patient management            │  │  Features:                   │
│  - Schedule configuration        │  │  - Voice interaction         │
│  - Real-time monitoring          │  │  - Reminder notifications    │
│    (polling every 5-10s)         │  │  - Emergency button          │
│  - Alert management              │  │  - Activity tracking         │
│  - Conversation history          │  │    (heartbeat every 15 min)  │
│  - Chroma semantic search        │  │                              │
│  - Daily summaries               │  │  Distribution:               │
│  - Letta insights                │  │  - Expo Go (scan QR)         │
│                                  │  │  - EAS Build (APK/IPA)       │
│  URL:                            │  │                              │
│  https://eldercompanion.         │  │  Demo Device:                │
│  vercel.app                      │  │  Physical phone required     │
│                                  │  │  (for voice testing)         │
└──────────────────────────────────┘  └──────────────────────────────┘
```

---

## Component 1: Backend Deployment (Railway)

### Prerequisites
- GitHub account
- Railway account (no credit card required for free tier)
- Environment variables prepared

### Step-by-Step Deployment

#### 1. Initial Setup (15-20 minutes)

```bash
# 1. Create Railway account
# Go to: https://railway.app
# Sign up with GitHub

# 2. Create new project
# - Click "New Project"
# - Select "Deploy from GitHub repo"
# - Connect your backend repository
# - Railway auto-detects Python/FastAPI

# 3. Add PostgreSQL database
# - Click "New" → "Database" → "PostgreSQL"
# - Railway provisions database automatically
# - DATABASE_URL is auto-generated and injected
```

#### 2. Configure Environment Variables

In Railway dashboard, add these variables:

```bash
# Application
APP_ENV=production
SECRET_KEY=<generate-strong-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database (auto-generated by Railway)
DATABASE_URL=postgresql://user:password@host:port/dbname

# AI Services
CLAUDE_API_KEY=sk-ant-...
LETTA_API_KEY=letta_...
CHROMA_HOST=localhost  # or hosted Chroma URL
CHROMA_PORT=8000

# Communication Services
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Firebase
FIREBASE_SERVER_KEY=...
FIREBASE_PROJECT_ID=...

# Optional
VAPI_API_KEY=...  # If using Vapi
```

#### 3. Create Railway Configuration File

**File: `railway.json`** (in repository root)

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30
  }
}
```

#### 4. Create Procfile (Optional but recommended)

**File: `Procfile`**

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
release: alembic upgrade head
```

#### 5. Database Migrations

```bash
# After first deployment, run migrations
# In Railway dashboard, open terminal and run:
alembic upgrade head

# Or set up automatic migrations on deploy (recommended)
# Add to railway.json:
{
  "deploy": {
    "releaseCommand": "alembic upgrade head"
  }
}
```

#### 6. Verify Deployment

```bash
# Check health endpoint
curl https://eldercompanion.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-24T14:30:00Z"
}

# Check API docs
# Visit: https://eldercompanion.up.railway.app/docs
```

### Monitoring & Debugging

**Railway Dashboard Features:**
- **Logs:** Real-time application logs
- **Metrics:** CPU, memory, network usage
- **Deployments:** History of all deployments
- **Variables:** Environment variable management

**Important Endpoints to Monitor:**
```bash
GET /health                 # Health check
GET /api/v1/docs            # API documentation
POST /api/v1/auth/login     # Authentication test
GET /api/v1/patients        # Data fetch test
```

### Troubleshooting Common Issues

**Issue 1: Database connection fails**
```bash
# Solution: Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/dbname
# Railway provides this automatically
```

**Issue 2: APScheduler not running**
```bash
# Solution: Check logs for scheduler initialization
# Ensure APScheduler is started in main.py
```

**Issue 3: Cold starts**
```bash
# Solution: Railway free tier may have cold starts after inactivity
# For demo, keep the app "warm" by making requests every 5 minutes
```

---

## Component 2: Web Dashboard Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository for dashboard
- Backend API URL from Railway

### Step-by-Step Deployment

#### 1. Initial Setup (10-15 minutes)

```bash
# 1. Create Vercel account
# Go to: https://vercel.com
# Sign up with GitHub

# 2. Import repository
# - Click "New Project"
# - Import your dashboard repository
# - Vercel auto-detects Next.js

# 3. Configure project
# - Root directory: ./ (or dashboard/ if monorepo)
# - Build command: next build
# - Output directory: .next
# - Install command: npm install
```

#### 2. Configure Environment Variables

In Vercel dashboard, add:

```bash
# Backend API URL (from Railway)
NEXT_PUBLIC_API_URL=https://eldercompanion.up.railway.app/api/v1

# Optional: Analytics, monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

#### 3. Deploy

```bash
# Automatic deployment
# - Push to main branch
# - Vercel auto-deploys
# - URL: https://eldercompanion.vercel.app

# Manual deployment (optional)
npm install -g vercel
vercel deploy
```

#### 4. Verify Deployment

```bash
# Visit: https://eldercompanion.vercel.app
# Test:
# 1. Can you load the login page?
# 2. Can you register a new account?
# 3. Can you see patients list?
# 4. Does polling work (check Network tab)?
```

### Custom Domain (Optional)

```bash
# In Vercel dashboard:
# Settings → Domains → Add Domain
# Follow DNS configuration instructions
# Example: eldercompanion.yourdomain.com
```

---

## Component 3: Mobile App Deployment

### Option A: Expo Go (Recommended for Demo)

**Pros:**
- ✅ No build required
- ✅ Instant deployment
- ✅ Easy testing
- ✅ No Apple Developer account needed

**Cons:**
- ⚠️ Expo Go branding visible
- ⚠️ Limited to Expo SDK features

**Steps:**

```bash
# 1. Install Expo Go on demo device
# iOS: https://apps.apple.com/app/expo-go/id982107779
# Android: https://play.google.com/store/apps/details?id=host.exp.exponent

# 2. Start development server
cd mobile
npx expo start

# 3. Scan QR code with device
# iOS: Use Camera app
# Android: Use Expo Go app scanner

# 4. App loads on device instantly
```

### Option B: EAS Build (Production-Like)

**Pros:**
- ✅ Looks like real app
- ✅ Custom splash screen and icon
- ✅ No Expo Go branding

**Cons:**
- ⚠️ Build time: 15-20 minutes
- ⚠️ Requires Apple Developer account for iOS ($99/year)
- ⚠️ More complex setup

**Steps:**

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo account
eas login

# 3. Configure EAS
eas build:configure

# 4. Build for Android (easier, no special requirements)
eas build --platform android --profile development

# 5. Download APK after build completes
# Install on Android device

# 6. For iOS (requires Apple Developer account)
eas build --platform ios --profile development
# Download and install via TestFlight
```

### Updating Mobile App API URL

**File: `mobile/app/config.js`**

```javascript
export const API_URL = __DEV__
  ? 'http://localhost:8000/api/v1'  // Development
  : 'https://eldercompanion.up.railway.app/api/v1';  // Production

export const WS_URL = __DEV__
  ? 'ws://localhost:8000/ws'
  : 'wss://eldercompanion.up.railway.app/ws';
```

---

## External Services Configuration

### 1. Claude API (Anthropic)

```bash
# Get API key from: https://console.anthropic.com
# Add to Railway environment variables:
CLAUDE_API_KEY=sk-ant-...

# Usage limits (check your plan):
# - Free tier: Limited requests
# - Pay-as-you-go: Recommended for hackathon
```

### 2. Letta Cloud

```bash
# Get API key from: https://www.letta.com
# Add to Railway environment variables:
LETTA_API_KEY=letta_...

# Create agent per patient via API
# Store agent_id in patient.letta_agent_id field
```

### 3. Chroma (Vector Database)

**Option A: Local (on Railway with backend)**

```bash
# Install chromadb in requirements.txt
chromadb==0.4.18

# Initialize in backend
# Chroma stores data in /app/.chroma directory on Railway
```

**Option B: Hosted Chroma**

```bash
# If using hosted Chroma service:
CHROMA_HOST=https://your-chroma-instance.com
CHROMA_PORT=8000

# Configure in backend/app/core/config.py
```

### 4. Twilio (SMS & Voice Calls)

```bash
# Get account from: https://www.twilio.com
# Use trial account (free credits) for demo

# Configuration:
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio number

# Webhook URLs (set in Twilio console):
# SMS Status Callback: https://eldercompanion.up.railway.app/api/v1/webhooks/twilio/sms
# Voice Status Callback: https://eldercompanion.up.railway.app/api/v1/webhooks/twilio/voice

# Test SMS:
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json \
  --data-urlencode "Body=Test alert" \
  --data-urlencode "From=+1234567890" \
  --data-urlencode "To=+1234567890" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

### 5. Firebase Cloud Messaging

```bash
# Setup Firebase project: https://console.firebase.google.com

# 1. Create new project
# 2. Add Android/iOS app
# 3. Download service account key (JSON)
# 4. Add to Railway as secret file or environment variable

# Configuration:
FIREBASE_SERVER_KEY=...
FIREBASE_PROJECT_ID=...

# Mobile app configuration:
# Add google-services.json (Android) or GoogleService-Info.plist (iOS)
# to mobile app project
```

---

## Deployment Checklist

### Pre-Deployment (Before Demo Day)

- [ ] Backend repository pushed to GitHub
- [ ] Dashboard repository pushed to GitHub
- [ ] Mobile repository pushed to GitHub
- [ ] All API keys obtained
- [ ] Test data prepared (sample patient, schedules)
- [ ] Railway account created
- [ ] Vercel account created
- [ ] Expo account created (if using EAS Build)

### Backend Deployment

- [ ] Railway project created
- [ ] PostgreSQL database provisioned
- [ ] Environment variables configured
- [ ] Railway configuration files added (railway.json)
- [ ] Database migrations run
- [ ] Health check endpoint working
- [ ] API documentation accessible at /docs
- [ ] APScheduler running (check logs)
- [ ] Test API calls with Postman

### Dashboard Deployment

- [ ] Vercel project created
- [ ] Environment variables configured (API URL)
- [ ] Build successful
- [ ] Login/register works
- [ ] Can fetch data from backend API
- [ ] Polling works (check Network tab)
- [ ] No console errors

### Mobile Deployment

- [ ] Expo Go installed on demo device
- [ ] API URL updated for production
- [ ] Firebase configured
- [ ] Push notifications working
- [ ] Voice recognition working
- [ ] TTS working
- [ ] Heartbeat sending
- [ ] Emergency button works

### External Services

- [ ] Claude API key working
- [ ] Letta API key working
- [ ] Chroma initialized (local or hosted)
- [ ] Twilio SMS sending working
- [ ] Twilio voice calls working
- [ ] Firebase push notifications working

---

## Post-Deployment Monitoring

### Day of Demo

**1 Hour Before Judging:**

```bash
# Backend health check
curl https://eldercompanion.up.railway.app/health

# Dashboard accessibility
curl https://eldercompanion.vercel.app

# Check Railway logs for errors
# Check Vercel logs for errors
# Test end-to-end flow on mobile device
```

**During Demo:**

- Keep Railway dashboard open (monitor for errors)
- Have backup demo video ready
- Have Postman collection ready (backup to show API)

**Post-Demo:**

- Keep services running for follow-up questions
- Monitor for any crashes
- Check logs for unusual activity

---

## Scaling Considerations (Post-Hackathon)

If project continues beyond hackathon:

### Database
- Upgrade Railway plan for more storage
- Add read replicas for scaling
- Implement caching (Redis)

### Backend
- Add load balancer
- Implement rate limiting
- Add monitoring (Sentry, DataDog)
- Optimize APScheduler with job queueing (Celery)

### Dashboard
- Add CDN for assets
- Implement WebSockets for real-time updates
- Add caching layer

### Mobile
- Publish to App Store / Play Store
- Implement proper push notification service
- Add crash reporting (Sentry)

---

## Cost Breakdown (Hackathon Budget)

### Free Tier Services
- ✅ Railway: Free tier (500MB database)
- ✅ Vercel: Free tier (unlimited deployments)
- ✅ Expo: Free tier
- ✅ Firebase: Free tier (sufficient for demo)

### Paid Services (Required)
- Claude API: Pay-as-you-go (~$5-10 for demo)
- Letta Cloud: Check pricing (may have free tier)
- Twilio: Trial account with free credits

### Total Estimated Cost for Hackathon
**$10-20** (mostly Claude API usage)

---

## Backup & Disaster Recovery

### Backup Strategy

**Database:**
- Railway provides automatic daily backups
- Manual backup before demo:
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```

**Code:**
- All code in GitHub (automatic backup)
- Tag demo version: `git tag v1.0-demo`

**Environment Variables:**
- Export from Railway dashboard
- Store securely in password manager

### Disaster Recovery Plan

**Backend Down:**
- Have backup demo video ready
- Show Postman API collection
- Walk through code architecture

**Mobile App Crash:**
- Have backup device with app pre-loaded
- Show dashboard instead
- Have screen recording of mobile flow

**WiFi Issues:**
- Use mobile hotspot
- Have offline demo video
- Show static screenshots

---

## Contact & Support

### During Hackathon

**Railway Support:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

**Vercel Support:**
- Discord: https://discord.gg/vercel
- Docs: https://vercel.com/docs

**Expo Support:**
- Discord: https://discord.gg/expo
- Docs: https://docs.expo.dev

### Post-Hackathon

- GitHub Issues: For bug reports
- Documentation: Keep this file updated
- Team Contact: [Add team contact info]

---

## Conclusion

This deployment architecture is optimized for:
- ✅ **Speed:** Deploy in < 2 hours
- ✅ **Cost:** Mostly free tier services
- ✅ **Reliability:** Auto-restarts, health checks
- ✅ **Scalability:** Can upgrade all services post-hackathon

**Last Updated:** 2025-10-24
**Maintained By:** Elder Companion AI Team
