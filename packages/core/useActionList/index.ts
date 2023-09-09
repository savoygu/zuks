import { computed, ref } from 'vue'

export type ActionMap = Record<keyof any, boolean>
export type MaybePromise<T> = T | Promise<T>
export type DoAction = () => MaybePromise<any>

export interface UseActionListOptions {
  /**
   * Row key
   *
   * @default "id"
   */
  key?: string
  beforeAction?: DoAction
  afterAction?: DoAction
}

export function useActionList<T extends Record<keyof any, any>>(options: UseActionListOptions = {}) {
  const actionMap = ref<ActionMap>({})
  const actionVisible = ref(false)
  const currentRow = ref<T>()
  const currentRowId = ref<keyof any>()
  const key = options.key ?? 'id'

  const operating = computed(() => {
    return !!((currentRow.value && actionMap.value[currentRow.value[key]]) || (currentRowId.value && actionMap.value[currentRowId.value]))
  })

  async function onActionRow(id: keyof any, doAction: DoAction): Promise<any>
  async function onActionRow(doActon: DoAction): Promise<any>
  async function onActionRow(idOrDoAction: keyof any | DoAction, doAction?: DoAction) {
    await options.beforeAction?.()

    let _doAction: DoAction
    let id = currentRow.value?.[key]
    if (typeof idOrDoAction !== 'function') {
      id = idOrDoAction
      _doAction = doAction!
    }
    else {
      _doAction = idOrDoAction
    }
    currentRowId.value = id
    actionMap.value[id] = true
    try {
      await _doAction?.()
    }
    finally {
      actionMap.value[id] = false
      currentRowId.value = undefined
      currentRow.value && toggleAction()
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
