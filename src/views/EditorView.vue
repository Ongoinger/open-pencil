<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from 'vue'
import { useEventListener, useUrlSearchParams } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'

import { useViewportKind, formatShortcut, useI18n } from '@open-pencil/vue'
import { useKeyboard } from '@/app/shell/keyboard/use'
import { loadEditorLayout, saveEditorLayout } from '@/app/shell/layout-storage'
import { openFileFromPath, useMenu } from '@/app/shell/menu/use'
import { useCollab, COLLAB_KEY } from '@/app/collab/use'
import { connectAutomation } from '@/app/automation/bridge/server'
import { spawnMCPIfNeeded } from '@/app/automation/mcp/spawn'
import { isTauri } from '@/app/tauri/env'
import { appMenuShortcut } from '@/app/shell/menu/shortcut'
import { createDemoShapes } from '@/app/demo/document'
import { useEditorStore } from '@/app/editor/active-store'
import { createTab, activeTab, getActiveStore, saveAllOpenDrafts, tabCount } from '@/app/tabs'

import EditorCanvas from '@/components/EditorCanvas.vue'
import LayersPanel from '@/components/LayersPanel.vue'
import MobileDrawer from '@/components/MobileDrawer.vue'
import MobileHud from '@/components/MobileHud/MobileHud.vue'
import PropertiesPanel from '@/components/PropertiesPanel.vue'
import SafariBanner from '@/components/SafariBanner.vue'
import TabBar from '@/components/TabBar.vue'
import Tip from '@/components/ui/Tip.vue'
import Toolbar from '@/components/Toolbar/Toolbar.vue'

const route = useRoute()
const params = useUrlSearchParams('history')
const showChrome = !('no-chrome' in params)

const createdInitialTab = tabCount() === 0
const firstTab = createdInitialTab ? createTab() : (activeTab.value ?? createTab())
const store = useEditorStore()
const { dialogs, panels } = useI18n()
const { isMobile } = useViewportKind()
const showEditorChrome = computed(
  () => !store.state.prototypePreview && showChrome && store.state.showUI
)

if (createdInitialTab && route.meta.demo && !('test' in params)) {
  createDemoShapes(firstTab.store)
}

useHead({ title: route.meta.demo ? 'Demo' : undefined })
useKeyboard()
useMenu()

const collab = useCollab(getActiveStore)
provide(COLLAB_KEY, collab)

useEventListener(
  document,
  'wheel',
  (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) e.preventDefault()
  },
  { passive: false }
)

useEventListener(document, 'visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    void saveAllOpenDrafts()
  }
})

useEventListener(window, 'pagehide', () => {
  void saveAllOpenDrafts()
})

const automationCleanup = ref<(() => void) | null>(null)
const mcpCleanup = ref<(() => void) | null>(null)
const fileAssociationCleanup = ref<(() => void) | null>(null)
const initialEditorLayout = loadEditorLayout()

type PendingOpenFile = {
  path: string
}

async function openPendingAssociatedFiles() {
  const { invoke } = await import('@tauri-apps/api/core')
  const files = await invoke<PendingOpenFile[]>('take_pending_open')
  for (const file of files) {
    await openFileFromPath(file.path)
  }
}

async function bindAssociatedFileOpen() {
  if (!isTauri()) return
  const { listen } = await import('@tauri-apps/api/event')
  fileAssociationCleanup.value = await listen('open-associated-files', () => {
    void openPendingAssociatedFiles().catch((e) => console.error('[Open With]', e))
  })
  await openPendingAssociatedFiles()
}

onMounted(async () => {
  if (createdInitialTab && !route.meta.demo && !('test' in params)) {
    try {
      await store.restoreLatestLocalDraft()
    } catch (e) {
      console.warn('[Local Draft Restore]', e)
    }
  }

  try {
    const mcp = await spawnMCPIfNeeded()
    mcpCleanup.value = mcp?.disconnect ?? null
    const tauri = isTauri()
    if (import.meta.env.DEV || tauri) {
      automationCleanup.value = connectAutomation(getActiveStore, mcp?.authToken ?? null).disconnect
    }
  } catch (e) {
    console.warn('[MCP]', e)
  }

  try {
    await bindAssociatedFileOpen()
  } catch (e) {
    console.error('[Open With]', e)
  }
})

onUnmounted(() => {
  mcpCleanup.value?.()
  automationCleanup.value?.()
  fileAssociationCleanup.value?.()
})
</script>

