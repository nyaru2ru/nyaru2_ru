export function formatJapaneseDate(value: string): string {
    const match = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/.exec(value.trim());
    if (!match) return value;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12) return value;

    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day < 1 || day > lastDay) return value;

    return `${year}年${month}月${day}日`;
}
