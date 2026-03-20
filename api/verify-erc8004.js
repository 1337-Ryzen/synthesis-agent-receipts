const REG_TX = '0x1f19e3b52818e0b7f7380efb745765495912007ce95d4cb21cb0d78117047ccb';
const CUSTODY_TX = '0x47f881379894a19d6abf653f5fbb28bd440c3003642c617780b3cf331a48f13f';

async function exists(txHash) {
  const payload = { jsonrpc: '2.0', id: 1, method: 'eth_getTransactionByHash', params: [txHash] };
  const r = await fetch('https://mainnet.base.org', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const j = await r.json();
  return Boolean(j?.result?.hash);
}

export default async function handler(_req, res) {
  try {
    const [registrationFound, selfCustodyFound] = await Promise.all([exists(REG_TX), exists(CUSTODY_TX)]);
    res.status(200).json({ ok: true, registrationTx: REG_TX, selfCustodyTx: CUSTODY_TX, registrationFound, selfCustodyFound });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
