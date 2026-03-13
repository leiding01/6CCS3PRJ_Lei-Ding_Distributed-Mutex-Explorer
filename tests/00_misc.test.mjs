import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../mutex_core.js';
import { lastTrace } from './helpers.mjs';

test('clampInt clamps and defaults correctly', () => {
  assert.equal(core.clampInt(5.9, 2, 8), 5);
  assert.equal(core.clampInt(-1, 2, 8), 2);
  assert.equal(core.clampInt(99, 2, 8), 8);
  assert.equal(core.clampInt('not-a-number', 2, 8), 2);
});

test('makeModel, getProc, anyInCS, alivePids, ringNextAlive basics', () => {
  const tr = core.makeModel(4, 'TokenRing');
  assert.equal(tr.algorithm, 'TokenRing');
  assert.equal(core.getProc(tr, 'P1').id, 'P1');
  assert.equal(core.anyInCS(tr), null);
  assert.deepEqual(core.alivePids(tr), ['P1', 'P2', 'P3', 'P4']);
  assert.equal(core.ringNextAlive(tr, 'P1'), 'P2');

  core.crashProcess(tr, 'P2');
  assert.deepEqual(core.alivePids(tr), ['P1', 'P3', 'P4']);
  assert.equal(core.ringNextAlive(tr, 'P1'), 'P3');

  const ra = core.makeModel(3, 'RA');
  assert.equal(ra.algorithm, 'RA');
});

test('checkSafety detects >1 process in CS', () => {
  const model = core.makeModel(3, 'RA');
  core.getProc(model, 'P1').inCS = true;
  core.getProc(model, 'P2').inCS = true;
  const safety = core.checkSafety(model);
  assert.equal(safety.ok, false);
  assert.match(safety.message, />1 process/);
});

test('public actions reject unsupported / not interactive cases', () => {
  const tr = core.makeModel(3, 'TokenRing');
  tr.mode = 'script';
  assert.equal(core.requestCS(tr, 'P1').ok, false);
  assert.equal(core.releaseCS(tr, 'P1').ok, false);
  assert.equal(core.dropToken(tr).ok, false);
  assert.equal(core.regenerateToken(tr).ok, false);
  assert.equal(core.crashProcess(tr, 'P1').ok, false);
  assert.equal(core.recoverProcess(tr, 'P1').ok, false);

  const ra = core.makeModel(3, 'RA');
  assert.equal(core.dropToken(ra).reason, 'unsupported_algorithm');
  assert.equal(core.regenerateToken(ra).reason, 'unsupported_algorithm');
  assert.equal(core.dropNextMessage(core.makeModel(3, 'TokenRing')).reason, 'unsupported_algorithm');
  assert.equal(core.toggleDropNextSend(core.makeModel(3, 'TokenRing')).reason, 'unsupported_algorithm');
});

test('stepOnce reports unsupported algorithm paths', () => {
  const model = core.makeModel(3, 'RA');
  model.algorithm = 'Bogus';
  const res = core.stepOnce(model);
  assert.equal(res.reason, 'unsupported_algorithm');
  assert.match(lastTrace(model), /Unsupported algorithm/);

  model.mode = 'script';
  model.script.events = [{ t: 0, op: 'noop' }];
  model.script.index = 0;
  const res2 = core.stepOnce(model);
  assert.equal(res2.reason, 'unsupported_algorithm');
  assert.match(lastTrace(model), /Unsupported algorithm in script/);
});