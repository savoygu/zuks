import { join } from 'node:path'
import fs from 'fs-extra'
import type { VueUseFunction } from '@vueuse/metadata'
import { DIR_TYPES } from '../packages/metadata/constants'
import { getCategories } from '../packages/metadata'

export function replacer(code: string, value: string, key: string, insert: 'head' | 'tail' | 'none' = 'none'): string {
  const START = `<!--${key}_STARTS-->`
  const END = `<!--${key}_ENDS-->`
  const regex = new RegExp(`${START}[\\s\\S]*?${END}`, 'im')

  const target = value ? `${START}\n${value}\n${END}` : `${START}${END}`

  if (!regex.test(code)) {
    if (insert === 'none')
      return code
    if (insert === 'head')
      return `${target}\n\n${code}`
    return `${code}\n\n${target}`
  }

  return code.replace(regex, target)
}

export function stringifyFunctions(functions: VueUseFunction[], title = true) {
  const list = getCategories(functions)
    .filter(category => !category.startsWith('_'))
    .flatMap((category) => {
      const categoryFunctions = functions
        .filter(i => i.category === category && !i.deprecated)
        .sort((a, b) => a.name.localeCompare(b.name))
      return [
        ...(title ? [`### ${category}`] : []),
        ...categoryFunctions.map(({ name, docs, description }) =>
          `  - [\`${name}\`](${docs})${description ? ` — ${description}` : ''}`,
        ),
        '\n',
      ]
    })
    .join('\n')

  return list
}

export async function getTypeDefinition(pkg: string, name: string): Promise<string | undefined> {
  const typingFilepath = join(DIR_TYPES, `${pkg}/${name}/index.d.ts`)
  if (!fs.pathExistsSync(typingFilepath))
    return

  let types = await fs.readFile(typingFilepath, 'utf-8')
  if (!types)
    return

  // clean up types
  types = types
    .replace(/import\(.*?\)\./g, '')
    .replace(/import[\s\S]+?from ?["'][\s\S]+?["']/g, '')
    .replace(/export {}/g, '')

  const prettier = await import('prettier')
  return prettier
    .format(types, { semi: false, parser: 'typescript' })
    .then(value => value.trim())
}
