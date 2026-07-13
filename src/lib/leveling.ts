// レベル・EXPのロジック
// User.exp は「累計獲得EXP」、User.level は exp から導出した値をキャッシュしたもの
// 称号(位階)は src/lib/rankTitle.ts / src/lib/ranks.ts へ移動(管理ページから編集可能なため)

/** そのレベルから次のレベルに上がるのに必要なEXP */
export function expForLevelUp(level: number): number {
  return 100 + (level - 1) * 50;
}

/** 累計EXPからレベルを計算する */
export function levelFromExp(totalExp: number): number {
  let level = 1;
  let remaining = totalExp;
  while (remaining >= expForLevelUp(level)) {
    remaining -= expForLevelUp(level);
    level++;
  }
  return level;
}

/** 現レベル内での進捗(獲得済み / 必要量) */
export function expProgress(totalExp: number): { current: number; required: number; percent: number } {
  let level = 1;
  let remaining = totalExp;
  while (remaining >= expForLevelUp(level)) {
    remaining -= expForLevelUp(level);
    level++;
  }
  const required = expForLevelUp(level);
  return {
    current: remaining,
    required,
    percent: Math.round((remaining / required) * 100),
  };
}
