// Shared step definitions for the guided 5-minute demo narrative. Purely a
// presentation aid — does not affect any data or business logic.
export const DEMO_STEPS = [
  { n: 1, label: "Hidden Risk Case 발견" },
  { n: 2, label: "세림테크 선택" },
  { n: 3, label: "정상 여신 확인" },
  { n: 4, label: "Risk Signal 확인" },
  { n: 5, label: "Risk Timeline" },
  { n: 6, label: "관계망 Graph" },
  { n: 7, label: "External Event 연결" },
  { n: 8, label: "AI Investigation Summary" },
  { n: 9, label: "Action 선택" },
] as const;
