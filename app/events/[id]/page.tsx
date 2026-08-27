import Link from "next/link";
import { notFound } from "next/navigation";
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
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import {
  getExternalEventById,
  getCompaniesAffectedByEvent,
} from "@/lib/repository/eventRepository";
import { getCompanyExposure } from "@/lib/repository/companyRepository";
import { formatEok } from "@/lib/format";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getExternalEventById(id);
  if (!event) notFound();

  const affected = getCompaniesAffectedByEvent(id)
    .map((c) => ({ ...c, exposure: getCompanyExposure(c.id) }))
    .sort((a, b) => b.currentEwsRiskScore - a.currentEwsRiskScore);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/events" className="hover:underline">
            ← External Event Impact
          </Link>
        </p>
        <h1 className="text-xl font-semibold tracking-tight">{event.title}</h1>
        <p className="text-sm text-muted-foreground">
          {event.eventDate} · {event.category} · {event.magnitude}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">이벤트 설명</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{event.description}</p>
          <div className="flex flex-wrap gap-1">
            {event.affectedIndustries.map((ind) => (
              <Badge key={ind} variant="outline" className="text-xs font-normal">
                {ind}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">영향 가능 차주 ({affected.length}개사)</CardTitle>
          <p className="text-xs text-muted-foreground">
            이벤트 영향 산업에 속한 차주 목록입니다. 실제 영향 여부는 개별 확인이 필요합니다.
          </p>
        </CardHeader>
        <CardContent>
          {affected.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>기업명</TableHead>
                  <TableHead>산업</TableHead>
                  <TableHead className="text-right">수입 의존도</TableHead>
                  <TableHead>EWS Risk</TableHead>
                  <TableHead className="text-right">Exposure</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affected.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.importDependencyPct}%
                    </TableCell>
                    <TableCell>
                      <RiskLevelBadge level={c.currentEwsRiskLevel} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatEok(c.exposure)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/companies/${c.id}`} className="text-sm font-medium hover:underline">
                        상세보기 →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">영향받는 차주가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
