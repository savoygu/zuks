/* eslint-disable unused-imports/no-unused-vars */
// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import Theme from 'vitepress/theme'
import DemoBlock from '@ruabick/vitepress-demo-block'
import '@ruabick/vitepress-demo-block/dist/style.css'
import { anu } from 'anu-vue'
import 'anu-vue/dist/style.css'
import '@anu-vue/preset-theme-default/dist/style.css'
import './styles/demo.css'
import './styles/vars.css'
import 'uno.css'
import type { EnhanceAppContext } from 'vitepress'

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }: EnhanceAppContext) {
    // ...
    app.use(anu)
    // eslint-disable-next-line vue/component-definition-name-casing
    app.component('demo', DemoBlock)
  },
}
