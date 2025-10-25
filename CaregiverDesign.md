
# 1. Brand & Visual Language

Tone: Warm + professional. Feels caring, calm, and trustworthy.

Color Tokens:
- primary: #3566E5
- accent: #F47C63
- bg: #F9FAFB
- surface: #FFFFFF
- textPrimary: #1A1A1A
- textSecondary: #555555
- success: #4CAF50
- warn: #F9A825
- error: #E53935

Typography:
- Headings: Playfair Display, serif
- Body/UI: Nunito Sans, humanist sans
- Hierarchy:
  H1 32–40px / bold / primary
  H2 24–28px / semi-bold
  Body 18px / regular
  Caption 14px / muted

Spacing & Shape:
- 8px spacing grid
- Corner radius: 16–20px
- Shadows: rgba(0,0,0,0.08) soft blur 16
- Min button height: 44px
- Motion: 200 ms ease-in-out on hover/focus

Accessibility:
- Contrast ≥4.5:1
- Visible focus rings
- Keyboard navigation for all elements

---

# 2. Page Architecture

Primary Navigation (Sidebar):
- Logo + wordmark “Elder Companion AI”
- Sections:
  1. Care Circle
  2. Dashboard
  3. Alerts
  4. Settings
- Persistent at left; collapsible for mobile/tablet.

Top Bar:
- Search input
- Notification bell (with badge)
- Caregiver avatar dropdown (Profile, Logout)

---

# 3. Core Pages

## Care Circle
Purpose: manage all patients.
Layout:
- Header row with page title + “Add Loved One” button (primary)
- Card grid (3-column):
  • Patient photo avatar
  • Name, age
  • Status chip (Active/Pending)
  • Quick actions: View / Trigger Reminder
States:
- Empty: illustration + text “Let’s start by caring for someone you love ❤️”
- Loading skeletons
- Error banner “We couldn’t load your care circle. Retry.”

## Add Loved One Modal
Multi-step modal, 3 steps with progress bar:
1️⃣ Basic Info – Name, Age, Gender, Relationship, Phone, Photo
2️⃣ Health & Routine – Brief history, Allergies, Medications, Sleep range, Meal times, Daily activities, Talk-time preference
3️⃣ Preferences – Tone (gentle/cheerful/formal), Reminder type (voice/push/both), Language, Voice
Buttons: Back / Next / Save
Success state: “Profile for [Name] is ready 🎉” with buttons “View Profile” / “Generate Connection Code.”

## Generate Code Modal
Content:
- 6-digit code (large)
- QR code box
- Text “Share this with [Name]; expires in 10 minutes.”
- Buttons: Copy / Download / Close
Expired variant: “This code looks old. Generate a new one.”

## Patient Detail Layout
Tabs: Overview / Routine / Reports / Conversations / Alerts / Notes to AI
Header: avatar, name, age, status badge, quick actions (Trigger Reminder, Nudge)

### Overview Tab
- KPI cards: Today’s reminders (x/y), Last interaction, Mood
- Activity timeline list
- Right rail: “AI Insights” card (suggestions)
- States: empty (“No activity yet today”), loading, error

### Routine Tab
- Table of schedule items (Type chip, Label, Time window, Active toggle, Actions)
- Drawer for Add/Edit item with metadata fields (pill_color, location, notes)
- Confirm delete modal “Delete this reminder?”
- Inline warning if overlaps (“These times overlap with Breakfast at 08:30.”)

### Reports Tab
- Cards for Today / Yesterday
  • Overview paragraph
  • Adherence mini-stats
  • Mood summary with emoji
  • Event list
- Buttons: Download PDF, Play Audio
- Empty: “No reports yet. After today’s check-in, a summary will appear here.”

### Conversations Tab
- Chat transcript: left (AI), right (Patient)
- Timestamp, avatar initials
- Filter: Today / 7 days
- Empty: “Conversations will appear here.”

### Alerts Tab
- Table: Severity chip, Time, Message, Status, Actions (Acknowledge, Nudge)
- Empty: “All clear. No open alerts.”

### Notes to AI Tab
- Rich text editor + key/value list
- Template chips (“Medication location”, “Routine preferences”, “Names & relations”)
- Version timeline on right
- Save toast “Saved. Future reminders will reflect this.”

## Global Alerts Page
- Filter bar (Severity, Patient)
- Table of alerts with bulk-acknowledge toolbar
- Empty: “No alerts. You’re all caught up.”

## Settings
- Profile: name, email, avatar upload
- Notification toggles (Push/SMS/Email)
- Voice escalation toggle “Enable caregiver call”
- Save button → toast “Settings updated.”

## Error & Offline UI
- 404 page: “We can’t find that page.” → “Go to Care Circle”
- 500 page: “Something went wrong.” → “Try again”
- Offline banner: “You appear to be offline. We’ll retry in the background.”

---

# 4. Components

Buttons: Primary (filled primary blue), Secondary (outline coral), Tertiary (text)
Inputs: rounded, label above, focus ring primary
Cards: surface + soft shadow
Chips: rounded 8 px, color-coded
Tabs: underline animation
Modals: fade-in, ESC close
Drawers: slide-in from right
Tables: zebra rows, hover highlight
Toasts: top-right, auto-dismiss 3 s

Micro-animations:
- Confetti on new patient success
- Smooth transitions for tabs and modals

---

# 5. Responsive Behavior

Breakpoint 1440 px → full dashboard  
768 px → sidebar collapses, topbar shows menu icon  
480 px → cards stack, font sizes scale to 16 px min.

---

# 6. Microcopy Tone

Friendly, clear, empathetic.  
Examples:
- Success: “Profile for Mary is ready 🎉”
- Empty: “Let’s start by caring for someone you love ❤️”
- Warning: “These times overlap with Breakfast at 08:30.”
- Toasts: “Saved. Future reminders will reflect this.”

