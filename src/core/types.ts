export type SeriesMode = 'line' | 'candlestick';

export type LinePoint = {
  t: number;
  v: number;
};

export type CandlePoint = {
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type PulseTheme = {
  background: string;
  grid: string;
  line: string;
  areaTop: string;
  areaBottom: string;
  upCandle: string;
  downCandle: string;
  marker: string;
  text: string;
};

export const defaultTheme: PulseTheme = {
  background: '#0b1218',
  grid: 'rgba(255,255,255,0.08)',
  line: '#62e4b7',
  areaTop: 'rgba(98,228,183,0.3)',
  areaBottom: 'rgba(98,228,183,0.02)',
  upCandle: '#4dd48f',
  downCandle: '#ef5e5e',
  marker: '#ffcc66',
  text: '#d6dde5'
};
