import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CardsList } from './CountriesCardsList';
import { useCountriesStore } from '../../store/useCountriesStore';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../store/useCountriesStore');

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
  beforeEach(() => {
    vi.mocked(useCountriesStore).mockReturnValue({
      countries: mockCountries,
      isLoading: false,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });
  });

  it('renders Loader when isLoading is true', () => {
    vi.mocked(useCountriesStore).mockReturnValue({
      countries: [],
      isLoading: true,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });

    renderWithRouter(
      <CardsList countries={[]} isLoading={true} error={null} />
    );

    expect(screen.getByText('Loading countries…')).toBeInTheDocument();
  });

  it('renders error message and retry button when error is provided', () => {
    vi.mocked(useCountriesStore).mockReturnValue({
      countries: [],
      isLoading: false,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });

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

  it('calls refreshCountries when retry button is clicked', () => {
    const mockRefresh = vi.fn();
    vi.mocked(useCountriesStore).mockReturnValue({
      countries: [],
      isLoading: false,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: mockRefresh,
    });

    renderWithRouter(
      <CardsList countries={[]} isLoading={false} error="Error" />
    );

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
