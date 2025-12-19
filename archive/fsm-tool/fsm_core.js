// Core FSM logic (DFA) — v0.2
export function makeEmptyModel() {
  return {
    states: [],
    alphabet: [],
    start: null,
    accepts: [],
    transitions: [], // list of {from, symbol, to}
    type: "DFA"
  };
}

export function toDelta(model) {
  // Build map: delta[state][symbol] = toState
  const delta = {};
  for (const s of model.states) delta[s] = {};
  for (const t of model.transitions) {
    if (!delta[t.from]) delta[t.from] = {};
    delta[t.from][t.symbol] = t.to;
  }
  return delta;
}

export function runDFA(model, input) {
  if (model.type !== "DFA") throw new Error("Model type must be DFA for runDFA");
  if (!model.start || model.states.length === 0) throw new Error("DFA not initialised: no start or no states.");
  const delta = toDelta(model);
  let curr = model.start;
  const trace = [curr];
  for (const ch of input) {
    if (!delta[curr] || delta[curr][ch] === undefined) {
      return { accepted: false, trace, haltedAt: curr, reason: `No transition for (${curr}, '${ch}')` };
    }
    curr = delta[curr][ch];
    trace.push(curr);
  }
  const accepted = model.accepts.includes(curr);
  return { accepted, trace, haltedAt: curr, reason: accepted ? "Accept" : "Reject" };
}

// Aggregated transitions for drawing
export function aggregateTransitions(model) {
  const map = new Map();
  for (const t of model.transitions) {
    const key = `${t.from}→${t.to}`;
    if (!map.has(key)) map.set(key, {from: t.from, to: t.to, symbols: new Set()});
    map.get(key).symbols.add(t.symbol);
  }
  return Array.from(map.values()).map(e => ({...e, symbols: Array.from(e.symbols).sort()}));
}
