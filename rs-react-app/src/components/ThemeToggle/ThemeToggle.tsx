import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import classes from './ThemeToggle.module.css';

function ThemeToggleComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={classes.toggle}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

export const ThemeToggle = React.memo(ThemeToggleComponent);
