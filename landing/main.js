const canvas = document.getElementById('ritual-canvas');
const energyNode = document.getElementById('energy');
const coherenceNode = document.getElementById('coherence');
const tempoNode = document.getElementById('tempo');

const lockBtn = document.getElementById('lock-signal');
const resetBtn = document.getElementById('reset-signal');

const form = document.getElementById('passport-form');
const aliasInput = document.getElementById('alias');
const intensityInput = document.getElementById('intensity');
const modeInput = document.getElementById('mode');

const passportCard = document.getElementById('passport-card');
const passportIdNode = document.getElementById('passport-id');
const passportNameNode = document.getElementById('passport-name');
const archetypeNode = document.getElementById('archetype');
const cardEnergyNode = document.getElementById('card-energy');
const cardCoherenceNode = document.getElementById('card-coherence');
const cardTempoNode = document.getElementById('card-tempo');
const passportLineNode = document.getElementById('passport-line');

const copyBtn = document.getElementById('copy-passport');
const downloadBtn = document.getElementById('download-passport');
const exportCanvas = document.getElementById('export-canvas');
const exportCtx = exportCanvas.getContext('2d');

const mobileNav = document.querySelector('.mobile-nav');

const ctx = canvas.getContext('2d');
let w = 0;
let h = 0;
let dpr = window.devicePixelRatio || 1;

const state = {
  points: [],
  lastFrame: performance.now(),
  lastPoint: performance.now(),
  energy: 0,
  coherence: 0,
  tempo: 0,
  pointer: { x: 0.5, y: 0.5, active: false },
  locked: false,
  passport: null
};

const POINT_STEP = 4;
const RIGHT_PAD = 24;
const LEFT_PAD = 20;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h >>> 0);
}

function archetypeFrom(energy, coherence, tempo, mode) {
  const score = energy * 0.42 + coherence * 0.36 + tempo * 0.22;
  if (mode === 'chaos' || score > 82) return 'Rogue Oscillator';
  if (mode === 'drift' || coherence < 45) return 'Soft Interference';
  if (tempo > 70 && coherence > 58) return 'Neon Metronome';
  return 'Quiet Reactor';
}

function updateMetrics() {
  const latest = state.points[state.points.length - 1];
  const prev = state.points[state.points.length - 2] || latest;
  const dy = Math.abs((latest?.y || h / 2) - (prev?.y || h / 2));

  state.energy = clamp(Math.round(40 + dy * 1.8 + (state.pointer.active ? 22 : 6)), 0, 99);
  state.coherence = clamp(Math.round(100 - dy * 2.6 - (state.pointer.active ? 8 : 0)), 0, 99);
  state.tempo = clamp(Math.round(48 + (state.pointer.active ? 22 : 8) + Math.random() * 8), 0, 99);

  energyNode.textContent = String(state.energy).padStart(2, '0');
  coherenceNode.textContent = String(state.coherence).padStart(2, '0');
  tempoNode.textContent = String(state.tempo).padStart(2, '0');
}

function pushPoint(t) {
  const prev = state.points[state.points.length - 1] ?? { y: h * 0.58 };
  const px = state.pointer.x * w;
  const py = state.pointer.y * h;
  const pull = state.pointer.active ? (py - prev.y) * 0.06 : Math.sin(t / 880) * 1.5;
  const drift = Math.sin(t / 930) * 1.8 + Math.cos(t / 610) * 1.4;
  const jitter = (Math.random() - 0.5) * (state.pointer.active ? 8 : 5);
  const wave = Math.sin((prev.x + t * 0.06) * 0.01) * 1.4;
  const y = clamp(prev.y + pull + drift + jitter + wave, h * 0.12, h * 0.9);

  state.points.push({ x: w - RIGHT_PAD, y, t });
  for (const p of state.points) p.x -= POINT_STEP;
  state.points = state.points.filter((p) => p.x > LEFT_PAD);

  if (state.pointer.active) {
    const shift = ((px / w) - 0.5) * 22;
    passportCard.style.setProperty('--card-shift', `${shift.toFixed(0)}px`);
  }
}

function seedInitial() {
  state.points = [];
  for (let x = LEFT_PAD; x <= w - RIGHT_PAD; x += POINT_STEP) {
    const progress = (x - LEFT_PAD) / (w - LEFT_PAD - RIGHT_PAD);
    const y = h * 0.58 + Math.sin(progress * Math.PI * 5) * (h * 0.08) + Math.cos(progress * Math.PI * 11) * (h * 0.03);
    state.points.push({ x, y, t: performance.now() });
  }
  updateMetrics();
}

