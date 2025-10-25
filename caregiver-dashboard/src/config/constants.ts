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

// Design Tokens (matching CaregiverDesign.md)
export const DESIGN = {
  colors: {
    primary: "#3566E5",
    accent: "#F47C63",
    bg: "#F9FAFB",
    surface: "#FFFFFF",
    textPrimary: "#1A1A1A",
    textSecondary: "#555555",
    success: "#4CAF50",
    warn: "#F9A825",
    error: "#E53935",
  },
  spacing: {
    grid: 8, // 8px spacing grid
  },
  borderRadius: {
    default: "16px",
    large: "20px",
  },
  shadows: {
    soft: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  transitions: {
    duration: "200ms",
    timing: "ease-in-out",
  },
  typography: {
    h1: { size: "40px", weight: "700", lineHeight: "1.2" },
    h2: { size: "28px", weight: "600", lineHeight: "1.3" },
    body: { size: "18px", weight: "400", lineHeight: "1.6" },
    caption: { size: "14px", weight: "400", lineHeight: "1.5" },
  },
  button: {
    minHeight: "44px",
  },
} as const;
