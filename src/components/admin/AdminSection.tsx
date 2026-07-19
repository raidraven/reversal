type Props = {
  title: React.ReactNode;
  description?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

/**
 * 管理ページの折りたたみ可能なセクション。PC表示での縦スクロール量を減らすため、
 * 各管理項目を <details> でプルダウン式にまとめる(JS不要のネイティブ実装)。
 */
export function AdminSection({ title, description, defaultOpen = false, children }: Props) {
  return (
    <details className="game-card group" open={defaultOpen}>
      <summary className="mansion-title flex cursor-pointer list-none items-center justify-between text-lg marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-sm text-stone-500 transition-transform duration-200 group-open:rotate-90">▸</span>
      </summary>
      {description && <p className="mt-1 text-xs text-stone-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </details>
  );
}
