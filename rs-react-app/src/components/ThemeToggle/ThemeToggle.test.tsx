import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./ThemeToggle.module.css', () => ({
  default: {
    toggle: 'toggle',
  },
}));

vi.mock('../../context/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeToggle', () => {
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "🌙 Dark" when theme is light', () => {
    (useTheme as any).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🌙 Dark');
    expect(button).toHaveClass('toggle');
  });

  it('renders "☀️ Light" when theme is dark', () => {
    (useTheme as any).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('☀️ Light');
    expect(button).toHaveClass('toggle');
  });

  it('calls toggleTheme when button is clicked', () => {
    (useTheme as any).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
