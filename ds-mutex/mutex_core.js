// Distributed Mutual Exclusion Explorer (core)
// Supports:
// - Token Ring (token-based mutual exclusion)
// - Ricart–Agrawala (message-based mutual exclusion, prototype)

export function clampInt(n, lo, hi) {
  const x = Math.floor(Number(n));
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function nextStepId(model) {
  model.stepCount += 1;
  return model.stepCount;
}

export function logEvent(model, text, kind = 'info') {
  const step = nextStepId(model);
  model.trace.push({ step, kind, text });
  if (model.trace.length > 700) model.trace.splice(0, model.trace.length - 700);
}

export function clearTrace(model) {
  model.trace = [];
  model.stepCount = 0;
}

function uniqPush(arr, x) {
  if (!arr.includes(x)) arr.push(x);
}

function removeItem(arr, x) {
  const i = arr.indexOf(x);
  if (i >= 0) arr.splice(i, 1);
}

function pidNumber(pid) {
  const m = String(pid).match(/\d+/);
  if (!m) return NaN;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : NaN;
}

function comparePid(a, b) {
  const an = pidNumber(a);
  const bn = pidNumber(b);
  if (Number.isFinite(an) && Number.isFinite(bn)) {
    if (an < bn) return -1;
    if (an > bn) return 1;
    return 0;
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function makeTokenRingModel(procCount) {
  const n = clampInt(procCount, 2, 12);
  const processes = [];
  for (let i = 1; i <= n; i++) {
    processes.push({
      id: `P${i}`,
      requesting: false,
      inCS: false,
      crashed: false,
    });
  }
  const ring = processes.map((p) => p.id);

  return {
    type: 'MutexState',
    algorithm: 'TokenRing',
    mode: 'interactive', // 'interactive' | 'script'

    processes,
    ring,

    token: {
      holder: ring[0],
      lost: false,
    },

    network: null,

    stepCount: 0,
    trace: [],

    metrics: {
      tokenPasses: 0,
      csEntries: 0,
      csReleases: 0,
    },

    script: {
      description: '',
      events: [],
      index: 0,
    },
  };
}

export function makeRAModel(procCount) {
  const n = clampInt(procCount, 2, 12);
  const processes = [];
  for (let i = 1; i <= n; i++) {
    processes.push({
      id: `P${i}`,
      requesting: false,
      inCS: false,
      crashed: false,

      clock: 0,
      reqTs: null,
      awaiting: [],
      deferred: [],
    });
  }
  const ring = processes.map((p) => p.id);

  return {
    type: 'MutexState',
    algorithm: 'RA',
    mode: 'interactive',

    processes,
    ring,

    token: null,

    network: {
      nextMsgId: 1,
      queue: [],
      dropNextSend: false,
    },

    stepCount: 0,
    trace: [],

    metrics: {
      csEntries: 0,
      csReleases: 0,
      messagesSent: 0,
      messagesDelivered: 0,
      messagesDropped: 0,
    },

    script: {
      description: '',
      events: [],
      index: 0,
    },
  };
}

export function makeModel(procCount, algorithm) {
  if (algorithm === 'RA') return makeRAModel(procCount);
  return makeTokenRingModel(procCount);
}

export function getProc(model, pid) {
  return model.processes.find((p) => p.id === pid) || null;
}

export function anyInCS(model) {
  return model.processes.find((p) => p.inCS) || null;
}

export function alivePids(model) {
  return model.processes.filter((p) => !p.crashed).map((p) => p.id);
}

export function ringNextAlive(model, pid) {
  const n = model.ring.length;
  if (n === 0) return pid;
  const start = Math.max(0, model.ring.indexOf(pid));
  for (let k = 1; k <= n; k++) {
    const cand = model.ring[(start + k) % n];
    const p = getProc(model, cand);
    if (p && !p.crashed) return cand;
  }
  return pid;
}

function pickTokenRegenHolder(model) {
  const alive = alivePids(model);
  if (alive.length === 0) return null;

  const current = typeof model.token?.holder === 'string' ? model.token.holder : null;
  const currentProc = current ? getProc(model, current) : null;
  if (currentProc && !currentProc.crashed) return currentProc.id;

  if (current && model.ring.includes(current)) {
    const next = ringNextAlive(model, current);
    const p = getProc(model, next);
    if (p && !p.crashed) return p.id;
  }
  return alive[0];
}

export function checkSafety(model) {
  const inCS = model.processes.filter((p) => p.inCS);
  if (inCS.length > 1) {
    return { ok: false, message: 'Violation: >1 process in the critical section' };
  }
  return { ok: true, message: 'OK' };
}

// ------------------------------------------------------------
// Token Ring logic
// ------------------------------------------------------------

function tokenRingRequestCS(model, pid) {
  const p = getProc(model, pid);
  if (!p) return { ok: false, reason: 'unknown_process' };
  if (p.crashed) return { ok: false, reason: 'crashed' };
  if (p.inCS) return { ok: false, reason: 'already_in_cs' };
  if (p.requesting) return { ok: false, reason: 'already_requesting' };

  p.requesting = true;
  logEvent(model, `${pid} requests the critical section.`);
  return { ok: true };
}

function tokenRingReleaseCS(model, pid) {
  const p = getProc(model, pid);
  if (!p) return { ok: false, reason: 'unknown_process' };
  if (p.crashed) return { ok: false, reason: 'crashed' };
  if (!p.inCS) return { ok: false, reason: 'not_in_cs' };

  p.inCS = false;
  model.metrics.csReleases += 1;
  logEvent(model, `${pid} releases the critical section.`);

  if (!model.token.lost && model.token.holder === pid) {
    const next = ringNextAlive(model, pid);
    if (next !== pid) {
      model.token.holder = next;
      model.metrics.tokenPasses += 1;
      logEvent(model, `Token passed from ${pid} to ${next}.`);
    } else {
      logEvent(model, `Token remains at ${pid} (no other alive processes).`);
    }
  }
  return { ok: true };
}

function tokenRingDropToken(model) {
  model.token.lost = true;
  logEvent(model, 'Fault injected: token lost.', 'warn');
  return { ok: true };
}

function tokenRingRegenerateToken(model) {
  const holder = pickTokenRegenHolder(model);
  if (!holder) {
    model.token.lost = true;
    logEvent(model, 'Recovery failed: no alive processes to hold the token.', 'warn');
    return { ok: false, reason: 'no_alive_processes' };
  }
  model.token.lost = false;
  model.token.holder = holder;
  logEvent(model, `Recovery: token regenerated at ${holder}.`, 'warn');
  return { ok: true };
}

function stepTokenRingInteractive(model) {
  if (model.token.lost) {
    logEvent(model, 'No progress: token is lost.', 'warn');
    return { type: 'stalled', reason: 'token_lost' };
  }

  const inCS = anyInCS(model);
  if (inCS) {
    if (inCS.crashed) {
      logEvent(model, `No progress: ${inCS.id} is crashed in the critical section.`, 'warn');
      return { type: 'stalled', reason: 'crashed_in_cs' };
    }
    logEvent(model, `No internal progress: ${inCS.id} is in the critical section (release required).`);
    return { type: 'stalled', reason: 'release_required' };
  }

  const holderId = typeof model.token.holder === 'string' ? model.token.holder : null;
  const holder = holderId ? getProc(model, holderId) : null;
  if (!holder) {
    logEvent(model, 'No progress: token holder is unknown.', 'warn');
    return { type: 'stalled', reason: 'unknown_holder' };
  }
  if (holder.crashed) {
    model.token.lost = true;
    logEvent(model, `No progress: token lost (holder ${holder.id} is crashed).`, 'warn');
    return { type: 'stalled', reason: 'token_lost' };
  }

  if (holder.requesting) {
    holder.inCS = true;
    holder.requesting = false;
    model.metrics.csEntries += 1;
    logEvent(model, `${holder.id} enters the critical section (holds token).`);
    return { type: 'cs_entry', pid: holder.id };
  }

  const next = ringNextAlive(model, holder.id);
  if (next === holder.id) {
    logEvent(model, `Token remains at ${holder.id} (no other alive processes).`);
    return { type: 'token_pass', from: holder.id, to: holder.id };
  }

  model.token.holder = next;
  model.metrics.tokenPasses += 1;
  logEvent(model, `Token passed from ${holder.id} to ${next}.`);
  return { type: 'token_pass', from: holder.id, to: next };
}

// ------------------------------------------------------------
// Ricart–Agrawala logic (prototype)
// ------------------------------------------------------------

function raEnqueue(model, type, from, to, ts) {
  const id = model.network.nextMsgId++;
  model.metrics.messagesSent += 1;

  if (model.network.dropNextSend === true) {
    model.network.dropNextSend = false;
    model.metrics.messagesDropped += 1;
    logEvent(model, `Fault injected: dropped outgoing ${type} #${id} ${from} -> ${to}.`, 'warn');
    return id;
  }

  model.network.queue.push({ id, type, from, to, ts });
  return id;
}

function raComparePair(tsA, pidA, tsB, pidB) {
  if (tsA < tsB) return -1;
  if (tsA > tsB) return 1;
  return comparePid(pidA, pidB);
}

function raStartRequest(model, pid) {
  const p = getProc(model, pid);
  if (!p) return { ok: false, reason: 'unknown_process' };
  if (p.crashed) return { ok: false, reason: 'crashed' };
  if (p.inCS) return { ok: false, reason: 'already_in_cs' };
  if (p.requesting) return { ok: false, reason: 'already_requesting' };

  p.clock += 1;
  p.reqTs = p.clock;
  p.requesting = true;
  p.awaiting = alivePids(model).filter((x) => x !== pid);
  p.deferred = [];

  const targets = p.awaiting.slice();
  for (const to of targets) {
    raEnqueue(model, 'REQUEST', pid, to, p.reqTs);
  }
  logEvent(model, `${pid} broadcasts REQUEST(ts=${p.reqTs}) to ${targets.length} processes.`);
  return { ok: true };
}

function raRelease(model, pid) {
  const p = getProc(model, pid);
  if (!p) return { ok: false, reason: 'unknown_process' };
  if (p.crashed) return { ok: false, reason: 'crashed' };
  if (!p.inCS) return { ok: false, reason: 'not_in_cs' };

  p.inCS = false;
  model.metrics.csReleases += 1;
  logEvent(model, `${pid} releases the critical section.`);

  const toSend = p.deferred.slice();
  p.deferred = [];
  p.reqTs = null;
  p.awaiting = [];
  p.requesting = false;

  if (toSend.length > 0) {
    logEvent(model, `${pid} sends deferred REPLY to ${toSend.join(', ')}.`);
    for (const to of toSend) {
      if (getProc(model, to)?.crashed) continue;
      p.clock += 1;
      raEnqueue(model, 'REPLY', pid, to, p.clock);
    }
  }
  return { ok: true };
}

function raDeliverOne(model) {
  if (!model.network.queue.length) {
    logEvent(model, 'No progress: no messages in flight.', 'warn');
    return { type: 'stalled', reason: 'no_messages' };
  }

  const msg = model.network.queue.shift();
  model.metrics.messagesDelivered += 1;

  const recv = getProc(model, msg.to);
  if (!recv || recv.crashed) {
    model.metrics.messagesDropped += 1;
    logEvent(model, `Message dropped: ${msg.type} #${msg.id} ${msg.from} -> ${msg.to} (receiver crashed).`, 'warn');
    return { type: 'message_dropped', msg };
  }

  const tsForClock = Number.isFinite(msg.ts) ? msg.ts : recv.clock;
  recv.clock = Math.max(recv.clock, tsForClock) + 1;

  if (msg.type === 'REQUEST') {
    const senderTs = msg.ts;
    const senderId = msg.from;

    const shouldDefer =
      recv.inCS ||
      (recv.requesting && recv.reqTs != null && raComparePair(recv.reqTs, recv.id, senderTs, senderId) < 0);

    if (shouldDefer) {
      uniqPush(recv.deferred, senderId);
      logEvent(model, `${recv.id} defers REPLY to ${senderId}.`);
      return { type: 'message_delivered', msg };
    }

    recv.clock += 1;
    raEnqueue(model, 'REPLY', recv.id, senderId, recv.clock);
    logEvent(model, `${recv.id} sends REPLY to ${senderId}.`);
    return { type: 'message_delivered', msg };
  }

  if (msg.type === 'REPLY') {
    const requester = recv;
    if (requester.crashed) {
      model.metrics.messagesDropped += 1;
      logEvent(model, `REPLY ignored: ${requester.id} is crashed.`, 'warn');
      return { type: 'message_dropped', msg };
    }

    removeItem(requester.awaiting, msg.from);
    logEvent(model, `${requester.id} receives REPLY from ${msg.from} (${requester.awaiting.length} remaining).`);

    if (requester.requesting && !requester.inCS && requester.awaiting.length === 0) {
      requester.inCS = true;
      requester.requesting = false;
      model.metrics.csEntries += 1;
      logEvent(model, `${requester.id} enters the critical section (all REPLY received).`);
      return { type: 'cs_entry', pid: requester.id };
    }
    return { type: 'message_delivered', msg };
  }

  logEvent(model, `Unsupported message type: ${msg.type}`, 'warn');
  return { type: 'message_delivered', msg };
}

export function dropNextMessage(model, opts = {}) {
  const force = opts.force === true;
  if (model.mode !== 'interactive' && !force) return { ok: false, reason: 'not_interactive' };
  if (model.algorithm !== 'RA') return { ok: false, reason: 'unsupported_algorithm' };
  if (!model.network.queue.length) return { ok: false, reason: 'no_messages' };

  const msg = model.network.queue.shift();
  model.metrics.messagesDropped += 1;
  logEvent(model, `Fault injected: dropped ${msg.type} #${msg.id} ${msg.from} -> ${msg.to}.`, 'warn');
  return { ok: true };
}

export function toggleDropNextSend(model, opts = {}) {
  const force = opts.force === true;
  if (model.mode !== 'interactive' && !force) return { ok: false, reason: 'not_interactive' };
  if (model.algorithm !== 'RA') return { ok: false, reason: 'unsupported_algorithm' };
  if (!model.network) return { ok: false, reason: 'no_network' };

  model.network.dropNextSend = !model.network.dropNextSend;
  if (model.network.dropNextSend) {
    logEvent(model, 'Fault armed: next outgoing message will be dropped.', 'warn');
  } else {
    logEvent(model, 'Fault disarmed: drop-next-send cancelled.', 'warn');
  }
  return { ok: true, armed: model.network.dropNextSend };
}

// ------------------------------------------------------------
// Faults: crash / recover (shared)
// ------------------------------------------------------------

function crashInternal(model, pid) {
  const p = getProc(model, pid);
  if (!p) return { ok: false, reason: 'unknown_process' };
  if (p.crashed) return { ok: false, reason: 'already_crashed' };

  p.crashed = true;
  p.requesting = false;

  logEvent(model, `Fault injected: ${pid} crashed.`, 'warn');

  if (model.algorithm === 'TokenRing') {
    const wasInCS = p.inCS === true;
    const wasTokenHolder = model.token.holder === pid && model.token.lost === false;

    if (wasInCS) {
      if (model.token.holder !== pid) model.token.holder = pid;
      model.token.lost = true;
      logEvent(model, `Progress blocked: ${pid} crashed in the critical section; token is lost.`, 'warn');
    } else if (wasTokenHolder) {
      model.token.lost = true;
      logEvent(model, `Progress blocked: token lost because ${pid} (token holder) crashed.`, 'warn');
    }
  }

  if (model.algorithm === 'RA') {
    const wasInCS = p.inCS === true;
    if (wasInCS) {
      logEvent(model, `Progress blocked: ${pid} crashed in the critical section.`, 'warn');
    }
    p.reqTs = null;
    p.awaiting = [];
    p.deferred = [];
  }

  return { ok: true };
}

function recoverInternal(model, pid) {
  const p = getProc(model, pid);
  if (!p) return { ok: false, reason: 'unknown_process' };
  if (!p.crashed) return { ok: false, reason: 'not_crashed' };

  p.crashed = false;
  p.requesting = false;

  if (p.inCS) {
    p.inCS = false;
    logEvent(model, `Recovery: ${pid} recovered (state reset; exited critical section).`, 'warn');
  } else {
    logEvent(model, `Recovery: ${pid} recovered.`, 'warn');
  }

  if (model.algorithm === 'RA') {
    p.reqTs = null;
    p.awaiting = [];
    p.deferred = [];
  }

  return { ok: true };
}

// ------------------------------------------------------------
// Public actions (dispatch)
// ------------------------------------------------------------

export function requestCS(model, pid, opts = {}) {
  const force = opts.force === true;
  if (model.mode !== 'interactive' && !force) return { ok: false, reason: 'not_interactive' };

  if (model.algorithm === 'TokenRing') return tokenRingRequestCS(model, pid);
  if (model.algorithm === 'RA') return raStartRequest(model, pid);
  return { ok: false, reason: 'unsupported_algorithm' };
}

export function releaseCS(model, pid, opts = {}) {
  const force = opts.force === true;
  if (model.mode !== 'interactive' && !force) return { ok: false, reason: 'not_interactive' };

  if (model.algorithm === 'TokenRing') return tokenRingReleaseCS(model, pid);
  if (model.algorithm === 'RA') return raRelease(model, pid);
  return { ok: false, reason: 'unsupported_algorithm' };
}

export function dropToken(model, opts = {}) {
  const force = opts.force === true;
  if (model.mode !== 'interactive' && !force) return { ok: false, reason: 'not_interactive' };
  if (model.algorithm !== 'TokenRing') return { ok: false, reason: 'unsupported_algorithm' };
  return tokenRingDropToken(model);
}

export function regenerateToken(model, opts = {}) {
  const force = opts.force === true;
  if (model.mode !== 'interactive' && !force) return { ok: false, reason: 'not_interactive' };
  if (model.algorithm !== 'TokenRing') return { ok: false, reason: 'unsupported_algorithm' };
  return tokenRingRegenerateToken(model);
}

export function crashProcess(model, pid, opts = {}) {
  const force = opts.force === true;
  if (model.mode !== 'interactive' && !force) return { ok: false, reason: 'not_interactive' };
  return crashInternal(model, pid);
}

export function recoverProcess(model, pid, opts = {}) {
  const force = opts.force === true;
  if (model.mode !== 'interactive' && !force) return { ok: false, reason: 'not_interactive' };
  return recoverInternal(model, pid);
}

// ------------------------------------------------------------
// Script mode (per-algorithm events)
// ------------------------------------------------------------

function applyScriptEventTokenRing(model, evt) {
  const op = String(evt?.op || '').trim();
  const on = evt?.on;

  if (!op) {
    logEvent(model, 'Script event skipped: missing op.', 'warn');
    return { type: 'stalled', reason: 'bad_event' };
  }

  if (op === 'holdToken') {
    if (typeof on !== 'string') {
      logEvent(model, 'holdToken skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    model.token.lost = false;
    model.token.holder = on;
    logEvent(model, `Token placed at ${on}.`);
    return { type: 'script_event' };
  }

  if (op === 'passToken') {
    const from = evt?.from;
    const to = evt?.to;
    if (typeof to !== 'string') {
      logEvent(model, 'passToken skipped: missing "to".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    model.token.lost = false;
    model.token.holder = to;
    model.metrics.tokenPasses += 1;
    if (typeof from === 'string') logEvent(model, `Token passed from ${from} to ${to}.`);
    else logEvent(model, `Token passed to ${to}.`);
    return { type: 'script_event' };
  }

  if (op === 'requestCS') {
    if (typeof on !== 'string') {
      logEvent(model, 'requestCS skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    const p = getProc(model, on);
    if (!p) {
      logEvent(model, `requestCS skipped: unknown process ${on}.`, 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    if (!p.crashed && !p.inCS) {
      p.requesting = true;
      logEvent(model, `${on} requests the critical section.`);
    }
    if (!p.crashed && !model.token.lost && model.token.holder === on && !anyInCS(model) && p.requesting) {
      p.inCS = true;
      p.requesting = false;
      model.metrics.csEntries += 1;
      logEvent(model, `${on} enters the critical section (holds token).`);
      return { type: 'cs_entry', pid: on };
    }
    return { type: 'script_event' };
  }

  if (op === 'releaseCS') {
    if (typeof on !== 'string') {
      logEvent(model, 'releaseCS skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    const p = getProc(model, on);
    if (!p) {
      logEvent(model, `releaseCS skipped: unknown process ${on}.`, 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    if (p.inCS) {
      p.inCS = false;
      model.metrics.csReleases += 1;
      logEvent(model, `${on} releases the critical section.`);
    } else {
      logEvent(model, `${on} release ignored (not in CS).`, 'warn');
    }
    return { type: 'script_event' };
  }

  if (op === 'dropToken') {
    model.token.lost = true;
    logEvent(model, 'Fault injected: token lost.', 'warn');
    return { type: 'script_event' };
  }

  if (op === 'regenerateToken') {
    model.token.lost = false;
    if (typeof on === 'string') model.token.holder = on;
    logEvent(model, `Recovery: token regenerated${typeof on === 'string' ? ` at ${on}` : ''}.`, 'warn');
    return { type: 'script_event' };
  }

  if (op === 'crash') {
    if (typeof on !== 'string') {
      logEvent(model, 'crash skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    crashInternal(model, on);
    return { type: 'script_event' };
  }

  if (op === 'recover') {
    if (typeof on !== 'string') {
      logEvent(model, 'recover skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    recoverInternal(model, on);
    return { type: 'script_event' };
  }

  logEvent(model, `Script event ignored: unsupported op "${op}".`, 'warn');
  return { type: 'stalled', reason: 'unsupported_op' };
}

function applyScriptEventRA(model, evt) {
  const op = String(evt?.op || '').trim();
  const on = evt?.on;

  if (!op) {
    logEvent(model, 'Script event skipped: missing op.', 'warn');
    return { type: 'stalled', reason: 'bad_event' };
  }

  if (op === 'requestCS') {
    if (typeof on !== 'string') {
      logEvent(model, 'requestCS skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    requestCS(model, on, { force: true });
    return { type: 'script_event' };
  }

  if (op === 'releaseCS') {
    if (typeof on !== 'string') {
      logEvent(model, 'releaseCS skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    releaseCS(model, on, { force: true });
    return { type: 'script_event' };
  }

  if (op === 'deliverNext' || op === 'deliver') {
    return raDeliverOne(model);
  }

  if (op === 'dropNextMessage') {
    dropNextMessage(model, { force: true });
    return { type: 'script_event' };
  }

  if (op === 'crash') {
    if (typeof on !== 'string') {
      logEvent(model, 'crash skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    crashInternal(model, on);
    return { type: 'script_event' };
  }

  if (op === 'recover') {
    if (typeof on !== 'string') {
      logEvent(model, 'recover skipped: missing "on".', 'warn');
      return { type: 'stalled', reason: 'bad_event' };
    }
    recoverInternal(model, on);
    return { type: 'script_event' };
  }

  logEvent(model, `Script event ignored: unsupported op "${op}".`, 'warn');
  return { type: 'stalled', reason: 'unsupported_op' };
}

function stepScript(model) {
  const { events, index } = model.script;
  if (!events || events.length === 0) {
    logEvent(model, 'Script mode: no events loaded.', 'warn');
    return { type: 'stalled', reason: 'no_events' };
  }
  if (index >= events.length) {
    logEvent(model, 'Script finished.');
    return { type: 'script_done' };
  }

  const evt = events[index];
  model.script.index += 1;

  if (model.algorithm === 'TokenRing') return applyScriptEventTokenRing(model, evt);
  if (model.algorithm === 'RA') return applyScriptEventRA(model, evt);

  logEvent(model, `Unsupported algorithm in script: ${model.algorithm}`, 'warn');
  return { type: 'stalled', reason: 'unsupported_algorithm' };
}

// ------------------------------------------------------------
// Step dispatcher
// ------------------------------------------------------------

export function stepOnce(model) {
  if (model.mode === 'script') {
    return stepScript(model);
  }

  if (model.algorithm === 'TokenRing') {
    return stepTokenRingInteractive(model);
  }

  if (model.algorithm === 'RA') {
    const qLen = model.network?.queue?.length ?? 0;
    if (qLen > 0) {
      return raDeliverOne(model);
    }

    const inCS = anyInCS(model);
    if (inCS) {
      if (inCS.crashed) {
        logEvent(model, `No progress: ${inCS.id} is crashed in the critical section.`, 'warn');
        return { type: 'stalled', reason: 'crashed_in_cs' };
      }
      logEvent(model, `No internal progress: ${inCS.id} is in the critical section (release required).`);
      return { type: 'stalled', reason: 'release_required' };
    }

    // Clarity: queue empty does not mean "nothing is happening". It can mean
    // a request is waiting for missing REPLYs (e.g., due to message loss or a
    // crashed process). Surface this explicitly for teaching.
    const waiters = model.processes
      .filter((p) => p.requesting && !p.crashed && Array.isArray(p.awaiting) && p.awaiting.length > 0)
      .sort((a, b) => {
        const at = Number.isFinite(a.reqTs) ? a.reqTs : Number.POSITIVE_INFINITY;
        const bt = Number.isFinite(b.reqTs) ? b.reqTs : Number.POSITIVE_INFINITY;
        if (at !== bt) return at - bt;
        const an = parseInt(String(a.id).replace(/^P/, ''), 10);
        const bn = parseInt(String(b.id).replace(/^P/, ''), 10);
        if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
        return String(a.id).localeCompare(String(b.id));
      });

    if (waiters.length) {
      const p = waiters[0];
      const missing = p.awaiting.join(', ');
      logEvent(model, `Stalled: ${p.id} is waiting for REPLY from ${missing}.`, 'warn');
      return { type: 'stalled', reason: 'waiting_replies', pid: p.id, awaiting: [...p.awaiting] };
    }

    logEvent(model, 'No progress: no messages in flight.', 'warn');
    return { type: 'stalled', reason: 'no_messages' };
  }

  logEvent(model, `Unsupported algorithm: ${model.algorithm}`, 'warn');
  return { type: 'stalled', reason: 'unsupported_algorithm' };
}

// ------------------------------------------------------------
// Export / Import
// ------------------------------------------------------------

export function exportStateObject(model) {
  const inCS = anyInCS(model);

  if (model.algorithm === 'TokenRing') {
    return {
      type: 'MutexState',
      algorithm: model.algorithm,
      mode: 'interactive',
      processes: model.processes.map((p) => ({
        id: p.id,
        requesting: !!p.requesting,
        inCS: !!p.inCS,
        crashed: !!p.crashed,
      })),
      ring: [...model.ring],
      token: { ...model.token },
      derived: {
        inCS: inCS ? inCS.id : null,
        metrics: { ...model.metrics },
      },
    };
  }

  if (model.algorithm === 'RA') {
    return {
      type: 'MutexState',
      algorithm: model.algorithm,
      mode: 'interactive',
      processes: model.processes.map((p) => ({
        id: p.id,
        requesting: !!p.requesting,
        inCS: !!p.inCS,
        crashed: !!p.crashed,
        clock: p.clock,
        reqTs: p.reqTs,
        awaiting: Array.isArray(p.awaiting) ? [...p.awaiting] : [],
        deferred: Array.isArray(p.deferred) ? [...p.deferred] : [],
      })),
      ring: [...model.ring],
      network: {
        nextMsgId: model.network?.nextMsgId ?? 1,
        dropNextSend: !!model.network?.dropNextSend,
        queue: Array.isArray(model.network?.queue) ? model.network.queue.map((m) => ({ ...m })) : [],
      },
      derived: {
        inCS: inCS ? inCS.id : null,
        metrics: { ...model.metrics },
      },
    };
  }

  return {
    type: 'MutexState',
    algorithm: model.algorithm,
    mode: 'interactive',
  };
}

export function loadFromJsonObject(obj) {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid JSON object.');
  }

  if (obj.type === 'MutexDemo') {
    const algo = obj.algorithm;

    if (algo !== 'TokenRing' && algo !== 'RA') {
      throw new Error('Only TokenRing and RA are supported in this prototype.');
    }

    const processes = Array.isArray(obj.processes) ? obj.processes : [];
    const ring = Array.isArray(obj.ring) && obj.ring.length ? obj.ring : processes;
    const n = processes.length || ring.length;

    const model = makeModel(n || 4, algo);

    if (processes.length) {
      if (algo === 'TokenRing') {
        model.processes = processes.map((id) => ({ id, requesting: false, inCS: false, crashed: false }));
      } else {
        model.processes = processes.map((id) => ({
          id,
          requesting: false,
          inCS: false,
          crashed: false,
          clock: 0,
          reqTs: null,
          awaiting: [],
          deferred: [],
        }));
      }
    }

    if (ring && ring.length) {
      model.ring = [...ring];
      if (algo === 'TokenRing') {
        if (!model.ring.includes(model.token.holder)) model.token.holder = model.ring[0];
      }
    }

    if (algo === 'TokenRing') {
      model.token.lost = false;
    }

    model.script.description = obj.meta?.description || '';
    model.script.events = Array.isArray(obj.events) ? [...obj.events].sort((a, b) => (a.t || 0) - (b.t || 0)) : [];
    model.script.index = 0;
    model.mode = 'script';

    clearTrace(model);
    logEvent(model, `Loaded scripted scenario: ${model.script.description || `${algo} demo`}.`);
    return model;
  }

  if (obj.type === 'MutexState') {
    const algo = obj.algorithm;
    if (algo !== 'TokenRing' && algo !== 'RA') {
      throw new Error('Only TokenRing and RA are supported in this prototype.');
    }

    const ring = Array.isArray(obj.ring) && obj.ring.length ? [...obj.ring] : null;
    const procs = Array.isArray(obj.processes) && obj.processes.length ? obj.processes : null;

    const n = procs ? procs.length : (ring ? ring.length : 4);
    const model = makeModel(n, algo);

    if (procs) {
      if (algo === 'TokenRing') {
        model.processes = procs.map((p) => ({
          id: String(p.id),
          requesting: !!p.requesting,
          inCS: !!p.inCS,
          crashed: !!p.crashed,
        }));
      } else {
        model.processes = procs.map((p) => ({
          id: String(p.id),
          requesting: !!p.requesting,
          inCS: !!p.inCS,
          crashed: !!p.crashed,
          clock: Number.isFinite(p.clock) ? p.clock : 0,
          reqTs: Number.isFinite(p.reqTs) ? p.reqTs : null,
          awaiting: Array.isArray(p.awaiting) ? [...p.awaiting] : [],
          deferred: Array.isArray(p.deferred) ? [...p.deferred] : [],
        }));
      }
    }

    if (ring) model.ring = ring;

    if (algo === 'TokenRing') {
      if (obj.token && typeof obj.token === 'object') {
        if (typeof obj.token.holder === 'string') model.token.holder = obj.token.holder;
        model.token.lost = !!obj.token.lost;
      }
    } else {
      if (obj.network && typeof obj.network === 'object') {
        model.network.nextMsgId = Number.isFinite(obj.network.nextMsgId) ? obj.network.nextMsgId : 1;
        model.network.dropNextSend = !!obj.network.dropNextSend;
        model.network.queue = Array.isArray(obj.network.queue) ? obj.network.queue.map((m) => ({ ...m })) : [];
      }
    }

    model.mode = 'interactive';
    clearTrace(model);
    logEvent(model, 'Loaded interactive state from JSON.');
    return model;
  }

  throw new Error('Unsupported JSON format.');
}
