import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { describe, expect, it, vi } from 'vitest';

// Mock CSS module
vi.mock('./RootLayout.module.css', () => ({
  default: {
    layout: 'layout',
    header: 'header',
    nav: 'nav',
    link: 'link',
    activeLink: 'activeLink',
    main: 'main',
    actions: 'actions',
  },
}));

// Mock the countries store
vi.mock('../store/useCountriesStore', () => ({
  useCountriesStore: vi.fn(() => ({
    fetchCountries: vi.fn(),
  })),
}));

// Mock ThemeToggle component to avoid context dependency
vi.mock('../components/ThemeToggle/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock Flyout component
vi.mock('../components/Flyout/Flyout', () => ({
  Flyout: () => <div data-testid="flyout">Flyout</div>,
}));

describe('RootLayout Component', () => {
  it('should render navigation links for Home and About pages', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RootLayout />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const aboutLink = screen.getByRole('link', { name: /About/i });

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('should apply active class to Home link and standard class to About link when on Home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RootLayout />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const aboutLink = screen.getByRole('link', { name: /About/i });

    expect(homeLink.className).toBe('activeLink');
    expect(aboutLink.className).toBe('link');
  });

  it('should apply active class to About link and standard class to Home link when on About route', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <RootLayout />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const aboutLink = screen.getByRole('link', { name: /About/i });

    expect(homeLink.className).toBe('link');
    expect(aboutLink.className).toBe('activeLink');
  });

  it('should render child route components within the Outlet container', () => {
    render(
      <MemoryRouter initialEntries={['/test-child']}>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route
              path="test-child"
              element={<div data-testid="child-view">Dashboard Content</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child-view')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should render the ThemeToggle and Flyout components', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RootLayout />
      </MemoryRouter>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('flyout')).toBeInTheDocument();
  });
});
