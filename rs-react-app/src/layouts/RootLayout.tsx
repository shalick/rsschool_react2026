import { NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import { useCountriesStore } from '../store/useCountriesStore';
import { useEffect } from 'react';
import { Flyout } from '../components/Flyout/Flyout';
import classes from './RootLayout.module.css';

export function RootLayout() {
  const { fetchCountries } = useCountriesStore();

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return (
    <div className={classes.layout}>
      <header className={classes.header}>
        <nav className={classes.nav}>
          {[
            { to: '/', label: 'Home' },
            { to: '/about', label: 'About' },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? classes.activeLink : classes.link
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className={classes.actions}>
          <ThemeToggle />
        </div>
      </header>
      <main className={classes.main}>
        <Outlet />
      </main>
      <Flyout />
    </div>
  );
}
