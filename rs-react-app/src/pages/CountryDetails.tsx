import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../query/queryClient';
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
  const normalizedCountryCode = countryCode?.toLowerCase();

  const queryResult = useQuery<ICountryDetail, Error>({
    queryKey: ['country', normalizedCountryCode],
    queryFn: () => fetchCountryByCode(normalizedCountryCode ?? ''),
    enabled: Boolean(normalizedCountryCode),
    refetchOnMount: 'always',
  });

  const country = queryResult.data as ICountryDetail | undefined;
  const { isLoading, isError, isFetching } = queryResult;
  const error = queryResult.error;

  const handleClose = () => {
    navigate({ pathname: '/', search: window.location.search });
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['country', normalizedCountryCode],
    });
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Country details could not be loaded</h2>
        <p>{error?.message ?? 'Please try again later.'}</p>
        <button
          onClick={handleClose}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Return to country list
        </button>
      </div>
    );

  if (!country) return null;

  return (
    <div style={{ padding: '1.5rem', position: 'relative' }}>
      <button
        onClick={handleRefresh}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '4rem',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          fontSize: '0.9rem',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          backgroundColor: '#f5f5f5',
        }}
      >
        {isFetching ? '🔄 Refreshing...' : '🔄 Refresh'}
      </button>
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
