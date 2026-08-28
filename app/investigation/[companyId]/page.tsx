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
import { InvestigationWorkflow } from "@/components/investigation/InvestigationWorkflow";
import { AiAssistant } from "@/components/investigation/AiAssistant";
import { ExternalEventCard } from "@/components/investigation/ExternalEventCard";
import {
  RiskTimelineInteractive,
  type TimelineItem,
} from "@/components/investigation/RiskTimelineInteractive";
import { DemoProgress, StepBadge, NextStepLink } from "@/components/demo/DemoProgress";
import { startInvestigationAction, updateActionStatusAction } from "./actions";
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
import { getServerLocale } from "@/lib/i18n/getLocale";
import { translations } from "@/lib/i18n/translations";
import { scanCompany } from "@/lib/riskScan";
import type { ActionStatus } from "@/lib/types";

// PENDING -> IN_PROGRESS -> DONE, one step at a time; DONE has no next step.
const NEXT_ACTION_STATUS: Record<ActionStatus, ActionStatus | undefined> = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: undefined,
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
  searchParams: Promise<{ created?: string; investigationStatus?: string; actionUpdated?: string }>;
}) {
  const { companyId } = await params;
  const { created, investigationStatus, actionUpdated } = await searchParams;
  const locale = await getServerLocale();
  const t = translations[locale];
  const company = getCompanyById(companyId);
  if (!company) notFound();

  // Computed, not tagged — same uniform portfolio scan as the Dashboard.
  const isHiddenRiskCase = scanCompany(company).isPriorityCandidate;

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
      {isHiddenRiskCase && <DemoProgress active={[5, 6, 7, 8, 9]} steps={t.demoSteps} />}

      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/companies/${company.id}`} className="hover:underline">
              {t.investigation.breadcrumbBack} {company.name}
            </Link>
          </p>
          <h1 className="text-xl font-semibold tracking-tight">{t.investigation.title}</h1>
          <p className="text-sm text-muted-foreground">{t.investigation.subtitleQuote}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t.investigation.modelRisk}</span>
          <RiskLevelBadge level={company.currentEwsRiskLevel} />
        </div>
      </div>

      <Card id="timeline">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            {isHiddenRiskCase && <StepBadge n={5} />}
            {t.investigation.timeline.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineItems.length > 0 ? (
            <RiskTimelineInteractive items={timelineItems} t={t.investigation.timeline} />
          ) : (
            <p className="text-sm text-muted-foreground">{t.investigation.timeline.noData}</p>
          )}
          {isHiddenRiskCase && (
            <NextStepLink href="#graph" label={t.investigation.timeline.nextLinkLabel} />
          )}
        </CardContent>
      </Card>

      <Card id="graph">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            {isHiddenRiskCase && <StepBadge n={6} />}
            {t.investigation.graph.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiskGraphSimple companyId={companyId} t={t.investigation.graph} common={t.common} />
          {isHiddenRiskCase && (
            <NextStepLink href="#external-event" label={t.investigation.graph.nextLinkLabel} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.investigation.crossExposure.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {company.name}
            {relatedIds.length > 0 ? (locale === "ko" ? " 및 관계사 그룹" : " and related-company group") : ""}{" "}
            {t.investigation.crossExposure.subtitle}
          </p>
        </CardHeader>
        <CardContent>
          {groupExposures.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.investigation.crossExposure.columns.company}</TableHead>
                    <TableHead>{t.investigation.crossExposure.columns.institution}</TableHead>
                    <TableHead className="text-right">
                      {t.investigation.crossExposure.columns.exposure}
                    </TableHead>
                    <TableHead>{t.investigation.crossExposure.columns.asOf}</TableHead>
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
                          {formatEok(e.exposureAmount, locale)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{e.asOfDate}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p className="mt-3 flex items-center justify-between text-sm font-medium">
                <span>{t.investigation.crossExposure.totalLabel}</span>
                <span className="tabular-nums">{formatEok(totalGroupExposure, locale)}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t.investigation.crossExposure.noData}</p>
          )}
        </CardContent>
      </Card>

      <Card id="external-event">
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            {isHiddenRiskCase && <StepBadge n={7} />}
            {t.investigation.externalEvent.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExternalEventCard companyId={companyId} t={t.investigation.externalEvent} common={t.common} />
          {isHiddenRiskCase && (
            <NextStepLink href="#ai-summary" label={t.investigation.externalEvent.nextLinkLabel} />
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card id="ai-summary" className="bg-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-sm font-medium">
                {isHiddenRiskCase && <StepBadge n={8} />}
                {t.investigation.summary.title}
              </CardTitle>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                {t.investigation.summary.referenceTag}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{t.investigation.summary.disclaimer}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-foreground/20 bg-background p-3">
              <p className="mb-1 text-sm font-semibold">
                {t.investigation.summary.priorityQuestionsTitle}
              </p>
              <ul className="list-decimal space-y-1 pl-5 text-sm">
                {summary.priorityQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
            <SummarySection title={t.investigation.summary.sectionTitles[0]} items={summary.currentStatus} />
            <SummarySection title={t.investigation.summary.sectionTitles[1]} items={summary.riskSignalsFound} />
            <SummarySection title={t.investigation.summary.sectionTitles[2]} items={summary.connectingEvidence} />
            <SummarySection title={t.investigation.summary.sectionTitles[3]} items={summary.unverifiedItems} />
            <SummarySection
              title={t.investigation.summary.sectionTitles[4]}
              items={summary.whyFurtherReviewNeeded}
            />
            <SummarySection title={t.investigation.summary.sectionTitles[5]} items={summary.suggestedActions} />
            {isHiddenRiskCase && (
              <NextStepLink href="#action" label={t.investigation.summary.nextLinkLabel} />
            )}
          </CardContent>
        </Card>
      )}

      <Card id="ai-assistant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{t.investigation.assistant.title}</CardTitle>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {t.investigation.assistant.referenceTag}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{t.investigation.assistant.disclaimer}</p>
        </CardHeader>
        <CardContent>
          <AiAssistant companyId={companyId} locale={locale} t={t.investigation.assistant} />
        </CardContent>
      </Card>

      <div id="action" className="flex items-center gap-2 border-b pb-2">
        {isHiddenRiskCase && <StepBadge n={9} />}
        <h2 className="text-base font-semibold tracking-tight">{t.investigation.actionHeading.title}</h2>
        <span className="text-xs text-muted-foreground">{t.investigation.actionHeading.subtitle}</span>
      </div>

      <Card className="border-foreground/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.investigation.workflow.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {investigationStatus && (
            <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t.investigation.workflow.updatedBannerPrefix}
              {investigationStatus}
            </p>
          )}
          <InvestigationWorkflow
            companyId={companyId}
            investigation={latestInvestigation}
            humanReviews={humanReviews}
            t={t.investigation.workflow}
            decisionLabels={t.investigation.humanReview.decisions}
          />
        </CardContent>
      </Card>

      <Card className="border-foreground/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.investigation.humanReview.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{t.investigation.humanReview.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {humanReviews.length > 0 && (
            <ul className="space-y-2">
              {humanReviews.map((r) => (
                <li key={r.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge className="font-normal">
                      {t.investigation.humanReview.decisions[r.decision] ?? r.decision}
                    </Badge>
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
            <HumanReviewForm
              companyId={companyId}
              investigationId={latestInvestigation.id}
              t={t.investigation.humanReview}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t.investigation.humanReview.noInvestigationYet}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-foreground/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.investigation.action.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{t.investigation.action.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {created && (
            <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t.investigation.action.createdBannerPrefix}
              {t.investigation.action.types[created as keyof typeof t.investigation.action.types] ?? created}
            </p>
          )}
          {actionUpdated && (
            <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t.investigation.action.updatedBannerPrefix}
              {actionUpdated}
            </p>
          )}
          {actions.length > 0 ? (
            <ul className="space-y-2">
              {actions.map((a) => {
                const nextStatus = NEXT_ACTION_STATUS[a.status];
                const nextLabel =
                  a.status === "PENDING" ? t.investigation.action.statusStart : t.investigation.action.statusComplete;
                return (
                  <li key={a.id} className="rounded-md border p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t.investigation.action.types[a.type] ?? a.type}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{a.status}</Badge>
                        {nextStatus && (
                          <form action={updateActionStatusAction.bind(null, companyId, a.id, nextStatus)}>
                            <Button type="submit" variant="ghost" size="sm">
                              {nextLabel}
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.createdDate} · {a.createdBy}
                    </p>
                    {a.note && <p className="mt-1">{a.note}</p>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t.investigation.action.noActions}</p>
          )}
          <div className="border-t pt-3">
            <ActionButtons companyId={companyId} t={t.investigation.action} />
          </div>
        </CardContent>
      </Card>

      <details className="rounded-md border">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground">
          {t.investigation.manage.summary}
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
            <p className="text-sm text-muted-foreground">{t.investigation.manage.noInvestigations}</p>
          )}

          <form action={startInvestigationAction} className="space-y-2 border-t pt-3">
            <input type="hidden" name="companyId" value={companyId} />
            <input
              type="hidden"
              name="reason"
              value="담당자 검토 결과 연결 리스크 검증을 위한 Investigation 개설"
            />
            <Button type="submit" variant="secondary" size="sm">
              {t.investigation.manage.newInvestigation}
            </Button>
          </form>
        </div>
      </details>
    </div>
  );
}
