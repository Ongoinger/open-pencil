<script setup lang="ts">
import { computed } from 'vue'

import {
  getPrototypeNavigationPageId,
  setPrototypeNavigationPageId
} from '@open-pencil/core/editor'
import { useSceneComputed, useSelectionState } from '@open-pencil/vue'
import { useEditorStore } from '@/app/editor/active-store'

import AppSelect from '@/components/ui/AppSelect.vue'
import AppTextButton from '@/components/ui/AppTextButton.vue'
import PanelSection from '@/components/ui/PanelSection.vue'

const editor = useEditorStore()
const { selectedNode } = useSelectionState()

const currentNode = computed(() => selectedNode.value)

const sourcePageId = computed(() => {
  let parentId = currentNode.value?.parentId ?? null
  while (parentId) {
    const parent = editor.graph.getNode(parentId)
    if (!parent) return null
    if (parent.type === 'CANVAS') return parent.id
    parentId = parent.parentId
  }
  return null
})

const pageOptions = useSceneComputed(() => {
  const currentPage = sourcePageId.value
  return editor.graph
    .getPages()
    .filter((page) => page.id !== currentPage)
    .map((page) => ({
      value: page.id,
      label: page.name
    }))
})

const targetPageId = computed(() => {
  const node = currentNode.value
  return node ? (getPrototypeNavigationPageId(node) ?? '__none__') : '__none__'
})

const canConfigure = computed(() => {
  const node = currentNode.value
  return !!node && node.type !== 'CANVAS'
})

const hasTarget = computed(() => {
  const node = currentNode.value
  return !!node && !!getPrototypeNavigationPageId(node)
})

function updateTarget(pageId: string) {
  const node = currentNode.value
  if (!node) return
  const nextPageId = pageId === '__none__' ? null : pageId
  editor.updateNodeWithUndo(
    node.id,
    setPrototypeNavigationPageId(node, nextPageId),
    nextPageId ? 'Set prototype navigation target' : 'Clear prototype navigation target'
  )
}

async function testNavigation() {
  const node = currentNode.value
  if (!node) return
  const pageId = getPrototypeNavigationPageId(node)
  if (!pageId) return
  await editor.switchPage(pageId)
}
</script>

<template>
  <PanelSection v-if="canConfigure" label="页面跳转" data-test-id="prototype-navigation-section">
    <div class="flex flex-col gap-2">
      <AppSelect
        :model-value="targetPageId"
        :options="[{ value: '__none__', label: '不设置跳转' }, ...pageOptions]"
        placeholder="选择目标页面"
        :ui="{ trigger: 'min-w-0 w-full rounded px-2 py-1.5 text-xs' }"
        @update:model-value="updateTarget(String($event))"
      />

      <div class="flex items-center justify-between gap-3 text-[11px] text-muted">
        <span>按住 Alt 单击该对象，可测试跳转到目标页面。</span>
        <div class="flex items-center gap-1">
          <AppTextButton
            v-if="hasTarget"
            :ui="{ base: 'rounded px-2 py-1 text-[11px] hover:bg-hover' }"
            @click="testNavigation"
          >
            立即跳转
          </AppTextButton>
          <AppTextButton
            :ui="{ base: 'rounded px-2 py-1 text-[11px] hover:bg-hover' }"
            @click="editor.state.prototypePreview = true"
          >
            进入预览
          </AppTextButton>
        </div>
      </div>
    </div>
  </PanelSection>
</template>
