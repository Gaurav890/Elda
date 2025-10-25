



0) Design System (tokens, colors, fonts, motion)

Tone: Hybrid (warm + professional). Calm, trustworthy, human.
Fonts:
	•	Headings/brand: Playfair Display (serif)
	•	UI/body: Nunito Sans (humanist)

Colors (Tailwind theme extension):
	•	primary: #3566E5 (trust blue)
	•	accent: #F47C63 (warm coral)
	•	bg: #F9FAFB (app background)
	•	surface: #FFFFFF (cards, modals)
	•	text: #1A1A1A (primary)
	•	muted: #555555 (secondary)
	•	success: #4CAF50, warn: #F9A825, error: #E53935

Elevation & Shape:
	•	Shadow: rgba(0,0,0,0.08) soft (elev 1–2)
	•	Radius: 16–20px (cards, inputs, modals)
	•	Grid: 8px spacing scale

Typography sizes:
	•	Dashboard body min 18px; Mobile body min 16px; line-height 1.4

Motion:
	•	Micro-animations ≤200ms (hover, press)
	•	Dialog open/close fade + 4px translate
	•	Confetti on successful patient creation (Lottie or CSS sprinkles)

Iconography:
	•	Simple line icons; status dots (green/yellow/red)

Accessibility:
	•	Contrast ≥4.5:1, keyboard nav everywhere, focus rings, ARIA on dialogs/tabs, skip-to-content, captions for all voice features.

⸻

1) Information Architecture

1.1 Caregiver Web (Next.js, App Router)

Routes
	•	/login — Google or Email/Password UI (auth handled by backend)
	•	/ → redirects to /care-circle
	•	/care-circle — list all patients (“Care Circle”) with status; CTA: Add Loved One
	•	/dashboard — org-wide KPIs (adherence, mood trend, open alerts)
	•	/alerts — global alert center (filter by severity, patient)
	•	/settings — caregiver profile, notification prefs (push/SMS/email), team (future)
	•	/patients/[id] — patient detail layout with tabs:
	•	/patients/[id]/overview
	•	/patients/[id]/routine
	•	/patients/[id]/reports
	•	/patients/[id]/conversations
	•	/patients/[id]/alerts
	•	/patients/[id]/notes  ← Caregiver “Notes to AI” for memory/context

Global Layout
	•	Sidebar (logo + nav): Home, Care Circle, Dashboard, Alerts, Settings
	•	TopBar: search, notifications bell, caregiver avatar menu

Core Components
	•	SidebarNav, TopBar, KpiCard, TrendChart (Recharts), PatientCard, EmptyState
	•	AddPatientModal (multi-step), GenerateCodeModal (QR + 6-digit), ScheduleEditor
	•	ReportCard, PDFDownloadButton, AudioPlayButton
	•	ConversationList (with AI badges)
	•	AlertList (severity chips, acknowledge)
	•	AIInsightCard (contextual tips)
	•	NudgePanel (manual nudge: voice / push / call)
	•	NotesToAIEditor (context memory: structured notes + quick templates)

States to cover everywhere: loading, empty, error (retry), success.

⸻

1.2 Patient Mobile (Expo)

Navigation
	•	Stack: Welcome → CodeEntry → QRScan → Permissions → Tabs(Home)
	•	Tabs: Main (voice-first), Reminders, Settings

Screens
	1.	Welcome — “Hello! I’m your companion. Do you have a code?” → Enter Code / Scan QR
	2.	CodeEntry — 6-digit input, Continue → validate
	3.	QRScan — camera; on success → prefill code → continue
	4.	Permissions — Microphone / Notifications / Location → allow dialogs
	5.	Home/Main — greeting, Next Reminder card, big animated Mic button, persistent Emergency button, recent transcript preview
	6.	VoiceOverlay (modal) — waveform, “Listening / Processing / Speaking”, captions, End chat, Mute
	7.	EmergencyConfirm — “Do you need help?” Yes/No; if yes → voice follow-up → call caregiver (backend)
	8.	Reminders — list of today’s items with statuses; tap to hear description
	9.	Settings — language/voice tone, “Listening always on” toggle (mock), About

States to cover: reminder TTS, follow-ups, non-response nudges, call escalation, offline chip, permission blocked.

⸻

2) Golden UX Flows (must implement)

