/*
  Distributed Mutual Exclusion Explorer (v0.3)
  - Token Ring + Ricart–Agrawala (prototype)
  - Scripted demos supported for both
  - Faults: token loss, crash/recover, message drop (RA)
  - Dependency-free, browser-only
*/

import {
  clampInt,
  makeModel,
  makeTokenRingModel,
  logEvent,
  clearTrace,
  checkSafety,
  requestCS,
  releaseCS,
  dropToken,
  regenerateToken,
  dropNextMessage,
  toggleDropNextSend,
  crashProcess,
  recoverProcess,
  stepOnce as stepCore,
  anyInCS,
  getProc,
  loadFromJsonObject,
  exportStateObject,
} from './mutex_core.js';

// ----------------------------
// DOM helpers
// ----------------------------
const $ = (id) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
};

const els = {
  algorithmSelect: $('algorithmSelect'),
  procCount: $('procCount'),
  applyConfigBtn: $('applyConfigBtn'),
  modePill: $('modePill'),

  stepBtn: $('stepBtn'),
  runBtn: $('runBtn'),
  pauseBtn: $('pauseBtn'),
  resetBtn: $('resetBtn'),
  speedMs: $('speedMs'),
  dropTokenBtn: $('dropTokenBtn'),
  regenTokenBtn: $('regenTokenBtn'),
  dropNextMsgBtn: $('dropNextMsgBtn'),
  toggleDropNextSendBtn: $('toggleDropNextSendBtn'),
  clearTraceBtn: $('clearTraceBtn'),

  safetyLabel: $('safetyLabel'),
  metricsPill: $('metricsPill'),

  procTable: $('procTable'),
  msgTable: $('msgTable'),
  trace: $('trace'),

  exportBtn: $('exportBtn'),
  exportTraceBtn: $('exportTraceBtn'),
  exportAllBtn: $('exportAllBtn'),
  importFile: $('importFile'),
  loadExampleInteractiveBtn: $('loadExampleInteractiveBtn'),
  loadExampleScriptBtn: $('loadExampleScriptBtn'),
  loadCrashDemoBtn: $('loadCrashDemoBtn'),
  loadRaDemoBtn: $('loadRaDemoBtn'),
  loadRaTieDemoBtn: $('loadRaTieDemoBtn'),
  exitScriptBtn: $('exitScriptBtn'),

  previewCanvas: $('previewCanvas'),
  redrawBtn: $('redrawBtn'),
  exportPngBtn: $('exportPngBtn'),
};

// ----------------------------
// State
// ----------------------------

let model = makeTokenRingModel(4);
let runTimer = null;

function makeTimestampId(d = new Date()) {
  return d.toISOString().replace(/[:.]/g, '-');
}

let exportSessionId = makeTimestampId();
let exportSnapshotSeq = 1;

function startNewExportSession() {
  exportSessionId = makeTimestampId();
  exportSnapshotSeq = 1;
}

function nextExportBaseName() {
  const seq = String(exportSnapshotSeq).padStart(2, '0');
  exportSnapshotSeq += 1;
  return `mutex_${exportSessionId}_${model.algorithm}_${model.mode}_${seq}`;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  downloadBlob(filename, blob);
}

function formatTraceText() {
  const header = [
    'Distributed Mutual Exclusion Explorer',
    `Algorithm: ${model.algorithm}`,
    `Mode: ${model.mode}`,
    `Export session: ${exportSessionId}`,
    `Export time: ${new Date().toISOString()}`,
    '',
  ].join('\n');

  if (!Array.isArray(model.trace) || model.trace.length === 0) {
    return `${header}(trace empty)\n`;
  }

  const lines = model.trace.map((e) => {
    const tag = e.kind === 'warn' ? '!' : ' ';
    return `[${String(e.step).padStart(3, '0')}]${tag} ${e.text}`;
  });
  return `${header}${lines.join('\n')}\n`;
}

