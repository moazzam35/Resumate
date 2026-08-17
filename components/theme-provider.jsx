"use client";

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback } from "react";

const ThemeContext = createContext(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    return { theme: "light", setTheme: () => {}, resolvedTheme: "light", systemTheme: "light", themes: ["light", "dark"] };
  }
  return ctx;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = true,
  disableTransitionOnChange = false,
  themes = ["light", "dark"],
  storageKey = "theme",
  ...props
}) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [systemTheme, setSystemTheme] = useState("light");
  const [resolvedTheme, setResolvedTheme] = useState(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mq.matches ? "dark" : "light");
    const handler = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && themes.includes(stored)) {
        setThemeState(stored);
      } else if (enableSystem) {
        setThemeState("system");
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    const resolved = theme === "system" ? systemTheme : theme;
    setResolvedTheme(resolved);
  }, [theme, systemTheme]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const resolved = theme === "system" ? systemTheme : theme;
    const root = document.documentElement;

    if (disableTransitionOnChange) {
      root.style.transition = "none";
    }

    if (attribute === "class") {
      themes.forEach((t) => root.classList.remove(t));
      if (resolved) root.classList.add(resolved);
    } else {
      root.setAttribute(attribute, resolved);
    }

    root.style.colorScheme = resolved || "";

    if (disableTransitionOnChange) {
      requestAnimationFrame(() => {
        root.style.removeProperty("transition");
      });
    }
  }, [theme, systemTheme, mounted]);

  const setTheme = useCallback(
    (newTheme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {}
    },
    [storageKey]
  );

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, resolvedTheme, systemTheme, themes }}
      {...props}
    >
      {children}
    </ThemeContext.Provider>
  );
}
