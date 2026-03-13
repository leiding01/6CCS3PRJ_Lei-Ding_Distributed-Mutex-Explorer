import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../mutex_core.js';
import { stepN, stepUntil, lastTrace, assertSafety, inCS } from './helpers.mjs';

test('TokenRing basic request / entry / release / pass', () => {
  const model = core.makeModel(4, 'TokenRing');

  assert.equal(core.requestCS(model, 'P1').ok, true);
  stepUntil(core, model, () => inCS(core, model, 'P1'), 50, 'P1 enters');
  assertSafety(core, model);

  assert.equal(core.requestCS(model, 'P2').ok, true);
  stepN(core, model, 3);
  assert.equal(inCS(core, model, 'P1'), true);
  assert.equal(inCS(core, model, 'P2'), false);
  assert.match(lastTrace(model), /release required/);

  assert.equal(core.releaseCS(model, 'P1').ok, true);
  stepUntil(core, model, () => inCS(core, model, 'P2'), 100, 'P2 enters');
  assertSafety(core, model);
});

test('TokenRing invalid request / release cases', () => {
  const model = core.makeModel(3, 'TokenRing');
  assert.equal(core.requestCS(model, 'P9').reason, 'unknown_process');
  assert.equal(core.releaseCS(model, 'P1').reason, 'not_in_cs');

  assert.equal(core.requestCS(model, 'P1').ok, true);
  assert.equal(core.requestCS(model, 'P1').reason, 'already_requesting');

  stepUntil(core, model, () => inCS(core, model, 'P1'), 20, 'P1 enters');
  assert.equal(core.requestCS(model, 'P1').reason, 'already_in_cs');

  core.crashProcess(model, 'P2');
  assert.equal(core.requestCS(model, 'P2').reason, 'crashed');
});

test('TokenRing token loss and regeneration', () => {
  const model = core.makeModel(4, 'TokenRing');

  assert.equal(core.dropToken(model).ok, true);
  assert.equal(model.token.lost, true);

  assert.equal(core.requestCS(model, 'P1').ok, true);
  stepN(core, model, 2);
  assert.equal(inCS(core, model, 'P1'), false);
  assert.match(lastTrace(model), /token is lost/);

  assert.equal(core.regenerateToken(model).ok, true);
  stepUntil(core, model, () => inCS(core, model, 'P1'), 20, 'P1 enters after regen');
});

test('TokenRing crash / recover edge cases', () => {
  const model = core.makeModel(3, 'TokenRing');

  assert.equal(model.token.holder, 'P1');
  assert.equal(core.crashProcess(model, 'P1').ok, true);
  assert.equal(model.token.lost, true);
  assert.equal(core.crashProcess(model, 'P1').reason, 'already_crashed');

  assert.equal(core.recoverProcess(model, 'P1').ok, true);
  assert.equal(core.recoverProcess(model, 'P1').reason, 'not_crashed');

  assert.equal(core.regenerateToken(model).ok, true);

  core.requestCS(model, 'P1');
  stepUntil(core, model, () => inCS(core, model, 'P1'), 20, 'P1 enters');

  core.crashProcess(model, 'P1');
  const r = core.stepOnce(model);
  assert.equal(r.reason, 'token_lost');
  assert.match(model.trace.map(e => e.text).join('\n'), /crashed in the critical section|token is lost/);
});

test('TokenRing script-mode events cover normal and invalid paths', () => {
  const demo = {
    type: 'MutexDemo',
    algorithm: 'TokenRing',
    processes: ['P1', 'P2'],
    events: [
      {},
      { t: 1, op: 'holdToken', on: 'P2' },
      { t: 2, op: 'passToken', to: 'P1' },
      { t: 3, op: 'requestCS', on: 'P1' },
      { t: 4, op: 'releaseCS', on: 'P1' },
      { t: 5, op: 'releaseCS', on: 'P2' },
      { t: 6, op: 'dropToken' },
      { t: 7, op: 'regenerateToken', on: 'P2' },
      { t: 8, op: 'crash', on: 'P2' },
      { t: 9, op: 'recover', on: 'P2' },
      { t: 10, op: 'unknownOp' }
    ]
  };

  const model = core.loadFromJsonObject(demo);
  assert.equal(model.mode, 'script');

  stepN(core, model, demo.events.length + 2);
  const trace = model.trace.map(e => e.text).join('\n');
  assert.match(trace, /Loaded scripted scenario/);
  assert.match(trace, /Script finished/);
});