'use client';

import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from '../i18n/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { queryClient } from '../query/queryClient';
import { Loader } from '../components/Loader/Loader';
import { fetchCountryByCode } from '../api/countriesApi';
import type { CountryDetail } from '../shared/types';
import styles from './CountryDetails.module.css';
import { Button } from '../components/Button/Button';

interface CountryDetailsProps {
  initialCountry?: CountryDetail | null;
  countryError?: string | null;
}

export function CountryDetails({
  initialCountry,
  countryError: initialError,
}: CountryDetailsProps) {
  const t = useTranslations('details');
  const params = useParams() as { countryCode?: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const countryCode = params.countryCode;
  const normalizedCountryCode = countryCode?.toLowerCase();
  const currentSearch = searchParams?.toString() ?? '';
  const queryString = currentSearch ? `?${currentSearch}` : '';

  const queryResult = useQuery<CountryDetail, Error>({
    queryKey: ['country', normalizedCountryCode],
    queryFn: () => fetchCountryByCode(normalizedCountryCode ?? ''),
    enabled: Boolean(normalizedCountryCode) && !initialCountry && !initialError,
    initialData: initialCountry ?? undefined,
    refetchOnMount: initialCountry ? false : 'always',
  });

  const country = queryResult.data as CountryDetail | undefined;
  const { isLoading, isError, isFetching } = queryResult;
  const error = queryResult.error;

  const handleClose = () => router.push(`/${queryString}`);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['country', normalizedCountryCode] });
    await queryResult.refetch();
  };

  if (initialError && !country) {
    return (
      <div className={styles.errorContainer}>
        <h2>{t('notFound')}</h2>
        <p>{initialError ?? t('notFoundDesc')}</p>
        <Button variant="primary" onClick={handleClose} className={styles.errorButton}>
          {t('returnToList')}
        </Button>
      </div>
    );
  }

  if (isLoading && !initialCountry)
    return (
      <div style={{ padding: '2rem' }}>
        <Loader />
      </div>
    );

  if (isError && !isFetching && !initialCountry)
    return (
      <div className={styles.errorContainer}>
        <h2>{t('notFound')}</h2>
        <p>{error?.message ?? t('notFoundDesc')}</p>
        <Button variant="primary" onClick={handleClose} className={styles.errorButton}>
          {t('returnToList')}
        </Button>
      </div>
    );

  if (!country) return null;

  return (
    <div className={styles.container}>
      <Button variant="secondary" className={styles.refresh} onClick={handleRefresh}>
        {isFetching ? `🔄 ${t('refreshing')}` : `🔄 ${t('refresh')}`}
      </Button>
      <Button variant="ghost" className={styles.close} onClick={handleClose}>
        {t('close')}
      </Button>

      <h2>{country.name.official}</h2>
      <div className={styles.flagWrapper}>
        <Image
          src={country.flags.svg}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
          fill
          className={styles.flag}
          sizes="480px"
          priority
        />
      </div>
      <p>
        <strong>{t('subregion')}:</strong> {country.subregion || 'N/A'}
      </p>
      <p>
        <strong>{t('languages')}:</strong>{' '}
        {country.languages ? Object.values(country.languages).join(', ') : 'N/A'}
      </p>
    </div>
  );
}

export default CountryDetails;
