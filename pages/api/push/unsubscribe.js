// pages/api/push/unsubscribe.js
//
// Called when a user disables notifications in-app, so we stop sending
// them push messages and don't waste sends on a dead subscription.

import { removeSubscription } from '../../../lib/pushStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: 'Missing phone' });
  }

  try {
    removeSubscription(phone);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Push unsubscribe error:', err);
    return res.status(500).json({ error: 'Failed to remove subscription' });
  }
}
