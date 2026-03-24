import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "system" | "light" | "dark";

export interface ThemeColor {
  name: string;
  hue: number;
}

export const THEME_COLORS: ThemeColor[] = [
  { name: "Purple", hue: 270 },
  { name: "Blue", hue: 220 },
  { name: "Teal", hue: 175 },
  { name: "Green", hue: 145 },
  { name: "Orange", hue: 25 },
  { name: "Pink", hue: 330 },
];

const MODE_KEY = "notes-theme-mode";
const COLOR_KEY = "notes-theme-color";

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(MODE_KEY) as ThemeMode) || "system";
  });

  const [colorHue, setColorHueState] = useState<number>(() => {
    const stored = localStorage.getItem(COLOR_KEY);
    return stored ? Number(stored) : 270;
  });

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(MODE_KEY, m);
  }, []);

  const setColorHue = useCallback((h: number) => {
    setColorHueState(h);
    localStorage.setItem(COLOR_KEY, String(h));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
  }, [mode]);

  useEffect(() => {
    document.documentElement.style.setProperty("--c-accent-h", String(colorHue));
  }, [colorHue]);

  return { mode, setMode, colorHue, setColorHue };
}
