'use client';

import { useTranslations } from 'next-intl';
import styles from './AboutPage.module.css';

export function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className={styles.container}>
      <h1>{t('title')}</h1>
      <p>{t('developer')}</p>
      <p>
        Built as part of the{' '}
        <a
          href="https://rs.school"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          {t('courseLink')}
        </a>
      </p>
    </div>
  );
}

export default AboutPage;
