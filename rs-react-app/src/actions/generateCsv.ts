'use server';

import type { Country } from '../shared/types';

export type CsvRow = Pick<Country, 'cca3' | 'name' | 'region' | 'capital' | 'population' | 'flags'> & {
  subregion?: string;
};

export type CsvActionState = {
  csv: string | null;
  error: string | null;
};

function escapeCell(cell: string | number): string {
  const str = String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function generateCsvAction(
  _prev: CsvActionState,
  formData: FormData
): Promise<CsvActionState> {
  try {
    const raw = formData.get('countries');
    if (!raw || typeof raw !== 'string') {
      return { csv: null, error: 'No countries provided' };
    }

    const countries: CsvRow[] = JSON.parse(raw);

    const headers = [
      'Name', 'Official Name', 'Region', 'Subregion', 'Capital',
      'Population', 'Flag URL (SVG)', 'Flag Alt Text', 'Details URL',
    ];

    const rows = countries.map((c) => [
      c.name.common,
      c.name.official || '',
      c.region,
      c.subregion || '',
      c.capital ? c.capital.join(', ') : 'N/A',
      c.population,
      c.flags.svg,
      c.flags.alt || `Flag of ${c.name.common}`,
      `/${c.cca3.toLowerCase()}`,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCell).join(',')),
    ].join('\n');

    return { csv, error: null };
  } catch {
    return { csv: null, error: 'Failed to generate CSV' };
  }
}
