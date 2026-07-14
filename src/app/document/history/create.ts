import { watchDebounced } from '@vueuse/core'

import type { Editor, EditorState } from '@open-pencil/core/editor'
import { readFigFile } from '@open-pencil/core/io/formats/fig'

import { yieldToUI } from '@/app/document/io/browser'
import { applyImportedDocument } from '@/app/document/io/imported-document'
import {
  deleteLocalDraft,
  ensureLocalDraftHistoryLoaded,
  readLatestLocalDraft,
  readLocalDraft,
  saveLocalDraft
} from '@/app/document/history/store'

type DraftDocumentState = EditorState & {
  currentDraftId: string | null
  documentName: string
  loading: boolean
}

type LocalDraftActionsOptions = {
  editor: Editor
  state: DraftDocumentState
  buildFigFile: () => Uint8Array | Promise<Uint8Array>
  clearDocumentSource: () => void
  fitCurrentPageToViewport: () => Promise<void>
}

function shouldPersistDraft(state: DraftDocumentState) {
  if (state.loading) return false
  if (state.documentName !== 'Untitled') return true
  return state.sceneVersion > 0
}

export function createLocalDraftActions({
  editor,
  state,
  buildFigFile,
  clearDocumentSource,
  fitCurrentPageToViewport
}: LocalDraftActionsOptions) {
  async function saveCurrentDraft() {
    if (!shouldPersistDraft(state)) return
    const data = await buildFigFile()
    const saved = await saveLocalDraft({
      id: state.currentDraftId,
      name: state.documentName,
      data: new Uint8Array(data)
    })
    state.currentDraftId = saved.id
  }

  async function openLocalDraft(draftId: string) {
    const draft = await readLocalDraft(draftId)
    if (!draft) return false

    state.loading = true
    await yieldToUI()
    try {
      const fileBytes = Uint8Array.from(draft.data)
      const file = new File([fileBytes], `${draft.name}.fig`, {
        type: 'application/octet-stream'
      })
      const imported = await readFigFile(file, { populate: 'first-page' })
      await applyImportedDocument(editor, imported)
      clearDocumentSource()
      state.documentName = draft.name
      state.currentDraftId = draft.id
      await fitCurrentPageToViewport()
      editor.requestRender()
      return true
    } finally {
      state.loading = false
    }
  }

  async function restoreLatestLocalDraft() {
    const latest = await readLatestLocalDraft()
    if (!latest) return false
    return openLocalDraft(latest.id)
  }

  async function removeLocalDraft(draftId: string) {
    await deleteLocalDraft(draftId)
    if (state.currentDraftId === draftId) state.currentDraftId = null
  }

  const stopDraftWatch = watchDebounced(
    () => [state.sceneVersion, state.documentName],
    () => {
      void saveCurrentDraft().catch((error) => console.warn('Local draft save failed:', error))
    },
    { debounce: 800, maxWait: 3000 }
  )

  void ensureLocalDraftHistoryLoaded()

  async function disposeLocalDrafts() {
    try {
      await saveCurrentDraft()
    } finally {
      stopDraftWatch()
    }
  }

  return {
    saveCurrentDraft,
    openLocalDraft,
    restoreLatestLocalDraft,
    deleteLocalDraft: removeLocalDraft,
    disposeLocalDrafts
  }
}
