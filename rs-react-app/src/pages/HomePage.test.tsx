import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { useCountriesStore } from '../store/useCountriesStore';
import { useSubmissionStore } from '../store/useSubmissionStore';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Country } from '../shared/types';
import { useParams, useLocation } from 'react-router-dom';

const mockNavigate = vi.fn();
window.scrollTo = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(),
    useLocation: vi.fn(() => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    })),
  };
});

vi.mock('./HomePage.module.css', () => ({
  default: {
    homeLayout: 'homeLayout',
    splitActive: 'splitActive',
    leftSection: 'leftSection',
    rightSection: 'rightSection',
  },
}));

vi.mock('../store/useCountriesStore', () => ({
  useCountriesStore: vi.fn(),
}));

vi.mock('../components/CountriesCardsList/CountriesCardsList', () => ({
  CardsList: ({
    countries,
    isLoading,
    error,
  }: {
    countries: Country[];
    isLoading: boolean;
    error: string | null;
  }) => (
    <div data-testid="cards-list">
      {isLoading && <span>Loading...</span>}
      {error && <span>Error: {error}</span>}
      {!isLoading && !error && (
        <ul>
          {countries.map((c) => (
            <li key={c.cca3}>{c.name.common}</li>
          ))}
        </ul>
      )}
    </div>
  ),
}));

