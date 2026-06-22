import { type NextRequest, NextResponse } from 'next/server';
import { mockCountries, mockCountryDetails } from '../../../../src/api/mockCountries';

const UPSTREAM = 'https://restcountries.com/v3.1';
const TIMEOUT_MS = 5000;

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

function mockFallback(path: string[], search: string): NextResponse {
  const [segment, param] = path;

  // /all
  if (segment === 'all') {
    return NextResponse.json(mockCountries);
  }

  // /name/:name
  if (segment === 'name' && param) {
    const query = param.toLowerCase();
    const results = mockCountries.filter((c) =>
      c.name.common.toLowerCase().includes(query)
    );
    if (results.length === 0) {
      return NextResponse.json({ message: 'Not Found', status: 404 }, { status: 404 });
    }
    return NextResponse.json(results);
  }

  // /alpha/:code
  if (segment === 'alpha' && param) {
    const code = param.toLowerCase().replace(/\?.*$/, ''); // strip query if in path
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
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.warn('[api/countries] upstream unreachable, using mock data:', (err as Error).message);
    return mockFallback(path, search);
  }
}
