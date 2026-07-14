<script setup lang="ts">
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from 'reka-ui'
import { refAutoReset } from '@vueuse/core'
import { computed, markRaw, nextTick, ref, watch } from 'vue'

import { getAcpDebugText, clearAcpDebugLog, hasAcpDebugEntries } from '@/app/ai/acp/transport'
import { copyChatLog } from '@/app/ai/debug'
import { clearToolLogEntries, didHitStepLimit } from '@/app/ai/tools'
import { activeTab } from '@/app/tabs'
import AcpPermissionDialog from '@/components/chat/AcpPermissionDialog.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import AppTextButton from '@/components/ui/AppTextButton.vue'
import ProviderSetup from '@/components/chat/ProviderSetup.vue'
import { useAIChat } from '@/app/ai/chat/use'
import { toast } from '@/app/shell/ui'
import { useI18n } from '@open-pencil/vue'

import type { Chat } from '@ai-sdk/vue'
import type { UIMessage } from 'ai'
import type { JsonObject } from '@open-pencil/scene-graph/primitives'

const IS_DEV = import.meta.env.DEV

const { isConfigured, ensureChat, resetChat } = useAIChat()
const { dialogs } = useI18n()

const chat = ref<Chat<UIMessage> | null>(null)

void ensureChat()
  .then((c) => {
    if (c) chat.value = markRaw(c)
    return undefined
  })
  .catch((error: unknown) => {
    toast.error(error instanceof Error ? error.message : 'Failed to initialize chat')
  })

const messagesEnd = ref<HTMLDivElement>()
const debugCopied = refAutoReset(false, 1500)
const acpLogCopied = refAutoReset(false, 1500)

const messages = computed(() => chat.value?.messages ?? [])
const status = computed(() => chat.value?.status ?? 'ready')
const isThinking = computed(() => {
  const s = status.value
  if (s !== 'submitted' && s !== 'streaming') return false
  if (messages.value.length === 0) return true
  const last = messages.value[messages.value.length - 1]
  if (last.role !== 'assistant') return true
  const parts = last.parts
  if (parts.length === 0) return true
  const lastPart = parts[parts.length - 1] as JsonObject
  if (lastPart.type === 'step-start') return true
  if ('toolCallId' in lastPart && lastPart.state === 'output-available') return true
  if ('toolCallId' in lastPart && lastPart.state === 'output-error') return true
  return s === 'submitted'
})

const showContinue = computed(() => {
  if (status.value !== 'ready') return false
  if (messages.value.length === 0) return false
  const last = messages.value[messages.value.length - 1]
  return last.role === 'assistant' && didHitStepLimit()
})

const starterPrompts = [
  '\u751f\u6210\u4e00\u4e2a\u79fb\u52a8\u7aef\u5f15\u5bfc\u9875\uff0c\u5305\u542b\u4e09\u5f20\u529f\u80fd\u5361\u7247\u548c\u4e00\u4e2a\u4e3b\u6309\u94ae\u3002',
  '\u8bbe\u8ba1\u4e00\u4e2a\u7b80\u6d01\u7684\u6570\u636e\u770b\u677f\uff0c\u5305\u542b\u4fa7\u8fb9\u5bfc\u822a\u3001\u7edf\u8ba1\u5361\u7247\u548c\u56fe\u8868\u533a\u57df\u3002',
  '\u751f\u6210\u4e00\u4e2a\u843d\u5730\u9875\u9996\u5c4f\uff0c\u5305\u542b\u6807\u9898\u3001\u526f\u6807\u9898\u548c\u4e24\u4e2a\u64cd\u4f5c\u6309\u94ae\u3002',
  '\u751f\u6210\u4e00\u4e2a\u8bbe\u7f6e\u9875\u9762\uff0c\u5305\u542b\u4e2a\u4eba\u4fe1\u606f\u3001\u901a\u77e5\u5f00\u5173\u548c\u4fdd\u5b58\u6309\u94ae\u3002'
]
const emptyTitle = 'AI \u8bbe\u8ba1\u52a9\u624b'
const usageTitle = '\u4f7f\u7528\u65b9\u5f0f'
const usageText =
  '\u8bf7\u5728\u5e95\u90e8\u8f93\u5165\u6846\u4e2d\u63cf\u8ff0\u4f60\u60f3\u521b\u5efa\u6216\u4fee\u6539\u7684\u5185\u5bb9\u3002\u5efa\u8bae\u540c\u65f6\u8bf4\u660e\u8bbe\u5907\u7c7b\u578b\u3001\u9875\u9762\u7c7b\u578b\u3001\u98ce\u683c\u65b9\u5411\u548c\u9700\u8981\u7684\u6a21\u5757\uff0c\u63cf\u8ff0\u8d8a\u5177\u4f53\uff0c\u751f\u6210\u7ed3\u679c\u8d8a\u7a33\u5b9a\u3002'
const usageTags = [
  '\u79fb\u52a8\u7aef / Web / \u5927\u5c4f',
  '\u843d\u5730\u9875 / \u540e\u53f0 / \u5f15\u5bfc\u9875',
  '\u7b80\u6d01 / \u5546\u52a1 / \u79d1\u6280'
]
const promptsTitle = '\u8bd5\u8bd5\u8fd9\u4e9b\u63d0\u793a\u8bcd'
const clearLabel = '\u6e05\u7a7a'

function scrollToBottom() {
  nextTick(() => {
    messagesEnd.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })
}

watch(messages, scrollToBottom, { deep: true })
watch(
  () => chat.value?.error,
  (error) => {
    if (error) toast.error(error.message)
  }
)
watch(
  () => activeTab.value?.id,
  async () => {
    const nextChat = await ensureChat()
    chat.value = nextChat ? markRaw(nextChat) : null
  }
)

