# ReceiptPilot

Autonomous agent service with verifiable action receipts.

## Target Tracks
- Agents With Receipts — ERC-8004
- Let the Agent Cook — No Humans Required
- Agent Services on Base

## Core Loop
1. Discover goal/context
2. Plan actions
3. Execute tools
4. Verify outcomes
5. Emit tamper-evident receipts

## MVP Components
- `src/orchestrator.js` — goal → plan → execute → verify loop
- `src/receiptChain.js` — hash-chained receipt ledger
- `src/policy.js` — guardrails (spending/risk limits)
- `src/server.js` — HTTP service endpoint for external calls
- `agent.json` — agent capability manifest (DevSpot-style)
- `agent_log.json` — structured autonomous execution log
- `docs/demo-script.md` — 3–5 min judge demo flow

## Judge Mapping
- **Let the Agent Cook**: autonomous loop + tool orchestration + policy guardrails.
- **Agents With Receipts — ERC-8004**: agent identity + registration tx + tamper-evident receipt chain.
- **Agent Services on Base**: reusable service endpoint (`POST /run`) for agent/human consumers.

## Let the Agent Cook Compliance
- **Full autonomous loop**: discover → plan → execute → verify via `runAutonomousTask`.
- **Structured logs**: run receipts + `agent_log.json` for machine-readable traceability.
- **Safety guardrails**: blocked action types and per-action spend limits in `src/policy.js`.
- **Self-correction/retry**: `POST /run-with-retry-demo` intentionally triggers a blocked unsafe action, then retries with a safe plan.
- **Compute budget awareness**: action budget is included in run results.
- **Clear output artifact**: API returns final result + full receipt chain with integrity verification.

## ERC-8004 + Base Service Enhancements
- **Onchain verification endpoint**: `GET /verify-erc8004` verifies registration + self-custody tx existence on Base RPC.
- **Trust-gated impact endpoint**: `POST /use-case/risk-screened-execution` (or `/api/use-case-risk-screened`) verifies ERC-8004 registration before risk-screened execution.
- **Agent service endpoint**: `POST /run` for standard service execution.
- **Payment-gated endpoint**: `POST /service/paywalled-run` (or `/api/paywalled-run` on Vercel) with `x-payment-proof` header (x402 integration-ready flow).
- **Judge GUI**: root `index.html` includes an interaction panel for health, run, retry, onchain verification, impact use-case, and paid run demos.

## Track 2 Final Polish — Agents With Receipts (ERC-8004)
- **ERC-8004 identity proof**: registration transaction linked and publicly verifiable.
- **Onchain trust checks**: `GET /verify-erc8004` (and `/api/verify-erc8004`) verifies registration + self-custody tx existence on Base.
- **Trust-gated execution**: `POST /use-case/risk-screened-execution` (and `/api/use-case-risk-screened`) requires successful ERC-8004 trust check before autonomous run.
- **Required artifacts present**: `agent.json` capability manifest + `agent_log.json` structured execution log + receipt chain output.

## Track 3 Final Polish — Agent Services on Base
- **Service endpoint**: `POST /run` (and `/api/run`) for reusable task execution.
- **Payment-gated endpoint**: `POST /service/paywalled-run` (and `/api/paywalled-run`) with `x-payment-proof` header and `402 PAYMENT_REQUIRED` path.
- **Discoverability**: live deployed surface at Vercel + clear quick links for judges.
- **Commercial readiness narrative**: x402-integration-ready flow for monetizable agent services.

## Impact (Stronger Business Outcomes)
- **Operational speed**: consolidates multiple manual checks into a single autonomous run with receipts.
- **Risk control**: unsafe actions are blocked and automatically corrected before execution proceeds.
- **Trust assurance**: ERC-8004 identity proof is checked before trust-gated scenarios.
- **Auditability**: every critical step is traceable, reducing ambiguity during compliance or incident review.
- **Service readiness**: payment-gated route enables monetizable agent-service workflows.

### Outcome Metrics (Judge-facing)
- **Manual checks consolidated**: `5 → 1` autonomous run
- **Unsafe action handling**: `100% blocked` in policy test path
- **Self-correction**: `1 automatic retry` from blocked step to successful completion
- **Tool orchestration depth**: CoinGecko + GitHub API + Alternative.me sentiment + Base RPC trust verification

## Quick Start
```bash
cd receiptpilot
npm install
npm run dev
```

## Judge Rubric Mapping

### Let the Agent Cook
| Criterion | Implementation | Proof |
|---|---|---|
| Autonomous loop | `src/orchestrator.js`, `/api/run` | `docs/evidence/let-agent-cook-proof.json` |
| Guardrails + retry | `src/policy.js`, `/api/run-retry-demo` | `docs/evidence/let-agent-cook-proof.json` |
| Tool orchestration | CoinGecko + GitHub + sentiment calls | landing page + run responses |
| Structured logs | `agent_log.json`, receipt chain | `agent_log.json` |

### Agents With Receipts — ERC-8004
| Criterion | Implementation | Proof |
|---|---|---|
| Identity + operator model | `agent.json` | `docs/evidence/erc8004-proof.json` |
| Onchain verifiability | `/api/verify-erc8004` | `docs/evidence/erc8004-proof.json` |
| Trust-gated flow | `/api/use-case-risk-screened` | endpoint response + receipts |
| DevSpot artifacts | `agent.json`, `agent_log.json` | repo root |

### Agent Services on Base
| Criterion | Implementation | Proof |
|---|---|---|
| Discoverable service | Vercel landing + `/api/run` | deployed URL + judge panel |
| Payment flow | `/api/paywalled-run` | `docs/evidence/base-service-proof.json` |
| Utility output | structured result + receipts | `/api/run`, `/api/use-case-risk-screened` |

## Production Readiness Next
- Wire full x402 settlement verification instead of demo payment-proof header.
- Add deeper ERC-8004 registry interactions (reputation/validation updates) where applicable.
- Add authenticated API keys, tenant isolation, and rate limiting for multi-user operation.
- Add observability stack (request tracing, error telemetry, receipt archival retention policy).
- Add multi-agent coordination mode (planner/executor/verifier specialization) for larger workloads.

## Submission Notes
Use one project submission with all 3 track UUIDs in `trackUUIDs`.
