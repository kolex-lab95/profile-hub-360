import { describe, expect, it } from 'vitest'
import { MAX_CUSTOM_COVER_BYTES, imageFormatFromSignature, validateCustomCover } from './projectCovers'

function imageFile(type, bytes, size = bytes.length) {
  return {
    type,
    size,
    slice: () => new Blob([new Uint8Array(bytes)]),
  }
}

describe('project cover validation', () => {
  it('recognizes only the supported image signatures', () => {
    expect(imageFormatFromSignature([0xff, 0xd8, 0xff, 0xe0])).toBe('jpeg')
    expect(imageFormatFromSignature([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])).toBe('png')
    expect(imageFormatFromSignature([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])).toBe('webp')
    expect(imageFormatFromSignature([0x3c, 0x73, 0x76, 0x67])).toBeNull()
  })

  it('rejects unsupported, oversized and MIME-mismatched files before storage', async () => {
    expect(await validateCustomCover(imageFile('image/svg+xml', [0x3c, 0x73, 0x76, 0x67]), { decode: async () => {} })).toMatchObject({ valid: false, reason: 'type' })
    expect(await validateCustomCover(imageFile('image/png', [0xff, 0xd8, 0xff], MAX_CUSTOM_COVER_BYTES + 1), { decode: async () => {} })).toMatchObject({ valid: false, reason: 'size' })
    expect(await validateCustomCover(imageFile('image/png', [0xff, 0xd8, 0xff]), { decode: async () => {} })).toMatchObject({ valid: false, reason: 'content' })
  })

  it('accepts a decodable JPEG only after its signature and MIME type agree', async () => {
    const result = await validateCustomCover(imageFile('image/jpeg', [0xff, 0xd8, 0xff, 0xe0]), { decode: async () => {} })
    expect(result).toEqual({ valid: true, format: 'jpeg' })
  })
})
