import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../mutex_core.js';
import { stepN, stepUntil, lastTrace, assertSafety, inCS } from './helpers.mjs';

test('RA basic request / entry / release', () => {
  const model = core.makeModel(4, 'RA');

  assert.equal(core.requestCS(model, 'P1').ok, true);
  const p1 = core.getProc(model, 'P1');
  assert.equal(p1.requesting, true);
  assert.equal(p1.awaiting.length, 3);

  stepUntil(core, model, () => inCS(core, model, 'P1'), 500, 'P1 enters');
  assertSafety(core, model);
  assert.equal(p1.requesting, false);

  assert.equal(core.releaseCS(model, 'P1').ok, true);
  stepN(core, model, 20);
  assertSafety(core, model);
});

test('RA invalid action cases and toggleDropNextSend arms/disarms', () => {
  const model = core.makeModel(3, 'RA');

  assert.equal(core.requestCS(model, 'P9').reason, 'unknown_process');
  assert.equal(core.releaseCS(model, 'P1').reason, 'not_in_cs');

  core.crashProcess(model, 'P2');
  assert.equal(core.requestCS(model, 'P2').reason, 'crashed');

  assert.equal(core.toggleDropNextSend(model).ok, true);
  assert.equal(model.network.dropNextSend, true);
  assert.match(lastTrace(model), /Fault armed/);

  assert.equal(core.toggleDropNextSend(model).ok, true);
  assert.equal(model.network.dropNextSend, false);
  assert.match(lastTrace(model), /Fault disarmed/);
});

test('RA tie-break by numeric PID when timestamps are equal', () => {
  const demo = {
    type: 'MutexDemo',
    algorithm: 'RA',
    processes: ['P2', 'P10'],
    ring: ['P2', 'P10'],
    meta: { description: 'Tie-break' },
    events: [
      { t: 0, op: 'requestCS', on: 'P2' },
      { t: 1, op: 'requestCS', on: 'P10' },
      { t: 2, op: 'deliverNext' },
      { t: 3, op: 'deliverNext' },
      { t: 4, op: 'deliverNext' },
      { t: 5, op: 'releaseCS', on: 'P2' },
      { t: 6, op: 'deliverNext' },
      { t: 7, op: 'releaseCS', on: 'P10' }
    ]
  };

  const model = core.loadFromJsonObject(demo);
  stepN(core, model, 5);
  assert.equal(inCS(core, model, 'P2'), true);
  assert.equal(inCS(core, model, 'P10'), false);

  stepN(core, model, 10);
  assert.match(model.trace.map(e => e.text).join('\n'), /P10 enters the critical section/);
});

test('RA tie-break reaches numeric-equality compare branch with P1 vs P01', () => {
  const demo = {
    type: 'MutexDemo',
    algorithm: 'RA',
    processes: ['P1', 'P01'],
    events: [
      { t: 0, op: 'requestCS', on: 'P1' },
      { t: 1, op: 'requestCS', on: 'P01' },
      { t: 2, op: 'deliverNext' },
      { t: 3, op: 'deliverNext' },
      { t: 4, op: 'deliverNext' },
      { t: 5, op: 'deliverNext' }
    ]
  };

  const model = core.loadFromJsonObject(demo);
  stepN(core, model, 6);
  const trace = model.trace.map(e => e.text).join('\n');
  assert.match(trace, /sends REPLY|defers REPLY/);
});

test('RA drop-next-send produces expected stall with explicit waiting reason', () => {
  const model = core.makeModel(4, 'RA');

  assert.equal(core.toggleDropNextSend(model).armed, true);
  core.requestCS(model, 'P1');

  stepN(core, model, 500);
  assert.equal(inCS(core, model, 'P1'), false);

  const res = core.stepOnce(model);
  assert.equal(res.reason, 'waiting_replies');
  assert.match(lastTrace(model), /Stalled: P1 is waiting for REPLY from/);
  assertSafety(core, model);
});

test('RA dropNextMessage drops queue head and can stall safely', () => {
  const model = core.makeModel(4, 'RA');

  core.requestCS(model, 'P1');
  assert.equal(model.network.queue.length, 3);

  assert.equal(core.dropNextMessage(model).ok, true);
  assert.equal(model.metrics.messagesDropped >= 1, true);

  stepN(core, model, 500);
  assertSafety(core, model);

  const res = core.stepOnce(model);
  assert.ok(['waiting_replies', 'no_messages'].includes(res.reason));
});

test('RA release sends deferred replies and skips crashed deferred target', () => {
  const model = core.makeModel(3, 'RA');

  core.requestCS(model, 'P1');
  core.requestCS(model, 'P2');
  stepUntil(core, model, () => inCS(core, model, 'P1'), 500, 'P1 enters');

  const p1 = core.getProc(model, 'P1');
  assert.deepEqual(p1.deferred, ['P2']);

  core.crashProcess(model, 'P2');
  const beforeSent = model.metrics.messagesSent;
  const rel = core.releaseCS(model, 'P1');
  assert.equal(rel.ok, true);
  assert.equal(model.metrics.messagesSent, beforeSent);
  assert.match(model.trace.map(e => e.text).join('\n'), /sends deferred REPLY to P2/);
});

test('RA stepOnce covers no_messages and release_required branches', () => {
  const model = core.makeModel(2, 'RA');

  let r = core.stepOnce(model);
  assert.equal(r.reason, 'no_messages');
  assert.match(lastTrace(model), /No progress: no messages in flight/);

  core.getProc(model, 'P1').inCS = true;
  r = core.stepOnce(model);
  assert.equal(r.reason, 'release_required');
  assert.match(lastTrace(model), /release required/);
});

test('RA unexpected REPLY does not enter CS and returns message_delivered', () => {
  const model = core.makeModel(2, 'RA');
  model.network.queue.push({ id: 1, type: 'REPLY', from: 'P2', to: 'P1', ts: 1 });
  const r = core.stepOnce(model);
  assert.equal(r.type, 'message_delivered');
  assert.match(lastTrace(model), /receives REPLY from P2 \(unexpected\)|receives REPLY from P2 \(0 remaining\)/);
  assert.equal(inCS(core, model, 'P1'), false);
});

test('RA script-mode valid branches: release, dropNextMessage, crash, recover, unsupported', () => {
  const demo = {
    type: 'MutexDemo',
    algorithm: 'RA',
    processes: ['P1', 'P2'],
    events: [
      { t: 0, op: 'requestCS', on: 'P1' },
      { t: 1, op: 'deliverNext' },
      { t: 2, op: 'dropNextMessage' },
      { t: 3, op: 'crash', on: 'P2' },
      { t: 4, op: 'recover', on: 'P2' },
      { t: 5, op: 'releaseCS', on: 'P1' },
      { t: 6, op: 'unsupported' }
    ]
  };

  const model = core.loadFromJsonObject(demo);
  stepN(core, model, demo.events.length + 2);
  const trace = model.trace.map(e => e.text).join('\n');
  assert.match(trace, /Fault injected: dropped|Fault injected: P2 crashed|Recovery: P2 recovered|unsupported op/);
});