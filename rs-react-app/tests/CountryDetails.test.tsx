import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CountryDetails } from '../src/page-components/CountryDetails';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
// useRouter is from src/i18n/navigation — mocked globally in setup.ts

vi.mock('../src/components/Loader/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading countries…</div>,
}));

// Mutable params/searchParams so individual tests can override them
const mockParams: Record<string, string> = { countryCode: 'deu' };
let mockSearchParamsStr = '';

// Only useParams and useSearchParams still come from next/navigation in CountryDetails
vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
  useSearchParams: () => new URLSearchParams(mockSearchParamsStr),
}));

const mockCountryData = [
  {
    name: { common: 'Germany', official: 'Federal Republic of Germany' },
    flags: { svg: 'germany.svg', alt: 'German flag' },
    subregion: 'Western Europe',
    languages: { deu: 'German' },
  },
];

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderDetails = (client = createQueryClient()) =>
  render(
    <QueryClientProvider client={client}>
      <CountryDetails />
    </QueryClientProvider>
  );

describe('CountryDetails Component', () => {
  let mockPush: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockParams.countryCode = 'deu';
    mockSearchParamsStr = '';
    // Get push from the global navigation mock
    const nav = await import('../src/i18n/navigation');
    mockPush = (nav.useRouter as ReturnType<typeof vi.fn>)().push;
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display loading indicator while fetching country details', async () => {
    vi.mocked(fetch).mockReturnValue(
      new Promise((resolve) =>
        setTimeout(() => resolve({ ok: true, json: () => Promise.resolve(mockCountryData) } as Response), 50)
      )
    );
    renderDetails();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
  });

  it('should successfully render detailed country information from API', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCountryData),
    } as Response);
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Federal Republic of Germany')).toBeInTheDocument();
    });
    expect(screen.getByText('Western Europe')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
    expect(screen.getByAltText('German flag')).toHaveAttribute('src', 'germany.svg');
  });

  it('should use fallback alt text for flag image if flags.alt is missing', async () => {
    const dataWithoutAlt = [{ ...mockCountryData[0], flags: { svg: 'germany.svg', alt: undefined } }];
    vi.mocked(fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve(dataWithoutAlt),
    } as Response);
    renderDetails();
    await waitFor(() => {
      expect(screen.getByAltText('Flag of Germany')).toBeInTheDocument();
    });
  });

  it('should fallback to "N/A" for missing optional fields like subregion or languages', async () => {
    const incompleteData = [{
      name: { common: 'Nameless', official: 'The Nameless State' },
      flags: { svg: 'empty.svg' },
      subregion: undefined,
      languages: undefined,
    }];
    vi.mocked(fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve(incompleteData),
    } as Response);
    mockParams.countryCode = 'unknown';
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('The Nameless State')).toBeInTheDocument();
    });
    expect(screen.getAllByText('N/A')).toHaveLength(2);
  });

  it('should render an inline error state if API returns not ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    mockParams.countryCode = 'wrong-code';
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Country details could not be loaded')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Return to country list' })).toBeInTheDocument();
  });

  it('should render an inline error state if API returns an empty data array', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve([]),
    } as Response);
    mockParams.countryCode = 'empty';
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Country details could not be loaded')).toBeInTheDocument();
    });
  });

  it('should successfully render country details when the code is uppercase', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve(mockCountryData),
    } as Response);
    mockParams.countryCode = 'MEX';
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Federal Republic of Germany')).toBeInTheDocument();
    });
  });

  it('should navigate back to home when the close button is clicked', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve(mockCountryData),
    } as Response);
    mockSearchParamsStr = 'search=abc&page=2';
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Federal Republic of Germany')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: '✕ Close' }));
    expect(mockPush).toHaveBeenCalledWith('/?search=abc&page=2');
  });
});
