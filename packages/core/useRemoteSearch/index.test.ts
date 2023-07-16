import { describe, expect, it } from 'vitest'
import { useRemoteSearch } from '.'

describe('useRemoteSearch', () => {
  it('should work', () => {
    const result = useRemoteSearch()
    expect(result).toBeUndefined()
  })
})
