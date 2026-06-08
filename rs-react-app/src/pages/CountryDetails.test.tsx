import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CountryDetails } from './CountryDetails';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../components/Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading countries…</div>,
}));

const mockCountryData = [
  {
    name: { common: 'Germany', official: 'Federal Republic of Germany' },
    flags: { svg: 'germany.svg', alt: 'German flag' },
    subregion: 'Western Europe',
    languages: { deu: 'German' },
  },
];

describe('CountryDetails Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

  const renderWithRouter = (code = 'deu') => {
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={[`/countries/${code}`]}>
          <Routes>
            <Route
              path="/countries/:countryCode"
              element={<CountryDetails />}
            />
            <Route
              path="/page-not-found"
              element={<div>404 Page Not Found</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should display loading indicator while fetching country details', async () => {
    vi.mocked(fetch).mockReturnValue(
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: () => Promise.resolve(mockCountryData),
            } as Response),
          50
        )
      )
    );

    renderWithRouter();

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
    );
  });

  it('should successfully render detailed country information from API', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCountryData),
    } as Response);

    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText('Federal Republic of Germany')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Western Europe')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();

    const flagImg = screen.getByAltText('German flag');
    expect(flagImg).toHaveAttribute('src', 'germany.svg');
  });

  it('should use fallback alt text for flag image if flags.alt is missing', async () => {
    const dataWithoutAlt = [
      {
        ...mockCountryData[0],
        flags: { svg: 'germany.svg', alt: undefined },
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dataWithoutAlt),
    } as Response);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByAltText('Flag of Germany')).toBeInTheDocument();
    });
  });

  it('should fallback to "N/A" for missing optional fields like subregion or languages', async () => {
    const incompleteData = [
      {
        name: { common: 'Nameless', official: 'The Nameless State' },
        flags: { svg: 'empty.svg' },
        subregion: undefined,
        languages: undefined,
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(incompleteData),
    } as Response);

    renderWithRouter('unknown');

    await waitFor(() => {
      expect(screen.getByText('The Nameless State')).toBeInTheDocument();
    });

    const naElements = screen.getAllByText('N/A');
    expect(naElements.length).toBe(2);
  });

  it('should render an inline error state if API returns not ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    renderWithRouter('wrong-code');

    await waitFor(() => {
      expect(
        screen.getByText('Country details could not be loaded')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: 'Return to country list' })
    ).toBeInTheDocument();
  });

  it('should render an inline error state if API returns an empty data array', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    renderWithRouter('empty');

    await waitFor(() => {
      expect(
        screen.getByText('Country details could not be loaded')
      ).toBeInTheDocument();
    });
  });

  it('should successfully render country details when the code is uppercase', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCountryData),
    } as Response);

    renderWithRouter('MEX');

    await waitFor(() => {
      expect(
        screen.getByText('Federal Republic of Germany')
      ).toBeInTheDocument();
    });
  });

  it('should navigate back to home screen when the close button is clicked', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCountryData),
    } as Response);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={['/countries/deu?search=abc&page=2']}>
          <Routes>
            <Route
              path="/countries/:countryCode"
              element={<CountryDetails />}
            />
            <Route
              path="/"
              element={<div>Returned to Main List Dashboard</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Federal Republic of Germany')
      ).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: '✕ Close' });
    fireEvent.click(closeButton);

    expect(
      screen.getByText('Returned to Main List Dashboard')
    ).toBeInTheDocument();
  });

  it('should refetch the country details when refresh is clicked', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCountryData),
    } as Response);

    renderWithRouter('deu');

    await waitFor(() => {
      expect(screen.getByText('Federal Republic of Germany')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('should display an error message when the country API request fails due to network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));

    renderWithRouter('deu');

    await waitFor(() => {
      expect(
        screen.getByText('Country details could not be loaded')
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/Unable to connect to the server/i)).toBeInTheDocument();
  });
});
