import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../components/Loader/Loader';
import { fetchCountryByCode } from '../api/countriesApi';

interface ICountryDetail {
  name: { common: string; official: string };
  flags: { svg: string; alt?: string };
  subregion?: string;
  languages?: Record<string, string>;
}

export function CountryDetails() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();

  const queryResult = useQuery<ICountryDetail, Error>({
    queryKey: ['country', countryCode],
    queryFn: () => fetchCountryByCode(countryCode ?? ''),
    enabled: Boolean(countryCode),
    retry: false,
  });

  const country = queryResult.data as ICountryDetail | undefined;
  const { isLoading, isError } = queryResult;

  useEffect(() => {
    if (isError) {
      navigate('/page-not-found', { replace: true });
    }
  }, [isError, navigate]);

  const handleClose = () => {
    navigate({ pathname: '/', search: window.location.search });
  };

  if (isLoading)
    return (
      <div style={{ padding: '2rem' }}>
        <Loader />
      </div>
    );
  if (!country) return null;

  return (
    <div style={{ padding: '1.5rem', position: 'relative' }}>
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
        }}
      >
        ✕ Close
      </button>

      <h2>{country.name.official}</h2>
      <img
        src={country.flags.svg}
        alt={country.flags.alt || `Flag of ${country.name.common}`}
        style={{
          width: '100%',
          maxWidth: '250px',
          margin: '1rem 0',
          borderRadius: '4px',
        }}
      />
      <p>
        <strong>Subregion:</strong> {country.subregion || 'N/A'}
      </p>
      <p>
        <strong>Languages:</strong>{' '}
        {country.languages
          ? Object.values(country.languages).join(', ')
          : 'N/A'}
      </p>
    </div>
  );
}
