// 日付処理はすべて日本時間(JST)基準で行う
const JST_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 今日の日付を "YYYY-MM-DD" (JST) で返す */
export function todayJst(): string {
  return JST_FORMATTER.format(new Date());
}

/** 今日の始まり(JST 00:00)をUTC Dateオブジェクトで返す */
export function startOfTodayJst(): Date {
  return new Date(`${todayJst()}T00:00:00+09:00`);
}

/** 指定日の前日を "YYYY-MM-DD" で返す */
export function previousDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  d.setDate(d.getDate() - 1);
  return JST_FORMATTER.format(d);
}

/** 任意のDateをJSTの "YYYY-MM-DD" 文字列に変換する */
export function toJstDateString(date: Date): string {
  return JST_FORMATTER.format(date);
}
