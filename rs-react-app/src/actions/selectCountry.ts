'use server';

import { redirect } from 'next/navigation';
import { buildQueryString, parsePageParam } from '../lib/searchParams';

export async function selectCountryAction(formData: FormData): Promise<void> {
  const countryCode = String(formData.get('countryCode') ?? '')
    .trim()
    .toLowerCase();
  const search = String(formData.get('search') ?? '').trim();
  const page = parsePageParam(String(formData.get('page') ?? '1'));

  if (!countryCode) {
    return;
  }

  redirect(`/country/${countryCode.toLowerCase()}${buildQueryString(search, page)}`);
}
