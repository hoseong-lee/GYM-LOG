<script setup>
import { computed } from 'vue'

const props = defineProps({
  // [{ date: 'YYYY-MM-DD', value: Number }] 오름차순
  series: { type: Array, default: () => [] },
  height: { type: Number, default: 72 },
  // 'accent' | 'pr' | 'danger' | 'text-muted' 등 토큰명
  color: { type: String, default: 'accent' }
})

const W = 300
const PAD = 8

const stroke = computed(() => `rgb(var(--${props.color === 'accent' ? 'accent' : props.color}))`)

const pts = computed(() => {
  const s = props.series
  if (!s.length) return []
  const vals = s.map((p) => p.value)
  let min = Math.min(...vals)
  let max = Math.max(...vals)
  if (min === max) {
    min -= 1
    max += 1
  }
  const times = s.map((p) => new Date(p.date + 'T00:00:00').getTime())
  const tMin = times[0]
  const tMax = times[times.length - 1]
  const span = tMax - tMin || 1
  const h = props.height
  return s.map((p, i) => {
    const x = s.length === 1 ? W / 2 : PAD + ((times[i] - tMin) / span) * (W - 2 * PAD)
    const y = PAD + (1 - (p.value - min) / (max - min)) * (h - 2 * PAD)
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, value: p.value }
  })
})

const polyline = computed(() => pts.value.map((p) => `${p.x},${p.y}`).join(' '))
const last = computed(() => pts.value[pts.value.length - 1] || null)
</script>

<template>
  <svg
    v-if="pts.length"
    :viewBox="`0 0 ${W} ${height}`"
    class="block w-full"
    :style="{ height: height + 'px' }"
    preserveAspectRatio="none"
  >
    <polyline
      :points="polyline"
      fill="none"
      :stroke="stroke"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
    <circle v-if="last" :cx="last.x" :cy="last.y" r="3.5" :fill="stroke" />
  </svg>
  <div v-else class="flex items-center justify-center text-caption text-text-muted" :style="{ height: height + 'px' }">
    데이터가 충분하지 않아요
  </div>
</template>
