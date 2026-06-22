import { getTranslations } from 'next-intl/server';
import styles from '../../src/page-components/AboutPage.module.css';

export const dynamic = 'force-static';

export async function generateMetadata() {
  const t = await getTranslations('about');
  return { title: t('title') };
}

export default async function AboutRoute() {
  const t = await getTranslations('about');

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
