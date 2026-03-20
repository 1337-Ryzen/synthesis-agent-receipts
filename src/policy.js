export const policy = {
  maxUsdPerAction: 25,
  maxActionsPerRun: 10,
  blockedActions: ['send_private_key', 'raw_secret_export']
};

export function enforcePolicy(action) {
  if (policy.blockedActions.includes(action.type)) {
    return { ok: false, reason: `Blocked action type: ${action.type}` };
  }

  if (typeof action.amountUsd === 'number' && action.amountUsd > policy.maxUsdPerAction) {
    return { ok: false, reason: `Amount exceeds limit: $${action.amountUsd}` };
  }

  return { ok: true };
}
