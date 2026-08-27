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
import { getAllCompanies, getCompanyExposure } from "@/lib/repository/companyRepository";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { formatEok } from "@/lib/format";
import { SCENARIO_COMPANY_IDS } from "@/data/companies";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const summary = getDashboardSummary();
  const companies = getAllCompanies()
    .map((c) => ({ ...c, exposure: getCompanyExposure(c.id) }))
    .sort((a, b) => b.currentEwsRiskScore - a.currentEwsRiskScore);

  // Risk-first ordering: what needs attention today comes before general
  // portfolio size figures.
  const kpis = [
    {
      label: "High Risk 차주 수",
      value: `${summary.highRiskBorrowers}개사`,
      flagged: summary.highRiskBorrowers > 0,
    },
    {
      label: "신규 Risk Signal (14일)",
      value: `${summary.newRiskSignals}건`,
      flagged: summary.newRiskSignals > 0,
    },
    {
      label: "Investigation 진행 건수",
      value: `${summary.investigationsInProgress}건`,
      flagged: summary.investigationsInProgress > 0,
    },
    { label: "전체 여신 규모", value: formatEok(summary.totalExposure), flagged: false },
    { label: "전체 차주 수", value: `${summary.totalBorrowers}개사`, flagged: false },
  ];

  const featuredHiddenRisk = summary.hiddenRiskCases.find(
    (c) => c.id === SCENARIO_COMPANY_IDS.seramTech
  );
  const connectedHiddenRisk = summary.hiddenRiskCases.filter(
    (c) => c.id !== SCENARIO_COMPANY_IDS.seramTech
  );

  return (
    <div className="flex flex-col gap-6">
      <DemoProgress active={[1]} />

      <div>
        <h1 className="text-xl font-semibold tracking-tight">Credit Risk Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          EWS 결과와 내/외부 데이터를 연결한 여신 리스크 현황 · synthetic mock data
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
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

      {featuredHiddenRisk && (
        <Card id="hidden-risk-case" className="rounded-md border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <StepBadge n={1} />
              <Badge variant="outline" className="font-normal">
                Hidden Risk Case
              </Badge>
              <span className="text-muted-foreground">
                정상 여신이지만 연결된 위험 신호를 통해 추가 조사가 필요한 차주
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col items-start justify-between gap-3 rounded-md border bg-muted/30 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-base font-semibold">{featuredHiddenRisk.name}</p>
                <p className="text-sm text-muted-foreground">
                  {featuredHiddenRisk.industry} · EWS {featuredHiddenRisk.currentEwsRiskLevel} (
                  {featuredHiddenRisk.currentEwsRiskScore}점) · 연체 없음 · 이자 정상 납부
                </p>
              </div>
              <Link
                href={`/companies/${featuredHiddenRisk.id}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-foreground/20 bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
              >
                상세 조사 시작 →
              </Link>
            </div>
            {connectedHiddenRisk.length > 0 && (
              <p className="text-xs text-muted-foreground">
                관계사 · 주요 거래처도 함께 연결되어 있습니다:{" "}
                {connectedHiddenRisk.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ", "}
                    <Link href={`/companies/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </span>
                ))}{" "}
                — 연결 관계는 Investigation의 Risk Propagation Graph에서 확인할 수 있습니다.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">산업별 Risk 분포 (Exposure 기준)</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart data={summary.industryDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">지역별 Risk 분포 (Exposure 기준)</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart data={summary.regionDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">차주 목록 (Risk Score 높은 순)</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">기업명</TableHead>
                <TableHead>산업</TableHead>
                <TableHead>지역</TableHead>
                <TableHead>EWS Risk</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Exposure</TableHead>
                <TableHead className="pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-4 font-medium">
                    {c.name}
                    {c.tags?.includes("HIDDEN_RISK_CASE") && (
                      <Badge variant="outline" className="ml-2 font-normal text-muted-foreground">
                        Hidden Risk
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                  <TableCell className="text-muted-foreground">{c.region}</TableCell>
                  <TableCell>
                    <RiskLevelBadge level={c.currentEwsRiskLevel} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.currentEwsRiskScore}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEok(c.exposure)}</TableCell>
                  <TableCell className="pr-4">
                    <Link href={`/companies/${c.id}`} className="text-sm font-medium hover:underline">
                      상세보기 →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
