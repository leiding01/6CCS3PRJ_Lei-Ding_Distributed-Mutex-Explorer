import assert from 'node:assert/strict';

export function stepN(core, model, n) {
  for (let i = 0; i < n; i += 1) {
    core.stepOnce(model);
  }
}

export function stepUntil(core, model, predicate, maxSteps = 2000, label = 'condition') {
  for (let i = 0; i < maxSteps; i += 1) {
    const result = core.stepOnce(model);
    if (predicate(result)) return { steps: i + 1, result };
  }
  throw new Error(`Timeout waiting for ${label} after ${maxSteps} steps`);
}

export function lastTrace(model) {
  if (!Array.isArray(model.trace) || model.trace.length === 0) return '';
  return model.trace[model.trace.length - 1].text;
}

export function assertSafety(core, model, msg = 'safety should be OK') {
  assert.equal(core.checkSafety(model).ok, true, msg);
}

export function inCS(core, model, pid) {
  return !!core.getProc(model, pid)?.inCS;
}