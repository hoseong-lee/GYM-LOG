<script setup>
import { computed } from 'vue'
import { bodyFront, bodyBack, VIEWBOX } from '@/data/bodyMap'

const props = defineProps({
  // 'front' | 'back'
  side: { type: String, default: 'front' },
  // 강조(주동근) muscle id 배열
  primary: { type: Array, default: () => [] },
  // 보조근 muscle id 배열
  secondary: { type: Array, default: () => [] }
})

const groups = computed(() => (props.side === 'back' ? bodyBack : bodyFront))
const viewBox = computed(() => VIEWBOX[props.side] || VIEWBOX.front)

const primarySet = computed(() => new Set(props.primary))
const secondarySet = computed(() => new Set(props.secondary))

function fillClass(muscle) {
  if (primarySet.value.has(muscle)) return 'mm-primary'
  if (secondarySet.value.has(muscle)) return 'mm-secondary'
  return 'mm-silhouette'
}
</script>

<template>
  <svg
    class="muscle-map"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <template v-for="group in groups" :key="group.muscle">
      <polygon
        v-for="(points, i) in group.polygons"
        :key="`${group.muscle}-${i}`"
        :points="points"
        :class="fillClass(group.muscle)"
      />
    </template>
  </svg>
</template>

<style scoped>
.muscle-map {
  /* 테마 액센트(주황)와 표면 토큰을 따른다 (라이트/다크 자동 전환) */
  --mm-primary: rgb(var(--accent));
  --mm-secondary: rgb(var(--accent) / 0.4);
  --mm-silhouette: rgb(var(--surface-3));
  --mm-stroke: rgb(var(--bg));

  display: block;
  width: 100%;
  height: auto;
}

.muscle-map polygon {
  stroke: var(--mm-stroke);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  transition: fill 0.18s ease;
}

.mm-primary {
  fill: var(--mm-primary);
}

.mm-secondary {
  fill: var(--mm-secondary);
}

.mm-silhouette {
  fill: var(--mm-silhouette);
}
</style>
