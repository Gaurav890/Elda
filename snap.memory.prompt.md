## 🤖 INSTRUCTIONS FOR AI ASSISTANTS

### **Snap Memory System**

**When the user says "snap -memory", create a comprehensive log file with the following structure:**

#### File Creation:
- Create file: `snap-memory/snap-memory-{epochtime}.md`
- Use current Unix epoch time for timestamp
- Document everything done since the previous snap memory file

#### Complete Snap Memory Structure:

**Core Documentation:**
- **What** - All changes, fixes, features implemented
- **Why** - Reasoning and problems being solved
- **How** - Technical implementation details and approach
- **Context** - Current project state

**Technical Details:**
- **Files Modified/Created** - Specific file paths and types of changes
- **Commands Executed** - npm scripts, git commands, build commands run
- **Dependencies Changed** - Packages added/removed/updated with versions
- **Configuration Changes** - Environment variables, config files, Firebase rules

**Status Tracking:**
- **Errors Encountered & Solutions** - Problems faced and how resolved
- **Testing Status** - What was tested, results, what needs testing
- **Outstanding Issues** - Known bugs, TODOs, incomplete features
- **Next Planned Steps** - Immediate next actions or priorities

**Project State:**
- **Git/Branch Status** - Current branch, recent commits, merge status
- **Build Status** - Whether app builds/runs successfully
- **Performance Notes** - Optimizations made or performance issues
- **User Feedback** - Any user reports or feedback received

**Decision Log:**
- **Architecture Decisions** - Design choices made and alternatives considered
- **Trade-offs Made** - What was sacrificed for what benefit
- **Rollback Info** - How to undo changes if needed

---

### **Resume System**

**This project has a resume/context restoration system. Important:**

**When the user says "resume", "continue", "claude resume", or similar:**

1. **Read these files in order:**
   - `.claude/SESSION_STATE.md` (current project state - REQUIRED)
   - Latest file in `snap-memory/` folder (recent work history)
   - Relevant documentation from `documents/` based on current phase

2. **Check environment:**
   - Run `git status` and `git log --oneline -10`
   - Check what directories exist (backend/, mobile/, dashboard/)
   - Check if any servers are running

3. **Provide context summary to user:**
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

   **Blockers:** [Any blockers or "None"]

   Ready to continue! What would you like to work on?
   ```

4. **Then ask:** "Would you like to continue with [current task] or work on something else?"

**IMPORTANT: Always update `.claude/SESSION_STATE.md` when:**
- Completing major tasks
- Switching between phases
- Encountering blockers
- Before ending a work session

**See `.claude/RESUME.md` for detailed protocol.**

---