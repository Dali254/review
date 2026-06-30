// pages/api/place-photo.js
// Proxies Google Places photo requests — keeps API key server-side
export default async function handler(req, res) {
  const { placeId } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      photoUrl: null,
      name: '',
      rating: null,
      totalRatings: 0,
      address: '',
    });
  }

  try {
    // 1. Get place details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,photos,types&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (detailsData.status !== 'OK' || !detailsData.result) {
      return res.status(200).json({ photoUrl: null, name: '', rating: null, totalRatings: 0, address: '' });
    }

    const place = detailsData.result;
    let photoUrl = null;

    // 2. Get first photo
    if (place.photos && place.photos.length > 0) {
      const photoRef = place.photos[0].photo_reference;
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`;
    }

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json({
      photoUrl,
      name: place.name,
      rating: place.rating || null,
      totalRatings: place.user_ratings_total || 0,
      address: place.formatted_address || '',
    });
  } catch (err) {
    console.error('Places API error:', err);
    return res.status(200).json({ photoUrl: null, name: '', rating: null, totalRatings: 0, address: '' });
  }
}
