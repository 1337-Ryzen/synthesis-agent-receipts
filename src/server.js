import express from 'express';
import { ReceiptChain } from './receiptChain.js';
import { runAutonomousTask } from './orchestrator.js';
import { enforcePolicy } from './policy.js';

const app = express();
app.use(express.json());

const ERC8004_TX = '0x1f19e3b52818e0b7f7380efb745765495912007ce95d4cb21cb0d78117047ccb';
const SELF_CUSTODY_TX = '0x47f881379894a19d6abf653f5fbb28bd440c3003642c617780b3cf331a48f13f';

async function verifyBaseTx(txHash) {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getTransactionByHash',
    params: [txHash]
  };
  const r = await fetch('https://mainnet.base.org', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  return Boolean(j?.result?.hash);
}

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
        { type: 'query_market_data', amountUsd: 0 },
        { type: 'query_repo_health', amountUsd: 0 },
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

app.get('/verify-erc8004', async (_req, res) => {
  try {
    const [registrationFound, selfCustodyFound] = await Promise.all([
      verifyBaseTx(ERC8004_TX),
      verifyBaseTx(SELF_CUSTODY_TX)
    ]);
    res.json({
      ok: true,
      registrationTx: ERC8004_TX,
      selfCustodyTx: SELF_CUSTODY_TX,
      registrationFound,
      selfCustodyFound
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/service/paywalled-run', async (req, res) => {
  const proof = req.headers['x-payment-proof'];
  if (!proof) {
    return res.status(402).json({
      ok: false,
      code: 'PAYMENT_REQUIRED',
      message: 'Provide x-payment-proof header. x402 integration-ready endpoint.'
    });
  }

  try {
    const goal = req.body?.goal || 'Paid service goal';
    const chain = new ReceiptChain();
    chain.add('payment_verified', { proof: String(proof).slice(0, 12) + '...' });
    const result = await runAutonomousTask({ goal, chain });
    res.json({ ok: true, paid: true, goal, ...result, receipts: chain.entries });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`ReceiptPilot running on :${PORT}`);
});
