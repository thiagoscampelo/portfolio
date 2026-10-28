import { useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { ToastContext, type ToastVariant } from "../../hooks/useToast";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).substring(2);
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const success = useCallback(
    (message: string) => toast(message, "success"),
    [toast],
  );
  const error = useCallback(
    (message: string) => toast(message, "error"),
    [toast],
  );
  const info = useCallback(
    (message: string) => toast(message, "info"),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const borderColor =
              t.variant === "success"
                ? "rgba(56,191,107,0.35)"
                : t.variant === "error"
                  ? "rgba(239,68,68,0.3)"
                  : "rgba(56,191,107,0.3)";

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ borderColor }}
                className="pointer-events-auto flex items-center gap-3 rounded-xl border bg-[var(--color-card)] shadow-2xl shadow-black/40 px-4 py-3 shadow-2xl min-w-[280px] max-w-md"
              >
                {t.variant === "success" && (
                  <CheckCircle2
                    size={18}
                    className="text-brand shrink-0"
                  />
                )}
                {t.variant === "error" && (
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                )}
                {t.variant === "info" && (
                  <Info size={18} className="text-brand shrink-0" />
                )}

                <span className="text-sm text-[var(--color-foreground)] flex-1">
                  {t.message}
                </span>

                <button
                  onClick={() => remove(t.id)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors p-1"
                  aria-label="Fechar"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
