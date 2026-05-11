import { render, screen } from '@testing-library/react';
import { CardsList } from './CountriesCardsList';
import type { ICountry } from './CountriesCardsList';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../CountryCard/CountryCard', () => ({
  CountryCard: ({ name }: { name: { common: string } }) => (
    <div data-testid="country-card">{name.common}</div>
  ),
}));

vi.mock('../Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

describe('CardsList', () => {
  const mockCountries: ICountry[] = [
    {
      cca3: 'DEU',
      name: { common: 'Germany' },
      flags: { png: 'de.png', svg: 'de.svg', alt: 'German flag' },
      capital: ['Berlin'],
      region: 'Europe',
      population: 83200000,
    },
    {
      cca3: 'FRA',
      name: { common: 'France' },
      flags: { png: 'fr.png', svg: 'fr.svg' },
      capital: ['Paris'],
      region: 'Europe',
      population: 67390000,
    },
  ];

  it('renders Loader when isLoading is true', () => {
    render(<CardsList countries={[]} isLoading={true} error={null} />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByTestId('country-card')).not.toBeInTheDocument();
    expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();
  });

  it('renders error message and retry button when error is provided', () => {
    const errorMessage = 'Failed to fetch countries';
    render(<CardsList countries={[]} isLoading={false} error={errorMessage} />);

    expect(screen.getByText(/⚠️/)).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes(errorMessage))
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.queryByTestId('country-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  it('renders a list of CountryCard components for each country', () => {
    render(
      <CardsList countries={mockCountries} isLoading={false} error={null} />
    );

    const cards = screen.getAllByTestId('country-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Germany');
    expect(cards[1]).toHaveTextContent('France');
  });

  it('renders empty list (no cards) when countries array is empty', () => {
    render(<CardsList countries={[]} isLoading={false} error={null} />);
    expect(screen.queryByTestId('country-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();
    const list = document.querySelector('ul');
    expect(list).toBeInTheDocument();
    expect(list?.children).toHaveLength(0);
  });

  it('handles missing optional fields on a country (e.g., capital)', () => {
    const countriesWithMissingData: ICountry[] = [
      {
        cca3: 'ATA',
        name: { common: 'Antarctica' },
        flags: { png: 'aq.png', svg: 'aq.svg' },
        capital: undefined,
        region: 'Antarctica',
        population: 0,
      },
    ];
    render(
      <CardsList
        countries={countriesWithMissingData}
        isLoading={false}
        error={null}
      />
    );
    expect(screen.getByTestId('country-card')).toHaveTextContent('Antarctica');
  });
});
