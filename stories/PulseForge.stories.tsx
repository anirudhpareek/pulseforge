import type { Meta, StoryObj } from '@storybook/react';
import { PulseForge } from '../src/PulseForge';
import { generateLineStream, toCandles } from '../stress/simulator';

const lineData = generateLineStream(1200, 'jitter');
const candleData = toCandles(lineData, 8);

const meta: Meta<typeof PulseForge> = {
  title: 'PulseForge/Realtime Chart',
  component: PulseForge,
  parameters: {
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof PulseForge>;

export const Line: Story = {
  args: {
    lineData,
    mode: 'line',
    width: 900,
    height: 320,
    showFps: true,
    ariaLabel: 'Line stream demo'
  }
};

export const Candlestick: Story = {
  args: {
    candleData,
    mode: 'candlestick',
    width: 900,
    height: 320,
    ariaLabel: 'Candlestick stream demo'
  }
};
