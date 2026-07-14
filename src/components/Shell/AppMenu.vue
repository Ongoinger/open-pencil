<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { templateRef } from '@vueuse/core'

import {
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarItemIndicator,
  MenubarMenu,
  MenubarPortal,
  MenubarRoot,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
} from 'reka-ui'

import IconChevronRight from '~icons/lucide/chevron-right'

import { vTestId, useI18n } from '@open-pencil/vue'
import { ensureLocalDraftHistoryLoaded, localDraftHistory } from '@/app/document/history/store'
import AppShortcutText from '@/components/ui/AppShortcutText.vue'
import { useMenuUI } from '@/components/ui/menu'
import { IS_TAURI } from '@/constants'
import { useAppMenu } from '@/app/shell/menu/app-menu'
import { useDocumentNameRename } from '@/app/shell/menu/document-name'
import { appMenuShortcutLabel } from '@/app/shell/menu/shortcut'
import {
  hasMenuSubItems,
  isMenuCheckbox,
  isMenuSeparator,
  menuChecked,
  menuDisabled,
  menuLabel,
  menuShortcut,
  menuSubItems,
  runMenuAction,
  updateMenuChecked
} from '@/app/shell/menu/entry'
import { useEditorStore } from '@/app/editor/active-store'
import { deleteLocalDraftEntry, openLocalDraftInNewTab } from '@/app/tabs'

const store = useEditorStore()

const { rename, editingName, startRename, commitRename } = useDocumentNameRename(store)
const nameInput = templateRef<HTMLInputElement>('nameInput')

watch(nameInput, (input) => {
  if (input) void rename.focusInput(input)
})

const { menu: t } = useI18n()

const { topMenus } = useAppMenu()
const menuCls = useMenuUI()
const mainMenuCls = useMenuUI({ content: 'min-w-52' })
const subMenuCls = useMenuUI({ content: 'min-w-44' })
const recentDrafts = computed(() => localDraftHistory.value.slice(0, 6))

onMounted(() => {
  void ensureLocalDraftHistoryLoaded()
})

function openDraft(draftId: string) {
  void openLocalDraftInNewTab(draftId)
}

function removeDraft(event: MouseEvent, draftId: string) {
  event.stopPropagation()
  void deleteLocalDraftEntry(draftId)
}
</script>

