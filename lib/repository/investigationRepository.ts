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
  InvestigationFindingType,
  InvestigationStatus,
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

// The only allowed forward transitions — OPEN -> IN_PROGRESS -> CLOSED, no
// skipping a step and no going back, matching a real credit-review
// process's sign-off order.
const ALLOWED_NEXT_STATUS: Record<InvestigationStatus, InvestigationStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["CLOSED"],
  CLOSED: [],
};

// Applies a status transition if (and only if) it's the allowed next step.
// Closing additionally requires a finding type + final judgment — those are
// already `required` on the closing form, but this is the server-side
// backstop that actually withholds the write if either is missing, rather
// than trusting the client. Returns the investigation unchanged (not an
// error) if the transition or the required fields are invalid — this mock
// backend has no error-surfacing channel beyond the confirmation banner the
// caller already redirects to, so an invalid attempt is simply a no-op.
export function updateInvestigationStatus(input: {
  investigationId: string;
  status: InvestigationStatus;
  findingType?: InvestigationFindingType;
  findings?: string;
  finalJudgment?: string;
  closedBy?: string;
}): Investigation | undefined {
  const investigation = getInvestigationById(input.investigationId);
  if (!investigation) return undefined;
  if (!ALLOWED_NEXT_STATUS[investigation.status].includes(input.status)) return investigation;
  if (input.status === "CLOSED" && (!input.findingType || !input.finalJudgment?.trim())) {
    return investigation;
  }

  investigation.status = input.status;
  if (input.findingType) investigation.findingType = input.findingType;
  if (input.findings !== undefined) investigation.findings = input.findings;
  if (input.finalJudgment !== undefined) investigation.finalJudgment = input.finalJudgment;
  if (input.status === "CLOSED") {
    investigation.closedDate = DEMO_TODAY;
    investigation.closedBy = input.closedBy;
  }
  return investigation;
}

export function getInvestigationStatusCounts(): Record<InvestigationStatus, number> {
  const counts: Record<InvestigationStatus, number> = { OPEN: 0, IN_PROGRESS: 0, CLOSED: 0 };
  for (const investigation of store.investigations) counts[investigation.status]++;
  return counts;
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
