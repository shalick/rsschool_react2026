import type { ICountry } from '../components/CountriesCardsList/CountriesCardsList';

const getErrorMessage = (status: number): string => {
  switch (true) {
    case status === 400:
      return 'Bad request. Please try again later.';
    case status === 404:
      return 'The requested data could not be found.';
    case status === 429:
      return 'Too many requests. Please wait a moment and try again.';
    case status >= 500:
      return 'Server error. We’re working on it – please try again soon.';
    default:
      return `Unexpected error (status ${status}). Please try again.`;
  }
};

export async function fetchAllCountries(): Promise<ICountry[]> {
  const url =
    'https://restcountries.com/v3.1/all?fields=name,flags,capital,region,population,cca3';

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  if (!response.ok) {
    const message = getErrorMessage(response.status);
    throw new Error(message);
  }

  return response.json();
}

export async function fetchCountriesByName(name: string): Promise<ICountry[]> {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,flags,capital,region,population,cca3`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }

  return response.json();
}
