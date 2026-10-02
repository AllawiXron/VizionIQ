import React, { useEffect } from "react";
import { Check, Copy, Bookmark, Calendar, ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toastMotion } from "../lib/motion";

export interface ToastMessage {
  id: string;
  type: "success" | "copy" | "saved" | "plan" | "navigate";
  title: string;
  description?: string;
}

interface AdvisorToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const AdvisorToast: React.FC<AdvisorToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast?.type) {
      case "copy":
        return <Copy className="w-4 h-4 text-zinc-300" />;
      case "saved":
        return <Bookmark className="w-4 h-4 text-zinc-100" />;
      case "plan":
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case "navigate":
        return <ArrowLeft className="w-4 h-4 text-zinc-300" />;
      default:
        return <Check className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <AnimatePresence>
      {toast && (
      <motion.div
        key={toast.id}
        {...toastMotion}
        className="fixed top-5 inset-x-0 mx-auto z-[200] max-w-md w-[92%] sm:w-fit min-w-[280px] p-2.5 sm:p-3 rounded-full glass-floating glass-edge text-white dir-rtl flex items-center justify-between gap-3 pointer-events-auto"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-zinc-100 leading-snug">
              {toast.title}
            </h5>
            {toast.description && (
              <p className="text-[10px] sm:text-xs text-white/70 font-light mt-0.5">
                {toast.description}
              </p>
            )}
          </div>
        </div>

        <button           onClick={onDismiss}
          className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050506]"
          aria-label="إغلاق التنبيه"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
