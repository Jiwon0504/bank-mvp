import type { Action, Investigation, HumanReview } from "@/lib/types";
import { seedActions } from "@/data/actions";
import { investigations as seedInvestigations } from "@/data/investigations";

// Runtime-mutable in-memory store for entities the demo creates during a
// session (Investigations, Actions, Human Reviews). Attached to globalThis
// so it survives Next.js dev Fast Refresh re-evaluating this module; it
// still resets on a full server restart. Replace with a real database when
// this stops being a demo.
type Store = {
  actions: Action[];
  investigations: Investigation[];
  humanReviews: HumanReview[];
};

const globalForStore = globalThis as unknown as { __riskStore?: Store };

export const store: Store =
  globalForStore.__riskStore ??
  (globalForStore.__riskStore = {
    actions: [...seedActions],
    investigations: [...seedInvestigations],
    humanReviews: [],
  });
