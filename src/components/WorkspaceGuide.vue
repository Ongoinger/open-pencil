<script setup lang="ts">
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

import { useEditorStore } from '@/app/editor/active-store'
import { useAIChat } from '@/app/ai/chat/use'

const store = useEditorStore()
const { activeTab } = useAIChat()
const dismissed = useLocalStorage('openpencil-workspace-guide-dismissed', false)

const isEmptyPage = computed(() => {
  void store.state.sceneVersion
  const page = store.graph.getNode(store.state.currentPageId)
  return Array.isArray(page?.childIds) && page.childIds.length === 0
})

const visible = computed(() => !dismissed.value && isEmptyPage.value && store.state.showUI)

function openAI() {
  activeTab.value = 'ai'
}

function openCode() {
  activeTab.value = 'code'
}

function pickFrameTool() {
  store.setTool('FRAME')
}

function pickTextTool() {
  store.setTool('TEXT')
}
</script>

<template>
  <div
    v-if="visible"
    data-test-id="workspace-guide"
    class="shrink-0 border-b border-border bg-panel"
  >
    <div class="flex flex-wrap items-center gap-2 px-4 py-2.5">
      <button
        data-test-id="workspace-guide-ai"
        class="cursor-pointer rounded-md border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs text-surface transition-colors hover:border-accent/35 hover:bg-accent/14"
        @click="openAI"
      >
        AI
      </button>
      <button
        data-test-id="workspace-guide-frame"
        class="cursor-pointer rounded-md border border-border bg-input/50 px-3 py-1.5 text-xs text-surface transition-colors hover:border-accent/25 hover:bg-hover"
        @click="pickFrameTool"
      >
        画板
      </button>
      <button
        data-test-id="workspace-guide-text"
        class="cursor-pointer rounded-md border border-border bg-input/50 px-3 py-1.5 text-xs text-surface transition-colors hover:border-accent/25 hover:bg-hover"
        @click="pickTextTool"
      >
        文字
      </button>
      <button
        data-test-id="workspace-guide-code"
        class="cursor-pointer rounded-md border border-border bg-input/50 px-3 py-1.5 text-xs text-surface transition-colors hover:border-accent/25 hover:bg-hover"
        @click="openCode"
      >
        导入
      </button>

      <div class="ml-auto flex items-center gap-2 text-[11px] text-muted">
        <button
          data-test-id="workspace-guide-dismiss"
          class="cursor-pointer rounded px-2 py-1 transition-colors hover:bg-hover hover:text-surface"
          @click="dismissed = true"
        >
          收起
        </button>
      </div>
    </div>
  </div>
</template>
