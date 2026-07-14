<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n, useSelectionState, useEditorCommands } from '@open-pencil/vue'
import { useAIChat } from '@/app/ai/chat/use'
import { useEditorStore } from '@/app/editor/active-store'

import VariablesDialog from './variables/VariablesDialog.vue'
import BooleanOperationsControl from './properties/BooleanOperationsControl.vue'
import AppearanceSection from './properties/AppearanceSection.vue'
import EffectsSection from './properties/EffectsSection.vue'
import ExportSection from './properties/ExportSection.vue'
import FillSection from './properties/FillSection.vue'
import LayoutSection from './properties/LayoutSection/LayoutSection.vue'
import PageSection from './properties/PageSection.vue'
import PositionSection from './properties/PositionSection.vue'
import PrototypeNavigationSection from './properties/PrototypeNavigationSection.vue'
import StrokeSection from './properties/StrokeSection.vue'
import TypographySection from './properties/TypographySection.vue'
import VariablesSection from './properties/VariablesSection.vue'
import VariantSection from './properties/VariantSection.vue'

const variablesOpen = ref(false)
const { selectedNode: node, selectedCount: multiCount } = useSelectionState()
const showBooleanOperations = computed(() => multiCount.value >= 2)
const { getCommand } = useEditorCommands()
const goToMainComponent = getCommand('selection.goToMainComponent')
const detachInstance = getCommand('selection.detachInstance')
const store = useEditorStore()
const { activeTab } = useAIChat()
const isComponentType = computed(() => {
  const t = node.value?.type
  return t === 'COMPONENT' || t === 'COMPONENT_SET' || t === 'INSTANCE'
})
const { panels } = useI18n()
const emptyTitle = '\u5f53\u524d\u8fd8\u6ca1\u6709\u9009\u4e2d\u5bf9\u8c61'
const emptyCaption =
  '\u53ef\u4ee5\u5148\u65b0\u5efa\u8bbe\u8ba1\u533a\u57df\u3001\u6dfb\u52a0\u6587\u5b57\uff0c\u6216\u4ea4\u7ed9 AI \u751f\u6210\u521d\u7a3f'
const frameTitle = '\u65b0\u5efa\u8bbe\u8ba1\u533a\u57df'
const frameCaption = '\u5148\u642d\u51fa\u9875\u9762\u4e3b\u4f53\u7ed3\u6784'
const textTitle = '\u6dfb\u52a0\u6587\u5b57'
const textCaption = '\u5feb\u901f\u653e\u7f6e\u6807\u9898\u548c\u8bf4\u660e\u5185\u5bb9'
const aiTitle = 'AI \u751f\u6210'
const aiCaption = '\u8f93\u5165\u9700\u6c42\u540e\u751f\u6210\u539f\u578b\u521d\u7a3f'

function openAI() {
  activeTab.value = 'ai'
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
    v-if="multiCount > 1"
    data-test-id="design-panel-multi"
    class="scrollbar-thin flex-1 overflow-x-hidden overflow-y-auto pb-4"
  >
    <div
      data-test-id="design-multi-header"
      class="flex items-center gap-1.5 border-b border-border px-3 py-2"
    >
      <span class="text-[11px] text-muted">{{ panels.mixed }}</span>
      <span class="text-xs font-semibold">{{
        panels.layersCount({ count: String(multiCount) })
      }}</span>
      <div class="ml-auto flex items-center">
        <BooleanOperationsControl v-if="showBooleanOperations" />
      </div>
    </div>
    <PositionSection />
    <AppearanceSection />
    <FillSection />
    <StrokeSection />
    <EffectsSection />
    <ExportSection />
  </div>

  <div
    v-else-if="node"
    data-test-id="design-panel-single"
    class="scrollbar-thin flex-1 overflow-x-hidden overflow-y-auto pb-4"
  >
    <div
      data-test-id="design-node-header"
      class="flex items-center gap-1.5 border-b border-border px-3 py-2"
    >
      <span class="text-[11px]" :class="isComponentType ? 'text-component' : 'text-muted'">{{
        node.type
      }}</span>
      <span class="text-xs font-semibold">{{ node.name }}</span>
    </div>

    <div
      v-if="node.type === 'INSTANCE'"
      class="flex flex-col gap-1 border-b border-border px-3 py-2"
    >
      <button
        data-test-id="design-go-to-component"
        class="rounded bg-component/10 px-2 py-1 text-left text-[11px] text-component hover:bg-component/20"
        @click="goToMainComponent.run()"
      >
        {{ panels.goToMainComponent }}
      </button>
      <button
        data-test-id="design-detach-instance"
        class="rounded px-2 py-1 text-left text-[11px] text-muted hover:bg-hover"
        @click="detachInstance.run()"
      >
        {{ panels.detachInstance }}
      </button>
    </div>

    <VariantSection v-if="node.type === 'INSTANCE'" />
    <PositionSection />
    <LayoutSection />
    <AppearanceSection />
    <TypographySection v-if="node.type === 'TEXT'" />
    <FillSection />
    <StrokeSection />
    <EffectsSection />
    <PrototypeNavigationSection />
    <ExportSection />
  </div>

  <div
    v-else
    data-test-id="design-panel-empty"
    class="scrollbar-thin flex-1 overflow-x-hidden overflow-y-auto pb-4"
  >
    <section class="border-b border-border px-3 py-3">
      <div class="rounded-xl border border-border bg-input/35 p-3">
        <div class="mb-2 flex items-center gap-2">
          <div class="rounded-xl bg-accent/10 p-2 text-accent">
            <icon-lucide-compass class="size-4" />
          </div>
          <div>
            <div class="text-xs font-semibold text-surface">{{ emptyTitle }}</div>
            <div class="text-[11px] text-muted">{{ emptyCaption }}</div>
          </div>
        </div>

        <div class="grid gap-2 sm:grid-cols-3">
          <button
            data-test-id="design-empty-frame"
            class="cursor-pointer rounded-xl border border-border bg-input/60 px-3 py-2 text-left transition-colors hover:border-accent/25 hover:bg-hover"
            @click="pickFrameTool"
          >
            <div class="text-xs font-medium text-surface">{{ frameTitle }}</div>
            <div class="mt-1 text-[11px] text-muted">{{ frameCaption }}</div>
          </button>
          <button
            data-test-id="design-empty-text"
            class="cursor-pointer rounded-xl border border-border bg-input/60 px-3 py-2 text-left transition-colors hover:border-accent/25 hover:bg-hover"
            @click="pickTextTool"
          >
            <div class="text-xs font-medium text-surface">{{ textTitle }}</div>
            <div class="mt-1 text-[11px] text-muted">{{ textCaption }}</div>
          </button>
          <button
            data-test-id="design-empty-ai"
            class="cursor-pointer rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-left transition-colors hover:border-accent/35 hover:bg-accent/12"
            @click="openAI"
          >
            <div class="text-xs font-medium text-surface">{{ aiTitle }}</div>
            <div class="mt-1 text-[11px] text-muted">{{ aiCaption }}</div>
          </button>
        </div>
      </div>
    </section>

    <PageSection />
    <VariablesSection @open-dialog="variablesOpen = true" />
    <ExportSection />
  </div>

  <VariablesDialog v-model:open="variablesOpen" />
</template>
