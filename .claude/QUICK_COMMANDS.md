# ⚡ Quick Commands Cheat Sheet

Quick reference for commands you can use with Claude Code.

---

## 🔄 Context Management

### Resume Work
```
resume
```
**What it does:** Restores full context from last session, shows current state, suggests next steps

**When to use:** Start of every work session, after breaks, when Claude seems lost

**Aliases:**
- `claude resume`
- `continue`
- `restore context`
- `where were we?`
- `catch up`

---

### Create Snap Memory
```
snap -memory
```
**What it does:** Creates comprehensive log of all work done since last snap memory

**When to use:**
- End of work session
- Completed major phase
- Before long break
- Before ending for the day

**Output:** Creates `snap-memory/snap-memory-{timestamp}.md`

---

## 📊 Status & Progress

### Check Current Status
```
What's the current status?
```
or
```
Show me the progress
```

**What Claude does:** Reads SESSION_STATE.md and summarizes current phase, completed tasks, next steps

---

### Update Session State
```
Update SESSION_STATE.md
```
or
```
Update session state with current progress
```

**What Claude does:** Updates `.claude/SESSION_STATE.md` with latest completed tasks and current state

---

## 📝 Documentation

### Create/Update Documentation
```
Update file-structure.md with the new files
```

**What Claude does:** Updates documentation to reflect current state

**Important:** Always keep file-structure.md current when adding/removing files

---

### Review Documentation
```
Review [document-name] and summarize
```

**Examples:**
- `Review architecture.md and summarize`
- `Review deployment.md and show me the Railway setup`
- `Review postman-collections.md for the auth endpoints`

---

## 🏗️ Development Commands

### Start New Phase
```
Let's start [phase name]
```

**Examples:**
- `Let's start Backend Phase 1: Project Setup`
- `Let's start the AI integration phase`
- `Let's start mobile development`

---

### Test Current Work
```
Test [what to test]
```

**Examples:**
- `Test the patient CRUD endpoints with Postman`
- `Test the database connection`
- `Test the Claude API integration`

---

### Deploy
```
Deploy [component] to [platform]
```

**Examples:**
- `Deploy backend to Railway`
- `Deploy dashboard to Vercel`
- `Build mobile app with EAS`

---

## 🐛 Debugging & Fixes

### Debug Issue
```
Debug [issue description]
```

**Examples:**
- `Debug the 500 error on patient POST endpoint`
- `Debug why Chroma isn't returning results`
- `Debug the authentication token refresh`

---

### Check for Errors
```
Check for errors
```
or
```
Run diagnostics
```

**What Claude does:** Checks logs, runs tests, looks for common issues

---

## 📦 Git Commands

### Commit Changes
```
Commit the [description]
```

**Examples:**
- `Commit the documentation`
- `Commit the backend setup`
- `Commit the patient endpoints`

**What Claude does:**
- Runs `git status`
- Reviews changes
- Creates appropriate commit message
- Commits with proper format

---

### Create Pull Request
```
Create PR for [feature]
```

**Example:**
- `Create PR for backend API endpoints`

**What Claude does:**
- Checks branch status
- Creates PR with summary
- Includes test plan

---

## 🎯 Planning & Strategy

### Plan Next Steps
```
What should we work on next?
```

**What Claude does:** Reviews SESSION_STATE.md and suggests next priority items

---

### Review Progress
```
Show me overall progress
```

**What Claude does:** Shows completion status of all phases from SESSION_STATE.md

---

### Review Blockers
```
What are the current blockers?
```

**What Claude does:** Lists blockers from SESSION_STATE.md and suggests solutions

---

## 🔍 Search & Find

### Find Files
```
Find [file description]
```

**Examples:**
- `Find the patient model file`
- `Find all files related to Chroma`
- `Find the authentication endpoints`

---

### Search Code
```
Search for [search term]
```

**Examples:**
- `Search for Claude API calls`
- `Search for TODO comments`
- `Search for error handling`

---

## 📋 Project Management

### Show TODO List
```
Show TODOs
```
or
```
What's left to do?
```

**What Claude does:** Shows pending items from SESSION_STATE.md

