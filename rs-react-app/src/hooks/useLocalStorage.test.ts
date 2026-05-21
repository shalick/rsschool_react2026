import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage custom hook', () => {
  const KEY = 'test_key';

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'default_val'));

    expect(result.current[0]).toBe('default_val');
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('should parse and return existing value from localStorage on mount', () => {
    localStorage.setItem(KEY, JSON.stringify('saved_val'));

    const { result } = renderHook(() => useLocalStorage(KEY, 'default_val'));

    expect(result.current[0]).toBe('saved_val');
  });

  it('should write value to localStorage and update state when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));

    act(() => {
      const [, setValue] = result.current;
      setValue('new_value');
    });

    expect(result.current[0]).toBe('new_value');
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify('new_value'));
  });

  it('should support functional updates similar to useState', () => {
    const { result } = renderHook(() => useLocalStorage<number>(KEY, 10));

    act(() => {
      const [, setValue] = result.current;
      setValue((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify(15));
  });

  it('should handle reading errors gracefully and fallback to initialValue', () => {
    localStorage.setItem(KEY, 'invalid-json-{');

    const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));

    expect(result.current[0]).toBe('fallback');
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle writing errors safely if localStorage throws an error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));

    act(() => {
      const [, setValue] = result.current;
      setValue('wont_save');
    });

    expect(result.current[0]).toBe('wont_save');

    expect(console.error).toHaveBeenCalled();
  });
});
export { useLocalStorage };
