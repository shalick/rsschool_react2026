import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import classes from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('theme');

  return (
    <button onClick={toggleTheme} className={classes.toggle}>
      {theme === 'light' ? t('dark') : t('light')}
    </button>
  );
};
