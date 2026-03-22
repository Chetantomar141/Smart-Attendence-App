import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'system');

  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    
    // reset class
    root.classList.remove("dark");

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "system") {
      // system theme check
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) root.classList.add("dark");
    }

    localStorage.setItem("theme", newTheme);
    console.log("Theme applied:", newTheme);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    applyTheme(savedTheme);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
