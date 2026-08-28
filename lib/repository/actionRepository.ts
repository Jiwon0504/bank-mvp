import { store } from "./store";
import { DEMO_TODAY } from "@/lib/constants";
import type { Action, ActionStatus, ActionType } from "@/lib/types";

export function getAllActions(): Action[] {
  return store.actions;
}

export function getActionsByCompany(companyId: string): Action[] {
  return store.actions
    .filter((a) => a.companyId === companyId)
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));
}

export function createAction(input: {
  companyId: string;
  type: ActionType;
  createdBy: string;
  note?: string;
}): Action {
  const action: Action = {
    id: `ACT-${String(store.actions.length + 1).padStart(4, "0")}`,
    companyId: input.companyId,
    type: input.type,
    status: "PENDING",
    createdDate: DEMO_TODAY,
    createdBy: input.createdBy,
    note: input.note,
  };
  store.actions.push(action);
  return action;
}

// PENDING -> IN_PROGRESS -> DONE, one step at a time — same linear,
// no-skipping shape as the Investigation status lifecycle above.
const ALLOWED_NEXT_ACTION_STATUS: Record<ActionStatus, ActionStatus[]> = {
  PENDING: ["IN_PROGRESS"],
  IN_PROGRESS: ["DONE"],
  DONE: [],
};

export function updateActionStatus(actionId: string, status: ActionStatus): Action | undefined {
  const action = store.actions.find((a) => a.id === actionId);
  if (!action) return undefined;
  if (!ALLOWED_NEXT_ACTION_STATUS[action.status].includes(status)) return action;
  action.status = status;
  return action;
}
