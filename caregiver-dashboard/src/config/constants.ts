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
