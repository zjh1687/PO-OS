"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastState = {
  message: string;
  tone: "success" | "error";
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastState["tone"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, tone: ToastState["tone"] = "success") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-panel">
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
