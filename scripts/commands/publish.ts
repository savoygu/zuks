import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { packages } from '../../packages/metadata/packages'
import { version } from '../../package.json'

export default defineCommand({
  meta: {
    name: 'publish',
    description: 'Zuks Publish Scripts',
  },
  run: async () => {
    consola.info('Build')
    execSync('nr build', { stdio: 'inherit' })

    let command = 'npm publish --access public'
    if (version.includes('beta'))
      command += ' --tag beta'

    consola.info('Publish')
    for (const { name } of packages) {
      execSync(command, { stdio: 'inherit', cwd: join('packages', name, 'dist') })
      consola.success(`Published @zuks/${name}`)
    }
  },
})