vi.mock('../components/Search/Search', () => ({
  Search: ({
    searchStr,
    onSearchChange,
  }: {
    searchStr: string;
    onSearchChange: (val: string) => void;
  }) => (
    <div data-testid="search">
      <input
        data-testid="search-input"
        value={searchStr}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('../components/Pagination/Pagination', () => ({
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination">
      <button
        data-testid="next-page"
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  ),
}));

vi.mock('../components/ErrorBoundary/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('../components/ErrorSimulator/ErrorSimulator', () => ({
  ErrorSimulator: () => (
    <div data-testid="error-simulator">Error Simulator</div>
  ),
}));

vi.mock('../components/Modal/Modal', () => ({
  Modal: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div data-testid="mock-modal">{children}</div> : null,
}));

vi.mock('../components/Modal/ModalForms', () => ({
  ModalForms: ({
    type,
    onSubmit,
  }: {
    type: 'uncontrolled' | 'react-hook-form';
    onSubmit: (values: {
      name: string;
      email: string;
      message: string;
    }) => void;
  }) => (
    <button
      data-testid={`submit-${type}`}
      onClick={() =>
        onSubmit({
          name: `${type} name`,
          email: `${type}@example.com`,
          message: `Submitted via ${type}`,
        })
      }
    >
      Submit {type}
    </button>
  ),
}));

describe('HomePage', () => {
  const mockCountries: Country[] = [
    {
      cca3: 'DEU',
      name: { common: 'Germany', official: 'Federal Republic of Germany' },
      flags: { png: 'de.png', svg: 'de.svg' },
      capital: ['Berlin'],
      region: 'Europe',
      population: 83200000,
    },
    {
      cca3: 'FRA',
      name: { common: 'France', official: 'French Republic' },
      flags: { png: 'fr.png', svg: 'fr.svg' },
      capital: ['Paris'],
      region: 'Europe',
      population: 67390000,
    },
    {
      cca3: 'ESP',
      name: { common: 'Spain', official: 'Kingdom of Spain' },
      flags: { png: 'es.png', svg: 'es.svg' },
      capital: ['Madrid'],
      region: 'Europe',
      population: 47351567,
    },
  ];

  const mockUseCountriesStore = vi.mocked(useCountriesStore);
  const mockUseParams = vi.mocked(useParams);
  const mockUseLocation = vi.mocked(useLocation);

  beforeEach(() => {
    vi.clearAllMocks();
    useSubmissionStore.setState({ submissions: [] });
    mockUseParams.mockReturnValue({});

    mockUseLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });

    mockUseCountriesStore.mockReturnValue({
      countries: mockCountries,
      isLoading: false,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });
    mockNavigate.mockClear();
  });

  const renderHomePage = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<HomePage />}>
            <Route
              path=":countryCode"
              element={<div data-testid="details-outlet">Country Details</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders countries list when data is loaded', () => {
    renderHomePage();
    expect(screen.getByTestId('cards-list')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
  });

  it('shows loader when isLoading is true', () => {
    mockUseCountriesStore.mockReturnValue({
      countries: [],
      isLoading: true,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });
    renderHomePage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    mockUseCountriesStore.mockReturnValue({
      countries: [],
      isLoading: false,
      error: 'Failed to fetch countries',
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });
    renderHomePage();
    expect(
      screen.getByText('Error: Failed to fetch countries')
    ).toBeInTheDocument();
  });

  it('calls refreshCountries when refresh button is clicked', () => {
    const mockRefresh = vi.fn();
    mockUseCountriesStore.mockReturnValue({
      countries: mockCountries,
      isLoading: false,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: mockRefresh,
    });

    renderHomePage();
    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('shows loading state on refresh button when isLoading is true', () => {
    mockUseCountriesStore.mockReturnValue({
      countries: mockCountries,
      isLoading: true,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });

    renderHomePage();
    const refreshButton = screen.getByRole('button', { name: /Refreshing/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton.textContent).toContain('Refreshing...');
  });

  it('stores uncontrolled form submission and shows it on the page', async () => {
    renderHomePage();

    fireEvent.click(screen.getByRole('button', { name: /Open Uncontrolled Form/i }));
    fireEvent.click(screen.getByTestId('submit-uncontrolled'));

    await waitFor(() => {
      expect(screen.getByText(/Submission History/i)).toBeInTheDocument();
      expect(screen.getByText(/^uncontrolled$/i)).toBeInTheDocument();
      expect(screen.getByText(/Submitted via uncontrolled/i)).toBeInTheDocument();
      expect(screen.getByText(/uncontrolled@example.com/i)).toBeInTheDocument();
    });
  });

  it('stores react-hook-form submission and shows it on the page', async () => {
    renderHomePage();

    fireEvent.click(screen.getByRole('button', { name: /Open React Hook Form/i }));
    fireEvent.click(screen.getByTestId('submit-react-hook-form'));

    await waitFor(() => {
      expect(screen.getByText(/Submission History/i)).toBeInTheDocument();
      expect(screen.getByText(/^react-hook-form$/i)).toBeInTheDocument();
      expect(screen.getByText(/Submitted via react-hook-form/i)).toBeInTheDocument();
      expect(screen.getByText(/react-hook-form@example.com/i)).toBeInTheDocument();
    });
  });

  it('renders filtered countries when search param is in the URL', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/',
      search: '?search=ger',
      hash: '',
      state: null,
      key: 'test-search',
    });

    renderHomePage(['/?search=ger']);

    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('displays details panel when countryCode param is present', () => {
    mockUseParams.mockReturnValue({ countryCode: 'DEU' });
    renderHomePage(['/DEU']);
    expect(screen.getByTestId('details-outlet')).toBeInTheDocument();
  });

  it('triggers navigation when typing in search input', async () => {
    renderHomePage();
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'ger' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('ger');
    });
  });

  it('navigates to next page on pagination click', async () => {
    const manyCountries = Array.from({ length: 15 }, (_, i) => ({
      ...mockCountries[0],
      cca3: `CTA${i}`,
      name: { common: `Country ${i}`, official: '' },
      flags: { png: '', svg: '' },
      capital: [],
      region: '',
      population: 0,
    }));

    mockUseCountriesStore.mockReturnValue({
      countries: manyCountries,
      isLoading: false,
      error: null,
      fetchCountries: vi.fn(),
      searchCountries: vi.fn(),
      refreshCountries: vi.fn(),
    });

    renderHomePage();

    const nextBtn = screen.getByTestId('next-page');
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/Page 2 of/i)).toBeInTheDocument();
    });
  });

  it('closes details panel when clicking on left section while details are open', async () => {
    mockUseParams.mockReturnValue({ countryCode: 'DEU' });
    const { container } = renderHomePage(['/DEU']);
    const leftSection = container.querySelector('.leftSection');
    expect(leftSection).toBeInTheDocument();
    if (leftSection) {
      fireEvent.click(leftSection);
    }
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/',
        })
      );
    });
  });
});
