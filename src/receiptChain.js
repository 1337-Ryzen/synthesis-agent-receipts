import crypto from 'node:crypto';

export class ReceiptChain {
  constructor() {
    this.entries = [];
  }

  add(type, payload) {
    const prevHash = this.entries.length ? this.entries[this.entries.length - 1].hash : 'GENESIS';
    const timestamp = new Date().toISOString();
    const body = { index: this.entries.length, type, timestamp, payload, prevHash };
    const hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
    const entry = { ...body, hash };
    this.entries.push(entry);
    return entry;
  }

  verify() {
    for (let i = 0; i < this.entries.length; i++) {
      const e = this.entries[i];
      const expectedPrev = i === 0 ? 'GENESIS' : this.entries[i - 1].hash;
      if (e.prevHash !== expectedPrev) return { ok: false, index: i, reason: 'prevHash mismatch' };
      const body = {
        index: e.index,
        type: e.type,
        timestamp: e.timestamp,
        payload: e.payload,
        prevHash: e.prevHash
      };
      const hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
      if (hash !== e.hash) return { ok: false, index: i, reason: 'hash mismatch' };
    }
    return { ok: true, count: this.entries.length };
  }
}
