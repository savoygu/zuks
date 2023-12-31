import { describe, expect, it } from 'vitest'
import type { Comment, IdNamePost, LabelValuePost, useFetcher } from '../../.test'
import { baseUrl, isBelowNode18, retry, useRequest } from '../../.test'
import { useRemoteSearch } from '.'

describe.skipIf(isBelowNode18)('useRemoteSearch', () => {
  it('should support get request', async () => {
    const { data, loading, onRemoteSearch } = useRemoteSearch<Comment[], IdNamePost>({
      url: `${baseUrl}/comments`,
      requestKey: 'postId',
      fetchOptions: { method: 'GET' },
    })
    expect(data.value).toStrictEqual([])
    expect(loading.value).toBe(false)

    await onRemoteSearch('1')

    expect(data.value.length).toBeGreaterThan(0)
    expect(data.value.every(item => item.postId === 1)).toBe(true)
    expect(loading.value).toBe(false)
  })

  it('should use the custom fetcher', async () => {
    const { data, loading, onRemoteSearch } = useRemoteSearch<Comment[], IdNamePost>({
      url: '/comments',
      requestKey: 'postId',
      fetchOptions: { method: 'GET' },
      fetcher: useRequest as typeof useFetcher,
    })
    expect(data.value).toStrictEqual([])
    expect(loading.value).toBe(false)

    await onRemoteSearch('1')

    expect(data.value.length).toBeGreaterThan(0)
    expect(data.value.every(item => item.postId === 1)).toBe(true)
    expect(loading.value).toBe(false)
  })

  it('should automatically execute onRemoteSearch', async () => {
    const { data, loading } = useRemoteSearch<Comment[], IdNamePost>({
      url: `${baseUrl}/posts/1/comments`,
      requestKey: 'postId',
      fetchOptions: { method: 'GET' },
      firstAutoSearch: true,
    })
    expect(data.value).toStrictEqual([])
    expect(loading.value).toBe(true)

    await retry(() => {
      expect(data.value.length).toBeGreaterThan(0)
      expect(data.value.every(item => item.postId === 1)).toBe(true)
      expect(loading.value).toBe(false)
    }, { timeout: 5000 })
  })

  it('should process the response results with kvOrCb array', async () => {
    const { data, loading, onRemoteSearch } = useRemoteSearch<Comment[], LabelValuePost>({
      url: `${baseUrl}/comments`,
      requestKey: 'postId',
      fetchOptions: { method: 'GET' },
      kvOrCb: ['name', 'id'],
    })
    expect(data.value).toStrictEqual([])
    expect(loading.value).toBe(false)

    await onRemoteSearch('1')

    expect(data.value.length).toBeGreaterThan(0)
    expect(data.value.every(item => item.label)).toBe(true)
    expect(data.value.every(item => item.value)).toBe(true)
    expect(loading.value).toBe(false)
  })

  it('should process the response results with kvOrCb function', async () => {
    const { data, loading, onRemoteSearch } = useRemoteSearch<Comment[], LabelValuePost>({
      url: `${baseUrl}/comments`,
      requestKey: 'postId',
      fetchOptions: { method: 'GET' },
      kvOrCb: (data) => {
        return data?.map(({ id, name, postId }) => ({ label: name, value: id, postId })) ?? []
      },
    })
    expect(data.value).toStrictEqual([])
    expect(loading.value).toBe(false)

    await onRemoteSearch('1')

    expect(data.value.length).toBeGreaterThan(0)
    expect(data.value.every(item => item.label)).toBe(true)
    expect(data.value.every(item => item.value)).toBe(true)
    expect(data.value.every(item => item.postId)).toBe(true)
    expect(data.value.every(item => item.postId === 1)).toBe(true)
    expect(loading.value).toBe(false)
  })

  it('should pass extraData as a request parameter', async () => {
    const { data, loading, onRemoteSearch } = useRemoteSearch<Comment[], LabelValuePost>({
      url: `${baseUrl}/comments`,
      requestKey: 'postId',
      fetchOptions: { method: 'GET' },
      extraData: {
        postId: '2',
      },
    })
    expect(data.value).toStrictEqual([])
    expect(loading.value).toBe(false)

    await onRemoteSearch('1') // Invalid and overridden

    expect(data.value.length).toBeGreaterThan(0)
    expect(data.value.every(item => item.postId === 2)).toBe(true)
    expect(loading.value).toBe(false)
  })
})
