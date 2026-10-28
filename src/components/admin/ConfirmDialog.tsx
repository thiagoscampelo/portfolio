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
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl shadow-black/40 overflow-hidden z-10"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                      state.variant === "danger"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-brand/10 border-brand/20 text-brand"
                    }`}
                  >
                    <AlertTriangle size={18} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-base font-medium tracking-[-0.01em] text-[var(--color-foreground)]">
                      {state.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                      {state.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 px-6 border-t border-[var(--color-border)] bg-[var(--color-card)] flex items-center justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-foreground)]"
                >
                  {state.cancelText || "Cancelar"}
                </button>

                <button
                  onClick={() => handleClose(true)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                    state.variant === "danger"
                      ? "bg-red-600 text-white hover:bg-red-500"
                      : "bg-brand text-brand-contrast hover:bg-brand-hover"
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
