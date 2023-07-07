<script setup lang="ts">
import { computed } from 'vue'
import type { VueUseFunction } from '@vueuse/metadata'
import type { UseTimeAgoMessages } from '@vueuse/core'
import { useTimeAgo } from '@vueuse/core'
import { renderMarkdown } from '../utils'

const props = defineProps<{ fn: VueUseFunction }>()

function styledName(name: string) {
  if (name.startsWith('use'))
    return `<span opacity="70">use</span>${name.slice(3)}`
  if (name.startsWith('try'))
    return `<span opacity="70">try</span>${name.slice(3)}`
  if (name.startsWith('on'))
    return `<span opacity="70">on</span>${name.slice(2)}`
  return name
}

const link = computed(() => {
  if (props.fn.external) {
    return {
      href: props.fn.external,
      target: '_blank',
    }
  }
  return {
    href: `/${props.fn.package}/${props.fn.name}/`,
  }
})

const messages: UseTimeAgoMessages = {
  justNow: '刚刚',
  past: n => n.match(/\d/) ? `${n}前` : n,
  future: n => n.match(/\d/) ? `${n}后` : n,
  month: (n, past) => n === 1
    ? past
      ? '上个月'
      : '下个月'
    : `${n} 月`,
  year: (n, past) => n === 1
    ? past
      ? '去年'
      : '明年'
    : `${n} 年`,
  day: (n, past) => n === 1
    ? past
      ? '昨天'
      : '明天'
    : `${n} 天`,
  week: (n, past) => n === 1
    ? past
      ? '上周'
      : '下周'
    : `${n} 周`,
  hour: n => `${n} 小时`,
  minute: n => `${n} 分钟`,
  second: n => `${n} 秒`,
  invalid: '',
}

const updated = computed(() => {
  const lastUpdated = props.fn.lastUpdated
  if (!lastUpdated)
    return ''
  const timeAgo = useTimeAgo(lastUpdated, { messages })
  return `(${timeAgo.value})`
})
</script>

<template>
  <div
    text="sm" flex="~ gap1" items-center
    :class="fn.deprecated ? 'op80 saturate-0' : ''"
  >
    <a
      v-bind="link" bg="gray-400/5" p="x-1.5 y-0.5" class="rounded items-center" flex="inline gap-1 none" my-auto
      :class="fn.deprecated ? 'line-through !decoration-solid' : ''"
    >
      <span v-html="styledName(fn.name)" />
      <i v-if="fn.external" i-carbon-launch class="opacity-80 text-xs" />
    </a>
    <span op50>-</span>
    <span class="whitespace-wrap" v-html="renderMarkdown(fn.description)" />
    <span v-html="updated" />
  </div>
</template>
