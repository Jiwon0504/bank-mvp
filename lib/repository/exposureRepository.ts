import { institutions } from "@/data/institutions";
import { institutionExposures } from "@/data/institutionExposures";
import type { FinancialInstitution, InstitutionExposure } from "@/lib/types";

export function getAllInstitutions(): FinancialInstitution[] {
  return institutions;
}

export function getInstitutionExposuresByCompany(companyId: string): InstitutionExposure[] {
  return institutionExposures.filter((e) => e.companyId === companyId);
}

export function getInstitutionExposuresForGroup(companyIds: string[]): InstitutionExposure[] {
  return institutionExposures.filter((e) => companyIds.includes(e.companyId));
}

export function getTotalCrossInstitutionExposure(companyIds: string[]): number {
  return getInstitutionExposuresForGroup(companyIds).reduce(
    (sum, e) => sum + e.exposureAmount,
    0
  );
}
