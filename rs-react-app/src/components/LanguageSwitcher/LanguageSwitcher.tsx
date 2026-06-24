'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '../../i18n/navigation';
import { locales, LOCALE_COOKIE, type Locale } from '../../i18n/config';
import classes from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const t = useTranslations('language');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Locale;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      className={classes.switcher}
      aria-label={t('switcher')}
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {t(loc)}
        </option>
      ))}
    </select>
  );
}