function drawGrid() {
  ctx.fillStyle = '#08111c';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let i = 1; i < 6; i += 1) {
    const y = (h / 6) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  for (let i = 1; i < 10; i += 1) {
    const x = (w / 10) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();
}

function drawSignal() {
  if (state.points.length < 2) return;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(136,255,220,0.26)');
  grad.addColorStop(1, 'rgba(136,255,220,0.02)');

  ctx.beginPath();
  ctx.moveTo(state.points[0].x, state.points[0].y);
  for (let i = 1; i < state.points.length; i += 1) {
    const p = state.points[i];
    const prev = state.points[i - 1];
    const midX = (p.x + prev.x) / 2;
    const midY = (p.y + prev.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    if (i === state.points.length - 1) ctx.quadraticCurveTo(midX, midY, p.x, p.y);
  }

  ctx.strokeStyle = '#8fffe0';
  ctx.lineWidth = 2.4;
  ctx.shadowBlur = 14;
  ctx.shadowColor = 'rgba(136,255,220,0.3)';
  ctx.stroke();
  ctx.shadowBlur = 0;

  const last = state.points[state.points.length - 1];
  ctx.lineTo(last.x, h - 16);
  ctx.lineTo(state.points[0].x, h - 16);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(last.x, last.y, 3.8, 0, Math.PI * 2);
  ctx.fillStyle = '#f4ad67';
  ctx.fill();
}

function drawPointerField(t) {
  if (!state.pointer.active) return;
  const x = state.pointer.x * w;
  const y = state.pointer.y * h;
  const radius = 46 + Math.sin(t / 220) * 4;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(244,173,103,0.45)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function frame(now) {
  const dt = now - state.lastFrame;
  state.lastFrame = now;

  if (!state.locked && now - state.lastPoint > 48) {
    pushPoint(now);
    state.lastPoint = now;
    updateMetrics();
  }

  drawGrid();
  drawSignal();
  drawPointerField(now);

  if (dt > 0 && dt < 100) {
    const fps = clamp(Math.round(1000 / dt), 24, 120);
    tempoNode.textContent = String(clamp(Math.round((state.tempo + fps * 0.2) / 1.2), 0, 99)).padStart(2, '0');
  }

  requestAnimationFrame(frame);
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  w = rect.width;
  h = rect.height;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedInitial();
}

function updatePassportView(passport) {
  passportIdNode.textContent = passport.id;
  passportNameNode.textContent = passport.name;
  archetypeNode.textContent = `Archetype: ${passport.archetype}`;
  cardEnergyNode.textContent = String(passport.energy).padStart(2, '0');
  cardCoherenceNode.textContent = String(passport.coherence).padStart(2, '0');
  cardTempoNode.textContent = String(passport.tempo).padStart(2, '0');
  passportLineNode.textContent = passport.line;
}

function generatePassport() {
  const alias = (aliasInput.value.trim() || 'night-runner').slice(0, 24);
  const intensity = Number(intensityInput.value);
  const mode = modeInput.value;

  const energy = clamp(Math.round((state.energy + intensity) / 2), 0, 99);
  const coherence = clamp(Math.round((state.coherence + (100 - intensity) * 0.4)), 0, 99);
  const tempo = clamp(Math.round((state.tempo + intensity * 0.35)), 0, 99);

  const seed = hashString(`${alias}-${mode}-${energy}-${coherence}-${tempo}`);
  const id = `SP-${String(seed).slice(0, 4)}`;
  const archetype = archetypeFrom(energy, coherence, tempo, mode);
  const line = `${alias} rides a ${mode} pattern with ${energy} energy and ${coherence} coherence.`;

  const passport = { alias, name: alias, intensity, mode, energy, coherence, tempo, id, archetype, line };
  state.passport = passport;
  updatePassportView(passport);

  const params = new URLSearchParams({
    a: alias,
    i: String(intensity),
    m: mode,
    e: String(energy),
    c: String(coherence),
    t: String(tempo)
  });
  history.replaceState(null, '', `${location.pathname}?${params.toString()}#share`);
}

function drawExportCard(passport) {
  const wExp = exportCanvas.width;
  const hExp = exportCanvas.height;

  const bg = exportCtx.createLinearGradient(0, 0, wExp, hExp);
  bg.addColorStop(0, '#070d17');
  bg.addColorStop(1, '#0b1220');
  exportCtx.fillStyle = bg;
  exportCtx.fillRect(0, 0, wExp, hExp);

  exportCtx.fillStyle = 'rgba(137,255,219,0.14)';
  exportCtx.beginPath();
  exportCtx.arc(340, 230, 220, 0, Math.PI * 2);
  exportCtx.fill();

  exportCtx.fillStyle = '#e8edf7';
  exportCtx.font = '700 64px "IBM Plex Sans"';
  exportCtx.fillText('Signal Passport', 90, 130);

  exportCtx.font = '500 30px "IBM Plex Mono"';
  exportCtx.fillStyle = '#9ab0cd';
  exportCtx.fillText(passport.id, 92, 185);

  exportCtx.font = '700 72px "IBM Plex Sans"';
  exportCtx.fillStyle = '#f4f8ff';
  exportCtx.fillText(passport.name, 92, 330);

  exportCtx.font = '500 34px "IBM Plex Sans"';
  exportCtx.fillStyle = '#cdd8eb';
  exportCtx.fillText(`Archetype: ${passport.archetype}`, 92, 390);

  exportCtx.strokeStyle = 'rgba(255,255,255,0.14)';
  exportCtx.lineWidth = 2;
  exportCtx.strokeRect(90, 470, 1420, 260);

  exportCtx.font = '500 30px "IBM Plex Mono"';
  exportCtx.fillStyle = '#d7e4f8';
  exportCtx.fillText(`Energy ${String(passport.energy).padStart(2, '0')}`, 130, 555);
  exportCtx.fillText(`Coherence ${String(passport.coherence).padStart(2, '0')}`, 130, 615);
  exportCtx.fillText(`Tempo ${String(passport.tempo).padStart(2, '0')}`, 130, 675);

  exportCtx.fillStyle = '#99abc5';
  exportCtx.font = '500 26px "IBM Plex Sans"';
  exportCtx.fillText(passport.line, 510, 615);
}

function applyFromUrl() {
  const p = new URLSearchParams(location.search);
  if (!p.size) return;

  const alias = p.get('a');
  const intensity = Number(p.get('i'));
  const mode = p.get('m');

  if (alias) aliasInput.value = alias;
  if (!Number.isNaN(intensity)) intensityInput.value = String(clamp(intensity, 1, 100));
  if (mode && ['focus', 'drift', 'chaos'].includes(mode)) modeInput.value = mode;

  generatePassport();
}

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  state.pointer.x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
  state.pointer.y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
  state.pointer.active = true;
});

canvas.addEventListener('pointerleave', () => {
  state.pointer.active = false;
});

lockBtn.addEventListener('click', () => {
  state.locked = !state.locked;
  lockBtn.textContent = state.locked ? 'Unlock signal' : 'Lock signal';
});

resetBtn.addEventListener('click', () => {
  state.locked = false;
  lockBtn.textContent = 'Lock signal';
  seedInitial();
  passportCard.style.setProperty('--card-shift', '0px');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  generatePassport();
});

copyBtn.addEventListener('click', async () => {
  const p = state.passport;
  if (!p) generatePassport();
  const payload = state.passport;
  const text = `I minted a Signal Passport: ${payload.id} / ${payload.archetype}.\nEnergy ${payload.energy} • Coherence ${payload.coherence} • Tempo ${payload.tempo}\n${location.href}`;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied';
  } catch {
    copyBtn.textContent = 'Copy failed';
  }

  setTimeout(() => {
    copyBtn.textContent = 'Copy share text';
  }, 1100);
});

downloadBtn.addEventListener('click', () => {
  if (!state.passport) generatePassport();
  drawExportCard(state.passport);

  const a = document.createElement('a');
  a.href = exportCanvas.toDataURL('image/png');
  a.download = `${state.passport.id.toLowerCase()}-signal-passport.png`;
  a.click();
});

if (mobileNav) {
  mobileNav.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      mobileNav.removeAttribute('open');
    });
  });
}

window.addEventListener('resize', resize);

resize();
applyFromUrl();
if (!state.passport) generatePassport();
requestAnimationFrame(frame);
