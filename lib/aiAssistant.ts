// Context builder for the Claude-powered AI Assistant (free-form Q&A about
// a specific company's credit risk). Deliberately separate from
// lib/riskAnalysis.ts (the deterministic, fixed-shape Investigation
// Summary) — that module's docstring already earmarks itself as "a
// placeholder for the future Claude-powered Investigation Summary", but
// this is a different feature (open-ended chat, not a fixed 6-section
// report) so it gets its own module rather than overloading that one.
import {
  getCompanyById,
  getLoansByCompany,
  getFinancialsByCompany,
  getEwsSignalsByCompany,
  getCompanyExposure,
} from "@/lib/repository/companyRepository";
import { getRelatedCompanies, getCounterpartiesByCompany } from "@/lib/repository/relationshipRepository";
import { getNewsByCompany, getExternalEventsRelatedToCompany } from "@/lib/repository/eventRepository";
import { getRiskTimeline, getInvestigationsByCompany } from "@/lib/repository/investigationRepository";
import { getHumanReviewsByCompany } from "@/lib/repository/humanReviewRepository";
import { getActionsByCompany } from "@/lib/repository/actionRepository";
import { getInstitutionExposuresByCompany, getAllInstitutions } from "@/lib/repository/exposureRepository";
import { getRmNotesByCompany } from "@/lib/repository/noteRepository";
import { detectRiskSignals } from "@/lib/riskSignals";
import { scanCompany } from "@/lib/riskScan";
import { formatEok } from "@/lib/format";

export const ASSISTANT_SYSTEM_PROMPT = `You are a credit-risk analysis assistant embedded in a Korean commercial bank's internal Credit Risk Control Tower demo application.

Your role is strictly decision SUPPORT for a bank Relationship Manager (RM) reviewing one borrower — you never issue a credit decision, approval, downgrade, or instruction to act, and you never claim a company is committing fraud or will default. Hedge appropriately ("검증이 필요합니다" / "requires verification", not "이 회사는 부실 위험이 있습니다" as a bare assertion).

You will be given a structured data dump about exactly one borrower, assembled from the bank's internal systems: company profile, EWS (Early Warning System) score history, financial statements, loans, detected risk signals, related companies/counterparties, news, external events, the Risk Signal Timeline, and any Investigation / Human-in-the-loop / Action history already on file.

Rules:
- Answer ONLY using the data provided below. If the data doesn't cover what's asked, say so explicitly rather than guessing or inventing figures.
- Cite concrete numbers from the context when they support your answer (e.g. exact scores, amounts, percentages, dates) rather than vague generalities.
- All monetary figures in the context are in KRW millions unless already formatted otherwise.
- This is a synthetic demo dataset, not a real customer — but answer as if giving genuine analytical support, since that is what the demo is meant to showcase.
- Keep answers focused and to the point — a few short paragraphs or a short bulleted list, not an exhaustive re-statement of every data point given.`;

function section(title: string, lines: string[]): string {
  if (lines.length === 0) return `## ${title}\n(no data)`;
  return `## ${title}\n${lines.join("\n")}`;
}

