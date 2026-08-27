// Fixed "today" for the demo, matching the mock data's narrative timeline.
// Using a fixed anchor (rather than the real wall clock) keeps dashboard
// KPIs and newly-created records (Investigations, Actions, Human Reviews)
// consistent with the rest of the seeded data regardless of when the demo
// is actually run.
export const DEMO_TODAY = "2026-08-27";

// This demo has no auth/session layer — all actions are attributed to a
// single fixed demo user rather than a real logged-in RM.
export const DEMO_RM_NAME = "김민서 심사역 (demo user)";

export function isWithinDays(dateStr: string, days: number, ref: string = DEMO_TODAY): boolean {
  const diffMs = new Date(ref).getTime() - new Date(dateStr).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}
