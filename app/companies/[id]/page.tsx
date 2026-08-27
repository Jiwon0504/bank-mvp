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

const SENTIMENT_STYLE: Record<string, string> = {
  NEGATIVE: "text-red-700",
  POSITIVE: "text-slate-600",
  NEUTRAL: "text-muted-foreground",
};

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  const isHiddenRiskCase = company.tags?.includes("HIDDEN_RISK_CASE") ?? false;
  const hasDelinquency = loans.some((l) => l.delinquencyDays > 0);

  return (
    <div className="flex flex-col gap-6">
      {isHiddenRiskCase && <DemoProgress active={[2, 3, 4]} />}

      {/* Header: identification + credit status, condensed to a single record block */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{company.name}</h1>
              <span className="text-sm text-muted-foreground">{company.bizRegNo}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {company.industry} · {company.region} · 대표 {company.ceoName} · 설립{" "}
              {company.establishedYear} · 임직원 {company.employeeCount}명 · 신용등급{" "}
              {company.creditRating}
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
                {hasDelinquency ? "연체 발생" : "Performing (연체 없음)"}
              </span>
              {company.isWatchListed && (
                <Badge variant="outline" className="font-normal">
                  Watch List
                </Badge>
              )}
              {isHiddenRiskCase && (
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  Hidden Risk Case
                </Badge>
              )}
            </div>
          </div>
          <Button
            nativeButton={false}
            render={<Link href={`/investigation/${company.id}`}>왜 위험한가? →</Link>}
          />
        </div>

        {isHiddenRiskCase && !hasDelinquency && (
          <p id="normal-status" className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <StepBadge n={3} />
            현재 정상 여신으로 관리되고 있으나, 아래 연결된 재무·거래·관계사 데이터에서 주의가
            필요한 신호가 함께 나타납니다.
          </p>
        )}
      </div>

      {/* Exposure & Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Exposure &amp; 대출</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">당행 Exposure</p>
              <p className="text-lg font-semibold tabular-nums">{formatEok(exposure)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">대출 건수</p>
              <p className="text-lg font-semibold tabular-nums">{loans.length}건</p>
            </div>
            <div>
              <p className="text-muted-foreground">수입 의존도</p>
              <p className="text-lg font-semibold tabular-nums">{company.importDependencyPct}%</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품</TableHead>
                <TableHead className="text-right">원금</TableHead>
                <TableHead className="text-right">잔액</TableHead>
                <TableHead className="text-right">금리</TableHead>
                <TableHead>담보</TableHead>
                <TableHead className="text-right">연체</TableHead>
                <TableHead>만기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.productType}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEok(l.principal)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEok(l.outstandingBalance)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{l.interestRate}%</TableCell>
                  <TableCell>{l.collateralType}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {l.delinquencyDays > 0 ? (
                      <span className="font-medium text-red-700">{l.delinquencyDays}일</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
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
            EWS Risk Score
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
                전기 대비 {formatSignedScore(latestSignal.scoreDelta)}점 · {latestSignal.signalDate}
              </span>
            )}
          </div>
          {ewsSignals.length > 0 ? (
            <EwsScoreChart signals={ewsSignals} />
          ) : (
            <p className="text-sm text-muted-foreground">EWS 이력 데이터 없음</p>
          )}
        </CardContent>
      </Card>

      {/* 재무제표 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">재무제표 (매출 / 매출채권 / 영업현금흐름)</CardTitle>
        </CardHeader>
        <CardContent>
          {financials.length > 0 ? (
            <>
              <FinancialsChart statements={financials} />
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>기간</TableHead>
                    <TableHead className="text-right">매출</TableHead>
                    <TableHead className="text-right">매출채권</TableHead>
                    <TableHead className="text-right">영업현금흐름</TableHead>
                    <TableHead className="text-right">순이익</TableHead>
                    <TableHead className="text-right">부채비율</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financials.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        {f.fiscalYear} Q{f.quarter}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatEok(f.revenue)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatEok(f.accountsReceivable)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          f.operatingCashFlow < 0 && "font-medium text-red-700"
                        )}
                      >
                        {formatEok(f.operatingCashFlow)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatEok(f.netProfit)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {f.debtRatio.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">재무 데이터 없음</p>
          )}
          {isHiddenRiskCase && (
            <NextStepLink
              href={`/investigation/${company.id}#timeline`}
              label="Risk Timeline에서 이 신호들이 어떻게 이어지는지 확인하기"
            />
          )}
        </CardContent>
      </Card>

      {/* 거래 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">거래 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>일자</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>분류</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">{t.date}</TableCell>
                    <TableCell
                      className={cn(
                        "font-medium",
                        t.type === "INFLOW" ? "text-slate-700" : "text-muted-foreground"
                      )}
                    >
                      {t.type === "INFLOW" ? "입금" : "출금"}
                    </TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        t.type === "INFLOW" ? "text-slate-900" : "text-muted-foreground"
                      )}
                    >
                      {t.type === "INFLOW" ? "+" : "-"}
                      {formatEok(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">거래 데이터 없음</p>
          )}
        </CardContent>
      </Card>

      {/* 관계사 + 주요 거래처 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">관계사 / 주요 거래처</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">관계사</p>
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
              <p className="text-sm text-muted-foreground">관계사 데이터 없음</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">주요 거래처</p>
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
                      {c.role === "CUSTOMER" ? "고객" : "공급처"} · 집중도{" "}
                      <span
                        className={cn(
                          "tabular-nums",
                          c.concentrationPct >= 35 && "font-semibold text-amber-700"
                        )}
                      >
                        {c.concentrationPct}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">거래처 데이터 없음</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 외부 시그널 + 담당자 메모 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">외부 시그널 (News)</CardTitle>
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
              <p className="text-sm text-muted-foreground">관련 뉴스 없음</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">담당자 메모</CardTitle>
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
                      {n.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs font-normal">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">담당자 메모 없음</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
