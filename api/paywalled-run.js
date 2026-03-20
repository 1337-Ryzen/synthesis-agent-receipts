import { run } from './_core.js';

export default async function handler(req, res) {
  const proof = req.headers['x-payment-proof'];
  if (!proof) {
    return res.status(402).json({ ok: false, code: 'PAYMENT_REQUIRED', message: 'Provide x-payment-proof header (x402 integration-ready).' });
  }

  try {
    const body = req.body || {};
    const result = await run(body.goal || 'Paid run goal');
    result.paid = true;
    result.paymentProofPreview = String(proof).slice(0, 12) + '...';
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }
}
