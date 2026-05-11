import { render, screen } from '@testing-library/react';
import { ErrorSimulator } from './ErrorSimulator';
import React from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-message">{this.state.errorMessage}</div>;
    }
    return this.props.children;
  }
}

describe('ErrorSimulator', () => {
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('throws an error when rendered', () => {
    render(
      <TestErrorBoundary>
        <ErrorSimulator />
      </TestErrorBoundary>
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Simulated error!'
    );
  });
});
