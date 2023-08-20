import { defineConfig } from 'vitepress'
import { categoryNames, coreCategoryNames, metadata } from '../metadata/metadata'

const Guide = [
  { text: '开始吧', link: '/guide/' },
  { text: '最佳实践', link: '/guide/best-practice' },
]

const CoreCategories = coreCategoryNames.map(c => ({
  text: c,
  activeMatch: '___', // never active
  link: `/functions#category=${c}`,
}))

const DefaultSidebar = [
  { text: '指南', items: Guide },
  { text: '核心功能', items: CoreCategories },
]

const FunctionsSidebar = getFunctionsSidebar()

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Zuks',
  description: 'Vue 组件库组合工具集',
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: '指南',
        items: [
          { text: '指南', items: Guide },
        ],
      },
      // { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: {
      '/guide/': DefaultSidebar,
      '/functions': FunctionsSidebar,
      '/core/': FunctionsSidebar,
      '/shared/': FunctionsSidebar,
    },

    outline: {
      label: '在这个页面上',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/savoygu/zuks' },
    ],

    editLink: {
      pattern: 'https://github.com/savoygu/zuks/tree/main/src/:path',
      text: '在GitHub上编辑此页面',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
  },
})

function getFunctionsSidebar() {
  const links = []

  for (const name of categoryNames) {
    if (name.startsWith('_'))
      continue

    const functions = metadata.functions.filter(i => i.category === name && !i.internal)

    links.push({
      text: name,
      items: functions.map(i => ({
        text: i.name,
        link: i.external || `/${i.package}/${i.name}/`,
      })),
      link: name.startsWith('@')
        ? (functions[0].external || `/${functions[0].package}/README`)
        : undefined,
    })
  }

  return links
}
