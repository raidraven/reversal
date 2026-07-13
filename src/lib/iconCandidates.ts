// アイコン画像候補の一覧取得(サーバー専用・fsを使用)
// public/images/icons/<slot>/ 以下に置かれた画像ファイルを、管理ページの選択肢として提示する
import fs from "fs";
import path from "path";

const ICONS_DIR = path.join(process.cwd(), "public", "images", "icons");
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|webp)$/i;

/** public/images/icons/<slot>/ 以下の画像を "/images/icons/<slot>/<file>" 形式で返す(無ければ空配列) */
export function listIconCandidates(slot: string): string[] {
  const dir = path.join(ICONS_DIR, slot);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXTENSIONS.test(f))
      .sort()
      .map((f) => `/images/icons/${slot}/${f}`);
  } catch {
    return [];
  }
}

/** ICON_SLOTS の全キーについて、候補一覧をまとめて取得する */
export function listAllIconCandidates(iconSlots: Record<string, string>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, slot] of Object.entries(iconSlots)) {
    result[key] = listIconCandidates(slot);
  }
  return result;
}
