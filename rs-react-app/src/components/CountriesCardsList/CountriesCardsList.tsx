'use client';

import { useSearchParams } from 'next/navigation';
import { CountryCard } from '../CountryCard/CountryCard';
import { useCountriesStore } from '../../store/useCountriesStore';
import classes from './CountriesCardsList.module.css';
import { Loader } from '../Loader/Loader';
import { Button } from '../Button/Button';
import { parsePageParam } from '../../lib/searchParams';
import type { Country } from '../../shared/types';

interface CountriesCardsListProps {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
}

export function CardsList({
  countries,
  isLoading,
  error,
}: CountriesCardsListProps) {
  const searchParams = useSearchParams();
  const { refreshCountries } = useCountriesStore();
  const search = searchParams?.get('search') ?? '';
  const currentPage = parsePageParam(searchParams?.get('page') ?? undefined);

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className={classes.error}>
        <p>⚠️ {error}</p>
        <Button variant="secondary" onClick={() => refreshCountries()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ul className={classes.cardsContainer}>
      {countries.map((country) => (
        <CountryCard
          key={country.cca3}
          {...country}
          search={search}
          currentPage={currentPage}
        />
      ))}
    </ul>
  );
}
