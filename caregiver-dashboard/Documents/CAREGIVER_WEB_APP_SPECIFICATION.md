# Caregiver Web Dashboard - Complete Technical Specification

**Project:** Elder Companion AI - Caregiver Dashboard
**Date:** October 24, 2025
**Status:** Ready for Development
**Backend Status:** 99% Complete (49 endpoints ready)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Design System](#design-system)
5. [File Structure](#file-structure)
6. [Component Library](#component-library)
7. [Page Specifications](#page-specifications)
8. [API Integration](#api-integration)
9. [Authentication Flow](#authentication-flow)
10. [State Management](#state-management)
11. [Responsive Design](#responsive-design)
12. [Development Workflow](#development-workflow)
13. [Deployment Strategy](#deployment-strategy)

---

## Executive Summary

### Project Overview
Building a web dashboard for caregivers to monitor and manage elderly patients using the Elder Companion AI system. The dashboard provides real-time monitoring, schedule management, conversation history, AI-powered insights, and alert management.

### Key Features
- ✅ Patient management ("Care Circle")
- ✅ Multi-step patient onboarding
- ✅ Real-time activity monitoring
- ✅ Schedule & reminder management
- ✅ Conversation history with sentiment analysis
- ✅ AI-generated daily summaries & insights
- ✅ Alert management with inactivity detection
- ✅ Advanced caregiver preferences

### Development Timeline
- **Setup & Auth:** 2 days
- **Core Features:** 5 days
- **Polish & Testing:** 2-3 days
- **Total:** 9-10 days

---

## Technology Stack

### Frontend Framework
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "ui_components": "shadcn/ui (Radix UI primitives)",
  "state_management": "TanStack Query (React Query)",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "calendar": "React Big Calendar",
  "icons": "Lucide React",
  "date_handling": "date-fns"
}
```

### Backend Integration
```json
{
  "api_url": "https://api.eldercompanion.app (Railway)",
  "auth": "JWT (custom middleware)",
  "api_client": "Axios with interceptors",
  "total_endpoints": 49,
  "caregiver_endpoints": 40
}
```

### Deployment
```json
{
  "frontend_host": "Vercel",
  "backend_host": "Railway",
  "architecture": "Separate services communicating via REST API"
}
```

### Development Tools
```json
{
  "package_manager": "pnpm",
  "linting": "ESLint + Prettier",
  "type_checking": "TypeScript strict mode",
  "git_hooks": "Husky + lint-staged"
}
```

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Caregiver)                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│              VERCEL (Frontend - Next.js 14)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  App Router Pages                                    │   │
│  │  ├─ (auth)/login, register                          │   │
│  │  ├─ dashboard                                        │   │
│  │  ├─ care-circle (patient list)                      │   │
│  │  ├─ patients/[id] (detail with 6 tabs)             │   │
│  │  ├─ alerts                                           │   │
│  │  └─ settings                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  State Management (TanStack Query)                   │   │
│  │  ├─ API call caching                                │   │
│  │  ├─ Optimistic updates                              │   │
│  │  ├─ Background refetching                           │   │
│  │  └─ Error handling                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Components (shadcn/ui)                              │   │
│  │  ├─ PatientCard, AlertCard, ScheduleCalendar       │   │
│  │  ├─ Forms, Modals, Drawers                         │   │
│  │  └─ Charts (Recharts)                              │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS REST API Calls
                     │ Authorization: Bearer <JWT>
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              RAILWAY (Backend - FastAPI)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Endpoints (49 total)                           │   │
│  │  ├─ Auth (8): login, register, preferences         │   │
│  │  ├─ Patients (8): CRUD, activity                   │   │
│  │  ├─ Schedules (9): CRUD, reminders                 │   │
│  │  ├─ Conversations (7): history, summaries          │   │
│  │  ├─ Alerts (3): list, acknowledge                  │   │
│  │  └─ Analytics (2): conversation analytics          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AI Services                                         │   │
│  │  ├─ Claude (conversation analysis)                  │   │
│  │  ├─ Letta (long-term memory)                       │   │
│  │  └─ Chroma (semantic search)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Background Jobs (5 jobs)                           │   │
│  │  ├─ Reminder generation (every 60s)                │   │
│  │  ├─ Inactivity detection (every 15 min)           │   │
│  │  ├─ Daily summaries (midnight)                     │   │
│  │  └─ Weekly insights (Monday 6 AM)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database (11 tables)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Example: Viewing Patient Dashboard

```
User clicks "View Mary" in Care Circle
         ↓
Next.js router navigates to /patients/mary-uuid
         ↓
Page component loads, triggers React Query hooks:
  - usePatient(id)
  - usePatientActivity(id)
  - useAlerts(id)
  - useSchedules(id)
  - useSummaries(id)
         ↓
React Query checks cache:
  - If fresh (< staleTime): Return cached data instantly
  - If stale: Return cached + fetch in background
  - If missing: Show loading, fetch data
         ↓
API calls sent to Railway backend:
  GET /api/v1/patients/{id}           (patient details)
  GET /api/v1/patients/{id}/activity  (activity timeline)
  GET /api/v1/conversations/patients/{id}/alerts  (alerts)
  GET /api/v1/schedules/patients/{id}/schedules   (schedules)
  GET /api/v1/conversations/patients/{id}/summaries (summaries)
         ↓
Backend returns JSON responses with JWT validation
         ↓
React Query caches responses (5 min for patient, 30s for alerts)
         ↓
Components render with data
         ↓
User sees: Patient profile, activity timeline, alerts, schedules
         ↓
Every 30 seconds: React Query refetches alerts in background
         ↓
If new alert arrives: UI updates automatically
```

---

## Design System

### Brand Identity
**Tone:** Warm + professional. Caring, calm, and trustworthy.

### Color Tokens

```typescript
// tailwind.config.ts
export const colors = {
  primary: '#3566E5',      // Primary blue (buttons, links)
  accent: '#F47C63',       // Coral accent (secondary actions)
  bg: '#F9FAFB',           // Light gray background
  surface: '#FFFFFF',      // White cards/surfaces
  textPrimary: '#1A1A1A',  // Nearly black text
  textSecondary: '#555555',// Gray text
  success: '#4CAF50',      // Green (completed, positive)
  warn: '#F9A825',         // Yellow/amber (warnings)
  error: '#E53935',        // Red (errors, critical)

  // Severity colors (for alerts)
  severityLow: '#2196F3',      // Blue
  severityMedium: '#F9A825',   // Yellow
  severityHigh: '#F57C00',     // Orange
  severityCritical: '#E53935', // Red
}
```

### Typography

```typescript
// Font families (add to next.config.js + Tailwind)
const fonts = {
  heading: "'Playfair Display', serif",  // Elegant serif for headings
  body: "'Nunito Sans', sans-serif",     // Humanist sans for body/UI
}

// Type scale
H1: 32-40px / font-bold / text-primary
H2: 24-28px / font-semibold / text-primary
H3: 20-24px / font-semibold / text-primary
Body: 18px / font-normal / text-primary
Caption: 14px / font-normal / text-secondary
Small: 12px / font-normal / text-secondary
```

### Spacing System

```typescript
// Using 8px grid (Tailwind default)
const spacing = {
  xs: '4px',    // 0.5
  sm: '8px',    // 1
  md: '16px',   // 2
  lg: '24px',   // 3
  xl: '32px',   // 4
  '2xl': '48px', // 6
  '3xl': '64px', // 8
}
```

### Shape & Elevation

```typescript
// Border radius
const borderRadius = {
  sm: '8px',   // Small elements (chips, tags)
  md: '12px',  // Buttons, inputs
  lg: '16px',  // Cards
  xl: '20px',  // Modals
  full: '9999px', // Circles/pills
}

// Shadows (soft, subtle)
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
}
```

### Motion & Transitions

```typescript
// Animation durations
const transitions = {
  fast: '150ms',
  normal: '200ms',  // Default for hover/focus
  slow: '300ms',
}

// Easing
const easing = 'ease-in-out'

// Apply to:
// - Button hover/active states
// - Modal fade-in/out
// - Drawer slide-in/out
// - Tab switching
// - Tooltip appearance
```

### Accessibility

```typescript
// Requirements
- Minimum contrast ratio: 4.5:1 for normal text
- Visible focus rings on all interactive elements
- Keyboard navigation for all functionality
- ARIA labels for screen readers
- Semantic HTML (nav, main, aside, article)
- Alt text for all images
- Error messages associated with form fields
```

---

## File Structure

```
/Users/gaurav/Elda/caregiver-dashboard/
├── .next/                          # Next.js build output (gitignored)
├── node_modules/                   # Dependencies (gitignored)
├── public/                         # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── empty-states/
│   │   │   ├── no-patients.svg
│   │   │   ├── no-alerts.svg
│   │   │   └── no-conversations.svg
│   │   └── avatars/
│   │       └── default-avatar.png
│   └── fonts/
│       ├── PlayfairDisplay-Bold.woff2
│       └── NunitoSans-Regular.woff2
│
├── src/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── (auth)/                 # Auth route group (no layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/            # Dashboard route group (shared layout)
│   │   │   ├── layout.tsx          # Main dashboard layout (sidebar + topbar)
│   │   │   ├── page.tsx            # Dashboard home redirect
│   │   │   │
│   │   │   ├── care-circle/
│   │   │   │   └── page.tsx        # Patient list page
│   │   │   │
│   │   │   ├── patients/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Patient detail (tabs)
│   │   │   │       └── loading.tsx # Loading skeleton
│   │   │   │
│   │   │   ├── alerts/
│   │   │   │   └── page.tsx        # Global alerts page
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx        # Settings page
│   │   │
│   │   ├── api/                    # API routes (optional, for proxying)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/route.ts
│   │   │
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page (redirect to /care-circle)
│   │   └── globals.css             # Global styles + Tailwind imports
│   │
│   ├── components/                 # React components
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── ... (add as needed)
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   │
│   │   ├── patients/               # Patient-related components
│   │   │   ├── PatientCard.tsx
│   │   │   ├── PatientList.tsx
│   │   │   ├── AddPatientModal.tsx
│   │   │   ├── PatientDetailHeader.tsx
│   │   │   ├── PatientOverviewTab.tsx
│   │   │   ├── PatientRoutineTab.tsx
│   │   │   ├── PatientReportsTab.tsx
│   │   │   ├── PatientConversationsTab.tsx
│   │   │   ├── PatientAlertsTab.tsx
│   │   │   ├── PatientNotesTab.tsx
│   │   │   └── GenerateCodeModal.tsx
│   │   │
│   │   ├── schedules/              # Schedule components
│   │   │   ├── ScheduleCalendar.tsx
│   │   │   ├── ScheduleList.tsx
│   │   │   ├── ScheduleForm.tsx
│   │   │   ├── ScheduleItem.tsx
│   │   │   └── ReminderCard.tsx
│   │   │
│   │   ├── alerts/                 # Alert components
│   │   │   ├── AlertCard.tsx
│   │   │   ├── AlertList.tsx
│   │   │   ├── AlertFilter.tsx
│   │   │   └── AlertBadge.tsx
│   │   │
│   │   ├── conversations/          # Conversation components
│   │   │   ├── ConversationTimeline.tsx
│   │   │   ├── ConversationMessage.tsx
│   │   │   └── ConversationFilter.tsx
│   │   │
│   │   ├── analytics/              # Analytics components
│   │   │   ├── SentimentChart.tsx
│   │   │   ├── AdherenceChart.tsx
│   │   │   ├── ActivityChart.tsx
│   │   │   └── HealthTopicsChart.tsx
│   │   │
│   │   ├── common/                 # Common/shared components
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── StatusChip.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   └── TimelineItem.tsx
│   │   │
│   │   └── forms/                  # Form components
│   │       ├── FormField.tsx
│   │       ├── FormError.tsx
│   │       ├── MultiStepForm.tsx
│   │       └── ProgressBar.tsx
│   │
│   ├── lib/                        # Utility functions
│   │   ├── api/
│   │   │   ├── axios.ts            # Axios instance with interceptors
│   │   │   ├── auth.ts             # Auth API calls
│   │   │   ├── patients.ts         # Patient API calls
│   │   │   ├── schedules.ts        # Schedule API calls
│   │   │   ├── alerts.ts           # Alert API calls
│   │   │   ├── conversations.ts    # Conversation API calls
│   │   │   └── analytics.ts        # Analytics API calls
│   │   │
│   │   ├── auth/
│   │   │   ├── jwt.ts              # JWT token handling
│   │   │   ├── middleware.ts       # Auth middleware
│   │   │   └── storage.ts          # Token storage (localStorage)
│   │   │
│   │   ├── utils.ts                # General utilities
│   │   ├── cn.ts                   # className utility (clsx + tailwind-merge)
│   │   ├── format.ts               # Date/time formatting
│   │   └── validation.ts           # Form validation helpers
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── usePatients.ts          # Patient data hooks
│   │   ├── usePatient.ts           # Single patient hook
│   │   ├── useSchedules.ts         # Schedule hooks
│   │   ├── useAlerts.ts            # Alert hooks
│   │   ├── useConversations.ts     # Conversation hooks
│   │   ├── useAnalytics.ts         # Analytics hooks
│   │   ├── usePreferences.ts       # Caregiver preferences hook
│   │   └── useDebounce.ts          # Debounce utility hook
│   │
│   ├── types/                      # TypeScript types
│   │   ├── patient.ts              # Patient types
│   │   ├── schedule.ts             # Schedule & reminder types
│   │   ├── alert.ts                # Alert types
│   │   ├── conversation.ts         # Conversation types
│   │   ├── auth.ts                 # Auth types
│   │   ├── analytics.ts            # Analytics types
│   │   └── common.ts               # Common/shared types
│   │
│   └── config/                     # Configuration
│       ├── constants.ts            # App constants
│       ├── routes.ts               # Route definitions
│       └── env.ts                  # Environment variables (validated)
│
├── .env.local                      # Environment variables (gitignored)
├── .env.example                    # Example env file
├── .eslintrc.json                  # ESLint config
├── .prettierrc                     # Prettier config
├── .gitignore
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
├── pnpm-lock.yaml                  # Lock file
├── components.json                 # shadcn/ui config
└── README.md                       # Project documentation
```

---

## Component Library

### Core Components (shadcn/ui)

These will be installed via shadcn/ui CLI:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add skeleton
```

### Custom Component Specifications

#### 1. PatientCard

**Purpose:** Display patient in Care Circle grid
**Props:**
```typescript
interface PatientCardProps {
  patient: Patient;
  onView: (id: string) => void;
  onTriggerReminder?: (id: string) => void; // Placeholder
}
```

**Design:**
- White card with shadow
- Avatar (profile photo or initials)
- Name + age
- Status chip (Active/Pending)
- Last activity timestamp
- Alert count badge (if > 0)
- Quick actions: View button, Trigger Reminder button
- Hover: slight elevation increase
- Click: navigate to patient detail

#### 2. AddPatientModal

**Purpose:** Multi-step form for adding new patient
**Props:**
```typescript
interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
}
```

**Steps:**
1. **Basic Info** (Step 1/3)
   - First name, last name (required)
   - Date of birth (date picker)
   - Gender (select)
   - Relationship (input)
   - Phone number
   - Profile photo (upload - placeholder)
   - Progress bar at top

2. **Health & Routine** (Step 2/3)
   - Medical conditions (multi-input)
   - Medications (multi-input)
   - Allergies (multi-input)
   - Dietary restrictions (multi-input)
   - Emergency contact name + phone

3. **Preferences** (Step 3/3)
   - Timezone (select)
   - Preferred voice (male/female/neutral)
   - Communication style (friendly/formal/casual)
   - Language (select)

**Buttons:** Back / Next / Save
**Success:** Show success modal with "View Profile" / "Generate Code" buttons

#### 3. PatientDetailHeader

**Purpose:** Header for patient detail page
**Props:**
```typescript
interface PatientDetailHeaderProps {
  patient: Patient;
  onTriggerReminder?: () => void;  // Placeholder
  onNudge?: () => void;            // Placeholder
  onEdit: () => void;
}
```

**Design:**
- Avatar (large, left)
- Name + age
- Status badge
- Last activity ("Active 2 hours ago")
- Quick action buttons: Trigger Reminder, Nudge, Edit
- Responsive: stack on mobile

#### 4. AlertCard

**Purpose:** Display alert in list/inbox
**Props:**
```typescript
interface AlertCardProps {
  alert: Alert;
  patient?: Patient;  // Optional if showing patient name
  onAcknowledge: (id: string) => void;
  onNudge?: (id: string) => void;  // Placeholder
}
```

**Design:**
- Severity color left border (4px)
- Severity badge (top right)
- Alert icon (based on type)
- Title (bold)
- Description (2 lines, truncated)
- Timestamp (relative, e.g., "2 hours ago")
- Patient name (if in global view)
- Recommended action (highlighted)
- Acknowledge button (primary)
- Nudge button (secondary, optional)
- Hover: slight background color

#### 5. ScheduleCalendar

**Purpose:** Calendar view of schedules
**Props:**
```typescript
interface ScheduleCalendarProps {
  schedules: Schedule[];
  onEventClick: (schedule: Schedule) => void;
  onDateSelect: (date: Date) => void;
}
```

**Uses:** react-big-calendar
**Features:**
- Month/week/day views
- Color-coded by schedule type
- Click event: open schedule drawer
- Click date: create new schedule for that date

#### 6. ConversationTimeline

**Purpose:** Chat-like conversation history
**Props:**
```typescript
interface ConversationTimelineProps {
  conversations: Conversation[];
  patientName: string;
}
```

**Design:**
- Timeline/chat layout
- AI messages: left, gray bubble
- Patient messages: right, blue bubble
- Avatar initials (AI vs Patient)
- Timestamp below each message
- Sentiment emoji next to patient messages
- Health mentions highlighted (yellow background)
- Urgency indicator (if high/critical)
- Auto-scroll to bottom
- Filter: Today / 7 days / 30 days

#### 7. SentimentChart

**Purpose:** Visualize sentiment trends
**Props:**
```typescript
interface SentimentChartProps {
  data: { date: string; positive: number; neutral: number; negative: number }[];
}
```

**Uses:** Recharts (AreaChart or BarChart)
**Design:**
- X-axis: dates
- Y-axis: percentage or count
- 3 areas/bars: positive (green), neutral (gray), negative (red)
- Tooltip: show details on hover
- Responsive: adjust height for mobile

#### 8. EmptyState

**Purpose:** Show friendly message when no data
**Props:**
```typescript
interface EmptyStateProps {
  icon?: ReactNode;
  illustration?: string;  // Image path
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Examples:**
- No patients: "Let's start by caring for someone you love ❤️"
- No alerts: "All clear. No open alerts."
- No conversations: "Conversations will appear here."

---

## Page Specifications

### 1. Login Page (`/login`)

**Route:** `/login`
**Layout:** AuthLayout (centered, no sidebar)

**Components:**
- Logo + wordmark
- H1: "Welcome back"
- Email input
- Password input
- "Forgot password?" link (placeholder)
- Login button (primary, full width)
- "Don't have an account? Register" link

**API Calls:**
```typescript
POST /api/v1/auth/login
Body: { email, password }
Response: { access_token, refresh_token, caregiver }
```

**Flow:**
1. User enters email + password
2. Submit → call API
3. Success: Save tokens → redirect to /care-circle
4. Error: Show error toast

**Validation:**
- Email: valid email format
- Password: min 8 characters

---

### 2. Register Page (`/register`)

**Route:** `/register`
**Layout:** AuthLayout

**Components:**
- Logo + wordmark
- H1: "Create your account"
- First name, last name inputs
- Email input
- Phone input (optional)
- Password input
- Confirm password input
- Register button
- "Already have an account? Login" link

**API Calls:**
```typescript
POST /api/v1/auth/register
Body: { first_name, last_name, email, phone_number?, password }
Response: { access_token, refresh_token, caregiver }
```

**Flow:**
1. User fills form
2. Submit → call API
3. Success: Save tokens → redirect to /care-circle (shows empty state)
4. Error: Show error messages

**Validation:**
- All required fields filled
- Email: valid format
- Password: min 8 chars, confirm matches

---

### 3. Care Circle Page (`/care-circle`)

**Route:** `/care-circle`
**Layout:** DashboardLayout (sidebar + topbar)

**Header:**
- H1: "Care Circle"
- "Add Loved One" button (primary, right)

**Content:**
- Grid of PatientCard components (3 columns on desktop, 1 on mobile)
- Each card shows: avatar, name, age, status, last activity, alert count
- Click card: navigate to /patients/[id]

**Empty State:**
- Illustration (heart + elderly person)
- "Let's start by caring for someone you love ❤️"
- "Add Loved One" button

**API Calls:**
```typescript
GET /api/v1/patients
Response: Patient[]
```

**Features:**
- Search bar (filter by name)
- Loading skeletons while fetching
- Error banner if API fails
- Real-time alert count badges
- "Trigger Reminder" quick action (placeholder)

---

### 4. Patient Detail Page (`/patients/[id]`)

**Route:** `/patients/[id]`
**Layout:** DashboardLayout

**Header:** PatientDetailHeader component

**Tabs:**
1. Overview
2. Routine
3. Reports
4. Conversations
5. Alerts
6. Notes to AI

**API Calls (on page load):**
```typescript
GET /api/v1/patients/{id}
GET /api/v1/patients/{id}/activity
GET /api/v1/conversations/patients/{id}/alerts
GET /api/v1/schedules/patients/{id}/schedules
GET /api/v1/conversations/patients/{id}/summaries
```

#### Tab 1: Overview

**Components:**
- KPI Cards (row of 3-4 cards)
  - Today's reminders: "3/5 completed"
  - Last interaction: "2 hours ago"
  - Current mood: 😊 Positive
  - Adherence this week: "85%"

- Activity Timeline (left, 60% width)
  - List of recent activities
  - Each item: icon, type, timestamp, details
  - Types: conversation, reminder, heartbeat, app_open, etc.
  - Click item: expand details

- AI Insights Card (right sidebar, 40% width)
  - H3: "AI Insights"
  - List of insights from Letta
  - Each insight: confidence score, description
  - "View all insights" link

**Empty States:**
- No activity: "No activity yet today"
- No insights: "AI is learning about [name]'s patterns"

#### Tab 2: Routine

**Components:**
- ScheduleCalendar (calendar view)
- ScheduleList (list view below calendar)
- "Add Schedule" button (floating action or header)

**Table Columns:**
- Type chip (medication, meal, etc.)
- Label (e.g., "Morning Medication")
- Time window (e.g., "8:00 AM")
- Active toggle
- Actions: Edit, Delete

**Drawer:** ScheduleForm (slide in from right)
- Title, description
- Schedule type (select)
- Time (time picker)
- Recurrence: daily / weekly / custom
- Days of week (if weekly)
- Reminder advance (minutes)
- Active toggle
- Save / Cancel buttons

**Delete Confirmation:**
- Modal: "Delete this reminder?"
- "This will remove [title] from [name]'s routine."
- Cancel / Delete buttons

**API Calls:**
```typescript
GET /api/v1/schedules/patients/{id}/schedules
POST /api/v1/schedules/patients/{id}/schedules
PATCH /api/v1/schedules/schedules/{id}
DELETE /api/v1/schedules/schedules/{id}
```

#### Tab 3: Reports

**Components:**
- Date selector (Today / Yesterday / Pick date)
- DailySummaryCard
  - Date + day of week
  - Overview paragraph (AI-generated)
  - Adherence stats: "3/5 reminders completed (60%)"
  - Mood summary: emoji + description
  - Event list (key conversations, health mentions)
  - Download PDF button (placeholder)
  - Play Audio button (placeholder)

**Empty State:**
- "No reports yet. After today's check-in, a summary will appear here."

**API Calls:**
```typescript
GET /api/v1/conversations/patients/{id}/summaries?date=2025-10-24
```

#### Tab 4: Conversations

**Component:** ConversationTimeline

**Features:**
- Chat-style layout (AI left, patient right)
- Filter: Today / 7 days / 30 days / All
- Search conversations (placeholder)
- Export conversations (placeholder)

**Empty State:**
- "Conversations will appear here."

**API Calls:**
```typescript
GET /api/v1/conversations/patients/{id}/conversations?limit=100
```

#### Tab 5: Alerts

**Components:**
- AlertList (table or list of AlertCard)
- Filter: All / Unacknowledged / Acknowledged
- Filter by severity

**Table Columns:**
- Severity badge
- Time (relative)
- Message (title + description)
- Status (acknowledged or not)
- Actions: Acknowledge, Nudge (placeholder)

**Empty State:**
- "All clear. No open alerts."

**API Calls:**
```typescript
GET /api/v1/conversations/patients/{id}/alerts
PATCH /api/v1/conversations/alerts/{id}/acknowledge
```

#### Tab 6: Notes to AI (Placeholder)

**Components:**
- Rich text editor (placeholder for now, use textarea)
- Template chips: "Medication location", "Routine preferences", "Names & relations"
- Save button
- Version timeline (right sidebar) - placeholder

**API:** Not yet implemented, will need:
```typescript
POST /api/v1/patients/{id}/notes  // Create/update notes
GET /api/v1/patients/{id}/notes   // Get current notes
```

**For now:** Show placeholder with message:
"Notes to AI feature coming soon. You'll be able to add context that helps the AI better understand [name]'s needs."

---

### 5. Global Alerts Page (`/alerts`)

**Route:** `/alerts`
**Layout:** DashboardLayout

**Header:**
- H1: "Alerts"
- Badge showing unacknowledged count

**Filter Bar:**
- Filter by severity (All / Low / Medium / High / Critical)
- Filter by patient (dropdown)
- Filter by status (All / Unacknowledged / Acknowledged)
- Date range picker

**Content:**
- Table/List of AlertCard components
- Each card includes patient name (since global view)
- Bulk actions: Select multiple → Acknowledge all

**Empty State:**
- "No alerts. You're all caught up." ✅

**API Calls:**
```typescript
// Get alerts for all patients
const patients = await GET /api/v1/patients
for each patient:
  GET /api/v1/conversations/patients/{id}/alerts

// Or aggregate on frontend
```

---

### 6. Settings Page (`/settings`)

**Route:** `/settings`
**Layout:** DashboardLayout

**Sections:**

#### Profile Settings
- Avatar upload (placeholder)
- First name, last name (editable)
- Email (editable)
- Phone number (editable)
- Change password button → modal

#### Notification Preferences
- Toggle: Email notifications
- Toggle: SMS notifications
- Toggle: Push notifications

#### Alert Preferences
- Alert threshold: dropdown (low / medium / high / critical)
- Description: "Only show alerts at or above this severity level"

#### Quiet Hours
- Toggle: Enable quiet hours
- Start time picker (e.g., 22:00)
- End time picker (e.g., 07:00)
- Description: "No alerts during these hours (except critical)"

#### Daily Summary
- Time picker: Preferred daily summary time (e.g., 20:00)

**API Calls:**
```typescript
GET /api/v1/auth/me                  // Get profile
PATCH /api/v1/auth/me                // Update profile
GET /api/v1/auth/me/preferences      // Get preferences
PATCH /api/v1/auth/me/preferences    // Update preferences
POST /api/v1/auth/change-password    // Change password
```

**Save:** Toast notification "Settings updated."

---

## API Integration

### API Client Setup

**File:** `src/lib/api/axios.ts`

```typescript
import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '@/lib/auth/storage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;
        saveTokens(access_token, newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### API Endpoint Organization

**File:** `src/lib/api/patients.ts`

```typescript
import api from './axios';
import { Patient, PatientCreate, PatientUpdate } from '@/types/patient';

export const patientsAPI = {
  // Get all patients
  getAll: async (): Promise<Patient[]> => {
    const { data } = await api.get('/api/v1/patients');
    return data;
  },

  // Get single patient
  getById: async (id: string): Promise<Patient> => {
    const { data } = await api.get(`/api/v1/patients/${id}`);
    return data;
  },

  // Create patient
  create: async (patient: PatientCreate): Promise<Patient> => {
    const { data } = await api.post('/api/v1/patients', patient);
    return data;
  },

  // Update patient
  update: async (id: string, updates: PatientUpdate): Promise<Patient> => {
    const { data } = await api.patch(`/api/v1/patients/${id}`, updates);
    return data;
  },

  // Delete patient
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/patients/${id}`);
  },

  // Get patient activity
  getActivity: async (id: string, params?: { limit?: number; offset?: number; activity_type?: string }) => {
    const { data } = await api.get(`/api/v1/patients/${id}/activity`, { params });
    return data;
  },
};
```

### React Query Hooks

**File:** `src/hooks/usePatients.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsAPI } from '@/lib/api/patients';
import { Patient, PatientCreate, PatientUpdate } from '@/types/patient';
import { toast } from '@/components/ui/use-toast';

// Query keys
export const patientKeys = {
  all: ['patients'] as const,
  detail: (id: string) => ['patients', id] as const,
  activity: (id: string) => ['patients', id, 'activity'] as const,
};

// Get all patients
export function usePatients() {
  return useQuery({
    queryKey: patientKeys.all,
    queryFn: patientsAPI.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single patient
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientsAPI.getById(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!id,
  });
}

// Get patient activity
export function usePatientActivity(id: string) {
  return useQuery({
    queryKey: patientKeys.activity(id),
    queryFn: () => patientsAPI.getActivity(id, { limit: 100 }),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!id,
  });
}

// Create patient mutation
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patient: PatientCreate) => patientsAPI.create(patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      toast({
        title: 'Success',
        description: 'Patient added successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add patient',
        variant: 'destructive',
      });
    },
  });
}

// Update patient mutation
export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: PatientUpdate) => patientsAPI.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      toast({
        title: 'Success',
        description: 'Patient updated successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update patient',
        variant: 'destructive',
      });
    },
  });
}

