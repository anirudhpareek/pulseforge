const canvas = document.getElementById('pulse-canvas');
const fpsNode = document.getElementById('fps');
const ptsNode = document.getElementById('pts');
const modeNode = document.getElementById('mode');

const ctx = canvas.getContext('2d');
const state = {
  points: [],
  mode: 'line',
  lastPointAt: performance.now(),
  lastModeAt: performance.now(),
  lastFrameAt: performance.now(),
  rx: 0,
  ry: 0
};

let width = 0;
let height = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function addPoint(t) {
  const prev = state.points[state.points.length - 1] ?? { y: height * 0.52 };
  const base = Math.sin(t / 800) * 2 + Math.cos(t / 570) * 1.3;
  const jitter = (Math.random() - 0.5) * 12;
  const y = Math.min(height * 0.86, Math.max(height * 0.13, prev.y + base + jitter));

  state.points.push({ x: width - 20, y });
  for (const p of state.points) p.x -= 3.4;
  state.points = state.points.filter((p) => p.x > 18);
  ptsNode.textContent = String(state.points.length);
}

function drawGrid() {
  ctx.fillStyle = '#0a1118';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let i = 1; i < 5; i++) {
    const y = (height / 5) * i;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  for (let i = 1; i < 8; i++) {
    const x = (width / 8) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  ctx.stroke();
}

function drawLine() {
  if (state.points.length < 2) return;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(102,245,204,0.25)');
  grad.addColorStop(1, 'rgba(102,245,204,0.02)');

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

  ctx.strokeStyle = '#66f5cc';
  ctx.lineWidth = 2.3;
  ctx.stroke();

  const last = state.points[state.points.length - 1];
  ctx.lineTo(last.x, height - 14);
  ctx.lineTo(first.x, height - 14);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#f5b774';
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
    ctx.strokeStyle = up ? '#59e9b7' : '#f36d7f';
    ctx.beginPath();
    ctx.moveTo(c.x, c.high);
    ctx.lineTo(c.x, c.low);
    ctx.stroke();

    const top = Math.min(c.open, c.close);
    const h = Math.max(2, Math.abs(c.close - c.open));
    ctx.fillStyle = up ? '#59e9b7' : '#f36d7f';
    ctx.fillRect(c.x - 3, top, 6, h);
  }
}

function tick(now) {
  const delta = now - state.lastFrameAt;
  state.lastFrameAt = now;

  if (now - state.lastPointAt > 62) {
    addPoint(now);
    state.lastPointAt = now;
  }

  if (now - state.lastModeAt > 6200) {
    state.mode = state.mode === 'line' ? 'candlestick' : 'line';
    modeNode.textContent = state.mode;
    state.lastModeAt = now;
  }

  drawGrid();
  if (state.mode === 'line') drawLine();
  else drawCandles();

  const media = document.querySelector('.hero-media');
  if (media) {
    media.style.transform = `perspective(1000px) rotateX(${state.rx}deg) rotateY(${state.ry}deg)`;
  }

  fpsNode.textContent = (1000 / Math.max(1, delta)).toFixed(0);
  requestAnimationFrame(tick);
}

window.addEventListener('resize', resize);

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  const revealNodes = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  revealNodes.forEach((n) => io.observe(n));

  const hero = document.querySelector('.hero-media');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      state.ry = nx * 1.4;
      state.rx = -ny * 1.4;
    });
    hero.addEventListener('mouseleave', () => {
      state.rx = 0;
      state.ry = 0;
    });
  }
} else {
  document.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('show'));
}

resize();
for (let i = 0; i < 120; i++) addPoint(performance.now() + i * 16);
requestAnimationFrame(tick);
