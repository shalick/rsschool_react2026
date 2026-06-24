'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { ErrorSimulator } from '../components/ErrorSimulator/ErrorSimulator';
import { Button } from '../components/Button/Button';

interface SearchResultsPageClientProps {
  children: React.ReactNode;
}

export function SearchResultsPageClient({ children }: SearchResultsPageClientProps) {
  const te = useTranslations('errors');
  const [simulateError, setSimulateError] = useState(false);

  return (
    <>
      <ErrorBoundary key={String(simulateError)}>
        {simulateError ? <ErrorSimulator /> : children}
      </ErrorBoundary>

      <Button
        variant={simulateError ? 'secondary' : 'primary'}
        onClick={() => setSimulateError((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '2rem',
          zIndex: 2000,
          transition: 'background-color 0.2s ease, transform 0.1s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {simulateError ? te('resetBoundary') : te('testBoundary')}
      </Button>
    </>
  );
}
