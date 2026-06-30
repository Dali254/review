// pages/api/pay-callback.js
// Receives payment status from PayHero
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  // In production: verify signature, update DB, credit user wallet
  console.log('PayHero callback:', JSON.stringify(req.body));
  return res.status(200).json({ received: true });
}
