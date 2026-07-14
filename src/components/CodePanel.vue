<script setup lang="ts">
import Prism from 'prismjs'
import 'prismjs/components/prism-jsx'
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from 'reka-ui'
import { useClipboard } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import { JSX_REFERENCE, selectionToJSX } from '@open-pencil/core/design-jsx'
import { useI18n, useSceneComputed } from '@open-pencil/vue'

import { useEditorStore } from '@/app/editor/active-store'
import AppTextButton from '@/components/ui/AppTextButton.vue'
import Tip from '@/components/ui/Tip.vue'

import type { JSXFormat } from '@open-pencil/core/design-jsx'

const store = useEditorStore()
const { copy, copied } = useClipboard({ copiedDuring: 2000 })
const { dialogs } = useI18n()
const jsxFormat = ref<JSXFormat>('openpencil')
const showImporter = ref(false)
const importHTML = ref('')
const importCSS = ref('')
const importError = ref('')
const importing = ref(false)
const importTitle = '\u5bfc\u5165 HTML / CSS'
const importCaption =
  '\u7c98\u8d34 HTML\uff0c\u4ee5\u53ca\u53ef\u9009\u7684 CSS \u6216\u7f16\u8bd1\u540e\u7684 Tailwind CSS\u3002'
const importFailed = '\u5bfc\u5165\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5 HTML / CSS \u540e\u91cd\u8bd5\u3002'
const importReplace = '\u5bfc\u5165\u4f1a\u66ff\u6362\u5f53\u524d\u6587\u6863\u5185\u5bb9\u3002'
const emptyTitle = '\u4ee3\u7801\u4f1a\u8ddf\u968f\u5f53\u524d\u9009\u4e2d\u5bf9\u8c61\u663e\u793a'
const emptyCaption =
  '\u9009\u4e2d\u753b\u677f\u3001\u56fe\u5c42\u6216\u7ec4\u4ef6\u540e\uff0c\u8fd9\u91cc\u4f1a\u751f\u6210\u5bf9\u5e94\u4ee3\u7801\u3002'
const emptyHint =
  '\u5982\u679c\u4f60\u60f3\u4ece\u4ee3\u7801\u5f00\u59cb\uff0c\u4e5f\u53ef\u4ee5\u4f7f\u7528\u4e0a\u65b9\u5bfc\u5165\u533a\u628a HTML / CSS \u5bfc\u5165\u5230\u753b\u5e03\u4e2d\u3002'

function toggleFormat() {
  jsxFormat.value = jsxFormat.value === 'openpencil' ? 'tailwind' : 'openpencil'
}

const jsxCode = useSceneComputed(() => {
  void store.state.sceneVersion
  const ids = [...store.state.selectedIds]
  if (ids.length === 0) return ''
  return selectionToJSX(ids, store.graph, jsxFormat.value)
})

const highlightedLines = computed(() => {
  if (!jsxCode.value) return []
  const grammar = Prism.languages.jsx ?? Prism.languages.javascript
  return jsxCode.value.split('\n').map((line) => Prism.highlight(line, grammar, 'jsx'))
})

const { copy: copyRef, copied: copiedRef } = useClipboard({ copiedDuring: 2000 })

const canImport = computed(() => importHTML.value.trim().length > 0)

watch([importHTML, importCSS], () => {
  importError.value = ''
})

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return importFailed
}

function toggleImporter() {
  showImporter.value = !showImporter.value
}

async function pasteImportHTML() {
  try {
    importError.value = ''
    importHTML.value = await navigator.clipboard.readText()
  } catch (e) {
    importError.value = errorMessage(e)
  }
}

async function importCode() {
  if (!canImport.value || importing.value) return
  try {
    importing.value = true
    importError.value = ''
    await store.importDOMText(importHTML.value, {
      cssText: importCSS.value.trim() || undefined
    })
  } catch (e) {
    importError.value = errorMessage(e)
  } finally {
    importing.value = false
  }
}

function copyCode() {
  copy(jsxCode.value)
}

function copyReference() {
  copyRef(JSX_REFERENCE)
}
</script>

