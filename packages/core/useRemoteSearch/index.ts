import { ref, shallowRef } from 'vue'
import type { MaybeRefOrGetter, UseFetchOptions, UseFetchReturn } from '@vueuse/core'
import { toValue, useFetch } from '@vueuse/core'
import { isPlainObject } from 'lodash-es'
import type { KvOrCb, LabelValue } from '@zuks/shared'

export interface UseRemoteSearchOptions<T, U> {
  /**
   * 请求地址
   */
  url: MaybeRefOrGetter<string>
  /**
   * 请求参数属性
   *
   * @default 'name'
   */
  requestKey?: string
  /**
   * 响应结果属性
   *
   * @default 'data'
   */
  responseKey?: string
  /**
   * 额外的请求数据
   */
  extraData?: MaybeRefOrGetter<Record<string, any>>
  /**
   * 响应格式处理
   */
  kvOrCb?: KvOrCb<T, U>
  /**
   * 首次自动搜索
   *
   * @default false
   */
  firstAutoSearch?: boolean
  /**
   * 自定义 fetch
   *
   * @default useFetch
   */
  fetcher?: typeof useFetch
  /**
   * 自定义 fetch 参数
   */
  fetcherOptions?: UseFetchOptions
  /**
   * fetch 参数
   */
  fetchOptions?: RequestInit
}

export function useRemoteSearch<T extends Record<string, any>, U = LabelValue>(options: UseRemoteSearchOptions<T, U>) {
  const data = shallowRef<U[]>([])
  const loading = ref(false)

  let firstSearchData: U[] = []

  const {
    url: _url,
    requestKey = 'name',
    responseKey = 'data',
    kvOrCb,
    extraData,
    firstAutoSearch,
    fetcher = useFetch,
    fetcherOptions,
    fetchOptions: _fetchOptions,
  } = options

  async function onRemoteSearch(query: string) {
    if (!query && !firstAutoSearch) {
      data.value = []
      return
    }

    if (!query && firstSearchData.length) {
      data.value = firstSearchData
      return
    }

    loading.value = true

    let fetchOptions: RequestInit
    let url = _url

    const body = {
      [requestKey]: query,
      ...toValue(extraData),
    }

    if (_fetchOptions?.method && ['GET', 'HEAD'].includes(_fetchOptions.method.toUpperCase())) {
      fetchOptions = _fetchOptions
      url = `${toValue(_url)}?${new URLSearchParams(body)}`
    }
    else {
      fetchOptions = {
        body: JSON.stringify(body),
        ..._fetchOptions,
      }
    }

    let response: UseFetchReturn<T>
    if (fetcher === useFetch)
      response = await fetcher<T>(url, fetchOptions, fetcherOptions).json<T>()
    else
      response = await fetcher<T>(url, fetchOptions, fetcherOptions)

    const { error, data: dataRef } = response
    if (!error.value) {
      const _data = dataRef.value! as T
      const result = typeof kvOrCb === 'function'
        ? kvOrCb(_data)
        : (isPlainObject(_data)
            ? _data[responseKey] ?? _data.result ?? []
            : Array.isArray(_data)
              ? _data
              : []) as U[]
      // console.log(typeof _data, fetcher === useFetch)
      if (Array.isArray(kvOrCb)) {
        const [label, value] = kvOrCb
        data.value = result.map((item: any) => ({
          label: item[label],
          value: item[value],
        })) as U[]
      }
      else {
        data.value = result
      }

      if (!query && !firstSearchData.length)
        firstSearchData = data.value
    }

    loading.value = false

    return response
  }

  if (firstAutoSearch)
    onRemoteSearch('')

  return {
    data,
    loading,
    onRemoteSearch,
  }
}

export type UseRemoteSearchReturn = ReturnType<typeof useRemoteSearch>
