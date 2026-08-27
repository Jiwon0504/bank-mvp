import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitHumanReviewAction } from "@/app/investigation/[companyId]/actions";

const DECISION_OPTIONS: { value: string; label: string }[] = [
  { value: "NEEDS_VERIFICATION", label: "확인 필요" },
  { value: "WATCHLIST", label: "Watch List 등록" },
  { value: "MAINTAIN_NORMAL", label: "정상 유지" },
  { value: "CREDIT_REVIEW", label: "심사부 검토" },
];

// Plain <select> instead of the shadcn Select component: this form must
// submit via a native form action, and a native <select> guarantees correct
// FormData behavior without relying on the Select primitive's form wiring.
export function HumanReviewForm({
  companyId,
  investigationId,
}: {
  companyId: string;
  investigationId: string;
}) {
  return (
    <form action={submitHumanReviewAction} className="space-y-3">
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="investigationId" value={investigationId} />

      <div className="space-y-1">
        <Label htmlFor="decision">담당자 판단</Label>
        <select
          id="decision"
          name="decision"
          required
          defaultValue=""
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            판단을 선택하세요
          </option>
          {DECISION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="rationale">판단 근거</Label>
        <Textarea
          id="rationale"
          name="rationale"
          required
          placeholder="예: 최근 대규모 신규 수주가 확인되어 현재 Risk를 Watch 상태로 판단"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="note">Evidence / 비고</Label>
        <Textarea id="note" name="note" placeholder="근거 자료, 참고사항 등" />
      </div>

      <Button type="submit">제출</Button>
    </form>
  );
}
