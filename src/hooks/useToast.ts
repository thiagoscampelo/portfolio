import { createContext, useContext } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook para emitir toasts no canto inferior direito.
 * Deve ser usado dentro de <ToastProvider> (App.tsx).
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }
  return ctx;
}
