import { join } from 'node:path'
import { defineCommand } from 'citty'
import { $ } from 'execa'
import { consola } from 'consola'
import { packages } from '../../packages/metadata/packages'
import { version } from '../../package.json'

export default defineCommand({
  meta: {
    name: 'publish',
    description: 'Zuks Publish Scripts',
  },
  run: async () => {
    const $$ = $({ stdio: 'inherit' })

    consola.info('Build')
    await $$`nr build`

    let command = 'npm publish --access public'
    if (version.includes('beta'))
      command += ' --tag beta'

    consola.info('Publish')
    for (const { name } of packages) {
      await $$({ cwd: join('packages', name, 'dist') })`${command}`
      consola.success(`Published @zuks/${name}`)
    }
  },
})