function exportStateTo(baseName) {
  const obj = exportStateObject(model);
  const json = JSON.stringify(obj, null, 2);
  downloadText(`${baseName}_state.json`, json, 'application/json');
}

function exportTraceTo(baseName) {
  downloadText(`${baseName}_trace.txt`, formatTraceText(), 'text/plain');
}

function exportPngTo(baseName) {
  drawPreview();
  const url = els.previewCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}_preview.png`;
  a.click();
}

function stopRun() {
  if (!runTimer) return;
  clearInterval(runTimer);
  runTimer = null;
  els.runBtn.disabled = false;
  els.pauseBtn.disabled = true;
}

function getRunIntervalMs() {
  const ms = clampInt(els.speedMs.value, 50, 2000);
  els.speedMs.value = String(ms);
  return ms;
}

function startRun() {
  if (runTimer) return;
  const ms = getRunIntervalMs();
  runTimer = setInterval(() => {
    const r = stepAndRender();
    if (r && (r.type === 'stalled' || r.type === 'cs_entry' || r.type === 'script_done')) {
      stopRun();
    }
  }, ms);
  els.runBtn.disabled = true;
  els.pauseBtn.disabled = false;
}

function resetSimulation(procCount = model.processes.length, algorithm = els.algorithmSelect.value) {
  stopRun();
  const n = clampInt(procCount, 2, 12);
  model = makeModel(n, algorithm);
  startNewExportSession();
  els.algorithmSelect.value = algorithm;
  els.procCount.value = String(n);
  render();
}

function setMode(mode) {
  model.mode = mode;
  els.modePill.textContent = mode;
  els.exitScriptBtn.disabled = mode !== 'script';
}

// ----------------------------
// Import / Export
// ----------------------------

function exportState() {
  const base = nextExportBaseName();
  exportStateTo(base);
}

function exportTrace() {
  const base = nextExportBaseName();
  exportTraceTo(base);
}

function exportPng() {
  const base = nextExportBaseName();
  exportPngTo(base);
}

function exportAllEvidence() {
  const base = nextExportBaseName();
  exportStateTo(base);
  exportTraceTo(base);
  exportPngTo(base);
}

async function loadExample(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load: ${path}`);
  return await res.json();
}

function importJsonObject(obj) {
  stopRun();
  model = loadFromJsonObject(obj);
  startNewExportSession();
  els.algorithmSelect.value = model.algorithm;
  els.procCount.value = String(model.processes.length);
  setMode(model.mode);
  render();
}

// ----------------------------
// Rendering
// ----------------------------

function statusLabel(p) {
  if (p.crashed && p.inCS) return 'crashed (in CS)';
  if (p.crashed) return 'crashed';
  if (p.inCS) return 'in CS';
  if (p.requesting) return 'requesting';
  return 'idle';
}

function renderProcessTable() {
  els.procTable.innerHTML = '';

  for (const p of model.processes) {
    const tr = document.createElement('tr');

    let tokenCell = '';
    if (model.algorithm === 'TokenRing') {
      const tokenHere = !model.token.lost && model.token.holder === p.id;
      tokenCell = tokenHere ? 'yes' : (model.token.lost && model.token.holder === p.id ? 'lost' : '');
    }

    const status = statusLabel(p);

    const interactive = model.mode === 'interactive';
    const requestDisabled = !interactive || p.crashed || p.inCS || p.requesting;
    const releaseDisabled = !interactive || p.crashed || !p.inCS;
    const crashDisabled = !interactive || p.crashed;
    const recoverDisabled = !interactive || !p.crashed;

    tr.innerHTML = `
      <td><strong>${p.id}</strong></td>
      <td>${status}</td>
      <td>${tokenCell}</td>
      <td>
        <button class="reqBtn" data-pid="${p.id}" ${requestDisabled ? 'disabled' : ''}>Request CS</button>
        <button class="relBtn" data-pid="${p.id}" ${releaseDisabled ? 'disabled' : ''}>Release CS</button>
        <button class="crashBtn" data-pid="${p.id}" ${crashDisabled ? 'disabled' : ''}>Crash</button>
        <button class="recBtn" data-pid="${p.id}" ${recoverDisabled ? 'disabled' : ''}>Recover</button>
      </td>
    `;
    els.procTable.appendChild(tr);
  }

  els.procTable.querySelectorAll('.reqBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      requestCS(model, btn.dataset.pid);
      render();
    });
  });

  els.procTable.querySelectorAll('.relBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      releaseCS(model, btn.dataset.pid);
      render();
    });
  });

  els.procTable.querySelectorAll('.crashBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      stopRun();
      crashProcess(model, btn.dataset.pid);
      render();
    });
  });

  els.procTable.querySelectorAll('.recBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      stopRun();
      recoverProcess(model, btn.dataset.pid);
      render();
    });
  });
}

