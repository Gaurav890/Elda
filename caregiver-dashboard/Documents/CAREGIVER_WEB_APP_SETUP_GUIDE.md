# Caregiver Web Dashboard - Quick Setup Guide

**Date:** October 24, 2025
**Time to Complete:** 30-45 minutes
**Prerequisites:** Node.js 18+, pnpm (or npm), Git

---

## Step 1: Create Next.js Project (5 min)

```bash
# Navigate to project root
cd /Users/gaurav/Elda

# Create Next.js app with TypeScript + Tailwind
npx create-next-app@latest caregiver-dashboard \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

# Navigate to project
cd caregiver-dashboard
```

**Prompts you'll see:**
- ✅ Would you like to use TypeScript? **Yes**
- ✅ Would you like to use ESLint? **Yes**
- ✅ Would you like to use Tailwind CSS? **Yes**
- ✅ Would you like to use `src/` directory? **Yes**
- ✅ Would you like to use App Router? **Yes**
- ✅ Would you like to customize the default import alias? **No** (use @/*)

---

## Step 2: Install Core Dependencies (3 min)

```bash
# React Query for data fetching
pnpm add @tanstack/react-query @tanstack/react-query-devtools

# Axios for API calls
pnpm add axios

# Form handling
pnpm add react-hook-form zod @hookform/resolvers

# Utilities
pnpm add lucide-react clsx tailwind-merge class-variance-authority date-fns

# Charts (install later when needed)
# pnpm add recharts react-big-calendar
```

---

## Step 3: Initialize shadcn/ui (5 min)

```bash
# Initialize shadcn/ui (answer prompts)
npx shadcn-ui@latest init
```

**Prompts:**
- ✅ Would you like to use TypeScript? **Yes**
- ✅ Which style would you like to use? **Default**
- ✅ Which color would you like to use as base color? **Slate**
- ✅ Where is your global CSS file? **src/app/globals.css**
- ✅ Would you like to use CSS variables for colors? **Yes**
- ✅ Where is your tailwind.config.js located? **tailwind.config.ts**
- ✅ Configure the import alias for components? **@/components**
- ✅ Configure the import alias for utils? **@/lib/utils**
- ✅ Are you using React Server Components? **Yes**

---

## Step 4: Install shadcn/ui Components (5 min)

```bash
# Core UI components (install all at once)
npx shadcn-ui@latest add button card dialog input label select tabs toast avatar badge calendar dropdown-menu form table skeleton switch sheet
```

**This will install 15 components in one go.**

---

## Step 5: Configure Tailwind with Custom Colors (5 min)

**Edit `tailwind.config.ts`:**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from design spec
        primary: "#3566E5",
        accent: "#F47C63",
        bg: "#F9FAFB",
        surface: "#FFFFFF",
        textPrimary: "#1A1A1A",
        textSecondary: "#555555",
        success: "#4CAF50",
        warn: "#F9A825",
        error: "#E53935",

        // Severity colors for alerts
        severityLow: "#2196F3",
        severityMedium: "#F9A825",
        severityHigh: "#F57C00",
        severityCritical: "#E53935",

        // Keep shadcn defaults
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... rest of shadcn colors
      },
      fontFamily: {
        heading: ['"Playfair Display"', "serif"],
        body: ['"Nunito Sans"', "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## Step 6: Add Custom Fonts (5 min)

**Edit `src/app/layout.tsx`:**

```tsx
import type { Metadata } from "next";
import { Nunito_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elder Companion AI - Caregiver Dashboard",
  description: "Monitor and manage elderly care with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunitoSans.variable} ${playfairDisplay.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

**Update `src/app/globals.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Keep shadcn CSS variables here */
  }

  body {
    @apply font-body text-textPrimary;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
```

---

## Step 7: Create Project Structure (5 min)

```bash
# Create directory structure
mkdir -p src/components/{ui,layout,patients,schedules,alerts,conversations,analytics,common,forms}
mkdir -p src/lib/{api,auth}
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/config

# Create placeholder files
touch src/lib/utils.ts
touch src/lib/api/axios.ts
touch src/lib/auth/storage.ts
touch src/config/constants.ts
touch src/types/patient.ts
touch src/types/auth.ts
```

---

## Step 8: Configure Environment Variables (2 min)

**Create `.env.local`:**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=Elder Companion AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Create `.env.example`:**

```bash
# Copy .env.local structure here for other developers
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Elder Companion AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 9: Set Up React Query Provider (5 min)

**Create `src/app/providers.tsx`:**

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
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

**Update `src/app/layout.tsx` to include Providers:**

```tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} ${playfairDisplay.variable} font-body antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Step 10: Create Utility Files (3 min)

**Create `src/lib/utils.ts`:**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Create `src/config/constants.ts`:**

```typescript
export const APP_NAME = "Elder Companion AI";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  CARE_CIRCLE: "/care-circle",
  PATIENTS: "/patients",
  ALERTS: "/alerts",
  SETTINGS: "/settings",
};