// Renders every fact the app already tracks for this company into a plain
// text block for the model's system context — the same repository/lib
// functions the UI itself uses (lib/riskSignals.ts, lib/riskScan.ts), so
// the assistant's view of a company can never drift from what's on screen.
export function buildCompanyContext(companyId: string): string | null {
  const company = getCompanyById(companyId);
  if (!company) return null;

  const loans = getLoansByCompany(companyId);
  const financials = getFinancialsByCompany(companyId)
    .slice()
    .sort((a, b) => a.fiscalYear - b.fiscalYear || a.quarter - b.quarter);
  const ewsSignals = getEwsSignalsByCompany(companyId)
    .slice()
    .sort((a, b) => a.signalDate.localeCompare(b.signalDate));
  const related = getRelatedCompanies(companyId);
  const counterparties = getCounterpartiesByCompany(companyId);
  const news = getNewsByCompany(companyId);
  const externalEvents = getExternalEventsRelatedToCompany(companyId);
  const timeline = getRiskTimeline(companyId);
  const investigations = getInvestigationsByCompany(companyId);
  const humanReviews = getHumanReviewsByCompany(companyId);
  const actions = getActionsByCompany(companyId);
  const institutions = getAllInstitutions();
  const institutionExposures = getInstitutionExposuresByCompany(companyId);
  const rmNotes = getRmNotesByCompany(companyId);
  const signals = detectRiskSignals(companyId);
  const scan = scanCompany(company);

  const profile = [
    `이름/Name: ${company.name} (${company.id})`,
    `업종/Industry: ${company.industry} · 지역/Region: ${company.region}`,
    `설립/Established: ${company.establishedYear} · 임직원/Employees: ${company.employeeCount}`,
    `신용등급/Credit rating: ${company.creditRating}`,
    `EWS Risk Score: ${company.currentEwsRiskScore} (${company.currentEwsRiskLevel})`,
    `당행 Exposure(총 여신): ${formatEok(getCompanyExposure(companyId))}`,
    `Watch List 등록 여부: ${company.isWatchListed ? "Y" : "N"}`,
    `수입의존도(FX 민감도)/Import dependency: ${company.importDependencyPct}%`,
  ];

  const connectedScan = [
    `Connected Risk Score (portfolio scan): ${scan.connectedScore} (${scan.connectedLevel}) vs EWS ${scan.ewsScore} (${scan.ewsLevel})`,
    `Priority Investigation candidate: ${scan.isPriorityCandidate ? "Y" : "N"}`,
    `Delinquency present: ${scan.hasDelinquency ? "Y" : "N"}`,
  ];

  const ewsHistory = ewsSignals.map(
    (s) =>
      `${s.signalDate}: score ${s.riskScore} (${s.riskLevel}, Δ${s.scoreDelta >= 0 ? "+" : ""}${s.scoreDelta}) — trigger: ${s.triggerFactors.join(", ") || "none"}`
  );

  const financialLines = financials.map(
    (f) =>
      `FY${f.fiscalYear} Q${f.quarter}: 매출 ${formatEok(f.revenue)}, 영업이익 ${formatEok(f.operatingProfit)}, 순이익 ${formatEok(f.netProfit)}, 매출채권 ${formatEok(f.accountsReceivable)}, 영업현금흐름 ${formatEok(f.operatingCashFlow)}, 부채비율 ${f.debtRatio}%, 유동비율 ${f.currentRatio}%, 이자보상배율 ${f.interestCoverageRatio}`
  );

  const loanLines = loans.map(
    (l) =>
      `${l.id}: ${l.productType}, 원금 ${formatEok(l.principal)} / 잔액 ${formatEok(l.outstandingBalance)}, 금리 ${l.interestRate}%, 담보 ${l.collateralType}, 만기 ${l.maturityDate}, 연체일수 ${l.delinquencyDays}`
  );

  const signalLines = signals.map((s) => `[${s.type}] (weight ${s.weight}) ${s.explanation}`);

  const relatedLines = related.map((r) => {
    const rc = getCompanyById(r.relatedCompanyId);
    return `${rc?.name ?? r.relatedCompanyId} — ${r.relationType}${r.ownershipPct ? ` (지분 ${r.ownershipPct}%)` : ""}, EWS ${rc?.currentEwsRiskLevel ?? "N/A"} (${rc?.currentEwsRiskScore ?? "N/A"})`;
  });

  const counterpartyLines = counterparties.map(
    (c) =>
      `${c.counterpartyName} (${c.role}) — 연간거래액 ${formatEok(c.annualTransactionVolume)}, 집중도 ${c.concentrationPct}%`
  );

  const newsLines = news.map((n) => `${n.publishedDate} [${n.sentiment}] ${n.headline} — ${n.summary}`);

  const externalEventLines = externalEvents.flatMap((m) =>
    m.matchedVia.map(
      (mv) =>
        `${m.event.title} (${m.event.eventDate}, ${m.event.category}) — ${mv.companyName} via ${mv.relation}, Exposure ${formatEok(mv.exposure)}, EWS ${mv.riskLevel}(${mv.riskScore})`
    )
  );

  const timelineLines = timeline.map((t) => `${t.date} [${t.category}] ${t.label}: ${t.description} (${t.whyItMatters})`);

  const investigationLines = investigations.map(
    (inv) =>
      `${inv.id}: ${inv.status}, 개설 ${inv.createdDate} by ${inv.createdBy}, 사유: ${inv.reason}${
        inv.findingType ? `, 분류: ${inv.findingType}` : ""
      }${inv.finalJudgment ? `, 최종판단: ${inv.finalJudgment}` : ""}`
  );

  const humanReviewLines = humanReviews.map(
    (r) => `${r.createdDate} ${r.authorName}: ${r.decision} — ${r.rationale}`
  );

  const actionLines = actions.map(
    (a) => `${a.id}: ${a.type} (${a.status}), ${a.createdDate} by ${a.createdBy}${a.note ? ` — ${a.note}` : ""}`
  );

  const exposureLines = institutionExposures.map((e) => {
    const inst = institutions.find((i) => i.id === e.institutionId);
    return `${inst?.name ?? e.institutionId}: ${formatEok(e.exposureAmount)} (기준일 ${e.asOfDate})`;
  });

  const rmNoteLines = rmNotes.map((n) => `${n.createdDate} ${n.authorName}: ${n.note} [${n.tags.join(", ")}]`);

  return [
    section("Company Profile", profile),
    section("Portfolio Scan (EWS vs Connected Risk)", connectedScan),
    section("Detected Risk Signals", signalLines),
    section("EWS Score History", ewsHistory),
    section("Financial Statements", financialLines),
    section("Loans", loanLines),
    section("Related Companies", relatedLines),
    section("Counterparties", counterpartyLines),
    section("News", newsLines),
    section("Related External Events", externalEventLines),
    section("Risk Signal Timeline", timelineLines),
    section("RM Notes", rmNoteLines),
    section("Cross-Institution Exposure", exposureLines),
    section("Investigations", investigationLines),
    section("Human-in-the-loop Reviews", humanReviewLines),
    section("Actions", actionLines),
  ].join("\n\n");
}
