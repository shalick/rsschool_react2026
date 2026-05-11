import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ProblemChild = () => {
  throw new Error('Test error');
};

const NormalChild = () => <div>Normal content</div>;

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <NormalChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument();
  });

  it('renders fallback UI when a child component throws an error', () => {
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText(/Please try again later/i)).toBeInTheDocument();

    console.error = originalError;
  });

  it('calls componentDidCatch with error and errorInfo', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();

    const errorArg = consoleErrorSpy.mock.calls[0][1];
    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toBe('Test error');

    const errorInfoArg = consoleErrorSpy.mock.calls[0][2];
    expect(errorInfoArg).toBeDefined();
  });
});
