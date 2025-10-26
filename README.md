# Elder Companion AI - Documentation Hub

## Overview

This folder contains all essential documentation for the Elder Companion AI backend development. All documents are organized and ready for reference throughout development.

**Last Updated:** 2025-10-24

---

## Document Structure

```
documents/
├── README.md                    # This file - navigation hub
├── architecture.md              # Complete system architecture
├── deployment.md                # Full deployment guide (Railway + Vercel + Expo)
├── file-structure.md            # Backend file structure (update when changes occur)
└── (future documents)
```

---

## Quick Navigation

###  Architecture & Design

**[architecture.md](./architecture.md)**
- High-level system architecture
- Component interactions
- Data flow diagrams (reminders, conversations, emergencies)
- AI integration architecture (Claude + Letta + Chroma)
- Database schema with relationships
- API architecture
- Security architecture
- Background jobs (APScheduler)

**When to use:** Understanding how components interact, planning new features, debugging cross-system issues

---

###  Deployment

**[deployment.md](./deployment.md)**
- Complete deployment architecture diagram
- Step-by-step Railway deployment (backend + PostgreSQL)
- Step-by-step Vercel deployment (web dashboard)
- Mobile app deployment (Expo Go vs EAS Build)
- External services configuration (Claude, Letta, Chroma, Twilio, Firebase)
- Environment variables guide
- Post-deployment checklist
- Monitoring and debugging
- Cost breakdown (~$10-20 for hackathon)

**When to use:** Deploying to production, configuring external services, troubleshooting deployment issues

---

###  File Structure

**[file-structure.md](./file-structure.md)**
- Complete backend file structure tree
- Purpose of each directory and key files
- Import conventions
- Testing structure
- Database migrations
- Configuration files
- **IMPORTANT:** Update this file whenever you add/remove/reorganize files

**When to use:** Finding where to add new code, understanding project organization, onboarding new developers


## Key Context Files (Root Level)

### context.md
**Location:** `/Users/gaurav/Elda/context.md`

**What's inside:**
- Complete project specification (6,187 lines)
- All features, requirements, and implementation details
- AI integration strategy (Claude + Letta + Chroma working together)
- Database schema (11 tables)
- API design
- Implementation timeline (20 hours)
- Testing strategy
- Demo preparation

**Recent updates:**
-  Chroma integrated as REQUIRED component (not optional)
-  Clear explanation of how Chroma and Letta complement each other
-  Updated implementation timeline to include Chroma in Hours 10-13
-  Enhanced judging criteria section for Chroma prize ($200/person)

**When to use:** Reference for any project detail, planning work, understanding requirements

---

## How Chroma, Letta, and Claude Work Together

**Updated in context.md to show complementary roles (NOT contradictory):**

### Claude (Anthropic)
**Role:** Real-time understanding and response generation
**What it does:**
- Analyzes patient messages RIGHT NOW
- Understands intent, emotion, urgency
- Generates appropriate responses
- Detects emergencies

### Letta (Cloud)
**Role:** Long-term memory and pattern recognition
**What it stores:**
- Patient preferences (name, communication style)
- Behavioral patterns (response times, reliability)
- Health patterns (recurring mentions)
- Family context

### Chroma (Vector DB)
**Role:** Semantic search engine
**What it enables:**
- Find conversations by MEANING, not just keywords
- Search: "knee pain" → finds "leg hurts", "trouble walking", "knee bothering"
- Provide evidence for Letta's patterns
- Power dashboard search feature

### How They Collaborate (Not Duplicate):
1. **Patient says:** "I'm feeling dizzy"
2. **Letta provides:** "Patient has dizziness pattern, usually afternoons, often dehydration"
3. **Chroma provides:** "Here are the 5 specific past conversations about dizziness"
4. **Claude analyzes:** Uses both Letta's pattern + Chroma's evidence → Generates informed response
5. **Result:** Better care through complementary AI capabilities

**Key Insight:**
- Letta = Abstract patterns ("patient tends to...")
- Chroma = Concrete evidence ("here are the specific times...")
- Claude = Real-time understanding with full context

## Important Reminders

### For Claude Code (AI Assistant):

1. **Always check these documents** before starting work:
   - `architecture.md` - Understand how components interact
   - `file-structure.md` - Know where to add code
   - `context.md` - Full project requirements

2. **Update file-structure.md** whenever you:
   - Add new files
   - Remove files
   - Reorganize directories

3. **Reference postman-collections.md** when:
   - Testing API endpoints
   - Need to know request/response formats

4. **Check deployment.md** before:
   - Deploying to Railway/Vercel
   - Configuring external services

### For Developers:

1. **Start here:** Read this README first for navigation
2. **Understand architecture:** Read architecture.md
3. **Before coding:** Check file-structure.md to know where code goes
4. **Testing:** Use postman-collections.md to test your work
5. **Deploying:** Follow deployment.md step-by-step

---

## Questions & Support

### During Development

**"Where should I add X feature?"**
→ Check `architecture.md` for component design
→ Check `file-structure.md` for file locations

**"How do I test this endpoint?"**
→ Check `postman-collections.md` for test collections

**"How do I deploy?"**
→ Follow `deployment.md` step-by-step

**"What are the requirements for X?"**
→ Check `context.md` (main specification)

### Common Issues

**"I can't find where to add Chroma integration"**
→ `file-structure.md` → `app/services/ai/chroma_service.py`
→ `architecture.md` → See AI integration architecture

**"How do Claude, Letta, and Chroma work together?"**
→ `architecture.md` → "AI Integration Architecture" section
→ `context.md` → "AI Integration Strategy" section

**"What's the deployment order?"**
→ `deployment.md` → Backend → Dashboard → Mobile

---

## Document Maintenance

### Updating These Docs

**When to update:**
- Architecture changes → Update `architecture.md`
- File structure changes → Update `file-structure.md` (CRITICAL!)
- New API endpoints → Update `postman-collections.md`
- Deployment process changes → Update `deployment.md`

**How to update:**
- Edit the specific .md file
- Update "Last Updated" date at top
- Add entry to change log (if file has one)

## Contact

**Project:** Elder Companion AI
**Purpose:** Hackathon submission for multiple prizes
**Timeline:** 20 hours implementation
**Target:** Social Impact + Best Use of Claude + Best Use of Letta + Best AI Application Using Chroma

**Team:** Gaurav Chaulagain, Prelisa Dahal, Medhavee Upadhyaya

---

**Remember:** This is meaningful work. You're building technology that could prevent someone's grandmother from ending up in the hospital. That's worth fighting for! 🚀

**Last Updated:** 2025-10-24
