import { render, screen, fireEvent } from '@testing-library/react';
import { CountryCard } from './CountryCard';
import { useSelectionStore } from '../../store/useSelectionStore';
import { queryClient } from '../../query/queryClient';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./CountryCard.module.css', () => ({
  default: {
    country: 'country',
    flagWrapper: 'flagWrapper',
    flag: 'flag',
    countryInfo: 'countryInfo',
    details: 'details',
    checkboxContainer: 'checkboxContainer',
  },
}));

vi.mock('../../store/useSelectionStore', () => ({
  useSelectionStore: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
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

  let mockPush: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSelectedIds.clear();
    mockUseSelectionStore.mockReturnValue({
      selectedIds: mockSelectedIds,
      toggleSelection: mockToggleSelection,
    });
    const nav = await import('../../i18n/navigation');
    mockPush = (nav.useRouter as ReturnType<typeof vi.fn>)().push;
    mockPush.mockClear();
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
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to details page when card (outside checkbox) is clicked', () => {
    render(<CountryCard {...mockCountry} currentSearch="?page=2" />);
    const card = screen.getByRole('listitem');
    fireEvent.click(card);
    expect(mockPush).toHaveBeenCalledWith('/deu?page=2');
    expect(mockToggleSelection).not.toHaveBeenCalled();
  });

  it('prefetches country details when the card is hovered', () => {
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery');
    render(<CountryCard {...mockCountry} />);
    const card = screen.getByRole('listitem');
    fireEvent.mouseEnter(card);
    expect(prefetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['country', 'deu'],
        queryFn: expect.any(Function),
      })
    );
  });

  it('prevents navigation when checkbox is clicked (stopPropagation works)', () => {
    render(<CountryCard {...mockCountry} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockToggleSelection).toHaveBeenCalledWith('DEU');
  });
});
