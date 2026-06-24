import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Let Next.js handle redirect and notFound errors — don't catch them
    if (
      error?.message?.includes('NEXT_REDIRECT') ||
      error?.message?.includes('NEXT_NOT_FOUND') ||
      (error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT') ||
      (error as { digest?: string })?.digest?.startsWith('NEXT_NOT_FOUND')
    ) {
      throw error;
    }
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      (error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT') ||
      (error as { digest?: string })?.digest?.startsWith('NEXT_NOT_FOUND')
    ) {
      throw error;
    }
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>Something went wrong.</h1>
          <p>
            Please try again later or use the button below to reset the error
            simulation.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
