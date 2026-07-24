"use client";

import { useRef } from "react";

type Props = {
  label: string;
  hint?: string;
  previewUrl: string | null;
  busy?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

/** 画像アップロード用の共通UI。実際の保存方法(サーバー保存/ローカルプレビューのみ)は呼び出し側のonSelectで決める */
export function ImagePickerField({ label, hint, previewUrl, busy, onSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      alert("画像サイズは5MBまでです");
      return;
    }
    onSelect(file);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-stone-400">{label}</label>
        {hint && <span className="text-[10px] text-stone-600">{hint}</span>}
      </div>
      <div className="mt-1 flex items-center gap-2">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-12 w-12 rounded-md border border-surface-border object-cover" />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-surface-border text-[10px] text-stone-600">
            未設定
          </span>
        )}
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleFile} className="hidden" />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="ghost-button !px-3 !py-1.5 text-xs"
        >
          {busy ? "処理中…" : "画像を選ぶ"}
        </button>
        {previewUrl && (
          <button onClick={onRemove} disabled={busy} className="ghost-button !px-3 !py-1.5 text-xs text-stone-500">
            削除
          </button>
        )}
      </div>
    </div>
  );
}