---

### Add TODO
```
Add TODO: [task description]
```

**What Claude does:** Adds task to SESSION_STATE.md in appropriate phase

---

### Mark Complete
```
Mark [task] as complete
```

**What Claude does:** Updates SESSION_STATE.md to reflect completion

---

## 🎨 Code Generation

### Generate Code
```
Generate [code description]
```

**Examples:**
- `Generate the patient model with all fields`
- `Generate the authentication endpoints`
- `Generate the Chroma service class`

---

### Create File
```
Create [file path] with [description]
```

**Examples:**
- `Create backend/app/models/patient.py with the Patient model`
- `Create backend/requirements.txt with all dependencies`

---

## 🧪 Testing

### Test with Postman
```
Test [endpoint] with Postman
```

**What Claude does:** Shows you the Postman request from postman-collections.md

---

### Run Tests
```
Run tests
```
or
```
Run [specific tests]
```

**Examples:**
- `Run backend tests`
- `Run authentication tests`

---

## 📚 Learning & Explanation

### Explain Code
```
Explain [code or concept]
```

**Examples:**
- `Explain how the conversation pipeline works`
- `Explain the Chroma integration`
- `Explain this function`

---

### How Does It Work?
```
How does [feature] work?
```

**Examples:**
- `How does the voice interaction work?`
- `How does the background heartbeat work?`
- `How does Chroma semantic search work?`

---

## 🎬 Demo Preparation

### Prepare Demo
```
Prepare demo for [feature]
```

**Examples:**
- `Prepare demo for semantic search`
- `Prepare demo data for conversations`
- `Prepare demo script`

---

### Test Demo Flow
```
Test [demo flow]
```

**Examples:**
- `Test the scheduled reminder flow`
- `Test the emergency alert flow`
- `Test the voice interaction flow`

---

## 🔧 System Commands

### Check Environment
```
Check environment
```
or
```
Verify setup
```

**What Claude does:** Checks that all tools, dependencies, and services are properly configured

---

### List Running Services
```
What's running?
```
or
```
Show running servers
```

**What Claude does:** Checks for running backend servers, databases, etc.

---

## 💡 Pro Tips

### Combine Commands
You can combine multiple requests:
```
Resume, then show me the progress, then let's continue with the next task
```

### Be Specific
The more specific your command, the better:
```
Good: "Test the POST /patients endpoint with Postman"
Better than: "Test something"
```

### Use Natural Language
Don't worry about exact syntax - Claude understands natural language:
```
"Can you help me debug why the patient endpoint is returning 500?"
"Let's review what we've done today and create a snap memory"
"Show me what's next on the todo list"
```

---

## 🎯 Most Common Workflow

```
1. Start of session:
   You: "resume"
   Claude: [Shows context, current state, suggests next steps]

2. During work:
   You: "Let's implement [feature]"
   Claude: [Implements feature]
   You: "Test it"
   Claude: [Tests feature]
   You: "Commit the changes"
   Claude: [Commits with proper message]

3. Check progress:
   You: "What's our progress?"
   Claude: [Shows completion status]

4. End of session:
   You: "Let's wrap up for today"
   Claude: [Updates SESSION_STATE.md]
   You: "snap -memory"
   Claude: [Creates comprehensive snap memory]
```

---

## ⚠️ Important Notes

1. **Always start with `resume`** at beginning of session
2. **Create snap memory** before long breaks
3. **Claude updates SESSION_STATE.md automatically** after major tasks
4. **Be specific** in your requests for better results
5. **Use natural language** - don't worry about exact commands

---

## 🆘 If Something Goes Wrong

### Claude seems confused:
```
resume
```

### Session state is wrong:
```
Update SESSION_STATE.md - we actually completed [X] and are working on [Y]
```

### Lost track of progress:
```
Read SESSION_STATE.md and summarize
```

### Need to see documentation:
```
Show me the documentation for [topic]
```

---

**Quick reference created:** 2025-10-24
**Location:** `/Users/gaurav/Elda/.claude/QUICK_COMMANDS.md`

**To get started, just type:** `resume`
