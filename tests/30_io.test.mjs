import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../mutex_core.js';
import { stepUntil, inCS } from './helpers.mjs';

test('exportStateObject covers TokenRing branch with inCS and metrics', () => {
  const model = core.makeModel(4, 'TokenRing');
  core.requestCS(model, 'P1');
  stepUntil(core, model, () => inCS(core, model, 'P1'), 50, 'P1 enters');
  core.crashProcess(model, 'P4');

  const obj = core.exportStateObject(model);
  assert.equal(obj.algorithm, 'TokenRing');
  assert.equal(obj.derived.inCS, 'P1');
  assert.equal(obj.processes.length, 4);
  assert.equal(obj.token.holder, 'P1');
});

test('exportStateObject covers RA branch with queue and dropNextSend', () => {
  const model = core.makeModel(3, 'RA');
  core.requestCS(model, 'P1');
  core.toggleDropNextSend(model);

  const obj = core.exportStateObject(model);
  assert.equal(obj.algorithm, 'RA');
  assert.equal(Array.isArray(obj.network.queue), true);
  assert.equal(typeof obj.network.nextMsgId, 'number');
  assert.equal(obj.network.dropNextSend, true);
});

test('loadFromJsonObject handles MutexDemo for TokenRing and RA, event sorting and defaults', () => {
  const trDemo = {
    type: 'MutexDemo',
    algorithm: 'TokenRing',
    processes: ['P1', 'P2'],
    events: [{ t: 9, op: 'dropToken' }, { t: 1, op: 'requestCS', on: 'P1' }],
    meta: { description: 'TR demo' }
  };
  const trModel = core.loadFromJsonObject(trDemo);
  assert.equal(trModel.mode, 'script');
  assert.equal(trModel.algorithm, 'TokenRing');
  assert.equal(trModel.script.events[0].t, 1);
  assert.equal(trModel.token.lost, false);

  const raDemo = {
    type: 'MutexDemo',
    algorithm: 'RA',
    processes: ['P1', 'P2'],
    events: [{ t: 2, op: 'deliver' }, { t: 1, op: 'requestCS', on: 'P1' }],
    meta: { description: 'RA demo' }
  };
  const raModel = core.loadFromJsonObject(raDemo);
  assert.equal(raModel.mode, 'script');
  assert.equal(raModel.algorithm, 'RA');
  assert.equal(raModel.script.events[0].t, 1);
});

test('loadFromJsonObject handles full MutexState mapping for TokenRing and RA', () => {
  const trState = {
    type: 'MutexState',
    algorithm: 'TokenRing',
    processes: [
      { id: 'P1', requesting: true, inCS: false, crashed: false },
      { id: 'P2', requesting: false, inCS: false, crashed: true }
    ],
    ring: ['P1', 'P2'],
    token: { holder: 'P1', lost: false }
  };
  const tr = core.loadFromJsonObject(trState);
  assert.equal(core.getProc(tr, 'P1').requesting, true);
  assert.equal(core.getProc(tr, 'P2').crashed, true);
  assert.equal(tr.token.holder, 'P1');

  const raState = {
    type: 'MutexState',
    algorithm: 'RA',
    processes: [
      { id: 'P1', requesting: true, inCS: false, crashed: false, clock: 5, reqTs: 2, awaiting: ['P2'], deferred: [] },
      { id: 'P2', requesting: false, inCS: false, crashed: false, clock: 1, reqTs: null, awaiting: [], deferred: [] }
    ],
    ring: ['P1', 'P2'],
    network: { nextMsgId: 7, dropNextSend: true, queue: [{ id: 1, type: 'REQUEST', from: 'P1', to: 'P2', ts: 2 }] }
  };
  const ra = core.loadFromJsonObject(raState);
  assert.equal(core.getProc(ra, 'P1').clock, 5);
  assert.equal(core.getProc(ra, 'P1').awaiting.length, 1);
  assert.equal(ra.network.nextMsgId, 7);
  assert.equal(ra.network.dropNextSend, true);
  assert.equal(ra.network.queue.length, 1);
});

test('loadFromJsonObject invalid formats and algorithms throw', () => {
  assert.throws(() => core.loadFromJsonObject(null), /Invalid JSON object/);
  assert.throws(() => core.loadFromJsonObject({ type: 'MutexDemo', algorithm: 'Other' }), /Only TokenRing and RA/);
  assert.throws(() => core.loadFromJsonObject({ type: 'MutexState', algorithm: 'Other' }), /Only TokenRing and RA/);
  assert.throws(() => core.loadFromJsonObject({ type: 'Other' }), /Unsupported JSON format/);
});

test('script mode edge cases: no events and already-finished script', () => {
  const model = core.makeModel(2, 'RA');
  model.mode = 'script';
  model.script.events = [];
  model.script.index = 0;

  let r = core.stepOnce(model);
  assert.equal(r.reason, 'no_events');

  model.script.events = [{ t: 0, op: 'requestCS', on: 'P1' }];
  model.script.index = 1;
  r = core.stepOnce(model);
  assert.equal(r.type, 'script_done');
});