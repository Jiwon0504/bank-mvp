import { transactions } from "@/data/transactions";
import type { Transaction } from "@/lib/types";

export function getTransactionsByCompany(companyId: string): Transaction[] {
  return transactions
    .filter((t) => t.companyId === companyId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getTransactionsByIds(ids: string[]): Transaction[] {
  const idSet = new Set(ids);
  return transactions
    .filter((t) => idSet.has(t.id))
    .sort((a, b) => a.date.localeCompare(b.date));
}
