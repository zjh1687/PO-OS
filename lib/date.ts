export function toISODate(date: Date): string {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function displayDate(value: string | null | undefined): string {
  if (!value) return "없음";
  return value.slice(0, 10).replace(/-/g, ".");
}

export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  return dueDate < toISODate(new Date());
}

export function isDueWithin(dueDate: string | null, completed: boolean, days: number): boolean {
  if (!dueDate || completed) return false;
  const today = new Date(`${toISODate(new Date())}T00:00:00`);
  const due = new Date(`${dueDate}T00:00:00`);
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  return diff >= 0 && diff <= days;
}

export function inCurrentMonth(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}
