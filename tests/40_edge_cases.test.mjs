import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../mutex_core.js';
import { stepN, lastTrace } from './helpers.mjs';

test('TokenRing edge branches: no alive processes, unknown/crashed holder, token remains', () => {
  const model = core.makeModel(2, 'TokenRing');

  core.crashProcess(model, 'P2');
  let r = core.stepOnce(model);
  assert.equal(r.type, 'token_pass');
  assert.match(lastTrace(model), /Token remains at P1/);

  model.token.holder = 'PX';
  r = core.stepOnce(model);
  assert.equal(r.reason, 'unknown_holder');

  model.token.holder = 'P2';
  model.token.lost = false;
  r = core.stepOnce(model);
  assert.equal(r.reason, 'token_lost');

  core.crashProcess(model, 'P1');
  const regen = core.regenerateToken(model);
  assert.equal(regen.reason, 'no_alive_processes');

  model.ring = [];
  assert.equal(core.ringNextAlive(model, 'P1'), 'P1');
});

test('comparePid fallback path via RA script with non-numeric process IDs', () => {
  const demo = {
    type: 'MutexDemo',
    algorithm: 'RA',
    processes: ['PA', 'PB'],
    events: [
      { t: 0, op: 'requestCS', on: 'PA' },
      { t: 1, op: 'requestCS', on: 'PB' },
      { t: 2, op: 'deliverNext' },
      { t: 3, op: 'deliverNext' },
      { t: 4, op: 'deliverNext' }
    ]
  };

  const model = core.loadFromJsonObject(demo);
  stepN(core, model, 5);
  assert.ok(model.trace.some(e => /enters the critical section/.test(e.text)));
});

test('RA edge branches: crashed receiver drop and unsupported message type', () => {
  const model = core.makeModel(3, 'RA');

  core.requestCS(model, 'P1');
  core.crashProcess(model, 'P1');

  model.network.queue.unshift({ id: 999, type: 'REPLY', from: 'P2', to: 'P1', ts: 1 });
  let r = core.stepOnce(model);
  assert.equal(r.type, 'message_dropped');
  assert.match(lastTrace(model), /Message dropped: REPLY #999 P2 -> P1 \(receiver crashed\)/);

  const model2 = core.makeModel(2, 'RA');
  model2.network.queue.push({ id: 1, type: 'BOGUS', from: 'P1', to: 'P2', ts: 1 });
  r = core.stepOnce(model2);
  assert.equal(r.type, 'message_delivered');
  assert.match(lastTrace(model2), /Unsupported message type/);
});

test('script bad-event branches for TokenRing and RA are covered', () => {
  const trDemo = {
    type: 'MutexDemo',
    algorithm: 'TokenRing',
    processes: ['P1', 'P2'],
    events: [
      {},
      { t: 1, op: 'holdToken' },
      { t: 2, op: 'passToken' },
      { t: 3, op: 'requestCS' },
      { t: 4, op: 'requestCS', on: 'PX' },
      { t: 5, op: 'releaseCS' },
      { t: 6, op: 'releaseCS', on: 'PX' },
      { t: 7, op: 'crash' },
      { t: 8, op: 'recover' }
    ]
  };
  const tr = core.loadFromJsonObject(trDemo);
  stepN(core, tr, trDemo.events.length);
  const trTrace = tr.trace.map(e => e.text).join('\n');
  assert.match(
    trTrace,
    /missing op|holdToken skipped|passToken skipped|requestCS skipped|releaseCS skipped|crash skipped|recover skipped/
  );

  const raDemo = {
    type: 'MutexDemo',
    algorithm: 'RA',
    processes: ['P1', 'P2'],
    events: [
      {},
      { t: 1, op: 'requestCS' },
      { t: 2, op: 'releaseCS' },
      { t: 3, op: 'crash' },
      { t: 4, op: 'recover' }
    ]
  };
  const ra = core.loadFromJsonObject(raDemo);
  stepN(core, ra, raDemo.events.length);
  const raTrace = ra.trace.map(e => e.text).join('\n');
  assert.match(
    raTrace,
    /missing op|requestCS skipped|releaseCS skipped|crash skipped|recover skipped/
  );
});

test('exportStateObject default branch and load MutexState defaults/optional branches', () => {
  const weird = { algorithm: 'Other', mode: 'interactive', processes: [] };
  const obj = core.exportStateObject(weird);
  assert.equal(obj.type, 'MutexState');
  assert.equal(obj.algorithm, 'Other');
  assert.equal(obj.mode, 'interactive');

  const trState = {
    type: 'MutexState',
    algorithm: 'TokenRing',
    ring: ['P1', 'P2'],
    token: { holder: 'P2', lost: true }
  };
  const tr = core.loadFromJsonObject(trState);
  assert.equal(tr.token.holder, 'P2');
  assert.equal(tr.token.lost, true);

  const raState = {
    type: 'MutexState',
    algorithm: 'RA',
    ring: ['P1', 'P2'],
    network: { nextMsgId: 7, dropNextSend: true, queue: [] }
  };
  const ra = core.loadFromJsonObject(raState);
  assert.equal(ra.network.nextMsgId, 7);
  assert.equal(ra.network.dropNextSend, true);
});