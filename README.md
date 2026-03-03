# PulseForge

Realtime React chart component inspired by Liveline-style motion, built for production package quality.

## Live Landing
- Production: https://pulseforge-site.vercel.app
- Fallback alias: https://landing-delta-dusky.vercel.app
- Source: `landing/` (dark-mode static microsite)

## Features
- Single-canvas rendering (`requestAnimationFrame`) for low overhead
- `line` and `candlestick` modes
- Data decimation for high-frequency streams
- SSR-safe fallback output
- Reduced-motion support
- TypeScript-first API with ESM/CJS + tree-shakable exports
- Storybook demos
- Stress harness (`jitter`, `gaps`, `spikes`, `reconnect`)
- Benchmark script for decimation performance

## Install
```bash
npm install @anirudhpareek/pulseforge
```

## Usage
```tsx
import { PulseForge } from '@anirudhpareek/pulseforge';

const data = Array.from({ length: 1000 }, (_, i) => ({ t: Date.now() + i * 1000, v: 100 + Math.sin(i / 20) }));

export default function App() {
  return (
    <PulseForge
      mode="line"
      lineData={data}
      width={860}
      height={300}
      maxPoints={600}
      showFps
      ariaLabel="Live market stream"
    />
  );
}
```

## Scripts
- `npm run build` - build ESM/CJS bundles
- `npm run test` - run tests
- `npm run dev` - Storybook dev
- `npm run build-storybook` - Storybook static build
- `npm run stress` - stress scenarios
- `npm run bench` - decimation benchmark

## Performance Notes
- Recommended budget: keep `maxPoints <= 1000` for 60fps targets.
- Use decimation before rendering very long historical streams.
- Enable reduced motion in accessibility-sensitive contexts.

## Publishing
1. Bump version in `package.json`.
2. `npm run check`
3. `npm publish --access public`