<template>
  <div data-test-id="editor-root" class="flex h-screen w-screen flex-col">
    <SafariBanner />
    <TabBar />

    <SplitterGroup
      v-if="!isMobile && showEditorChrome"
      :key="activeTab?.id"
      direction="horizontal"
      class="flex flex-1 gap-3 overflow-hidden px-4 pb-4 pt-3"
      @layout="saveEditorLayout"
    >
      <SplitterPanel
        id="layers"
        :default-size="initialEditorLayout[0]"
        :min-size="11"
        :max-size="28"
        class="flex min-w-0"
      >
        <div class="flex min-w-0 flex-1 overflow-hidden rounded-[24px] border border-white/55 bg-panel/94 shadow-[0_14px_40px_rgb(91_61_32/0.10)] backdrop-blur">
          <LayersPanel />
        </div>
      </SplitterPanel>

      <SplitterResizeHandle
        data-test-id="left-splitter-handle"
        class="group relative z-10 w-2.5 cursor-col-resize"
      >
        <div class="pointer-events-none absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-border/80" />
      </SplitterResizeHandle>

      <SplitterPanel
        id="canvas"
        :default-size="initialEditorLayout[1]"
        :min-size="36"
        class="flex min-w-0"
      >
        <div class="relative flex min-w-0 flex-1 overflow-hidden rounded-[30px] border border-white/60 bg-[#fbf6ee]/96 shadow-[0_18px_55px_rgb(91_61_32/0.12)] backdrop-blur">
          <div class="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-[#dccfbc] bg-[#fffaf1]/92 px-5 backdrop-blur">
            <div class="flex min-w-0 items-center gap-3">
              <div class="rounded-full bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent">
                {{ panels.design }}
              </div>
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-surface">
                  {{ store.state.documentName }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-muted">
              <button
                class="cursor-pointer rounded-full bg-accent/10 px-3 py-1 font-medium text-accent transition-colors hover:bg-accent/20"
                @click="store.state.prototypePreview = true"
              >
                预览
              </button>
              <span class="rounded-full bg-[#efe4d5] px-2.5 py-1">{{ panels.pages }}</span>
              <span class="rounded-full bg-[#efe4d5] px-2.5 py-1">{{ panels.layers }}</span>
              <span class="rounded-full bg-[#efe4d5] px-2.5 py-1">{{ panels.properties }}</span>
            </div>
          </div>

          <div class="relative mt-14 flex min-w-0 flex-1 p-3">
            <div class="relative flex min-w-0 flex-1 overflow-hidden rounded-[20px] bg-white">
              <EditorCanvas />
            </div>
          </div>

          <Toolbar />
        </div>
      </SplitterPanel>

      <SplitterResizeHandle class="group relative z-10 w-2.5 cursor-col-resize">
        <div class="pointer-events-none absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-border/80" />
      </SplitterResizeHandle>

      <SplitterPanel
        id="properties"
        :default-size="initialEditorLayout[2]"
        :min-size="11"
        :max-size="30"
        class="flex min-w-0 flex-col"
      >
        <div class="flex min-w-0 flex-1 overflow-hidden rounded-[24px] border border-white/55 bg-panel/94 shadow-[0_14px_40px_rgb(91_61_32/0.10)] backdrop-blur">
          <PropertiesPanel />
        </div>
      </SplitterPanel>
    </SplitterGroup>

    <div
      v-else-if="isMobile && showEditorChrome"
      :key="'mobile-' + activeTab?.id"
      class="flex flex-1 overflow-hidden"
    >
      <div class="relative flex min-w-0 flex-1">
        <EditorCanvas />
        <MobileHud />
        <Toolbar />
      </div>
      <MobileDrawer />
    </div>

    <div
      v-else-if="showChrome && store.state.prototypePreview"
      :key="'preview-' + activeTab?.id"
      class="flex flex-1 overflow-hidden"
    >
      <div class="relative flex min-w-0 flex-1">
        <EditorCanvas />
        <div
          class="absolute top-6 left-6 z-20 flex items-center gap-3 rounded-full border border-white/70 bg-[#fffaf2]/94 px-4 py-2 text-sm text-surface shadow-[0_12px_30px_rgb(91_61_32/0.12)] backdrop-blur"
        >
          <div class="font-semibold">原型预览</div>
          <div class="max-w-[220px] truncate text-xs text-muted">{{ store.state.documentName }}</div>
          <button
            class="cursor-pointer rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            @click="store.state.prototypePreview = false"
          >
            退出预览
          </button>
        </div>
      </div>
    </div>

    <div
      v-else-if="showChrome"
      :key="'collapsed-' + activeTab?.id"
      class="flex flex-1 overflow-hidden"
    >
      <div class="relative flex min-w-0 flex-1">
        <EditorCanvas />
        <div
          v-if="!isMobile"
          class="absolute top-7 left-7 z-10 flex items-center gap-2 rounded-lg border border-border bg-panel px-2 py-1 shadow-sm"
        >
          <img src="/favicon-32.png" class="size-4" alt="OpenPencil" />
          <span data-test-id="editor-document-name" class="text-xs text-surface">{{
            store.state.documentName
          }}</span>
          <Tip
            :label="
              dialogs.showUI({ shortcut: formatShortcut(appMenuShortcut('toggle-ui')) ?? '' })
            "
          >
            <button
              data-test-id="editor-show-ui"
              class="ml-1 flex size-6 cursor-pointer items-center justify-center rounded text-muted transition-colors hover:bg-hover hover:text-surface"
              @click="store.state.showUI = true"
            >
              <icon-lucide-sidebar class="size-3.5" />
            </button>
          </Tip>
        </div>
      </div>
    </div>

    <div v-else :key="'bare-' + activeTab?.id" class="flex flex-1 overflow-hidden">
      <div class="relative flex min-w-0 flex-1">
        <EditorCanvas />
      </div>
    </div>
  </div>
</template>
