import { CandlePoint, LinePoint } from './types';

const padRatio = 0.12;

export function lineDomain(points: LinePoint[]): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const p of points) {
    if (p.v < min) min = p.v;
    if (p.v > max) max = p.v;
  }
  const span = Math.max(1e-6, max - min);
  return [min - span * padRatio, max + span * padRatio];
}

export function candleDomain(points: CandlePoint[]): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const p of points) {
    if (p.low < min) min = p.low;
    if (p.high > max) max = p.high;
  }
  const span = Math.max(1e-6, max - min);
  return [min - span * padRatio, max + span * padRatio];
}

export function mapY(v: number, min: number, max: number, h: number, pad: number): number {
  const norm = (v - min) / (max - min || 1);
  return h - pad - norm * (h - pad * 2);
}
