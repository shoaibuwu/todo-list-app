import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('taskflow_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      id="btn-theme-toggle"
      className="btn-theme-toggle"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun size={16} className="theme-icon sun-icon" />
          <span className="theme-toggle-label">Light</span>
        </>
      ) : (
        <>
          <Moon size={16} className="theme-icon moon-icon" />
          <span className="theme-toggle-label">Dark</span>
        </>
      )}
    </button>
  );
}
