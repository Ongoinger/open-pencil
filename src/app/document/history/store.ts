import { shallowRef } from 'vue'

import { IS_TAURI } from '@open-pencil/core/constants'

import {
  readCacheBytes,
  readCacheJson,
  readCacheText,
  removeCacheEntry,
  writeCacheBytes,
  writeCacheJson,
  writeCacheText
} from '@/app/cache'

const DRAFT_HISTORY_KEY = 'drafts/index'
const DRAFT_ITEM_PREFIX = 'drafts/items'
const MAX_DRAFT_HISTORY = 12

export type LocalDraftSummary = {
  id: string
  name: string
  updatedAt: number
}

export type LocalDraftRecord = LocalDraftSummary & {
  data: Uint8Array
}

export const localDraftHistory = shallowRef<LocalDraftSummary[]>([])

let historyLoaded = false

function draftItemKey(id: string) {
  return `${DRAFT_ITEM_PREFIX}/${id}`
}

function randomId() {
  const bytes = new Uint32Array(2)
  crypto.getRandomValues(bytes)
  return `draft-${bytes[0]?.toString(36)}${bytes[1]?.toString(36)}`
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function persistHistory(entries: LocalDraftSummary[]) {
  localDraftHistory.value = entries
  await writeCacheJson(DRAFT_HISTORY_KEY, entries)
}

async function writeDraftData(id: string, data: Uint8Array) {
  if (IS_TAURI) {
    const copy = new Uint8Array(data)
    await writeCacheBytes(draftItemKey(id), copy.buffer)
    return
  }
  await writeCacheText(draftItemKey(id), bytesToBase64(data))
}

async function readDraftData(id: string): Promise<Uint8Array | null> {
  if (IS_TAURI) {
    const buffer = await readCacheBytes(draftItemKey(id))
    return buffer ? new Uint8Array(buffer) : null
  }
  const base64 = await readCacheText(draftItemKey(id))
  return base64 ? base64ToBytes(base64) : null
}

export async function ensureLocalDraftHistoryLoaded(): Promise<LocalDraftSummary[]> {
  if (historyLoaded) return localDraftHistory.value
  const saved = (await readCacheJson<LocalDraftSummary[]>(DRAFT_HISTORY_KEY)) ?? []
  localDraftHistory.value = saved.sort((a, b) => b.updatedAt - a.updatedAt)
  historyLoaded = true
  return localDraftHistory.value
}

export async function saveLocalDraft(input: {
  id?: string | null
  name: string
  data: Uint8Array
}): Promise<LocalDraftSummary> {
  const id = input.id ?? randomId()
  const entry: LocalDraftSummary = {
    id,
    name: input.name || 'Untitled',
    updatedAt: Date.now()
  }

  await writeDraftData(id, input.data)
  await ensureLocalDraftHistoryLoaded()

  const next = [entry, ...localDraftHistory.value.filter((item) => item.id !== id)].slice(
    0,
    MAX_DRAFT_HISTORY
  )

  const removed = localDraftHistory.value
    .filter((item) => !next.some((nextItem) => nextItem.id === item.id))
    .map((item) => item.id)

  await persistHistory(next)
  await Promise.all(removed.map((removedId) => removeCacheEntry(draftItemKey(removedId))))

  return entry
}

export async function readLocalDraft(id: string): Promise<LocalDraftRecord | null> {
  await ensureLocalDraftHistoryLoaded()
  const summary = localDraftHistory.value.find((item) => item.id === id)
  if (!summary) return null
  const data = await readDraftData(id)
  if (!data) return null
  return { ...summary, data }
}

export async function deleteLocalDraft(id: string): Promise<void> {
  await ensureLocalDraftHistoryLoaded()
  await removeCacheEntry(draftItemKey(id))
  await persistHistory(localDraftHistory.value.filter((item) => item.id !== id))
}

export async function readLatestLocalDraft(): Promise<LocalDraftRecord | null> {
  const history = await ensureLocalDraftHistoryLoaded()
  if (history.length === 0) return null
  return readLocalDraft(history[0].id)
}
