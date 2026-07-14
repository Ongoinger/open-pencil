import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import {
  deleteLocalDraft,
  ensureLocalDraftHistoryLoaded,
  localDraftHistory,
  readLocalDraft,
  saveLocalDraft
} from '@/app/document/history/store'
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

describe('local draft history', () => {
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

  test('saves and reads back a local draft', async () => {
    await ensureLocalDraftHistoryLoaded()
    const saved = await saveLocalDraft({
      name: '首页原型',
      data: new Uint8Array([1, 2, 3, 4])
    })

    expect(localDraftHistory.value[0]?.id).toBe(saved.id)

    const draft = await readLocalDraft(saved.id)
    expect(draft?.name).toBe('首页原型')
    expect([...((draft?.data ?? new Uint8Array()) as Uint8Array)]).toEqual([1, 2, 3, 4])
  })

  test('deletes a saved draft from history', async () => {
    await ensureLocalDraftHistoryLoaded()
    const saved = await saveLocalDraft({
      name: '设置页',
      data: new Uint8Array([9, 8, 7])
    })

    await deleteLocalDraft(saved.id)

    expect(localDraftHistory.value.find((item) => item.id === saved.id)).toBeUndefined()
    expect(await readLocalDraft(saved.id)).toBeNull()
  })
})
