import express from 'express';
import { ReceiptChain } from './receiptChain.js';
import { runAutonomousTask } from './orchestrator.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'receiptpilot' });
});

app.post('/run', async (req, res) => {
  try {
    const goal = req.body?.goal || 'No goal provided';
    const chain = new ReceiptChain();
    const result = await runAutonomousTask({ goal, chain });
    res.json({ ok: true, goal, ...result, receipts: chain.entries });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`ReceiptPilot running on :${PORT}`);
});
