import { type NextRequest, NextResponse } from 'next/server';
import { mockCountries, mockCountryDetails } from '../../../../src/api/mockCountries';

const UPSTREAM = 'https://restcountries.com/v3.1';
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function mockFallback(path: string[]): NextResponse {
  const [segment, param] = path;

  if (segment === 'all') {
    return NextResponse.json(mockCountries);
  }

  if (segment === 'name' && param) {
    const query = param.toLowerCase();
    const results = mockCountries.filter(
      (c) =>
        c.name.common.toLowerCase().includes(query) ||
        (c.name.official ?? '').toLowerCase().includes(query)
    );
    return NextResponse.json(results);
  }

  if (segment === 'alpha' && param) {
    const code = param.toLowerCase().replace(/\?.*$/, '');
    const detail = mockCountryDetails[code];
    if (!detail) {
      return NextResponse.json({ message: 'Not Found', status: 404 }, { status: 404 });
    }
    return NextResponse.json([detail]);
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const search = request.nextUrl.search;
  const url = `${UPSTREAM}/${path.join('/')}${search}`;

  try {
    const upstream = await fetchWithTimeout(url);

    if (!upstream.ok && upstream.status !== 404) {
      throw new Error(`upstream ${upstream.status}`);
    }

    const data = await upstream.json();

    if (!upstream.ok) {
      if (path[0] === 'name') return NextResponse.json([]);
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.warn('[api/countries] upstream unreachable, using mock data:', (err as Error).message);
    return mockFallback(path);
  }
}
