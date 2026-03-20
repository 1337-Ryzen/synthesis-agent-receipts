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
- `src/orchestrator.ts` — goal → plan → execute → verify loop
- `src/receiptChain.ts` — hash-chained receipt ledger
- `src/policy.ts` — guardrails (spending/risk limits)
- `src/server.ts` — HTTP service endpoint for external calls
- `docs/demo-script.md` — 3–5 min judge demo flow

## Quick Start
```bash
cd receiptpilot
npm install
npm run dev
```

## Submission Notes
Use one project submission with all 3 track UUIDs in `trackUUIDs`.
