# 🤖 Claude Resume System

This folder contains the resume/context restoration system for Claude Code.

---

## 🚀 Quick Start

### To Resume Work After a Break:

Simply type one of these commands to Claude:

```
resume
```

or

```
claude resume
```

or

```
continue
```

Claude will automatically:
1. ✅ Read the current session state
2. ✅ Check latest snap memory
3. ✅ Review relevant documentation
4. ✅ Check git status
5. ✅ Summarize where you left off
6. ✅ Suggest next steps

---

## 📁 Files in This Folder

### `RESUME.md`
**Purpose:** Instructions for Claude on how to restore context

**What it contains:**
- Step-by-step protocol for context restoration
- Which files to read based on current phase
- How to summarize context to you
- Example resume flow

**You don't need to read this** - it's for Claude.

### `SESSION_STATE.md`
**Purpose:** Current state of the project (updated continuously)

**What it contains:**
- ✅ What's been completed
- 🚧 What's in progress
- 🔜 What's next (priority order)
- 🚫 Current blockers
- 📊 Phase progress (0-100%)
- 🎯 Success criteria by phase
- 💡 Important decisions and context
- 🕐 Time tracking

**You CAN read this** if you want to see current status, but Claude will summarize it for you when you say `resume`.

### `README.md` (this file)
**Purpose:** Explains the resume system to you (the user)

---

## 🔄 How It Works

### When You Take a Break:

**Claude automatically updates `SESSION_STATE.md`** with:
- What was just completed
- What's currently in progress
- What should happen next
- Any blockers encountered

**If significant work was done, Claude creates a snap memory** in:
```
/Users/gaurav/Elda/snap-memory/snap-memory-{timestamp}.md
```

### When You Resume:

**You say:** `resume`

**Claude does:**
1. Reads `SESSION_STATE.md` to see current state
2. Reads latest snap memory to understand recent work
3. Checks git status to see what files changed
4. Reviews relevant documentation for current phase
5. Provides you with a summary like this:

```markdown
## 🔄 Context Restored

**Current Phase:** Backend Development - API Endpoints
**Last Updated:** 2 hours ago

**Completed:**
- Backend setup complete
- Database models created
- Authentication working

**In Progress:**
- Patient CRUD endpoints (2 of 4 done)

**Next Steps:**
- Complete patient PUT and DELETE
- Test with Postman
- Move to schedule endpoints

**Blockers:** None

Ready to continue! Shall we finish the patient endpoints?
```

**You respond:** "Yes" or provide new direction

**Claude continues** from exactly where you left off!

---

## 🎯 Benefits

### For You:
- ✅ No need to re-explain context every time
- ✅ Claude remembers where you left off
- ✅ No context loss between sessions
- ✅ Faster ramp-up time (seconds, not minutes)
- ✅ Clear visibility into project progress

