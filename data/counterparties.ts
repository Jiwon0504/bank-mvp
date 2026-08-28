import type { Counterparty } from "@/lib/types";
import { createRng, pick, intBetween } from "./random";
import { genericCompanies, SCENARIO_COMPANY_IDS } from "./companies";
import { financials } from "./financials";

function latestAnnualizedRevenue(companyId: string): number {
  const statements = financials
    .filter((f) => f.companyId === companyId)
    .sort((a, b) => a.fiscalYear - b.fiscalYear || a.quarter - b.quarter);
  const latest = statements[statements.length - 1];
  return latest ? latest.revenue * 4 : 0;
}

function generateGenericCounterparties(): Counterparty[] {
  const rng = createRng(20260901);
  const list: Counterparty[] = [];
  let seq = 1;

  for (const company of genericCompanies) {
    const annualRevenue = latestAnnualizedRevenue(company.id);
    const count = intBetween(rng, 1, 2);
    for (let i = 0; i < count; i++) {
      const concentrationPct = intBetween(rng, 5, 25);
      // Transaction volume is derived from the company's own revenue and
      // the stated concentration — a customer/supplier accounting for 15%
      // of sales must correspond to ~15% of that company's revenue, not an
      // independently-rolled number that happens to disagree with it.
      const annualTransactionVolume = annualRevenue > 0
        ? Math.round((annualRevenue * concentrationPct) / 100)
        : intBetween(rng, 200, 4000);
      list.push({
        id: `CPY-${String(seq++).padStart(4, "0")}`,
        companyId: company.id,
        counterpartyName: `${pick(rng, ["대신", "한별", "정우", "신도림", "메가"])}${pick(
          rng,
          ["물산", "유통", "상사"]
        )}`,
        role: pick(rng, ["CUSTOMER", "SUPPLIER"]),
        annualTransactionVolume,
        concentrationPct,
      });
    }
  }

  return list;
}

// --- Hidden Risk Case scenario ---------------------------------------------
// 세림테크 annualized revenue (last 4 quarters, 2025Q3-2026Q2) is ~30,300
// million; 42% concentration on 도래컴퍼니 works out to ~12,700 million.
const { seramTech } = SCENARIO_COMPANY_IDS;

const scenarioCounterparties: Counterparty[] = [
  {
    id: "CPY-DORAE",
    companyId: seramTech,
    counterpartyName: "도래컴퍼니",
    role: "CUSTOMER",
    annualTransactionVolume: 12700,
    concentrationPct: 42, // unusually high sales concentration on one customer
    counterpartyCompanyId: SCENARIO_COMPANY_IDS.dorae,
  },
];

export const genericCounterparties = generateGenericCounterparties();

// --- One deliberate, non-random organic case ------------------------------
// The portfolio-wide Hidden-Risk scan (lib/riskSignals.ts / lib/riskScan.ts)
// runs the exact same detection logic against every borrower, including the
// 30 "generic" ones above — most turn up clean, a few turn up borderline
// purely by chance. To guarantee the demo reliably shows at least one
// clean, single-signal "hidden risk" case beyond the scripted 세림테크
// group — proving the detector generalizes rather than only ever finding
// the one pre-existing narrative — 미래푸드(CMP-013)'s largest counterparty
// concentration is nudged from its randomly-generated 11% to 45%. Volume is
// recomputed with the exact same annualRevenue × concentration formula used
// for every other counterparty above, so the two figures stay consistent.
// No tag, no special-case branch anywhere else — the scan finds this purely
// because the concentration number itself is now >= 35%.
const ORGANIC_CONCENTRATION_CASE = {
  companyId: "CMP-013",
  counterpartyName: "대신상사",
  concentrationPct: 45,
};

const organicTarget = genericCounterparties.find(
  (c) =>
    c.companyId === ORGANIC_CONCENTRATION_CASE.companyId &&
    c.counterpartyName === ORGANIC_CONCENTRATION_CASE.counterpartyName
);
if (organicTarget) {
  const annualRevenue = latestAnnualizedRevenue(organicTarget.companyId);
  organicTarget.concentrationPct = ORGANIC_CONCENTRATION_CASE.concentrationPct;
  organicTarget.annualTransactionVolume = Math.round(
    (annualRevenue * ORGANIC_CONCENTRATION_CASE.concentrationPct) / 100
  );
}

export const counterparties: Counterparty[] = [
  ...genericCounterparties,
  ...scenarioCounterparties,
];
