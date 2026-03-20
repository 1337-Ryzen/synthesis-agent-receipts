import { enforcePolicy, policy } from './policy.js';

async function fetchEthPriceUsd() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const j = await r.json();
    return { ok: true, source: 'coingecko', ethUsd: j?.ethereum?.usd ?? null };
  } catch (e) {
    return { ok: false, source: 'coingecko', error: String(e.message || e) };
  }
}

async function fetchRepoStats() {
  try {
    const r = await fetch('https://api.github.com/repos/1337-Ryzen/synthesis-agent-receipts', {
      headers: { 'User-Agent': 'ReceiptPilot' }
    });
    const j = await r.json();
    return {
      ok: true,
      source: 'github',
      stars: j?.stargazers_count ?? 0,
      openIssues: j?.open_issues_count ?? 0,
      defaultBranch: j?.default_branch ?? 'main'
    };
  } catch (e) {
    return { ok: false, source: 'github', error: String(e.message || e) };
  }
}

async function executeStep(step) {
  if (step.type === 'query_market_data') return fetchEthPriceUsd();
  if (step.type === 'query_repo_health') return fetchRepoStats();
  if (step.type === 'evaluate_risk_score') return { ok: true, source: 'risk-engine', score: 0.12, verdict: 'low-risk' };
  return { ok: true, source: 'internal', detail: `Executed ${step.type}` };
}

export async function runAutonomousTask({ goal, chain, proposedPlan }) {
  const budget = { maxActions: policy.maxActionsPerRun, usedActions: 0, maxUsdPerAction: policy.maxUsdPerAction };
  chain.add('goal_received', { goal });

  const defaultPlan = [
    { type: 'analyze_goal', amountUsd: 0 },
    { type: 'query_market_data', amountUsd: 0 },
    { type: 'query_repo_health', amountUsd: 0 },
    { type: 'evaluate_risk_score', amountUsd: 0 },
    { type: 'generate_result', amountUsd: 0 }
  ];

  const plan = Array.isArray(proposedPlan) && proposedPlan.length ? proposedPlan : defaultPlan;
  chain.add('plan_created', { plan, limits: policy, budget });

  const outputs = [];
  for (const step of plan.slice(0, policy.maxActionsPerRun)) {
    const check = enforcePolicy(step);
    if (!check.ok) {
      chain.add('policy_block', { step, reason: check.reason });
      throw new Error(check.reason);
    }

    budget.usedActions += 1;
    const toolResult = await executeStep(step);
    const result = { step: step.type, status: 'ok', toolResult };
    outputs.push(result);
    chain.add('action_executed', result);
  }

  const final = {
    summary: `Completed ${outputs.length} actions with ${budget.usedActions}/${budget.maxActions} action budget`,
    outputs,
    budget
  };
  chain.add('final_result', final);

  const verify = chain.verify();
  chain.add('verification', verify);

  return { final, verify };
}
