import { createFetch, MaybeRefOrGetter, UseFetchOptions } from '@vueuse/core'

export const baseUrl = 'https://jsonplaceholder.typicode.com'

export const useFetcher = createFetch({
  baseUrl,
})

export function useRequest<T>(url: MaybeRefOrGetter<string>, options: RequestInit, useFetchOptions?: UseFetchOptions) {
  return useFetcher(url, options, useFetchOptions).json<T>()
}

// function usePost(...args: Parameters<typeof useRequest>) {
//   return useRequest(args[0], { method: 'POST', ...args[1] }, args[2])
// }
