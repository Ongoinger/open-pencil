<script setup lang="ts">
import { computed } from 'vue'
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

import Tip from '@/components/ui/Tip.vue'
import { useTabsStore, createTab } from '@/app/tabs'
import { useI18n } from '@open-pencil/vue'

const { dialogs } = useI18n()

const { tabs, activeTabId, switchTab, closeTab } = useTabsStore()

const modelValue = computed({
  get: () => activeTabId.value,
  set: (id: string) => switchTab(id)
})

function onMiddleClick(e: MouseEvent, tabId: string) {
  if (e.button === 1) {
    e.preventDefault()
    closeTab(tabId)
  }
}

function onClose(e: MouseEvent, tabId: string) {
  e.stopPropagation()
  closeTab(tabId)
}
</script>

<template>
  <TabsRoot
    v-if="tabs.length > 1"
    v-model="modelValue"
    activation-mode="automatic"
    class="scrollbar-none flex h-11 shrink-0 items-center overflow-x-auto border-b border-border bg-panel px-3"
  >
    <TabsList class="flex h-full items-center gap-1">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.id"
        :value="tab.id"
        data-test-id="tabbar-tab"
        class="group/tab flex h-8 max-w-48 min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-transparent px-3 text-xs transition-colors outline-none select-none focus-visible:ring-1 focus-visible:ring-accent data-[state=active]:border-accent/25 data-[state=active]:bg-accent/10 data-[state=active]:text-surface data-[state=inactive]:text-muted data-[state=inactive]:hover:border-border data-[state=inactive]:hover:bg-hover data-[state=inactive]:hover:text-surface"
        @mousedown="onMiddleClick($event, tab.id)"
      >
        <icon-lucide-file class="size-3 shrink-0 opacity-50" />
        <span class="min-w-0 flex-1 truncate">{{ tab.name }}</span>
        <Tip :label="dialogs.closeTab({ name: tab.name })">
          <button
            data-test-id="tabbar-close"
            class="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity group-hover/tab:opacity-100 hover:bg-hover data-[state=active]:opacity-100"
            :class="tab.isActive ? 'opacity-100' : ''"
            :aria-label="dialogs.closeTab({ name: tab.name })"
            tabindex="-1"
            @click="onClose($event, tab.id)"
          >
            <icon-lucide-x class="size-3" />
          </button>
        </Tip>
      </TabsTrigger>
    </TabsList>
    <Tip :label="dialogs.newTab">
      <button
        data-test-id="tabbar-new"
        class="ml-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted transition-colors hover:bg-hover hover:text-surface"
        :aria-label="dialogs.newTab"
        @click="createTab()"
      >
        <icon-lucide-plus class="size-3.5" />
      </button>
    </Tip>
  </TabsRoot>
</template>
