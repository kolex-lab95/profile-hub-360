import { describe, expect, it } from 'vitest'
import { footerCopyright } from './copyright'

describe('footerCopyright', () => {
  it('builds the copyright from the current supplied year without hardcoding it', () => {
    expect(footerCopyright(2031)).toBe('© 2031 Portfolio Hub')
  })
})
