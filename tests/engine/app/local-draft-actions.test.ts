import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { shallowReactive } from 'vue'

import { createLocalDraftActions } from '@/app/document/history/create'
import { localDraftHistory, readLocalDraft } from '@/app/document/history/store'
import { installWindowStorage, uninstallWindowStorage } from '#tests/helpers/window-storage'

class MemoryStorage {
  private map = new Map<string, string>()

  get length() {
    return this.map.size
  }

  clear() {
    this.map.clear()
  }

  getItem(key: string) {
    return this.map.get(key) ?? null
  }

  key(index: number) {
    return [...this.map.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.map.delete(key)
  }

  setItem(key: string, value: string) {
    this.map.set(key, value)
  }
}

describe('local draft actions', () => {
  const storage = new MemoryStorage()

  beforeEach(() => {
    installWindowStorage(storage)
    localDraftHistory.value = []
  })

  afterEach(() => {
    storage.clear()
    localDraftHistory.value = []
    uninstallWindowStorage()
  })

  test('persists the latest draft when disposed before debounce fires', async () => {
    const state = shallowReactive({
      currentDraftId: null,
      documentName: 'Untitled',
      loading: false,
      sceneVersion: 0
    })

    const actions = createLocalDraftActions({
      editor: {} as never,
      state,
      buildFigFile: () => new Uint8Array([7, 8, 9]),
      clearDocumentSource: () => undefined,
      fitCurrentPageToViewport: async () => undefined
    })

    state.sceneVersion = 1
    await actions.disposeLocalDrafts()

    const saved = localDraftHistory.value[0]
    expect(saved).toBeDefined()

    const draft = saved ? await readLocalDraft(saved.id) : null
    expect(draft?.data).toEqual(new Uint8Array([7, 8, 9]))
  })
})
