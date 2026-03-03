import { CandlePoint, LinePoint } from './types';

export function decimateLine(points: LinePoint[], maxPoints: number): LinePoint[] {
  if (points.length <= maxPoints || maxPoints <= 2) {
    return points;
  }

  const stride = Math.ceil(points.length / maxPoints);
  const sampled: LinePoint[] = [points[0]];

  for (let i = stride; i < points.length - 1; i += stride) {
    const slice = points.slice(i, Math.min(i + stride, points.length - 1));
    let min = slice[0];
    let max = slice[0];
    for (const p of slice) {
      if (p.v < min.v) min = p;
      if (p.v > max.v) max = p;
    }
    sampled.push(min, max);
  }

  sampled.push(points[points.length - 1]);
  sampled.sort((a, b) => a.t - b.t);
  return sampled.slice(0, maxPoints);
}

export function decimateCandles(points: CandlePoint[], maxPoints: number): CandlePoint[] {
  if (points.length <= maxPoints) {
    return points;
  }
  const stride = Math.ceil(points.length / maxPoints);
  const out: CandlePoint[] = [];
  for (let i = 0; i < points.length; i += stride) {
    const slice = points.slice(i, i + stride);
    const first = slice[0];
    const last = slice[slice.length - 1];
    out.push({
      t: first.t,
      open: first.open,
      high: Math.max(...slice.map((s) => s.high)),
      low: Math.min(...slice.map((s) => s.low)),
      close: last.close
    });
  }
  return out;
}
