"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { formatEok } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Company, RiskTimelineEvent } from "@/lib/types";
import type { ResolvedTimelineEvidence } from "@/lib/repository/investigationRepository";
import type { Dictionary } from "@/lib/i18n/translations";

export interface TimelineItem {
  event: RiskTimelineEvent;
  evidence: ResolvedTimelineEvidence;
  relatedCompanyDetails: Array<{ company: Company; exposure: number }>;
}

type TimelineDict = Dictionary["investigation"]["timeline"];

// A click-to-expand timeline: selecting an entry reveals the real records
// (loan terms, transaction amounts, financial figures, related-company
// exposure) that entry is actually about, resolved server-side in
// investigationRepository.resolveTimelineEvidence — not new prose.
export function RiskTimelineInteractive({ items, t }: { items: TimelineItem[]; t: TimelineDict }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { locale } = useLanguage();
  const categoryLabels = t.categories;

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
                  {categoryLabels[event.category] ?? event.category}
                </Badge>
              </div>
              <p className="flex items-center justify-between gap-2">
                <span className="font-medium">{event.label}</span>
                <span className="text-xs text-muted-foreground">
                  {isSelected ? t.hideEvidence : t.showEvidence}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </button>

            {isSelected && (
              <div className="mt-2 space-y-3 rounded-md border bg-muted/20 p-3 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{t.whyConnected}</span>
                  {event.whyItMatters}
                </p>

                {evidence.loans.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{t.relatedLoans}</p>
                    <ul className="space-y-1">
                      {evidence.loans.map((l) => (
                        <li key={l.id} className="flex items-center justify-between">
                          <span>
                            {l.productType} · {t.executedOn} {l.startDate}
                          </span>
                          <span className="tabular-nums">
                            {t.balanceLabel} {formatEok(l.outstandingBalance, locale)} ({t.principalLabel}{" "}
                            {formatEok(l.principal, locale)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evidence.financialStatement && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t.financialStatement} {evidence.financialStatement.fiscalYear} Q
                      {evidence.financialStatement.quarter}
                    </p>
                    <div className="grid grid-cols-2 gap-1 tabular-nums sm:grid-cols-4">
                      <span>
                        {t.financialLabels.revenue} {formatEok(evidence.financialStatement.revenue, locale)}
                      </span>
                      <span>
                        {t.financialLabels.receivables}{" "}
                        {formatEok(evidence.financialStatement.accountsReceivable, locale)}
                      </span>
                      <span
                        className={cn(
                          evidence.financialStatement.operatingCashFlow < 0 &&
                            "font-medium text-red-700 dark:text-red-400"
                        )}
                      >
                        {t.financialLabels.cashFlow}{" "}
                        {formatEok(evidence.financialStatement.operatingCashFlow, locale)}
                      </span>
                      <span>
                        {t.financialLabels.netProfit} {formatEok(evidence.financialStatement.netProfit, locale)}
                      </span>
                    </div>
                  </div>
                )}

                {evidence.transactions.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t.relatedTransactions}{" "}
                      <span className="tabular-nums">{formatEok(evidence.totalTransactionAmount, locale)}</span>
                    </p>
                    <ul className="space-y-1">
                      {evidence.transactions.map((tx) => (
                        <li key={tx.id} className="flex items-center justify-between">
                          <span>
                            {tx.date} · {tx.category}
                          </span>
                          <span className="tabular-nums">
                            {tx.type === "INFLOW" ? "+" : "-"}
                            {formatEok(tx.amount, locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {relatedCompanyDetails.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t.relatedCompaniesExposure}
                    </p>
                    <ul className="space-y-1">
                      {relatedCompanyDetails.map(({ company, exposure }) => (
                        <li key={company.id} className="flex items-center justify-between">
                          <Link href={`/companies/${company.id}`} className="font-medium hover:underline">
                            {company.name}
                          </Link>
                          <span className="flex items-center gap-2">
                            <RiskLevelBadge level={company.currentEwsRiskLevel} />
                            <span className="tabular-nums">{formatEok(exposure, locale)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evidence.externalEvent && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t.externalEvent}</p>
                    <p className="font-medium">{evidence.externalEvent.title}</p>
                    <p className="text-xs text-muted-foreground">{evidence.externalEvent.description}</p>
                  </div>
                )}

                {evidence.investigation && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t.investigationLabel}</p>
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
                      {t.rmNote} ({evidence.rmNote.authorName}, {evidence.rmNote.createdDate})
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
