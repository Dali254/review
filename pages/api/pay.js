// pages/api/pay.js
// Initiates M-Pesa STK Push via PayHero
import { setPaymentStatus } from '../../lib/paymentStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { phone, amount, name, reference: refIn } = req.body;
  const auth = process.env.PAYHERO_AUTH;
  const channelId = parseInt(process.env.PAYHERO_CHANNEL_ID || '133');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://reviewke.vercel.app';
  const reference = refIn || `RKE-${Date.now()}`;

  if (!phone || !amount) {
    return res.status(400).json({ success: false, error: 'Phone and amount required' });
  }

  try {
    const payload = {
      amount: parseInt(amount),
      phone_number: phone,
      channel_id: channelId,
      provider: 'm-pesa',
      external_reference: reference,
      customer_name: name || 'Reviewer',
      callback_url: `${appUrl}/api/pay-callback`,
    };

    const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success || data.status === 'QUEUED') {
      // STK push was accepted and is now waiting on the customer's phone.
      // This is NOT a completed payment — mark it PENDING until the
      // PayHero callback (or a status poll) confirms the real outcome.
      setPaymentStatus(reference, 'PENDING', {
        checkoutId: data.CheckoutRequestID,
      });
      return res.status(200).json({
        success: true,
        reference,
        checkoutId: data.CheckoutRequestID,
      });
    } else {
      setPaymentStatus(reference, 'FAILED', { error: data.message });
      return res.status(200).json({
        success: false,
        error: data.message || 'STK push failed',
      });
    }
  } catch (err) {
    console.error('PayHero error:', err);
    setPaymentStatus(reference, 'FAILED', { error: 'Payment service unavailable' });
    return res.status(200).json({ success: false, error: 'Payment service unavailable' });
  }
}

