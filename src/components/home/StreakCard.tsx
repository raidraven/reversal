import { EditableText } from "@/components/admin/EditableText";
import { Icon } from "@/components/Icon";

type Props = {
  currentStreak: number;
  longestStreak: number;
  /** 今日まだミッションを1件もこなしていない時に true */
  atRisk: boolean;
  label?: string;
};

export function StreakCard({ currentStreak, longestStreak, atRisk, label = "本日の来館" }: Props) {
  return (
    <section className="game-card animate-fade-up relative flex items-center gap-4" style={{ animationDelay: "0.05s" }}>
      <span className={currentStreak > 0 ? "animate-flicker" : "grayscale opacity-40"}>
        <Icon name="candle" size={40} />
      </span>
      <div>
        <p className="text-sm text-stone-400">
          <EditableText siteTextKey="streak.label" value={label} />
        </p>
        <p className="text-2xl font-black text-stone-100">
          {currentStreak}
          <span className="ml-1 text-sm font-normal text-stone-400">夜</span>
        </p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-xs text-stone-500">自己最長</p>
        <p className="text-lg font-bold text-gold-light">{longestStreak}夜</p>
      </div>
      {atRisk && currentStreak > 0 && (
        <p className="absolute -top-2 right-3 flex items-center gap-1 rounded-full border border-wine-light/60 bg-wine/30 px-2 py-0.5 text-[10px] font-bold text-gold-light">
          <Icon name="warning" size={12} /> 今宵の使命が未達成
        </p>
      )}
    </section>
  );
}
