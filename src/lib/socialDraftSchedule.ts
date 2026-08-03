// X投稿下書きの自動生成時刻(JST "HH:MM")を管理画面から変更できるようにする設定。
// 専用テーブルを増やさず、既存のSiteText(汎用キー・バリュー)に載せる
import { prisma } from "@/lib/prisma";

const SCHEDULE_KEY = "admin.socialDraftScheduleTime";
const DEFAULT_SCHEDULE_TIME = "08:00";
const HHMM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidScheduleTime(value: string): boolean {
  return HHMM_PATTERN.test(value);
}

export async function getSocialDraftScheduleTime(): Promise<string> {
  const row = await prisma.siteText.findUnique({ where: { key: SCHEDULE_KEY } });
  return row?.value && isValidScheduleTime(row.value) ? row.value : DEFAULT_SCHEDULE_TIME;
}

export async function setSocialDraftScheduleTime(value: string): Promise<void> {
  if (!isValidScheduleTime(value)) {
    throw new Error("時刻はHH:MM形式(24時間表記)で指定してください");
  }
  await prisma.siteText.upsert({
    where: { key: SCHEDULE_KEY },
    create: { key: SCHEDULE_KEY, value },
    update: { value },
  });
}
