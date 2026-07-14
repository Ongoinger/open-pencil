import { describe, expect, test } from 'bun:test'

import { fontManager, textNeededFallbackScripts } from '@open-pencil/core/text'
import { SceneGraph } from '@open-pencil/scene-graph'

import { repoPath } from '#tests/helpers/paths'

async function loadInter() {
  const interData = await Bun.file(repoPath('public/Inter-Regular.ttf')).arrayBuffer()
  fontManager.markLoaded('Inter', 'Regular', interData)
}

function textNode(text: string, family = 'Inter') {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  return graph.createNode('TEXT', page.id, {
    text,
    fontFamily: family,
    fontWeight: 400,
    fontSize: 16
  })
}

describe('text fallback coverage', () => {
  test('requests simplified Chinese fallback when primary coverage is unknown', () => {
    expect(textNeededFallbackScripts(textNode('\u4f60\u597d', `Unknown_${Date.now()}`))).toEqual([
      'cjk-sc'
    ])
  })

  test('selects simplified Chinese fallback script for missing ideographs', async () => {
    await loadInter()

    expect(textNeededFallbackScripts(textNode('\u4f60\u597d'))).toEqual(['cjk-sc'])
  })

  test('selects traditional Chinese fallback script for traditional-only ideographs', async () => {
    await loadInter()

    expect(textNeededFallbackScripts(textNode('\u7e41\u9ad4'))).toEqual(['cjk-tc'])
  })

  test('selects Japanese fallback script for kana', async () => {
    await loadInter()

    expect(textNeededFallbackScripts(textNode('\u3053\u3093\u306b\u3061\u306f'))).toEqual([
      'cjk-jp'
    ])
  })

  test('selects Korean fallback script for Hangul', async () => {
    await loadInter()

    expect(textNeededFallbackScripts(textNode('\uc548\ub155'))).toEqual(['cjk-kr'])
  })
})
