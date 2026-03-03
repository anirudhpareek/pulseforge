const canvas = document.getElementById('quality-canvas');
const ctx = canvas.getContext('2d');

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

function drawGrid() {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
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

  // center axis
  const axisY = h * 0.52;
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.moveTo(0, axisY);
  ctx.lineTo(w + 18, axisY);
  ctx.stroke();

  // axis arrow
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.moveTo(w + 18, axisY);
  ctx.lineTo(w + 6, axisY - 6);
  ctx.lineTo(w + 6, axisY + 6);
  ctx.closePath();
  ctx.fill();
}

function drawWave(now) {
  const baseline = h * 0.52;
  const amplitude = h * 0.22;
  const segments = 7;
  const segW = w / segments;

  for (let s = 0; s < segments; s++) {
    const startX = s * segW;
    const splitX = startX + segW * 0.46;
    const endX = startX + segW;

    // dashed climb
    ctx.setLineDash([5, 12]);
    ctx.strokeStyle = 'rgba(255,255,255,0.72)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX + 2, baseline + amplitude * 0.72);
    ctx.lineTo(splitX, baseline - amplitude);
    ctx.stroke();

    // smooth fall
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,0.78)';
    ctx.beginPath();
    ctx.moveTo(splitX, baseline - amplitude);

    const t = (now / 1400 + s * 0.14) % 1;
    const cp1x = splitX + segW * (0.12 + t * 0.03);
    const cp1y = baseline - amplitude;
    const cp2x = splitX + segW * (0.56 + t * 0.04);
    const cp2y = baseline + amplitude * 0.95;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX - 2, baseline + amplitude * 0.72);
    ctx.stroke();
  }

  // bottom markers
  const y = h * 0.9;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;

  const a = w * 0.51;
  const b = w * 0.63;
  const c = w * 0.71;

  [a, b, c].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x, y + 9);
    ctx.stroke();
  });

  function arrow(x1, x2) {
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x1 + 8, y - 5);
    ctx.lineTo(x1 + 8, y + 5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x2, y);
    ctx.lineTo(x2 - 8, y - 5);
    ctx.lineTo(x2 - 8, y + 5);
    ctx.closePath();
    ctx.fill();
  }

  arrow(a + 8, b - 8);
  arrow(b + 8, c - 8);
}

function frame(now) {
  drawGrid();
  drawWave(now);
  requestAnimationFrame(frame);
}

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(frame);
