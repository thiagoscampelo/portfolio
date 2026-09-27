import { useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { ConfirmContext, type ConfirmOptions } from "../../hooks/useConfirm";

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  function handleClose(value: boolean) {
    if (state) {
      state.resolve(value);
      setState(null);
    }
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {state && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      state.variant === "danger"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    <AlertTriangle size={18} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                      {state.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-muted)] leading-relaxed">
                      {state.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 px-6 border-t border-[var(--color-border)] bg-[var(--color-card)] flex items-center justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition"
                >
                  {state.cancelText || "Cancelar"}
                </button>

                <button
                  onClick={() => handleClose(true)}
                  className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white shadow-lg transition ${
                    state.variant === "danger"
                      ? "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                  }`}
                >
                  {state.confirmText || "Confirmar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
