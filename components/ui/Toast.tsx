"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Toast.module.css";

// Toasts: bottom centre, one line, an icon, gone after a few seconds.
interface Toast {
  id: number;
  text: string;
  icon: IconName;
}

const ToastContext = createContext<(text: string, icon?: IconName) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);
  const show = useCallback((text: string, icon: IconName = "tick") => {
    const id = next.current++;
    setToasts((t) => [...t.slice(-2), { id, text, icon }]);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => setToasts((all) => all.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`float ${styles.toast}`}>
      <Icon name={toast.icon} />
      <span>{toast.text}</span>
    </div>
  );
}