export const SEVERITY_COLORS = {
  low: "severityLow",
  medium: "severityMedium",
  high: "severityHigh",
  critical: "severityCritical",
} as const;
```

---

## Step 11: Initialize Git (2 min)

```bash
# Initialize git
git init

# Create .gitignore (should already exist)
# Ensure it includes:
# .env.local
# .next
# node_modules

# Initial commit
git add .
git commit -m "Initial commit: Next.js + shadcn/ui + React Query setup"
```

---

## Step 12: Test Setup (2 min)

```bash
# Start development server
pnpm dev
```

**Open browser:** http://localhost:3000

**You should see:**
- ✅ Next.js welcome page
- ✅ No console errors
- ✅ React Query DevTools icon (bottom left)

---

## Step 13: Create Simple Test Page (Optional, 5 min)

**Edit `src/app/page.tsx`:**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4xl font-heading text-primary font-bold mb-4">
        Elder Companion AI
      </h1>
      <p className="text-lg font-body text-textSecondary">
        Caregiver Dashboard - Setup Complete! 🎉
      </p>

      <div className="mt-8 space-y-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-primary rounded-lg" />
          <div className="w-20 h-20 bg-accent rounded-lg" />
          <div className="w-20 h-20 bg-success rounded-lg" />
          <div className="w-20 h-20 bg-warn rounded-lg" />
          <div className="w-20 h-20 bg-error rounded-lg" />
        </div>
        <p className="text-sm text-textSecondary">
          Custom colors are working!
        </p>
      </div>
    </main>
  );
}
```

**Check the page:** Colors should display correctly.

---

## Verification Checklist

Before starting development, verify:

- [ ] `pnpm dev` runs without errors
- [ ] http://localhost:3000 loads
- [ ] Custom colors work (primary, accent, etc.)
- [ ] Custom fonts load (Playfair Display for headings, Nunito Sans for body)
- [ ] React Query DevTools visible
- [ ] TypeScript has no errors
- [ ] shadcn/ui components can be imported
- [ ] Environment variables load (check `process.env.NEXT_PUBLIC_API_URL`)
- [ ] Git repository initialized

---

## Next Steps

✅ **Setup Complete!** You're ready to start Phase 1 development.

**Follow the task breakdown:**
1. Read: `/Documents/CAREGIVER_WEB_APP_TASKS.md`
2. Start with: **Task 1.3 - API Client Setup**
3. Then: **Task 1.4 - Authentication Pages**
4. Then: **Task 1.5 - Dashboard Layout**

---

## Troubleshooting

### Issue: `pnpm` not found
**Solution:**
```bash
npm install -g pnpm
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
pnpm dev -- -p 3001
```

### Issue: Module not found errors
**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Restart dev server
pnpm dev
```

### Issue: shadcn/ui components not styling correctly
**Solution:**
1. Check `components.json` exists
2. Check `src/app/globals.css` has @tailwind directives
3. Restart dev server

---

## Quick Reference

**Useful Commands:**
```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Add new shadcn component
npx shadcn-ui@latest add [component-name]

# Type checking
pnpm tsc --noEmit
```

**Documentation:**
- Spec: `/Documents/CAREGIVER_WEB_APP_SPECIFICATION.md`
- Tasks: `/Documents/CAREGIVER_WEB_APP_TASKS.md`
- Backend API: `/Documents/CAREGIVER_WEB_APP_API_GUIDE.md`
- Placeholders: `/backend/Documents/PLACEHOLDER_ENDPOINTS_FOR_WEB_APP.md`

---

**Setup Status:** ✅ Complete
**Time Taken:** ~30-45 minutes
**Ready for Development:** Yes! 🚀
