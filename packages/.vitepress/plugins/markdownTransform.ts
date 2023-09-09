import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { DIR_PACKAGES, DIR_TYPES, GITHUB_BLOB_URL } from '../../metadata/constants'
import { getTypeDefinition, replacer } from '../../../scripts/utils'
import { functionNames, getFunction } from '../../metadata/metadata'

export function MarkdownTransform(): Plugin {
  const hasTypes = existsSync(DIR_TYPES)
  if (!hasTypes)
    console.warn('No types dist found, run `npm run build:types` first.')

  return {
    name: 'zuks-markdown-transform',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.match(/\.md\b/))
        return null

      // linkify function names
      code = code.replace(
        new RegExp(`\`({${functionNames.join('|')}})\`(.)`, 'g'),
        (_, name, ending) => {
          if (ending === ']') // already a link
            return _
          const fn = getFunction(name)!
          return `[\`${fn.name}\`](${fn.docs}) `
        },
      )

      // convert links to relative
      code = code.replace(/https?:\/\/zuks\.netlify\.app\//g, '/')

      const [pkg, _name, i] = id.split('/').slice(-3)
      const name = functionNames.find(n => n.toLowerCase() === _name.toLowerCase()) || _name
      if (functionNames.includes(name) && i === 'index.md') {
        const frontmatterEnds = code.indexOf('---\n\n')
        const firstHeader = code.search(/\n#{2,6}\s.+/)
        const sliceIndex = firstHeader < 0 ? frontmatterEnds < 0 ? 0 : frontmatterEnds + 4 : firstHeader

        const { footer, header } = await getFunctionMarkdown(pkg, name)
        if (hasTypes)
          code = replacer(code, footer, 'FOOTER', 'tail')
        if (header)
          code = code.slice(0, sliceIndex) + header + code.slice(sliceIndex)
      }

      return code
    },
  }
}

async function getFunctionMarkdown(pkg: string, name: string) {
  const typingSection = await getTypingSection(pkg, name)

  const demoPath = ['demo.vue', 'demo.client.vue'].find(i => existsSync(join(DIR_PACKAGES, pkg, name, i)))
  const githubBlobUrl = `${GITHUB_BLOB_URL}/${pkg}/${name}`

  const sourceSection = getSourceSection(demoPath, githubBlobUrl)
  const demoSection = getDemoSection(demoPath, githubBlobUrl)

  return {
    footer: `${typingSection}\n\n${sourceSection}\n`,
    header: demoSection,
  }
}

function getDemoSection(demoPath: string | undefined, githubBlobUrl: string) {
  return demoPath
    ? `
## 演示

<demo src="./${demoPath}"></demo>
`
    : ''
}

function getSourceSection(demoPath: string | undefined, githubBlobUrl: string) {
  const links = ([
    ['Source', `${githubBlobUrl}/index.ts`],
    demoPath ? ['Demo', `${githubBlobUrl}/${demoPath}`] : undefined,
    ['Docs', `${githubBlobUrl}/index.md`],
  ])
    .filter(i => i)
    .map(i => `[${i![0]}](${i![1]})`).join(' • ')

  return `## Source\n\n${links}\n`
}

async function getTypingSection(pkg: string, name: string) {
  const types = await getTypeDefinition(pkg, name)
  let typingSection = ''
  if (types) {
    const code = `\`\`\`typescript\n${types.trim()}\n\`\`\``
    typingSection = types.length > 1000
      ? `
## 类型声明

<details>
<summary op50 italic cursor-pointer select-none>显示类型声明</summary>

${code}

</details>
`
      : `\n## 类型声明\n\n${code}`
  }
  return typingSection
}
