'use server';

import { redirect } from 'next/navigation';
import { buildQueryString } from '../lib/searchParams';

export type SearchActionState = {
  error: string | null;
};

export async function searchCountriesAction(
  _prevState: SearchActionState | null,
  formData: FormData
): Promise<SearchActionState> {
  const search = String(formData.get('search') ?? '').trim();
  const activeCountryCode = String(formData.get('activeCountryCode') ?? '')
    .trim()
    .toLowerCase();
  const basePath = activeCountryCode ? `/${activeCountryCode}` : '/';

  redirect(`${basePath}${buildQueryString(search, 1)}`);
}
