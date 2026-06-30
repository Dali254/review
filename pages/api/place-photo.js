// pages/api/place-photo.js
// Fetches a real Google Places photo for a business by NAME + ADDRESS
// (no pre-known Place ID required) and proxies the image bytes directly
// so it can be used as <img src="/api/place-photo?..."> exactly like a
// normal image URL — no JSON, no client-side photo_reference juggling.
//
// Flow:
//   1. Find Place From Text — looks up the business by "name, address"
//      and returns its place_id + a photo_reference if Google has one.
//   2. Place Photo — fetches the actual JPEG bytes for that photo and
//      streams them back to the browser.
//
// Results are cached for 30 days (both at the CDN and via long
// Cache-Control), so the lookup only happens once per business.
//
// If GOOGLE_PLACES_API_KEY is not set, or the business has no photo on
// Google, this returns a 204 (no content) so the client can fall back
// to the logo proxy — it never returns a broken image.

const CACHE_HEADER = 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400';

export default async function handler(req, res) {
  const { name, address, maxwidth = '800' } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || !name) {
    return res.status(204).end();
  }

  try {
    // Step 1 — find the place by text search (name + address is far more
    // reliable than a hardcoded Place ID, and self-corrects if Google's
    // listing for the business changes).
    const query = address ? `${name}, ${address}` : name;
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,photos&key=${apiKey}`;

    const findRes = await fetch(findUrl);
    const findData = await findRes.json();

    const candidate = findData.candidates && findData.candidates[0];
    if (!candidate || !candidate.photos || candidate.photos.length === 0) {
      return res.status(204).end();
    }

    const photoRef = candidate.photos[0].photo_reference;

    // Step 2 — fetch the actual photo bytes and stream them back.
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoRef}&key=${apiKey}`;
    const photoRes = await fetch(photoUrl);

    if (!photoRes.ok) {
      return res.status(204).end();
    }

    const contentType = photoRes.headers.get('content-type') || 'image/jpeg';
    const buf = Buffer.from(await photoRes.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', CACHE_HEADER);
    return res.status(200).send(buf);
  } catch (err) {
    console.error('Places photo error:', err);
    return res.status(204).end();
  }
}
