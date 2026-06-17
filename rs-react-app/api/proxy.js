/**
 * Vercel serverless function — proxies /api/* to api.restcountries.com
 * and injects the Authorization header so the key is never exposed to the client.
 *
 * Route: /api/:path*  (configured in vercel.json)
 */
export default async function handler(req, res) {
  // Strip the internal API prefix to get the upstream path.
  // Vercel rewrites /api/:path* to /api/proxy/:path* while local dev may hit /api directly.
  let upstreamPath = req.url;
  if (upstreamPath.startsWith('/api/proxy')) {
    upstreamPath = upstreamPath.replace('/api/proxy', '');
  } else if (upstreamPath.startsWith('/api')) {
    upstreamPath = upstreamPath.replace('/api', '');
  }

  if (!upstreamPath) upstreamPath = '/';
  const upstreamUrl = `https://api.restcountries.com${upstreamPath}`;

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
  // Allow browser to cache responses (same TTL as upstream)
  const cc = upstream.headers.get('cache-control');
  if (cc) res.setHeader('Cache-Control', cc);

  res.end(body);
}