<template>
  <div class="shrink-0 border-b border-border/80 bg-[#fcf8f1]">
    <div class="px-4 pt-4 pb-3">
      <div class="mb-3 flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-2xl bg-accent/12">
          <img data-test-id="app-logo" src="/favicon-32.png" class="size-5" alt="OpenPencil" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">Studio</div>
          <div class="text-sm font-semibold text-surface">OpenPencil</div>
        </div>
      </div>

      <input
        v-if="editingName"
        ref="nameInput"
        data-test-id="app-document-name-input"
        class="min-w-0 w-full rounded-2xl border border-accent bg-input px-3 py-2 text-sm text-surface outline-none"
        :value="store.state.documentName"
        @blur="commitRename($event)"
        @keydown="rename.onKeydown"
      />
      <div v-else class="flex items-center gap-2">
        <button
          data-test-id="app-document-name"
          class="min-w-0 flex-1 cursor-pointer rounded-2xl border border-[#e2d4c0] bg-[#fffaf2] px-3 py-2 text-left text-sm font-semibold text-surface transition-colors hover:bg-hover"
          @dblclick="startRename"
        >
          <span class="block truncate">{{ store.state.documentName }}</span>
        </button>
        <Tip :label="`${t.toggleUI} (${appMenuShortcutLabel('toggle-ui')})`">
          <button
            data-test-id="app-toggle-ui"
            class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-[#e2d4c0] bg-[#fffaf2] text-muted transition-colors hover:bg-hover hover:text-surface"
            @click="store.state.showUI = !store.state.showUI"
          >
            <icon-lucide-sidebar class="size-4" />
          </button>
        </Tip>
      </div>
    </div>
    <div v-if="!IS_TAURI" class="px-3 pb-3">
      <MenubarRoot class="scrollbar-none flex flex-wrap items-center gap-1 overflow-x-auto">
        <MenubarMenu v-for="menu in topMenus" :key="menu.label">
          <MenubarTrigger
            v-test-id="`menubar-${menu.label.toLowerCase()}`"
            class="flex cursor-pointer items-center rounded-full border border-[#e2d4c0] bg-[#fffaf2] px-3 py-1.5 text-xs text-muted transition-colors select-none hover:bg-hover hover:text-surface data-[state=open]:border-accent/25 data-[state=open]:bg-accent/10 data-[state=open]:text-surface"
          >
            {{ menu.label }}
          </MenubarTrigger>

          <MenubarPortal>
            <MenubarContent :side-offset="4" align="start" :class="mainMenuCls.content">
              <template v-for="(item, i) in menu.items" :key="i">
                <MenubarSeparator v-if="isMenuSeparator(item)" :class="menuCls.separator" />
                <MenubarSub v-else-if="hasMenuSubItems(item)">
                  <MenubarSubTrigger :class="menuCls.item">
                    <span class="flex-1">{{ menuLabel(item) }}</span>
                    <IconChevronRight class="size-3 text-muted" />
                  </MenubarSubTrigger>
                  <MenubarPortal>
                    <MenubarSubContent :side-offset="4" :class="subMenuCls.content">
                      <template v-for="(sub, j) in menuSubItems(item)" :key="j">
                        <MenubarSeparator v-if="isMenuSeparator(sub)" :class="menuCls.separator" />
                        <MenubarCheckboxItem
                          v-else-if="isMenuCheckbox(sub)"
                          :model-value="menuChecked(sub)"
                          :class="menuCls.item"
                          @update:model-value="updateMenuChecked(sub, $event as boolean)"
                        >
                          <span class="flex-1">{{ menuLabel(sub) }}</span>
                          <MenubarItemIndicator class="text-surface">
                            <icon-lucide-check class="size-3.5" />
                          </MenubarItemIndicator>
                        </MenubarCheckboxItem>
                        <MenubarItem
                          v-else
                          :class="menuCls.item"
                          :disabled="menuDisabled(sub)"
                          @select="runMenuAction(sub)"
                        >
                          <span class="flex-1">{{ menuLabel(sub) }}</span>
                          <AppShortcutText v-if="menuShortcut(sub)">{{
                            menuShortcut(sub)
                          }}</AppShortcutText>
                        </MenubarItem>
                      </template>
                    </MenubarSubContent>
                  </MenubarPortal>
                </MenubarSub>
                <MenubarCheckboxItem
                  v-else-if="isMenuCheckbox(item)"
                  :model-value="menuChecked(item)"
                  :class="menuCls.item"
                  @update:model-value="updateMenuChecked(item, $event as boolean)"
                >
                  <span class="flex-1">{{ menuLabel(item) }}</span>
                  <MenubarItemIndicator class="text-surface">
                    <icon-lucide-check class="size-3.5" />
                  </MenubarItemIndicator>
                </MenubarCheckboxItem>
                <MenubarItem
                  v-else
                  :class="menuCls.item"
                  :disabled="menuDisabled(item)"
                  @select="runMenuAction(item)"
                >
                  <span class="flex-1">{{ menuLabel(item) }}</span>
                  <AppShortcutText v-if="menuShortcut(item)">{{
                    menuShortcut(item)
                  }}</AppShortcutText>
                </MenubarItem>
              </template>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </MenubarRoot>
    </div>

    <div v-if="recentDrafts.length > 0" class="border-t border-border/70 px-4 py-3">
      <div class="mb-2 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Recent</div>
      <div class="flex flex-col gap-1">
        <div
          v-for="draft in recentDrafts"
          :key="draft.id"
          class="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-hover"
        >
          <icon-lucide-history class="size-3.5 shrink-0 text-muted" />
          <button class="min-w-0 flex-1 cursor-pointer text-left" @click="openDraft(draft.id)">
            <span class="block truncate text-xs font-medium text-surface">{{ draft.name }}</span>
            <span class="block text-[10px] text-muted">{{
              new Date(draft.updatedAt).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
            }}</span>
          </button>
          <button
            class="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-[#fffaf2] hover:text-surface"
            @click="removeDraft($event, draft.id)"
          >
            <icon-lucide-trash-2 class="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
