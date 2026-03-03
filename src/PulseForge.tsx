import React, { CSSProperties, ReactElement, useEffect, useMemo, useRef } from 'react';
import { decimateCandles, decimateLine } from './core/decimate';
import { drawCandlestickSeries, drawGrid, drawLineSeries } from './core/draw';
import { CandlePoint, defaultTheme, LinePoint, PulseTheme, SeriesMode } from './core/types';

export type PulseForgeProps = {
  lineData?: LinePoint[];
  candleData?: CandlePoint[];
  mode?: SeriesMode;
  width?: number;
  height?: number;
  maxPoints?: number;
  className?: string;
  style?: CSSProperties;
  theme?: Partial<PulseTheme>;
  ariaLabel?: string;
  showFps?: boolean;
  animate?: boolean;
  respectReducedMotion?: boolean;
};

function shouldReduceMotion(respect: boolean): boolean {
  if (!respect || typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function PulseForge({
  lineData = [],
  candleData = [],
  mode = 'line',
  width = 720,
  height = 320,
  maxPoints = 600,
  className,
  style,
  theme,
  ariaLabel = 'Realtime chart',
  showFps = false,
  animate = true,
  respectReducedMotion = true
}: PulseForgeProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeMerged = useMemo(() => ({ ...defaultTheme, ...theme }), [theme]);

  const decimatedLine = useMemo(() => decimateLine(lineData, maxPoints), [lineData, maxPoints]);
  const decimatedCandle = useMemo(() => decimateCandles(candleData, maxPoints), [candleData, maxPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const reduced = shouldReduceMotion(respectReducedMotion);
    const useAnimation = animate && !reduced;
    let raf = 0;
    let last = performance.now();
    let fps = 0;

    const draw = (now: number): void => {
      const dt = now - last;
      last = now;
      fps = 1000 / Math.max(1, dt);

      drawGrid(ctx, width, height, themeMerged);
      if (mode === 'candlestick') {
        drawCandlestickSeries(ctx, decimatedCandle, width, height, themeMerged);
      } else {
        drawLineSeries(ctx, decimatedLine, width, height, themeMerged);
      }

      if (showFps) {
        ctx.fillStyle = themeMerged.text;
        ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(`${fps.toFixed(0)} fps`, width - 68, 18);
      }

      if (useAnimation) {
        raf = requestAnimationFrame(draw);
      }
    };

    draw(performance.now());
    if (useAnimation) raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [mode, decimatedLine, decimatedCandle, width, height, showFps, animate, respectReducedMotion, themeMerged]);

  if (typeof window === 'undefined') {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius: 12,
          background: themeMerged.background,
          color: themeMerged.text,
          padding: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          ...style
        }}
        aria-label={ariaLabel}
      >
        PulseForge chart placeholder (SSR)
      </div>
    );
  }

  return (
    <figure style={{ margin: 0, ...style }} className={className}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
      <figcaption style={{ position: 'absolute', left: -9999 }}>{ariaLabel}</figcaption>
    </figure>
  );
}
