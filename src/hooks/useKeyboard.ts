import { useEffect } from "react";

interface ShortcutHandlers {
  onNewNote: () => void;
  onSearch: () => void;
  onTogglePreview?: () => void;
}

export function useKeyboard(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "n") {
        e.preventDefault();
        handlers.onNewNote();
      }

      if (mod && e.key === "k") {
        e.preventDefault();
        handlers.onSearch();
      }

      if (mod && e.key === "p" && e.shiftKey) {
        e.preventDefault();
        handlers.onTogglePreview?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
