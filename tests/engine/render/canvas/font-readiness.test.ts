import { describe, expect, test } from 'bun:test'

import type { SceneNode } from '@open-pencil/scene-graph'

import { isNodeBaseFontLoaded, isNodeFontLoaded } from '#core/canvas/text'
import { fontManager } from '#core/text/fonts'

describe('canvas text font readiness', () => {
  test('requires the exact requested font weight before rendering text', () => {
    const family = `ExactWeight_${Date.now()}`
    const node = {
      type: 'TEXT',
      text: 'Bold title',
      fontFamily: family,
      fontWeight: 700,
      italic: false,
      styleRuns: []
    } as SceneNode

    fontManager.markLoaded(family, 'Regular', new ArrayBuffer(8))
    expect(isNodeBaseFontLoaded({} as Parameters<typeof isNodeBaseFontLoaded>[0], node)).toBe(false)
    expect(isNodeFontLoaded({} as Parameters<typeof isNodeFontLoaded>[0], node)).toBe(false)

    fontManager.markLoaded(family, 'Bold', new ArrayBuffer(8))
    expect(isNodeBaseFontLoaded({} as Parameters<typeof isNodeBaseFontLoaded>[0], node)).toBe(true)
    expect(isNodeFontLoaded({} as Parameters<typeof isNodeFontLoaded>[0], node)).toBe(true)
  })

  test('keeps base font ready even when CJK fallback is still missing', async () => {
    const family = `CJKBase_${Date.now()}`
    const manager = fontManager as typeof fontManager & { cjkFallbackFamilies: string[] }
    const originalFallbacks = [...manager.cjkFallbackFamilies]
    const interData = await Bun.file('public/Inter-Regular.ttf').arrayBuffer()

    fontManager.markLoaded(family, 'Regular', interData)
    manager.cjkFallbackFamilies = []

    const node = {
      type: 'TEXT',
      text: '\u4e2d\u6587\u6807\u9898',
      fontFamily: family,
      fontWeight: 400,
      italic: false,
      styleRuns: []
    } as SceneNode

    try {
      expect(isNodeBaseFontLoaded({} as Parameters<typeof isNodeBaseFontLoaded>[0], node)).toBe(true)
      expect(isNodeFontLoaded({} as Parameters<typeof isNodeFontLoaded>[0], node)).toBe(false)
    } finally {
      manager.cjkFallbackFamilies = originalFallbacks
    }
  })
})
