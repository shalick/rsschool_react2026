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
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? classes.activeLink : classes.link
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? classes.activeLink : classes.link
            }
          >
            About
          </NavLink>
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
