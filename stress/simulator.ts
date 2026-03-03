import { CandlePoint, LinePoint } from '../src/core/types';

export type StressScenario = 'jitter' | 'gaps' | 'spikes' | 'reconnect';

export function generateLineStream(points: number, scenario: StressScenario): LinePoint[] {
  const out: LinePoint[] = [];
  let value = 100;
  let t = Date.now();

  for (let i = 0; i < points; i++) {
    const jitter = scenario === 'jitter' ? (Math.random() - 0.5) * 2.5 : (Math.random() - 0.5) * 0.7;
    const spike = scenario === 'spikes' && i % 77 === 0 ? (Math.random() > 0.5 ? 15 : -15) : 0;
    const gap = scenario === 'gaps' && i % 120 === 0 ? 18000 : 1000;
    const reconnect = scenario === 'reconnect' && i % 220 === 0 ? 45000 : 1000;
    t += gap + reconnect - 1000;
    value = Math.max(1, value + jitter + spike);
    out.push({ t, v: value });
  }

  return out;
}

export function toCandles(line: LinePoint[], window = 6): CandlePoint[] {
  const out: CandlePoint[] = [];
  for (let i = 0; i < line.length; i += window) {
    const slice = line.slice(i, i + window);
    if (!slice.length) continue;
    out.push({
      t: slice[0].t,
      open: slice[0].v,
      high: Math.max(...slice.map((s) => s.v)),
      low: Math.min(...slice.map((s) => s.v)),
      close: slice[slice.length - 1].v
    });
  }
  return out;
}
