import { resolve } from 'node:path'
import type { OutputOptions, RollupOptions } from 'rollup'
import type { Options as ESBuildOptions } from 'rollup-plugin-esbuild'
import esbuild from 'rollup-plugin-esbuild'
import json from '@rollup/plugin-json'
import dts from 'rollup-plugin-dts'
import fg from 'fast-glob'
import { packages } from './packages/metadata/packages'

const configs: RollupOptions[] = []

const pluginEsbuild = esbuild()
const pluginDts = dts()

const externals = [
  'vue',
  '@zuks/core',
  '@zuks/metadata',
  '@vueuse/core',
  'lodash-es',
]

function esbuildMinifer(options: ESBuildOptions) {
  const { renderChunk } = esbuild(options)

  return {
    name: 'esbuild-minifer',
    renderChunk,
  }
}

for (const { name, globals, submodules, iife, build, cjs, mjs, dts, target, external } of packages) {
  if (build === false)
    continue

  const iifeGlobals = {
    'vue': 'Vue',
    '@zuks/core': 'Zuks',
    '@vueuse/core': 'VueUse',
    'lodash-es': '_',
    ...globals,
  }

  const iifeName = 'Zuks'
  const functionNames = ['index']

  if (submodules)
    functionNames.push(...fg.globSync('*/index.ts', { cwd: resolve(`packages/${name}`) }).map(i => i.split('/')[0]))

  for (const fn of functionNames) {
    const input = fn === 'index'
      ? `packages/${name}/index.ts`
      : `packages/${name}/${fn}/index.ts`

    const output: OutputOptions[] = []

    if (mjs !== false) {
      output.push({
        file: `packages/${name}/dist/${fn}.mjs`,
        format: 'es',
      })
    }

    if (cjs !== false) {
      output.push({
        file: `packages/${name}/dist/${fn}.cjs`,
        format: 'cjs',
      })
    }

    if (iife !== false) {
      output.push(
        {
          file: `packages/${name}/dist/${fn}.iife.js`,
          format: 'iife',
          name: iifeName,
          extend: true,
          globals: iifeGlobals,
        },
        {
          file: `packages/${name}/dist/${fn}.iife.min.js`,
          format: 'iife',
          name: iifeName,
          extend: true,
          globals: iifeGlobals,
          plugins: [
            esbuildMinifer({
              minify: true,
            }),
          ],
        },
      )
    }

    configs.push({
      input,
      output,
      plugins: [
        target ? esbuild({ target }) : pluginEsbuild,
        json(),
      ],
      external: [
        ...externals,
        ...(external || []),
      ],
    })

    if (dts !== false) {
      configs.push({
        input,
        output: {
          file: `packages/${name}/dist/${fn}.d.ts`,
          format: 'es',
        },
        plugins: [
          pluginDts,
        ],
        external: [
          ...externals,
          ...(external || []),
        ],
      })
    }
  }
}

export default configs
