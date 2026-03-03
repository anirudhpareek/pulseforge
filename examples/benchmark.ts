import { performance } from 'node:perf_hooks';
import { decimateLine } from '../src/core/decimate';

const N = 300_000;
const pts = Array.from({ length: N }, (_, i) => ({ t: i, v: Math.sin(i / 30) * 20 + Math.random() * 3 + 80 }));

const runs = 20;
const times: number[] = [];
for (let i = 0; i < runs; i++) {
  const t0 = performance.now();
  decimateLine(pts, 700);
  times.push(performance.now() - t0);
}

times.sort((a, b) => a - b);
const median = times[Math.floor(times.length / 2)];
const p95 = times[Math.floor(times.length * 0.95)];

console.log(`Decimation benchmark (${N} points -> 700): median=${median.toFixed(2)}ms p95=${p95.toFixed(2)}ms`);
