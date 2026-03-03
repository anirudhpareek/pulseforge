import { performance } from 'node:perf_hooks';
import { decimateCandles, decimateLine } from '../src/core/decimate';
import { generateLineStream, toCandles } from './simulator';

const scenarios = ['jitter', 'gaps', 'spikes', 'reconnect'] as const;

for (const s of scenarios) {
  const source = generateLineStream(12000, s);
  const t0 = performance.now();
  const line = decimateLine(source, 600);
  const candles = decimateCandles(toCandles(source), 600);
  const elapsed = performance.now() - t0;

  console.log(
    `${s.padEnd(9)} | src=${source.length.toString().padStart(5)} | line=${line.length
      .toString()
      .padStart(4)} | candles=${candles.length.toString().padStart(4)} | ${elapsed.toFixed(2)}ms`
  );
}
