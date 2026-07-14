import { describe, expect, test } from 'bun:test'

import { fontManager, type FontFallbackScript } from '@open-pencil/core/text'
import { SceneGraph } from '@open-pencil/scene-graph'

import { ensureGraphFonts } from '@/app/editor/fonts'

import { expectDefined } from '#tests/helpers/assert'
import { repoPath } from '#tests/helpers/paths'

describe('app font loading', () => {
  test('ensureGraphFonts loads fallback packs when loaded primary font misses CJK glyphs', async () => {
    const interData = await Bun.file(repoPath('public/Inter-Regular.ttf')).arrayBuffer()
    fontManager.markLoaded('Inter', 'Regular', interData)

    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const text = graph.createNode('TEXT', page.id, {
      text: '\u4f60\u597d\u4e16\u754c',
      fontFamily: 'Inter',
      fontSize: 32,
      textPicture: new Uint8Array([1, 2, 3]),
      figmaDerivedTextGlyphs: [{ commandsBlob: new Uint8Array([9, 8, 7]), x: 0, y: 0, fontSize: 1 }]
    })

    const originalEnsureFallbackPack = fontManager.ensureFallbackPack.bind(fontManager)
    const originalCJKFallbacks = [...fontManager.getCJKFallbackFamilies()]
    let requestedScripts: FontFallbackScript[] = []
    fontManager.ensureFallbackPack = async (scripts = ['cjk', 'arabic']) => {
      requestedScripts = [...scripts]
      fontManager.setCJKFallbackFamily('Regression CJK Fallback')
      return { cjk: ['Regression CJK Fallback'], arabic: [] }
    }

    try {
      const changed = await ensureGraphFonts(graph, [text.id])

      expect(changed).toBe(true)
      expect(requestedScripts).toEqual(['cjk-sc'])
      expect(expectDefined(graph.getNode(text.id), 'text node').textPicture).toBeNull()
      expect(expectDefined(graph.getNode(text.id), 'text node').figmaDerivedTextGlyphs).toBeNull()
    } finally {
      fontManager.ensureFallbackPack = originalEnsureFallbackPack
      const current = fontManager.getCJKFallbackFamilies()
      current.splice(0, current.length, ...originalCJKFallbacks)
    }
  })

  test('ensureGraphFonts clears stale text caches when fallback fonts are already available', async () => {
    const interData = await Bun.file(repoPath('public/Inter-Regular.ttf')).arrayBuffer()
    fontManager.markLoaded('Inter', 'Regular', interData)

    const originalCJKFallbacks = [...fontManager.getCJKFallbackFamilies()]
    fontManager.setCJKFallbackFamily('Regression CJK Fallback')

    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const text = graph.createNode('TEXT', page.id, {
      text: '\u4e07',
      fontFamily: 'Inter',
      fontSize: 24,
      textPicture: new Uint8Array([1, 2, 3]),
      figmaDerivedTextGlyphs: [{ commandsBlob: new Uint8Array([3, 2, 1]), x: 0, y: 0, fontSize: 1 }]
    })

    const originalEnsureFallbackPack = fontManager.ensureFallbackPack.bind(fontManager)
    let requestedScripts: FontFallbackScript[] = []
    fontManager.ensureFallbackPack = async (scripts = ['cjk', 'arabic']) => {
      requestedScripts = [...scripts]
      return { 'cjk-sc': ['Regression CJK Fallback'] }
    }

    try {
      const changed = await ensureGraphFonts(graph, [text.id])

      expect(changed).toBe(true)
      expect(requestedScripts).toEqual(['cjk-sc'])
      expect(expectDefined(graph.getNode(text.id), 'text node').textPicture).toBeNull()
      expect(expectDefined(graph.getNode(text.id), 'text node').figmaDerivedTextGlyphs).toBeNull()
    } finally {
      fontManager.ensureFallbackPack = originalEnsureFallbackPack
      const current = fontManager.getCJKFallbackFamilies()
      current.splice(0, current.length, ...originalCJKFallbacks)
    }
  })
})