2.1 Caregiver creates patient → shares code → patient links
	•	/care-circle empty → CTA “Add Loved One”
	•	AddPatientModal (3 steps):
	•	Step 1: Basic Info — Name, Age, Gender, Relationship, Phone, Photo (upload)
	•	Step 2: Health & Routine — Brief history (free text), Allergies, Meds, Sleep window, Meals, Activities, Preferred talk time
	•	Step 3: Preferences — Tone (gentle/cheerful/formal), Reminder type (voice/push/both), Language, Voice
	•	Save → success screen with confetti → “View Profile” / “Generate Connection Code”
	•	GenerateCodeModal — show 6-digit code + QR, copy/download, 10-minute expiry countdown
	•	Patient mobile: Welcome → CodeEntry/QRScan → Permissions → Home/Main

2.2 Caregiver controls schedule (CRUD)
	•	/patients/[id]/routine
	•	Add schedule item (type: medication/meal/activity/checkin, label, window start/end, metadata e.g., pill color/location)
	•	Edit item
	•	Delete item (confirm modal: “Delete this reminder?”)
	•	Toggle Active on/off
	•	Inline validation errors (time overlaps, missing fields)
	•	Bulk disable (multi-select → Disable)

2.3 Caregiver adds Notes to AI (context/memory)
	•	/patients/[id]/notes
	•	Rich text + structured fields for context (key/value), e.g.:
	•	pill_color: yellow
	•	pill_location: on the table
	•	Quick templates: “Medication location”, “Routine preferences”, “Names & relations”
	•	Version history (simple list, timestamps)
	•	Save → toast: “AI will use this context for reminders and summaries.”

2.4 Caregiver manually nudges patient
	•	On Overview and Alerts: open NudgePanel
	•	Channels: Voice, Push, Call
	•	Message (prefilled from schedule or freeform)
	•	Send → backend POST /patients/:id/nudge
	•	Show delivery status & log entry

2.5 Reminder → Patient response → Escalation (end-to-end)
	•	Patient gets push + TTS: “Hi Mary, it’s time for your yellow pill on the table.”
	•	If patient: “Okay, taking it now.” → follow-up in 60s: “Did you take the yellow pill on the table?”
	•	“Yes” → success; “Not yet” → remind in 5 min
	•	If silence: 3 nudges (spaced) → call patient via backend → if no pickup → caregiver alert
	•	Web Alerts page shows event; caregiver can Acknowledge, Nudge, or Call.

2.6 Daily check-ins → Summaries
	•	Patient micro-chat (Main) → mood + highlights
	•	Web /patients/[id]/reports: Today/Yesterday cards; Download PDF, Play Audio

2.7 Emergency flow
	•	Patient taps Emergency → voice confirm: “Do you need help?”
	•	If Yes → “What happened?” (capture keywords) → backend triggers caregiver call; fallback to 911 per config.

⸻

3) Pages & States (Web) — layouts, copies, edge cases

/login
	•	Copy: “Welcome back. Sign in to care for your loved ones.”
	•	Buttons: “Continue with Google”, “Continue with Email”
	•	Errors: invalid credentials → “That didn’t work—please try again.”

/care-circle
	•	Header + CTA “Add Loved One”
	•	Cards: photo, name, status (Active/Pending), quick actions: View, Trigger Reminder
	•	Empty state copy: “Let’s start by caring for someone you love ❤️”
	•	Error banner if list fails: “We couldn’t load your care circle. Retry.”

AddPatientModal (multi-step)
	•	Step 1 copy: “Basic information”
	•	Validation errors: inline, friendly (“Please add a name so we can personalize reminders.”)
	•	Success copy: “Profile for [Name] is ready 🎉”

GenerateCodeModal
	•	Copy: “Share this code or QR with [Name]. It expires in 10 minutes.”
	•	Countdown timer; copy/download buttons.
	•	Error: “Looks like this code expired. Generate a new one.”

/patients/[id]/overview
	•	Header: photo, name, age, status badge
	•	KPIs: Today’s reminders (done / due), Last interaction, Mood
	•	Right rail: AI Insights (suggestions)
	•	Action bar: Trigger Reminder, Nudge (opens NudgePanel)
	•	Empty copy: “No activity yet today.”

/patients/[id]/routine
	•	List of schedule items (type chip, label, time range, status)
	•	Add/Edit Drawer with form fields, metadata (pill color/location)
	•	Delete confirm modal: “Delete this reminder?” → “Delete” / “Cancel”
	•	Edge cases: time overlaps → friendly resolver (“These times overlap with Breakfast at 08:30.”)

