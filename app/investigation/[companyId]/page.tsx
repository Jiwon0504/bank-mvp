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
import { RiskGraphSimple } from "@/components/risk-graph/RiskGraphSimple";
import { HumanReviewForm } from "@/components/investigation/HumanReviewForm";
import { ActionButtons } from "@/components/investigation/ActionButtons";
import { ExternalEventCard } from "@/components/investigation/ExternalEventCard";
import {
  RiskTimelineInteractive,
  type TimelineItem,
} from "@/components/investigation/RiskTimelineInteractive";
import { DemoProgress, StepBadge, NextStepLink } from "@/components/demo/DemoProgress";
import { startInvestigationAction } from "./actions";
import { getCompanyById, getCompanyExposure } from "@/lib/repository/companyRepository";
import { getRelatedCompanyIds } from "@/lib/repository/relationshipRepository";
import {
  getInvestigationsByCompany,
  getRiskTimeline,
  resolveTimelineEvidence,
} from "@/lib/repository/investigationRepository";
import { getHumanReviewsByInvestigation } from "@/lib/repository/humanReviewRepository";
import { getActionsByCompany } from "@/lib/repository/actionRepository";
import {
  getAllInstitutions,
  getInstitutionExposuresForGroup,
} from "@/lib/repository/exposureRepository";
import { generateInvestigationSummary } from "@/lib/riskAnalysis";
import { formatEok } from "@/lib/format";

const DECISION_LABELS: Record<string, string> = {
  NEEDS_VERIFICATION: "확인 필요",
  WATCHLIST: "Watch List 등록",
  MAINTAIN_NORMAL: "정상 유지",
  CREDIT_REVIEW: "심사부 검토",
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  SITE_VISIT_REQUEST: "현장 확인 요청",
  CREDIT_REVIEW_REQUEST: "심사부 검토 요청",
  WATCHLIST_REGISTER: "Watch List 등록",
  INVESTIGATION_CREATE: "Investigation 생성",
};

