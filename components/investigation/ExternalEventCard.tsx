"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { formatEok } from "@/lib/format";
import { getExternalEventsRelatedToCompany } from "@/lib/repository/eventRepository";

const RELATION_LABELS: Record<string, string> = {
  SELF: "본인 산업",
  RELATED: "관계사",
  COUNTERPARTY: "주요 거래처",
};

function whyItRelates(companyName: string, relation: string, industry: string): string {
  if (relation === "SELF") {
    return `본인 업종(${industry})이 이 이벤트의 영향 산업에 포함되어 직접 영향 가능성이 있습니다.`;
  }
  if (relation === "COUNTERPARTY") {
    return `주요 거래처(${companyName})가 영향 산업에 속해 있어, 해당 거래처에 문제가 발생하면 매출·자금 흐름에 직접 영향을 줄 수 있습니다.`;
  }
  return `관계사(${companyName})가 영향 산업에 속해 있어, 관계사 리스크가 그룹 내로 전이될 가능성이 있습니다.`;
}

export function ExternalEventCard({ companyId }: { companyId: string }) {
  const matches = getExternalEventsRelatedToCompany(companyId);
  // Default to the most specific match — an event that touches a named
  // counterparty beats one that touches a related company, which beats a
  // same-industry-only match. That's the more interesting story for a
  // reviewer opening this card for the first time.
  const specificity = (m: (typeof matches)[number]) => {
    if (m.matchedVia.some((v) => v.relation === "COUNTERPARTY")) return 0;
    if (m.matchedVia.some((v) => v.relation === "RELATED")) return 1;
    return 2;
  };
  const defaultMatch = [...matches].sort((a, b) => specificity(a) - specificity(b))[0];
  const [expandedId, setExpandedId] = useState<string | null>(defaultMatch?.event.id ?? null);

  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        이 차주의 연결망(본인/관계사/주요 거래처)에 영향을 주는 외부 Event가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map(({ event, matchedVia }) => {
        const isExpanded = expandedId === event.id;
        const totalExposure = matchedVia.reduce((sum, m) => sum + m.exposure, 0);
        return (
          <div key={event.id} className="rounded-md border">
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : event.id)}
              aria-expanded={isExpanded}
              className="flex w-full items-start justify-between gap-3 p-3 text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{event.title}</p>
                  <Badge variant="outline" className="font-normal">
                    {event.magnitude}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.eventDate} · {event.category}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {isExpanded ? "닫기 ▲" : "영향 상세 보기 ▼"}
              </span>
            </button>

            {isExpanded && (
              <div className="space-y-3 border-t p-3 text-sm">
                <p>{event.description}</p>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    영향받는 연결망 · 합계 Exposure{" "}
                    <span className="tabular-nums">{formatEok(totalExposure)}</span>
                  </p>
                  <ul className="space-y-2">
                    {matchedVia.map((m) => (
                      <li key={m.companyId} className="rounded-md border bg-muted/20 p-2">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/companies/${m.companyId}`}
                            className="font-medium hover:underline"
                          >
                            {m.companyName}
                          </Link>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-normal">
                              {RELATION_LABELS[m.relation]}
                            </Badge>
                            <RiskLevelBadge level={m.riskLevel} />
                            <span className="tabular-nums">{formatEok(m.exposure)}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {whyItRelates(m.companyName, m.relation, m.industry)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={`/events/${event.id}`}
                  className="inline-block text-sm font-medium hover:underline"
                >
                  이 이벤트의 산업 전체 영향 보기 →
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
