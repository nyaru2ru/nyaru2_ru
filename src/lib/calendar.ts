import type { CalendarEvent, WeeklyRecurringEvent } from "../data/calendar";

export type DisplayEvent = Omit<CalendarEvent, "date">;

export type CalendarData = {
    dated: readonly CalendarEvent[];
    weekly: readonly WeeklyRecurringEvent[];
    excluded: readonly string[];
};

export const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function dateKey(date: Date): string {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

export function validDateKey(key: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
    const [year, month, day] = key.split("-").map(Number);
    const value = new Date(year, month - 1, day, 12);
    return value.getFullYear() === year &&
        value.getMonth() + 1 === month &&
        value.getDate() === day;
}

export function readDateKey(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const key = value.slice(0, 10);
    if (!validDateKey(key)) return null;
    if (value.length > 10 && !/^T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?$/.test(value.slice(10))) return null;
    return key;
}

export function startOfWeek(today: Date, offset = 0): Date {
    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - ((today.getDay() + 6) % 7) + offset * 7,
        12,
    );
}

function minutesForSort(value: string | undefined): number {
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value ?? "");
    return match ? Number(match[1]) * 60 + Number(match[2]) : 1441;
}

export function eventsOn(date: Date, source: CalendarData): DisplayEvent[] {
    const key = dateKey(date);
    const regular = source.excluded.includes(key)
        ? []
        : source.weekly.filter((event) => event.weekday === date.getDay());
    const dated = source.dated.filter((event) => event.date === key);

    return [...regular, ...dated].sort((a, b) =>
        minutesForSort(a.time) - minutesForSort(b.time),
    );
}

export function findNextEvent(
    now: Date,
    source: CalendarData,
    horizonDays = 365,
): { date: Date; event: DisplayEvent } | null {
    for (let offset = 0; offset <= horizonDays; offset++) {
        const date = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + offset,
            12,
        );

        for (const event of eventsOn(date, source)) {
            if (event.kind === "rest" || event.status === "cancelled" || event.status === "ended") continue;

            if (offset === 0) {
                const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(event.time ?? "");
                if (match) {
                    const start = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        Number(match[1]),
                        Number(match[2]),
                    );
                    if (start < now && event.status !== "live") continue;
                }
            }

            return { date, event };
        }
    }

    return null;
}