/patients/[id]/reports
	•	Cards: Today / Yesterday → highlights, adherence, mood
	•	Buttons: Download PDF, Play Audio
	•	Empty: “No reports yet. After today’s check-in, a summary will appear here.”
	•	Error: show toast + retry

/patients/[id]/conversations
	•	Chat transcript bubbles; AI labeled “Companion”
	•	Filter: today/7 days
	•	Empty: “Conversations will appear here.”

/patients/[id]/alerts
	•	Table of alerts: severity, time, message, status; Acknowledge button
	•	Nudge shortcut per row
	•	Empty: “All clear. No open alerts.”

/patients/[id]/notes  (Notes to AI)
	•	Copy: “Teach the AI important context. It will use this to be clearer and kinder.”
	•	Rich text + key/value list (e.g., pill_color: yellow, pill_location: on the table)
	•	Templates (chips): Medication location / Routine preferences / Names & relations
	•	Version timeline: who, when, summary diff
	•	Save toast: “Saved. Future reminders will reflect this.”

/alerts (global)
	•	Filters: severity, patient
	•	Bulk acknowledge
	•	Empty: “No alerts. You’re all caught up.”

/settings
	•	Profile (name, email)
	•	Notifications: Push / SMS / Email toggles
	•	Voice escalation: Enable caregiver call (twilio)
	•	Save toast: “Settings updated.”

Error Pages
	•	404: “We can’t find that page.” → buttons: “Go to Care Circle”
	•	500: “Something went wrong.” → “Try again” (retry) / “Contact support”
	•	Network offline banner: “You appear to be offline. We’ll retry in the background.”

⸻

4) Components (Web) — behaviors & copies
	•	NudgePanel
	•	Channels: Voice (TTS), Push, Call (Twilio)
	•	Message: prefill from selected schedule item (editable)
	•	Copy: “Choose how to reach [Name].”
	•	Result: show send status; add to InteractionLog
	•	ScheduleEditor
	•	Time pickers; type selector; label; metadata fields (color/location/notes)
	•	Toggle Active; save; validation; overlaps warning
	•	NotesToAIEditor
	•	Rich text, key/value list (add row, delete row)
	•	Template inserts
	•	Save → optimistic update + toast
	•	TrendChart (Recharts)
	•	Mood trend (7d) & adherence sparkline
	•	Dialogs/Tabs
	•	Proper ARIA; focus trap; ESC closes; keyboard nav

⸻

5) Patient Mobile — interactions & copies
	•	Welcome: “Hello! I’m your companion. Do you have a code?” → Enter Code / Scan QR
	•	Permissions:
	•	Mic: “We’ll use your microphone to listen when you tap the mic.”
	•	Notifications: “We’ll remind you at the right times.”
	•	Location: “Helps us help in emergencies.”
	•	Main:
	•	Greeting: “Good afternoon, Mary 🌞”
	•	Next Reminder card: “2:00 PM • Medication — Yellow pill on the table”
	•	Big Mic: “Tap to talk”; caption transcript line appears during sessions
	•	Emergency: “Emergency” (always visible)
	•	Voice states: “Listening… / Processing… / Speaking…”
	•	Follow-up: “Did you take the yellow pill on the table?”
	•	Success: “Great job—I marked it done.”
	•	Nudges: inline banner if caregiver sent a nudge
	•	Emergency confirm: “Do you need help?” → Yes/No → “Calling your caregiver…”

Edge cases
	•	Code invalid/expired: “This code looks old. Let’s try a fresh one.”
	•	Permissions denied: show instructions to enable in Settings
	•	Offline: small “Offline” pill; queue events locally and retry

⸻

6) API Contracts (front-end expectations)

Base URLs via env:
	•	Web: NEXT_PUBLIC_API_BASE_URL
	•	Mobile: EXPO_PUBLIC_API_BASE_URL

Auth

POST /auth/login                             // returns { token }

Care Circle

GET  /patients                               // list
POST /patients                               // create
GET  /patients/:id                           // detail
POST /patients/:id/code                      // { code, qr_png_base64, expires_at }

Schedule

GET    /patients/:id/schedule
POST   /patients/:id/schedule                // create item
PATCH  /patients/:id/schedule/:sid           // update item (label, windows, metadata, active)
DELETE /patients/:id/schedule/:sid           // delete item

