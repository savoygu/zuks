import { resolve as _resolve, join, relative } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import type { PackageIndexes, VueUseFunction, VueUsePackage } from '@vueuse/metadata'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { simpleGit } from 'simple-git'
import matter from 'gray-matter'
import { packages } from '../packages'
import { getCategories } from '../metadata'

const resolve = (...paths: string[]) => _resolve(__dirname, ...paths)

export const DOCS_URL = 'https://zuks.netlify.app'
export const DIR_PACKAGE = resolve('..') // zuks/packages/metadata
export const DIR_ROOT = resolve('../../..') // zuks
export const DIR_SRC = resolve(DIR_ROOT, 'packages') // zuks/packages
export const DIR_TYPES = resolve(DIR_ROOT, 'types/packages') // zuks/types/packages

export const git = simpleGit(DIR_ROOT)

export async function listFunctions(dir: string, ignore: string[] = []) {
  const files = await fg('*', {
    cwd: dir,
    onlyDirectories: true,
    ignore: [
      '_',
      'dist',
      'node_modules',
      ...ignore,
    ],
  })
  files.sort()
  return files
}

export async function readMetadata() {
  const indexes: PackageIndexes = {
    packages: {},
    categories: [],
    functions: [],
  }

  for (const _package of packages) {
    if (_package.utils)
      continue

    const dir = join(DIR_SRC, _package.name)
    const functions = await listFunctions(dir)

    const pkg: VueUsePackage = {
      ..._package,
      dir: relative(DIR_ROOT, dir),
      docs: undefined,
    }
    indexes.packages[_package.name] = pkg

    await Promise.all(functions.map(async (name) => {
      const docPath = join(dir, name, 'index.md')
      const codePath = join(dir, name, 'index.ts')

      const _function: VueUseFunction = {
        name,
        package: pkg.name,
        lastUpdated: +await git.raw('log', '-1', '--format=%at', codePath) * 1000,
      }

      if (existsSync(join(dir, name, 'component.ts')))
        _function.component = true
      if (existsSync(join(dir, name, 'directive.ts')))
        _function.directive = true

      if (!existsSync(docPath)) {
        _function.internal = true
        indexes.functions.push(_function)
        return
      }
      _function.docs = `${DOCS_URL}/${_package.name}/${name}/`

      const docRaw = await readFile(docPath, 'utf-8')
      const { content: doc, data: frontmatter } = matter(docRaw)
      const category = frontmatter.category
      _function.category = ['core'].includes(_package.name) ? category : `@${_package.display}`

      let description = (doc
        .replace(/\r\n/g, '\n')
        .match(/# \w+[\s\n]+(.+?)(?:, |\. |\n|\.\n)/m) || []
      )[1] || ''
      description = description.trim()
      _function.description = description
      if (description.includes('DEPRECATED') || frontmatter.deprecated)
        _function.deprecated = true

      indexes.functions.push(_function)
    }))
  }

  indexes.functions.sort((a, b) => a.name.localeCompare(b.name))
  indexes.categories = getCategories(indexes.functions)

  return indexes
}

async function run() {
  const indexes = await readMetadata()
  await fs.writeJSON(join(DIR_PACKAGE, 'index.json'), indexes, { spaces: 2 })
}

run()
