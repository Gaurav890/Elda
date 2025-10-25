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

## Documentation

See `/Documents` folder for complete specifications and task breakdown.

## Backend API

Backend runs on Railway: http://localhost:8000 (development)

API Documentation: http://localhost:8000/docs
