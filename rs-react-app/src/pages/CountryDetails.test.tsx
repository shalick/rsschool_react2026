import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

  const renderWithRouter = (code = 'deu') => {
    return render(
      <MemoryRouter initialEntries={[`/countries/${code}`]}>
        <Routes>
          <Route path="/countries/:countryCode" element={<CountryDetails />} />
          <Route
            path="/page-not-found"
            element={<div>404 Page Not Found</div>}
          />
        </Routes>
      </MemoryRouter>
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

  it('should redirect to 404 page if API returns not ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    renderWithRouter('wrong-code');

    await waitFor(() => {
      expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('should redirect to 404 page if API returns an empty data array', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    renderWithRouter('empty');

    await waitFor(() => {
      expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
    });
  });

  it('should navigate back to home screen when the close button is clicked', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCountryData),
    } as Response);

    render(
      <MemoryRouter initialEntries={['/countries/deu?search=abc&page=2']}>
        <Routes>
          <Route path="/countries/:countryCode" element={<CountryDetails />} />
          <Route
            path="/"
            element={<div>Returned to Main List Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
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
});
