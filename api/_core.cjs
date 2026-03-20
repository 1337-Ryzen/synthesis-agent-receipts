const crypto = require('crypto');

const policy = {
  maxUsdPerAction: 25,
  maxActionsPerRun: 10,
  blockedActions: ['send_private_key', 'raw_secret_export']
};

function hashEntry(body) {
  return crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
}

function makeChain() {
  const entries = [];
  return {
    add(type, payload) {
      const prevHash = entries.length ? entries[entries.length - 1].hash : 'GENESIS';
      const safePayload = payload === undefined ? null : JSON.parse(JSON.stringify(payload));
      const body = { index: entries.length, type, timestamp: new Date().toISOString(), payload: safePayload, prevHash };
      const hash = hashEntry(body);
      const entry = { ...body, hash };
      entries.push(entry);
      return entry;
    },
    verify() {
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const expectedPrev = i === 0 ? 'GENESIS' : entries[i - 1].hash;
        if (e.prevHash !== expectedPrev) return { ok: false, index: i, reason: 'prevHash mismatch' };
      }
      return { ok: true, count: entries.length };
    },
    entries
  };
}

function enforcePolicy(step) {
  if (policy.blockedActions.includes(step.type)) return { ok: false, reason: `Blocked action type: ${step.type}` };
  if (typeof step.amountUsd === 'number' && step.amountUsd > policy.maxUsdPerAction) {
    return { ok: false, reason: `Amount exceeds limit: $${step.amountUsd}` };
  }
  return { ok: true };
}

async function fetchEthPriceUsd() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const j = await r.json();
    return { ok: true, source: 'coingecko', ethUsd: j?.ethereum?.usd ?? null };
  } catch (e) {
    return { ok: false, source: 'coingecko', error: String(e.message || e) };
  }
}

async function run(goal, plan) {
  const chain = makeChain();
  const budget = { maxActions: policy.maxActionsPerRun, usedActions: 0, maxUsdPerAction: policy.maxUsdPerAction };
  const p = plan && plan.length ? plan : [
    { type: 'analyze_goal', amountUsd: 0 },
    { type: 'query_market_data', amountUsd: 0 },
    { type: 'generate_result', amountUsd: 0 }
  ];

  chain.add('goal_received', { goal });
  chain.add('plan_created', { plan: p, limits: policy, budget });

  const outputs = [];
  for (const step of p.slice(0, policy.maxActionsPerRun)) {
    const check = enforcePolicy(step);
    if (!check.ok) {
      chain.add('policy_block', { step, reason: check.reason });
      throw new Error(check.reason);
    }
    budget.usedActions += 1;
    const toolResult = step.type === 'query_market_data' ? await fetchEthPriceUsd() : { ok: true, source: 'internal', detail: `Executed ${step.type}` };
    const out = { step: step.type, status: 'ok', toolResult };
    outputs.push(out);
    chain.add('action_executed', out);
  }

  const final = { summary: `Completed ${outputs.length} actions`, outputs, budget };
  chain.add('final_result', final);
  const verify = chain.verify();
  chain.add('verification', verify);

  return { ok: true, goal, final, verify, receipts: chain.entries };
}

module.exports = { run, makeChain, enforcePolicy, policy };
