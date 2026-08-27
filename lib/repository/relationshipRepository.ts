import { relatedCompanies } from "@/data/relatedCompanies";
import { counterparties } from "@/data/counterparties";
import type { RelatedCompany, Counterparty } from "@/lib/types";

// Related-party links are directional in storage but conceptually
// bidirectional for display, so we return the link regardless of which
// side matches.
export function getRelatedCompanies(companyId: string): RelatedCompany[] {
  return relatedCompanies.filter(
    (r) => r.companyId === companyId || r.relatedCompanyId === companyId
  );
}

export function getRelatedCompanyIds(companyId: string): string[] {
  const ids = new Set<string>();
  for (const r of getRelatedCompanies(companyId)) {
    if (r.companyId !== companyId) ids.add(r.companyId);
    if (r.relatedCompanyId !== companyId) ids.add(r.relatedCompanyId);
  }
  return [...ids];
}

export function getCounterpartiesByCompany(companyId: string): Counterparty[] {
  return counterparties.filter((c) => c.companyId === companyId);
}
