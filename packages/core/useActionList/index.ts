import { computed, ref } from 'vue'

export type ActionMap = Record<keyof any, boolean>
export type MaybePromise<T> = T | Promise<T>

export interface UseActionListOptions {
  /**
   * Row key
   *
   * @default "id"
   */
  key?: string
  beforeAction?: () => MaybePromise<any>
  afterAction?: () => MaybePromise<any>
}

export function useActionList<T extends Record<keyof any, any>>(options: UseActionListOptions = {}) {
  const actionMap = ref<ActionMap>({})
  const actionVisible = ref(false)
  const currentRow = ref<T>()
  const key = options.key ?? 'id'

  const operating = computed(() => {
    return !!(currentRow.value && actionMap.value[currentRow.value[key]])
  })

  async function onActionRow(doAction: () => MaybePromise<any>) {
    await options.beforeAction?.()

    actionMap.value[key] = true
    try {
      await doAction()
    }
    catch (err) {
      actionMap.value[key] = false
      toggleAction()
    }

    await options.afterAction?.()
  }

  function makeActionMap(data: T[] = []) {
    actionMap.value = data.reduce((acc, item) => {
      acc[item[key]] = false
      return acc
    }, {} as ActionMap)
  }

  function toggleAction(row?: T) {
    actionVisible.value = !actionVisible.value
    currentRow.value = row
  }

  return {
    actionMap,
    actionVisible,
    currentRow,
    operating,

    onActionRow,
    makeActionMap,
    toggleAction,
  }
}

export type UseActionListReturn = ReturnType<typeof useActionList>