function renderMessageTable() {
  els.msgTable.innerHTML = '';

  if (model.algorithm !== 'RA' || !model.network) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5">No messages (token-based) or RA not active.</td>`;
    els.msgTable.appendChild(tr);
    return;
  }

  const q = model.network.queue || [];
  if (q.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5">Queue empty.</td>`;
    els.msgTable.appendChild(tr);
    return;
  }

  const maxRows = 12;
  for (const msg of q.slice(0, maxRows)) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${msg.id}</td>
      <td>${msg.type}</td>
      <td>${msg.from}</td>
      <td>${msg.to}</td>
      <td>${Number.isFinite(msg.ts) ? msg.ts : ''}</td>
    `;
    els.msgTable.appendChild(tr);
  }

  if (q.length > maxRows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5">… (${q.length - maxRows} more messages)</td>`;
    els.msgTable.appendChild(tr);
  }
}

function renderTrace() {
  if (!model.trace.length) {
    els.trace.textContent = '—';
    return;
  }
  const lines = model.trace.map((e) => {
    const tag = e.kind === 'warn' ? '!' : ' ';
    return `[${String(e.step).padStart(3, '0')}]${tag} ${e.text}`;
  });
  els.trace.textContent = lines.join('\n');
  els.trace.scrollTop = els.trace.scrollHeight;
}

function renderSafetyAndMetrics() {
  const safety = checkSafety(model);
  els.safetyLabel.textContent = safety.message;
  els.safetyLabel.className = safety.ok ? 'ok' : 'bad';

  if (model.algorithm === 'TokenRing') {
    const m = model.metrics;
    els.metricsPill.textContent = `entries: ${m.csEntries} · releases: ${m.csReleases} · token passes: ${m.tokenPasses}`;
  } else if (model.algorithm === 'RA') {
    const m = model.metrics;
    const qLen = model.network?.queue?.length ?? 0;
    const armed = model.network?.dropNextSend ? 'armed' : 'off';
    els.metricsPill.textContent = `entries: ${m.csEntries} · releases: ${m.csReleases} · sent: ${m.messagesSent} · delivered: ${m.messagesDelivered} · dropped: ${m.messagesDropped} · queue: ${qLen} · drop-next-send: ${armed}`;
  } else {
    els.metricsPill.textContent = '—';
  }
}

