import { render, screen } from '@testing-library/react';
import { SearchFormClient } from './SearchFormClient';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./Search.module.css', () => ({
  default: {
    searchBox: 'searchBox',
    search: 'search',
    searchLabel: 'searchLabel',
    searchButton: 'searchButton',
  },
}));

vi.mock('../../actions/searchCountries', () => ({
  searchCountriesAction: vi.fn(),
}));

describe('SearchFormClient', () => {
  it('renders search input with default value', () => {
    render(<SearchFormClient search="Germany" />);
    expect(screen.getByDisplayValue('Germany')).toBeInTheDocument();
  });

  it('submits through a server action form', () => {
    render(<SearchFormClient search="" activeCountryCode="deu" />);
    const form = screen.getByDisplayValue('').closest('form');
    expect(form).toBeInTheDocument();
    expect(screen.getByDisplayValue('deu')).toBeInTheDocument();
  });

  it('renders submit button with search label', () => {
    render(<SearchFormClient search="" />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });
});
