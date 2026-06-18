<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: null },
  unit: { type: String, default: '' },
  delta: { type: Number, default: null }, // 변화량
  // 'up'=증가가 좋음(근육) / 'down'=감소가 좋음(체지방) / null=중립
  goodDir: { type: String, default: null }
})

const deltaColor = computed(() => {
  if (props.delta == null || props.delta === 0 || !props.goodDir) return 'text-text-muted'
  const improving = props.goodDir === 'up' ? props.delta > 0 : props.delta < 0
  return improving ? 'text-pr' : 'text-danger'
})
const deltaText = computed(() => {
  if (props.delta == null || props.delta === 0) return ''
  const sign = props.delta > 0 ? '+' : ''
  return `${sign}${props.delta}`
})
</script>

<template>
  <div class="rounded-card bg-surface-1 p-3">
    <div class="text-unit text-text-muted">{{ label }}</div>
    <div class="mt-0.5 flex items-baseline gap-1">
      <span v-if="value != null && value !== ''" class="num text-h2 text-text-primary">{{ value }}</span>
      <span v-else class="text-text-muted">—</span>
      <span v-if="unit && value != null && value !== ''" class="text-unit text-text-muted">{{ unit }}</span>
    </div>
    <div v-if="deltaText" class="num mt-0.5 text-caption" :class="deltaColor">{{ deltaText }}{{ unit }}</div>
  </div>
</template>
