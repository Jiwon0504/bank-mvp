import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { DemoProgress, StepBadge } from "@/components/demo/DemoProgress";
import { getDashboardSummary } from "@/lib/repository/dashboardRepository";
import { getCompanyExposure } from "@/lib/repository/companyRepository";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { formatEok } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n/getLocale";
import { translations } from "@/lib/i18n/translations";

export default async function DashboardPage() {
  const locale = await getServerLocale();
  const t = translations[locale];
  const summary = getDashboardSummary();

  // Same "biggest EWS/connected gap first" priority used for the candidates
  // section above, applied to the full portfolio table too — this is the
  // "Risk 우선순위 Ranking" step of the scan flow, not just a top-N list.
  const rankedScans = [...summary.portfolioScan].sort(
    (a, b) => b.gapRank - a.gapRank || b.connectedScore - a.connectedScore || b.ewsScore - a.ewsScore
  );

  // Risk-first ordering: what needs attention today comes before general
  // portfolio size figures.
  const kpis = [
    {
      label: t.dashboard.kpi.priorityCandidates,
      value: `${summary.priorityCandidates.length}${t.dashboard.unitCompany}`,
      flagged: summary.priorityCandidates.length > 0,
    },
    {
      label: t.dashboard.kpi.highRisk,
      value: `${summary.highRiskBorrowers}${t.dashboard.unitCompany}`,
      flagged: summary.highRiskBorrowers > 0,
    },
    {
      label: t.dashboard.kpi.detectedSignals,
      value: `${summary.detectedSignalCount}${t.dashboard.unitSignal}`,
      flagged: summary.detectedSignalCount > 0,
    },
    {
      label: t.dashboard.kpi.investigations,
      value: `${summary.investigationsInProgress}${t.dashboard.unitCase}`,
      flagged: summary.investigationsInProgress > 0,
    },
    { label: t.dashboard.kpi.totalExposure, value: formatEok(summary.totalExposure, locale), flagged: false },
    {
      label: t.dashboard.kpi.totalBorrowers,
      value: `${summary.totalBorrowers}${t.dashboard.unitCompany}`,
      flagged: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DemoProgress active={[1]} steps={t.demoSteps} />

      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t.dashboard.title}</h1>
        <p className="text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className={cn(
              "gap-2 rounded-md border-l-4 py-3",
              kpi.flagged ? "border-l-amber-500" : "border-l-border"
            )}
          >
            <CardHeader className="px-4">
              <CardTitle className="text-xs font-normal text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-xl font-semibold tabular-nums">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Portfolio-wide Hidden-Risk scan: computed from every borrower's real
          data via lib/riskScan.ts — nothing here is pre-tagged. */}
      <Card id="hidden-risk-case" className="rounded-md border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <StepBadge n={1} />
            <Badge variant="outline" className="font-normal">
              {t.dashboard.priorityTag}
            </Badge>
            <span className="text-muted-foreground">{t.dashboard.priorityCandidatesTitle}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">{t.dashboard.priorityCandidatesSubtitle}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.priorityCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.dashboard.noPriorityCandidates}</p>
          ) : (
            summary.priorityCandidates.map((scan) => (
              <div key={scan.company.id} className="rounded-md border bg-muted/30 p-4">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-base font-semibold">{scan.company.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {scan.company.industry} · {scan.company.region}
                    </p>
                  </div>
                  <Link
                    href={`/companies/${scan.company.id}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-foreground/20 bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
                  >
                    {t.common.detail}
                  </Link>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{t.dashboard.ewsLabel}</span>
                    <RiskLevelBadge level={scan.ewsLevel} />
                    <span className="tabular-nums text-muted-foreground">({scan.ewsScore})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {t.dashboard.connectedLabel}
                    </span>
                    <RiskLevelBadge level={scan.connectedLevel} />
                    <span className="tabular-nums text-muted-foreground">
                      ({scan.connectedScore})
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.dashboard.signalsFoundLabel}: {scan.signals.length}
                    {t.dashboard.unitSignal}
                  </span>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {scan.signals.map((s, i) => (
                    <li key={i}>{s.explanation}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t.dashboard.industryChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart data={summary.industryDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t.dashboard.regionChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart data={summary.regionDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.dashboard.borrowerTable}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">{t.dashboard.columns.company}</TableHead>
                <TableHead>{t.dashboard.columns.industry}</TableHead>
                <TableHead>{t.dashboard.columns.region}</TableHead>
                <TableHead>{t.dashboard.columns.ewsRisk}</TableHead>
                <TableHead className="text-right">{t.dashboard.columns.score}</TableHead>
                <TableHead>{t.dashboard.columns.connectedRisk}</TableHead>
                <TableHead className="text-right">{t.dashboard.columns.connectedScore}</TableHead>
                <TableHead className="text-right">{t.dashboard.columns.exposure}</TableHead>
                <TableHead className="pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedScans.map((scan) => {
                const exposure = getCompanyExposure(scan.company.id);
                return (
                  <TableRow key={scan.company.id}>
                    <TableCell className="pl-4 font-medium">
                      {scan.company.name}
                      {scan.isPriorityCandidate && (
                        <Badge variant="outline" className="ml-2 font-normal text-muted-foreground">
                          {t.dashboard.priorityTag}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{scan.company.industry}</TableCell>
                    <TableCell className="text-muted-foreground">{scan.company.region}</TableCell>
                    <TableCell>
                      <RiskLevelBadge level={scan.ewsLevel} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{scan.ewsScore}</TableCell>
                    <TableCell>
                      <RiskLevelBadge level={scan.connectedLevel} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{scan.connectedScore}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatEok(exposure, locale)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <Link
                        href={`/companies/${scan.company.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {t.common.detail}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
