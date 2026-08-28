import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { EwsScoreChart } from "@/components/company360/EwsScoreChart";
import { FinancialsChart } from "@/components/company360/FinancialsChart";
import { DemoProgress, StepBadge, NextStepLink } from "@/components/demo/DemoProgress";
import {
  getCompanyById,
  getLoansByCompany,
  getEwsSignalsByCompany,
  getFinancialsByCompany,
  getCompanyExposure,
} from "@/lib/repository/companyRepository";
import { getTransactionsByCompany } from "@/lib/repository/transactionRepository";
import {
  getRelatedCompanies,
  getCounterpartiesByCompany,
} from "@/lib/repository/relationshipRepository";
import { getNewsByCompany } from "@/lib/repository/eventRepository";
import { getRmNotesByCompany } from "@/lib/repository/noteRepository";
import { formatEok, formatSignedScore } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n/getLocale";
import { translations } from "@/lib/i18n/translations";
import { scanCompany } from "@/lib/riskScan";

const SENTIMENT_STYLE: Record<string, string> = {
  NEGATIVE: "text-red-700 dark:text-red-400",
  POSITIVE: "text-slate-600 dark:text-slate-400",
  NEUTRAL: "text-muted-foreground",
};

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getServerLocale();
  const t = translations[locale];
  const company = getCompanyById(id);
  if (!company) notFound();

  const loans = getLoansByCompany(id);
  const ewsSignals = getEwsSignalsByCompany(id);
  const financials = getFinancialsByCompany(id);
  const transactions = getTransactionsByCompany(id);
  const relations = getRelatedCompanies(id);
  const counterparties = getCounterpartiesByCompany(id);
  const news = getNewsByCompany(id);
  const notes = getRmNotesByCompany(id);
  const exposure = getCompanyExposure(id);
  const latestSignal = ewsSignals[ewsSignals.length - 1];
  // Computed, not tagged — the same uniform scan used on the Dashboard
  // (see lib/riskScan.ts) decides whether this borrower gets the guided
  // "Hidden Risk" walkthrough treatment.
  const isHiddenRiskCase = scanCompany(company).isPriorityCandidate;
  const hasDelinquency = loans.some((l) => l.delinquencyDays > 0);

  return (
    <div className="flex flex-col gap-6">
      {isHiddenRiskCase && <DemoProgress active={[2, 3, 4]} steps={t.demoSteps} />}

      {/* Header: identification + credit status, condensed to a single record block */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{company.name}</h1>
              <span className="text-sm text-muted-foreground">{company.bizRegNo}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {company.industry} · {company.region} · {t.company.ceoPrefix} {company.ceoName} ·{" "}
              {t.company.establishedPrefix} {company.establishedYear} · {company.employeeCount}
              {t.company.employeesSuffix} · {t.company.creditRatingPrefix} {company.creditRating}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <RiskLevelBadge level={company.currentEwsRiskLevel} />
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    hasDelinquency ? "bg-red-600" : "bg-slate-400"
                  )}
                />
                {hasDelinquency ? t.company.delinquentStatus : t.company.performing}
              </span>
              {company.isWatchListed && (
                <Badge variant="outline" className="font-normal">
                  {t.company.watchList}
                </Badge>
              )}
              {isHiddenRiskCase && (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {t.company.hiddenRiskCase}
                </Badge>
              )}
            </div>
          </div>
          <Button
            nativeButton={false}
            render={<Link href={`/investigation/${company.id}`}>{t.company.whyRisky}</Link>}
          />
        </div>

        {isHiddenRiskCase && !hasDelinquency && (
          <p id="normal-status" className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <StepBadge n={3} />
            {t.company.normalStatusNote}
          </p>
        )}
      </div>

      {/* Exposure & Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.company.exposureLoans.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t.company.exposureLoans.exposureLabel}</p>
              <p className="text-lg font-semibold tabular-nums">{formatEok(exposure, locale)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.company.exposureLoans.loanCountLabel}</p>
              <p className="text-lg font-semibold tabular-nums">
                {loans.length}
                {t.company.exposureLoans.loanCountUnit}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.company.exposureLoans.importDependency}</p>
              <p className="text-lg font-semibold tabular-nums">{company.importDependencyPct}%</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.company.exposureLoans.columns.product}</TableHead>
                <TableHead className="text-right">{t.company.exposureLoans.columns.principal}</TableHead>
                <TableHead className="text-right">{t.company.exposureLoans.columns.balance}</TableHead>
                <TableHead className="text-right">{t.company.exposureLoans.columns.rate}</TableHead>
                <TableHead>{t.company.exposureLoans.columns.collateral}</TableHead>
                <TableHead className="text-right">{t.company.exposureLoans.columns.delinquency}</TableHead>
                <TableHead>{t.company.exposureLoans.columns.maturity}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.productType}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEok(l.principal, locale)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEok(l.outstandingBalance, locale)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{l.interestRate}%</TableCell>
                  <TableCell>{l.collateralType}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {l.delinquencyDays > 0 ? (
                      <span className="font-medium text-red-700 dark:text-red-400">
                        {l.delinquencyDays}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{t.common.none}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.maturityDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* EWS Risk Score */}
      <Card id="risk-signal">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            {isHiddenRiskCase && <StepBadge n={4} />}
            {t.company.ews.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-semibold tabular-nums">
              {latestSignal?.riskScore ?? company.currentEwsRiskScore}
            </p>
            <RiskLevelBadge level={latestSignal?.riskLevel ?? company.currentEwsRiskLevel} />
            {latestSignal && (
              <span className="text-xs text-muted-foreground">
                {t.company.ews.deltaPrefix} {formatSignedScore(latestSignal.scoreDelta)}
                {t.common.scoreUnit} · {latestSignal.signalDate}
              </span>
            )}
          </div>
          {ewsSignals.length > 0 ? (
            <EwsScoreChart signals={ewsSignals} />
          ) : (
            <p className="text-sm text-muted-foreground">{t.company.ews.noHistory}</p>
          )}
        </CardContent>
      </Card>

      {/* 재무제표 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.company.financials.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {financials.length > 0 ? (
            <>
              <FinancialsChart statements={financials} />
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.company.financials.columns.period}</TableHead>
                    <TableHead className="text-right">{t.company.financials.columns.revenue}</TableHead>
                    <TableHead className="text-right">
                      {t.company.financials.columns.receivables}
                    </TableHead>
                    <TableHead className="text-right">{t.company.financials.columns.cashFlow}</TableHead>
                    <TableHead className="text-right">{t.company.financials.columns.netProfit}</TableHead>
                    <TableHead className="text-right">{t.company.financials.columns.debtRatio}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financials.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        {f.fiscalYear} Q{f.quarter}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatEok(f.revenue, locale)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatEok(f.accountsReceivable, locale)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          f.operatingCashFlow < 0 && "font-medium text-red-700 dark:text-red-400"
                        )}
                      >
                        {formatEok(f.operatingCashFlow, locale)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatEok(f.netProfit, locale)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {f.debtRatio.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t.company.financials.noData}</p>
          )}
          {isHiddenRiskCase && (
            <NextStepLink
              href={`/investigation/${company.id}#timeline`}
              label={t.company.financials.nextTimelineLabel}
            />
          )}
        </CardContent>
      </Card>

      {/* 거래 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.company.transactions.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.company.transactions.columns.date}</TableHead>
                  <TableHead>{t.company.transactions.columns.type}</TableHead>
                  <TableHead>{t.company.transactions.columns.category}</TableHead>
                  <TableHead className="text-right">{t.company.transactions.columns.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                    <TableCell
                      className={cn(
                        "font-medium",
                        tx.type === "INFLOW"
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-muted-foreground"
                      )}
                    >
                      {tx.type === "INFLOW" ? t.company.transactions.inflow : t.company.transactions.outflow}
                    </TableCell>
                    <TableCell>{tx.category}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        tx.type === "INFLOW"
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-muted-foreground"
                      )}
                    >
                      {tx.type === "INFLOW" ? "+" : "-"}
                      {formatEok(tx.amount, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">{t.company.transactions.noData}</p>
          )}
        </CardContent>
      </Card>

      {/* 관계사 + 주요 거래처 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.company.relations.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t.company.relations.relatedCompaniesLabel}
            </p>
            {relations.length > 0 ? (
              <ul className="space-y-1.5">
                {relations.map((r) => {
                  const otherId = r.companyId === id ? r.relatedCompanyId : r.companyId;
                  const other = getCompanyById(otherId);
                  return (
                    <li key={r.id} className="flex items-center justify-between text-sm">
                      <Link href={`/companies/${otherId}`} className="font-medium hover:underline">
                        {other?.name ?? otherId}
                      </Link>
                      <span className="text-xs text-muted-foreground">{r.relationType}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t.company.relations.noRelated}</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t.company.relations.counterpartiesLabel}
            </p>
            {counterparties.length > 0 ? (
              <ul className="space-y-1.5">
                {counterparties.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    {c.counterpartyCompanyId ? (
                      <Link
                        href={`/companies/${c.counterpartyCompanyId}`}
                        className="font-medium hover:underline"
                      >
                        {c.counterpartyName}
                      </Link>
                    ) : (
                      <span className="font-medium">{c.counterpartyName}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {c.role === "CUSTOMER" ? t.common.customer : t.common.supplier} ·{" "}
                      {t.company.relations.concentration}{" "}
                      <span
                        className={cn(
                          "tabular-nums",
                          c.concentrationPct >= 35 && "font-semibold text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {c.concentrationPct}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t.company.relations.noCounterparty}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 외부 시그널 + 담당자 메모 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t.company.externalSignals.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {news.length > 0 ? (
              <ul className="space-y-3">
                {news.map((n) => (
                  <li key={n.id} className="border-b pb-3 text-sm last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold tracking-wide",
                          SENTIMENT_STYLE[n.sentiment]
                        )}
                      >
                        {n.sentiment}
                      </span>
                      <span className="text-xs text-muted-foreground">{n.publishedDate}</span>
                    </div>
                    <p className="mt-1 font-medium">{n.headline}</p>
                    <p className="text-xs text-muted-foreground">{n.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t.company.externalSignals.noNews}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t.company.rmNotes.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length > 0 ? (
              <ul className="space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="border-b pb-3 text-sm last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{n.authorName}</span>
                      <span>{n.createdDate}</span>
                    </div>
                    <p>{n.note}</p>
                    <div className="mt-1 flex gap-1">
                      {n.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t.company.rmNotes.noNotes}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
