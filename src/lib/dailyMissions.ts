// 7種のミッションプールから、日替わりで3つを決定的に選出する
// (同じ日付なら全ユーザーで同じ3つが選ばれ、リロードしても変わらない)
import { prisma } from "@/lib/prisma";
import { todayJst } from "@/lib/date";

const DAILY_PICK_COUNT = 3;

/** 文字列から決定的な32bit整数ハッシュを作る(FNV-1a風) */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** シード付き線形合同法による疑似乱数生成器(0以上1未満) */
function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** 日付文字列をシードに、配列を決定的にシャッフルする(Fisher-Yates) */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const rand = seededRandom(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 今日のデイリーミッション3件を返す(日付ごとに決定的)。
 * ミッションはDBのMission("daily"型)から、id昇順で安定ソートしてから選出する。
 */
export async function getTodaysMissions(dateStr: string = todayJst()) {
  const pool = await prisma.mission.findMany({
    where: { type: "daily" },
    orderBy: { id: "asc" },
  });
  if (pool.length <= DAILY_PICK_COUNT) return pool;

  const seed = hashString(dateStr);
  const shuffled = seededShuffle(pool, seed);
  return shuffled.slice(0, DAILY_PICK_COUNT);
}