function drawPreview() {
  const canvas = els.previewCanvas;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  const n = Math.max(1, model.ring.length);
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) / 2 - 70;
  const angleStep = (Math.PI * 2) / n;

  const pos = new Map();
  model.ring.forEach((pid, i) => {
    const ang = -Math.PI / 2 + i * angleStep;
    pos.set(pid, { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) });
  });

  if (model.algorithm === 'TokenRing') {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < model.ring.length; i++) {
      const aId = model.ring[i];
      const bId = model.ring[(i + 1) % model.ring.length];
      const a = pos.get(aId);
      const b = pos.get(bId);
      if (!a || !b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const startOffset = 18;
      const endOffset = 24;
      const x1 = a.x + ux * startOffset;
      const y1 = a.y + uy * startOffset;
      const x2 = b.x - ux * endOffset;
      const y2 = b.y - uy * endOffset;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const ah = 8;
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - ux * ah - uy * ah * 0.6, y2 - uy * ah + ux * ah * 0.6);
      ctx.lineTo(x2 - ux * ah + uy * ah * 0.6, y2 - uy * ah - ux * ah * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.font = '12px ui-monospace, monospace';
  for (const pid of model.ring) {
    const p = getProc(model, pid);
    const pt = pos.get(pid);
    if (!pt || !p) continue;

    ctx.strokeStyle = '#111';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (p.inCS) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (p.crashed) {
      ctx.beginPath();
      ctx.moveTo(pt.x - 10, pt.y - 10);
      ctx.lineTo(pt.x + 10, pt.y + 10);
      ctx.moveTo(pt.x + 10, pt.y - 10);
      ctx.lineTo(pt.x - 10, pt.y + 10);
      ctx.stroke();
    }

    if (model.algorithm === 'TokenRing' && model.token && !model.token.lost && model.token.holder === pid) {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(pt.x + 16, pt.y - 16, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (p.requesting && !p.crashed) {
      ctx.fillStyle = '#111';
      ctx.fillText('R', pt.x - 4, pt.y + 4);
    }

    ctx.fillStyle = '#111';
    ctx.fillText(pid, pt.x - 10, pt.y + 34);
  }

  if (model.algorithm === 'RA' && model.network?.queue?.length) {
    const msg = model.network.queue[0];
    const a = pos.get(msg.from);
    const b = pos.get(msg.to);
    if (a && b) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.lineWidth = 1.2;

      ctx.fillStyle = '#111';
      ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
      ctx.fillText(`Next: ${msg.type} #${msg.id} ${msg.from} -> ${msg.to}`, 16, 26);
    }
  }

  if (model.algorithm === 'TokenRing') {
    if (model.token?.lost) {
      ctx.fillStyle = '#a10000';
      ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
      ctx.fillText('Token: LOST', 16, 26);
    } else {
      ctx.fillStyle = '#111';
      ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
      ctx.fillText(`Token holder: ${model.token?.holder ?? '—'}`, 16, 26);
    }
  } else if (model.algorithm === 'RA') {
    const qLen = model.network?.queue?.length ?? 0;
    ctx.fillStyle = '#111';
    ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    ctx.fillText(`Messages in flight: ${qLen}`, 16, 48);
  }

  const inCS = anyInCS(model);
  ctx.fillStyle = '#111';
  ctx.fillText(`Critical section: ${inCS ? inCS.id : '—'}`, 16, 70);
}

function renderControlsEnabledState() {
  const isTR = model.algorithm === 'TokenRing';
  const isRA = model.algorithm === 'RA';
  const qLen = model.network?.queue?.length ?? 0;

  els.dropTokenBtn.disabled = !isTR || model.mode !== 'interactive';
  els.regenTokenBtn.disabled = !isTR || model.mode !== 'interactive';
  els.dropNextMsgBtn.disabled = !isRA || model.mode !== 'interactive' || qLen === 0;
  els.toggleDropNextSendBtn.disabled = !isRA || model.mode !== 'interactive';

  if (isRA) {
    els.toggleDropNextSendBtn.textContent = model.network?.dropNextSend ? 'Disarm drop-next-send' : 'Arm drop-next-send';
  } else {
    els.toggleDropNextSendBtn.textContent = 'Arm drop-next-send';
  }
}

function render() {
  els.modePill.textContent = model.mode;
  els.exitScriptBtn.disabled = model.mode !== 'script';

  renderControlsEnabledState();
  renderProcessTable();
  renderMessageTable();
  renderTrace();
  renderSafetyAndMetrics();
  drawPreview();
}

// ----------------------------
// Step
// ----------------------------

function stepAndRender() {
  const r = stepCore(model);
  render();
  return r;
}

// ----------------------------
// Event wiring
// ----------------------------

els.applyConfigBtn.addEventListener('click', () => {
  resetSimulation(Number(els.procCount.value), els.algorithmSelect.value);
  logEvent(model, 'Applied configuration and reset.');
  render();
});

els.stepBtn.addEventListener('click', () => stepAndRender());
els.runBtn.addEventListener('click', () => startRun());
els.pauseBtn.addEventListener('click', () => stopRun());

els.resetBtn.addEventListener('click', () => {
  resetSimulation(Number(els.procCount.value), els.algorithmSelect.value);
  logEvent(model, 'Reset.');
  render();
});

els.dropTokenBtn.addEventListener('click', () => {
  stopRun();
  dropToken(model);
  render();
});

els.regenTokenBtn.addEventListener('click', () => {
  stopRun();
  regenerateToken(model);
  render();
});

els.toggleDropNextSendBtn.addEventListener('click', () => {
  stopRun();
  const r = toggleDropNextSend(model);
  if (!r.ok && r.reason === 'unsupported_algorithm') {
    logEvent(model, 'Drop-next-send is only available for Ricart–Agrawala.', 'warn');
  }
  render();
});

els.dropNextMsgBtn.addEventListener('click', () => {
  stopRun();
  const r = dropNextMessage(model);
  if (!r.ok && r.reason === 'no_messages') {
    logEvent(model, 'No message to drop (queue empty).', 'warn');
  }
  render();
});

els.clearTraceBtn.addEventListener('click', () => {
  clearTrace(model);
  render();
});

els.exportBtn.addEventListener('click', exportState);

els.exportTraceBtn.addEventListener('click', exportTrace);
els.exportAllBtn.addEventListener('click', exportAllEvidence);

els.importFile.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(String(reader.result || 'null'));
      importJsonObject(obj);
    } catch (err) {
      alert(`Invalid JSON: ${err.message}`);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

els.loadExampleInteractiveBtn.addEventListener('click', () => {
  resetSimulation(4, 'TokenRing');
  clearTrace(model);
  setMode('interactive');
  logEvent(model, 'Loaded interactive example: 4-process Token Ring.');
  render();
});

els.loadExampleScriptBtn.addEventListener('click', async () => {
  try {
    const obj = await loadExample('./examples/token_ring_basic.json');
    importJsonObject(obj);
  } catch (err) {
    alert(err.message);
  }
});

els.loadCrashDemoBtn.addEventListener('click', async () => {
  try {
    const obj = await loadExample('./examples/token_ring_crash_demo.json');
    importJsonObject(obj);
  } catch (err) {
    alert(err.message);
  }
});

els.loadRaDemoBtn.addEventListener('click', async () => {
  try {
    const obj = await loadExample('./examples/ra_conflict_demo.json');
    importJsonObject(obj);
  } catch (err) {
    alert(err.message);
  }
});

els.loadRaTieDemoBtn.addEventListener('click', async () => {
  try {
    const obj = await loadExample('./examples/ra_tiebreak_p2_p10.json');
    importJsonObject(obj);
  } catch (err) {
    alert(err.message);
  }
});

els.exitScriptBtn.addEventListener('click', () => {
  if (model.mode !== 'script') return;
  const n = model.processes.length;
  const algo = model.algorithm;
  resetSimulation(n, algo);
  clearTrace(model);
  setMode('interactive');
  logEvent(model, 'Exited script mode and reset to interactive.');
  render();
});

els.redrawBtn.addEventListener('click', () => drawPreview());

els.exportPngBtn.addEventListener('click', exportPng);

// Initial render
clearTrace(model);
logEvent(model, 'Ready. Choose an algorithm and use Request CS + Step/Run. RA: Step delivers one message.', 'info');
render();
