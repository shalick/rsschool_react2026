import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../src/page-components/NotFoundPage';
import { describe, expect, it } from 'vitest';

describe('NotFoundPage Component', () => {
  it('should render the 404 header and error message text', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /404 - Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByText(/The page you are looking for does not exist/i)).toBeInTheDocument();
  });

  it('should contain a functional link that points to the home page', () => {
    render(
      <MemoryRouter initialEntries={['/some-broken-link']}>
        <Routes>
          <Route path="/some-broken-link" element={<NotFoundPage />} />
          <Route path="/" element={<div data-testid="home-page">Home Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    const returnLink = screen.getByRole('link', { name: /Return to Home Page/i });

    expect(returnLink).toBeInTheDocument();
    expect(returnLink).toHaveAttribute('href', '/');
  });
});
