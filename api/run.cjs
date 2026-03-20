const { run } = require('./_core.cjs');

module.exports = async function handler(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const result = await run(body.goal || 'No goal provided', body.plan);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
};
