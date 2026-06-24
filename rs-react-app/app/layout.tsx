import './globals.css';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from './providers';
import { RootLayout } from '../src/layouts/RootLayout';
import type { Locale } from '../src/i18n/config';

export const metadata = {
  title: 'Countries Dashboard',
  description: 'Countries information with Next.js App Router',
};

export default async function RootAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <Providers locale={locale} messages={messages}>
          <RootLayout locale={locale}>{children}</RootLayout>
        </Providers>
      </body>
    </html>
  );
}
