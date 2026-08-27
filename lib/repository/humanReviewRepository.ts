import { store } from "./store";
import { DEMO_TODAY } from "@/lib/constants";
import type { HumanReview, HiddenRiskReviewDecision } from "@/lib/types";

export function getHumanReviewsByInvestigation(investigationId: string): HumanReview[] {
  return store.humanReviews
    .filter((h) => h.investigationId === investigationId)
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));
}

export function getHumanReviewsByCompany(companyId: string): HumanReview[] {
  return store.humanReviews.filter((h) => h.companyId === companyId);
}

export function createHumanReview(input: {
  investigationId: string;
  companyId: string;
  authorName: string;
  decision: HiddenRiskReviewDecision;
  rationale: string;
  note?: string;
}): HumanReview {
  const review: HumanReview = {
    id: `HR-${String(store.humanReviews.length + 1).padStart(4, "0")}`,
    investigationId: input.investigationId,
    companyId: input.companyId,
    authorName: input.authorName,
    createdDate: DEMO_TODAY,
    decision: input.decision,
    rationale: input.rationale,
    note: input.note,
  };
  store.humanReviews.push(review);
  return review;
}
