"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createInvestigation, updateInvestigationStatus } from "@/lib/repository/investigationRepository";
import { createHumanReview } from "@/lib/repository/humanReviewRepository";
import { createAction, updateActionStatus } from "@/lib/repository/actionRepository";
import { DEMO_RM_NAME } from "@/lib/constants";
import type {
  ActionStatus,
  ActionType,
  HiddenRiskReviewDecision,
  InvestigationFindingType,
} from "@/lib/types";

export async function startInvestigationAction(formData: FormData) {
  const companyId = formData.get("companyId") as string;
  const reason = (formData.get("reason") as string) || "담당자 요청에 의한 Investigation 개설";
  createInvestigation({ companyId, createdBy: DEMO_RM_NAME, reason });
  revalidatePath(`/investigation/${companyId}`);
}

export async function submitHumanReviewAction(formData: FormData) {
  const companyId = formData.get("companyId") as string;
  const investigationId = formData.get("investigationId") as string;
  const decision = formData.get("decision") as HiddenRiskReviewDecision;
  const rationale = formData.get("rationale") as string;
  const note = (formData.get("note") as string) || undefined;

  createHumanReview({
    investigationId,
    companyId,
    authorName: DEMO_RM_NAME,
    decision,
    rationale,
    note,
  });
  revalidatePath(`/investigation/${companyId}`);
}

// companyId/type are bound per-button via .bind() (see ActionButtons) rather
// than read from FormData — a plain name="type" on the <button> gets
// clobbered by Next's own progressive-enhancement encoding on formAction,
// so FormData.get("type") is not reliable here.
//
// This deliberately does NOT use useActionState: combining it with a
// .bind()-per-button pattern on this Next.js/Turbopack canary version was
// found to hang the entire dev server on submit (verified by hand — the
// hung request blocked unrelated requests too, not just its own). A plain
// bound server action + redirect-with-query-param is the same mechanism
// already proven to work reliably (Investigation creation, Human Review
// submission use it too), so the "Action 생성됨" confirmation is rendered
// server-side from `?created=` instead of client-side hook state.
export async function createActionAction(
  companyId: string,
  type: ActionType,
  formData: FormData
) {
  const note = (formData.get("note") as string) || undefined;

  createAction({ companyId, type, createdBy: DEMO_RM_NAME, note });
  revalidatePath(`/investigation/${companyId}`);
  revalidatePath(`/companies/${companyId}`);
  redirect(`/investigation/${companyId}?created=${type}#action`);
}

// OPEN -> IN_PROGRESS. No data entry needed for this step, just the status
// bump — investigationRepository.updateInvestigationStatus rejects any
// transition that isn't the allowed next step in the lifecycle.
export async function startInvestigationProgressAction(formData: FormData) {
  const companyId = formData.get("companyId") as string;
  const investigationId = formData.get("investigationId") as string;

  updateInvestigationStatus({ investigationId, status: "IN_PROGRESS" });
  revalidatePath(`/investigation/${companyId}`);
  redirect(`/investigation/${companyId}?investigationStatus=IN_PROGRESS#action`);
}

// IN_PROGRESS -> CLOSED. Finding type + final judgment are required by the
// <select required> / <textarea required> on the form; updateInvestigationStatus
// re-checks both server-side and simply won't apply the transition if
// either is missing (defensive backstop, not a separate error UI — same
// validation philosophy as the existing Human-in-the-loop form).
export async function closeInvestigationAction(formData: FormData) {
  const companyId = formData.get("companyId") as string;
  const investigationId = formData.get("investigationId") as string;
  const findingType = formData.get("findingType") as InvestigationFindingType;
  const findings = (formData.get("findings") as string) || undefined;
  const finalJudgment = formData.get("finalJudgment") as string;

  updateInvestigationStatus({
    investigationId,
    status: "CLOSED",
    findingType,
    findings,
    finalJudgment,
    closedBy: DEMO_RM_NAME,
  });
  revalidatePath(`/investigation/${companyId}`);
  redirect(`/investigation/${companyId}?investigationStatus=CLOSED#action`);
}

// PENDING -> IN_PROGRESS -> DONE, one step at a time. companyId/actionId/
// status are bound per-button via .bind() (see ActionButtons/ActionStatusControl),
// the same pattern createActionAction already uses above for the same
// reason (a plain name/value on the button gets clobbered by Next's own
// formAction encoding).
export async function updateActionStatusAction(
  companyId: string,
  actionId: string,
  status: ActionStatus,
  _formData: FormData
) {
  updateActionStatus(actionId, status);
  revalidatePath(`/investigation/${companyId}`);
  revalidatePath(`/companies/${companyId}`);
  redirect(`/investigation/${companyId}?actionUpdated=${status}#action`);
}
