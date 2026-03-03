import { candleDomain, lineDomain, mapY } from './scale';
import { CandlePoint, defaultTheme, LinePoint, PulseTheme } from './types';

export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, theme: PulseTheme): void {
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const rows = 4;
  const cols = 6;
  for (let r = 1; r < rows; r++) {
    const y = (h / rows) * r;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  for (let c = 1; c < cols; c++) {
    const x = (w / cols) * c;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();
}

export function drawLineSeries(
  ctx: CanvasRenderingContext2D,
  points: LinePoint[],
  width: number,
  height: number,
  theme: PulseTheme = defaultTheme
): void {
  if (points.length < 2) return;
  const [min, max] = lineDomain(points);
  const pad = 16;
  const start = points[0].t;
  const end = points[points.length - 1].t;
  const tspan = Math.max(1, end - start);

  const yLast = mapY(points[points.length - 1].v, min, max, height, pad);
  const xLast = pad + ((points[points.length - 1].t - start) / tspan) * (width - pad * 2);

  const area = ctx.createLinearGradient(0, pad, 0, height);
  area.addColorStop(0, theme.areaTop);
  area.addColorStop(1, theme.areaBottom);

  const screen = points.map((p) => ({
    x: pad + ((p.t - start) / tspan) * (width - pad * 2),
    y: mapY(p.v, min, max, height, pad)
  }));

  ctx.beginPath();
  ctx.moveTo(screen[0].x, screen[0].y);
  for (let i = 1; i < screen.length; i++) {
    const prev = screen[i - 1];
    const curr = screen[i];
    const cx = (prev.x + curr.x) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + curr.y) / 2);
    if (i === screen.length - 1) {
      ctx.quadraticCurveTo(cx, (prev.y + curr.y) / 2, curr.x, curr.y);
    }
  }

  ctx.lineWidth = 2.25;
  ctx.strokeStyle = theme.line;
  ctx.stroke();

  ctx.lineTo(xLast, height - pad);
  ctx.lineTo(pad, height - pad);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(xLast, yLast, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = theme.marker;
  ctx.fill();
}

export function drawCandlestickSeries(
  ctx: CanvasRenderingContext2D,
  points: CandlePoint[],
  width: number,
  height: number,
  theme: PulseTheme = defaultTheme
): void {
  if (!points.length) return;
  const [min, max] = candleDomain(points);
  const pad = 16;
  const bodyW = Math.max(3, (width - pad * 2) / points.length * 0.58);

  points.forEach((p, i) => {
    const x = pad + ((i + 0.5) / points.length) * (width - pad * 2);
    const yOpen = mapY(p.open, min, max, height, pad);
    const yClose = mapY(p.close, min, max, height, pad);
    const yHigh = mapY(p.high, min, max, height, pad);
    const yLow = mapY(p.low, min, max, height, pad);
    const up = p.close >= p.open;

    ctx.strokeStyle = up ? theme.upCandle : theme.downCandle;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.stroke();

    const top = Math.min(yOpen, yClose);
    const h = Math.max(1.5, Math.abs(yClose - yOpen));
    ctx.fillStyle = up ? theme.upCandle : theme.downCandle;
    ctx.fillRect(x - bodyW / 2, top, bodyW, h);
  });
}
