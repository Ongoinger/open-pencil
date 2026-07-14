import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@open-pencil/scene-graph'
import {
  getPrototypeNavigationPageId,
  setPrototypeNavigationPageId
} from '@open-pencil/core/editor'

describe('prototype navigation plugin data helpers', () => {
  test('stores and reads target page id from plugin data', () => {
    const graph = new SceneGraph()
    const pageIds = graph.getPages().map((page) => page.id)
    const sourcePageId = pageIds[0]
    const targetPageId = graph.addPage('Page 2').id
    const node = graph.createNode('RECTANGLE', sourcePageId, { name: 'CTA' })

    expect(node).toBeTruthy()
    if (!node) return

    graph.updateNode(node.id, setPrototypeNavigationPageId(node, targetPageId))

    const updated = graph.getNode(node.id)
    expect(updated).toBeTruthy()
    expect(updated && getPrototypeNavigationPageId(updated)).toBe(targetPageId)
  })

  test('clears target page id without removing unrelated plugin data', () => {
    const graph = new SceneGraph()
    const sourcePageId = graph.getPages()[0]?.id
    expect(sourcePageId).toBeTruthy()
    if (!sourcePageId) return

    const targetPageId = graph.addPage('Page 2').id
    const node = graph.createNode('RECTANGLE', sourcePageId, {
      pluginData: [{ pluginId: 'demo', key: 'keep', value: '1' }]
    })
    expect(node).toBeTruthy()
    if (!node) return

    graph.updateNode(node.id, setPrototypeNavigationPageId(node, targetPageId))
    const linked = graph.getNode(node.id)
    expect(linked).toBeTruthy()
    if (!linked) return

    graph.updateNode(linked.id, setPrototypeNavigationPageId(linked, null))
    const cleared = graph.getNode(linked.id)
    expect(cleared).toBeTruthy()
    expect(cleared && getPrototypeNavigationPageId(cleared)).toBeNull()
    expect(cleared?.pluginData).toEqual([{ pluginId: 'demo', key: 'keep', value: '1' }])
  })
})
