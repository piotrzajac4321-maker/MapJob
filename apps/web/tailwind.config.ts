import type { Config } from 'tailwindcss';
import preset from '@mapjob/config/tailwind';
import animate from 'tailwindcss-animate';

const config: Config = {
  presets: [preset as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  plugins: [animate],
};

export default config;
