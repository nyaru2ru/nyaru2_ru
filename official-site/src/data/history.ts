import historyContent from "../content/history.json";
import { pageText } from "./pages";
import { readDateKey } from "../lib/calendar";

export type HistoryEntry = { date: string; title: string };

type HistoryRecord = Partial<HistoryEntry> & { published?: boolean };

const cmsEntries: HistoryEntry[] = (historyContent.entries as HistoryRecord[])
  .filter((record): record is HistoryRecord & Required<HistoryEntry> => record.published !== false &&
    typeof record.date === "string" && readDateKey(record.date) !== null &&
    typeof record.title === "string" && record.title.trim().length > 0)
  .map((record) => ({ date: readDateKey(record.date)!, title: record.title.trim() }))
  .sort((a, b) => b.date.localeCompare(a.date));

function fromText(text: string): HistoryEntry[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const result: HistoryEntry[] = [];
  const dateLine = /^(?:\d{4}[.\/-]\d{1,2}(?:[.\/-]\d{1,2})?|\d{4}年\d{1,2}月(?:\d{1,2}日)?)$/;
  for (const line of lines) {
    if (dateLine.test(line)) {
      result.push({ date: line, title: "" });
    } else if (result.length) {
      const last = result[result.length - 1];
      last.title = last.title ? `${last.title}\n${line}` : line;
    } else {
      result.push({ date: "", title: line });
    }
  }
  return result.filter((entry) => entry.title);
}

export const historyEntries: HistoryEntry[] = historyContent.entries.length
  ? cmsEntries
  : fromText(pageText.about.history);
