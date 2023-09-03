import { describe, expect, test } from 'vitest'
import type { Comment } from '../../.test'
import { isBelowNode18, useRequest } from '../../.test'
import type { ActionMap } from '.'
import { useActionList } from '.'

const commentList: Comment[] = []
let commentMap: ActionMap = {}

interface CommentData {
  list: Comment[]
  map: ActionMap
}

const tester = test.extend({
  commentData: async ({ task: _ }, use) => {
    // fetch the comments
    const { data } = await useRequest<Comment[]>('/comments?postId=1', {})
    commentList.push(...(data.value ?? []))
    commentMap = commentList.reduce((acc, comment) => {
      acc[comment.id] = false
      return acc
    }, {} as ActionMap)

    await use({ list: commentList, map: commentMap })

    commentList.length = 0
    commentMap = {}
  },
})

describe.skipIf(isBelowNode18)('useActionList', () => {
  tester('should be works', async ({ commentData: { list, map } }: { commentData: CommentData }) => {
    const { actionVisible, actionMap, currentRow, operating, onActionRow, toggleAction, makeActionMap } = useActionList<Comment>()
    expect(actionVisible.value).toBe(false)
    expect(actionMap.value).toEqual({})
    expect(operating.value).toEqual(false)

    // build rows map
    makeActionMap(list)
    expect(actionMap.value).toEqual(map)

    toggleAction(list[0])
    expect(actionVisible.value).toBe(true)
    expect(currentRow.value).toEqual(list[0])

    // doAction
    await onActionRow(() => {
      expect(operating.value).toBe(true)
    })

    // rest state
    expect(operating.value).toBe(false)
    expect(actionVisible.value).toBe(false)
    expect(currentRow.value).toBeUndefined()
  })
})
