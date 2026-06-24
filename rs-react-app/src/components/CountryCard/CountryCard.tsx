'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { selectCountryAction } from '../../actions/selectCountry';
import { CountryCardCheckbox } from './CountryCardCheckbox';
import classes from './CountryCard.module.css';
import type { Country } from '../../shared/types';

type CountryCardProps = Country & {
  search?: string;
  currentPage?: number;
};

export const CountryCard = ({
  cca3,
  name,
  flags,
  capital,
  region,
  population,
  search = '',
  currentPage = 1,
}: CountryCardProps) => {
  const t = useTranslations('countries');

  const imageSrc = flags?.svg ?? flags?.png ?? '/placeholder-flag.svg';
  const imageAlt = flags?.alt || `Flag of ${name?.common ?? 'country'}`;

  return (
    <li className={classes.country}>
      <form action={selectCountryAction} className={classes.cardForm}>
        <input type="hidden" name="countryCode" value={cca3} />
        <input type="hidden" name="search" value={search} />
        <input type="hidden" name="page" value={currentPage} />
        <button type="submit" className={classes.cardButton}>
          <div className={classes.flagWrapper}>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className={classes.flag}
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
          <div className={classes.countryInfo}>
            <h3>{name?.common ?? 'Unknown country'}</h3>
            <div className={classes.details}>
              <p>
                <strong>{t('population')}:</strong> {population?.toLocaleString() ?? 'N/A'}
              </p>
              <p>
                <strong>{t('region')}:</strong> {region ?? 'N/A'}
              </p>
              <p>
                <strong>{t('capital')}:</strong> {capital ? capital[0] : 'N/A'}
              </p>
            </div>
          </div>
        </button>
      </form>
      <CountryCardCheckbox cca3={cca3} />
    </li>
  );
};
