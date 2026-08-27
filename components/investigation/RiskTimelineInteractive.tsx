"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { formatEok } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Company, RiskTimelineEvent } from "@/lib/types";
import type { ResolvedTimelineEvidence } from "@/lib/repository/investigationRepository";

const CATEGORY_LABELS: Record<string, string> = {
  LOAN: "대출",
  FINANCIAL: "재무",
  TRANSACTION: "거래",
  RELATED_PARTY: "관계사",
  EXTERNAL_EVENT: "외부 Event",
  INVESTIGATION: "Investigation",
  EWS: "EWS",
  RM_NOTE: "담당자 메모",
};

export interface TimelineItem {
  event: RiskTimelineEvent;
  evidence: ResolvedTimelineEvidence;
  relatedCompanyDetails: Array<{ company: Company; exposure: number }>;
}

// A click-to-expand timeline: selecting an entry reveals the real records
// (loan terms, transaction amounts, financial figures, related-company
// exposure) that entry is actually about, resolved server-side in
// investigationRepository.resolveTimelineEvidence — not new prose.
export function RiskTimelineInteractive({ items }: { items: TimelineItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <ol className="space-y-1 border-l-2 border-dashed pl-6">
      {items.map(({ event, evidence, relatedCompanyDetails }) => {
        const isSelected = selectedId === event.id;
        return (
          <li key={event.id} className="relative py-2">
            <span className="absolute -left-[27px] top-4 size-2 rounded-full border-2 border-background bg-foreground" />
            <button
              type="button"
              onClick={() => setSelectedId(isSelected ? null : event.id)}
              className="w-full rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-expanded={isSelected}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">{event.date}</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {CATEGORY_LABELS[event.category] ?? event.category}
                </Badge>
              </div>
              <p className="flex items-center justify-between gap-2">
                <span className="font-medium">{event.label}</span>
                <span className="text-xs text-muted-foreground">
                  {isSelected ? "근거 숨기기 ▲" : "근거 보기 ▼"}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </button>

            {isSelected && (
              <div className="mt-2 space-y-3 rounded-md border bg-muted/20 p-3 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">왜 Risk Signal과 연결되는가 — </span>
                  {event.whyItMatters}
                </p>

                {evidence.loans.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">관련 대출</p>
                    <ul className="space-y-1">
                      {evidence.loans.map((l) => (
                        <li key={l.id} className="flex items-center justify-between">
                          <span>
                            {l.productType} · 실행일 {l.startDate}
                          </span>
                          <span className="tabular-nums">
                            잔액 {formatEok(l.outstandingBalance)} (원금 {formatEok(l.principal)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evidence.financialStatement && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      재무제표 {evidence.financialStatement.fiscalYear} Q{evidence.financialStatement.quarter}
                    </p>
                    <div className="grid grid-cols-2 gap-1 tabular-nums sm:grid-cols-4">
                      <span>매출 {formatEok(evidence.financialStatement.revenue)}</span>
                      <span>매출채권 {formatEok(evidence.financialStatement.accountsReceivable)}</span>
                      <span
                        className={cn(
                          evidence.financialStatement.operatingCashFlow < 0 &&
                            "font-medium text-red-700"
                        )}
                      >
                        영업현금흐름 {formatEok(evidence.financialStatement.operatingCashFlow)}
                      </span>
                      <span>순이익 {formatEok(evidence.financialStatement.netProfit)}</span>
                    </div>
                  </div>
                )}

                {evidence.transactions.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      관련 거래 (거래일 · 금액) — 합계{" "}
                      <span className="tabular-nums">{formatEok(evidence.totalTransactionAmount)}</span>
                    </p>
                    <ul className="space-y-1">
                      {evidence.transactions.map((t) => (
                        <li key={t.id} className="flex items-center justify-between">
                          <span>
                            {t.date} · {t.category}
                          </span>
                          <span className="tabular-nums">
                            {t.type === "INFLOW" ? "+" : "-"}
                            {formatEok(t.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {relatedCompanyDetails.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">관련 회사 · Exposure</p>
                    <ul className="space-y-1">
                      {relatedCompanyDetails.map(({ company, exposure }) => (
                        <li key={company.id} className="flex items-center justify-between">
                          <Link href={`/companies/${company.id}`} className="font-medium hover:underline">
                            {company.name}
                          </Link>
                          <span className="flex items-center gap-2">
                            <RiskLevelBadge level={company.currentEwsRiskLevel} />
                            <span className="tabular-nums">{formatEok(exposure)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evidence.externalEvent && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">외부 Event</p>
                    <p className="font-medium">{evidence.externalEvent.title}</p>
                    <p className="text-xs text-muted-foreground">{evidence.externalEvent.description}</p>
                  </div>
                )}

                {evidence.investigation && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Investigation</p>
                    <p>
                      {evidence.investigation.id} · {evidence.investigation.status} ·{" "}
                      {evidence.investigation.createdBy}
                    </p>
                    <p className="text-xs text-muted-foreground">{evidence.investigation.reason}</p>
                  </div>
                )}

                {evidence.rmNote && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      담당자 메모 ({evidence.rmNote.authorName}, {evidence.rmNote.createdDate})
                    </p>
                    <p>{evidence.rmNote.note}</p>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
