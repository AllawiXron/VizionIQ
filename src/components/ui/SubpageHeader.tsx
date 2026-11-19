import React from "react";
import { ArrowRight } from "lucide-react";

// Phones only: one slim sticky header on detail pages instead of the global bar plus a breadcrumb row.
export function SubpageHeader({ backLabel, onBack, meta }: { backLabel: string; onBack: () => void; meta?: React.ReactNode }) {
  return (
    <div className="lg:hidden sticky top-0 z-30 -mx-4 sm:-mx-6 mb-4 safe-area-top border-b border-white/10 bg-[#040e33]/95 backdrop-blur-md">
      <div className="h-12 px-4 sm:px-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 min-h-[44px] -mr-1 pr-1 text-[14px] font-bold text-white/85 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>
        {meta && <div className="text-[12px] font-bold text-white/65 truncate">{meta}</div>}
      </div>
    </div>
  );
}
