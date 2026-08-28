import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createActionAction } from "@/app/investigation/[companyId]/actions";
import type { ActionType } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/translations";

type ActionDict = Dictionary["investigation"]["action"];

const ACTION_TYPES: ActionType[] = [
  "SITE_VISIT_REQUEST",
  "CREDIT_REVIEW_REQUEST",
  "WATCHLIST_REGISTER",
  "INVESTIGATION_CREATE",
];

// A single form, four submit buttons. Each button binds its own companyId +
// ActionType into the shared server action via .bind() (the documented
// Next.js pattern for passing extra args to a Server Action) — a plain
// name="type" attribute on the button would be overwritten by Next's own
// progressive-enhancement encoding on formAction, so binding is required
// here, not optional. The server action redirects back with `?created=`
// on success, which the page reads to show a confirmation banner.
export function ActionButtons({ companyId, t }: { companyId: string; t: ActionDict }) {
  return (
    <form className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="action-note">{t.noteLabel}</Label>
        <Textarea id="action-note" name="note" placeholder={t.notePlaceholder} />
      </div>
      <div className="flex flex-wrap gap-2">
        {ACTION_TYPES.map((type) => (
          <Button
            key={type}
            type="submit"
            formAction={createActionAction.bind(null, companyId, type)}
            variant="outline"
          >
            {t.types[type]}
          </Button>
        ))}
      </div>
    </form>
  );
}
