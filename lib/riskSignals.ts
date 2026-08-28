// Uniform, explainable Risk Signal detection — the same set of checks runs
// against every company's real data (financials, counterparties, related
// companies, transactions, external events, news). No company is special-
// cased; whatever fires, fires because the underlying numbers say so.
//
// This module is deliberately independent from lib/riskAnalysis.ts (the
// existing per-company Investigation Summary generator) rather than a
// shared refactor — riskAnalysis.ts is a working, already-shipped feature
// and this task's brief is additive ("don't break existing features"), so
// the two are allowed to overlap conceptually without being merged.

import { getFinancialsByCompany } from "@/lib/repository/companyRepository";
import { getCounterpartiesByCompany, getRelatedCompanyIds } from "@/lib/repository/relationshipRepository";
import { getTransactionsByCompany } from "@/lib/repository/transactionRepository";
import { getExternalEventsRelatedToCompany, getNewsByCompany } from "@/lib/repository/eventRepository";
import { formatEok } from "@/lib/format";

export type RiskSignalType =
  | "AR_OUTPACES_REVENUE"
  | "CASHFLOW_PROFIT_DIVERGENCE"
  | "COUNTERPARTY_CONCENTRATION"
  | "RELATED_PARTY_FUND_MOVEMENT"
  | "EXTERNAL_EVENT_EXPOSURE"
  | "NEGATIVE_NEWS";

export interface RiskSignal {
  type: RiskSignalType;
  weight: number;
  /** Korean, cites the actual figures that fired it — data output, not UI chrome (kept Korean regardless of UI language, same convention as lib/riskAnalysis.ts's generated prose). */
  explanation: string;
}

// Weights are additive and capped at 100 by the caller (lib/riskScan.ts).
// Chosen so that ONE strong, unambiguous signal (e.g. a >35% counterparty
// concentration, or the AR/cash-flow combo) is enough to cross a company
// from LOW/MEDIUM into MEDIUM/HIGH territory, while a single weak signal
// (a broad same-industry external-event match) alone is not.
const WEIGHTS = {
  AR_OUTPACES_REVENUE: 30,
  CASHFLOW_PROFIT_DIVERGENCE: 25,
  COUNTERPARTY_CONCENTRATION_BASE: 20,
  RELATED_PARTY_FUND_MOVEMENT: 20,
  EXTERNAL_EVENT_SELF: 8,
  EXTERNAL_EVENT_SPECIFIC: 15,
  NEGATIVE_NEWS: 15,
} as const;

const RELATION_SPECIFICITY: Record<string, number> = { SELF: 0, RELATED: 1, COUNTERPARTY: 2 };
const RELATION_LABEL_KO: Record<string, string> = {
  SELF: "본인 산업",
  RELATED: "관계사",
  COUNTERPARTY: "주요 거래처",
};

/**
 * Signal 1-2: financial statement divergence.
 * Compares the earliest vs latest available FinancialStatement for a
 * company (2 quarters for generic borrowers, longer history for the
 * scripted group) — same comparison, same thresholds, for everyone.
 */
function detectFinancialSignals(companyId: string): RiskSignal[] {
  const statements = getFinancialsByCompany(companyId);
  if (statements.length < 2) return [];

  const signals: RiskSignal[] = [];
  const first = statements[0];
  const last = statements[statements.length - 1];
  const revenueGrowth = ((last.revenue - first.revenue) / first.revenue) * 100;
  const arGrowth =
    ((last.accountsReceivable - first.accountsReceivable) / first.accountsReceivable) * 100;

  // Accounts receivable growing much faster than revenue: sales are being
  // booked but not collected — a classic "profit on paper" pattern that a
  // delinquency-based EWS cannot see (no payment is late; the invoice
  // simply hasn't been converted to cash yet).
  if (arGrowth > revenueGrowth * 1.5 && arGrowth > 20) {
    signals.push({
      type: "AR_OUTPACES_REVENUE",
      weight: WEIGHTS.AR_OUTPACES_REVENUE,
      explanation: `매출은 ${revenueGrowth.toFixed(0)}% 증가했으나 매출채권은 ${arGrowth.toFixed(
        0
      )}% 증가 — 매출 증가 속도보다 채권 누적 속도가 훨씬 빠름 (검증 필요).`,
    });
  }

  // Operating cash flow negative while accounting net profit is positive:
  // the income statement looks healthy but cash isn't actually coming in.
  if (last.operatingCashFlow < 0 && last.netProfit > 0) {
    signals.push({
      type: "CASHFLOW_PROFIT_DIVERGENCE",
      weight: WEIGHTS.CASHFLOW_PROFIT_DIVERGENCE,
      explanation: `최근 분기 영업현금흐름 ${formatEok(
        last.operatingCashFlow
      )}(음수)이지만 회계상 순이익은 ${formatEok(last.netProfit)}(양수) — 이익과 현금흐름 간 괴리 (검증 필요).`,
    });
  }

  return signals;
}

