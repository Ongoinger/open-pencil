import { shallowReactive, watch } from 'vue'

import { createEditor } from '@open-pencil/core/editor'
import { BUILTIN_IO_FORMATS, IORegistry } from '@open-pencil/core/io'
import { SceneGraph } from '@open-pencil/scene-graph'

import {
  getActiveEditorStore,
  setActiveEditorStore,
  useEditorStore
} from '@/app/editor/active-store'
import { ensureGraphFonts, loadFont } from '@/app/editor/fonts'
import {
  createEditorComputedRefs,
  createEditorStoreModules,
  defineEditorStoreAccessors
} from '@/app/editor/session/modules'
import { createInitialAppEditorState, type AppEditorState } from '@/app/editor/session/types'

export { EDITOR_TOOLS as TOOLS, TOOL_SHORTCUTS } from '@open-pencil/core/editor'
export type { EditorToolDef as ToolDef, Tool } from '@open-pencil/core/editor'

export function createEditorStore(initialGraph?: SceneGraph) {
  const graph = initialGraph ?? new SceneGraph()

  const state = shallowReactive<AppEditorState>(createInitialAppEditorState(graph.getPages()[0].id))

  const viewportSize = { width: 0, height: 0 }
  const editor = createEditor({
    graph,
    state,
    loadFont,
    skipInitialGraphSetup: !!initialGraph,
    getViewportSize: () =>
      viewportSize.width > 0 && viewportSize.height > 0
        ? viewportSize
        : { width: window.innerWidth, height: window.innerHeight }
  })
  const io = new IORegistry(BUILTIN_IO_FORMATS)

  if (initialGraph) {
    editor.subscribeToGraph()
  }

  const { selectedNodes, selectedNode, layerTree } = createEditorComputedRefs(editor, state)

  const modules = createEditorStoreModules(editor, graph, state, io, viewportSize)
  let fontSyncRun = 0
  const stopCurrentPageFontWatch = watch(
    () => [state.currentPageId, state.sceneVersion],
    () => {
      const page = editor.graph.getNode(state.currentPageId)
      if (!page) return

      const runId = ++fontSyncRun
      void ensureGraphFonts(editor.graph, page.childIds)
        .then((changed) => {
          if (!changed || runId !== fontSyncRun) return undefined
          editor.requestRender()
          return undefined
        })
        .catch((error) => console.warn('[Font Sync]', error))
    },
    { immediate: true }
  )

  // ─── Public API ───────────────────────────────────────────────
  // Spread all core Editor methods, then override getters and add app-specific.

  const store = {
    ...editor,
    state,
    selectedNodes,
    selectedNode,
    layerTree,

    // App-specific overrides and additions
    ...modules,
    async dispose() {
      stopCurrentPageFontWatch()
      modules.dispose()
    }
  }

  defineEditorStoreAccessors(store, editor)

  return store
}

export type EditorStore = ReturnType<typeof createEditorStore>

export { getActiveEditorStore, setActiveEditorStore, useEditorStore }
