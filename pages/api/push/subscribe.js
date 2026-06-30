// pages/api/push/subscribe.js
//
// Called from the browser once a user grants notification permission and
// the service worker successfully subscribes to the Push API. Saves the
// subscription (endpoint + keys) keyed by the user's phone number so we
// can target them later from /api/push/send.

import { saveSubscription } from '../../../lib/pushStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscription, phone } = req.body || {};

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Missing subscription' });
  }
  if (!phone) {
    return res.status(400).json({ error: 'Missing phone — notifications must be tied to a signed-in user' });
  }

  try {
    saveSubscription(phone, subscription);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    return res.status(500).json({ error: 'Failed to save subscription' });
  }
}
