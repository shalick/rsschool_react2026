import { NavLink, Outlet } from 'react-router-dom';
import classes from './RootLayout.module.css';

export function RootLayout() {
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
      </header>
      <main className={classes.main}>
        <Outlet />
      </main>
    </div>
  );
}
