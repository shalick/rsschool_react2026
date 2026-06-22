'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { queryClient } from '../query/queryClient';
import { Loader } from '../components/Loader/Loader';
import { fetchCountryByCode } from '../api/countriesApi';
import styles from './CountryDetails.module.css';
import { Button } from '../components/Button/Button';

interface ICountryDetail {
  name: { common: string; official: string };
  flags: { svg: string; alt?: string };
  subregion?: string;
  languages?: Record<string, string>;
}

export function CountryDetails() {
  const t = useTranslations('details');
  const params = useParams() as { countryCode?: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const countryCode = params.countryCode;
  const normalizedCountryCode = countryCode?.toLowerCase();
  const currentSearch = searchParams?.toString() ?? '';
  const queryString = currentSearch ? `?${currentSearch}` : '';

  const queryResult = useQuery<ICountryDetail, Error>({
    queryKey: ['country', normalizedCountryCode],
    queryFn: () => fetchCountryByCode(normalizedCountryCode ?? ''),
    enabled: Boolean(normalizedCountryCode),
    refetchOnMount: 'always',
  });

  const country = queryResult.data as ICountryDetail | undefined;
  const { isLoading, isError, isFetching } = queryResult;
  const error = queryResult.error;

  const handleClose = () => router.push(`/${queryString}`);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['country', normalizedCountryCode] });
    await queryResult.refetch();
  };

  if (isLoading)
    return (
      <div style={{ padding: '2rem' }}>
        <Loader />
      </div>
    );

  if (isError && !isFetching)
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
      <img
        src={country.flags.svg}
        alt={country.flags.alt || `Flag of ${country.name.common}`}
        className={styles.flag}
      />
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
