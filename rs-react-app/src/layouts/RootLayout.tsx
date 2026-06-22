'use client';

import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import { useCountriesStore } from '../store/useCountriesStore';
import { useEffect } from 'react';
import { Flyout } from '../components/Flyout/Flyout';
import { usePathname } from 'next/navigation';
import classes from './RootLayout.module.css';

export function RootLayout({ children }: { children: React.ReactNode }) {
  const { fetchCountries } = useCountriesStore();
  const pathname = usePathname();

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const isHomeActive = pathname === '/';
  const isAboutActive = pathname === '/about';

  return (
    <div className={classes.layout}>
      <header className={classes.header}>
        <nav className={classes.nav}>
          <Link href="/" className={isHomeActive ? classes.activeLink : classes.link}>
            Home
          </Link>
          <Link href="/about" className={isAboutActive ? classes.activeLink : classes.link}>
            About
          </Link>
        </nav>
        <div className={classes.actions}>
          <ThemeToggle />
        </div>
      </header>
      <main className={classes.main}>{children}</main>
      <Flyout />
    </div>
  );
}
