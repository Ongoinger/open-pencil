<script setup lang="ts">
import { computed } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

import { useI18n, useSelectionState } from '@open-pencil/vue'
import { useAIChat } from '@/app/ai/chat/use'

import ChatPanel from './ChatPanel.vue'
import CodePanel from './CodePanel.vue'
import DesignPanel from './DesignPanel.vue'
import ZoomDropdown from './editor/ZoomDropdown.vue'

const { activeTab, isConfigured } = useAIChat()
const { selectedNode, selectedCount } = useSelectionState()
const { panels } = useI18n()

const modeCards = [
  { id: 'design' as const, icon: 'icon-lucide-sliders-horizontal', label: '\u8bbe\u8ba1' },
  { id: 'code' as const, icon: 'icon-lucide-code', label: '\u4ee3\u7801' },
  { id: 'ai' as const, icon: 'icon-lucide-sparkles', label: 'AI' }
]

const activePanelSummary = computed(() => {
  if (activeTab.value === 'ai')
    return isConfigured.value
      ? 'AI \u52a9\u624b\u5df2\u5c31\u7eea'
      : '\u672a\u8fde\u63a5\u6a21\u578b'
  if (selectedCount.value > 1) {
    return panels.value.layersCount({ count: String(selectedCount.value) })
  }
  if (selectedNode.value?.name) return selectedNode.value.name
  return activeTab.value === 'code'
    ? '\u67e5\u770b\u5f53\u524d\u9009\u533a\u4ee3\u7801'
    : '\u672a\u9009\u62e9\u5bf9\u8c61'
})

const activePanelCaption = computed(() => {
  if (activeTab.value === 'design')
    return '\u8c03\u6574\u5e03\u5c40\u3001\u6837\u5f0f\u4e0e\u5bfc\u51fa\u8bbe\u7f6e'
  if (activeTab.value === 'code')
    return '\u67e5\u770b\u4ee3\u7801\uff0c\u6216\u4ece HTML / CSS \u5bfc\u5165'
  return '\u901a\u8fc7\u81ea\u7136\u8bed\u8a00\u751f\u6210\u6216\u4fee\u6539\u5f53\u524d\u539f\u578b'
})
</script>

<template>
  <aside
    data-test-id="properties-panel"
    class="flex min-w-0 flex-1 overflow-hidden bg-transparent"
    style="contain: paint layout style"
  >
    <TabsRoot v-model="activeTab" class="flex min-h-0 flex-1 overflow-hidden">
      <div class="flex w-[92px] shrink-0 flex-col border-r border-border/70 bg-[#f1e5d4] p-3">
        <div class="mb-3 text-[11px] font-medium tracking-[0.18em] text-muted uppercase">Panel</div>
        <TabsList class="flex flex-col gap-2">
          <TabsTrigger
            v-for="mode in modeCards"
            :key="mode.id"
            :value="mode.id"
            :data-test-id="`properties-tab-${mode.id}`"
            class="flex cursor-pointer flex-col items-center gap-2 rounded-[18px] px-2 py-3 text-[11px] transition-all text-muted hover:bg-[#f8eedf] hover:text-surface data-[state=active]:bg-[#fffaf2] data-[state=active]:text-surface data-[state=active]:shadow-[0_8px_24px_rgb(184_97_52/0.10)]"
          >
            <component :is="mode.icon" class="size-4" />
            <span>{{ mode.label }}</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div class="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fcf8f1]">
        <div class="border-b border-border/70 px-5 py-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
                Inspector
              </div>
              <div class="mt-1 text-lg font-semibold text-surface">
                {{ activeTab === 'design' ? panels.design : activeTab === 'code' ? panels.code : panels.ai }}
              </div>
              <div class="mt-1 text-sm text-muted">{{ activePanelCaption }}</div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <div class="max-w-[180px] truncate rounded-full bg-[#efe4d5] px-3 py-1 text-[11px] text-muted">
                {{ activePanelSummary }}
              </div>
              <ZoomDropdown v-if="activeTab === 'design'" />
            </div>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-hidden px-3 pb-3">
          <div class="flex h-full min-h-0 flex-col overflow-hidden bg-[#fffaf2]">
            <TabsContent
              value="design"
              class="flex min-h-0 flex-1 flex-col"
              :force-mount="true"
              :hidden="activeTab !== 'design'"
            >
              <DesignPanel />
            </TabsContent>

            <TabsContent
              value="code"
              class="flex min-h-0 flex-1 flex-col"
              :force-mount="true"
              :hidden="activeTab !== 'code'"
            >
              <CodePanel />
            </TabsContent>

            <TabsContent
              value="ai"
              class="flex min-h-0 flex-1 flex-col"
              :force-mount="true"
              :hidden="activeTab !== 'ai'"
            >
              <ChatPanel />
            </TabsContent>
          </div>
        </div>
      </div>
    </TabsRoot>
  </aside>
</template>
