import './globals.css';
import { Providers } from './providers';
import { RootLayout } from '../src/layouts/RootLayout';

export const metadata = {
  title: 'Countries Dashboard',
  description: 'Countries information with Next.js App Router',
};

export default function RootAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <RootLayout>{children}</RootLayout>
        </Providers>
      </body>
    </html>
  );
}
