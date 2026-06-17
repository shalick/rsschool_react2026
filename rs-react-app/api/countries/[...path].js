/**
 * Vercel serverless function — proxies /api/countries/:path* to api.restcountries.com/countries/:path*
 * and injects the Authorization header so the key is never exposed to the client.
 */
export default async function handler(req, res) {
  let upstreamPath = req.url || '/';

  // If Vercel passes the full API route, strip the internal prefix.
  if (upstreamPath.startsWith('/api/countries')) {
    upstreamPath = upstreamPath.replace('/api/countries', '');
  }

  if (!upstreamPath.startsWith('/')) {
    upstreamPath = `/${upstreamPath}`;
  }

  const upstreamUrl = `https://api.restcountries.com/countries${upstreamPath}`;

  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'API key not configured on server.' });
    return;
  }

  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach upstream API.', detail: err.message });
    return;
  }

  const body = await upstream.text();

  res.status(upstream.status);
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
  const cc = upstream.headers.get('cache-control');
  if (cc) res.setHeader('Cache-Control', cc);

  res.end(body);
}
