import type { CSS as StitchesCSS } from '@stitches/react';
import { createStitches } from '@stitches/react';
export type { VariantProps } from '@stitches/react';
import { Inter } from "@next/font/google";
import localFont from '@next/font/local'

export const inter = Inter({ variable: '--inter-font', subsets: ['latin'] });
export const kadena = localFont({ src: './fonts/KadenaCode.otf' });

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    fonts: {
      inter: inter.style.fontFamily,
      kadena: kadena.style.fontFamily,
    },
    colors: {
      black: 'rgb(0 0 0)',
      white: 'rgb(255 255 255)',
      overlayColor: 'rgba(0, 0, 0, 0.8)',
    },
    fontSizes: {
      '2xs': '0.625rem', // 10px
      xs: '0.75rem', // 12px
      s: '0.875rem', // 14px
      base: '1rem', // 16px by default
      m: '1.123rem', // 18px
      l: '1.25rem', // 20px
      xl: '1.5rem', // 24px
      '2xl': '1.75rem', // 28px
      '3xl': '2rem', // 32px
      '4xl': '2.25rem', // 36px
      '5xl': '2.5rem', //40px
      '6xl': '3rem', //52px
    },
    fontWeights: {
      light: 300,
      regular: 400,
      bold: 500,
    },
    space: {
      1: '0.25rem', // 4px
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
    },
    pageMargins: {
      xs: '16px',
      s: '28px',
      m: '40px',
      l: '60px',
      xl: '96px',
      '2xl': '96px',
    },
  },
  media: {
    xs: '(max-width: 374px)',
    s: '(min-width: 375px) and (max-width: 767px)',
    minM: '(min-width: 768px)',
    m: '(min-width: 768px) and (max-width: 1023px)',
    l: '(min-width: 1024px) and (max-width: 1439px)',
    xl: '(min-width: 1440px) and (max-width: 1919px)',
    '2xl': '(min-width: 1920px)',
  },
  utils: {},
});

export type CSS = StitchesCSS<typeof config>;
export const globalStyles = globalCss({
  body: {
    ...inter.style,
  }
})