<template>
  <div data-test-id="code-panel-root" class="flex min-h-0 flex-1 flex-col">
    <div
      v-if="jsxCode"
      data-test-id="code-panel-header"
      class="flex shrink-0 items-center justify-between border-b border-border px-3 py-1.5"
    >
      <div class="flex items-center gap-1.5">
        <span class="text-[11px] text-muted">JSX</span>
        <AppTextButton
          data-test-id="code-panel-format-toggle"
          :ui="{ base: 'rounded px-1.5 py-0.5 text-[11px] hover:bg-hover' }"
          @click="toggleFormat"
        >
          {{ jsxFormat === 'openpencil' ? 'OpenPencil' : 'Tailwind' }}
        </AppTextButton>
      </div>
      <div class="flex items-center gap-1">
        <AppTextButton
          data-test-id="code-panel-import-toggle"
          :ui="{ base: 'flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-hover' }"
          @click="toggleImporter"
        >
          <icon-lucide-file-input class="size-3" />
          &#23548;&#20837;
        </AppTextButton>
        <Tip :label="dialogs.copyJSXReference">
          <AppTextButton
            data-test-id="code-panel-copy-ref"
            :ui="{
              base: 'flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-hover'
            }"
            @click="copyReference"
          >
            <icon-lucide-check v-if="copiedRef" class="size-3 text-[var(--color-success)]" />
            <icon-lucide-book-open v-else class="size-3" />
          </AppTextButton>
        </Tip>
        <AppTextButton
          data-test-id="code-panel-copy"
          :ui="{ base: 'flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-hover' }"
          @click="copyCode"
        >
          <icon-lucide-check v-if="copied" class="size-3 text-[var(--color-success)]" />
          <icon-lucide-copy v-else class="size-3" />
          {{ copied ? dialogs.copied : dialogs.copy }}
        </AppTextButton>
      </div>
    </div>

    <div
      v-if="showImporter || !jsxCode"
      data-test-id="code-panel-importer"
      class="shrink-0 border-b border-border p-3"
    >
      <div class="mb-2 flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="text-xs font-medium text-surface">{{ importTitle }}</div>
          <div class="text-[11px] text-muted">{{ importCaption }}</div>
        </div>
        <AppTextButton
          data-test-id="code-panel-paste-import"
          :ui="{ base: 'rounded px-1.5 py-0.5 text-[11px] hover:bg-hover' }"
          @click="pasteImportHTML"
        >
          &#31896;&#36148;
        </AppTextButton>
      </div>
      <textarea
        v-model="importHTML"
        data-test-id="code-panel-import-html"
        class="mb-2 h-28 w-full resize-none rounded border border-border bg-panel px-2 py-1.5 font-mono text-xs text-surface outline-none placeholder:text-muted/50 focus:border-accent"
        placeholder='<div class="card">Hello</div>'
        spellcheck="false"
      />
      <textarea
        v-model="importCSS"
        data-test-id="code-panel-import-css"
        class="mb-2 h-20 w-full resize-none rounded border border-border bg-panel px-2 py-1.5 font-mono text-xs text-surface outline-none placeholder:text-muted/50 focus:border-accent"
        placeholder=".card { width: 240px; padding: 16px; border-radius: 12px; background: white; }"
        spellcheck="false"
      />
      <div
        v-if="importError"
        data-test-id="code-panel-import-error"
        class="mb-2 rounded border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-[11px] text-red-200"
      >
        {{ importError }}
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] text-muted">{{ importReplace }}</span>
        <AppTextButton
          data-test-id="code-panel-import"
          :ui="{
            base: [
              'rounded px-2 py-1 text-[11px]',
              canImport && !importing
                ? 'bg-accent text-black hover:bg-accent/90'
                : 'cursor-not-allowed opacity-50'
            ].join(' ')
          }"
          @click="importCode"
        >
          {{ importing ? '\u5bfc\u5165\u4e2d...' : '\u5bfc\u5165\u5230\u753b\u5e03' }}
        </AppTextButton>
      </div>
    </div>

    <div
      v-if="!jsxCode"
      data-test-id="code-panel-empty"
      class="flex flex-1 items-center justify-center px-4"
    >
      <div class="w-full max-w-sm rounded-xl border border-border bg-input/35 p-4 text-left">
        <div class="mb-2 flex items-center gap-2">
          <div class="rounded-xl bg-accent/10 p-2 text-accent">
            <icon-lucide-code class="size-4" />
          </div>
          <div>
            <div class="text-xs font-semibold text-surface">{{ emptyTitle }}</div>
            <div class="text-[11px] text-muted">{{ emptyCaption }}</div>
          </div>
        </div>

        <div class="space-y-2 text-[11px] leading-5 text-muted">
          <p>{{ dialogs.selectLayerForJSX }}</p>
          <p>{{ emptyHint }}</p>
        </div>
      </div>
    </div>

    <ScrollAreaRoot v-else data-test-id="code-panel" class="min-h-0 flex-1">
      <ScrollAreaViewport class="code-highlight size-full">
        <div class="p-3">
          <div v-for="(html, i) in highlightedLines" :key="i" class="flex text-xs leading-5">
            <span
              class="mr-3 shrink-0 text-right text-muted/40 select-none"
              style="min-width: 1.5em"
              >{{ i + 1 }}</span
            >
            <pre
              class="m-0 min-w-0 flex-1 break-words whitespace-pre-wrap"
            ><code v-html="html" /></pre>
          </div>
        </div>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical" class="flex w-1.5 touch-none p-px select-none">
        <ScrollAreaThumb class="relative flex-1 rounded-full bg-muted/30" />
      </ScrollAreaScrollbar>
    </ScrollAreaRoot>
  </div>
</template>
