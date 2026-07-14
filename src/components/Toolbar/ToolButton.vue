<script setup lang="ts">
import type { Component } from 'vue'

interface ToolButtonProps {
  icon: Component
  active?: boolean
  mobile?: boolean
}

const { icon, active = false, mobile = false } = defineProps<ToolButtonProps>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="flex cursor-pointer items-center justify-center border-none transition-all"
    :class="[
      mobile ? 'size-8 rounded-[6px] select-none' : 'size-10 rounded-full',
      active
        ? 'bg-accent text-white shadow-[0_8px_18px_rgb(184_97_52/0.35)]'
        : mobile
          ? 'bg-transparent text-muted active:bg-hover'
          : 'bg-transparent text-muted hover:bg-[#efe4d5] hover:text-surface'
    ]"
    @click="emit('click')"
  >
    <component :is="icon" class="size-4" />
  </button>
</template>
