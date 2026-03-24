import { useState, useCallback, useRef } from "react";

export interface Toast {
  id: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, action?: Toast["action"], duration = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, action }]);

      const timer = window.setTimeout(() => {
        removeToast(id);
      }, duration);
      timers.current.set(id, timer);

      return id;
    },
    [removeToast]
  );

  return { toasts, addToast, removeToast };
}
