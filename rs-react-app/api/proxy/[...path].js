/**
 * Vercel serverless function — proxies /api/proxy/:path* to api.restcountries.com
 * and injects the Authorization header so the key is never exposed to the client.
 */
export default async function handler(req, res) {
  let upstreamPath = req.url || '/';

  if (upstreamPath.startsWith('/api/proxy')) {
    upstreamPath = upstreamPath.slice('/api/proxy'.length);
  } else if (upstreamPath.startsWith('/api')) {
    upstreamPath = upstreamPath.slice('/api'.length);
  }

  if (upstreamPath.startsWith('/countries')) {
    upstreamPath = upstreamPath.slice('/countries'.length);
  }

  if (!upstreamPath.startsWith('/')) {
    upstreamPath = `/${upstreamPath}`;
  }

  const upstreamUrl = `https://api.restcountries.com${upstreamPath}`;

  const apiKey = process.env.VITE_API_KEY || process.env.API_KEY || process.env.RESTCOUNTRIES_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'API key not configured on server. Set VITE_API_KEY, API_KEY or RESTCOUNTRIES_API_KEY.' });
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