/**
 * Signal 3: sales/purchase concentration on a single counterparty.
 * Fires per counterparty at or above 35% concentration; weight scales
 * mildly with how far past the threshold it is (capped).
 */
function detectCounterpartyConcentration(companyId: string): RiskSignal[] {
  return getCounterpartiesByCompany(companyId)
    .filter((c) => c.concentrationPct >= 35)
    .map((c) => ({
      type: "COUNTERPARTY_CONCENTRATION" as const,
      weight: WEIGHTS.COUNTERPARTY_CONCENTRATION_BASE + Math.min(15, c.concentrationPct - 35),
      explanation: `매출/매입의 ${c.concentrationPct}%가 단일 거래처(${
        c.counterpartyName
      })에 집중 — 해당 거래처 이슈 발생 시 직접 영향 가능성 (확인 필요).`,
    }));
}

/**
 * Signal 4: related-company fund movement. Requires BOTH a registered
 * related company AND at least one transaction actually tagged as a
 * related-party fund flow (category containing "관계사") — having a
 * related company alone isn't risky; money moving between them is what
 * matters.
 */
function detectRelatedPartyFundMovement(companyId: string): RiskSignal[] {
  const relatedIds = getRelatedCompanyIds(companyId);
  if (relatedIds.length === 0) return [];

  const relatedTransactions = getTransactionsByCompany(companyId).filter((t) =>
    t.category.includes("관계사")
  );
  if (relatedTransactions.length === 0) return [];

  const total = relatedTransactions.reduce((sum, t) => sum + t.amount, 0);
  return [
    {
      type: "RELATED_PARTY_FUND_MOVEMENT",
      weight: WEIGHTS.RELATED_PARTY_FUND_MOVEMENT,
      explanation: `관계회사 ${relatedIds.length}개사와 연결되어 있고, 관계사 간 자금이동 거래 ${
        relatedTransactions.length
      }건(합계 ${formatEok(total)})이 확인됨 — 상거래 목적 여부 확인 필요.`,
    },
  ];
}

/**
 * Signal 5: exposure to a recent external event, via the company's own
 * industry, a related company, or a key counterparty (reuses the same
 * relation resolution as the Investigation page's External Event card).
 * Only the single most specific match counts, so a company doesn't get
 * credit multiple times for the same event.
 */
function detectExternalEventExposure(companyId: string): RiskSignal[] {
  const matches = getExternalEventsRelatedToCompany(companyId);
  let best: { relation: string; eventTitle: string } | null = null;
  for (const match of matches) {
    for (const via of match.matchedVia) {
      if (!best || RELATION_SPECIFICITY[via.relation] > RELATION_SPECIFICITY[best.relation]) {
        best = { relation: via.relation, eventTitle: match.event.title };
      }
    }
  }
  if (!best) return [];

  const isSelfOnly = best.relation === "SELF";
  return [
    {
      type: "EXTERNAL_EVENT_EXPOSURE",
      weight: isSelfOnly ? WEIGHTS.EXTERNAL_EVENT_SELF : WEIGHTS.EXTERNAL_EVENT_SPECIFIC,
      explanation: `외부 Event "${best.eventTitle}"의 영향권에 포함됨 (${
        RELATION_LABEL_KO[best.relation]
      } 경로) — 실제 영향 여부 확인 필요.`,
    },
  ];
}

/** Signal 6: negative-sentiment news coverage about the company itself. */
function detectNegativeNews(companyId: string): RiskSignal[] {
  const negativeNews = getNewsByCompany(companyId).filter((n) => n.sentiment === "NEGATIVE");
  if (negativeNews.length === 0) return [];
  return [
    {
      type: "NEGATIVE_NEWS",
      weight: WEIGHTS.NEGATIVE_NEWS,
      explanation: `부정적 외부 보도 ${negativeNews.length}건 확인 (예: "${
        negativeNews[0].headline
      }") — 사실관계 확인 필요.`,
    },
  ];
}

/** Runs every detector for one company. Order is the display order. */
export function detectRiskSignals(companyId: string): RiskSignal[] {
  return [
    ...detectFinancialSignals(companyId),
    ...detectCounterpartyConcentration(companyId),
    ...detectRelatedPartyFundMovement(companyId),
    ...detectExternalEventExposure(companyId),
    ...detectNegativeNews(companyId),
  ];
}
