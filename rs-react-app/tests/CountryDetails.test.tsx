import { render, screen } from '@testing-library/react';
import { CountryDetailsServer } from '../src/components/CountryDetailsServer/CountryDetailsServer';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => {
    const messages: Record<string, string> = {
      notFound: 'Country details could not be loaded',
      notFoundDesc: 'The requested country could not be found.',
      returnToList: 'Return to country list',
      refresh: 'Refresh',
      close: '✕ Close',
      subregion: 'Subregion',
      languages: 'Languages',
    };
    return messages[key] ?? key;
  }),
}));

const mockCountry = {
  name: { common: 'Germany', official: 'Federal Republic of Germany' },
  flags: { svg: 'germany.svg', alt: 'German flag' },
  subregion: 'Western Europe',
  languages: { deu: 'German' },
};

describe('CountryDetailsServer', () => {
  it('renders detailed country information from server-provided data', async () => {
    const ui = await CountryDetailsServer({
      countryCode: 'deu',
      country: mockCountry,
      countryError: null,
      queryString: '',
    });
    render(ui);

    expect(screen.getByText('Federal Republic of Germany')).toBeInTheDocument();
    expect(screen.getByText('Western Europe')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
    expect(screen.getByAltText('German flag')).toHaveAttribute('src', 'germany.svg');
  });

  it('uses fallback alt text for flag image if flags.alt is missing', async () => {
    const ui = await CountryDetailsServer({
      countryCode: 'deu',
      country: {
        ...mockCountry,
        flags: { svg: 'germany.svg' },
      },
      countryError: null,
      queryString: '',
    });
    render(ui);
    expect(screen.getByAltText('Flag of Germany')).toBeInTheDocument();
  });

  it('falls back to N/A for missing optional fields', async () => {
    const ui = await CountryDetailsServer({
      countryCode: 'unknown',
      country: {
        name: { common: 'Nameless', official: 'The Nameless State' },
        flags: { svg: 'empty.svg' },
      },
      countryError: null,
      queryString: '',
    });
    render(ui);
    expect(screen.getByText('The Nameless State')).toBeInTheDocument();
    expect(screen.getAllByText('N/A')).toHaveLength(2);
  });

  it('renders an inline error state when server fetch failed', async () => {
    const ui = await CountryDetailsServer({
      countryCode: 'wrong-code',
      country: null,
      countryError: 'Country not found in API',
      queryString: '',
    });
    render(ui);
    expect(screen.getByText('Country details could not be loaded')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return to country list' })).toBeInTheDocument();
  });

  it('includes server action forms for close and refresh', async () => {
    const ui = await CountryDetailsServer({
      countryCode: 'deu',
      country: mockCountry,
      countryError: null,
      queryString: '?search=abc&page=2',
    });
    render(ui);
    expect(screen.getByDisplayValue('deu')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('?search=abc&page=2')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});
