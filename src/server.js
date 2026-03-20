import express from 'express';
import { ReceiptChain } from './receiptChain.js';
import { runAutonomousTask } from './orchestrator.js';
import { enforcePolicy } from './policy.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'receiptpilot' });
});

app.post('/run', async (req, res) => {
  try {
    const goal = req.body?.goal || 'No goal provided';
    const proposedPlan = req.body?.plan;
    const chain = new ReceiptChain();
    const result = await runAutonomousTask({ goal, proposedPlan, chain });
    res.json({ ok: true, goal, ...result, receipts: chain.entries });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/run-with-retry-demo', async (req, res) => {
  const goal = req.body?.goal || 'Retry demo goal';
  const chain = new ReceiptChain();

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
        { type: 'query_service', amountUsd: 0 },
        { type: 'generate_result', amountUsd: 0 }
      ];
      chain.add('attempt_started', { attempt: 2, plan: secondPlan });

      try {
        const result = await runAutonomousTask({ goal, proposedPlan: secondPlan, chain });
        return res.json({ ok: true, retried: true, goal, ...result, receipts: chain.entries });
      } catch (error) {
        return res.status(400).json({ ok: false, retried: true, error: error.message, receipts: chain.entries });
      }
    }
  }

  return res.status(400).json({ ok: false, error: 'Retry demo did not trigger policy block as expected' });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`ReceiptPilot running on :${PORT}`);
});
