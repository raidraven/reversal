"use client";

export type TextOverrideState = { text: string; hidden: boolean };

export function textOverrideToPayload(state: TextOverrideState): string | null {
  if (state.hidden) return "";
  if (state.text.trim() === "") return null; // デフォルト文言に戻す
  return state.text.trim();
}

type Props = {
  label: string;
  defaultText: string;
  value: TextOverrideState;
  onChange: (value: TextOverrideState) => void;
};

/** 会員証の文言(見出し・「様」・「位階」等)の上書き・非表示UI */
export function TextOverrideField({ label, defaultText, value, onChange }: Props) {
  return (
    <div>
      <label className="text-xs text-stone-400">
        {label} <span className="text-stone-600">(デフォルト: {defaultText})</span>
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value.slice(0, 30) })}
          disabled={value.hidden}
          maxLength={30}
          placeholder={defaultText}
          className="form-input min-w-0 flex-1 !py-1.5 text-xs disabled:opacity-40"
        />
        <label className="flex shrink-0 items-center gap-1 text-[10px] text-stone-500">
          <input
            type="checkbox"
            checked={value.hidden}
            onChange={(e) => onChange({ ...value, hidden: e.target.checked })}
          />
          非表示
        </label>
      </div>
    </div>
  );
}