function SummarySection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold">{title}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function InvestigationPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { companyId } = await params;
  const { created } = await searchParams;
  const company = getCompanyById(companyId);
  if (!company) notFound();

  const isHiddenRiskCase = company.tags?.includes("HIDDEN_RISK_CASE") ?? false;

  const summary = generateInvestigationSummary(companyId);
  const timeline = getRiskTimeline(companyId);
  const timelineItems: TimelineItem[] = timeline.map((event) => {
    const evidence = resolveTimelineEvidence(event);
    return {
      event,
      evidence,
      relatedCompanyDetails: evidence.relatedCompanies.map((c) => ({
        company: c,
        exposure: getCompanyExposure(c.id),
      })),
    };
  });
  const investigations = getInvestigationsByCompany(companyId);
  const latestInvestigation = investigations[investigations.length - 1];
  const humanReviews = latestInvestigation
    ? getHumanReviewsByInvestigation(latestInvestigation.id)
    : [];
  const actions = getActionsByCompany(companyId);

  const relatedIds = getRelatedCompanyIds(companyId);
  const groupIds = [companyId, ...relatedIds];
  const institutions = getAllInstitutions();
  const groupExposures = getInstitutionExposuresForGroup(groupIds);
  const totalGroupExposure = groupExposures.reduce((s, e) => s + e.exposureAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      {isHiddenRiskCase && <DemoProgress active={[5, 6, 7, 8, 9]} />}

      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/companies/${company.id}`} className="hover:underline">
              ← {company.name}
            </Link>
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Risk Investigation</h1>
          <p className="text-sm text-muted-foreground">
            &quot;정상 여신인데 왜 위험한가?&quot; — 연결된 데이터 소스를 종합한 근거 기반 설명입니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Model Risk</span>
          <RiskLevelBadge level={company.currentEwsRiskLevel} />
        </div>
      </div>

      <Card id="timeline">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            {isHiddenRiskCase && <StepBadge n={5} />}
            Risk Signal Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineItems.length > 0 ? (
            <RiskTimelineInteractive items={timelineItems} />
          ) : (
            <p className="text-sm text-muted-foreground">
              이 차주에 대한 Risk Signal Timeline 데이터가 없습니다.
            </p>
          )}
          {isHiddenRiskCase && (
            <NextStepLink href="#graph" label="관계사·거래처 관계망 Graph 확인하기" />
          )}
        </CardContent>
      </Card>

      <Card id="graph">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            {isHiddenRiskCase && <StepBadge n={6} />}
            Risk Propagation Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiskGraphSimple companyId={companyId} />
          {isHiddenRiskCase && (
            <NextStepLink href="#external-event" label="이 관계망에 영향을 준 External Event 확인하기" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cross-Institution Exposure (참고)</CardTitle>
          <p className="text-xs text-muted-foreground">
            {company.name}
            {relatedIds.length > 0 ? " 및 관계사 그룹" : ""} 기준, 금융권 전체(가상) Exposure —
            실제 금융기관명이 아닌 데모용 명칭(금융기관 A/B/C) 사용
          </p>
        </CardHeader>
        <CardContent>
          {groupExposures.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>기업</TableHead>
                    <TableHead>금융기관</TableHead>
                    <TableHead className="text-right">Exposure</TableHead>
                    <TableHead>기준일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupExposures.map((e) => {
                    const inst = institutions.find((i) => i.id === e.institutionId);
                    const c = getCompanyById(e.companyId);
                    return (
                      <TableRow key={e.id}>
                        <TableCell>{c?.name ?? e.companyId}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {inst?.name ?? e.institutionId}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatEok(e.exposureAmount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{e.asOfDate}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p className="mt-3 flex items-center justify-between text-sm font-medium">
                <span>그룹 전체 금융권 Exposure 합계</span>
                <span className="tabular-nums">{formatEok(totalGroupExposure)}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Cross-institution exposure 데이터 없음.</p>
          )}
        </CardContent>
      </Card>

      <Card id="external-event">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            {isHiddenRiskCase && <StepBadge n={7} />}
            External Event 연결
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExternalEventCard companyId={companyId} />
          {isHiddenRiskCase && (
            <NextStepLink href="#ai-summary" label="AI Investigation Summary로 전체 근거 종합해서 보기" />
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card id="ai-summary" className="bg-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-sm font-medium">
                {isHiddenRiskCase && <StepBadge n={8} />}
                AI Investigation Summary
              </CardTitle>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                System-generated reference
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              규칙 기반 자동 요약이며(현재 버전은 AI 생성이 아닌 결정론적 로직, 향후 Claude API로
              교체 예정), 최종 판단은 아래 담당자 기록을 따릅니다. &quot;위험하다&quot;가 아니라
              확인이 필요한 신호만 표현합니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-foreground/20 bg-background p-3">
              <p className="mb-1 text-sm font-semibold">현재 가장 먼저 확인해야 할 사항</p>
              <ul className="list-decimal space-y-1 pl-5 text-sm">
                {summary.priorityQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
            <SummarySection title="1. 현재 상태" items={summary.currentStatus} />
            <SummarySection title="2. 발견된 위험 신호" items={summary.riskSignalsFound} />
            <SummarySection title="3. 서로 연결되는 근거" items={summary.connectingEvidence} />
            <SummarySection title="4. 아직 확인되지 않은 사항" items={summary.unverifiedItems} />
            <SummarySection title="5. 추가 조사가 필요한 이유" items={summary.whyFurtherReviewNeeded} />
            <SummarySection title="6. 담당자가 검토할 수 있는 Action" items={summary.suggestedActions} />
            {isHiddenRiskCase && (
              <NextStepLink href="#action" label="담당자 판단 기록하고 Action 선택하기" />
            )}
          </CardContent>
        </Card>
      )}

      <div id="action" className="flex items-center gap-2 border-b pb-2">
        {isHiddenRiskCase && <StepBadge n={9} />}
        <h2 className="text-base font-semibold tracking-tight">담당자의 판단과 Action</h2>
        <span className="text-xs text-muted-foreground">— 이 기록이 공식 결정입니다</span>
      </div>

      <Card className="border-foreground/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Human-in-the-loop 판단</CardTitle>
          <p className="text-xs text-muted-foreground">
            EWS Model Risk 및 위 참고 요약과 무관하게, 담당자의 독립적인 판단을 기록합니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {humanReviews.length > 0 && (
            <ul className="space-y-2">
              {humanReviews.map((r) => (
                <li key={r.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge className="font-normal">{DECISION_LABELS[r.decision] ?? r.decision}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {r.authorName} · {r.createdDate}
                    </span>
                  </div>
                  <p className="mt-1 font-medium">{r.rationale}</p>
                  {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                </li>
              ))}
            </ul>
          )}

          {latestInvestigation ? (
            <HumanReviewForm companyId={companyId} investigationId={latestInvestigation.id} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Human-in-the-loop 판단을 기록하려면 먼저 Investigation을 개설하세요 (아래).
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-foreground/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Action</CardTitle>
          <p className="text-xs text-muted-foreground">
            판단을 실행 가능한 조치로 연결합니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {created && (
            <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              ✓ Action 생성됨 — {ACTION_TYPE_LABELS[created] ?? created}
            </p>
          )}
          {actions.length > 0 ? (
            <ul className="space-y-2">
              {actions.map((a) => (
                <li key={a.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ACTION_TYPE_LABELS[a.type] ?? a.type}</span>
                    <Badge variant="outline">{a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {a.createdDate} · {a.createdBy}
                  </p>
                  {a.note && <p className="mt-1">{a.note}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">생성된 Action이 없습니다.</p>
          )}
          <div className="border-t pt-3">
            <ActionButtons companyId={companyId} />
          </div>
        </CardContent>
      </Card>

      <details className="rounded-md border">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground">
          Investigation 관리 (개설 이력 / 새 Investigation 개설)
        </summary>
        <div className="space-y-3 border-t px-4 py-3">
          {investigations.length > 0 ? (
            <ul className="space-y-2">
              {investigations.map((inv) => (
                <li key={inv.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{inv.id}</span>
                    <Badge variant="outline">{inv.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {inv.createdDate} · {inv.createdBy}
                  </p>
                  <p className="mt-1">{inv.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">개설된 Investigation이 없습니다.</p>
          )}

          <form action={startInvestigationAction} className="space-y-2 border-t pt-3">
            <input type="hidden" name="companyId" value={companyId} />
            <input
              type="hidden"
              name="reason"
              value="담당자 검토 결과 연결 리스크 검증을 위한 Investigation 개설"
            />
            <Button type="submit" variant="secondary" size="sm">
              + 새 Investigation 개설
            </Button>
          </form>
        </div>
      </details>
    </div>
  );
}
