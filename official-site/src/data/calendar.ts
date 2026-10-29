import { readDateKey } from "../lib/calendar";
import { getSiteOrPublicUrl } from "./links";

export type EventStatus = "scheduled" | "live" | "ended" | "cancelled";

export type CalendarEvent = {
    date: string;
    title: string;
    time?: string;
    description?: string;
    url?: string;
    kind?: "event" | "rest";
    platform?: string;
    status?: EventStatus;
    replacesWeekly?: boolean;
};

export type WeeklyRecurringEvent = Omit<CalendarEvent, "date" | "replacesWeekly"> & {
    weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

type ScheduleRecord = {
    published?: boolean;
    repeat?: "once" | "weekly";
    date?: string;
    weekday?: number;
    title?: string;
    time?: string;
    description?: string;
    url?: string;
    kind?: "event" | "rest";
    platform?: string;
    status?: EventStatus;
    replacesWeekly?: boolean;
};

const files = import.meta.glob<{ default: ScheduleRecord }>(
    "../content/schedule/*.json",
    { eager: true },
);

const records = Object.values(files)
    .map((file) => file.default)
    .filter((record) => record && record.published === true && typeof record.title === "string" && record.title.trim());

const eventData = (record: ScheduleRecord) => ({
    title: record.title!.trim(),
    time: typeof record.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(record.time) ? record.time : undefined,
    description: typeof record.description === "string" ? record.description.trim() : undefined,
    url: getSiteOrPublicUrl(record.url ?? null) ?? undefined,
    kind: record.kind === "rest" ? "rest" as const : "event" as const,
    platform: typeof record.platform === "string" ? record.platform.trim() : undefined,
    status: ["scheduled", "live", "ended", "cancelled"].includes(record.status ?? "")
        ? record.status
        : "scheduled" as const,
});

export const calendarEvents: CalendarEvent[] = records
    .filter((record) => record.repeat !== "weekly" && readDateKey(record.date) !== null)
    .map((record) => ({
        ...eventData(record),
        date: readDateKey(record.date)!,
        replacesWeekly: record.replacesWeekly === true,
    }));

export const weeklyRecurringEvents: WeeklyRecurringEvent[] = records
    .filter((record) => record.repeat === "weekly" && Number.isInteger(record.weekday) && record.weekday! >= 0 && record.weekday! <= 6)
    .map((record) => ({
        ...eventData(record),
        weekday: record.weekday as WeeklyRecurringEvent["weekday"],
    }));

export const excludedRecurringDates: string[] = [
    ...new Set(calendarEvents.filter((event) => event.replacesWeekly).map((event) => event.date)),
];
