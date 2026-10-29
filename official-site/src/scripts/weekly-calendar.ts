import {
    calendarEvents,
    excludedRecurringDates,
    weeklyRecurringEvents,
} from "../data/calendar";
import {
    dateKey,
    eventsOn,
    findNextEvent,
    startOfWeek,
    weekdayLabels,
    type CalendarData,
    type DisplayEvent,
} from "../lib/calendar";

const source: CalendarData = {
    dated: calendarEvents,
    weekly: weeklyRecurringEvents,
    excluded: excludedRecurringDates,
};

const englishWeekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function heart(className: string): SVGSVGElement {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add(className);
    const shape = document.createElementNS(ns, "path");
    shape.setAttribute("d", "M50 92 C42 85 7 62 7 33 C7 9 36 4 50 24 C64 4 93 9 93 33 C93 62 58 85 50 92 Z");
    svg.append(shape);
    return svg;
}

type SafeEventLink = {
    href: string;
    external: boolean;
};

function validateEventUrl(input: string | undefined): SafeEventLink | null {
    if (!input) return null;

    if (/[\u0000-\u001F\u007F\\]/.test(input)) return null;

    const raw = input.trim();
    if (!raw) return null;

    const looksInternal = raw.startsWith("/") && !raw.startsWith("//");
    const looksHttps = /^https:\/\//i.test(raw);
    if (!looksInternal && !looksHttps) return null;

    try {
        const origin = window.location.origin;
        const parsed = new URL(raw, origin);
        if (parsed.username || parsed.password) return null;

        if (looksInternal) {
            if (parsed.origin !== origin) return null;
            return {
                href: parsed.pathname + parsed.search + parsed.hash,
                external: false,
            };
        }

        if (parsed.protocol !== "https:") return null;
        return { href: parsed.href, external: parsed.origin !== origin };
    } catch {
        return null;
    }
}

function eventTitle(event: DisplayEvent, className: string): HTMLElement {
    const safeLink = validateEventUrl(event.url);
    const element = document.createElement(safeLink ? "a" : "span");
    element.className = className;
    element.textContent = event.title;
    if (safeLink && element instanceof HTMLAnchorElement) {
        element.href = safeLink.href;
        if (safeLink.external) {
            element.target = "_blank";
            element.rel = "noopener noreferrer";
            element.referrerPolicy = "no-referrer";
        }
    }
    return element;
}

function makeEmptyEvent(): HTMLLIElement {
    const item = document.createElement("li");
    item.className = "weekview__event weekview__event--empty";
    const time = document.createElement("span");
    time.className = "weekview__event-time";
    time.setAttribute("aria-hidden", "true");
    const details = document.createElement("div");
    details.className = "weekview__event-main";
    const message = document.createElement("p");
    message.className = "weekview__no-event";
    message.textContent = "予定はまだありません";
    details.append(message);
    item.append(time, details);
    return item;
}

function makeEvent(event: DisplayEvent): HTMLLIElement {
    const item = document.createElement("li");
    item.className = "weekview__event";
    const status = event.status ?? "scheduled";
    if (event.kind === "rest") item.classList.add("weekview__event--rest");
    if (status === "cancelled") item.classList.add("weekview__event--cancelled");

    const time = document.createElement("span");
    time.className = "weekview__event-time";
    time.textContent = event.time ?? "--:--";


    const details = document.createElement("div");
    details.className = "weekview__event-main";
    const titleRow = document.createElement("div");
    titleRow.className = "weekview__event-title-row";
    titleRow.append(eventTitle(event, "weekview__event-title"));

    if (status !== "scheduled") {
        const pill = document.createElement("span");
        pill.className = `weekview__status weekview__status--${status}`;
        pill.textContent = { live: "● 配信中", ended: "終了", cancelled: "中止" }[status];
        titleRow.append(pill);
    }
    details.append(titleRow);
    const subline = [event.platform, event.description].filter(Boolean).join(" · ");
    if (subline) {
        const description = document.createElement("p");
        description.className = "weekview__event-detail";
        description.textContent = subline;
        details.append(description);
    }
    item.append(time, details);
    return item;
}

