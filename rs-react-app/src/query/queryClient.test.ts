import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseCacheTtlMs } from './queryClient';

describe('queryClient utilities', () => {
  const originalValue = import.meta.env.VITE_QUERY_CACHE_TTL_MS;

  beforeEach(() => {
    import.meta.env.VITE_QUERY_CACHE_TTL_MS = originalValue;
  });

  afterEach(() => {
    import.meta.env.VITE_QUERY_CACHE_TTL_MS = originalValue;
    vi.restoreAllMocks();
  });

  it('parses valid positive duration from environment variable', () => {
    import.meta.env.VITE_QUERY_CACHE_TTL_MS = '120000';

    expect(parseCacheTtlMs()).toBe(120000);
  });

  it('falls back to default value when the env value is missing', () => {
    import.meta.env.VITE_QUERY_CACHE_TTL_MS = undefined;

    expect(parseCacheTtlMs()).toBe(300_000);
  });

  it('falls back to default when the env value is not a number', () => {
    import.meta.env.VITE_QUERY_CACHE_TTL_MS = 'not-a-number';

    expect(parseCacheTtlMs()).toBe(300_000);
  });

  it('falls back to default when the env value is zero or negative', () => {
    import.meta.env.VITE_QUERY_CACHE_TTL_MS = '0';
    expect(parseCacheTtlMs()).toBe(300_000);

    import.meta.env.VITE_QUERY_CACHE_TTL_MS = '-100';
    expect(parseCacheTtlMs()).toBe(300_000);
  });
});
