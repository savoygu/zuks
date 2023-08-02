import type { PackageIndexes, VueUseFunction } from '@vueuse/metadata'

import _metadata, { categories as _categories, functions as _functions, packages as _packages } from './index.json'

const categoriesOrder = [
  'Form 表单组件',
  'Data 数据展示',
  'Navigation 导航',
  'Feedback 反馈组件',
  'Others 其他',
]

export const metadata = _metadata as PackageIndexes
export const functions = _functions as PackageIndexes['functions']
export const packages = _packages as PackageIndexes['packages']
export const categories = _categories as PackageIndexes['categories']

export const functionNames = functions.map(f => f.name)
export const categoryNames = Array.from(categories)
  .sort((a, b) => categoriesOrder.indexOf(a) - categoriesOrder.indexOf(b))
  .sort((a, b) => a.startsWith('@') ? 1 : b.startsWith('@') ? -1 : 0)
export const coreCategoryNames = categoryNames
  .filter(f => !f.startsWith('@'))
export const addonCategoryNames = categoryNames
  .filter(f => f.startsWith('@'))

export function getFunction(name: string) {
  return metadata.functions.find(f => f.name === name)
}

export function getCategories(functions: VueUseFunction[]): string[] {
  return Array.from(new Set(functions.reduce<string[]>((acc, cur) => {
    return (!cur.internal && cur.category) ? acc.concat(cur.category) : []
  }, []))).sort((a, b) => {
    return (a.startsWith('@') && !b.startsWith('@'))
      ? 1
      : (b.startsWith('@') && !a.startsWith('@'))
          ? -1
          : a.localeCompare(b)
  })
}
