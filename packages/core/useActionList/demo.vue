<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { promiseTimeout } from '@vueuse/shared'
import type { Comment } from '../../../packages/.test'
import { useRequest } from '../../../packages/.test/fetcher'
import { useActionList } from '.'

const {
  actionVisible, operating, currentRow,
  makeActionMap, onActionRow, toggleAction,
} = useActionList<Comment>()
const comments = ref<Comment[]>([])

onMounted(() => {
  getComments()
})

function onAction(comment: Comment) {
  onActionRow(comment.id, async () => {
    await promiseTimeout(2000) // delay
    comments.value = comments.value.filter(i => i.id !== comment.id) // 移除
  })
}

async function getComments() {
  const { data } = await useRequest<Comment[]>('/comments?postId=1', {})
  comments.value = data.value?.map(item => ({ ...item, text: item.name })) ?? []
  // build rows map
  makeActionMap(comments.value)
}
</script>

<template>
  <ADialog v-model="actionVisible" title="温馨提示" text="确定要删除该评论吗？">
    <div class="a-card-body flex justify-end">
      <ABtn variant="light" @click="toggleAction()">
        关闭
      </ABtn>
      <ABtn class="ml-4" :loading="operating" @click="onAction(currentRow!)">
        确定
      </ABtn>
    </div>
  </ADialog>
  <AList :items="comments" class="[--a-list-item-margin:0_1rem] [--a-list-item-padding:0rem]">
    <template #item-append="slotProps">
      <ABtn color="danger" class="text-sm" @click="toggleAction(comments[slotProps.index])">
        删除
      </ABtn>
    </template>
  </AList>
</template>
