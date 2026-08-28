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
import { getServerLocale } from "@/lib/i18n/getLocale";
import { translations } from "@/lib/i18n/translations";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getServerLocale();
  const t = translations[locale];
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
            {t.events.detail.back}
          </Link>
        </p>
        <h1 className="text-xl font-semibold tracking-tight">{event.title}</h1>
        <p className="text-sm text-muted-foreground">
          {event.eventDate} · {event.category} · {event.magnitude}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t.events.detail.descriptionTitle}</CardTitle>
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
          <CardTitle className="text-sm font-medium">
            {t.events.detail.affectedTitlePrefix}
            {affected.length}
            {t.events.detail.affectedTitleSuffix}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{t.events.detail.affectedSubtitle}</p>
        </CardHeader>
        <CardContent>
          {affected.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.events.detail.columns.company}</TableHead>
                  <TableHead>{t.events.detail.columns.industry}</TableHead>
                  <TableHead className="text-right">{t.events.detail.columns.importDependency}</TableHead>
                  <TableHead>{t.events.detail.columns.ewsRisk}</TableHead>
                  <TableHead className="text-right">{t.events.detail.columns.exposure}</TableHead>
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
                      {formatEok(c.exposure, locale)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/companies/${c.id}`} className="text-sm font-medium hover:underline">
                        {t.common.detail}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">{t.events.detail.noAffected}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
