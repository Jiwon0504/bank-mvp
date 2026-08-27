import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllExternalEvents, getCompaniesAffectedByEvent } from "@/lib/repository/eventRepository";

export default function EventsPage() {
  const events = getAllExternalEvents();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">External Event Impact</h1>
        <p className="text-sm text-muted-foreground">
          외부 이벤트를 선택하면 영향을 받을 가능성이 있는 산업/차주를 보여줍니다 (예: 환율 상승 →
          수입 의존 산업 → 해당 차주 → 예상 Risk Signal)
        </p>
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
                  영향 가능 차주: {affected.length}개사
                </p>
                <Link href={`/events/${event.id}`} className="text-sm font-medium hover:underline">
                  영향받는 차주 보기 →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
