import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCountries } from './useCountries';
import { fetchAllCountries, fetchCountriesByName } from '../api/countriesApi';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

vi.mock('../api/countriesApi', () => ({
  fetchAllCountries: vi.fn(),
  fetchCountriesByName: vi.fn(),
}));

const mockCountriesList = Array.from({ length: 15 }, (_, i) => ({
  cca3: `C${i}`,
  name: { common: `Country ${i}` },
  flags: { png: '', svg: '' },
  region: 'Europe',
  population: 100000,
}));

describe('useCountries custom hook', () => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <MemoryRouter initialEntries={['/?page=1']}>{children}</MemoryRouter>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully fetch all countries on mount', async () => {
    vi.mocked(fetchAllCountries).mockResolvedValue(mockCountriesList);

    const { result } = renderHook(() => useCountries(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.countries.length).toBe(12);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors on mount gracefully', async () => {
    vi.mocked(fetchAllCountries).mockRejectedValue(new Error('Network Fail'));

    const { result } = renderHook(() => useCountries(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network Fail');
    expect(result.current.countries).toEqual([]);
  });

  it('should trigger search filter and reset page to 1 when changeSearch is called', async () => {
    vi.mocked(fetchAllCountries).mockResolvedValue(mockCountriesList);
    vi.mocked(fetchCountriesByName).mockResolvedValue([mockCountriesList[0]]);

    const { result } = renderHook(() => useCountries(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.changeSearch('Country 0');
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.searchStr).toBe('Country 0');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.countries.length).toBe(1);
    expect(result.current.countries[0].name.common).toBe('Country 0');
  });

  it('should clear search results and reset error if search string becomes empty', async () => {
    vi.mocked(fetchAllCountries).mockResolvedValue(mockCountriesList);

    const { result } = renderHook(() => useCountries(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.changeSearch('');
    });

    expect(result.current.countries.length).toBe(12);
    expect(result.current.error).toBeNull();
  });

  it('should handle search errors and clear results array', async () => {
    vi.mocked(fetchAllCountries).mockResolvedValue(mockCountriesList);
    vi.mocked(fetchCountriesByName).mockRejectedValue(
      new Error('Search Error')
    );

    const { result } = renderHook(() => useCountries(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.changeSearch('UnknownCountry');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Search Error');
    expect(result.current.countries).toEqual([]);
  });

  it('should slice items according to currentPage when setPage is invoked', async () => {
    vi.mocked(fetchAllCountries).mockResolvedValue(mockCountriesList);

    const { result } = renderHook(() => useCountries(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.countries.length).toBe(3);
  });
});
