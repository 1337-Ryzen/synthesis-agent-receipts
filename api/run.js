import { run } from './_core.js';

export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const result = await run(body.goal || 'No goal provided', body.plan);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
}
