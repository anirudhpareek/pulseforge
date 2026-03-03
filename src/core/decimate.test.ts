import { describe, expect, it } from 'vitest';
import { decimateCandles, decimateLine } from './decimate';

describe('decimation', () => {
  it('keeps line series within limit', () => {
    const points = Array.from({ length: 3000 }, (_, i) => ({ t: i, v: Math.sin(i / 20) }));
    const out = decimateLine(points, 500);
    expect(out.length).toBeLessThanOrEqual(500);
    expect(out[0]).toEqual(points[0]);
  });

  it('keeps candles within limit', () => {
    const points = Array.from({ length: 3000 }, (_, i) => ({
      t: i,
      open: 100,
      high: 110,
      low: 90,
      close: 101
    }));
    const out = decimateCandles(points, 200);
    expect(out.length).toBeLessThanOrEqual(200);
  });
});
