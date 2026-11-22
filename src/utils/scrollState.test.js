import { describe, expect, it } from 'vitest'
import { horizontalScrollState } from './scrollState'

describe('horizontalScrollState', () => {
  it('only exposes the forward control at the beginning of an overflowing row', () => {
    expect(horizontalScrollState({ scrollLeft: 0, clientWidth: 200, scrollWidth: 500 })).toEqual({ canScrollBack: false, canScrollForward: true })
  })

  it('updates controls at the end and when no overflow exists', () => {
    expect(horizontalScrollState({ scrollLeft: 300, clientWidth: 200, scrollWidth: 500 })).toEqual({ canScrollBack: true, canScrollForward: false })
    expect(horizontalScrollState({ scrollLeft: 0, clientWidth: 200, scrollWidth: 200 })).toEqual({ canScrollBack: false, canScrollForward: false })
  })
})
