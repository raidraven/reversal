// ホーム画面のスケルトンローディング
import { Icon } from "@/components/Icon";

function SkeletonCard({ height }: { height: string }) {
  return (
    <div
      className="animate-pulse rounded-2xl border border-surface-border bg-surface-card"
      style={{ height }}
    />
  );
}

export default function HomeLoading() {
  return (
    <main className="mx-auto max-w-md px-4 pb-24 lg:max-w-5xl">
      <header className="flex items-center justify-between py-4">
        <h1 className="mansion-title flex items-center gap-1.5 text-lg">
          <Icon name="candle" size={20} /> リバーサル
        </h1>
      </header>
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        <div className="space-y-4">
          <SkeletonCard height="88px" />
          <SkeletonCard height="150px" />
          <SkeletonCard height="80px" />
        </div>
        <div className="space-y-4">
          <SkeletonCard height="280px" />
          <SkeletonCard height="300px" />
        </div>
      </div>
    </main>
  );
}
