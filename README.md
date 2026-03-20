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

## Quick Start
```bash
cd receiptpilot
npm install
npm run dev
```

## Submission Notes
Use one project submission with all 3 track UUIDs in `trackUUIDs`.