// Delete patient mutation
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      toast({
        title: 'Success',
        description: 'Patient removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete patient',
        variant: 'destructive',
      });
    },
  });
}
```

---

## Authentication Flow

### Token Management

**File:** `src/lib/auth/storage.ts`

```typescript
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CAREGIVER_KEY = 'caregiver';

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveCaregiver(caregiver: any) {
  localStorage.setItem(CAREGIVER_KEY, JSON.stringify(caregiver));
}

export function getCaregiver() {
  const data = localStorage.getItem(CAREGIVER_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CAREGIVER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
```

### Auth Hook

**File:** `src/hooks/useAuth.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api/auth';
import { saveTokens, saveCaregiver, clearTokens, getCaregiver } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const caregiver = getCaregiver();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      saveTokens(data.access_token, data.refresh_token);
      saveCaregiver(data.caregiver);
      router.push('/care-circle');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      saveTokens(data.access_token, data.refresh_token);
      saveCaregiver(data.caregiver);
      router.push('/care-circle');
    },
  });

  const logout = () => {
    clearTokens();
    queryClient.clear();
    router.push('/login');
  };

  return {
    caregiver,
    isAuthenticated: !!caregiver,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
```

### Protected Route Middleware

**File:** `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');
  const isProtectedPage = !isAuthPage && request.nextUrl.pathname !== '/';

  // Redirect to login if accessing protected page without token
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing auth pages with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/care-circle', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## State Management

### TanStack Query Configuration

**File:** `src/app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute default
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Cache Strategy

**Query Stale Times:**
- Patient list: 5 minutes
- Patient detail: 2 minutes
- Alerts: 30 seconds (more frequent)
- Activity: 30 seconds
- Schedules: 2 minutes
- Conversations: 5 minutes
- Summaries: 10 minutes

**Refetch Intervals:**
- Alerts page: 30 seconds background refetch
- Patient detail overview: 60 seconds
- Care circle: 2 minutes

---

## Responsive Design

### Breakpoints

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      sm: '640px',   // Mobile landscape
      md: '768px',   // Tablet
      lg: '1024px',  // Desktop
      xl: '1280px',  // Large desktop
      '2xl': '1536px', // Extra large
    },
  },
};
```

### Responsive Patterns

**Sidebar:**
- Desktop (≥1024px): Always visible, 280px width
- Tablet (768-1023px): Collapsible, hamburger menu
- Mobile (<768px): Drawer/overlay, hamburger menu

**Patient Cards:**
- Desktop: 3 columns grid
- Tablet: 2 columns grid
- Mobile: 1 column (full width)

**Tables:**
- Desktop: Full table with all columns
- Tablet: Hide less important columns
- Mobile: Card view (stacked data)

**Forms:**
- Desktop: Multi-column layout where appropriate
- Tablet: 2 columns for short fields
- Mobile: Single column, full width inputs

**Typography:**
- Desktop: H1 40px, Body 18px
- Tablet: H1 32px, Body 18px
- Mobile: H1 28px, Body 16px (minimum)

---

## Development Workflow

### Initial Setup

```bash
# 1. Create Next.js project
npx create-next-app@latest caregiver-dashboard --typescript --tailwind --app --src-dir --import-alias "@/*"

# 2. Navigate to project
cd caregiver-dashboard

# 3. Install dependencies
pnpm add @tanstack/react-query axios react-hook-form zod @hookform/resolvers
pnpm add recharts react-big-calendar date-fns
pnpm add lucide-react clsx tailwind-merge

# 4. Install shadcn/ui
npx shadcn-ui@latest init

# 5. Add required shadcn components
npx shadcn-ui@latest add button card dialog input label select tabs toast avatar badge calendar dropdown-menu form table skeleton

# 6. Create environment file
cp .env.example .env.local
```

### Environment Variables

**File:** `.env.local`

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
# For production: https://api.eldercompanion.app

# App Configuration
NEXT_PUBLIC_APP_NAME=Elder Companion AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/care-circle-page

# Commit with conventional commits
git commit -m "feat: add care circle patient list page"

# Push and create PR
git push origin feature/care-circle-page
```

---

## Deployment Strategy

### Vercel Deployment

**Step 1: Connect Repository**
1. Push code to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Import your repository
5. Configure project

**Step 2: Environment Variables**
Add in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_NAME=Elder Companion AI
```

**Step 3: Deploy**
- Vercel auto-deploys on push to main
- Preview deployments on pull requests
- Production URL: https://eldercompanion.vercel.app

### Production Checklist

- [ ] Environment variables configured
- [ ] API URL points to production backend
- [ ] Error tracking setup (Sentry optional)
- [ ] Analytics setup (Google Analytics optional)
- [ ] Custom domain configured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] SEO meta tags added
- [ ] Favicon and og:image added
- [ ] 404 and 500 pages customized
- [ ] Performance tested (Lighthouse)

---

## Next Steps

1. **Read Task Breakdown Document** (being created next)
2. **Set up project** using commands above
3. **Start with Phase 1:** Auth + Layout (2 days)
4. **Continue with Phase 2:** Care Circle (2 days)
5. **Build remaining features** following task list

---

**Document Status:** ✅ Complete
**Last Updated:** October 24, 2025
**Next Document:** CAREGIVER_WEB_APP_TASKS.md
