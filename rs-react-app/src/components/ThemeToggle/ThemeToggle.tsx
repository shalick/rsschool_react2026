import { useTheme } from '../../context/ThemeContext';
import classes from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={classes.toggle}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};
