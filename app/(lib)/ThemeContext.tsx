"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  // Initial theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = (localStorage.getItem("theme") as Theme) || null;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")
      .matches;

    const initial: Theme = saved || (prefersDark ? "dark" : "light");
    // Avoid synchronous setState in effect
    setTimeout(() => setTheme(initial), 0);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

