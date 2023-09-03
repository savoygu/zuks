import { resolve } from 'node:path'
import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import UnoCSS from 'unocss/vite'
import Inspect from 'vite-plugin-inspect'
import { MarkdownTransform } from './.vitepress/plugins/markdownTransform'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [
    MarkdownTransform(),

    Components({
      dirs: resolve(__dirname, '.vitepress/theme/components'),
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
      dts: './.vitepress/components.d.ts',
      transformer: 'vue3',
    }),
    Icons({
      compiler: 'vue3',
      defaultStyle: 'display: inline-block',
    }),
    UnoCSS(),
    Inspect(),
  ],
  resolve: {
    alias: {
      '@zuks/core': resolve(__dirname, 'core/index.ts'),
      '@zuks/metadata': resolve(__dirname, 'metadata/index.ts'),
      '@zuks/shared': resolve(__dirname, 'shared/index.ts'),
    },
  },
  css: {
    postcss: {
      plugins: [
        require('postcss-nested'),
      ],
    },
  },
})
