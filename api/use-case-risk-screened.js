import { run } from './_core.js';

const REG_TX = '0x1f19e3b52818e0b7f7380efb745765495912007ce95d4cb21cb0d78117047ccb';

async function exists(txHash) {
  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_getTransactionByHash', params: [txHash] };
  const r = await fetch('https://mainnet.base.org', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const j = await r.json();
  return Boolean(j?.result?.hash);
}

export default async function handler(req, res) {
  try {
    const trusted = await exists(REG_TX);
    if (!trusted) return res.status(403).json({ ok: false, reason: 'ERC-8004 trust check failed' });

    const body = req.body || {};
    const goal = body.goal || 'Run a risk-screened autonomous execution for operations team';
    const plan = [
      { type: 'analyze_goal', amountUsd: 0 },
      { type: 'query_market_data', amountUsd: 0 },
      { type: 'query_repo_health', amountUsd: 0 },
      { type: 'evaluate_risk_score', amountUsd: 0 },
      { type: 'generate_result', amountUsd: 0 }
    ];

    const result = await run(goal, plan);
    result.trustGate = { erc8004RegistrationVerified: true, tx: REG_TX };
    result.impact = {
      useCase: 'Risk-screened execution assistant for operations teams',
      outcome: 'Automates checks and returns auditable receipts before execution approval'
    };
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }
}
