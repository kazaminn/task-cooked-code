import { useState, useMemo, useRef, useEffect } from "react";

interface FindReplaceProps {
  content: string;
  onReplace: (find: string, replace: string, all: boolean) => void;
  onClose: () => void;
}

export function FindReplace({ content, onReplace, onClose }: FindReplaceProps) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const findRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findRef.current?.focus();
  }, []);

  const matchCount = useMemo(() => {
    if (!find) return 0;
    let count = 0;
    let idx = 0;
    while ((idx = content.indexOf(find, idx)) !== -1) {
      count++;
      idx += find.length;
    }
    return count;
  }, [content, find]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Enter" && find) {
      e.preventDefault();
      onReplace(find, replace, false);
    }
  };

  return (
    <div className="find-replace" role="search" aria-label="検索と置換" onKeyDown={handleKeyDown}>
      <div className="find-replace-row">
        <input
          ref={findRef}
          className="find-replace-input"
          type="text"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="検索..."
          aria-label="検索テキスト"
        />
        <span className="find-replace-count" aria-live="polite">
          {find ? `${matchCount}件` : ""}
        </span>
      </div>
      <div className="find-replace-row">
        <input
          className="find-replace-input"
          type="text"
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="置換..."
          aria-label="置換テキスト"
        />
        <button
          className="btn-toolbar"
          onClick={() => onReplace(find, replace, false)}
          disabled={!find || matchCount === 0}
          title="1件置換"
        >
          置換
        </button>
        <button
          className="btn-toolbar"
          onClick={() => onReplace(find, replace, true)}
          disabled={!find || matchCount === 0}
          title="すべて置換"
        >
          全置換
        </button>
        <button
          className="btn-icon-sm"
          onClick={onClose}
          aria-label="閉じる"
          style={{ opacity: 1 }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
