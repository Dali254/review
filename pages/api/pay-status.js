// pages/api/pay-status.js
// Polled by the client after an STK push to find out whether the
// customer actually completed (or cancelled/failed) the payment.
//
// Primary source of truth: our local store, populated by the PayHero
// webhook in /api/pay-callback.js. If the webhook hasn't landed yet
// (e.g. cold start, network delay), we also fall back to asking
// PayHero directly via their transaction-status endpoint so polling
// still converges even if the webhook is late or never arrives.

import { getPaymentStatus, setPaymentStatus } from '../../lib/paymentStore';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { reference } = req.query;
  if (!reference) {
    return res.status(400).json({ status: 'ERROR', error: 'reference is required' });
  }

  const cached = getPaymentStatus(reference);
  if (cached && (cached.status === 'SUCCESS' || cached.status === 'FAILED' || cached.status === 'CANCELLED')) {
    return res.status(200).json({ status: cached.status, ...cached });
  }

  // Fallback: ask PayHero directly in case the webhook hasn't arrived
  const auth = process.env.PAYHERO_AUTH;
  if (auth) {
    try {
      const r = await fetch(`https://backend.payhero.co.ke/api/v2/transaction-status?reference=${encodeURIComponent(reference)}`, {
        headers: { Authorization: auth },
      });
      if (r.ok) {
        const data = await r.json();
        const status = (data.status || '').toUpperCase();
        if (status === 'SUCCESS' || status === 'COMPLETED') {
          setPaymentStatus(reference, 'SUCCESS', data);
          return res.status(200).json({ status: 'SUCCESS', ...data });
        }
        if (status === 'FAILED' || status === 'CANCELLED') {
          setPaymentStatus(reference, 'FAILED', data);
          return res.status(200).json({ status: 'FAILED', ...data });
        }
      }
    } catch (err) {
      console.error('PayHero status check error:', err);
    }
  }

  // Still unresolved — tell the client to keep polling
  return res.status(200).json({ status: cached?.status || 'PENDING' });
}
