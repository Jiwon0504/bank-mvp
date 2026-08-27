import { rmNotes } from "@/data/rmNotes";
import type { RmNote } from "@/lib/types";

export function getRmNotesByCompany(companyId: string): RmNote[] {
  return rmNotes
    .filter((n) => n.companyId === companyId)
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));
}

export function getRmNoteById(noteId: string): RmNote | undefined {
  return rmNotes.find((n) => n.id === noteId);
}
