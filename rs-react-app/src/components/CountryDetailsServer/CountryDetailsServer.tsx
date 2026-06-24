import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import {
  closeCountryDetailsAction,
  refreshCountryDetailsAction,
} from '../../actions/countryDetails';
import type { CountryDetail } from '../../shared/types';
import styles from '../../page-components/CountryDetails.module.css';

interface CountryDetailsServerProps {
  countryCode: string;
  country: CountryDetail | null;
  countryError: string | null;
  queryString: string;
}

export async function CountryDetailsServer({
  countryCode,
  country,
  countryError,
  queryString,
}: CountryDetailsServerProps) {
  const t = await getTranslations('details');

  if (countryError && !country) {
    return (
      <div className={styles.errorContainer}>
        <h2>{t('notFound')}</h2>
        <p>{countryError ?? t('notFoundDesc')}</p>
        <form action={closeCountryDetailsAction}>
          <input type="hidden" name="queryString" value={queryString} />
          <button type="submit" className={styles.errorButton}>
            {t('returnToList')}
          </button>
        </form>
      </div>
    );
  }

  if (!country) {
    return null;
  }

  const countryName = country?.name?.official ?? country?.name?.common ?? 'Unknown country';
  const flagSrc = country?.flags?.svg ?? '/placeholder-flag.svg';
  const flagAlt = country?.flags?.alt || `Flag of ${country?.name?.common ?? 'country'}`;
  const subregion = country?.subregion ?? 'N/A';
  
  const languages = country?.languages
    ? Array.isArray(country.languages)
      ? (country.languages as string[]).join(', ')
      : Object.values(country.languages).filter(v => typeof v === 'string').join(', ')
    : 'N/A';

  return (
    <div className={styles.container}>
      <form action={refreshCountryDetailsAction}>
        <input type="hidden" name="countryCode" value={countryCode.toLowerCase()} />
        <input type="hidden" name="queryString" value={queryString} />
        <button type="submit" className={styles.refresh}>
          {`🔄 ${t('refresh')}`}
        </button>
      </form>
      <form action={closeCountryDetailsAction}>
        <input type="hidden" name="queryString" value={queryString} />
        <button type="submit" className={styles.close}>
          {t('close')}
        </button>
      </form>

      <h2>{countryName}</h2>
      <div className={styles.flagWrapper}>
        <Image
          src={flagSrc}
          alt={flagAlt}
          fill
          className={styles.flag}
          sizes="480px"
          priority
        />
      </div>
      <p>
        <strong>{t('subregion')}:</strong> {subregion}
      </p>
      <p>
        <strong>{t('languages')}:</strong> {languages}
      </p>
    </div>
  );
}
