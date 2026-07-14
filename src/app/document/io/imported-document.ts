import type { Editor } from '@open-pencil/core/editor'
import { computeAllLayouts } from '@open-pencil/core/layout'
import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'

import { ensureGraphFonts } from '@/app/editor/fonts'

export async function applyImportedDocument(editor: Editor, imported: SceneGraph) {
  const firstPage = imported.getPages()[0] as SceneNode | undefined
  if (firstPage) computeAllLayouts(imported, firstPage.id)
  editor.replaceGraph(imported)
  editor.undo.clear()
  editor.clearSelection()
  const pageId = firstPage?.id ?? editor.graph.rootId
  await editor.switchPage(pageId)
  const page = editor.graph.getNode(pageId)
  if (page) {
    await ensureGraphFonts(editor.graph, page.childIds)
  }
  editor.requestRender()
}
