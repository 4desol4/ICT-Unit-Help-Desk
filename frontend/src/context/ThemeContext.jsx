import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const colors = {
    light: {
      bg: "#fff",
      bgSecondary: "#f8fafc",
      text: "#0f172a",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      hover: "#f0f3ff",
    },
    dark: {
      bg: "#000000",
      bgSecondary: "#1a1a2e",
      text: "#fff",
      textSecondary: "#cbd5e1",
      border: "#334155",
      hover: "#1e293b",
    },
  };

  const current = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: current }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
