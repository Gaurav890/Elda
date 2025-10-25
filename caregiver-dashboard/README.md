# Elder Companion AI - Caregiver Dashboard

Web dashboard for caregivers to monitor and manage elderly patients.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **API Client:** Axios

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Environment Variables

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

## Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/              # Utilities and API clients
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
└── config/           # Configuration files
```

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## 📚 Documentation

### Frontend Status
- **[QUICK_START.md](Documents/QUICK_START.md)** - Resume work quickly
- **[WEB_DASHBOARD_FRONTEND_STATUS.md](Documents/WEB_DASHBOARD_FRONTEND_STATUS.md)** - Complete setup status and progress

### Project Documentation (Root /Documents/)
- **CAREGIVER_WEB_APP_SPECIFICATION.md** - Complete technical specifications
- **CAREGIVER_WEB_APP_TASKS.md** - Phase-by-phase task breakdown
- **CAREGIVER_WEB_APP_SETUP_GUIDE.md** - Detailed setup instructions
- **CAREGIVER_WEB_APP_API_GUIDE.md** - Backend API reference

## 🔗 Backend API

**Development:** http://localhost:8000
**API Docs:** http://localhost:8000/docs
**Total Endpoints:** 49 (40 for caregiver dashboard)

## ⚠️ Current Status

**Setup:** 95% complete
**Issue:** Missing `autoprefixer` dependency
**Fix:** Run `npm install`
**Next:** Install shadcn/ui components and start Phase 1 development

See [QUICK_START.md](Documents/QUICK_START.md) for detailed status.
