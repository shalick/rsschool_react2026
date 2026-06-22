import { render, screen } from '@testing-library/react';
import { RootLayout } from './RootLayout';
import { describe, expect, it, vi } from 'vitest';

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

vi.mock('../store/useCountriesStore', () => ({
  useCountriesStore: vi.fn(() => ({
    fetchCountries: vi.fn(),
  })),
}));

vi.mock('../components/ThemeToggle/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('../components/Flyout/Flyout', () => ({
  Flyout: () => <div data-testid="flyout">Flyout</div>,
}));

// Mock next/link so Link renders as a plain <a> in tests
vi.mock('next/link', () => ({
  default: ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe('RootLayout Component', () => {
  it('should render navigation links for Home and About pages', () => {
    mockUsePathname.mockReturnValue('/');
    render(<RootLayout><div /></RootLayout>);

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const aboutLink = screen.getByRole('link', { name: /About/i });

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('should apply active class to Home link when on the home route', () => {
    mockUsePathname.mockReturnValue('/');
    render(<RootLayout><div /></RootLayout>);

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const aboutLink = screen.getByRole('link', { name: /About/i });

    expect(homeLink.className).toBe('activeLink');
    expect(aboutLink.className).toBe('link');
  });

  it('should apply active class to About link when on the about route', () => {
    mockUsePathname.mockReturnValue('/about');
    render(<RootLayout><div /></RootLayout>);

    const homeLink = screen.getByRole('link', { name: /Home/i });
    const aboutLink = screen.getByRole('link', { name: /About/i });

    expect(homeLink.className).toBe('link');
    expect(aboutLink.className).toBe('activeLink');
  });

  it('should render children inside the main element', () => {
    mockUsePathname.mockReturnValue('/');
    render(
      <RootLayout>
        <div data-testid="child-view">Dashboard Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('child-view')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should render the ThemeToggle and Flyout components', () => {
    mockUsePathname.mockReturnValue('/');
    render(<RootLayout><div /></RootLayout>);

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('flyout')).toBeInTheDocument();
  });
});
