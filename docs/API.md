# API

## `<PulseForge />`

### Props
- `mode`: `'line' | 'candlestick'`
- `lineData`: `{ t: number; v: number }[]`
- `candleData`: `{ t; open; high; low; close }[]`
- `width`, `height`: canvas size in px
- `maxPoints`: max rendered points after decimation
- `theme`: partial theme overrides
- `showFps`: show current frame estimate
- `animate`: toggle animation loop
- `respectReducedMotion`: disable RAF when user prefers reduced motion
- `ariaLabel`: accessibility label for canvas

## Core exports
- `decimateLine(points, maxPoints)`
- `decimateCandles(points, maxPoints)`
