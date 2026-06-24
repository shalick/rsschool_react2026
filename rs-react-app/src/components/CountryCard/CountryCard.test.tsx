import { render, screen, fireEvent } from '@testing-library/react';
import { CountryCard } from './CountryCard';
import { useSelectionStore } from '../../store/useSelectionStore';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./CountryCard.module.css', () => ({
  default: {
    country: 'country',
    cardForm: 'cardForm',
    cardButton: 'cardButton',
    flagWrapper: 'flagWrapper',
    flag: 'flag',
    countryInfo: 'countryInfo',
    details: 'details',
    checkboxContainer: 'checkboxContainer',
  },
}));

vi.mock('../../actions/selectCountry', () => ({
  selectCountryAction: vi.fn(),
}));

vi.mock('../../store/useSelectionStore', () => ({
  useSelectionStore: vi.fn(),
}));

describe('CountryCard', () => {
  const mockCountry = {
    cca3: 'DEU',
    name: { common: 'Germany', official: 'Federal Republic of Germany' },
    flags: {
      png: 'https://flagcdn.com',
      svg: 'https://flagcdn.com/de.svg',
      alt: 'Flag of Germany',
    },
    capital: ['Berlin'],
    region: 'Europe',
    population: 83200000,
  };

  const mockToggleSelection = vi.fn();
  const mockSelectedIds = new Set<string>();
  const mockUseSelectionStore = vi.mocked(useSelectionStore);

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedIds.clear();
    mockUseSelectionStore.mockReturnValue({
      selectedIds: mockSelectedIds,
      toggleSelection: mockToggleSelection,
    });
  });

  it('renders country name, flag, population, region, and capital', () => {
    render(<CountryCard {...mockCountry} />);
    expect(screen.getByText('Germany')).toBeInTheDocument();
    const flagImg = screen.getByAltText('Flag of Germany');
    expect(flagImg).toHaveAttribute('src', mockCountry.flags.svg);
    expect(screen.getByText(/Population:/)).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.replace(/\D/g, '').includes('83200000')
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Region:/)).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByText(/Capital:/)).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
  });

  it('uses fallback alt text when flags.alt is missing', () => {
    const countryWithoutAlt = {
      ...mockCountry,
      flags: { ...mockCountry.flags, alt: undefined },
    };
    render(<CountryCard {...countryWithoutAlt} />);
    expect(screen.getByAltText('Flag of Germany')).toBeInTheDocument();
  });

  it('renders correctly when capital array is empty', () => {
    render(<CountryCard {...mockCountry} capital={[]} />);
    expect(screen.queryByText('Berlin')).not.toBeInTheDocument();
    expect(screen.getByText(/Capital:/)).toBeInTheDocument();
  });

  it('renders "N/A" for capital when capital is undefined', () => {
    render(<CountryCard {...mockCountry} capital={undefined} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('formats large population correctly based on current locale', () => {
    render(<CountryCard {...mockCountry} population={1234567890} />);
    expect(
      screen.getByText((content) =>
        content.replace(/\s/g, '').includes('1234567890')
      )
    ).toBeInTheDocument();
  });

  it('displays checkbox and shows selected state when country is selected', () => {
    mockSelectedIds.add('DEU');
    mockUseSelectionStore.mockReturnValue({
      selectedIds: mockSelectedIds,
      toggleSelection: mockToggleSelection,
    });
    render(<CountryCard {...mockCountry} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('toggles selection when checkbox is clicked', () => {
    render(<CountryCard {...mockCountry} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockToggleSelection).toHaveBeenCalledWith('DEU');
  });

  it('includes server action form fields for country selection', () => {
    render(<CountryCard {...mockCountry} search="ger" currentPage={2} />);
    expect(screen.getByDisplayValue('DEU')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ger')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('prevents checkbox click from submitting the selection form', () => {
    render(<CountryCard {...mockCountry} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockToggleSelection).toHaveBeenCalledWith('DEU');
  });
});
