import { NOTE_TEMPLATES, type NoteTemplate } from "../lib/templates";

interface TemplatePanelProps {
  open: boolean;
  onSelect: (template: NoteTemplate) => void;
  onClose: () => void;
}

export function TemplatePanel({ open, onSelect, onClose }: TemplatePanelProps) {
  if (!open) return null;

  return (
    <div
      className="theme-panel-overlay"
      onClick={onClose}
      role="dialog"
      aria-label="テンプレート選択"
      aria-modal="true"
    >
      <div className="template-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="theme-panel-title">テンプレートから作成</h3>
        <div className="template-grid">
          {NOTE_TEMPLATES.map((t) => (
            <button
              key={t.name}
              className="template-card"
              onClick={() => {
                onSelect(t);
                onClose();
              }}
            >
              <span className="template-icon">{t.icon}</span>
              <span className="template-name">{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
