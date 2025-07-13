import { useEffect, useState } from "react";
import { Theme, ThemeProviderProps, ThemeProviderContext } from "@/components/theme/theme-context";
import { THEME_CSS_CLASSES } from "@/components/theme/theme-constants";

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "iut",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage?.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;

      root.classList.remove(...THEME_CSS_CLASSES);

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, newTheme);
      }
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext {...props} value={value}>
      {children}
    </ThemeProviderContext>
  );
}