### For Claude:
- ✅ Efficient context loading (only reads what's needed)
- ✅ Phase-specific documentation loading
- ✅ Clear understanding of current state
- ✅ Knows what to suggest next

---

## 📊 Session State Tracking

The `SESSION_STATE.md` file is automatically updated when:
- ✅ Completing a major phase
- ✅ Switching between major tasks
- ✅ Encountering a blocker
- ✅ Before Claude says goodbye for the session

**You can also manually check progress** by opening `SESSION_STATE.md`.

---

## 🎬 Example Usage

### Scenario 1: Resume After Lunch

**Before lunch:**
```
You: "I need to take a break"
Claude: "No problem! I've updated SESSION_STATE.md. We were working on
        patient CRUD endpoints - completed GET and POST, need PUT and DELETE next.
        Type 'resume' when you're back!"
```

**After lunch:**
```
You: "resume"
Claude: [Reads SESSION_STATE.md and latest snap memory]

        "🔄 Context Restored

        Current Phase: Backend Development - API Endpoints

        Completed:
        - Patient GET and POST endpoints

        In Progress:
        - Patient PUT and DELETE endpoints

        Next Steps:
        - Implement PUT endpoint
        - Implement DELETE endpoint
        - Test with Postman

        Ready to continue! Let's implement the PUT endpoint."
```

### Scenario 2: Resume Next Day

**End of Day 1:**
```
You: "I'm done for today"
Claude: "Great work! I've created a snap memory and updated SESSION_STATE.md.

        Today we completed:
        - Backend setup
        - Database models (11 tables)
        - Authentication endpoints
        - Patient CRUD endpoints

        Tomorrow we should:
        - Schedule endpoints
        - AI service integration

        See you tomorrow!"
```

**Start of Day 2:**
```
You: "resume"
Claude: [Reads SESSION_STATE.md + latest snap memory + checks git]

        "🔄 Context Restored

        Current Phase: Backend Development - Core API
        Last Updated: 16 hours ago

        Completed Yesterday:
        - ✅ Backend setup with FastAPI
        - ✅ 11 database tables created
        - ✅ Authentication working
        - ✅ Patient CRUD complete

        Today's Plan:
        - Schedule CRUD endpoints
        - Begin AI service integration (Claude, Letta, Chroma)

        Blockers: None

        Good morning! Ready to start on the schedule endpoints?"
```

### Scenario 3: Context Window Ran Out

**Claude Code hits context limit and conversation is summarized:**
```
[New conversation started with summary]

You: "resume"
Claude: [Reads SESSION_STATE.md + latest snap memory]

        "🔄 Context Restored

        I see we were in the middle of implementing the conversation pipeline.

        Current Phase: Backend Development - Conversation Pipeline

        Completed:
        - ✅ Claude service (analyze_conversation method)
        - ✅ Letta service (all methods)
        - ✅ Chroma service (semantic search working)

        In Progress:
        - Conversation service integration (80% done)
        - Need to add Chroma query to pipeline

        Next Steps:
        - Add Chroma find_similar_situations call
        - Test complete pipeline
        - Verify < 5 second response time

        Let's finish the Chroma integration in conversation_service.py!"
```

---

## 🛠️ Advanced Usage

### Check Current Status Without Claude

Open `SESSION_STATE.md` to see:
- Current phase and progress
- What's completed
- What's in progress
- What's next
- Any blockers

### Update Session State Manually

If Claude forgets to update `SESSION_STATE.md`, you can:
1. Ask Claude: "Update SESSION_STATE.md with current progress"
2. Or manually edit the file (it's just markdown)

### Force Full Context Reload

If you want Claude to read ALL documentation:
```
You: "Resume with full context - read all documentation"
Claude: [Reads everything, not just relevant files]
```

### Resume from Specific Snap Memory

```
You: "Resume from snap-memory-1761362238.md"
Claude: [Loads that specific snap memory instead of latest]
```

---

## 📝 File Update Schedule

### `SESSION_STATE.md` Updates:
- ✅ After completing each major task
- ✅ When switching between phases
- ✅ Before ending a session
- ✅ When encountering blockers

### Snap Memory Creation:
- ✅ End of significant work session
- ✅ Before major phase transitions
- ✅ When specifically requested by user
- ✅ When context is about to reset

---

## 🔧 Maintenance

### This system requires:
1. **Claude updates SESSION_STATE.md regularly**
   - Claude should do this automatically
   - If not, remind: "Update session state"

2. **Snap memories created at good checkpoints**
   - Claude should do this when ending significant work
   - You can request: "snap -memory"

3. **SESSION_STATE.md stays current**
   - Should reflect actual state of project
   - If stale, Claude will ask for updates

---

## 🎯 Pro Tips

### For Maximum Efficiency:

1. **Say "resume" at start of every session**
   - Even if you think Claude remembers
   - Ensures Claude has latest state

2. **Let Claude update SESSION_STATE.md**
   - It happens automatically
   - Don't worry about doing it manually

3. **Create snap memory before long breaks**
   - End of work day: "snap -memory"
   - Before major phase transitions: "snap -memory"
   - Creates comprehensive record

4. **Use SESSION_STATE.md as your todo list**
   - Check "What's Next" section to see priorities
   - Clear view of progress

5. **If Claude seems confused**
   - Say "resume" to reset context
   - Or "read SESSION_STATE.md and summarize"

---

## 📚 Related Files

**Session State:**
- `.claude/SESSION_STATE.md` - Current state (this folder)

**Snap Memories:**
- `snap-memory/snap-memory-*.md` - Historical records (parent folder)

**Documentation:**
- `documents/` - All project documentation (parent folder)

**Resume Protocol:**
- `.claude/RESUME.md` - Instructions for Claude (this folder)

---

## 🆘 Troubleshooting

### Problem: Claude doesn't remember context
**Solution:** Type `resume`

### Problem: SESSION_STATE.md is out of date
**Solution:** Ask Claude: "Update SESSION_STATE.md with current progress"

### Problem: Claude is reading too much
**Solution:** Claude should only read relevant files based on phase. If over-reading, the RESUME.md protocol might need adjustment.

### Problem: Session state is wrong
**Solution:** Manually edit `SESSION_STATE.md` or tell Claude: "Current state is actually [describe], please update SESSION_STATE.md"

---

## ✨ System Benefits

This resume system provides:

- ✅ **Fast context restoration** (< 30 seconds)
- ✅ **Minimal context usage** (only reads what's needed)
- ✅ **Clear progress tracking** (always know where you are)
- ✅ **Seamless session transitions** (no lost work)
- ✅ **Efficient Claude usage** (doesn't waste time re-reading everything)
- ✅ **Better project visibility** (clear status at all times)

---

**System created:** 2025-10-24
**Location:** `/Users/gaurav/Elda/.claude/`
**Status:** ✅ Active and ready to use

**To resume work, simply type:** `resume`
