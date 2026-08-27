import type { FinancialStatement } from "@/lib/types";
import { createRng, intBetween, floatBetween } from "./random";
import { genericCompanies, SCENARIO_COMPANY_IDS } from "./companies";

function generateGenericFinancials(): FinancialStatement[] {
  const rng = createRng(20260830);
  const statements: FinancialStatement[] = [];
  let seq = 1;

  for (const company of genericCompanies) {
    // last 2 quarters only, kept simple for generic companies
    for (const [fiscalYear, quarter] of [
      [2026, 1],
      [2026, 2],
    ] as const) {
      const revenue = intBetween(rng, 800, 12000);
      const operatingProfit = Math.round(revenue * floatBetween(rng, 0.02, 0.12));
      const netProfit = Math.round(operatingProfit * floatBetween(rng, 0.5, 0.9));
      const totalAssets = intBetween(rng, revenue, revenue * 3);
      const debtRatio = floatBetween(rng, 40, 220);
      const totalEquity = Math.round(totalAssets / (1 + debtRatio / 100));
      const totalLiabilities = totalAssets - totalEquity;
      statements.push({
        id: `FS-${String(seq++).padStart(4, "0")}`,
        companyId: company.id,
        fiscalYear,
        quarter,
        revenue,
        operatingProfit,
        netProfit,
        totalAssets,
        totalLiabilities,
        totalEquity,
        debtRatio,
        currentRatio: floatBetween(rng, 80, 180),
        interestCoverageRatio: floatBetween(rng, 0.8, 6),
        accountsReceivable: Math.round(revenue * floatBetween(rng, 0.15, 0.3)),
        operatingCashFlow: Math.round(operatingProfit * floatBetween(rng, 0.5, 1.1)),
      });
    }
  }

  return statements;
}

// --- Hidden Risk Case scenario: 세림테크 ------------------------------------
// Revenue climbs steadily (looks healthy). Accounts receivable climbs much
// faster than revenue. Operating cash flow diverges from accounting profit
// from 2025 Q3 onward — the classic "profit on paper, no cash behind it"
// pattern that a delinquency-based EWS will not see.
const seramTechQuarters: Array<
  Pick<
    FinancialStatement,
    "fiscalYear" | "quarter" | "revenue" | "accountsReceivable" | "operatingCashFlow" | "netProfit"
  >
> = [
  { fiscalYear: 2024, quarter: 1, revenue: 5200, accountsReceivable: 1150, operatingCashFlow: 410, netProfit: 320 },
  { fiscalYear: 2024, quarter: 2, revenue: 5450, accountsReceivable: 1280, operatingCashFlow: 430, netProfit: 340 },
  { fiscalYear: 2024, quarter: 3, revenue: 5700, accountsReceivable: 1490, operatingCashFlow: 400, netProfit: 355 },
  { fiscalYear: 2024, quarter: 4, revenue: 6050, accountsReceivable: 1780, operatingCashFlow: 360, netProfit: 380 },
  { fiscalYear: 2025, quarter: 1, revenue: 6300, accountsReceivable: 2150, operatingCashFlow: 300, netProfit: 400 },
  { fiscalYear: 2025, quarter: 2, revenue: 6700, accountsReceivable: 2680, operatingCashFlow: 210, netProfit: 430 },
  { fiscalYear: 2025, quarter: 3, revenue: 7050, accountsReceivable: 3320, operatingCashFlow: 90, netProfit: 455 },
  { fiscalYear: 2025, quarter: 4, revenue: 7400, accountsReceivable: 4100, operatingCashFlow: -60, netProfit: 480 },
  { fiscalYear: 2026, quarter: 1, revenue: 7750, accountsReceivable: 5050, operatingCashFlow: -180, netProfit: 505 },
  { fiscalYear: 2026, quarter: 2, revenue: 8100, accountsReceivable: 6120, operatingCashFlow: -290, netProfit: 530 },
];

const seramTechFinancials: FinancialStatement[] = seramTechQuarters.map((q, i) => {
  const totalAssets = 18000 + i * 900;
  const totalEquity = 7200 + i * 120;
  return {
    id: `FS-SRT-${i + 1}`,
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    fiscalYear: q.fiscalYear,
    quarter: q.quarter,
    revenue: q.revenue,
    operatingProfit: Math.round(q.netProfit * 1.4),
    netProfit: q.netProfit,
    totalAssets,
    totalLiabilities: totalAssets - totalEquity,
    totalEquity,
    debtRatio: Math.round(((totalAssets - totalEquity) / totalEquity) * 1000) / 10,
    currentRatio: 145 - i * 3,
    interestCoverageRatio: Math.max(1.2, 4.2 - i * 0.25),
    accountsReceivable: q.accountsReceivable,
    operatingCashFlow: q.operatingCashFlow,
  };
});

// Related companies get a lighter version of the same pattern, 2026 only.
const relatedCompanyFinancials: FinancialStatement[] = [
  {
    id: "FS-HN-1",
    companyId: SCENARIO_COMPANY_IDS.haneui,
    fiscalYear: 2026,
    quarter: 1,
    revenue: 1450,
    operatingProfit: 140,
    netProfit: 95,
    totalAssets: 3200,
    totalLiabilities: 2100,
    totalEquity: 1100,
    debtRatio: 190.9,
    currentRatio: 118,
    interestCoverageRatio: 2.1,
    accountsReceivable: 980,
    operatingCashFlow: 20,
  },
  {
    id: "FS-HN-2",
    companyId: SCENARIO_COMPANY_IDS.haneui,
    fiscalYear: 2026,
    quarter: 2,
    revenue: 1520,
    operatingProfit: 150,
    netProfit: 100,
    totalAssets: 3350,
    totalLiabilities: 2220,
    totalEquity: 1130,
    debtRatio: 196.5,
    currentRatio: 112,
    interestCoverageRatio: 1.9,
    accountsReceivable: 1240,
    operatingCashFlow: -40,
  },
  {
    id: "FS-CW-1",
    companyId: SCENARIO_COMPANY_IDS.cheongwoo,
    fiscalYear: 2026,
    quarter: 1,
    revenue: 2600,
    operatingProfit: 210,
    netProfit: 150,
    totalAssets: 5100,
    totalLiabilities: 3300,
    totalEquity: 1800,
    debtRatio: 183.3,
    currentRatio: 121,
    interestCoverageRatio: 2.3,
    accountsReceivable: 1580,
    operatingCashFlow: 60,
  },
  {
    id: "FS-CW-2",
    companyId: SCENARIO_COMPANY_IDS.cheongwoo,
    fiscalYear: 2026,
    quarter: 2,
    revenue: 2710,
    operatingProfit: 215,
    netProfit: 155,
    totalAssets: 5280,
    totalLiabilities: 3480,
    totalEquity: 1800,
    debtRatio: 193.3,
    currentRatio: 115,
    interestCoverageRatio: 2.0,
    accountsReceivable: 1980,
    operatingCashFlow: -30,
  },
];

export const genericFinancials = generateGenericFinancials();
export const financials: FinancialStatement[] = [
  ...genericFinancials,
  ...seramTechFinancials,
  ...relatedCompanyFinancials,
];
