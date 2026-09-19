import React, { useEffect } from "react";
import { Check, Copy, Bookmark, Calendar, ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "copy":
        return <Copy className="w-4 h-4 text-sky-400" />;
      case "saved":
        return <Bookmark className="w-4 h-4 text-[#F0C040]" />;
      case "plan":
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case "navigate":
        return <ArrowLeft className="w-4 h-4 text-purple-400" />;
      default:
        return <Check className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] max-w-md w-[92%] sm:w-auto min-w-[280px] p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#0F1735] via-[#0A122E] to-[#040B24] border border-[#D4A017]/60 md:shadow-[0_10px_35px_rgba(212,160,23,0.35)] shadow-xl backdrop-blur-xl text-white dir-rtl flex items-center justify-between gap-3 pointer-events-auto"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-[#D4A017]/30 flex items-center justify-center shrink-0 shadow-inner">
            {getIcon()}
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-[#F0C040] leading-snug">
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
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-all motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C040] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040B24]"
          aria-label="إغلاق التنبيه"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
