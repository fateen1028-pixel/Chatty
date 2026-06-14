import { useEffect, useState } from 'react';
import { ThemeContext } from './theme-context';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');

    if (saved) {
      return saved === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(previousValue => !previousValue);
  };

  return (
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
  );
}