interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onContentChange: (content: string) => void;
}

interface ToolbarAction {
  label: string;
  icon: string;
  title: string;
  action: (textarea: HTMLTextAreaElement) => { value: string; selStart: number; selEnd: number };
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string
) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const selected = value.slice(s, e) || placeholder;
  const newValue = value.slice(0, s) + before + selected + after + value.slice(e);
  return {
    value: newValue,
    selStart: s + before.length,
    selEnd: s + before.length + selected.length,
  };
}

function prefixLine(textarea: HTMLTextAreaElement, prefix: string) {
  const { selectionStart: s, value } = textarea;
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  return {
    value: newValue,
    selStart: s + prefix.length,
    selEnd: s + prefix.length,
  };
}

const actions: ToolbarAction[] = [
  {
    label: "B",
    icon: "B",
    title: "太字 (Ctrl+B)",
    action: (ta) => wrapSelection(ta, "**", "**", "太字テキスト"),
  },
  {
    label: "I",
    icon: "𝐼",
    title: "斜体 (Ctrl+I)",
    action: (ta) => wrapSelection(ta, "*", "*", "斜体テキスト"),
  },
  {
    label: "S",
    icon: "S̶",
    title: "取り消し線",
    action: (ta) => wrapSelection(ta, "~~", "~~", "取り消し"),
  },
  {
    label: "H",
    icon: "H",
    title: "見出し",
    action: (ta) => prefixLine(ta, "## "),
  },
  {
    label: "UL",
    icon: "•",
    title: "箇条書き",
    action: (ta) => prefixLine(ta, "- "),
  },
  {
    label: "OL",
    icon: "1.",
    title: "番号リスト",
    action: (ta) => prefixLine(ta, "1. "),
  },
  {
    label: "checkbox",
    icon: "☑",
    title: "チェックボックス",
    action: (ta) => prefixLine(ta, "- [ ] "),
  },
  {
    label: "code",
    icon: "</>",
    title: "コード",
    action: (ta) => wrapSelection(ta, "`", "`", "code"),
  },
  {
    label: "codeblock",
    icon: "{ }",
    title: "コードブロック",
    action: (ta) => wrapSelection(ta, "```\n", "\n```", "code"),
  },
  {
    label: "link",
    icon: "🔗",
    title: "リンク",
    action: (ta) => {
      const { selectionStart: s, selectionEnd: e, value } = ta;
      const selected = value.slice(s, e) || "リンクテキスト";
      const newValue = value.slice(0, s) + `[${selected}](url)` + value.slice(e);
      return {
        value: newValue,
        selStart: s + selected.length + 3,
        selEnd: s + selected.length + 6,
      };
    },
  },
  {
    label: "quote",
    icon: "❝",
    title: "引用",
    action: (ta) => prefixLine(ta, "> "),
  },
  {
    label: "hr",
    icon: "―",
    title: "水平線",
    action: (ta) => {
      const { selectionStart: s, value } = ta;
      const insert = "\n---\n";
      return {
        value: value.slice(0, s) + insert + value.slice(s),
        selStart: s + insert.length,
        selEnd: s + insert.length,
      };
    },
  },
  {
    label: "table",
    icon: "⊞",
    title: "テーブル",
    action: (ta) => {
      const { selectionStart: s, value } = ta;
      const table = "\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| | | |\n";
      return {
        value: value.slice(0, s) + table + value.slice(s),
        selStart: s + table.length,
        selEnd: s + table.length,
      };
    },
  },
];

export function MarkdownToolbar({ textareaRef, onContentChange }: MarkdownToolbarProps) {
  const handleAction = (action: ToolbarAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const result = action.action(ta);
    onContentChange(result.value);

    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selStart, result.selEnd);
    });
  };

  return (
    <div className="md-toolbar" role="toolbar" aria-label="Markdown書式ツールバー">
      {actions.map((a) => (
        <button
          key={a.label}
          className="md-toolbar-btn"
          onClick={() => handleAction(a)}
          title={a.title}
          aria-label={a.title}
          tabIndex={-1}
          type="button"
        >
          {a.icon}
        </button>
      ))}
    </div>
  );
}
