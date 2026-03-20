const { run, makeChain, enforcePolicy } = require('./_core.cjs');

module.exports = async function handler(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const goal = body.goal || 'Retry demo goal';
  const chain = makeChain();

  const firstPlan = [
    { type: 'analyze_goal', amountUsd: 0 },
    { type: 'send_private_key', amountUsd: 0 },
    { type: 'generate_result', amountUsd: 0 }
  ];

  chain.add('retry_demo_start', { goal });
  chain.add('attempt_started', { attempt: 1, plan: firstPlan });

  for (const step of firstPlan) {
    const check = enforcePolicy(step);
    if (!check.ok) {
      chain.add('policy_block', { attempt: 1, step, reason: check.reason });
      chain.add('retry_triggered', { reason: check.reason, fromAttempt: 1, toAttempt: 2 });
      const secondPlan = [
        { type: 'analyze_goal', amountUsd: 0 },
        { type: 'query_market_data', amountUsd: 0 },
        { type: 'generate_result', amountUsd: 0 }
      ];
      try {
        const result = await run(goal, secondPlan);
        result.retried = true;
        result.receipts = [...chain.entries, ...result.receipts];
        return res.status(200).json(result);
      } catch (e) {
        return res.status(400).json({ ok: false, retried: true, error: e.message, receipts: chain.entries });
      }
    }
  }

  return res.status(400).json({ ok: false, error: 'Retry path did not trigger policy block' });
};
