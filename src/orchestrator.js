import { enforcePolicy, policy } from './policy.js';

export async function runAutonomousTask({ goal, chain, proposedPlan }) {
  chain.add('goal_received', { goal });

  const defaultPlan = [
    { type: 'analyze_goal', amountUsd: 0 },
    { type: 'query_service', amountUsd: 0 },
    { type: 'generate_result', amountUsd: 0 }
  ];

  const plan = Array.isArray(proposedPlan) && proposedPlan.length ? proposedPlan : defaultPlan;
  chain.add('plan_created', { plan, limits: policy });

  const outputs = [];
  for (const step of plan.slice(0, policy.maxActionsPerRun)) {
    const check = enforcePolicy(step);
    if (!check.ok) {
      chain.add('policy_block', { step, reason: check.reason });
      throw new Error(check.reason);
    }

    // Placeholder tool execution
    const result = { step: step.type, status: 'ok', data: `Executed ${step.type}` };
    outputs.push(result);
    chain.add('action_executed', result);
  }

  const final = { summary: `Completed ${outputs.length} actions`, outputs };
  chain.add('final_result', final);

  const verify = chain.verify();
  chain.add('verification', verify);

  return { final, verify };
}
