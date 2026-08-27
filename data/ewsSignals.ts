import type { EwsSignal } from "@/lib/types";
import { createRng, intBetween, dateDaysAgo } from "./random";
import { genericCompanies, SCENARIO_COMPANY_IDS } from "./companies";
import { riskLevelFromScore } from "@/lib/riskStyle";

const TRIGGER_FACTOR_POOL = [
  "매출 급감",
  "연체 발생",
  "부채비율 상승",
  "신용등급 하락",
  "거래처 이탈",
  "현금흐름 악화",
  "이자보상비율 하락",
  "계열사 리스크 전이",
];

const TODAY = "2026-08-27";

function generateGenericSignals(): EwsSignal[] {
  const rng = createRng(20260829);
  const signals: EwsSignal[] = [];
  let seq = 1;

  for (const company of genericCompanies) {
    // 4 historical points ending at the company's current score. The most
    // recent point's age is staggered per company (0-45 days) rather than
    // fixed at "today" for every company — otherwise every single borrower
    // would show a "new" signal on every page load, which makes the
    // Dashboard's "신규 Risk Signal" KPI meaningless.
    const points = 4;
    const recencyOffsetDays = intBetween(rng, 0, 45);
    let score = Math.max(
      5,
      company.currentEwsRiskScore - intBetween(rng, -8, 15)
    );
    for (let i = points; i >= 0; i--) {
      const daysAgo = recencyOffsetDays + i * 28;
      const prevScore = score;
      if (i === 0) score = company.currentEwsRiskScore;
      const factorCount = intBetween(rng, 0, 2);
      const factors: string[] = [];
      for (let f = 0; f < factorCount; f++) {
        factors.push(TRIGGER_FACTOR_POOL[intBetween(rng, 0, TRIGGER_FACTOR_POOL.length - 1)]);
      }
      signals.push({
        id: `EWS-${String(seq++).padStart(4, "0")}`,
        companyId: company.id,
        signalDate: dateDaysAgo(TODAY, daysAgo),
        riskScore: score,
        riskLevel: riskLevelFromScore(score),
        scoreDelta: i === points ? 0 : score - prevScore,
        triggerFactors: factors,
      });
      score = Math.max(5, Math.min(95, score + intBetween(rng, -6, 6)));
    }
  }

  return signals;
}

// --- Hidden Risk Case scenario: EWS stays LOW/MEDIUM the whole time --------
// This is the core narrative point — traditional delinquency-based EWS never
// crosses into HIGH, even as connected data sources show risk building.
const scenarioSignals: EwsSignal[] = [
  {
    id: "EWS-SRT-1",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    signalDate: "2025-05-27",
    riskScore: 22,
    riskLevel: "LOW",
    scoreDelta: 0,
    triggerFactors: [],
  },
  {
    id: "EWS-SRT-2",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    signalDate: "2025-08-27",
    riskScore: 25,
    riskLevel: "LOW",
    scoreDelta: 3,
    triggerFactors: [],
  },
  {
    id: "EWS-SRT-3",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    signalDate: "2025-11-27",
    riskScore: 28,
    riskLevel: "LOW",
    scoreDelta: 3,
    triggerFactors: ["거래처 이탈"],
  },
  {
    id: "EWS-SRT-4",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    signalDate: "2026-02-27",
    riskScore: 31,
    riskLevel: "MEDIUM",
    scoreDelta: 3,
    triggerFactors: ["현금흐름 악화"],
  },
  {
    id: "EWS-SRT-5",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    signalDate: "2026-05-27",
    riskScore: 33,
    riskLevel: "MEDIUM",
    scoreDelta: 2,
    triggerFactors: ["현금흐름 악화"],
  },
  {
    id: "EWS-SRT-6",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    signalDate: "2026-08-20",
    riskScore: 34,
    riskLevel: "MEDIUM",
    scoreDelta: 1,
    triggerFactors: ["현금흐름 악화"],
  },
  {
    id: "EWS-HN-1",
    companyId: SCENARIO_COMPANY_IDS.haneui,
    signalDate: "2026-05-27",
    riskScore: 26,
    riskLevel: "LOW",
    scoreDelta: 0,
    triggerFactors: [],
  },
  {
    id: "EWS-HN-2",
    companyId: SCENARIO_COMPANY_IDS.haneui,
    signalDate: "2026-08-20",
    riskScore: 29,
    riskLevel: "LOW",
    scoreDelta: 3,
    triggerFactors: [],
  },
  {
    id: "EWS-CW-1",
    companyId: SCENARIO_COMPANY_IDS.cheongwoo,
    signalDate: "2026-05-27",
    riskScore: 27,
    riskLevel: "MEDIUM",
    scoreDelta: 0,
    triggerFactors: [],
  },
  {
    id: "EWS-CW-2",
    companyId: SCENARIO_COMPANY_IDS.cheongwoo,
    signalDate: "2026-08-20",
    riskScore: 31,
    riskLevel: "MEDIUM",
    scoreDelta: 4,
    triggerFactors: ["거래처 이탈"],
  },
  {
    id: "EWS-DR-1",
    companyId: SCENARIO_COMPANY_IDS.dorae,
    signalDate: "2026-05-27",
    riskScore: 38,
    riskLevel: "MEDIUM",
    scoreDelta: 0,
    triggerFactors: [],
  },
  {
    id: "EWS-DR-2",
    companyId: SCENARIO_COMPANY_IDS.dorae,
    signalDate: "2026-08-20",
    riskScore: 46,
    riskLevel: "MEDIUM",
    scoreDelta: 8,
    triggerFactors: ["신용등급 하락"],
  },
];

export const genericEwsSignals = generateGenericSignals();
export const ewsSignals: EwsSignal[] = [...genericEwsSignals, ...scenarioSignals];
