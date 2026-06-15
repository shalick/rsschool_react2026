import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CountryDetails } from './CountryDetails';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../components/Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading countries…</div>,
}));

const mockCountryData = {
  data: {
    objects: [
      {
        codes: { alpha_3: 'DEU' },
        names: { common: 'Germany', official: 'Federal Republic of Germany' },
        flag: { url_svg: 'germany.svg', description: 'German flag' },
        capitals: [{ name: 'Berlin' }],
        region: 'Europe',
        population: 83200000,
        subregion: 'Western Europe',
        languages: [{ name: 'German' }],
      },
    ],
    meta: { total: 1, count: 1, limit: 100, offset: 0, more: false },
  },
};

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
    const dataWithoutAlt = {
      data: {
        objects: [
          {
            ...mockCountryData.data.objects[0],
            flag: { url_svg: 'germany.svg', description: undefined },
          },
        ],
        meta: mockCountryData.data.meta,
      },
    };

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
    const incompleteData = {
      data: {
        objects: [
          {
            codes: { alpha_3: 'NAM' },
            names: { common: 'Nameless', official: 'The Nameless State' },
            flag: { url_svg: 'empty.svg', description: undefined },
            capitals: [],
            region: 'Unknown',
            population: 0,
            subregion: undefined,
            languages: undefined,
          },
        ],
        meta: { total: 1, count: 1, limit: 100, offset: 0, more: false },
      },
    };

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
      status: 404,
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
      json: () => Promise.resolve({
        data: { objects: [], meta: { total: 0, count: 0, limit: 100, offset: 0, more: false } },
      }),
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
