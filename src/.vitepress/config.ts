import { defineConfig } from 'vitepress'

const Guide = [
  { text: '开始吧', link: '/guide/' },
  { text: '最佳实践', link: '/guide/best-practice' },
]

const CoreFunctions = [
  { text: '远程搜索', link: '/core/useRemoteSearch/' },
]

const DefaultSidebar = [
  { text: '指南', items: Guide },
  { text: '核心功能', items: CoreFunctions },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Zuks',
  description: 'Vue 组件库组合工具集',
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
      '/core/': DefaultSidebar,
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
