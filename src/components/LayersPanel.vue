<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n } from '@open-pencil/vue'
import { useEditorStore } from '@/app/editor/active-store'
import { createTab } from '@/app/tabs'

import AppMenu from '@/components/Shell/AppMenu.vue'
import Tip from '@/components/ui/Tip.vue'
import AssetsPanel from './AssetsPanel.vue'
import LayerTree from './LayerTree/LayerTree.vue'
import PagesPanel from './PagesPanel.vue'

const { panels } = useI18n()
const store = useEditorStore()
const activePanel = ref<'file' | 'assets'>('file')

const pageSummary = computed(() => {
  void store.state.sceneVersion
  const pages = [...store.graph.nodes.values()].filter((node) => node.type === 'CANVAS')
  return `${pages.length}`
})

const currentPageLayerCount = computed(() => {
  void store.state.sceneVersion
  const page = store.graph.getNode(store.state.currentPageId)
  return `${page?.childIds.length ?? 0}`
})

const railItems = [
  { id: 'file' as const, icon: 'icon-lucide-panel-left', label: '\u7ed3\u6784' },
  { id: 'assets' as const, icon: 'icon-lucide-box', label: '\u8d44\u6e90' }
]

const panelTitle = computed(() =>
  activePanel.value === 'file'
    ? '\u9875\u9762\u4e0e\u56fe\u5c42'
    : '\u7ec4\u4ef6\u4e0e\u8d44\u6e90'
)

const panelHint = computed(() =>
  activePanel.value === 'file'
    ? '\u5f53\u524d\u9875\u9762\u7ed3\u6784\u603b\u89c8'
    : '\u7ec4\u4ef6\u8d44\u6e90\u53ef\u53cc\u51fb\u63d2\u5165\u753b\u5e03'
)
</script>

<template>
  <aside
    data-test-id="layers-panel"
    class="flex min-w-0 flex-1 overflow-hidden bg-transparent"
    style="contain: paint layout style"
  >
    <div class="flex w-[104px] shrink-0 flex-col border-r border-border/70 bg-[#f1e5d4] p-3">
      <div class="flex flex-1 flex-col gap-2">
        <button
          v-for="item in railItems"
          :key="item.id"
          :data-test-id="`left-rail-${item.id}`"
          class="flex cursor-pointer items-center gap-2 rounded-[18px] px-3 py-3 text-[12px] transition-all"
          :class="
            activePanel === item.id
              ? 'bg-[#fffaf2] text-surface shadow-[0_8px_24px_rgb(184_97_52/0.10)]'
              : 'text-muted hover:bg-[#f8eedf] hover:text-surface'
          "
          @click="activePanel = item.id"
        >
          <component :is="item.icon" class="size-4" />
          <span class="whitespace-nowrap">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fcf8f1]">
      <div class="border-b border-border/70 px-4 py-4">
        <div class="mb-4 overflow-hidden rounded-[18px] border border-white/70 bg-[#fffaf2]">
          <AppMenu />
        </div>

        <div class="mb-4 flex items-center gap-2 px-1">
          <button
            data-test-id="project-new"
            class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-accent px-3 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_rgb(184_97_52/0.22)] transition-all hover:brightness-105"
            @click="createTab()"
          >
            <icon-lucide-plus class="size-4" />
            <span>新建项目</span>
          </button>
        </div>

        <div class="flex items-end justify-between gap-3 px-1">
          <div>
            <div class="text-lg font-semibold text-surface">
              {{ panelTitle }}
            </div>
            <div class="mt-1 text-[12px] text-muted">{{ panelHint }}</div>
          </div>
          <div class="text-[11px] text-muted">
            {{ pageSummary }} &#39029; / {{ currentPageLayerCount }} &#23618;
          </div>
        </div>
      </div>

      <template v-if="activePanel === 'assets'">
        <div class="min-h-0 flex-1 px-3 py-3">
          <div class="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-[#fffaf2]">
            <AssetsPanel />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="border-b border-border/60 px-5 py-2.5 text-[11px] text-muted">
          &#21487;&#21452;&#20987;&#39029;&#38754;&#21517;&#31216;&#37325;&#21629;&#21517;
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3">
          <section class="flex min-h-[168px] flex-col overflow-hidden border-b border-border/60 bg-[#fffaf2]">
            <div class="flex items-center justify-between px-4 py-3">
              <div class="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
                {{ panels.pages }}
              </div>
              <Tip :label="panels.addPage">
                <button
                  data-test-id="pages-add-sidebar"
                  class="flex cursor-pointer items-center gap-1 rounded-full border border-[#e2d4c0] bg-[#fffaf2] px-2 py-1 text-[11px] text-muted transition-colors hover:bg-hover hover:text-surface"
                  @click="store.addPage()"
                >
                  <icon-lucide-plus class="size-3" />
                  <span>新建页面</span>
                </button>
              </Tip>
            </div>
            <PagesPanel :show-header="false" />
          </section>

          <section class="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fffaf2]">
            <div class="px-4 py-3 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
              {{ panels.layers }}
            </div>
            <LayerTree data-test-id="layers-tree" />
          </section>
        </div>
      </template>
    </div>
  </aside>
</template>
