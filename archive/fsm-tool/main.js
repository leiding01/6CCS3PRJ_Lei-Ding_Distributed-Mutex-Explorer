import { makeEmptyModel, runDFA, aggregateTransitions } from './fsm_core.js';

// Elements
const stateName = document.getElementById('stateName');
const addStateBtn = document.getElementById('addStateBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const startSelect = document.getElementById('startSelect');
const acceptSelect = document.getElementById('acceptSelect');
const stateList = document.getElementById('stateList');

const fromState = document.getElementById('fromState');
const symbol = document.getElementById('symbol');
const toState = document.getElementById('toState');
const addTransBtn = document.getElementById('addTransBtn');
const transTable = document.getElementById('transTable');

const inputStr = document.getElementById('inputStr');
const runBtn = document.getElementById('runBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const runResult = document.getElementById('runResult');
const currentStateLabel = document.getElementById('currentStateLabel');
const traceSpan = document.getElementById('trace');

const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const loadExample1 = document.getElementById('loadExample1');
const loadExample2 = document.getElementById('loadExample2');

const undoBtn = document.getElementById('undoBtn');

// Preview & PNG
const previewCanvas = document.getElementById('previewCanvas');
const redrawBtn = document.getElementById('redrawBtn');
const exportPngBtn = document.getElementById('exportPngBtn');

let model = makeEmptyModel();

// Undo stack
const undoStack = [];
function pushUndo(entry){ undoStack.push(entry); updateUndoButton(); }
function updateUndoButton(){ undoBtn.disabled = undoStack.length === 0; }

function refreshUI() {
  function fillSelect(sel, values, allowEmpty=false) {
    sel.innerHTML = '';
    if (allowEmpty) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '—';
      sel.appendChild(opt);
    }
    for (const v of values) {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    }
  }

  fillSelect(startSelect, model.states, true);
  fillSelect(acceptSelect, model.states);
  fillSelect(fromState, model.states);
  fillSelect(toState, model.states);

  for (const option of acceptSelect.options) {
    option.selected = model.accepts.includes(option.value);
  }

  // State list with Delete buttons
  stateList.innerHTML = '';
  for (const s of model.states) {
    const li = document.createElement('li');
    let tags = [];
    if (model.start === s) tags.push('start');
    if (model.accepts.includes(s)) tags.push('accept');
    const left = document.createElement('span');
    left.innerHTML = `<strong>${s}</strong> ${tags.length ? '('+tags.join(', ')+')' : ''}`;
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', ()=> deleteStateWithUndo(s));
    li.appendChild(left);
    li.appendChild(delBtn);
    li.dataset.state = s;
    stateList.appendChild(li);
  }

  // Transition table
  transTable.innerHTML = '';
  for (const [i, t] of model.transitions.entries()) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.from}</td><td>${t.symbol}</td><td>${t.to}</td>
      <td><button data-i="${i}" class="delTrans">Delete</button></td>`;
    transTable.appendChild(tr);
  }

  currentStateLabel.textContent = '—';
  runResult.textContent = '';
  traceSpan.textContent = '—';
  redrawPreview();
  updateUndoButton();
}

// Helpers for state operations
function deleteStateWithUndo(name){
  // snapshot
  const snapshot = {
    type: 'delete_state',
    state: name,
    wasStart: model.start === name,
    acceptsBefore: [...model.accepts],
    transitions: model.transitions.filter(t => t.from === name || t.to === name)
  };
  // apply deletion
  model.states = model.states.filter(s => s !== name);
  if (model.start === name) model.start = null;
  model.accepts = model.accepts.filter(a => a !== name);
  model.transitions = model.transitions.filter(t => t.from !== name && t.to !== name);
  pushUndo(snapshot);
  refreshUI();
}

function addStateWithUndo(name){
  model.states.push(name);
  if (!model.start) model.start = name;
  pushUndo({type: 'add_state', state: name});
  refreshUI();
}

// Event handlers
addStateBtn.addEventListener('click', () => {
  const name = stateName.value.trim();
  if (!name) return;
  if (model.states.includes(name)) { alert('State already exists'); return; }
  addStateWithUndo(name);
  stateName.value = '';
});

clearAllBtn.addEventListener('click', () => {
  if (!confirm('Clear all states, transitions and settings?')) return;
  pushUndo({type: 'set_all', snapshot: JSON.parse(JSON.stringify(model))});
  model = makeEmptyModel();
  refreshUI();
});

startSelect.addEventListener('change', () => {
  const prev = model.start;
  model.start = startSelect.value || null;
  pushUndo({type: 'set_start', prev});
  refreshUI();
});

acceptSelect.addEventListener('change', () => {
  const prev = [...model.accepts];
  const sel = [];
  for (const opt of acceptSelect.selectedOptions) sel.push(opt.value);
  model.accepts = sel;
  pushUndo({type: 'set_accepts', prev});
  refreshUI();
});

addTransBtn.addEventListener('click', () => {
  const f = fromState.value;
  const s = symbol.value.trim();
  const t = toState.value;
  if (!f || !t || !s) { alert('Please choose from/to and enter a 1‑char symbol.'); return; }
  if (s.length !== 1) { alert('Symbol must be a single character.'); return; }
  const dup = model.transitions.find(x => x.from === f && x.symbol === s);
  if (dup) { alert(`DFA already has a transition (${f}, '${s}') → ${dup.to}`); return; }
  const trans = {from: f, symbol: s, to: t};
  model.transitions.push(trans);
  if (!model.alphabet.includes(s)) model.alphabet.push(s);
  pushUndo({type: 'add_trans', trans});
  symbol.value = '';
  refreshUI();
});

transTable.addEventListener('click', (e) => {
  if (e.target.classList.contains('delTrans')) {
    const idx = Number(e.target.dataset.i);
    const t = model.transitions[idx];
    model.transitions.splice(idx, 1);
    pushUndo({type: 'del_trans', trans: t});
    refreshUI();
  }
});

let stepIndex = 0;
let currState = null;

function resetRunner() {
  stepIndex = 0;
  currState = model.start;
  currentStateLabel.textContent = currState || '—';
  for (const li of stateList.children) {
    li.classList.toggle('current', li.dataset.state === currState);
  }
  runResult.textContent = '';
  traceSpan.textContent = currState ? currState : '—';
}

resetBtn.addEventListener('click', resetRunner);

runBtn.addEventListener('click', () => {
  try {
    const res = runDFA(model, inputStr.value);
    currentStateLabel.textContent = res.haltedAt ?? '—';
    for (const li of stateList.children) {
      li.classList.toggle('current', li.dataset.state === (res.haltedAt ?? ''));
    }
    runResult.innerHTML = res.accepted
      ? `<span class="ok">ACCEPT</span>`
      : `<span class="bad">REJECT</span> ${res.reason ? '('+res.reason+')' : ''}`;
    traceSpan.textContent = res.trace.join(' \u2192 ');
  } catch (err) {
    alert(err.message);
  }
});

stepBtn.addEventListener('click', () => {
  try {
    if (currState === null) resetRunner();
    const str = inputStr.value;
    if (stepIndex >= str.length) {
      const accepted = model.accepts.includes(currState);
      runResult.innerHTML = accepted ? `<span class="ok">ACCEPT</span>` : `<span class="bad">REJECT</span>`;
      return;
    }
    const ch = str[stepIndex];
    const trans = model.transitions.find(x => x.from == currState && x.symbol == ch);
    if (!trans) {
      runResult.innerHTML = `<span class="bad">REJECT</span> (No transition for (${currState}, '${ch}'))`;
      return;
    }
    currState = trans.to;
    stepIndex += 1;
    currentStateLabel.textContent = currState;
    for (const li of stateList.children) {
      li.classList.toggle('current', li.dataset.state === currState);
    }
    const prevTrace = traceSpan.textContent === '—' ? [] : traceSpan.textContent.split(' → ').filter(Boolean);
    prevTrace.push(currState);
    traceSpan.textContent = prevTrace.join(' \u2192 ');
  } catch (err) {
    alert(err.message);
  }
});

// Undo logic
undoBtn.addEventListener('click', () => {
  if (undoStack.length === 0) return;
  const act = undoStack.pop();
  switch (act.type) {
    case 'add_state':
      // remove recently added state
      model.states = model.states.filter(s => s !== act.state);
      model.accepts = model.accepts.filter(a => a !== act.state);
      if (model.start === act.state) model.start = null;
      model.transitions = model.transitions.filter(t => t.from !== act.state && t.to !== act.state);
      break;
    case 'delete_state':
      // restore state and its transitions
      if (!model.states.includes(act.state)) model.states.push(act.state);
      if (act.wasStart) model.start = act.state;
      if (act.acceptsBefore.includes(act.state) && !model.accepts.includes(act.state)) {
        model.accepts.push(act.state);
      }
      for (const t of act.transitions) {
        if (!model.transitions.find(x => x.from===t.from && x.symbol===t.symbol && x.to===t.to)) {
          model.transitions.push({...t});
        }
      }
      break;
    case 'add_trans':
      // remove that transition
      model.transitions = model.transitions.filter(x => !(x.from===act.trans.from && x.symbol===act.trans.symbol && x.to===act.trans.to));
      break;
    case 'del_trans':
      // add it back if possible (respect DFA uniqueness)
      if (!model.transitions.find(x => x.from===act.trans.from && x.symbol===act.trans.symbol)) {
        model.transitions.push(act.trans);
      }
      break;
    case 'set_start':
      model.start = act.prev ?? null;
      break;
    case 'set_accepts':
      model.accepts = act.prev ?? [];
      break;
    case 'set_all':
      model = act.snapshot;
      break;
  }
  refreshUI();
});

// Import/Export
exportBtn.addEventListener('click', () => {
  const data = JSON.stringify(model, null, 2);
  const blob = new Blob([data], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "fsm_model.json";
  a.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const m = JSON.parse(reader.result);
      if (!m.states || !('accepts' in m) || !Array.isArray(m.transitions)) {
        alert('Invalid JSON for FSM.');
        return;
      }
      pushUndo({type:'set_all', snapshot: JSON.parse(JSON.stringify(model))});
      model = m;
      if (!model.type) model.type = "DFA";
      refreshUI();
      resetRunner();
    } catch (err) {
      alert('Invalid JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
});

async function loadExample(path) {
  const res = await fetch(path);
  const m = await res.json();
  pushUndo({type:'set_all', snapshot: JSON.parse(JSON.stringify(model))});
  model = m;
  if (!model.type) model.type = "DFA";
  refreshUI();
  resetRunner();
}

loadExample1.addEventListener('click', () => loadExample('./examples/dfa_even_zeros.json'));
loadExample2.addEventListener('click', () => loadExample('./examples/dfa_ends_with_ab.json'));

// Preview drawing & PNG
function redrawPreview(){
  const ctx = previewCanvas.getContext('2d');
  const W = previewCanvas.width, H = previewCanvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2;

  // positions on a circle
  const n = model.states.length || 1;
  const cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 60;
  const pos = {}; const angleStep = (Math.PI*2)/n;
  model.states.forEach((s, i)=>{
    const ang = -Math.PI/2 + i*angleStep;
    pos[s] = {x: cx + R*Math.cos(ang), y: cy + R*Math.sin(ang)};
  });

  // draw edges aggregated
  const aggr = aggregateTransitions(model);
  ctx.font = '12px ui-monospace, monospace';
  ctx.fillStyle = '#000';
  for (const e of aggr) {
    const a = pos[e.from], b = pos[e.to];
    if (!a || !b) continue;
    if (e.from === e.to) {
      // self loop
      const r = 24;
      ctx.beginPath();
      ctx.arc(a.x, a.y-36, r, 0, Math.PI*2);
      ctx.stroke();
      // arrow head
      ctx.beginPath();
      ctx.moveTo(a.x, a.y-12); ctx.lineTo(a.x-6, a.y-24); ctx.lineTo(a.x+6, a.y-24); ctx.closePath(); ctx.fill();
      ctx.fillText(e.symbols.join(','), a.x+10, a.y-48);
    } else {
      // straight line with arrow
      const dx=b.x-a.x, dy=b.y-a.y;
      const len = Math.hypot(dx,dy);
      const ux = dx/len, uy = dy/len;
      const startOffset = 18, endOffset = 22;
      const x1 = a.x + ux*startOffset, y1 = a.y + uy*startOffset;
      const x2 = b.x - ux*endOffset, y2 = b.y - uy*endOffset;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      // arrow head at end
      const ah = 8;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - ux*ah - uy*ah*0.6, y2 - uy*ah + ux*ah*0.6);
      ctx.lineTo(x2 - ux*ah + uy*ah*0.6, y2 - uy*ah - ux*ah*0.6);
      ctx.closePath(); ctx.fill();
      // label
      const mx = (x1+x2)/2, my = (y1+y2)/2;
      ctx.fillText(e.symbols.join(','), mx+4, my-4);
    }
  }

  // draw nodes
  for (const s of model.states) {
    const p = pos[s];
    ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, Math.PI*2); ctx.stroke();
    if (model.accepts.includes(s)) {
      ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI*2); ctx.stroke();
    }
    ctx.fillText(s, p.x-6, p.y+32);
    if (model.start === s) {
      // start marker
      ctx.beginPath();
      ctx.moveTo(p.x-28, p.y); ctx.lineTo(p.x-16, p.y-6); ctx.lineTo(p.x-16, p.y+6); ctx.closePath(); ctx.fill();
    }
  }
}

redrawBtn.addEventListener('click', redrawPreview);
exportPngBtn.addEventListener('click', () => {
  const url = previewCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url; a.download = 'fsm_preview.png'; a.click();
});

// Init
refreshUI();
resetRunner();
