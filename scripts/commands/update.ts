import { join, resolve } from 'node:path'
import { defineCommand } from 'citty'
import { metadata } from '@zuks/metadata'
import { packages } from '@zuks/metadata/packages'
import type { PackageIndexes } from '@vueuse/metadata'
import { existsSync, readFile, readJSON, writeFile, writeJSON } from 'fs-extra'
import { $fetch } from 'ohmyfetch'
import matter from 'gray-matter'
import YAML from 'js-yaml'
import { replacer, stringifyFunctions } from '../utils'

const DIR_ROOT = resolve(__dirname, '../..')
const REPO = 'https://github.com/savoygu/zuks'

export default defineCommand({
  meta: {
    name: 'update',
    description: 'Zuks Update Scripts',
  },
  run: async () => {
    await updatePackageEntryImport(metadata)
    await updatePackageREADME(metadata)
    await updateFunctionsREADME(metadata)
    await updatePackageJSON(metadata)

    process.env.NETLIFY && await updateFunctionCountBadge(metadata)
  },
})

async function updatePackageEntryImport({ packages, functions }: PackageIndexes) {
  for (const { name, dir, manualImport } of Object.values(packages)) {
    if (manualImport)
      continue

    let imports: string[] = []
    if (name === 'components') {
      // TODO
    }
    else {
      imports = functions
        .reduce<string[]>((acc, f) => {
          if (f.package === name)
            acc.push(f.name)
          return acc
        }, [])
        .sort()
        .map(name => `export * from './${name}'`)
    }

    if (name === 'core') {
      // TODO export types
    }

    await writeFile(join(dir, 'index.ts'), `${imports.join('\n')}\n`)
  }
}

async function updatePackageREADME({ packages, functions }: PackageIndexes) {
  for (const { name, dir } of Object.values(packages)) {
    const readmePath = join(DIR_ROOT, dir, 'README.md')
    if (!existsSync(readmePath))
      continue

    const functionMd = stringifyFunctions(functions.filter(f => f.package === name), false)
    let readme = await readFile(readmePath, 'utf-8')
    readme = replacer(readme, functionMd, 'FUNCTIONS_LIST')

    await writeFile(readmePath, `${readme.trim()}\n`, 'utf-8')
  }
}

async function updateFunctionsREADME({ functions }: PackageIndexes) {
  for (const f of functions) {
    const mdPath = join(DIR_ROOT, `packages/${f.package}/${f.name}/index.md`)
    if (!existsSync(mdPath))
      continue

    let readme = await readFile(mdPath, 'utf-8')
    const { content, data = {} } = matter(readme)
    data.category = f.category || 'Unknown'
    readme = `---\n${YAML.dump(data)}---\n\n${content.trim()}`
    await writeFile(mdPath, `${readme.trim()}\n`, 'utf-8')
  }
}

export async function updatePackageJSON({ functions }: PackageIndexes) {
  const { version } = await readJSON(join(DIR_ROOT, 'package.json'))
  for (const { name, description, author, iife, submodules } of packages) {
    const packageJSONPath = join(DIR_ROOT, `packages/${name}/package.json`)
    const packageJSON = await readJSON(packageJSONPath)
    Object.assign(packageJSON, {
      version,
      description: description || packageJSON.description,
      author: author || 'savoygu <https://github.com/savoygu>',
      bugs: {
        url: `${REPO}/issues`,
      },
      homepage: name === 'core'
        ? `${REPO}#readme`
        : `${REPO}/tree/main/packages/${name}#readme`,
      repository: {
        type: 'git',
        url: `git+${REPO}.git`,
        directory: `packages/${name}`,
      },
      main: './index.cjs',
      types: './index.d.ts',
      module: './index.mjs',
      ...(iife !== false
        ? {
            unpkg: './index.iife.min.js',
            jsdelivr: './index.iife.min.js',
          }
        : {}),
      exports: {
        '.': {
          import: './index.mjs',
          require: './index.cjs',
          types: './index.d.ts',
        },
        './*': './*',
        ...packageJSON.exports,
      },
    })

    if (submodules) {
      functions
        .filter(f => f.package === name)
        .forEach((f) => {
          packageJSON.exports[`./${f.name}`] = {
            types: `./${f.name}.d.ts`,
            require: `./${f.name}.cjs`,
            import: `./${f.name}.mjs`,
          }
          if (f.component) {
            packageJSON.exports[`./${f.name}/component`] = {
              types: `./${f.name}/component.d.ts`,
              require: `./${f.name}/component.cjs`,
              import: `./${f.name}/component.mjs`,
            }
          }
        })
    }

    await writeJSON(packageJSONPath, packageJSON, { spaces: 2 })
  }
}

async function updateFunctionCountBadge({ functions }: PackageIndexes) {
  const functionsCount = functions.reduce((count, f) => {
    if (!f.internal)
      return count + 1
    return count
  }, 0)
  const url = `https://img.shields.io/badge/-${functionsCount}%20functions-13708a`
  const response = await $fetch(url)
  const data = await response.text()
  await writeFile(join(DIR_ROOT, 'packages/public/badge-function-count.svg'), data, 'utf-8')
}
