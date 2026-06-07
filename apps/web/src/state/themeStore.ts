import { useEffect, useMemo, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

const storageKey = "fullstack-template-theme";

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const saved = window.localStorage.getItem(storageKey);
    return isThemeMode(saved) ? saved : "system";
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  const resolvedTheme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(media.matches ? "dark" : "light");

    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setMode = useMemo(
    () => (nextMode: ThemeMode) => {
      window.localStorage.setItem(storageKey, nextMode);
      setModeState(nextMode);
    },
    []
  );

  return { mode, resolvedTheme, setMode };
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}
