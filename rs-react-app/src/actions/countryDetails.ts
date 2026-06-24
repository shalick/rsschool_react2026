'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function closeCountryDetailsAction(formData: FormData): Promise<void> {
  const queryString = String(formData.get('queryString') ?? '');
  redirect(`/${queryString}`);
}

export async function refreshCountryDetailsAction(formData: FormData): Promise<void> {
  const countryCode = String(formData.get('countryCode') ?? '')
    .trim()
    .toLowerCase();
  const queryString = String(formData.get('queryString') ?? '');

  if (!countryCode) {
    return;
  }

  revalidatePath(`/country/${countryCode}`);
  redirect(`/country/${countryCode}${queryString}`);
}
