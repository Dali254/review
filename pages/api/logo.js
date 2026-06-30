// pages/api/logo.js
// Reliable business logo proxy with multi-source fallback.
//
// Why this exists: a single favicon service (Google's s2/favicons,
// Clearbit, etc.) is unauthenticated, rate-limited, and frequently
// returns nothing or a generic globe icon for many real domains —
// which is exactly the "blank gray card" failure visible in production.
// This endpoint tries several independent sources in sequence and only
// gives up after all of them fail, so the client basically never has
// to fall back to a placeholder.
//
// Usage: <img src="/api/logo?domain=safaricom.co.ke&size=128" />
// Always returns image bytes with a long cache header — never JSON,
// never a 404 the client has to special-case. If every upstream source
// fails, it returns a generated SVG initial/colour fallback so the
// <img> tag still renders something real instead of a broken icon.

const CACHE_HEADER = 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400'; // 30 days

async function tryFetch(url, opts = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    // Reject tiny/empty responses — some services return a 1x1 transparent
    // pixel instead of a real 404, which would otherwise look "successful"
    if (buf.length < 200) return null;
    return { buf, contentType };
  } catch {
    return null;
  }
}

function fallbackSvg(initial, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <rect width="128" height="128" rx="28" fill="${color}"/>
    <text x="50%" y="54%" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`;
  return Buffer.from(svg);
}

export default async function handler(req, res) {
  const { domain, size = '128', initial = '?', color = '#C0185F' } = req.query;

  if (!domain) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', CACHE_HEADER);
    return res.status(200).send(fallbackSvg(initial, color));
  }

  const sz = parseInt(size) || 128;

  // Try multiple independent logo/favicon sources, in order of quality.
  const sources = [
    // DuckDuckGo's favicon service — stable, no key, widely used
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    // Google's favicon service as a second attempt (sometimes works
    // when DDG doesn't have a domain cached yet)
    `https://www.google.com/s2/favicons?domain=${domain}&sz=${sz}`,
    // Direct favicon.ico on the domain itself, as a last real attempt
    `https://${domain}/favicon.ico`,
  ];

  for (const src of sources) {
    const result = await tryFetch(src);
    if (result) {
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Cache-Control', CACHE_HEADER);
      return res.status(200).send(result.buf);
    }
  }

  // All sources failed — return a generated initial badge so the <img>
  // still renders a real, attractive image instead of breaking.
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', CACHE_HEADER);
  return res.status(200).send(fallbackSvg(initial, color));
}
