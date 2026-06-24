import { buildQueryString } from '../lib/searchParams';
import { describe, expect, it } from 'vitest';

describe('searchCountriesAction query building', () => {
  it('builds redirect path for a new search on the home page', () => {
    expect(buildQueryString('germany', 1)).toBe('?search=germany');
  });

  it('builds redirect path preserving pagination reset to page 1', () => {
    expect(buildQueryString('', 1)).toBe('');
  });
});

describe('selectCountryAction query building', () => {
  it('builds redirect path with search and page params', () => {
    expect(`/deu${buildQueryString('fra', 2)}`).toBe('/deu?search=fra&page=2');
  });
});
