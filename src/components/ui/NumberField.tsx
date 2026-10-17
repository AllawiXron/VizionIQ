import React, { useId, useState } from "react";

/** Arabic-Indic digits and separators → a plain number string. */
function toWestern(text: string): string {
  return text
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٫]/g, ".")
    .replace(/[^\d.]/g, "");
}

const format = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "";

/**
 * One number input for every calculator: the unit sits in its own cell
 * (never on top of the digits), thousands get separators, Arabic digits are
 * accepted, and the value is clamped to min/max when the field loses focus.
 */
export function NumberField({
  label,
  value,
  onChange,
  unit,
  min = 0,
  max,
  step,
  hint,
  className = "",
}: {
  label?: React.ReactNode;
  value: number;
  onChange: (n: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (n: number) => {
    let v = n;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return v;
  };

  const nudge = (dir: 1 | -1) => {
    if (!step) return;
    onChange(clamp(Math.round((value + dir * step) * 100) / 100));
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs sm:text-sm font-bold text-white/80 leading-relaxed">
          {label}
        </label>
      )}
      <div className="flex items-stretch rounded-xl border border-white/10 bg-white/[0.05] focus-within:border-white/35 focus-within:ring-2 focus-within:ring-white/25 transition-colors min-h-[46px] overflow-hidden" dir="ltr">
        {unit && (
          <span className="shrink-0 flex items-center px-3 text-xs font-bold text-white/55 border-r border-white/10 bg-white/[0.03] whitespace-nowrap">
            {unit}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft ?? format(value)}
          onFocus={() => setDraft(format(value))}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            const clean = toWestern(raw);
            if (clean === "" || clean === ".") return;
            const n = Number(clean);
            if (Number.isFinite(n)) onChange(max !== undefined ? Math.min(max, n) : n);
          }}
          onBlur={() => {
            const n = Number(toWestern(draft ?? ""));
            onChange(clamp(Number.isFinite(n) ? n : 0));
            setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); nudge(1); setDraft(null); }
            if (e.key === "ArrowDown") { e.preventDefault(); nudge(-1); setDraft(null); }
          }}
          className="flex-1 min-w-0 bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-white font-mono text-left outline-none"
        />
      </div>
      {hint && <p className="text-[11px] text-white/45 leading-relaxed">{hint}</p>}
    </div>
  );
}
