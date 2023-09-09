import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetAnu, presetIconExtraProperties } from 'anu-vue'
import { presetThemeDefault } from '@anu-vue/preset-theme-default'

export default defineConfig({
  shortcuts: {
    'border-main': 'border-$vp-c-divider',
    'bg-main': 'bg-gray-400',
    'bg-base': 'bg-white dark:bg-hex-1a1a1a',
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: presetIconExtraProperties,
    }),

    presetAnu(),
    presetThemeDefault(),
  ],
  content: {
    pipeline: {
      include: [/.*\/anu-vue\.js(.*)?$/, './**/*.vue', './**/*.md'],
    },
  },
  theme: {
    colors: {
      primary: '#646cff',
    },
    fontFamily: {
      mono: 'var(--vt-font-family-mono)',
    },
  },
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
