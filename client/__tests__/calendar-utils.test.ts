// [GenAI Use] Prompt:
// "Write unit tests for calendar-utils.ts — formatMonthYear, formatDayLabel, addMonths,
// getDaysInMonth, getCalendarCells, isCurrentMonth, getDefaultSelectedDay."
// [GenAI Use] LLM Response Start
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addMonths,
  formatDayLabel,
  formatMonthYear,
  getCalendarCells,
  getDaysInMonth,
  getDefaultSelectedDay,
  isCurrentMonth,
} from "../components/calendar/calendar-utils";

describe("calendar-utils", () => {
  describe("formatMonthYear", () => {
    it("formats month name and year", () => {
      expect(formatMonthYear(new Date(2026, 5, 9))).toBe("June 2026");
    });
  });

  describe("formatDayLabel", () => {
    it("formats month name, day, and year", () => {
      expect(formatDayLabel(2026, 5, 9)).toBe("June 9, 2026");
    });
  });

  describe("addMonths", () => {
    it("advances to the first of the target month", () => {
      const result = addMonths(new Date(2026, 5, 15), 1);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(6);
      expect(result.getDate()).toBe(1);
    });

    it("wraps into the next year", () => {
      const result = addMonths(new Date(2026, 11, 20), 1);
      expect(result.getFullYear()).toBe(2027);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });
  });

  describe("getDaysInMonth", () => {
    it("returns 31 for January", () => {
      expect(getDaysInMonth(2026, 0)).toBe(31);
    });

    it("returns 29 for February in a leap year", () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it("returns 28 for February in a non-leap year", () => {
      expect(getDaysInMonth(2026, 1)).toBe(28);
    });
  });

  describe("getCalendarCells", () => {
    it("pads leading blanks and includes every day in the month", () => {
      const year = 2026;
      const month = 5;
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = getDaysInMonth(year, month);

      const cells = getCalendarCells(year, month);

      expect(cells.filter((cell) => cell.day === null)).toHaveLength(firstWeekday);
      expect(cells.filter((cell) => cell.day !== null)).toHaveLength(daysInMonth);
      expect(cells.at(-1)?.day).toBe(daysInMonth);
    });
  });

  describe("isCurrentMonth", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 9));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns true for the current month", () => {
      expect(isCurrentMonth(new Date(2026, 5, 1))).toBe(true);
    });

    it("returns false for another month", () => {
      expect(isCurrentMonth(new Date(2026, 4, 1))).toBe(false);
    });
  });

  describe("getDefaultSelectedDay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 9));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns today's day when viewing the current month", () => {
      expect(getDefaultSelectedDay(new Date(2026, 5, 1))).toBe(9);
    });

    it("returns null when viewing a different month", () => {
      expect(getDefaultSelectedDay(new Date(2026, 4, 1))).toBeNull();
    });
  });
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// Used fake timers for isCurrentMonth/getDefaultSelectedDay since they depend on today.
// Verified getCalendarCells against getDaysInMonth rather than hard-coding weekday counts.
