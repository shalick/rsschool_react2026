import { render, screen } from '@testing-library/react';
import { NotFoundPage } from '../src/page-components/NotFoundPage';
import { describe, expect, it } from 'vitest';
// Link is now from src/i18n/navigation — mocked globally in setup.ts

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
