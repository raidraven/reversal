"use client";

export type LinkField = { label: string; url: string };

const MAX_LINKS = 10;

type Props = {
  links: LinkField[];
  onChange: (links: LinkField[]) => void;
};

/** 外部リンクの編集UI(最大10件、行の追加・削除)。体験版・実登録どちらからも使う */
export function LinksEditor({ links, onChange }: Props) {
  function updateAt(i: number, patch: Partial<LinkField>) {
    onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function removeAt(i: number) {
    onChange(links.filter((_, idx) => idx !== i));
  }
  function add() {
    if (links.length >= MAX_LINKS) return;
    onChange([...links, { label: "", url: "" }]);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-stone-400">外部リンク(任意・最大{MAX_LINKS}件)</label>
        <span className="text-[10px] text-stone-600">
          {links.length} / {MAX_LINKS}
        </span>
      </div>
      <div className="mt-1 space-y-2">
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link.label}
              onChange={(e) => updateAt(i, { label: e.target.value.slice(0, 30) })}
              maxLength={30}
              placeholder="リンク名"
              className="form-input w-24 shrink-0 !py-1.5 text-xs"
            />
            <input
              value={link.url}
              onChange={(e) => updateAt(i, { url: e.target.value })}
              placeholder="https://..."
              className="form-input min-w-0 flex-1 !py-1.5 text-xs"
            />
            <button onClick={() => removeAt(i)} className="ghost-button shrink-0 !px-2 !py-1.5 text-xs text-stone-500">
              削除
            </button>
          </div>
        ))}
        {links.length < MAX_LINKS && (
          <button onClick={add} className="ghost-button w-full !py-1.5 text-xs">
            + リンクを追加
          </button>
        )}
      </div>
    </div>
  );
}
