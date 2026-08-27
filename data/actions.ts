import type { Action } from "@/lib/types";

// Seed actions are intentionally empty — Actions are created by RMs at
// runtime via the Investigation view (see lib/repository/actionRepository.ts).
export const seedActions: Action[] = [];
