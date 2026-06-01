import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CountryCard } from './CountryCard';
import { useSelectionStore } from '../../store/useSelectionStore';
import { queryClient } from '../../query/queryClient';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./CountryCard.module.css', () => ({
  default: {
    country: 'country',
    flag: 'flag',
    countryInfo: 'countryInfo',
    details: 'details',
    checkboxContainer: 'checkboxContainer',
  },
}));

vi.mock('../../store/useSelectionStore', () => ({
  useSelectionStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders country name, flag, population, region, and capital', () => {
    renderWithRouter(<CountryCard {...mockCountry} />);
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
    renderWithRouter(<CountryCard {...countryWithoutAlt} />);
    expect(screen.getByAltText('Flag of Germany')).toBeInTheDocument();
  });

  it('renders correctly when capital array is empty', () => {
    const countryEmptyCapital = { ...mockCountry, capital: [] };
    renderWithRouter(<CountryCard {...countryEmptyCapital} />);
    expect(screen.queryByText('Berlin')).not.toBeInTheDocument();
    expect(screen.getByText(/Capital:/)).toBeInTheDocument();
  });

  it('renders "N/A" for capital when capital is undefined', () => {
    const countryUndefinedCapital = { ...mockCountry, capital: undefined };
    renderWithRouter(<CountryCard {...countryUndefinedCapital} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('formats large population correctly based on current locale', () => {
    const countryLargePop = { ...mockCountry, population: 1234567890 };
    renderWithRouter(<CountryCard {...countryLargePop} />);
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
    renderWithRouter(<CountryCard {...mockCountry} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('toggles selection when checkbox is clicked', () => {
    renderWithRouter(<CountryCard {...mockCountry} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockToggleSelection).toHaveBeenCalledWith('DEU');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to details page when card (outside checkbox) is clicked', () => {
    renderWithRouter(<CountryCard {...mockCountry} currentSearch="?page=2" />);
    const card = screen.getByRole('listitem');
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith('/deu?page=2');
    expect(mockToggleSelection).not.toHaveBeenCalled();
  });

  it('prefetches country details when the card is focused or hovered', () => {
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery');
    renderWithRouter(<CountryCard {...mockCountry} />);
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
    renderWithRouter(<CountryCard {...mockCountry} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToggleSelection).toHaveBeenCalledWith('DEU');
  });
});