async function handleSubmit(text: string) {
  if (status.value === 'streaming' || status.value === 'submitted') return
  try {
    const c = await ensureChat()
    if (c) chat.value = markRaw(c)
  } catch (e) {
    console.error('Failed to initialize chat:', e)
    toast.error(e instanceof Error ? e.message : String(e))
    return
  }
  chat.value?.sendMessage({ text }).catch((e: unknown) => {
    console.error('Chat error:', e)
    toast.error(e instanceof Error ? e.message : String(e))
  })
}

function handleStop() {
  chat.value?.stop()
}

async function handleCopyDebug() {
  await copyChatLog(messages.value)
  debugCopied.value = true
}

async function handleCopyAcpLog() {
  const text = getAcpDebugText()
  if (!text) return
  await navigator.clipboard.writeText(text)
  acpLogCopied.value = true
}

function handleClearChat() {
  chat.value = null
  resetChat()
  clearToolLogEntries()
  clearAcpDebugLog()
}
</script>

<template>
  <div data-test-id="chat-panel" class="flex min-w-0 flex-1 flex-col overflow-hidden select-text">
    <ProviderSetup v-if="!isConfigured" />

    <template v-else>
      <ScrollAreaRoot class="min-h-0 flex-1">
        <ScrollAreaViewport class="h-full px-3 py-3 [&>div]:h-full">
          <div
            v-if="messages.length === 0"
            data-test-id="chat-empty-state"
            class="flex h-full flex-col items-center justify-center"
          >
            <div class="w-full max-w-xl rounded-2xl border border-border bg-input/35 p-5">
              <div class="mb-4 flex items-start gap-3">
                <div class="rounded-2xl bg-accent/10 p-3 text-accent">
                  <icon-lucide-sparkles class="size-5" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-surface">{{ emptyTitle }}</h3>
                  <p class="mt-1 text-xs leading-5 text-muted">
                    {{ dialogs.describeCreateOrChange }}
                  </p>
                </div>
              </div>

              <div class="mb-4 space-y-2">
                <div class="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                  {{ usageTitle }}
                </div>
                <p class="text-xs leading-5 text-muted">
                  {{ usageText }}
                </p>
                <div class="flex flex-wrap gap-2 text-[11px] text-muted">
                  <span
                    v-for="tag in usageTags"
                    :key="tag"
                    class="rounded-full border border-border px-2 py-1"
                    >{{ tag }}</span
                  >
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                  {{ promptsTitle }}
                </div>
                <button
                  v-for="prompt in starterPrompts"
                  :key="prompt"
                  data-test-id="chat-starter-prompt"
                  class="w-full cursor-pointer rounded-2xl border border-border bg-panel/70 px-3 py-2 text-left text-xs leading-5 text-surface transition-colors hover:border-accent/25 hover:bg-hover"
                  @click="handleSubmit(prompt)"
                >
                  {{ prompt }}
                </button>
              </div>
            </div>
          </div>

          <div v-else data-test-id="chat-messages" class="flex flex-col gap-3">
            <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" />

            <div v-if="isThinking" data-test-id="chat-typing-indicator" class="flex gap-2">
              <div
                class="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/20 text-[10px] font-bold text-muted"
              >
                AI
              </div>
              <div class="flex items-center gap-1 py-2">
                <span
                  class="size-1.5 animate-bounce rounded-full bg-muted"
                  style="animation-delay: 0ms"
                />
                <span
                  class="size-1.5 animate-bounce rounded-full bg-muted"
                  style="animation-delay: 150ms"
                />
                <span
                  class="size-1.5 animate-bounce rounded-full bg-muted"
                  style="animation-delay: 300ms"
                />
              </div>
            </div>

            <div v-if="showContinue" class="flex justify-center py-2">
              <button
                class="flex items-center gap-1.5 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                @click="handleSubmit('Continue where you left off')"
              >
                <icon-lucide-play class="size-3" />
                Continue
              </button>
            </div>

            <div ref="messagesEnd" />
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical" class="flex w-1.5 touch-none p-px select-none">
          <ScrollAreaThumb class="relative flex-1 rounded-full bg-muted/30" />
        </ScrollAreaScrollbar>
      </ScrollAreaRoot>

      <div
        v-if="messages.length > 0"
        class="flex shrink-0 items-center gap-1 border-t border-border px-3 py-1"
      >
        <AppTextButton
          v-if="IS_DEV"
          :ui="{ base: 'flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover' }"
          @click="handleCopyDebug"
        >
          <icon-lucide-clipboard-copy v-if="!debugCopied" class="size-3" />
          <icon-lucide-check v-else class="size-3 text-green-400" />
          {{ debugCopied ? 'Copied' : 'Copy log' }}
        </AppTextButton>
        <AppTextButton
          v-if="IS_DEV && hasAcpDebugEntries()"
          :ui="{ base: 'flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover' }"
          @click="handleCopyAcpLog"
        >
          <icon-lucide-bug v-if="!acpLogCopied" class="size-3" />
          <icon-lucide-check v-else class="size-3 text-green-400" />
          {{ acpLogCopied ? 'Copied' : 'ACP log' }}
        </AppTextButton>
        <AppTextButton
          :ui="{ base: 'flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover' }"
          @click="handleClearChat"
        >
          <icon-lucide-trash-2 class="size-3" />
          {{ clearLabel }}
        </AppTextButton>
      </div>

      <ChatInput :status="status" @submit="handleSubmit" @stop="handleStop" />

      <AcpPermissionDialog />
    </template>
  </div>
</template>
