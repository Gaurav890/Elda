# Caregiver Web Dashboard - Detailed Task Breakdown

**Project:** Elder Companion AI - Caregiver Dashboard
**Created:** October 24, 2025
**Total Estimated Time:** 9-10 days
**Status:** Ready for Development

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Project Setup & Authentication](#phase-1-project-setup--authentication) (2 days)
3. [Phase 2: Care Circle & Patient Management](#phase-2-care-circle--patient-management) (2 days)
4. [Phase 3: Patient Detail - Core Tabs](#phase-3-patient-detail---core-tabs) (2 days)
5. [Phase 4: Alerts & Settings](#phase-4-alerts--settings) (1 day)
6. [Phase 5: Advanced Features](#phase-5-advanced-features) (1-2 days)
7. [Phase 6: Polish & Testing](#phase-6-polish--testing) (1-2 days)
8. [Acceptance Criteria Summary](#acceptance-criteria-summary)
9. [Risk Mitigation](#risk-mitigation)

---

## Overview

### Development Approach
- **Incremental:** Build feature by feature, test as you go
- **API-first:** Integrate real backend APIs from day 1
- **Component-driven:** Build reusable components first
- **Mobile-first CSS:** Start with mobile, scale up to desktop

### Priority System
- 🔴 **Critical:** Must have for MVP
- 🟡 **Important:** Should have for good UX
- 🟢 **Nice-to-have:** Can defer if time constrained

---

## Phase 1: Project Setup & Authentication

**Duration:** 2 days
**Goal:** Working authentication + basic layout

### Task 1.1: Project Initialization 🔴

**Time:** 2-3 hours

**Steps:**
1. Create Next.js 14 project with TypeScript + Tailwind
2. Configure shadcn/ui
3. Install core dependencies (React Query, Axios, React Hook Form, Zod)
4. Set up project structure (folders, files)
5. Configure ESLint + Prettier
6. Set up git repository

**Commands:**
```bash
npx create-next-app@latest caregiver-dashboard --typescript --tailwind --app --src-dir --import-alias "@/*"
cd caregiver-dashboard
pnpm add @tanstack/react-query @tanstack/react-query-devtools axios
pnpm add react-hook-form zod @hookform/resolvers
pnpm add lucide-react clsx tailwind-merge class-variance-authority
pnpm add date-fns
npx shadcn-ui@latest init
```

**Deliverables:**
- [ ] Next.js project created
- [ ] All dependencies installed
- [ ] shadcn/ui configured
- [ ] File structure matches specification
- [ ] `.env.local` created with API_URL
- [ ] Git repository initialized

**Acceptance Criteria:**
- ✅ `pnpm dev` starts without errors
- ✅ Tailwind CSS works
- ✅ TypeScript has no errors
- ✅ Can import shadcn/ui components

---

### Task 1.2: Design System Setup 🔴

**Time:** 2 hours

**Steps:**
1. Configure Tailwind with custom colors
2. Add custom fonts (Playfair Display, Nunito Sans)
3. Create design tokens file
4. Test color system with sample page

**Files to Create:**
- `tailwind.config.ts` - Custom colors, fonts, spacing
- `src/app/globals.css` - Font imports, custom CSS
- `src/config/constants.ts` - Design tokens

**Deliverables:**
- [ ] Custom color palette configured
- [ ] Typography system working
- [ ] Spacing system configured
- [ ] Shadow utilities available

**Acceptance Criteria:**
- ✅ Can use custom colors: `bg-primary`, `text-accent`
- ✅ Fonts load correctly (Playfair + Nunito Sans)
- ✅ Visual matches design spec

---

### Task 1.3: API Client Setup 🔴

**Time:** 2 hours

**Steps:**
1. Create Axios instance with interceptors
2. Implement token storage helpers
3. Set up React Query provider
4. Create API endpoint functions
5. Test API connection

**Files to Create:**
- `src/lib/api/axios.ts` - Axios instance + interceptors
- `src/lib/auth/storage.ts` - Token management
- `src/app/providers.tsx` - React Query provider
- `src/lib/api/auth.ts` - Auth API calls

**API Dependencies:**
- Backend running locally or on Railway
- POST `/api/v1/auth/login` endpoint available
- POST `/api/v1/auth/refresh` endpoint available

**Deliverables:**
- [ ] Axios client configured
- [ ] JWT token interceptor working
- [ ] Auto token refresh implemented
- [ ] React Query provider added to root layout

**Acceptance Criteria:**
- ✅ Can make authenticated API calls
- ✅ Token automatically added to headers
- ✅ Token refresh on 401 works
- ✅ React Query DevTools visible in dev mode

---

### Task 1.4: Authentication Pages 🔴

**Time:** 3-4 hours

**Steps:**
1. Install shadcn/ui form components
2. Create Login page
3. Create Register page
4. Implement auth hook
5. Add form validation
6. Test full auth flow

**Components to Install:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
```

**Files to Create:**
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/register/page.tsx` - Register page
- `src/app/(auth)/layout.tsx` - Auth layout (centered)
- `src/hooks/useAuth.ts` - Authentication hook
- `src/types/auth.ts` - Auth type definitions

**API Dependencies:**
- POST `/api/v1/auth/login`
  - Body: `{ email, password }`
  - Response: `{ access_token, refresh_token, caregiver }`
- POST `/api/v1/auth/register`
  - Body: `{ first_name, last_name, email, phone_number?, password }`
  - Response: `{ access_token, refresh_token, caregiver }`

**Deliverables:**
- [ ] Login page with email + password
- [ ] Register page with full form
- [ ] Form validation (Zod schemas)
- [ ] Error handling with toasts
- [ ] Successful login redirects to /care-circle

**Acceptance Criteria:**
- ✅ Can register new account
- ✅ Can login with credentials
- ✅ Form validation shows errors
- ✅ Invalid credentials show error toast
- ✅ Successful login saves tokens and redirects
- ✅ Password field is masked
- ✅ "Remember me" not required (tokens saved by default)

---

### Task 1.5: Dashboard Layout 🔴

**Time:** 3-4 hours

**Steps:**
1. Install layout components
2. Create Sidebar component
3. Create Topbar component
4. Create DashboardLayout wrapper
5. Add navigation logic
6. Make responsive (mobile: drawer)

**Components to Install:**
```bash
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add sheet  # For mobile drawer
```

**Files to Create:**
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Topbar.tsx`
- `src/components/layout/DashboardLayout.tsx`
- `src/app/(dashboard)/layout.tsx`

**Sidebar Sections:**
1. Logo + wordmark (top)
2. Navigation menu:
   - Care Circle
   - Dashboard (optional/redirect)
   - Alerts (with badge if > 0)
   - Settings
3. User profile (bottom)

**Topbar Sections:**
1. Search input (placeholder for now)
2. Notification bell (badge if unread)
3. Avatar dropdown (Profile, Logout)

**Deliverables:**
- [ ] Sidebar with navigation
- [ ] Topbar with search + notifications
- [ ] Responsive: sidebar becomes drawer on mobile
- [ ] Active route highlighting
- [ ] Logout functionality

**Acceptance Criteria:**
- ✅ Sidebar shows all navigation items
- ✅ Clicking nav items navigates correctly
- ✅ Current page is highlighted
- ✅ Topbar shows user avatar
- ✅ Dropdown menu works (Profile, Logout)
- ✅ Logout clears tokens and redirects to login
- ✅ Mobile: sidebar collapses to hamburger menu
- ✅ Mobile: clicking hamburger opens drawer

---

## Phase 2: Care Circle & Patient Management

**Duration:** 2 days
**Goal:** View and manage patients

### Task 2.1: TypeScript Types & API Helpers 🔴

**Time:** 1 hour

**Steps:**
1. Create Patient type definitions
2. Create API helper functions
3. Create React Query hooks

**Files to Create:**
- `src/types/patient.ts` - Patient, PatientCreate, PatientUpdate types
- `src/lib/api/patients.ts` - Patient API functions
- `src/hooks/usePatients.ts` - React Query hooks

**Type Definitions:**
```typescript
// Based on backend schema
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  display_name: string;
  full_name: string;

  // Demographics
  gender?: string;
  phone_number?: string;
  address?: string;

  // Emergency
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  // Medical
  medical_conditions: string[];
  medications: string[];
  allergies: string[];
  dietary_restrictions: string[];

  // Personalization
  profile_photo_url?: string;
  timezone: string;
  preferred_voice: 'male' | 'female' | 'neutral';
  communication_style: 'friendly' | 'formal' | 'casual';
  language: string;

  // System
  letta_agent_id?: string;
  personal_context: Record<string, any>;
  device_token?: string;
  app_version?: string;
  last_active_at?: string;
  last_heartbeat_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**API Dependencies:**
- GET `/api/v1/patients` - List all patients
- GET `/api/v1/patients/{id}` - Get patient detail
- POST `/api/v1/patients` - Create patient
- PATCH `/api/v1/patients/{id}` - Update patient
- DELETE `/api/v1/patients/{id}` - Delete patient

**Deliverables:**
- [ ] Complete Patient type definitions
- [ ] API wrapper functions
- [ ] React Query hooks (usePatients, usePatient, useCreatePatient, etc.)

**Acceptance Criteria:**
- ✅ Types match backend API exactly
- ✅ API functions have proper error handling
- ✅ React Query hooks cache correctly

---

### Task 2.2: Care Circle Page 🔴

**Time:** 3-4 hours

**Steps:**
1. Install required components
2. Create PatientCard component
3. Create Care Circle page
4. Implement patient grid
5. Add search functionality
6. Add loading and empty states

**Components to Install:**
```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add skeleton
```

**Files to Create:**
- `src/components/patients/PatientCard.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/common/LoadingSkeleton.tsx`
- `src/app/(dashboard)/care-circle/page.tsx`

**PatientCard Specs:**
- Avatar (profile_photo_url or initials)
- Name + age
- Status badge (Active/Inactive)
- Last activity timestamp (relative, e.g., "2 hours ago")
- Alert count badge (if > 0, show in red)
- "View" button
- "Trigger Reminder" button (placeholder for now)

**EmptyState Specs:**
- Illustration or icon
- Title: "Let's start by caring for someone you love ❤️"
- Description: "Add your first loved one to get started"
- "Add Loved One" button (opens Add Patient modal)

**API Dependencies:**
- GET `/api/v1/patients` - List all patients

**Deliverables:**
- [ ] PatientCard component
- [ ] Care Circle page
- [ ] Grid layout (3 columns desktop, 1 mobile)
- [ ] Search bar (filter by name)
- [ ] Loading skeletons
- [ ] Empty state
- [ ] "Add Loved One" button (opens modal)

**Acceptance Criteria:**
- ✅ Page loads patient list from API
- ✅ Shows loading skeletons while fetching
- ✅ Empty state shows when no patients
- ✅ Patient cards display all info correctly
- ✅ Search filters patients by name
- ✅ Clicking "View" navigates to patient detail
- ✅ Grid is responsive (3 → 2 → 1 columns)
- ✅ Alert badges show correct count
- ✅ Real-time relative timestamps ("2 hours ago")

---

### Task 2.3: Add Patient Modal 🔴

**Time:** 4-5 hours

**Steps:**
1. Install dialog component
2. Create multi-step form component
3. Create AddPatientModal with 3 steps
4. Implement form validation
5. Integrate with API
6. Add success state

**Components to Install:**
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add progress
```

**Files to Create:**
- `src/components/patients/AddPatientModal.tsx`
- `src/components/forms/MultiStepForm.tsx`
- `src/components/forms/ProgressBar.tsx`

**Modal Steps:**

**Step 1: Basic Info**
- First name* (required)
- Last name* (required)
- Date of birth* (date picker)
- Gender (select: male/female/other/prefer not to say)
- Phone number
- Profile photo upload (placeholder, show default avatar)

**Step 2: Health & Routine**
- Medical conditions (multi-input, add/remove)
- Medications (multi-input)
- Allergies (multi-input)
- Dietary restrictions (multi-input)
- Emergency contact name
- Emergency contact phone

**Step 3: Preferences**
- Timezone (select, default: browser timezone)
- Preferred voice (select: male/female/neutral)
- Communication style (select: friendly/formal/casual)
- Language (select, default: en)

**Buttons:**
- Step 1-2: "Back" (secondary) / "Next" (primary)
- Step 3: "Back" (secondary) / "Save" (primary, loading state)

**Success Modal:**
- ✅ Icon
- Title: "Profile for [Name] is ready 🎉"
- Buttons:
  - "View Profile" (navigate to patient detail)
  - "Generate Code" (open Generate Code modal - placeholder)
  - "Done" (close modal, refresh list)

**API Dependencies:**
- POST `/api/v1/patients`
  - Body: PatientCreate (all form fields)
  - Response: Patient

**Deliverables:**
- [ ] 3-step modal with progress bar
- [ ] All form fields with validation
- [ ] Back/Next navigation
- [ ] API integration
- [ ] Success state with actions
- [ ] Error handling

**Acceptance Criteria:**
- ✅ Modal opens from "Add Loved One" button
- ✅ Progress bar shows current step (1/3, 2/3, 3/3)
- ✅ Can navigate back/forward between steps
- ✅ Form validation prevents invalid submissions
- ✅ Required fields show error if empty
- ✅ Success: patient created in backend
- ✅ Success: patient list refreshes automatically
- ✅ Success modal shows correct name
- ✅ "View Profile" navigates to patient detail
- ✅ Can close and reopen modal without issues

---

### Task 2.4: Generate Code Modal 🟡 (Placeholder)

**Time:** 1 hour

**Steps:**
1. Create Generate Code modal (placeholder)
2. Show message: "Feature coming soon"
3. Add to backend documentation as future endpoint

**Files to Create:**
- `src/components/patients/GenerateCodeModal.tsx`

**Placeholder Content:**
- Title: "Connection Code"
- Message: "Generate a code for [Name] to connect their mobile device"
- Note: "This feature is coming soon. The code will allow [Name] to link their mobile app to this dashboard."
- Close button

**Backend Endpoint (Placeholder):**
```typescript
// To be implemented later:
POST /api/v1/patients/{id}/generate-code
Response: {
  code: "123456",
  qr_code_url: "data:image/png;base64,...",
  expires_at: "2025-10-24T15:30:00Z"
}
```

**Deliverables:**
- [ ] Modal with placeholder content
- [ ] Backend endpoint documented

**Acceptance Criteria:**
- ✅ Modal opens from "Generate Code" button
- ✅ Shows friendly "coming soon" message
- ✅ Closes properly

---

## Phase 3: Patient Detail - Core Tabs

**Duration:** 2 days
**Goal:** Patient detail page with Overview, Routine, Conversations tabs

### Task 3.1: Patient Detail Layout & Header 🔴

**Time:** 2-3 hours

**Steps:**
1. Create patient detail page
2. Create patient detail header
3. Set up tab navigation
4. Implement data loading

**Components to Install:**
```bash
npx shadcn-ui@latest add tabs
```

**Files to Create:**
- `src/app/(dashboard)/patients/[id]/page.tsx`
- `src/app/(dashboard)/patients/[id]/loading.tsx`
- `src/components/patients/PatientDetailHeader.tsx`

**Header Specs:**
- Large avatar (left)
- Name + age (H1)
- Status badge
- Last activity ("Active 2 hours ago" in muted text)
- Quick actions (right):
  - "Edit" button
  - "Trigger Reminder" button (placeholder)
  - "Nudge" button (placeholder)

**Tabs:**
1. Overview
2. Routine
3. Reports
4. Conversations
5. Alerts
6. Notes to AI

**API Dependencies:**
- GET `/api/v1/patients/{id}` - Patient details

**Deliverables:**
- [ ] Patient detail page with header
- [ ] Tab navigation
- [ ] Loading state
- [ ] 404 handling (patient not found)

**Acceptance Criteria:**
- ✅ Page loads patient data from URL param
- ✅ Header shows all patient info
- ✅ Tabs are clickable
- ✅ URL updates when switching tabs (?tab=overview)
- ✅ Loading skeleton shows while fetching
- ✅ 404 page if patient doesn't exist

---

### Task 3.2: Overview Tab 🔴

**Time:** 3-4 hours

**Steps:**
1. Create KPI card components
2. Create activity timeline
3. Create AI insights card
4. Implement data fetching
5. Add empty states

**Files to Create:**
- `src/components/patients/PatientOverviewTab.tsx`
- `src/components/common/TimelineItem.tsx`
- `src/components/common/KPICard.tsx`
- `src/types/activity.ts`
- `src/lib/api/activity.ts`
- `src/hooks/useActivity.ts`

**KPI Cards (row of 3-4):**
1. **Today's Reminders**
   - Value: "3/5"
   - Label: "Completed today"
   - Icon: CheckCircle
   - Color: Success if > 80%, warning if < 60%

2. **Last Interaction**
   - Value: "2 hours ago"
   - Label: "Last conversation"
   - Icon: MessageCircle

3. **Current Mood**
   - Value: 😊 emoji based on recent sentiment
   - Label: "Positive" / "Neutral" / "Negative"
   - Icon: Heart

4. **Adherence (This Week)**
   - Value: "85%"
   - Label: "17/20 reminders"
   - Icon: TrendingUp

**Activity Timeline:**
- Left column (60% width)
- List of recent activities (last 20)
- Each item:
  - Icon (based on type)
  - Type label
  - Timestamp (relative)
  - Details (expandable)
- Activity types:
  - Heartbeat (green dot)
  - Conversation (message bubble)
  - Reminder response (check or X)
  - App open/close (phone icon)
  - Location update (map pin)
  - Emergency (alert icon)

**AI Insights Card:**
- Right sidebar (40% width)
- Title: "AI Insights"
- List of recent insights from Letta
- Each insight:
  - Confidence score badge
  - Title
  - Description (2 lines)
- "View all insights" link (goes to Insights tab)

**API Dependencies:**
- GET `/api/v1/patients/{id}/activity?limit=20`
  - Response: ActivityLogListResponse
- GET `/api/v1/schedules/patients/{id}/reminders?date=today`
  - For today's reminder count
- GET `/api/v1/conversations/patients/{id}/insights?limit=3`
  - For AI insights card

**Deliverables:**
- [ ] 4 KPI cards
- [ ] Activity timeline
- [ ] AI insights card
- [ ] Empty states
- [ ] Responsive layout

**Acceptance Criteria:**
- ✅ KPI cards show real data from API
- ✅ Activity timeline shows last 20 activities
- ✅ Activities grouped by date (Today, Yesterday, etc.)
- ✅ Icons match activity type
- ✅ Timestamps are relative ("2 hours ago")
- ✅ AI insights show confidence scores
- ✅ Empty states for no activity/no insights
- ✅ Responsive: stack on mobile
- ✅ All data auto-refreshes every 60 seconds

---

### Task 3.3: Routine Tab (Schedules) 🔴

**Time:** 4-5 hours

**Steps:**
1. Create schedule types & API helpers
2. Create schedule list component
3. Create schedule form
4. Create schedule calendar (optional, nice-to-have)
5. Implement CRUD operations

**Components to Install:**
```bash
npx shadcn-ui@latest add switch  # For active toggle
```

**Files to Create:**
- `src/types/schedule.ts`
- `src/lib/api/schedules.ts`
- `src/hooks/useSchedules.ts`
- `src/components/patients/PatientRoutineTab.tsx`
- `src/components/schedules/ScheduleList.tsx`
- `src/components/schedules/ScheduleForm.tsx`
- `src/components/schedules/ScheduleCalendar.tsx` (optional)

**Schedule List Specs:**
- Table or card list
- Columns:
  - Type chip (medication, meal, etc.) - color-coded
  - Label (e.g., "Morning Medication")
  - Time (e.g., "8:00 AM")
  - Recurrence (e.g., "Daily" / "Mon, Wed, Fri")
  - Active toggle (switch)
  - Actions: Edit, Delete

**Schedule Form (Drawer from right):**
- Title: "Add Schedule" / "Edit Schedule"
- Fields:
  - Title* (required)
  - Description
  - Schedule type* (select: medication, meal, exercise, other)
  - Time* (time picker)
  - Recurrence* (select: daily, weekly, custom)
  - Days of week (if weekly: checkboxes)
  - Reminder advance minutes (number input, default: 60)
  - Active (toggle, default: true)
- Buttons: Cancel / Save

**Delete Confirmation:**
- Dialog: "Delete this reminder?"
- Message: "This will remove '[title]' from [name]'s routine. This action cannot be undone."
- Buttons: Cancel / Delete (destructive)

**API Dependencies:**
- GET `/api/v1/schedules/patients/{id}/schedules`
- POST `/api/v1/schedules/patients/{id}/schedules`
- PATCH `/api/v1/schedules/schedules/{id}`
- DELETE `/api/v1/schedules/schedules/{id}`

**Deliverables:**
- [ ] Schedule list with all features
- [ ] Add/Edit schedule form
- [ ] Delete confirmation
- [ ] Empty state
- [ ] Loading state

**Acceptance Criteria:**
- ✅ List shows all patient schedules
- ✅ Can create new schedule
- ✅ Can edit existing schedule
- ✅ Can delete schedule with confirmation
- ✅ Active toggle updates immediately
- ✅ Form validation prevents invalid data
- ✅ List auto-refreshes after create/update/delete
- ✅ Empty state when no schedules
- ✅ Type chips color-coded
- ✅ Responsive: table becomes cards on mobile

---

### Task 3.4: Conversations Tab 🔴

**Time:** 3 hours

**Steps:**
1. Create conversation types & API helpers
2. Create conversation timeline component
3. Implement filtering
4. Add empty state

**Files to Create:**
- `src/types/conversation.ts`
- `src/lib/api/conversations.ts`
- `src/hooks/useConversations.ts`
- `src/components/patients/PatientConversationsTab.tsx`
- `src/components/conversations/ConversationTimeline.tsx`
- `src/components/conversations/ConversationMessage.tsx`

**Timeline Specs:**
- Chat-like layout
- AI messages: left side, gray bubble
- Patient messages: right side, blue bubble
- Each message:
  - Avatar (AI logo / Patient initials)
  - Message text
  - Timestamp below (relative)
  - Sentiment emoji (patient messages only)
  - Health mentions highlighted (yellow background)
  - Urgency indicator (if high/critical)

**Filter:**
- Dropdown or tabs: Today / 7 days / 30 days / All
- Optional: Search conversations (defer if time constrained)

**Empty State:**
- Icon: MessageCircle
- Title: "No conversations yet"
- Description: "Conversations with [name] will appear here"

**API Dependencies:**
- GET `/api/v1/conversations/patients/{id}/conversations?limit=100`

**Deliverables:**
- [ ] Conversation timeline
- [ ] Filter by date range
- [ ] Empty state
- [ ] Auto-scroll to bottom

**Acceptance Criteria:**
- ✅ Shows all conversations in chronological order
- ✅ AI vs Patient messages clearly distinguished
- ✅ Sentiment shown on patient messages
- ✅ Health mentions highlighted
- ✅ Filter updates conversation list
- ✅ Timestamps relative ("2 hours ago")
- ✅ Auto-scrolls to most recent
- ✅ Empty state when no conversations
- ✅ Responsive: messages stack nicely on mobile

---

## Phase 4: Alerts & Settings

**Duration:** 1 day
**Goal:** Alert management + caregiver settings

### Task 4.1: Patient Alerts Tab 🔴

**Time:** 2 hours

**Steps:**
1. Create alert types & API helpers
2. Create alert card component
3. Create patient alerts tab
4. Implement acknowledge functionality

**Files to Create:**
- `src/types/alert.ts`
- `src/lib/api/alerts.ts`
- `src/hooks/useAlerts.ts`
- `src/components/patients/PatientAlertsTab.tsx`
- `src/components/alerts/AlertCard.tsx`
- `src/components/alerts/SeverityBadge.tsx`

**Alert Card Specs:**
- Left border: 4px, severity color
- Severity badge (top right)
- Alert icon (type-based)
- Title (bold)
- Description (truncated to 2 lines)
- Timestamp (relative)
- Recommended action (highlighted)
- Status: "Acknowledged" or "Acknowledge" button
- Optional: "Nudge" button (placeholder)

**Severity Colors:**
- Low: Blue (#2196F3)
- Medium: Yellow (#F9A825)
- High: Orange (#F57C00)
- Critical: Red (#E53935)

**API Dependencies:**
- GET `/api/v1/conversations/patients/{id}/alerts`
- PATCH `/api/v1/conversations/alerts/{id}/acknowledge`

**Deliverables:**
- [ ] Alert list for specific patient
- [ ] Acknowledge functionality
- [ ] Empty state
- [ ] Filter by severity

**Acceptance Criteria:**
- ✅ Shows all alerts for patient
- ✅ Severity colors correct
- ✅ Can acknowledge alert
- ✅ Acknowledged alerts move to bottom
- ✅ Auto-refreshes every 30 seconds
- ✅ Empty state when no alerts
- ✅ Critical alerts emphasized (larger, red border)

---

### Task 4.2: Global Alerts Page 🔴

**Time:** 2-3 hours

**Steps:**
1. Create global alerts page
2. Add multi-patient support
3. Implement filtering
4. Add bulk acknowledge (optional)

**Files to Create:**
- `src/app/(dashboard)/alerts/page.tsx`
- `src/components/alerts/AlertList.tsx`
- `src/components/alerts/AlertFilter.tsx`

**Page Specs:**
- Header: "Alerts" + unacknowledged count badge
- Filter bar:
  - Severity filter (All / Low / Medium / High / Critical)
  - Patient filter (dropdown, all patients)
  - Status filter (All / Unacknowledged / Acknowledged)
- Alert list (same AlertCard component)
- Include patient name in each card (since global)
- Optional: Bulk select + "Acknowledge All" button

**API Dependencies:**
- GET `/api/v1/patients` (to get all patient IDs)
- GET `/api/v1/conversations/patients/{id}/alerts` (for each patient)
- PATCH `/api/v1/conversations/alerts/{id}/acknowledge`

**Deliverables:**
- [ ] Global alerts page
- [ ] Filter by severity, patient, status
- [ ] Show patient name in each alert
- [ ] Empty state

**Acceptance Criteria:**
- ✅ Shows alerts from all patients
- ✅ Unacknowledged alerts at top
- ✅ Filters work correctly
- ✅ Patient name visible in each alert
- ✅ Can acknowledge from global view
- ✅ Auto-refreshes every 30 seconds
- ✅ Empty state: "All clear. No open alerts." ✅

---

### Task 4.3: Settings Page 🔴

**Time:** 3-4 hours

**Steps:**
1. Create preferences types & API helpers
2. Create settings page
3. Implement all settings sections
4. Add save functionality

**Files to Create:**
- `src/types/preferences.ts`
- `src/lib/api/preferences.ts`
- `src/hooks/usePreferences.ts`
- `src/app/(dashboard)/settings/page.tsx`

**Settings Sections:**

**1. Profile Settings**
- Avatar upload (placeholder, show current avatar)
- First name (editable)
- Last name (editable)
- Email (editable)
- Phone number (editable)
- "Change Password" button → modal

**2. Notification Preferences**
- Toggle: Email notifications
- Toggle: SMS notifications
- Toggle: Push notifications
- Description: "Choose how you want to receive alerts and updates"

**3. Alert Preferences**
- Alert threshold: Dropdown (Low / Medium / High / Critical)
- Description: "Only show alerts at or above this severity level"

**4. Quiet Hours**
- Toggle: Enable quiet hours
- Start time picker (e.g., 22:00)
- End time picker (e.g., 07:00)
- Description: "No alerts during these hours (except critical)"

**5. Daily Summary**
- Time picker: Preferred daily summary time (e.g., 20:00)
- Description: "When would you like to receive daily summaries?"

**Change Password Modal:**
- Current password (required)
- New password (required, min 8 chars)
- Confirm new password (required, must match)
- Cancel / Save buttons

**API Dependencies:**
- GET `/api/v1/auth/me` - Profile info
- PATCH `/api/v1/auth/me` - Update profile
- GET `/api/v1/auth/me/preferences` - Preferences
- PATCH `/api/v1/auth/me/preferences` - Update preferences
- POST `/api/v1/auth/change-password` - Change password

**Deliverables:**
- [ ] All settings sections
- [ ] Save functionality
- [ ] Change password modal
- [ ] Success toast on save

**Acceptance Criteria:**
- ✅ Loads current settings from API
- ✅ Can update profile fields
- ✅ Can toggle notification preferences
- ✅ Can set alert threshold
- ✅ Can configure quiet hours
- ✅ Can set daily summary time
- ✅ Can change password
- ✅ Toast shows "Settings updated."
- ✅ Form validation prevents invalid data

---

## Phase 5: Advanced Features

**Duration:** 1-2 days
**Goal:** Reports tab, Notes tab, analytics

### Task 5.1: Reports Tab 🟡

**Time:** 2-3 hours

**Steps:**
1. Create daily summary component
2. Create reports tab
3. Add date selector
4. Implement placeholder buttons

**Files to Create:**
- `src/components/patients/PatientReportsTab.tsx`
- `src/components/conversations/DailySummaryCard.tsx`
- `src/hooks/useSummaries.ts`

**Daily Summary Card:**
- Date header (e.g., "Today - October 24, 2025")
- Overview paragraph (AI-generated text)
- Adherence stats section:
  - "3/5 reminders completed (60%)"
  - Progress bar
- Mood summary:
  - Emoji (😊 / 😐 / 😟)
  - Label (Positive / Neutral / Negative)
- Key events list:
  - Bullet points of important conversations
  - Health mentions
- Action buttons:
  - "Download PDF" (placeholder toast: "Coming soon")
  - "Play Audio" (placeholder toast: "Coming soon")

**Date Selector:**
- Tabs or dropdown: Today / Yesterday / Pick date
- Calendar picker for custom date

**API Dependencies:**
- GET `/api/v1/conversations/patients/{id}/summaries?date=2025-10-24`

**Deliverables:**
- [ ] Reports tab with daily summaries
- [ ] Date selector
- [ ] Summary cards with all sections
- [ ] Empty state

**Acceptance Criteria:**
- ✅ Shows summary for selected date
- ✅ Date selector works
- ✅ All summary data displays correctly
- ✅ Placeholder buttons show toast
- ✅ Empty state: "No reports yet..."

---

### Task 5.2: Notes to AI Tab 🟢 (Placeholder)

**Time:** 1 hour

**Steps:**
1. Create placeholder notes tab
2. Add "coming soon" message
3. Document backend endpoint needed

**Files to Create:**
- `src/components/patients/PatientNotesTab.tsx`

**Placeholder Content:**
- Title: "Notes to AI"
- Description: "Add context to help the AI better understand [name]'s needs and preferences"
- Message: "This feature is coming soon. You'll be able to add notes about:"
  - Medication locations
  - Routine preferences
  - Names and relationships
  - Special instructions
- Icon: FileText

**Backend Endpoint (Document):**
```typescript
// To be implemented:
POST /api/v1/patients/{id}/notes
PATCH /api/v1/patients/{id}/notes
GET /api/v1/patients/{id}/notes
```

**Deliverables:**
- [ ] Placeholder tab
- [ ] Backend endpoint documented

**Acceptance Criteria:**
- ✅ Tab shows friendly placeholder
- ✅ Explains what feature will do

---

### Task 5.3: Analytics Components 🟢

**Time:** 3-4 hours (optional)

**Steps:**
1. Install Recharts
2. Create chart components
3. Add to Overview tab
4. Create analytics page (optional)

**Install:**
```bash
pnpm add recharts
```

**Components to Create:**
- `src/components/analytics/SentimentChart.tsx` - Line or area chart
- `src/components/analytics/AdherenceChart.tsx` - Bar chart
- `src/components/analytics/ActivityChart.tsx` - Line chart

**SentimentChart:**
- X-axis: Dates (last 7/30 days)
- Y-axis: Percentage
- 3 lines/areas: Positive (green), Neutral (gray), Negative (red)
- Tooltip on hover

**AdherenceChart:**
- X-axis: Days of week
- Y-axis: Percentage
- Bar for each day
- Color: Green if ≥80%, Yellow if 60-79%, Red if <60%

**API Dependencies:**
- GET `/api/v1/voice/patients/{id}/conversation-analytics`

**Deliverables:**
- [ ] Sentiment chart
- [ ] Adherence chart (optional)
- [ ] Activity chart (optional)

**Acceptance Criteria:**
- ✅ Charts render correctly
- ✅ Data from API
- ✅ Responsive
- ✅ Tooltips work

---

## Phase 6: Polish & Testing

**Duration:** 1-2 days
**Goal:** Production ready

### Task 6.1: Responsive Design Polish 🔴

**Time:** 3-4 hours

**Steps:**
1. Test all pages on mobile (375px)
2. Test on tablet (768px)
3. Fix any layout issues
4. Ensure touch targets ≥44px
5. Test navigation on mobile

**Checklist:**
- [ ] Sidebar collapses to drawer on mobile
- [ ] Patient cards stack properly
- [ ] Forms are single-column on mobile
- [ ] Tables become cards on mobile
- [ ] Modals fit mobile screens
- [ ] Touch targets large enough
- [ ] Text readable (min 16px on mobile)

**Acceptance Criteria:**
- ✅ All pages work on 375px width
- ✅ No horizontal scrolling
- ✅ All buttons tappable
- ✅ Forms usable on mobile
- ✅ Navigation works

---

### Task 6.2: Loading & Error States 🔴

**Time:** 2 hours

**Steps:**
1. Add loading skeletons to all pages
2. Add error boundaries
3. Add retry buttons for failed requests
4. Test with slow network
5. Test with API offline

**Files to Create:**
- `src/components/common/ErrorBoundary.tsx`
- `src/components/common/ErrorState.tsx`
- `src/app/(dashboard)/error.tsx` - Global error page

**Deliverables:**
- [ ] Loading skeletons for all lists
- [ ] Error states for failed API calls
- [ ] Retry buttons
- [ ] Offline indicator

**Acceptance Criteria:**
- ✅ Shows loading skeletons while fetching
- ✅ Shows error message if API fails
- ✅ Retry button refetches data
- ✅ Offline banner shows when no connection
- ✅ Error boundary catches React errors

---

### Task 6.3: Accessibility 🟡

**Time:** 2 hours

**Steps:**
1. Add ARIA labels
2. Test keyboard navigation
3. Test with screen reader
4. Check color contrast
5. Add focus visible styles

**Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible on all elements
- [ ] Alt text on images
- [ ] ARIA labels on icon buttons
- [ ] Form fields have labels
- [ ] Modals trap focus
- [ ] Color contrast ≥4.5:1

**Acceptance Criteria:**
- ✅ Can navigate with Tab key
- ✅ Can use all features with keyboard only
- ✅ Screen reader announces elements correctly
- ✅ Color contrast passes WCAG AA

---

### Task 6.4: Performance Optimization 🟢

**Time:** 2 hours (optional)

**Steps:**
1. Lazy load chart components
2. Optimize images
3. Code splitting for routes
4. Analyze bundle size
5. Add loading priorities

**Tools:**
- Lighthouse
- Next.js bundle analyzer

**Targets:**
- First Contentful Paint < 2s
- Time to Interactive < 3s
- Lighthouse score ≥90

**Deliverables:**
- [ ] Lazy loaded charts
- [ ] Optimized images
- [ ] Bundle analyzed

---

### Task 6.5: Final Testing 🔴

**Time:** 3-4 hours

**Test Scenarios:**

**1. Full User Journey:**
- Register new account
- Add first patient (all fields)
- View patient detail
- Create medication schedule
- View conversations
- Acknowledge alert
- Update settings
- Logout and login

**2. Edge Cases:**
- Empty states (no patients, no alerts, etc.)
- Long names (overflow handling)
- Many alerts (scrolling)
- Network errors (retry)
- Invalid form data (validation)

**3. Cross-browser:**
- Chrome
- Firefox
- Safari
- Mobile Safari
- Mobile Chrome

**Checklist:**
- [ ] All user journeys work
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All links work
- [ ] All forms validate
- [ ] All API calls succeed
- [ ] Responsive on all breakpoints
- [ ] Works on all browsers

---

## Acceptance Criteria Summary

### Phase 1: Setup & Auth ✅
- [ ] Project setup complete
- [ ] Can register new account
- [ ] Can login
- [ ] Tokens saved and auto-refresh
- [ ] Dashboard layout with sidebar + topbar
- [ ] Logout works

### Phase 2: Care Circle ✅
- [ ] Patient list loads from API
- [ ] Can create new patient (3-step form)
- [ ] Patient cards show all info
- [ ] Search filters patients
- [ ] Empty state for no patients

### Phase 3: Patient Detail ✅
- [ ] Patient detail page loads
- [ ] Overview tab shows KPIs + activity
- [ ] Routine tab manages schedules
- [ ] Conversations tab shows history
- [ ] All tabs functional

### Phase 4: Alerts & Settings ✅
- [ ] Patient alerts tab works
- [ ] Global alerts page works
- [ ] Can acknowledge alerts
- [ ] Settings page with all preferences
- [ ] Can update all settings

### Phase 5: Advanced ✅
- [ ] Reports tab shows daily summaries
- [ ] Notes tab has placeholder
- [ ] Charts render (optional)

### Phase 6: Polish ✅
- [ ] Fully responsive
- [ ] Loading states everywhere
- [ ] Error handling
- [ ] Keyboard accessible
- [ ] All user journeys tested

---

## Risk Mitigation

### Risk 1: Backend API Issues
**Mitigation:**
- Test API endpoints with Postman first
- Create mock data fallbacks if API fails
- Document any API bugs found
- Have backend documentation ready

### Risk 2: Time Constraints
**Mitigation:**
- Prioritize Phase 1-4 (critical features)
- Phase 5 can be deferred
- Use placeholders for nice-to-have features
- Focus on working MVP first, polish later

### Risk 3: Design Complexity
**Mitigation:**
- Use shadcn/ui components (pre-built)
- Reference design doc for specifications
- Simplify if needed (e.g., table instead of calendar)
- Get feedback early

### Risk 4: Data Loading Performance
**Mitigation:**
- Use React Query caching
- Implement pagination where needed
- Show loading skeletons
- Optimize API calls (request only what's needed)

---

## Quick Reference

### Critical Path (Must Have)
1. Phase 1: Auth + Layout (2 days)
2. Phase 2: Care Circle + Add Patient (2 days)
3. Phase 3.1-3.2: Patient Detail (Overview + Routine) (1.5 days)
4. Phase 4: Alerts + Settings (1 day)
5. Phase 6.1-6.2: Responsive + Error handling (0.5 day)

**Total:** 7 days minimum

### Nice to Have (If Time Permits)
- Phase 3.4: Conversations tab (1 day)
- Phase 5.1: Reports tab (0.5 day)
- Phase 5.3: Analytics charts (0.5 day)
- Phase 6.3-6.4: Accessibility + Performance (0.5 day)

**Total with nice-to-have:** 9-10 days

---

**Document Status:** ✅ Complete
**Last Updated:** October 24, 2025
**Next:** Begin Phase 1 development
