import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createActionAction } from "@/app/investigation/[companyId]/actions";
import type { ActionType } from "@/lib/types";

const ACTION_TYPES: { type: ActionType; label: string }[] = [
  { type: "SITE_VISIT_REQUEST", label: "현장 확인 요청" },
  { type: "CREDIT_REVIEW_REQUEST", label: "심사부 검토 요청" },
  { type: "WATCHLIST_REGISTER", label: "Watch List 등록" },
  { type: "INVESTIGATION_CREATE", label: "Investigation 생성" },
];

// A single form, four submit buttons. Each button binds its own companyId +
// ActionType into the shared server action via .bind() (the documented
// Next.js pattern for passing extra args to a Server Action) — a plain
// name="type" attribute on the button would be overwritten by Next's own
// progressive-enhancement encoding on formAction, so binding is required
// here, not optional. The server action redirects back with `?created=`
// on success, which the page reads to show a confirmation banner.
export function ActionButtons({ companyId }: { companyId: string }) {
  return (
    <form className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="action-note">비고 (선택)</Label>
        <Textarea id="action-note" name="note" placeholder="Action 관련 참고사항" />
      </div>
      <div className="flex flex-wrap gap-2">
        {ACTION_TYPES.map((a) => (
          <Button
            key={a.type}
            type="submit"
            formAction={createActionAction.bind(null, companyId, a.type)}
            variant="outline"
          >
            {a.label}
          </Button>
        ))}
      </div>
    </form>
  );
}
