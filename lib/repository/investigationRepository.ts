import { store } from "./store";
import { riskTimeline } from "@/data/riskTimeline";
import { DEMO_TODAY } from "@/lib/constants";
import {
  getCompanyById,
  getLoanById,
  getFinancialStatementById,
  getEwsSignalById,
} from "./companyRepository";
import { getTransactionsByIds } from "./transactionRepository";
import { getExternalEventById } from "./eventRepository";
import { getRmNoteById } from "./noteRepository";
import type {
  Company,
  EwsSignal,
  ExternalEvent,
  FinancialStatement,
  Investigation,
  Loan,
  RmNote,
  RiskTimelineEvent,
  Transaction,
} from "@/lib/types";

export function getAllInvestigations(): Investigation[] {
  return store.investigations;
}

export function getInvestigationsByCompany(companyId: string): Investigation[] {
  return store.investigations.filter((i) => i.companyId === companyId);
}

export function getInvestigationById(investigationId: string): Investigation | undefined {
  return store.investigations.find((i) => i.id === investigationId);
}

export function createInvestigation(input: {
  companyId: string;
  createdBy: string;
  reason: string;
}): Investigation {
  const investigation: Investigation = {
    id: `INV-${String(store.investigations.length + 1).padStart(3, "0")}`,
    companyId: input.companyId,
    createdDate: DEMO_TODAY,
    createdBy: input.createdBy,
    status: "OPEN",
    reason: input.reason,
  };
  store.investigations.push(investigation);
  return investigation;
}

export function getRiskTimeline(companyId: string): RiskTimelineEvent[] {
  return riskTimeline
    .filter((t) => t.companyId === companyId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface ResolvedTimelineEvidence {
  loans: Loan[];
  transactions: Transaction[];
  financialStatement?: FinancialStatement;
  relatedCompanies: Company[];
  externalEvent?: ExternalEvent;
  investigation?: Investigation;
  ewsSignal?: EwsSignal;
  rmNote?: RmNote;
  totalLoanAmount: number;
  totalTransactionAmount: number;
}

// Turns a timeline entry's `evidence` references into the actual underlying
// records — real loan terms, transaction amounts, exposure figures — so a
// clicked timeline entry shows real data instead of just more prose.
export function resolveTimelineEvidence(event: RiskTimelineEvent): ResolvedTimelineEvidence {
  const ref = event.evidence ?? {};

  const loans = (ref.loanIds ?? []).map(getLoanById).filter((l): l is Loan => Boolean(l));
  const transactions = getTransactionsByIds(ref.transactionIds ?? []);
  const relatedCompanies = (ref.relatedCompanyIds ?? [])
    .map(getCompanyById)
    .filter((c): c is Company => Boolean(c));

  return {
    loans,
    transactions,
    financialStatement: ref.financialStatementId
      ? getFinancialStatementById(ref.financialStatementId)
      : undefined,
    relatedCompanies,
    externalEvent: ref.externalEventId ? getExternalEventById(ref.externalEventId) : undefined,
    investigation: ref.investigationId ? getInvestigationById(ref.investigationId) : undefined,
    ewsSignal: ref.ewsSignalId ? getEwsSignalById(ref.ewsSignalId) : undefined,
    rmNote: ref.rmNoteId ? getRmNoteById(ref.rmNoteId) : undefined,
    totalLoanAmount: loans.reduce((sum, l) => sum + l.outstandingBalance, 0),
    totalTransactionAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
  };
}
