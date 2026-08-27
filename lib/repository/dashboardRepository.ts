import {
  getAllCompanies,
  getCompanyExposure,
  getHighRiskCompanies,
  getHiddenRiskCaseCompanies,
} from "./companyRepository";
import { getAllInvestigations } from "./investigationRepository";
import { ewsSignals } from "@/data/ewsSignals";
import { isWithinDays } from "@/lib/constants";
import type { Company, Industry, Region } from "@/lib/types";

export interface DistributionBucket {
  key: string;
  count: number;
  avgRiskScore: number;
  totalExposure: number;
}

export interface DashboardSummary {
  totalExposure: number;
  totalBorrowers: number;
  highRiskBorrowers: number;
  newRiskSignals: number;
  investigationsInProgress: number;
  industryDistribution: DistributionBucket[];
  regionDistribution: DistributionBucket[];
  hiddenRiskCases: Company[];
}

function buildDistribution<K extends string>(
  companies: Company[],
  keyOf: (c: Company) => K,
  exposureOf: (companyId: string) => number
): DistributionBucket[] {
  const buckets = new Map<string, { count: number; scoreSum: number; exposureSum: number }>();
  for (const c of companies) {
    const key = keyOf(c);
    const bucket = buckets.get(key) ?? { count: 0, scoreSum: 0, exposureSum: 0 };
    bucket.count += 1;
    bucket.scoreSum += c.currentEwsRiskScore;
    bucket.exposureSum += exposureOf(c.id);
    buckets.set(key, bucket);
  }
  return [...buckets.entries()]
    .map(([key, b]) => ({
      key,
      count: b.count,
      avgRiskScore: Math.round(b.scoreSum / b.count),
      totalExposure: b.exposureSum,
    }))
    .sort((a, b) => b.totalExposure - a.totalExposure);
}

export function getDashboardSummary(): DashboardSummary {
  const companies = getAllCompanies();
  const exposureByCompany = new Map(companies.map((c) => [c.id, getCompanyExposure(c.id)]));
  const totalExposure = [...exposureByCompany.values()].reduce((a, b) => a + b, 0);

  const newRiskSignals = ewsSignals.filter((s) => isWithinDays(s.signalDate, 14)).length;
  const investigationsInProgress = getAllInvestigations().filter(
    (i) => i.status === "OPEN" || i.status === "IN_PROGRESS"
  ).length;

  return {
    totalExposure,
    totalBorrowers: companies.length,
    highRiskBorrowers: getHighRiskCompanies().length,
    newRiskSignals,
    investigationsInProgress,
    industryDistribution: buildDistribution(
      companies,
      (c) => c.industry as Industry,
      (id) => exposureByCompany.get(id) ?? 0
    ),
    regionDistribution: buildDistribution(
      companies,
      (c) => c.region as Region,
      (id) => exposureByCompany.get(id) ?? 0
    ),
    hiddenRiskCases: getHiddenRiskCaseCompanies(),
  };
}
