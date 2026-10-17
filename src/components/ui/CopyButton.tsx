import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vz-navy";

/** Copies a ready message to the clipboard and says so for a moment. */
export function CopyButton({ text, label = "انسخ" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers: fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} className={`btn btn-glass px-3.5 min-h-[36px] rounded-full text-xs gap-1.5 shrink-0 ${focusRing}`} aria-live="polite">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? "انتسخت" : label}</span>
    </button>
  );
}
