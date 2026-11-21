import { calendarEvents } from "./calendar";
import { getSiteOrPublicUrl } from "./links";
import { readDateKey } from "../lib/calendar";

export type ActivityCategory = "news" | "achievement" | "event" | "schedule" | "collaboration";

export type ActivityItem = {
    category: ActivityCategory;
    date: string;
    title: string;
    description: string;
    url?: string;
};

type UpdateRecord = Partial<ActivityItem> & { published?: boolean };

const files = import.meta.glob<{ default: UpdateRecord }>(
    "../content/updates/*.json",
    { eager: true },
);

const categories: readonly ActivityCategory[] = ["news", "achievement", "event", "schedule", "collaboration"];

const updates: ActivityItem[] = Object.values(files)
    .map((file) => file.default)
    .filter((record): record is UpdateRecord & Required<Pick<ActivityItem, "category" | "date" | "title">> =>
        record?.published === true &&
        categories.includes(record.category as ActivityCategory) &&
        readDateKey(record.date) !== null &&
        typeof record.title === "string" && record.title.trim().length > 0,
    )
    .map((record) => ({
        category: record.category,
        date: readDateKey(record.date)!,
        title: record.title.trim(),
        description: typeof record.description === "string" ? record.description.trim() : "",
        url: getSiteOrPublicUrl(record.url ?? null) ?? undefined,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

const scheduled: ActivityItem[] = calendarEvents
    .filter((event) => event.kind !== "rest" && event.status !== "cancelled")
    .map((event) => ({
        category: "schedule",
        date: event.date,
        title: event.title,
        description: [event.time, event.platform, event.description].filter(Boolean).join(" · "),
        url: event.url,
    }));

export const activityItems: readonly ActivityItem[] = [...updates, ...scheduled]
    .sort((a, b) => b.date.localeCompare(a.date));
