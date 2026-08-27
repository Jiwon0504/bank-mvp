import { externalEvents } from "@/data/externalEvents";
import { news } from "@/data/news";
import { companies } from "@/data/companies";
import { getRelatedCompanyIds, getCounterpartiesByCompany } from "@/lib/repository/relationshipRepository";
import { getCompanyExposure } from "@/lib/repository/companyRepository";
import type { ExternalEvent, NewsItem, Company, RiskLevel } from "@/lib/types";

export function getAllExternalEvents(): ExternalEvent[] {
  return externalEvents;
}

export function getExternalEventById(eventId: string): ExternalEvent | undefined {
  return externalEvents.find((e) => e.id === eventId);
}

// Companies whose industry intersects the event's affected industries —
// the "which borrowers could this touch" fan-out for External Event Impact.
export function getCompaniesAffectedByEvent(eventId: string): Company[] {
  const event = getExternalEventById(eventId);
  if (!event) return [];
  return companies.filter((c) => event.affectedIndustries.includes(c.industry));
}

export function getNewsByCompany(companyId: string): NewsItem[] {
  return news
    .filter((n) => n.companyId === companyId)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export type EventRelation = "SELF" | "RELATED" | "COUNTERPARTY";

export interface RelatedEventMatchCompany {
  companyId: string;
  companyName: string;
  industry: string;
  relation: EventRelation;
  exposure: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface RelatedEventMatch {
  event: ExternalEvent;
  matchedVia: RelatedEventMatchCompany[];
}

// External Event Impact, but scoped to one company's connected group
// (itself + related companies + counterparties) instead of a whole
// industry — this is what powers the "External Event 연결" step in the
// Risk Investigation view: which event touches THIS borrower's network,
// and through which specific connection.
export function getExternalEventsRelatedToCompany(companyId: string): RelatedEventMatch[] {
  const candidates: { id: string; relation: EventRelation }[] = [
    { id: companyId, relation: "SELF" },
    ...getRelatedCompanyIds(companyId).map((id) => ({ id, relation: "RELATED" as const })),
    ...getCounterpartiesByCompany(companyId)
      .filter((c) => c.counterpartyCompanyId)
      .map((c) => ({ id: c.counterpartyCompanyId as string, relation: "COUNTERPARTY" as const })),
  ];

  const results: RelatedEventMatch[] = [];
  for (const event of externalEvents) {
    const matchedVia = candidates
      .map(({ id, relation }): RelatedEventMatchCompany | null => {
        const company = companies.find((c) => c.id === id);
        if (!company || !event.affectedIndustries.includes(company.industry)) return null;
        return {
          companyId: id,
          companyName: company.name,
          industry: company.industry,
          relation,
          exposure: getCompanyExposure(id),
          riskScore: company.currentEwsRiskScore,
          riskLevel: company.currentEwsRiskLevel,
        };
      })
      .filter((m): m is RelatedEventMatchCompany => Boolean(m));
    if (matchedVia.length > 0) results.push({ event, matchedVia });
  }
  return results;
}
