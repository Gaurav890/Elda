
# 1. Brand & Visual System

Same palette as the web app:
primary #3566E5, accent #F47C63, bg #F9FAFB, surface #FFFFFF, text #1A1A1A, success #4CAF50, error #E53935.

Typography:
- Headings : Playfair Display Bold 24 pt  
- Body : Nunito Sans Regular 16 pt  
- Buttons : Semi-Bold 18 pt  

Shape & Spacing:
- 8 dp grid
- Corner radius 16 dp
- Card shadow subtle elevation 2
- Large tap targets (≥52 dp)

Voice & Accessibility:
- Every action has speech feedback and visible captions
- High contrast mode supported
- Caption area for all spoken text
- Haptics on confirmation

---

# 2. Navigation

Stack Navigator:
`Welcome → CodeEntry → QRScan → Permissions → Tabs(Home)`

Bottom Tabs:
- Main (voice-first home)
- Reminders
- Settings

---

# 3. Screen Designs

## Welcome
- Greeting text: “Hello! I’m your companion.”
- Two large buttons: “Enter Code”, “Scan QR”
- Calm background gradient (blue → white)

## Code Entry
- Label: “Enter your 6-digit code”
- 6 input boxes with focus animation
- Primary button: “Continue”
- Error variant: red text “This code looks old. Let’s try a fresh one.”

## QR Scan
- Camera preview frame with rounded corners
- Instruction text: “Align the QR code inside the frame”
- Cancel button (secondary)

## Permissions
- Three cards: Microphone / Notifications / Location
- Each card → icon + short rationale
  “We’ll use your microphone to listen when you tap the mic.”
- Button: “Allow All and Continue”

## Home (Main Tab)
- Greeting line: “Good afternoon, Mary 🌞”
- Next Reminder Card:
   • Time (e.g., 2:00 PM)  
   • Label “Medication — Yellow pill on the table”  
   • Status dot (yellow = upcoming)
- Big circular Microphone button (center) with pulse animation
- Caption line beneath mic (show live transcript)
- Persistent red “Emergency” button bottom center
- Tabs below: Main (active blue), Reminders, Settings

Voice States:
1. Idle → caption “Tap the mic to talk.”  
2. Listening → animated waveform + “Listening…”  
3. Processing → spinner + “Processing…”  
4. Speaking → speech bubble shows AI reply text + TTS.  
Transition animations < 300 ms.

## Voice Overlay (Modal)
- Full-screen gradient background
- Center: waveform animation
- State labels: “Listening …”, “Processing …”, “Speaking …”
- Bottom buttons: End Chat (red), Mute (gray)
- Caption area for live transcript text.

## Reminders Tab
- Header: “Today’s Reminders”
- List items: time, label, status chip (completed/pending/escalated)
- Tap → bottom sheet with actions: “Hear Description” (plays TTS), “Mark Done”
- Empty state: “No reminders right now.”

## Settings Tab
- Language selector (dropdown)
- Voice tone radio group (gentle / cheerful / formal)
- Toggle “Listening always on” with description
- About card (app version, copyright)
- Save button (primary) → toast “Settings updated.”

## Emergency Confirm Dialog
- Modal prompt:
  Title “Do you need help?”
  Buttons Yes (primary) / No (secondary)
- Follow-up prompt: “What happened?” (text area or voice)
- Status banner variant: “Calling your caregiver …”

---

# 4. States & Feedback

- Loading skeletons for lists
- Empty variants for each tab
- Offline banner: “You’re offline. We’ll retry soon.”
- Success toasts (top): “Done!”, “Saved”, “Settings updated”
- Error toast (red): “Something went wrong. Please try again.”

---

# 5. Motion & Transitions

- Slide transitions between stack screens (300 ms)
- Bottom sheet bounce in/out for dialogs
- Mic pulse loop at 1.2 s interval
- Gentle fade on voice captions

---

# 6. Microcopy Tone

Always friendly, simple, reassuring.

Examples:
- Reminder voice: “It’s time for your yellow pill on the table.”
- Follow-up: “Did you take it?”
- Success: “Great job—I marked it done.”
- Nudge: “I’ll remind you again in five minutes.”
- Emergency : “Calling your caregiver now.”

---

# 7. Responsive Behavior

Support phones 5.5–6.7″, portrait orientation.
All buttons ≥ 52 dp height; text ≥ 16 pt.
Voice overlay auto-adapts safe area.

