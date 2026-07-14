"use client";

import { useEffect, useState } from "react";
import { SITE_TEXT_KEYS, SITE_TEXT_LABELS, ICON_SLOTS } from "@/lib/siteTextDefaults";
import { SiteIcon } from "@/components/SiteIcon";

type Props = {
  /** キーごとのアイコン画像候補(public/images/icons/<slot>/ 由来)。候補が無ければ空配列 */
  iconCandidates?: Record<string, string[]>;
};

export function SiteTextsManager({ iconCandidates = {} }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-texts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.texts) setValues(data.texts);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/site-texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: values }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "保存に失敗しました");
        return;
      }
      setValues(data.texts);
      setMessage("保存いたしました");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-md bg-surface-raised" />;

  return (
    <>
      <p className="text-xs text-stone-500">
        サイト各所の文言やアイコンを編集できます。アイコン欄は絵文字を直接入力するか、下に候補画像があればクリックして選べます。
      </p>

      {error && (
        <p className="mt-3 rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-3 rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-gold-light">
          {message}
        </p>
      )}

      <form onSubmit={handleSave} className="mt-4 space-y-3">
        {SITE_TEXT_KEYS.map((key) => {
          const candidates = key in ICON_SLOTS ? iconCandidates[key] ?? [] : [];
          const isIconField = key in ICON_SLOTS;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-2">
                {isIconField && <SiteIcon value={values[key] ?? ""} size={22} />}
                <label htmlFor={`text-${key}`} className="text-xs text-stone-400">
                  {SITE_TEXT_LABELS[key] ?? key}
                </label>
              </div>
              <textarea
                id={`text-${key}`}
                value={values[key] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={key.includes("intro") ? 3 : 1}
                className="form-input resize-none text-sm"
              />
              {isIconField && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {candidates.length === 0 ? (
                    <p className="text-[10px] text-stone-600">
                      候補画像はまだありません(public/images/icons/{ICON_SLOTS[key]}/ に画像を置くと選べるようになります)
                    </p>
                  ) : (
                    candidates.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setValues((prev) => ({ ...prev, [key]: src }))}
                        className={`rounded-md border p-1 transition-colors ${
                          values[key] === src
                            ? "border-gold bg-gold/15"
                            : "border-surface-border hover:border-gold/40"
                        }`}
                        title={src}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-10 w-10 rounded object-cover" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
        <button type="submit" disabled={saving} className="neon-button w-full">
          {saving ? "保存中…" : "保存する"}
        </button>
      </form>
    </>
  );
}
