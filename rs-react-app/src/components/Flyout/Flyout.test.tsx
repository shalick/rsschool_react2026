import { render, screen, fireEvent } from '@testing-library/react';
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
    mockUseSelectionStore.mockReturnValue({
      selectedIds: new Set(),
      clearSelections: mockClearSelections,
    });
    mockUseCountriesStore.mockReturnValue({
      countries: mockCountries,
    });
    const { container } = render(<Flyout />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the flyout when at least one item is selected', () => {
    mockUseSelectionStore.mockReturnValue({
      selectedIds: new Set(['DEU']),
      clearSelections: mockClearSelections,
    });
    mockUseCountriesStore.mockReturnValue({
      countries: mockCountries,
    });
    render(<Flyout />);
    expect(screen.getByText(/Selected: 1 country/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Unselect all/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Download/i })
    ).toBeInTheDocument();
  });

  it('displays correct pluralization for multiple selected items', () => {
    mockUseSelectionStore.mockReturnValue({
      selectedIds: new Set(['DEU', 'FRA']),
      clearSelections: mockClearSelections,
    });
    mockUseCountriesStore.mockReturnValue({
      countries: mockCountries,
    });
    const { container } = render(<Flyout />);
    const countSpan = container.querySelector('.count');
    expect(countSpan).toBeInTheDocument();
    const normalizedText = countSpan?.textContent?.replace(/\s+/g, ' ').trim();
    expect(normalizedText).toBe('Selected: 2 countrys');
  });

  it('calls clearSelections when "Unselect all" button is clicked', () => {
    mockUseSelectionStore.mockReturnValue({
      selectedIds: new Set(['DEU']),
      clearSelections: mockClearSelections,
    });
    mockUseCountriesStore.mockReturnValue({
      countries: mockCountries,
    });
    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Unselect all/i }));
    expect(mockClearSelections).toHaveBeenCalledTimes(1);
  });

  it('generates and downloads CSV file when "Download" button is clicked', async () => {
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL');
    const mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
    mockCreateObjectURL.mockReturnValue('blob:mock-url');

    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    mockUseSelectionStore.mockReturnValue({
      selectedIds: new Set(['DEU', 'FRA']),
      clearSelections: mockClearSelections,
    });
    mockUseCountriesStore.mockReturnValue({
      countries: mockCountries,
    });

    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    const csvText = await blob.text();
    const lines = csvText.split('\n');

    const expectedLines = [
      'Name,Official Name,Region,Subregion,Capital,Population,Flag URL (SVG),Flag Alt Text,Details URL',
      'Germany,Federal Republic of Germany,Europe,Western Europe,Berlin,83200000,de.svg,Flag of Germany,/deu',
      'France,French Republic,Europe,Western Europe,Paris,67390000,fr.svg,Flag of France,/fra',
    ];
    expect(lines[0]).toBe(expectedLines[0]);
    expect(lines[1]).toBe(expectedLines[1]);
    expect(lines[2]).toBe(expectedLines[2]);

    expect(anchorClickSpy).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    anchorClickSpy.mockRestore();
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
  });

  it('handles CSV escaping correctly when fields contain commas or quotes', async () => {
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL');
    const mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
    mockCreateObjectURL.mockReturnValue('blob:mock-url');

    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    const countryWithComma = {
      ...mockCountries[0],
      name: { common: 'Berlin, Germany', official: 'Berlin, Germany' },
      capital: ['Berlin, capital'],
    };
    mockUseSelectionStore.mockReturnValue({
      selectedIds: new Set(['DEU']),
      clearSelections: mockClearSelections,
    });
    mockUseCountriesStore.mockReturnValue({
      countries: [countryWithComma],
    });

    render(<Flyout />);
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));

    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    const csvText = await blob.text();
    expect(csvText).toContain('"Berlin, Germany"');
    expect(csvText).toContain('"Berlin, capital"');
    expect(anchorClickSpy).toHaveBeenCalled();

    anchorClickSpy.mockRestore();
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
  });
});
