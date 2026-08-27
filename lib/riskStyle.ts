import type { RiskLevel } from "@/lib/types";

// Single source of truth for risk-level color semantics. Muted, not
// "badge-bright" — color is used to signal severity, not to decorate.
export const RISK_STYLE: Record<
  RiskLevel,
  { label: string; dot: string; text: string; hex: string }
> = {
  LOW: { label: "LOW", dot: "bg-slate-400", text: "text-slate-600", hex: "#94a3b8" },
  MEDIUM: { label: "MEDIUM", dot: "bg-amber-500", text: "text-amber-700", hex: "#d97706" },
  HIGH: { label: "HIGH", dot: "bg-orange-500", text: "text-orange-700", hex: "#ea580c" },
  CRITICAL: { label: "CRITICAL", dot: "bg-red-600", text: "text-red-700", hex: "#b91c1c" },
};

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return "CRITICAL";
  if (score >= 55) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}
