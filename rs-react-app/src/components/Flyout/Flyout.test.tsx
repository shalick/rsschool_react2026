import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Flyout } from './Flyout';
import { useSelectionStore } from '../../store/useSelectionStore';
import { useCountriesStore } from '../../store/useCountriesStore';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./Flyout.module.css', () => ({
  default: {
    flyout: 'flyout',
    content: 'content',
    count: 'count',
    buttons: 'buttons',
    unselectBtn: 'unselectBtn',
    downloadBtn: 'downloadBtn',
  },
}));

vi.mock('../../store/useSelectionStore', () => ({
  useSelectionStore: vi.fn(),
}));

vi.mock('../../store/useCountriesStore', () => ({
  useCountriesStore: vi.fn(),
}));

vi.mock('../../actions/generateCsv', () => ({
  generateCsvAction: async (_prev: unknown, formData: FormData) => {
    const raw = formData.get('countries');
    if (!raw || typeof raw !== 'string') return { csv: null, error: 'No countries' };

    const countries = JSON.parse(raw) as Array<{
      cca3: string;
      name: { common: string; official?: string };
      region: string;
      subregion?: string;
      capital?: string[];
      population: number;
      flags: { svg: string; alt?: string };
    }>;

    const escapeCell = (cell: string | number) => {
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Name', 'Official Name', 'Region', 'Subregion', 'Capital',
      'Population', 'Flag URL (SVG)', 'Flag Alt Text', 'Details URL',
    ];
    const rows = countries.map((c) => [
      c.name.common, c.name.official || '', c.region, c.subregion || '',
      c.capital ? c.capital.join(', ') : 'N/A', c.population, c.flags.svg,
      c.flags.alt || `Flag of ${c.name.common}`, `/${c.cca3.toLowerCase()}`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n');
    return { csv, error: null };
  },
}));

describe('Flyout', () => {
  const mockClearSelections = vi.fn();
  const mockCountries = [
    {
      cca3: 'DEU',
      name: { common: 'Germany', official: 'Federal Republic of Germany' },
      flags: { svg: 'de.svg', alt: 'Flag of Germany' },
      region: 'Europe',
      subregion: 'Western Europe',
      capital: ['Berlin'],
      population: 83200000,
    },
    {
      cca3: 'FRA',
      name: { common: 'France', official: 'French Republic' },
      flags: { svg: 'fr.svg', alt: 'Flag of France' },
      region: 'Europe',
      subregion: 'Western Europe',
      capital: ['Paris'],
      population: 67390000,
    },
  ];

  const mockUseSelectionStore = vi.mocked(useSelectionStore);
  const mockUseCountriesStore = vi.mocked(useCountriesStore);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('returns null when no items are selected', () => {
    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: mockCountries });
    const { container } = render(<Flyout />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the flyout when at least one item is selected', () => {
    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: mockCountries });
    render(<Flyout />);
    expect(screen.getByText(/Selected: 1 country/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unselect all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
  });

  it('displays correct pluralization for multiple selected items', () => {
    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU', 'FRA']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: mockCountries });
    const { container } = render(<Flyout />);
    const countSpan = container.querySelector('.count');
    expect(countSpan).toBeInTheDocument();
    const normalizedText = countSpan?.textContent?.replace(/\s+/g, ' ').trim();
    expect(normalizedText).toBe('Selected: 2 countries');
  });

  it('calls clearSelections when "Unselect all" button is clicked', () => {
    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: mockCountries });
    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Unselect all/i }));
    expect(mockClearSelections).toHaveBeenCalledTimes(1);
  });

  it('generates and downloads CSV file when "Download" button is clicked', async () => {
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU', 'FRA']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: mockCountries });

    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));

    await waitFor(() => expect(mockCreateObjectURL).toHaveBeenCalledTimes(1));

    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    const csvText = await blob.text();
    const lines = csvText.split('\n');

    expect(lines[0]).toBe('Name,Official Name,Region,Subregion,Capital,Population,Flag URL (SVG),Flag Alt Text,Details URL');
    expect(lines[1]).toBe('Germany,Federal Republic of Germany,Europe,Western Europe,Berlin,83200000,de.svg,Flag of Germany,/deu');
    expect(lines[2]).toBe('France,French Republic,Europe,Western Europe,Paris,67390000,fr.svg,Flag of France,/fra');
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('handles CSV escaping correctly when fields contain commas or quotes', async () => {
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const countryWithComma = {
      ...mockCountries[0],
      name: { common: 'Berlin, Germany', official: 'Berlin, Germany' },
      capital: ['Berlin, capital'],
    };
    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: [countryWithComma] });

    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));

    await waitFor(() => expect(mockCreateObjectURL).toHaveBeenCalledTimes(1));
    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    const csvText = await blob.text();
    expect(csvText).toContain('"Berlin, Germany"');
    expect(csvText).toContain('"Berlin, capital"');
  });

  it('generates unquoted CSV rows when no escaping is needed', async () => {
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: [mockCountries[0]] });

    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));

    await waitFor(() => expect(mockCreateObjectURL).toHaveBeenCalledTimes(1));
    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    const csvText = await blob.text();
    const csvRow = csvText.split('\n')[1];
    expect(csvRow).toBe('Germany,Federal Republic of Germany,Europe,Western Europe,Berlin,83200000,de.svg,Flag of Germany,/deu');
  });

  it('escapes newline characters in CSV fields correctly', async () => {
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const countryWithNewline = { ...mockCountries[0], capital: ['Line1\nLine2'] };
    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: [countryWithNewline] });

    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));

    await waitFor(() => expect(mockCreateObjectURL).toHaveBeenCalledTimes(1));
    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    const csvText = await blob.text();
    expect(csvText).toContain('"Line1\nLine2"');
  });

  it('filters out unselected countries when downloading CSV', async () => {
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: mockCountries });

    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));

    await waitFor(() => expect(mockCreateObjectURL).toHaveBeenCalledTimes(1));
    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    const csvText = await blob.text();
    expect(csvText).toContain('/deu');
    expect(csvText).not.toContain('/fra');
  });

  it('falls back to alt text and N/A for missing fields in CSV output', async () => {
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const countryWithoutAltOrCapital = {
      ...mockCountries[0],
      flags: { svg: 'de.svg', alt: undefined },
      capital: undefined,
    };
    mockUseSelectionStore.mockReturnValue({ selectedIds: new Set(['DEU']), clearSelections: mockClearSelections });
    mockUseCountriesStore.mockReturnValue({ countries: [countryWithoutAltOrCapital] });

    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));

    await waitFor(() => expect(mockCreateObjectURL).toHaveBeenCalledTimes(1));
    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    const csvText = await blob.text();
    expect(csvText).toContain('Flag of Germany');
    expect(csvText).toContain(',N/A,');
  });
});
