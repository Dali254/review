// pages/api/push/stats.js
//
// Returns how many users currently have push notifications enabled, so
// the admin dashboard can show subscriber count before sending a
// broadcast notification.

import { subscriptionCount } from '../../../lib/pushStore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json({ subscribers: subscriptionCount() });
}
