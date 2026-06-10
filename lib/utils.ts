import { priorityWeight, type Task } from "@/types/po-os";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function sortTasks(a: Task, b: Task): number {
  const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
  if (priorityDiff) return priorityDiff;
  const dateA = a.due_date || "9999-12-31";
  const dateB = b.due_date || "9999-12-31";
  return dateA.localeCompare(dateB);
}
