import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const ThemeConsumer = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('ThemeProvider', () => {
    it('should initialize theme from localStorage if exists', () => {
      localStorageMock.getItem.mockReturnValueOnce('"dark"');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      // initialization should respect stored value (no extra write required)
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should fallback to system preference when no saved theme', () => {
      mockMatchMedia(true);
      localStorageMock.getItem.mockReturnValueOnce(null);
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should fallback to light when no saved theme and system does not prefer dark', () => {
      mockMatchMedia(false);
      localStorageMock.getItem.mockReturnValueOnce(null);
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme').textContent).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should update localStorage and data-theme when theme toggles', () => {
      localStorageMock.getItem.mockReturnValueOnce('light');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      const toggleButton = screen.getByText('Toggle');
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
        'theme',
        '"dark"'
      );
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('useTheme', () => {
    it('should throw error when used outside ThemeProvider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(() => render(<ThemeConsumer />)).toThrow(
        'useTheme must be used within ThemeProvider'
      );
      consoleError.mockRestore();
    });

    it('should return context when used inside ThemeProvider', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme')).toBeInTheDocument();
    });
  });
});
