'use client';

import { Link, usePathname } from '../i18n/navigation';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import { LanguageSwitcher } from '../components/LanguageSwitcher/LanguageSwitcher';
import { useCountriesStore } from '../store/useCountriesStore';
import { useEffect } from 'react';
import { Flyout } from '../components/Flyout/Flyout';
import type { Locale } from '../i18n/config';
import classes from './RootLayout.module.css';

interface RootLayoutProps {
  children: React.ReactNode;
  locale: Locale;
}

export function RootLayout({ children, locale }: RootLayoutProps) {
  const { fetchCountries } = useCountriesStore();
  const pathname = usePathname();
  const t = useTranslations('nav');

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const isAboutActive = pathname === '/about';
  const isHomeActive = !isAboutActive;

  return (
    <div className={classes.layout}>
      <header className={classes.header}>
        <nav className={classes.nav}>
          <Link href="/" className={isHomeActive ? classes.activeLink : classes.link}>
            {t('home')}
          </Link>
          <Link href="/about" className={isAboutActive ? classes.activeLink : classes.link}>
            {t('about')}
          </Link>
        </nav>
        <div className={classes.actions}>
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </div>
      </header>
      <main className={classes.main}>{children}</main>
      <Flyout />
    </div>
  );
}
