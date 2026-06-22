'use client';

import type { ReactNode } from 'react';
import { useRouter } from '../../i18n/navigation';
import classes from '../../page-components/HomePage.module.css';

interface SearchResultsLayoutInteractiveProps {
  countryCode?: string;
  queryString: string;
  children: ReactNode;
}

export function SearchResultsLayoutInteractive({
  countryCode,
  queryString,
  children,
}: SearchResultsLayoutInteractiveProps) {
  const router = useRouter();

  const handleMainPanelClick = (event: React.MouseEvent) => {
    if (
      countryCode &&
      (event.target as HTMLElement).closest('[data-panel="list"]')
    ) {
      router.push(`/${queryString}`);
    }
  };

  return (
    <div
      className={`${classes.homeLayout} ${countryCode ? classes.splitActive : ''}`}
      onClick={handleMainPanelClick}
    >
      {children}
    </div>
  );
}
