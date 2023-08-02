import { join, resolve } from 'node:path'
import { consola } from 'consola'
import { defineCommand } from 'citty'
import { packages } from '@zuks/metadata/packages'
import { copyFile, readJSON, writeJSON } from 'fs-extra'
import fg from 'fast-glob'
import { $ } from 'execa'
import { version } from '../../package.json'

export default defineCommand({
  meta: {
    name: 'build',
    description: 'Zuks Build Scripts',
  },
  args: {
    watch: {
      type: 'boolean',
      description: 'Enable watch mode',
      alias: 'w',
    },
  },
  run: async ({ args }) => {
    const $$ = $({ stdio: 'inherit' })

    const rootDir = resolve(__dirname, '../..')

    consola.info('Clean up')
    await $$`nr clean`

    consola.info('Rollup build')
    await $$`nr build:rollup${args.watch ? ' --watch' : ''}`

    // build meta
    for (const { name } of packages) {
      const pkgRoot = resolve(rootDir, 'packages', name)
      const pkgDist = resolve(pkgRoot, 'dist')

      copyFile(join(rootDir, 'LICENSE'), join(pkgDist, 'LICENSE'))

      if (name === 'core')
        await copyFile(join(rootDir, 'README.md'), join(pkgDist, 'README.md'))

      const files = await fg(['README.md', 'index.json', '*.cjs', '*.mjs', '*.d.ts'], { cwd: pkgRoot })
      for (const file of files)
        copyFile(join(pkgRoot, file), join(pkgDist, file))

      const pkgJSON = await readJSON(join(pkgRoot, 'package.json'))
      for (const key of Object.keys(pkgJSON.dependencies ?? {})) {
        if (key.startsWith('@zuks/'))
          pkgJSON.dependencies[key] = version
      }
      await writeJSON(join(pkgDist, 'package.json'), pkgJSON, { spaces: 2 })
    }
  },
})
