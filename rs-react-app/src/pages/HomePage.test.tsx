import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { useCountries } from '../hooks/useCountries';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';

vi.mock('../hooks/useCountries', () => ({
  useCountries: vi.fn(),
}));

vi.mock('./HomePage.module.css', () => ({
  default: {
    homeLayout: 'homeLayout',
    splitActive: 'splitActive',
    leftSection: 'leftSection',
    rightSection: 'rightSection',
  },
}));

vi.mock('../components/Search/Search', () => ({
  Search: ({ searchStr, onSearchChange, onSearch }: any) => (
    <div data-testid="mock-search">
      <input
        data-testid="search-input"
        value={searchStr}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button onClick={() => onSearch(searchStr)}>SearchBtn</button>
    </div>
  ),
}));

vi.mock('../components/CountriesCardsList/CountriesCardsList', () => ({
  CardsList: ({ countries, isLoading, error }: any) => (
    <div data-testid="mock-cards-list">
      {isLoading && <span>LoadingState</span>}
      {error && <span>{error}</span>}
      {countries.map((c: any) => (
        <div key={c.cca3}>{c.name.common}</div>
      ))}
    </div>
  ),
}));

vi.mock('../components/Pagination/Pagination', () => ({
  Pagination: ({ currentPage, onPageChange }: any) => (
    <button
      data-testid="mock-pagination"
      onClick={() => onPageChange(currentPage + 1)}
    >
      NextPage
    </button>
  ),
}));

vi.mock('../components/ErrorSimulator/ErrorSimulator', () => ({
  ErrorSimulator: () => (
    <div data-testid="error-simulator">Simulated Error Crashed</div>
  ),
}));

describe('HomePage Component', () => {
  const mockCountries: ICountry[] = [
    {
      cca3: 'MEX',
      name: { common: 'Mexico' },
      flags: { png: 'mex.png', svg: 'mex.svg', alt: 'Flag' },
      region: 'Americas',
      population: 130000000,
      capital: ['Mexico City'],
    },
  ];

  const defaultHookValue = {
    countries: mockCountries,
    isLoading: false,
    error: null as string | null,
    searchStr: 'Mex',
    changeSearch: vi.fn(),
    currentPage: 1,
    totalPages: 3,
    setPage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCountries).mockReturnValue(defaultHookValue);
  });

  const renderHomePage = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<HomePage />}>
            <Route
              path=":countryCode"
              element={<div data-testid="outlet-details">Details Rendered</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render search, cards list, and pagination in normal loaded state', () => {
    renderHomePage();

    expect(screen.getByTestId('mock-search')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cards-list')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
    expect(screen.getByText('Mexico')).toBeInTheDocument();
    expect(screen.queryByTestId('error-simulator')).not.toBeInTheDocument();
  });

  it('should hide pagination controls when items are loading or an error occurs', () => {
    vi.mocked(useCountries).mockReturnValue({
      ...defaultHookValue,
      isLoading: true,
      countries: [],
    });

    const { rerender } = renderHomePage();
    expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();

    vi.mocked(useCountries).mockReturnValue({
      ...defaultHookValue,
      error: 'API down',
      countries: [],
    });

    rerender(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
  });

  it('should trigger search handlers when text changes and search action is executed', () => {
    renderHomePage();

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Canada' } });
    expect(defaultHookValue.changeSearch).toHaveBeenCalledWith('Canada');

    const searchBtn = screen.getByRole('button', { name: 'SearchBtn' });
    fireEvent.click(searchBtn);
    expect(defaultHookValue.changeSearch).toHaveBeenCalled();
  });

  it('should render the details panel with active split view modifier when countryCode parameter is in URL', () => {
    renderHomePage('/mex');

    const layoutContainer = screen
      .getByTestId('mock-search')
      .closest('.homeLayout');

    expect(layoutContainer?.className).toContain('splitActive');
    expect(screen.getByTestId('outlet-details')).toBeInTheDocument();
  });

  it('should activate the ErrorSimulator when clicking the error testing boundary button', () => {
    renderHomePage();

    const toggleBtn = screen.getByRole('button', {
      name: /Test Error Boundary/i,
    });

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('error-simulator')).toBeInTheDocument();
    expect(screen.getByText(/Reset Error Simulation/i)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.queryByTestId('error-simulator')).not.toBeInTheDocument();
  });

  it('should trigger mouse entry and leave animation events for styling check', () => {
    renderHomePage();

    const toggleBtn = screen.getByRole('button', {
      name: /Test Error Boundary/i,
    });

    fireEvent.mouseEnter(toggleBtn);
    expect(toggleBtn.style.transform).toBe('scale(1.03)');

    fireEvent.mouseLeave(toggleBtn);
    expect(toggleBtn.style.transform).toBe('scale(1)');
  });

  it('should navigate away from details to root view when clicking inside the left list section', () => {
    render(
      <MemoryRouter initialEntries={['/col']}>
        <Routes>
          <Route path="/" element={<HomePage />}>
            <Route
              path=":countryCode"
              element={<div data-testid="details-panel">Details</div>}
            />
          </Route>
          <Route
            path="/"
            element={<div data-testid="dashboard-root">Root dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const leftPanel = screen.getByTestId('mock-search').closest('.leftSection');
    expect(leftPanel).toBeDefined();

    fireEvent.click(leftPanel!);

    expect(screen.queryByTestId('details-panel')).not.toBeInTheDocument();
  });
});
