const canvas = document.getElementById('pulse-canvas');
const fpsNode = document.getElementById('fps');
const ptsNode = document.getElementById('pts');
const modeNode = document.getElementById('mode');
const copyBtn = document.getElementById('copy-code');
const copyInstallBtn = document.getElementById('copy-install');
const codeSnippet = document.getElementById('code-snippet');
const installSnippet = document.getElementById('install-snippet');

const ctx = canvas.getContext('2d');
let w = 0;
let h = 0;

const state = {
  mode: 'line',
  points: [],
  lastT: performance.now(),
  lastFrame: performance.now(),
  lastModeSwap: performance.now()
};

const STEP_X = 3.5;
const RIGHT_PAD = 28;
const LEFT_PAD = 20;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  w = rect.width;
  h = rect.height;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function pushPoint(t) {
  const prev = state.points[state.points.length - 1] ?? { y: h * 0.56 };
  const noise = (Math.random() - 0.5) * 15;
  const drift = Math.sin(t / 830) * 2.8 + Math.cos(t / 590) * 1.7;
  const y = Math.min(h * 0.86, Math.max(h * 0.14, prev.y + noise + drift));

  state.points.push({ x: w - RIGHT_PAD, y });
  for (const p of state.points) p.x -= STEP_X;
  state.points = state.points.filter((p) => p.x > LEFT_PAD);
  ptsNode.textContent = String(state.points.length);
}

function seedInitialSeries() {
  state.points = [];
  let x = w - RIGHT_PAD;
  let y = h * 0.56;
  let t = performance.now();
  while (x > LEFT_PAD) {
    const noise = (Math.random() - 0.5) * 10;
    const drift = Math.sin(t / 860) * 2.2 + Math.cos(t / 640) * 1.5;
    y = Math.min(h * 0.84, Math.max(h * 0.16, y + noise + drift));
    state.points.unshift({ x, y });
    x -= STEP_X;
    t -= 16;
  }
  ptsNode.textContent = String(state.points.length);
}

function drawGrid() {
  ctx.fillStyle = '#071018';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let i = 1; i < 5; i++) {
    const y = (h / 5) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  for (let i = 1; i < 8; i++) {
    const x = (w / 8) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();
}

function drawLine() {
  if (state.points.length < 2) return;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(80,245,200,0.28)');
  grad.addColorStop(1, 'rgba(80,245,200,0.01)');

  ctx.beginPath();
  ctx.moveTo(state.points[0].x, state.points[0].y);
  for (let i = 1; i < state.points.length; i++) {
    const p = state.points[i];
    const prev = state.points[i - 1];
    const cx = (p.x + prev.x) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + p.y) / 2);
    if (i === state.points.length - 1) {
      ctx.quadraticCurveTo(cx, (prev.y + p.y) / 2, p.x, p.y);
    }
  }

  ctx.strokeStyle = '#4af2c6';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  const last = state.points[state.points.length - 1];
  ctx.lineTo(last.x, h - 16);
  ctx.lineTo(state.points[0].x, h - 16);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(last.x, last.y, 3.7, 0, Math.PI * 2);
  ctx.fillStyle = '#f7aa5d';
  ctx.fill();
}

function drawCandles() {
  if (state.points.length < 8) return;
  const candles = [];
  for (let i = 0; i < state.points.length; i += 6) {
    const slice = state.points.slice(i, i + 6);
    if (slice.length < 2) continue;
    candles.push({
      x: slice[Math.floor(slice.length / 2)].x,
      open: slice[0].y,
      close: slice[slice.length - 1].y,
      high: Math.min(...slice.map((s) => s.y)),
      low: Math.max(...slice.map((s) => s.y))
    });
  }

  for (const c of candles) {
    const up = c.close < c.open;
    ctx.strokeStyle = up ? '#52e3ab' : '#f06d7a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.x, c.high);
    ctx.lineTo(c.x, c.low);
    ctx.stroke();

    const top = Math.min(c.open, c.close);
    const height = Math.max(2, Math.abs(c.close - c.open));
    ctx.fillStyle = up ? '#52e3ab' : '#f06d7a';
    ctx.fillRect(c.x - 3.1, top, 6.2, height);
  }
}

function frame(now) {
  const dt = now - state.lastFrame;
  state.lastFrame = now;

  if (now - state.lastT > 60) {
    pushPoint(now);
    state.lastT = now;
  }

  if (now - state.lastModeSwap > 6200) {
    state.mode = state.mode === 'line' ? 'candlestick' : 'line';
    modeNode.textContent = state.mode;
    state.lastModeSwap = now;
  }

  drawGrid();
  if (state.mode === 'line') drawLine();
  else drawCandles();

  const fps = 1000 / Math.max(1, dt);
  fpsNode.textContent = fps.toFixed(0);

  requestAnimationFrame(frame);
}

if (copyBtn && codeSnippet) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet.textContent ?? '');
      copyBtn.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1200);
    } catch {
      copyBtn.textContent = 'Error';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1200);
    }
  });
}

if (copyInstallBtn && installSnippet) {
  copyInstallBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(installSnippet.textContent ?? '');
      copyInstallBtn.textContent = 'Copied';
      setTimeout(() => {
        copyInstallBtn.textContent = 'Copy';
      }, 1200);
    } catch {
      copyInstallBtn.textContent = 'Error';
      setTimeout(() => {
        copyInstallBtn.textContent = 'Copy';
      }, 1200);
    }
  });
}

window.addEventListener('resize', resize);
resize();
seedInitialSeries();
requestAnimationFrame(frame);
