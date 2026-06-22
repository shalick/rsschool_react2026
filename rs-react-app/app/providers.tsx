'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '../src/context/ThemeContext';
import { queryClient } from '../src/query/queryClient';
import type { AbstractIntlMessages } from 'next-intl';
import type { Locale } from '../src/i18n/config';

interface ProvidersProps {
  children: React.ReactNode;
  locale: Locale;
  messages: AbstractIntlMessages;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
