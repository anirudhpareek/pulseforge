const canvas = document.getElementById('pulse-canvas');
const fpsNode = document.getElementById('fps');
const ptsNode = document.getElementById('pts');
const modeNode = document.getElementById('mode');
const copyBtn = document.getElementById('copy-code');
const codeSnippet = document.getElementById('code-snippet');
const ctx = canvas.getContext('2d');

const state = {
  points: [],
  mode: 'line',
  lastPointAt: performance.now(),
  lastModeAt: performance.now(),
  lastFrameAt: performance.now()
};

let w = 0;
let h = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  w = rect.width;
  h = rect.height;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function addPoint(t) {
  const prev = state.points[state.points.length - 1] ?? { y: h * 0.52 };
  const base = Math.sin(t / 900) * 1.8 + Math.cos(t / 680) * 1.2;
  const jitter = (Math.random() - 0.5) * 8.5;
  const y = Math.min(h * 0.86, Math.max(h * 0.14, prev.y + base + jitter));

  state.points.push({ x: w - 18, y });
  for (const p of state.points) p.x -= 3.2;
  state.points = state.points.filter((p) => p.x > 8);
  ptsNode.textContent = String(state.points.length);
}

function drawGrid() {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  const cols = 10;
  const rows = 6;

  ctx.beginPath();
  for (let c = 0; c <= cols; c++) {
    const x = (w / cols) * c;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let r = 0; r <= rows; r++) {
    const y = (h / rows) * r;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  const axisY = h * 0.52;
  ctx.strokeStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath();
  ctx.moveTo(0, axisY);
  ctx.lineTo(w + 12, axisY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.moveTo(w + 12, axisY);
  ctx.lineTo(w + 2, axisY - 5);
  ctx.lineTo(w + 2, axisY + 5);
  ctx.closePath();
  ctx.fill();
}

function drawLine() {
  if (state.points.length < 2) return;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0.015)');

  const first = state.points[0];
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < state.points.length; i++) {
    const prev = state.points[i - 1];
    const p = state.points[i];
    const cx = (prev.x + p.x) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + p.y) / 2);
    if (i === state.points.length - 1) {
      ctx.quadraticCurveTo(cx, (prev.y + p.y) / 2, p.x, p.y);
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.78)';
  ctx.lineWidth = 1.7;
  ctx.stroke();

  const last = state.points[state.points.length - 1];
  ctx.lineTo(last.x, h - 12);
  ctx.lineTo(first.x, h - 12);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawCandles() {
  if (state.points.length < 9) return;
  const groups = [];
  for (let i = 0; i < state.points.length; i += 7) {
    const slice = state.points.slice(i, i + 7);
    if (slice.length < 2) continue;
    groups.push({
      x: slice[Math.floor(slice.length / 2)].x,
      open: slice[0].y,
      close: slice[slice.length - 1].y,
      high: Math.min(...slice.map((p) => p.y)),
      low: Math.max(...slice.map((p) => p.y))
    });
  }

  for (const c of groups) {
    const up = c.close < c.open;
    ctx.strokeStyle = up ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.52)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.x, c.high);
    ctx.lineTo(c.x, c.low);
    ctx.stroke();

    const top = Math.min(c.open, c.close);
    const hh = Math.max(2, Math.abs(c.close - c.open));
    ctx.fillStyle = up ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.38)';
    ctx.fillRect(c.x - 2.7, top, 5.4, hh);
  }
}

function tick(now) {
  const dt = now - state.lastFrameAt;
  state.lastFrameAt = now;

  if (now - state.lastPointAt > 62) {
    addPoint(now);
    state.lastPointAt = now;
  }

  if (now - state.lastModeAt > 7600) {
    state.mode = state.mode === 'line' ? 'candlestick' : 'line';
    state.lastModeAt = now;
    modeNode.textContent = state.mode;
  }

  drawGrid();
  if (state.mode === 'line') drawLine();
  else drawCandles();

  fpsNode.textContent = (1000 / Math.max(1, dt)).toFixed(0);
  requestAnimationFrame(tick);
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

resize();
window.addEventListener('resize', resize);
for (let i = 0; i < 120; i++) addPoint(performance.now() + i * 16);
requestAnimationFrame(tick);
