import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CardsList } from './CountriesCardsList';
import { describe, expect, it, vi } from 'vitest';

const mockCountries = [
  {
    cca3: 'MEX',
    name: { common: 'Mexico' },
    flags: { svg: 'mex.svg', png: 'mex.png', alt: 'Flag' },
    capital: ['Mexico City'],
    region: 'Americas',
    population: 130000000,
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('CardsList', () => {
  it('renders Loader when isLoading is true', () => {
    renderWithRouter(
      <CardsList countries={[]} isLoading={true} error={null} />
    );

    expect(screen.getByText('Loading countries…')).toBeInTheDocument();
  });

  it('renders error message and retry button when error is provided', () => {
    renderWithRouter(
      <CardsList countries={[]} isLoading={false} error="Failed to fetch" />
    );

    expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders a list of CountryCard components for each country', () => {
    renderWithRouter(
      <CardsList countries={mockCountries} isLoading={false} error={null} />
    );
    expect(screen.getByText('Mexico')).toBeInTheDocument();
  });

  it('renders empty list (no cards) when countries array is empty', () => {
    renderWithRouter(
      <CardsList countries={[]} isLoading={false} error={null} />
    );
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('handles missing optional fields on a country (e.g., capital)', () => {
    const incomplete = [{ ...mockCountries[0], capital: undefined }];
    renderWithRouter(
      <CardsList countries={incomplete} isLoading={false} error={null} />
    );
    expect(screen.getByText('Mexico')).toBeInTheDocument();
  });

  it('calls window.location.reload when retry button is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: reloadMock },
    });

    renderWithRouter(
      <CardsList countries={[]} isLoading={false} error="Error" />
    );

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
