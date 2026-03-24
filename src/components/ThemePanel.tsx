import type { ThemeMode } from "../hooks/useTheme";
import { THEME_COLORS } from "../hooks/useTheme";

interface ThemePanelProps {
  open: boolean;
  mode: ThemeMode;
  colorHue: number;
  onModeChange: (mode: ThemeMode) => void;
  onColorChange: (hue: number) => void;
  onClose: () => void;
}

const modes: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "システム" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

export function ThemePanel({
  open,
  mode,
  colorHue,
  onModeChange,
  onColorChange,
  onClose,
}: ThemePanelProps) {
  if (!open) return null;

  return (
    <div
      className="theme-panel-overlay"
      onClick={onClose}
      role="dialog"
      aria-label="テーマ設定"
      aria-modal="true"
    >
      <div className="theme-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="theme-panel-title">テーマ設定</h3>

        <fieldset className="theme-section">
          <legend className="theme-section-label">外観モード</legend>
          <div className="theme-mode-group" role="radiogroup">
            {modes.map((m) => (
              <button
                key={m.value}
                className={`theme-mode-btn ${mode === m.value ? "active" : ""}`}
                onClick={() => onModeChange(m.value)}
                role="radio"
                aria-checked={mode === m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="theme-section">
          <legend className="theme-section-label">アクセントカラー</legend>
          <div className="theme-color-group">
            {THEME_COLORS.map((c) => (
              <button
                key={c.hue}
                className={`theme-color-swatch ${colorHue === c.hue ? "active" : ""}`}
                style={{ "--swatch-hue": c.hue } as React.CSSProperties}
                onClick={() => onColorChange(c.hue)}
                aria-label={c.name}
                title={c.name}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
