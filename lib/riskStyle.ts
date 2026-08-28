import type { RiskLevel } from "@/lib/types";

// Single source of truth for risk-level color semantics. Muted, not
// "badge-bright" — color is used to signal severity, not to decorate.
// `text` includes a `dark:` variant (lighter shade) so labels stay readable
// against the dark theme's near-black background; `hex`/`darkHex` are for
// Recharts (which needs literal colors, not Tailwind classes).
export const RISK_STYLE: Record<
  RiskLevel,
  { label: string; dot: string; text: string; hex: string; darkHex: string }
> = {
  LOW: {
    label: "LOW",
    dot: "bg-slate-400",
    text: "text-slate-600 dark:text-slate-400",
    hex: "#94a3b8",
    darkHex: "#cbd5e1",
  },
  MEDIUM: {
    label: "MEDIUM",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    hex: "#d97706",
    darkHex: "#fbbf24",
  },
  HIGH: {
    label: "HIGH",
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    hex: "#ea580c",
    darkHex: "#fb923c",
  },
  CRITICAL: {
    label: "CRITICAL",
    dot: "bg-red-600",
    text: "text-red-700 dark:text-red-400",
    hex: "#b91c1c",
    darkHex: "#f87171",
  },
};

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return "CRITICAL";
  if (score >= 55) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}
