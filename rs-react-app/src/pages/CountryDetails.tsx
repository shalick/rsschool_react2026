import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from '../components/Loader/Loader';

interface ICountryDetail {
  name: { common: string; official: string };
  flags: { svg: string; alt?: string };
  subregion?: string;
  languages?: Record<string, string>;
}

export function CountryDetails() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();
  const [country, setCountry] = useState<ICountryDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryCode) return;
    setLoading(true);

    fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Country not found in API');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setCountry(data[0]);
        } else {
          throw new Error('Empty data array');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error details:', err);
        setLoading(false);
        navigate('/page-not-found', { replace: true });
      });
  }, [countryCode, navigate]);

  const handleClose = () => {
    navigate({ pathname: '/', search: window.location.search });
  };

  if (loading)
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
