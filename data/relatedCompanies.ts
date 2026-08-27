import type { RelatedCompany } from "@/lib/types";
import { SCENARIO_COMPANY_IDS } from "./companies";

const { seramTech, haneui, cheongwoo } = SCENARIO_COMPANY_IDS;

// Generic companies have no related-party records in this MVP (kept simple).
// The Hidden Risk Case scenario is where this entity carries narrative weight:
// 세림테크 <-> 하늬산업 share the same representative director; 세림테크 and
// 청우머티리얼 are linked as affiliates through cross-shareholding.
export const relatedCompanies: RelatedCompany[] = [
  {
    id: "REL-001",
    companyId: seramTech,
    relatedCompanyId: haneui,
    relationType: "SAME_OWNER",
  },
  {
    id: "REL-002",
    companyId: seramTech,
    relatedCompanyId: cheongwoo,
    relationType: "AFFILIATE",
    ownershipPct: 18,
  },
  {
    id: "REL-003",
    companyId: haneui,
    relatedCompanyId: cheongwoo,
    relationType: "AFFILIATE",
    ownershipPct: 12,
  },
];
