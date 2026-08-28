import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitHumanReviewAction } from "@/app/investigation/[companyId]/actions";
import type { Dictionary } from "@/lib/i18n/translations";

type HumanReviewDict = Dictionary["investigation"]["humanReview"];

const DECISION_VALUES = ["NEEDS_VERIFICATION", "WATCHLIST", "MAINTAIN_NORMAL", "CREDIT_REVIEW"] as const;

// Plain <select> instead of the shadcn Select component: this form must
// submit via a native form action, and a native <select> guarantees correct
// FormData behavior without relying on the Select primitive's form wiring.
export function HumanReviewForm({
  companyId,
  investigationId,
  t,
}: {
  companyId: string;
  investigationId: string;
  t: HumanReviewDict;
}) {
  return (
    <form action={submitHumanReviewAction} className="space-y-3">
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="investigationId" value={investigationId} />

      <div className="space-y-1">
        <Label htmlFor="decision">{t.decisionLabel}</Label>
        <select
          id="decision"
          name="decision"
          required
          defaultValue=""
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            {t.decisionPlaceholder}
          </option>
          {DECISION_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.decisions[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="rationale">{t.rationaleLabel}</Label>
        <Textarea id="rationale" name="rationale" required placeholder={t.rationalePlaceholder} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="note">{t.evidenceLabel}</Label>
        <Textarea id="note" name="note" placeholder={t.evidencePlaceholder} />
      </div>

      <Button type="submit">{t.submit}</Button>
    </form>
  );
}
