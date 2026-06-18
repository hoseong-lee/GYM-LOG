<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 }, // 현재
  target: { type: Number, default: 0 }, // 목표 (0이면 미추적)
  label: { type: String, default: '' },
  unit: { type: String, default: '' },
  color: { type: String, default: 'accent' },
  size: { type: Number, default: 96 }
})

const R = 42
const C = 2 * Math.PI * R
const ratio = computed(() => {
  if (!props.target) return 0
  return Math.min(1, props.value / props.target)
})
const over = computed(() => props.target && props.value > props.target)
const dash = computed(() => `${C * ratio.value} ${C}`)
const stroke = computed(() => `rgb(var(--${over.value ? 'warn' : props.color}))`)
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="relative" :style="{ width: size + 'px', height: size + 'px' }">
      <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
        <circle cx="50" cy="50" :r="R" fill="none" stroke="rgb(var(--surface-3))" stroke-width="9" />
        <circle
          cx="50"
          cy="50"
          :r="R"
          fill="none"
          :stroke="stroke"
          stroke-width="9"
          stroke-linecap="round"
          :stroke-dasharray="dash"
          style="transition: stroke-dasharray 0.4s ease"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="num text-h2 leading-none text-text-primary">{{ Math.round(value) }}</span>
        <span v-if="target" class="num text-caption text-text-muted">/ {{ Math.round(target) }}{{ unit }}</span>
      </div>
    </div>
    <span v-if="label" class="mt-1.5 text-caption text-text-secondary">{{ label }}</span>
  </div>
</template>
