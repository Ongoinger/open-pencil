import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@open-pencil/core'
import { renderNodesToHTML } from '@open-pencil/core/io'

function makeGraph() {
  const graph = new SceneGraph()
  graph.createNode('CANVAS', graph.rootId, { name: 'Page 1' })
  return graph
}

function pageId(graph: SceneGraph) {
  return graph.getPages()[0].id
}

describe('renderNodesToHTML', () => {
  test('wraps exported SVG in a standalone HTML document', () => {
    const graph = makeGraph()
    const page = pageId(graph)
    const node = graph.createNode('RECTANGLE', page, {
      name: 'Box',
      width: 100,
      height: 50,
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
    })

    const html = renderNodesToHTML(graph, page, [node.id], { title: 'Box' })
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<title>Box</title>')
    expect(html).toContain('<svg')
    expect(html).toContain('width="100"')
    expect(html).toContain('height="50"')
    expect(html).toContain('</html>')
  })

  test('uses page background when enabled', () => {
    const graph = makeGraph()
    const page = pageId(graph)
    const canvas = graph.getNode(page)
    expect(canvas).not.toBeNull()
    if (!canvas) return
    canvas.fills = [
      { type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.96, a: 1 }, opacity: 1, visible: true }
    ]
    const node = graph.createNode('RECTANGLE', page, { width: 40, height: 40 })

    const html = renderNodesToHTML(graph, page, [node.id], { includePageBackground: true })
    expect(html).toContain('background: #F5F5F5')
  })
})
