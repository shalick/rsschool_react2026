import { render, screen, fireEvent } from '@testing-library/react';
import { Search } from './Search';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./Search.module.css', () => ({
  default: {
    searchBox: 'searchBox',
    search: 'search',
    searchLabel: 'searchLabel',
    searchButton: 'searchButton',
  },
}));

describe('Search', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with correct placeholder, value, and autoFocus', () => {
    render(
      <Search
        searchStr="Germany"
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByPlaceholderText('Search for a country…');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Germany');
    expect(document.activeElement).toBe(input);
  });

  it('renders label with correct text and htmlFor', () => {
    render(
      <Search
        searchStr=""
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
      />
    );
    const label = screen.getByText('Search');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'search');
  });

  it('renders search button with aria-label and emoji', () => {
    render(
      <Search
        searchStr=""
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
      />
    );
    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('🔍');
  });

  it('calls onSearchChange when input value changes', () => {
    render(
      <Search
        searchStr=""
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByPlaceholderText('Search for a country…');
    fireEvent.change(input, { target: { value: 'France' } });

    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    expect(mockOnSearchChange).toHaveBeenCalledWith('France');
  });

  it('calls onSearch with trimmed value when button is clicked', () => {
    render(
      <Search
        searchStr="  Germany  "
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
      />
    );

    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('Germany');
  });

  it('focuses the input after button click', () => {
    render(
      <Search
        searchStr="test"
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
      />
    );

    const input = screen.getByPlaceholderText('Search for a country…');
    const button = screen.getByRole('button', { name: /search/i });

    input.blur();
    expect(document.activeElement).not.toBe(input);

    fireEvent.click(button);
    expect(document.activeElement).toBe(input);
  });

  it('handles empty string trimming (calls onSearch with empty)', () => {
    render(
      <Search
        searchStr="   "
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
      />
    );

    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('');
  });
});
