/*
  Smoke tests (no dependencies)

  Purpose:
  - Provide a minimal automated correctness check for core invariants.
  - Catch regressions when refactoring UI / core logic.

  Run:
    cd ds-mutex
    npm test
*/

import {
  makeModel,
  requestCS,
  releaseCS,
  stepOnce,
  checkSafety,
  dropToken,
  regenerateToken,
  dropNextMessage,
  toggleDropNextSend,
  anyInCS,
  getProc,
} from '../mutex_core.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function stepN(model, n) {
  for (let i = 0; i < n; i++) stepOnce(model);
}

function stepUntil(model, predicate, maxSteps, label) {
  for (let i = 0; i < maxSteps; i++) {
    stepOnce(model);
    if (predicate()) return i + 1;
  }
  throw new Error(`Timeout in stepUntil(${label}) after ${maxSteps} steps`);
}

function inCS(model, pid) {
  const p = getProc(model, pid);
  return !!p && !!p.inCS;
}

function runTR_basicMutex() {
  const model = makeModel(4, 'TokenRing');

  requestCS(model, 'P1');
  stepUntil(model, () => inCS(model, 'P1'), 50, 'TR enter P1');
  assert(checkSafety(model).ok, 'TR safety should be OK after P1 enters');

  requestCS(model, 'P2');
  stepN(model, 10);
  assert(inCS(model, 'P1'), 'TR: P1 should still be in CS before release');
  assert(!inCS(model, 'P2'), 'TR: P2 must not enter CS while P1 holds CS');

  releaseCS(model, 'P1');
  stepUntil(model, () => inCS(model, 'P2'), 100, 'TR enter P2');
  assert(checkSafety(model).ok, 'TR safety should remain OK after P2 enters');
}

function runTR_tokenLossRecovery() {
  const model = makeModel(4, 'TokenRing');

  dropToken(model);
  requestCS(model, 'P1');
  stepN(model, 5);
  assert(!inCS(model, 'P1'), 'TR: P1 should not enter CS while token is lost');

  regenerateToken(model);
  // Depending on implementation, regen may allow immediate entry or require a step.
  stepN(model, 2);
  assert(inCS(model, 'P1'), 'TR: P1 should enter CS after token regeneration');
}

function runRA_basicEntry() {
  const model = makeModel(4, 'RA');

  requestCS(model, 'P1');
  stepUntil(model, () => inCS(model, 'P1'), 2000, 'RA enter P1');
  assert(checkSafety(model).ok, 'RA safety should be OK after P1 enters');

  releaseCS(model, 'P1');
  // Drain any remaining messages (deferred replies).
  stepN(model, 200);
  assert(checkSafety(model).ok, 'RA safety should remain OK after release');
}

function runRA_tiebreak_pid() {
  const model = makeModel(2, 'RA');

  requestCS(model, 'P1');
  requestCS(model, 'P2');

  stepUntil(model, () => !!anyInCS(model), 2000, 'RA first entry');
  const who = anyInCS(model)?.id || null;
  assert(who === 'P1', `RA tie-break failed: expected P1 first, got ${who}`);
  assert(checkSafety(model).ok, 'RA safety should be OK in tie-break test');
}

function runRA_dropNextSend_stalls() {
  const model = makeModel(4, 'RA');

  toggleDropNextSend(model); // arm
  requestCS(model, 'P1');

  // Step until queue is empty (or until we exceed a limit).
  // After a drop, liveness may fail and the system may stall with P1 still requesting.
  stepN(model, 3000);

  assert(!inCS(model, 'P1'), 'RA drop-next-send: P1 should not enter CS in the stalled case');
  assert(checkSafety(model).ok, 'RA safety should remain OK under message loss');
}

function runRA_dropNextMessage_smoke() {
  const model = makeModel(4, 'RA');

  requestCS(model, 'P1');
  // Ensure some messages exist.
  stepN(model, 1);
  dropNextMessage(model); // drop queue head
  stepN(model, 2000);

  assert(checkSafety(model).ok, 'RA safety should remain OK when dropping an in-flight message');
}

function runAll() {
  const tests = [
    ['TR basic mutual exclusion', runTR_basicMutex],
    ['TR token loss + recovery', runTR_tokenLossRecovery],
    ['RA basic entry', runRA_basicEntry],
    ['RA tie-break by PID', runRA_tiebreak_pid],
    ['RA drop-next-send stalls (expected)', runRA_dropNextSend_stalls],
    ['RA drop next in-flight message (smoke)', runRA_dropNextMessage_smoke],
  ];

  let passed = 0;
  for (const [name, fn] of tests) {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed += 1;
    } catch (err) {
      console.error(`❌ ${name}`);
      console.error(err?.stack || String(err));
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} tests passed.`);
}

runAll();