Notes to AI (context memory)

GET  /patients/:id/notes
POST /patients/:id/notes                     // create new note version

Manual Nudge

POST /patients/:id/nudge                     // { channel: "voice"|"push"|"call", message: string }

Reminders/Reports/Alerts

POST /reminders/trigger                      // manual trigger { patient_id, schedule_id? }
GET  /patients/:id/reports/daily?date=YYYY-MM-DD
GET  /patients/:id/reports/daily.pdf
GET  /patients/:id/reports/daily.mp3
GET  /alerts?patient_id=
POST /alerts/:id/ack

Devices (mobile)

POST /devices/register                       // { patient_id, fcm_token, platform }
POST /link/validate-code                     // { code } → { patient }

Shared Types (use in TS)

type Patient = {
  id: string; caregiver_id: string; name: string; phone: string;
  photo_url?: string; history_text?: string; language?: string;
  voice_tone?: "gentle"|"cheerful"|"formal";
  preferences?: Record<string, any>;
  status?: "active"|"pending";
};

type ScheduleItem = {
  id: string; patient_id: string;
  type: "medication"|"meal"|"activity"|"checkin";
  label: string;
  time_window_start: string; time_window_end?: string;
  metadata?: Record<string, any>;  // e.g., { pill_color: "yellow", location: "table" }
  active: boolean;
};

type Alert = {
  id: string; patient_id: string;
  severity: "low"|"medium"|"high";
  message: string; status: "open"|"ack"|"closed";
  created_at: string;
};


⸻

7) API Clients & Mocking
	•	Create /lib/api.ts in web and mobile with typed fetchers.
	•	Add a mock mode flag:
	•	Web: NEXT_PUBLIC_USE_MOCKS=true
	•	Mobile: EXPO_PUBLIC_USE_MOCKS=true
	•	Provide fixtures:
	•	2 patients (Mary — Active; Peter — Pending)
	•	Mary’s schedule: Breakfast 09:00; Medication 14:00 (metadata: pill_color: yellow, location: table); Walk 17:30
	•	3 alerts (one high escalated)
	•	Today & Yesterday report JSON
	•	Notes to AI: entries with pill_color and pill_location
	•	If API fails or is offline, fall back to mocks with banner:
“Connected to sample data. Switch to live in Settings.”

⸻

8) Patient Voice/TTS Utilities
	•	voice.ts — start/stop react-native-voice, stream transcript, detect intents (yes/no/took/not yet/help)
	•	tts.ts — wrapper over expo-speech with queueing and cancel
	•	State machine for voice: idle → listening → processing → speaking → idle
	•	State machine for reminder:
scheduled → speaking → awaiting_reply → followup → success | nudge1 | nudge2 | nudge3 → call_patient → alert_caregiver

⸻

9) Accessibility & Animations
	•	Dialogs: focus trap, aria-labelledby, ESC closes
	•	Tabs: role="tablist", aria-selected, arrow key nav
	•	Button focus rings: visible, high contrast
	•	Motion-reduced users: respect prefers-reduced-motion
	•	Animations: mic pulse, confetti on create, gentle hover transitions

⸻

10) Error Handling
	•	Global error boundary → friendly 500 page
	•	Per-section retry buttons
	•	Form validation with clear inline messages
	•	Network offline banner with auto-retry backoff
	•	For destructive actions (delete schedule): confirm dialog

⸻

11) Environment & Scripts

Web

NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_USE_MOCKS=true

Scripts: dev, build, lint, typecheck

Mobile

EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_USE_MOCKS=true

Scripts: start, android, ios, eas-build

Include README.md in both apps with setup steps.

⸻

12) Acceptance Criteria (demo script)
	1.	Create patient → Generate code/QR (with countdown).
	2.	Mobile: enter/scan code → permissions → Home.
	3.	Web: add Notes to AI with pill_color: yellow, pill_location: table.
	4.	Trigger Medication reminder (manual or scheduled mock):
	•	Mobile TTS speaks with that context; patient says “Okay, taking it now.”
	•	Follow-up in 60s → patient “Yes” → success logged.
	5.	Run another reminder; ignore → see 3 nudges → call escalation stub → Alert appears on web; caregiver Acknowledges or Nudges (voice/push/call) with custom message.
	6.	Web Reports: show Today card; Download PDF / Play Audio hit placeholder endpoints.




