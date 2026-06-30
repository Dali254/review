// pages/api/pay-callback.js
// Receives the real payment outcome from PayHero once the customer
// has entered their M-Pesa PIN (or cancelled / let it time out).
//
// PayHero's callback payload shape (per their docs) is roughly:
// {
//   forward_url, response: {
//     Amount, CheckoutRequestID, ExternalReference, MpesaReceiptNumber,
//     ResultCode, ResultDesc, Status, ...
//   }
// }
// ResultCode 0 = success. Anything else = failed/cancelled.
// We key our store off ExternalReference, which is the `reference` we
// generated client-side and passed as external_reference in /api/pay.

import { setPaymentStatus } from '../../lib/paymentStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body || {};
    const result = body.response || body;

    const reference = result.ExternalReference || result.external_reference || body.external_reference;
    const resultCode = result.ResultCode ?? result.result_code;
    const status = result.Status || result.status;

    if (!reference) {
      console.warn('PayHero callback missing reference:', JSON.stringify(body));
      return res.status(200).json({ received: true });
    }

    const succeeded =
      resultCode === 0 ||
      resultCode === '0' ||
      status === 'Success' ||
      status === 'SUCCESS' ||
      status === 'COMPLETED';

    if (succeeded) {
      setPaymentStatus(reference, 'SUCCESS', {
        mpesaReceipt: result.MpesaReceiptNumber || null,
        amount: result.Amount || null,
      });
    } else {
      setPaymentStatus(reference, 'FAILED', {
        reason: result.ResultDesc || result.resultDesc || 'Payment not completed',
      });
    }

    console.log('PayHero callback recorded:', reference, succeeded ? 'SUCCESS' : 'FAILED');
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('PayHero callback error:', err);
    return res.status(200).json({ received: true });
  }
}
