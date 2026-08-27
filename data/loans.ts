import type { Loan } from "@/lib/types";
import { createRng, pick, intBetween, floatBetween } from "./random";
import { genericCompanies, SCENARIO_COMPANY_IDS } from "./companies";

const PRODUCT_TYPES = ["운전자금대출", "시설자금대출", "무역금융", "일반담보대출"];
const COLLATERAL_TYPES = ["부동산", "예금", "신용", "동산", "무보증"];

function generateGenericLoans(): Loan[] {
  const rng = createRng(20260828);
  const loans: Loan[] = [];
  let seq = 1;

  for (const company of genericCompanies) {
    const loanCount = intBetween(rng, 1, 3);
    for (let i = 0; i < loanCount; i++) {
      const principal = intBetween(rng, 200, Math.max(300, company.totalExposure));
      const isDelinquent = company.currentEwsRiskScore >= 65 && rng() > 0.6;
      loans.push({
        id: `LN-${String(seq++).padStart(4, "0")}`,
        companyId: company.id,
        productType: pick(rng, PRODUCT_TYPES),
        principal,
        outstandingBalance: Math.round(principal * floatBetween(rng, 0.4, 0.95)),
        interestRate: floatBetween(rng, 3.8, 7.5, 2),
        startDate: `${intBetween(rng, 2021, 2025)}-${String(intBetween(rng, 1, 12)).padStart(2, "0")}-01`,
        maturityDate: `${intBetween(rng, 2026, 2029)}-${String(intBetween(rng, 1, 12)).padStart(2, "0")}-01`,
        collateralType: pick(rng, COLLATERAL_TYPES),
        delinquencyDays: isDelinquent ? intBetween(rng, 5, 90) : 0,
      });
    }
  }

  return loans;
}

// --- Hidden Risk Case scenario loans ---------------------------------------
// No delinquency anywhere — this is the whole point: the loans look clean.
const scenarioLoans: Loan[] = [
  {
    id: "LN-SRT-01",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    productType: "운전자금대출",
    principal: 6200,
    outstandingBalance: 5850,
    interestRate: 4.6,
    startDate: "2023-03-15",
    maturityDate: "2027-03-15",
    collateralType: "부동산",
    delinquencyDays: 0,
  },
  {
    id: "LN-SRT-02",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    productType: "무역금융",
    principal: 1900,
    outstandingBalance: 1750,
    interestRate: 5.1,
    startDate: "2024-06-10",
    maturityDate: "2026-12-10",
    collateralType: "신용",
    delinquencyDays: 0,
  },
  {
    id: "LN-HN-01",
    companyId: SCENARIO_COMPANY_IDS.haneui,
    productType: "운전자금대출",
    principal: 1400,
    outstandingBalance: 1320,
    interestRate: 5.3,
    startDate: "2024-01-20",
    maturityDate: "2027-01-20",
    collateralType: "신용",
    delinquencyDays: 0,
  },
  {
    id: "LN-CW-01",
    companyId: SCENARIO_COMPANY_IDS.cheongwoo,
    productType: "시설자금대출",
    principal: 2700,
    outstandingBalance: 2600,
    interestRate: 4.9,
    startDate: "2023-11-05",
    maturityDate: "2028-11-05",
    collateralType: "부동산",
    delinquencyDays: 0,
  },
  {
    id: "LN-DR-01",
    companyId: SCENARIO_COMPANY_IDS.dorae,
    productType: "무역금융",
    principal: 3100,
    outstandingBalance: 2950,
    interestRate: 5.4,
    startDate: "2023-09-01",
    maturityDate: "2026-09-01",
    collateralType: "신용",
    delinquencyDays: 0,
  },
];

export const genericLoans = generateGenericLoans();
export const loans: Loan[] = [...genericLoans, ...scenarioLoans];
