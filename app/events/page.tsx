import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllExternalEvents, getCompaniesAffectedByEvent } from "@/lib/repository/eventRepository";
import { getServerLocale } from "@/lib/i18n/getLocale";
import { translations } from "@/lib/i18n/translations";

export default async function EventsPage() {
  const locale = await getServerLocale();
  const t = translations[locale];
  const events = getAllExternalEvents();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t.events.title}</h1>
        <p className="text-sm text-muted-foreground">{t.events.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {events.map((event) => {
          const affected = getCompaniesAffectedByEvent(event.id);
          return (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{event.title}</CardTitle>
                  <Badge variant="outline" className="font-normal">
                    {event.magnitude}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.eventDate} · {event.category}
                </p>
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
                <p className="text-sm font-medium tabular-nums">
                  {t.events.affectedCountPrefix}
                  {affected.length}
                  {t.events.affectedCountSuffix}
                </p>
                <Link href={`/events/${event.id}`} className="text-sm font-medium hover:underline">
                  {t.events.viewAffected}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
