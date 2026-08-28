import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  startInvestigationProgressAction,
  closeInvestigationAction,
} from "@/app/investigation/[companyId]/actions";
import type { Dictionary } from "@/lib/i18n/translations";
import type { HumanReview, Investigation, InvestigationFindingType } from "@/lib/types";

type WorkflowDict = Dictionary["investigation"]["workflow"];

const FINDING_TYPE_VALUES: InvestigationFindingType[] = [
  "CONFIRMED_NORMAL",
  "NEEDS_FURTHER_VERIFICATION",
  "POTENTIAL_IMPAIRMENT_RISK",
  "SUSPECTED_FRAUD",
  "EXTERNAL_EVENT_IMPACT",
];

// Mirrors HumanReviewForm's shape: a plain native <select>/<textarea> form
// posting straight to a Server Action, no client hooks. The lifecycle itself
// (OPEN -> IN_PROGRESS -> CLOSED) is enforced server-side by
// investigationRepository.updateInvestigationStatus — this component only
// renders whichever step is currently valid, it doesn't re-validate it.
export function InvestigationWorkflow({
  companyId,
  investigation,
  humanReviews,
  t,
  decisionLabels,
}: {
  companyId: string;
  investigation: Investigation | undefined;
  humanReviews: HumanReview[];
  t: WorkflowDict;
  decisionLabels: Record<string, string>;
}) {
  if (!investigation) {
    return <p className="text-sm text-muted-foreground">{t.noInvestigationYet}</p>;
  }

  if (investigation.status === "OPEN") {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t.statusLabel}</span>
          <Badge variant="outline">{investigation.status}</Badge>
        </span>
        <form action={startInvestigationProgressAction}>
          <input type="hidden" name="companyId" value={companyId} />
          <input type="hidden" name="investigationId" value={investigation.id} />
          <Button type="submit" variant="secondary" size="sm">
            {t.startButton}
          </Button>
        </form>
      </div>
    );
  }

  if (investigation.status === "IN_PROGRESS") {
    return (
      <div className="space-y-4">
        <span className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t.statusLabel}</span>
          <Badge variant="outline">{investigation.status}</Badge>
        </span>

        <div className="rounded-md border bg-muted/30 p-3">
          <p className="mb-2 text-sm font-semibold">{t.evidenceTitle}</p>
          {humanReviews.length > 0 ? (
            <ul className="space-y-1">
              {humanReviews.map((r) => (
                <li key={r.id} className="text-sm">
                  <Badge className="mr-2 font-normal">{decisionLabels[r.decision] ?? r.decision}</Badge>
                  {r.rationale}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t.evidenceEmpty}</p>
          )}
        </div>

        <form action={closeInvestigationAction} className="space-y-3 border-t pt-3">
          <p className="text-sm font-semibold">{t.closeSectionTitle}</p>
          <input type="hidden" name="companyId" value={companyId} />
          <input type="hidden" name="investigationId" value={investigation.id} />

          <div className="space-y-1">
            <Label htmlFor="findingType">{t.findingTypeLabel}</Label>
            <select
              id="findingType"
              name="findingType"
              required
              defaultValue=""
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>
                {t.findingTypePlaceholder}
              </option>
              {FINDING_TYPE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t.findingTypes[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="findings">{t.findingDetailLabel}</Label>
            <Textarea id="findings" name="findings" placeholder={t.findingDetailPlaceholder} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="finalJudgment">{t.finalJudgmentLabel}</Label>
            <Textarea
              id="finalJudgment"
              name="finalJudgment"
              required
              placeholder={t.finalJudgmentPlaceholder}
            />
          </div>

          <Button type="submit">{t.closeButton}</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t.statusLabel}</span>
        <Badge variant="outline">{investigation.status}</Badge>
      </span>
      <div className="rounded-md border bg-muted/30 p-3 text-sm">
        <p className="mb-1 font-semibold">{t.closedSummaryTitle}</p>
        <p>
          <Badge className="mr-2 font-normal">
            {investigation.findingType ? t.findingTypes[investigation.findingType] : "—"}
          </Badge>
        </p>
        {investigation.findings && <p className="mt-2">{investigation.findings}</p>}
        <p className="mt-2 font-medium">{investigation.finalJudgment}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t.closedByPrefix}
          {investigation.closedBy} · {investigation.closedDate}
        </p>
      </div>
    </div>
  );
}
