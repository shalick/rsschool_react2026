import { render, screen, fireEvent } from '@testing-library/react';
import { CardsList } from './CountriesCardsList';
import { useCountriesStore } from '../../store/useCountriesStore';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../store/useCountriesStore');

// Mock next/navigation — useSearchParams is called inside CardsList
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Mock CountryCard to avoid its own next/navigation dependency chain
vi.mock('../CountryCard/CountryCard', () => ({
  CountryCard: ({ name }: { name: { common: string } }) => (
    <li role="listitem">{name.common}</li>
  ),
}));

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
    render(<CardsList countries={[]} isLoading={true} error={null} />);
    expect(screen.getByText('Loading countries…')).toBeInTheDocument();
  });

  it('renders error message and retry button when error is provided', () => {
    render(
      <CardsList countries={[]} isLoading={false} error="Failed to fetch" />
    );
    expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders a list of CountryCard components for each country', () => {
    render(
      <CardsList countries={mockCountries} isLoading={false} error={null} />
    );
    expect(screen.getByText('Mexico')).toBeInTheDocument();
  });

  it('renders empty list (no cards) when countries array is empty', () => {
    render(<CardsList countries={[]} isLoading={false} error={null} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('handles missing optional fields on a country (e.g., capital)', () => {
    const incomplete = [{ ...mockCountries[0], capital: undefined }];
    render(
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

    render(<CardsList countries={[]} isLoading={false} error="Error" />);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
