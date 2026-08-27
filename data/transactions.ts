import type { Transaction } from "@/lib/types";
import { createRng, pick, intBetween } from "./random";
import { genericCompanies, SCENARIO_COMPANY_IDS } from "./companies";

const CATEGORIES_INFLOW = ["매출대금", "용역대금"];
const CATEGORIES_OUTFLOW = ["원자재대금", "인건비", "임차료", "외주비"];

function generateGenericTransactions(): Transaction[] {
  const rng = createRng(20260831);
  const transactions: Transaction[] = [];
  let seq = 1;

  for (const company of genericCompanies) {
    const count = intBetween(rng, 3, 6);
    for (let i = 0; i < count; i++) {
      const type = rng() > 0.5 ? "INFLOW" : "OUTFLOW";
      transactions.push({
        id: `TX-${String(seq++).padStart(4, "0")}`,
        companyId: company.id,
        date: `2026-${String(intBetween(rng, 1, 8)).padStart(2, "0")}-${String(
          intBetween(rng, 1, 28)
        ).padStart(2, "0")}`,
        type,
        category:
          type === "INFLOW" ? pick(rng, CATEGORIES_INFLOW) : pick(rng, CATEGORIES_OUTFLOW),
        amount: intBetween(rng, 20, 900),
      });
    }
  }

  return transactions;
}

// --- Hidden Risk Case scenario ---------------------------------------------
// Two patterns embedded here:
//  1. Sales concentration: a large share of 세림테크's inflows come from 도래컴퍼니.
//  2. Circular fund movement: 세림테크 -> 하늬산업 -> 청우머티리얼 -> 세림테크,
//     each leg landing within the same short window and similar magnitude.
const { seramTech, haneui, cheongwoo, dorae } = SCENARIO_COMPANY_IDS;

const scenarioTransactions: Transaction[] = [
  // Sales concentration into 세림테크 from 도래컴퍼니
  { id: "TX-SRT-01", companyId: seramTech, date: "2026-06-03", type: "INFLOW", category: "매출대금", amount: 1450, counterpartyId: "CP-DORAE" },
  { id: "TX-SRT-02", companyId: seramTech, date: "2026-07-01", type: "INFLOW", category: "매출대금", amount: 1610, counterpartyId: "CP-DORAE" },
  { id: "TX-SRT-03", companyId: seramTech, date: "2026-08-02", type: "INFLOW", category: "매출대금", amount: 1780, counterpartyId: "CP-DORAE" },
  { id: "TX-SRT-04", companyId: seramTech, date: "2026-06-15", type: "INFLOW", category: "매출대금", amount: 420, counterpartyId: "CP-OTHER-1" },
  { id: "TX-SRT-05", companyId: seramTech, date: "2026-07-20", type: "INFLOW", category: "매출대금", amount: 380, counterpartyId: "CP-OTHER-2" },

  // Circular related-party transfers — same week, similar magnitude
  { id: "TX-SRT-06", companyId: seramTech, date: "2026-07-08", type: "OUTFLOW", category: "관계사대여금", amount: 950, counterpartyId: "CP-HANEUI" },
  { id: "TX-HN-01", companyId: haneui, date: "2026-07-08", type: "INFLOW", category: "관계사대여금", amount: 950, counterpartyId: "CP-SERAMTECH" },
  { id: "TX-HN-02", companyId: haneui, date: "2026-07-10", type: "OUTFLOW", category: "관계사대여금", amount: 910, counterpartyId: "CP-CHEONGWOO" },
  { id: "TX-CW-01", companyId: cheongwoo, date: "2026-07-10", type: "INFLOW", category: "관계사대여금", amount: 910, counterpartyId: "CP-HANEUI" },
  { id: "TX-CW-02", companyId: cheongwoo, date: "2026-07-12", type: "OUTFLOW", category: "관계사대여금", amount: 890, counterpartyId: "CP-SERAMTECH" },
  { id: "TX-SRT-07", companyId: seramTech, date: "2026-07-12", type: "INFLOW", category: "관계사대여금", amount: 890, counterpartyId: "CP-CHEONGWOO" },

  // 도래컴퍼니 own transactions (normal-looking on its own)
  { id: "TX-DR-01", companyId: dorae, date: "2026-06-03", type: "OUTFLOW", category: "매출대금", amount: 1450, counterpartyId: "CP-SERAMTECH" },
  { id: "TX-DR-02", companyId: dorae, date: "2026-07-01", type: "OUTFLOW", category: "매출대금", amount: 1610, counterpartyId: "CP-SERAMTECH" },
];

export const genericTransactions = generateGenericTransactions();
export const transactions: Transaction[] = [...genericTransactions, ...scenarioTransactions];
