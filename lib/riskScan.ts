// Portfolio-wide Hidden-Risk scan: applies detectRiskSignals() uniformly to
// every borrower, turns the fired signals into a "Connected Risk Score" /
// "Connected Risk Level" using the same LOW/MEDIUM/HIGH/CRITICAL thresholds
// as the EWS score, and flags a borrower as a priority Investigation
// candidate only when the connected view disagrees with the EWS view — an
// EWS-agreeing company (already HIGH/CRITICAL, or already delinquent) is
// not "hidden," it's just correctly flagged already.
import { getAllCompanies, getLoansByCompany } from "@/lib/repository/companyRepository";
import { detectRiskSignals, type RiskSignal } from "@/lib/riskSignals";
import { riskLevelFromScore } from "@/lib/riskStyle";
import type { Company, RiskLevel } from "@/lib/types";

const LEVEL_RANK: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

export interface CompanyRiskScan {
  company: Company;
  ewsScore: number;
  ewsLevel: RiskLevel;
  connectedScore: number;
  connectedLevel: RiskLevel;
  signals: RiskSignal[];
  hasDelinquency: boolean;
  /** connectedLevel rank minus ewsLevel rank; >0 means the connected view is more severe than EWS. */
  gapRank: number;
  /**
   * True only when: the connected signals push the risk view strictly
   * above what EWS currently shows (gapRank >= 1), EWS itself still reads
   * LOW/MEDIUM (a HIGH/CRITICAL EWS company isn't "hidden," it's already
   * flagged), there's at least one real signal driving that gap, and there
   * is no delinquency (a delinquent loan is already visible through the
   * traditional route, defeating the "hidden" premise).
   */
  isPriorityCandidate: boolean;
}

export function scanCompany(company: Company): CompanyRiskScan {
  const signals = detectRiskSignals(company.id);
  const connectedScore = Math.min(100, signals.reduce((sum, s) => sum + s.weight, 0));
  const connectedLevel = riskLevelFromScore(connectedScore);
  const ewsLevel = company.currentEwsRiskLevel;
  const hasDelinquency = getLoansByCompany(company.id).some((l) => l.delinquencyDays > 0);
  const gapRank = LEVEL_RANK[connectedLevel] - LEVEL_RANK[ewsLevel];

  const isPriorityCandidate =
    !hasDelinquency && LEVEL_RANK[ewsLevel] <= 1 && gapRank >= 1 && signals.length > 0;

  return {
    company,
    ewsScore: company.currentEwsRiskScore,
    ewsLevel,
    connectedScore,
    connectedLevel,
    signals,
    hasDelinquency,
    gapRank,
    isPriorityCandidate,
  };
}

/** Scans every company in the portfolio with the exact same logic — no exceptions. */
export function scanPortfolio(): CompanyRiskScan[] {
  return getAllCompanies().map(scanCompany);
}

/** Priority candidates, ranked by how large the EWS/connected gap is, then by connected score. */
export function getPriorityInvestigationCandidates(scans: CompanyRiskScan[], limit = 8): CompanyRiskScan[] {
  return scans
    .filter((s) => s.isPriorityCandidate)
    .sort((a, b) => b.gapRank - a.gapRank || b.connectedScore - a.connectedScore)
    .slice(0, limit);
}
