'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function NotFoundPage() {
  const t = useTranslations('notFound');

  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#007bff',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        {t('returnHome')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
