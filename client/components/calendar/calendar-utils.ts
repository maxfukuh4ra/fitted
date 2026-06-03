import type { CalendarDayCell } from "@/types/calendar";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  return next;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getCalendarCells(year: number, month: number): CalendarDayCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const cells: CalendarDayCell[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day });
  }

  return cells;
}
