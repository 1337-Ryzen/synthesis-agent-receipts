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

## Quick Start
```bash
cd receiptpilot
npm install
npm run dev
```

## Submission Notes
Use one project submission with all 3 track UUIDs in `trackUUIDs`.
