import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const theme = 'dark';

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
    if (body) {
      body.classList.add('dark');
      body.classList.remove('light');
    }
    try {
      localStorage.setItem('traverse_theme', 'dark');
    } catch (e) {}
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'dark',
        setTheme: () => {},
        toggleTheme: () => {},
        setLightMode: () => {},
        setDarkMode: () => {},
        isDark: true,
        isLight: false
      }}
    >
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
