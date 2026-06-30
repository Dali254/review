// pages/api/push/send.js
//
// Sends a Web Push notification using web-push + our VAPID keys. Can
// target a single phone number, or broadcast to every stored
// subscription (used for "new review job available" announcements).
//
// This requires NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to be
// set (see .env.local) — without them, sends fail safely with a 200 and
// a clear "not configured" reason rather than crashing the caller.

import webpush from 'web-push';
import { getSubscription, getAllSubscriptions, removeSubscription } from '../../../lib/pushStore';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@reviewke.app';

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!publicKey || !privateKey) {
    return res.status(200).json({ success: false, reason: 'Push notifications are not configured (missing VAPID keys)' });
  }

  const { phone, title, body, url, image, broadcast } = req.body || {};

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  const payload = JSON.stringify({
    title,
    body,
    url: url || '/businesses',
    image: image || undefined,
    tag: 'reviewke-job',
  });

  // Sends to one subscription, removing it automatically if the push
  // service reports it's gone (410/404 — the user uninstalled, cleared
  // data, or the browser revoked it). Without this cleanup, we'd keep
  // retrying dead subscriptions forever.
  async function sendOne(targetPhone, subscription) {
    try {
      await webpush.sendNotification(subscription, payload);
      return { phone: targetPhone, success: true };
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        removeSubscription(targetPhone);
      }
      return { phone: targetPhone, success: false, error: err.message, statusCode: err.statusCode };
    }
  }

  try {
    if (broadcast) {
      const all = getAllSubscriptions();
      const results = await Promise.all(all.map(({ phone: p, subscription }) => sendOne(p, subscription)));
      const sent = results.filter(r => r.success).length;
      return res.status(200).json({ success: true, sent, total: all.length, results });
    }

    if (!phone) {
      return res.status(400).json({ error: 'phone is required when not broadcasting' });
    }
    const subscription = getSubscription(phone);
    if (!subscription) {
      return res.status(200).json({ success: false, reason: 'No subscription found for this phone — they may not have enabled notifications' });
    }
    const result = await sendOne(phone, subscription);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Push send error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
