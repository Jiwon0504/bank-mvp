"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { formatEok } from "@/lib/format";
import { getExternalEventsRelatedToCompany } from "@/lib/repository/eventRepository";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Dictionary } from "@/lib/i18n/translations";

type ExternalEventDict = Dictionary["investigation"]["externalEvent"];
type CommonDict = Dictionary["common"];

function whyItRelates(
  t: ExternalEventDict,
  companyName: string,
  relation: string,
  industry: string
): string {
  if (relation === "SELF") {
    return t.whySelf.replace("{industry}", industry);
  }
  if (relation === "COUNTERPARTY") {
    return t.whyCounterparty.replace("{name}", companyName);
  }
  return t.whyRelated.replace("{name}", companyName);
}

export function ExternalEventCard({
  companyId,
  t,
  common,
}: {
  companyId: string;
  t: ExternalEventDict;
  common: CommonDict;
}) {
  const { locale } = useLanguage();
  const relationLabels: Record<string, string> = {
    SELF: common.self,
    RELATED: common.relatedCompany,
    COUNTERPARTY: common.counterparty,
  };
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
    return <p className="text-sm text-muted-foreground">{t.noData}</p>;
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
                {isExpanded ? t.hideDetail : t.showDetail}
              </span>
            </button>

            {isExpanded && (
              <div className="space-y-3 border-t p-3 text-sm">
                <p>{event.description}</p>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t.affectedNetworkLabel}{" "}
                    <span className="tabular-nums">{formatEok(totalExposure, locale)}</span>
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
                              {relationLabels[m.relation]}
                            </Badge>
                            <RiskLevelBadge level={m.riskLevel} />
                            <span className="tabular-nums">{formatEok(m.exposure, locale)}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {whyItRelates(t, m.companyName, m.relation, m.industry)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={`/events/${event.id}`}
                  className="inline-block text-sm font-medium hover:underline"
                >
                  {t.viewIndustryImpact}
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
