import { render, screen } from '@testing-library/react';
import { NotFoundPage } from '../src/page-components/NotFoundPage';
import { describe, expect, it, vi } from 'vitest';

// Mock next/link so Link renders as a plain <a> in tests
vi.mock('next/link', () => ({
  default: ({
    href,
    style,
    children,
  }: {
    href: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
  }) => (
    <a href={href} style={style}>
      {children}
    </a>
  ),
}));

describe('NotFoundPage Component', () => {
  it('should render the 404 header and error message text', () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole('heading', { name: /404 - Page Not Found/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The page you are looking for does not exist/i)
    ).toBeInTheDocument();
  });

  it('should contain a link that points to the home page', () => {
    render(<NotFoundPage />);

    const returnLink = screen.getByRole('link', { name: /Return to Home Page/i });

    expect(returnLink).toBeInTheDocument();
    expect(returnLink).toHaveAttribute('href', '/');
  });
});
