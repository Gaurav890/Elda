# 🔄 Claude Code Resume System

## Instructions for AI Assistant (Claude)

**When the user says `resume` or `claude resume`, follow this protocol to restore full context:**

---

## Context Restoration Protocol

### Step 1: Read Core Project Files (In Order)
Read these files to understand the project:

1. **`/Users/gaurav/Elda/.claude/SESSION_STATE.md`**
   - Current project state
   - What's been completed
   - What's in progress
   - What's next
   - Current blockers

2. **`/Users/gaurav/Elda/context.md`** (sections as needed)
   - Main project specification
   - Read specific sections based on current phase from SESSION_STATE.md
   - Don't read entire file (6,187 lines) - focus on relevant sections

3. **Latest Snap Memory**
   - Check `/Users/gaurav/Elda/snap-memory/` for most recent file
   - Read latest snap memory to understand recent work
   - Provides comprehensive context of last session

4. **Documentation Based on Current Phase**
   - Check SESSION_STATE.md for current phase
   - Read relevant documentation:
     - **Setup Phase:** deployment.md, file-structure.md
     - **Backend Phase:** architecture.md, file-structure.md (backend section)
     - **AI Integration Phase:** architecture.md (AI integration section)
     - **Frontend Phase:** file-structure.md (mobile/dashboard sections)
     - **Testing Phase:** postman-collections.md
     - **Demo Prep:** All docs in documents/

### Step 2: Check Git Status
Run these commands to understand current state:
```bash
git status
git log --oneline -10
git branch
```

### Step 3: Check Current Environment
Based on SESSION_STATE.md, check what exists:
```bash
# Check if backend exists
ls -la backend/ 2>/dev/null || echo "Backend not created yet"

# Check if mobile exists
ls -la mobile/ 2>/dev/null || echo "Mobile not created yet"

# Check if dashboard exists
ls -la dashboard/ 2>/dev/null || echo "Dashboard not created yet"

# Check if any servers are running
lsof -ti:8000 || echo "No backend server running"
```

### Step 4: Summarize Context to User
Provide a brief summary:
```markdown
## 🔄 Context Restored

**Current Phase:** [from SESSION_STATE.md]
**Last Updated:** [timestamp from SESSION_STATE.md]

**Completed:**
- [List from SESSION_STATE.md]

**In Progress:**
- [Current task from SESSION_STATE.md]

**Next Steps:**
- [Next 2-3 items from SESSION_STATE.md]

**Blockers:** [Any blockers from SESSION_STATE.md or "None"]

Ready to continue! What would you like to work on?
```

### Step 5: Ask Clarifying Question (If Needed)
If SESSION_STATE.md indicates work was in progress, ask:
- "Would you like to continue with [current task]?"
- "Or would you prefer to work on something else?"

---

## Quick Context Files Reference

**Essential Files (Always Read):**
- `.claude/SESSION_STATE.md` - Current state (REQUIRED)
- Latest snap memory file - Last session details
- `documents/file-structure.md` - Project structure

**Phase-Specific Files:**

**Planning Phase:**
- All files in `documents/`
- `context.md` (overview sections)

**Setup Phase:**
- `documents/deployment.md`
- `documents/file-structure.md`
- `context.md` (tech stack section)

**Backend Development Phase:**
- `documents/architecture.md` (backend section)
- `documents/file-structure.md` (backend section)
- `documents/postman-collections.md`

**AI Integration Phase:**
- `documents/architecture.md` (AI integration section)
- `context.md` (AI services sections)

**Mobile Development Phase:**
- `documents/mobile-backend-communication.md`
- `documents/file-structure.md` (mobile section)
- `documents/architecture.md` (mobile flows)

**Dashboard Development Phase:**
- `documents/file-structure.md` (dashboard section)
- `documents/architecture.md` (dashboard section)

**Testing Phase:**
- `documents/postman-collections.md`
- Test files in respective directories

**Demo Preparation Phase:**
- `documents/architecture.md` (data flows)
- `context.md` (demo script section)
- All snap memories for history

---

## Session State File Location

**Primary:** `/Users/gaurav/Elda/.claude/SESSION_STATE.md`

This file is updated:
- After completing each major phase
- When switching between major tasks
- Before ending a work session
- When encountering blockers

---

## Resume Command Variations

User might say:
- `resume`
- `claude resume`
- `continue`
- `restore context`
- `where were we?`
- `catch up`

All should trigger this context restoration protocol.

---

## Notes for AI Assistant

- **Be efficient:** Don't read entire context.md (6,187 lines)
- **Be focused:** Read only what's needed for current phase
- **Be quick:** Aim to restore context in < 30 seconds
- **Be helpful:** Provide clear summary of where we are
- **Be proactive:** Suggest next steps based on SESSION_STATE.md

---

## Example Resume Flow

```
User: "resume"

AI Actions:
1. Read .claude/SESSION_STATE.md
   → Current phase: "Backend Development - Phase 3 (API Endpoints)"
   → Last task: "Implementing patient CRUD endpoints"
   → Status: "In progress - completed GET and POST, need PUT and DELETE"

2. Read latest snap memory (snap-memory-1761362238.md)
   → Understand planning phase decisions

3. Read documents/architecture.md (API section)
   → Refresh on API design

4. Check git status
   → See backend/ directory exists
   → See recent commits on patient endpoints

5. Summarize to user:
   "## 🔄 Context Restored

   **Current Phase:** Backend Development - API Endpoints
   **Last Updated:** 2 hours ago

   **Completed:**
   - Backend setup with FastAPI
   - Database models created (11 tables)
   - Authentication endpoints (register, login, refresh)
   - Patient GET and POST endpoints

   **In Progress:**
   - Patient CRUD endpoints (need PUT and DELETE)

   **Next Steps:**
   - Complete patient PUT and DELETE endpoints
   - Test with Postman
   - Move to schedule endpoints

   **Blockers:** None

   Ready to continue! Shall we finish the patient PUT and DELETE endpoints?"

User: "Yes, let's continue"

AI: Proceeds with implementation...
```

---

## Important Reminders

1. **Always update SESSION_STATE.md** when completing tasks
2. **Create snap memory** when ending significant work session
3. **This system only works if SESSION_STATE.md is kept current**
4. **If SESSION_STATE.md is stale, ask user for current state before proceeding**

---

*Resume system created: 2025-10-24*
*Location: /Users/gaurav/Elda/.claude/RESUME.md*