function makeDay(date: Date, todayKey: string): HTMLElement {
    const key = dateKey(date);
    const weekday = date.getDay();
    const row = document.createElement("article");
    row.className = "weekview__row";
    if (key === todayKey) row.classList.add("weekview__row--today");
    if (weekday === 0) row.classList.add("weekview__row--sunday");
    if (weekday === 6) row.classList.add("weekview__row--saturday");

    const badge = document.createElement("time");
    badge.className = "weekview__date-badge";
    badge.dateTime = key;
    badge.setAttribute("aria-label", `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdayLabels[weekday]}曜日`);
    if (key === todayKey) badge.setAttribute("aria-current", "date");

    const main = document.createElement("span");
    main.className = "weekview__date-main";
    main.append(heart("weekview__date-main-heart"));
    const number = document.createElement("span");
    number.className = "weekview__date-number";
    number.textContent = String(date.getDate());
    main.append(number);

    const little = document.createElement("span");
    little.className = "weekview__date-little";
    little.append(heart("weekview__date-small-heart"));
    const label = document.createElement("span");
    label.className = "weekview__date-weekday";
    label.textContent = englishWeekdays[weekday];
    little.append(label);
    badge.append(main, little);

    const content = document.createElement("div");
    content.className = "weekview__row-content";
    const events = eventsOn(date, source);
    if (events.length) {
        const list = document.createElement("ul");
        list.className = "weekview__event-list";
        events.forEach((event) => list.append(makeEvent(event)));
        content.append(list);
    } else {
        const list = document.createElement("ul");
        list.className = "weekview__event-list";
        list.append(makeEmptyEvent());
        content.append(list);
    }
    if (key === todayKey) {
        const today = document.createElement("span");
        today.className = "weekview__today-label";
        today.textContent = "TODAY";
        row.append(today);
    }
    row.append(badge, content);
    return row;
}

function renderUpcoming(target: HTMLElement, now: Date): void {
    const upcoming = findNextEvent(now, source);
    if (!upcoming) {
        const empty = document.createElement("p");
        empty.className = "weekview__upcoming-empty";
        empty.textContent = "次の予定はまだ登録されていません。";
        target.replaceChildren(empty);
        return;
    }
    const { date, event } = upcoming;
    const dateText = document.createElement("time");
    dateText.className = "weekview__upcoming-date";
    dateText.dateTime = dateKey(date);
    dateText.textContent = `${date.getFullYear() !== now.getFullYear() ? `${date.getFullYear()}年` : ""}${date.getMonth() + 1}月${date.getDate()}日（${weekdayLabels[date.getDay()]}）`;
    const fragment = document.createDocumentFragment();
    fragment.append(dateText, eventTitle(event, "weekview__upcoming-title"));
    if (event.time) {
        const time = document.createElement("p");
        time.className = "weekview__upcoming-time";
        time.textContent = event.time;
        fragment.append(time);
    }
    if (event.description) {
        const description = document.createElement("p");
        description.className = "weekview__upcoming-description";
        description.textContent = event.description;
        fragment.append(description);
    }
    if (event.status === "live") {
        const badge = document.createElement("span");
        badge.className = "weekview__status weekview__status--live";
        badge.textContent = "● 配信中";
        fragment.append(badge);
    }
    target.replaceChildren(fragment);
}

function japanNow(): Date {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());
    const part = (name: string) => Number(parts.find((item) => item.type === name)?.value ?? "0");
    return new Date(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"));
}

function setup(calendar: HTMLElement): void {
    const period = calendar.querySelector<HTMLElement>("[data-calendar-period]");
    const rows = calendar.querySelector<HTMLElement>("[data-calendar-rows]");
    const notice = calendar.querySelector<HTMLElement>("[data-calendar-notice]");
    const nextEvent = calendar.querySelector<HTMLElement>("[data-calendar-upcoming]");
    const previous = calendar.querySelector<HTMLButtonElement>("[data-calendar-prev]");
    const next = calendar.querySelector<HTMLButtonElement>("[data-calendar-next]");
    const current = calendar.querySelector<HTMLButtonElement>("[data-calendar-now]");
    if (!period || !rows || !notice || !nextEvent || !previous || !next || !current) return;

    let offset = 0;
    const render = (): void => {
        const today = japanNow();
        const start = startOfWeek(today, offset);
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 12);
        const endLabel = start.getFullYear() === end.getFullYear()
            ? `${end.getMonth() + 1}月${end.getDate()}日`
            : `${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`;
        period.textContent = `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 〜 ${endLabel}`;
        const fragment = document.createDocumentFragment();
        let total = 0;
        for (let day = 0; day < 7; day++) {
            const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + day, 12);
            total += eventsOn(date, source).length;
            fragment.append(makeDay(date, dateKey(today)));
        }
        rows.replaceChildren(fragment);
        notice.hidden = total > 0;
        current.disabled = offset === 0;
        renderUpcoming(nextEvent, today);
    };
    previous.addEventListener("click", () => { offset--; render(); });
    next.addEventListener("click", () => { offset++; render(); });
    current.addEventListener("click", () => { offset = 0; render(); });
    render();
}

document.querySelectorAll<HTMLElement>(".weekview").forEach(setup);
