// Data access layer for Company / Loan / EwsSignal / FinancialStatement.
// UI code must go through these functions, never import from /data directly —
// this is the seam where a real database would be swapped in later.

import { companies } from "@/data/companies";
import { loans } from "@/data/loans";
import { ewsSignals } from "@/data/ewsSignals";
import { financials } from "@/data/financials";
import type { Company, Loan, EwsSignal, FinancialStatement } from "@/lib/types";

export function getAllCompanies(): Company[] {
  return companies;
}

export function getCompanyById(companyId: string): Company | undefined {
  return companies.find((c) => c.id === companyId);
}

export function getLoansByCompany(companyId: string): Loan[] {
  return loans.filter((l) => l.companyId === companyId);
}

export function getAllLoans(): Loan[] {
  return loans;
}

export function getLoanById(loanId: string): Loan | undefined {
  return loans.find((l) => l.id === loanId);
}

// Authoritative "our bank" exposure figure — computed from Loan records
// rather than trusted from Company.totalExposure, which may drift in a real
// system where the two come from different source tables.
export function getCompanyExposure(companyId: string): number {
  return getLoansByCompany(companyId).reduce((sum, l) => sum + l.outstandingBalance, 0);
}

export function getEwsSignalsByCompany(companyId: string): EwsSignal[] {
  return ewsSignals
    .filter((s) => s.companyId === companyId)
    .sort((a, b) => a.signalDate.localeCompare(b.signalDate));
}

export function getLatestEwsSignal(companyId: string): EwsSignal | undefined {
  const signals = getEwsSignalsByCompany(companyId);
  return signals[signals.length - 1];
}

export function getEwsSignalById(signalId: string): EwsSignal | undefined {
  return ewsSignals.find((s) => s.id === signalId);
}

export function getFinancialsByCompany(companyId: string): FinancialStatement[] {
  return financials
    .filter((f) => f.companyId === companyId)
    .sort((a, b) => a.fiscalYear - b.fiscalYear || a.quarter - b.quarter);
}

export function getFinancialStatementById(statementId: string): FinancialStatement | undefined {
  return financials.find((f) => f.id === statementId);
}

export function getHighRiskCompanies(): Company[] {
  return companies.filter(
    (c) => c.currentEwsRiskLevel === "HIGH" || c.currentEwsRiskLevel === "CRITICAL"
  );
}

// Hidden-risk classification is computed, not tagged — see
// lib/riskScan.ts's scanPortfolio()/getPriorityInvestigationCandidates().
