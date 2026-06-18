<script setup>
// 세션 구성 화면의 종목 1행. 목표(세트/무게/횟수/휴식) 인라인 편집.
// 순서 이동은 ▲▼ 버튼(드래그 대신 — 모바일 한손 + 단순성).
import { ref } from 'vue'
import NumberStepper from '@/components/common/NumberStepper.vue'
import { bodyPartLabels } from '@/data/exercises'
import { formatRest } from '@/utils/rest'
import { fromNow } from '@/utils/date'

const props = defineProps({
  item: { type: Object, required: true }, // { exKey,name,bodyPart,restSec,planned:{targetSets,weight,reps}, step, prev }
  index: { type: Number, required: true },
  count: { type: Number, required: true }
})
const emit = defineEmits(['update', 'remove', 'move'])

const open = ref(false)

function patch(p) {
  emit('update', { ...props.item, ...p })
}
function patchPlanned(p) {
  emit('update', { ...props.item, planned: { ...props.item.planned, ...p } })
}
</script>

<template>
  <div class="rounded-card bg-surface-1 p-3 shadow-card">
    <div class="flex items-start gap-2">
      <!-- 순서 이동 -->
      <div class="flex flex-col">
        <button
          class="flex h-6 w-6 items-center justify-center text-text-muted disabled:opacity-30"
          :disabled="index === 0"
          aria-label="위로"
          @click="emit('move', -1)"
        >
          ▲
        </button>
        <button
          class="flex h-6 w-6 items-center justify-center text-text-muted disabled:opacity-30"
          :disabled="index === count - 1"
          aria-label="아래로"
          @click="emit('move', 1)"
        >
          ▼
        </button>
      </div>

      <!-- 본문 (탭하면 편집 토글) -->
      <button class="min-w-0 flex-1 text-left" @click="open = !open">
        <div class="flex items-center gap-2">
          <span class="truncate font-semibold text-text-primary">{{ item.name }}</span>
          <span class="shrink-0 text-unit text-text-muted">{{ bodyPartLabels[item.bodyPart] || item.bodyPart }}</span>
        </div>
        <div class="num mt-0.5 text-unit text-text-secondary">
          {{ item.planned.targetSets }}세트 · {{ item.planned.weight }}kg×{{ item.planned.reps }} · 휴식 {{ formatRest(item.restSec) }}
        </div>
        <div v-if="item.prev && item.prev.lastWeight != null" class="num mt-0.5 text-caption text-text-muted">
          직전 {{ item.prev.lastWeight }}×{{ item.prev.lastReps }} ({{ fromNow(item.prev.lastDate) }})
        </div>
      </button>

      <button class="flex h-8 w-8 shrink-0 items-center justify-center text-text-muted active:text-danger" aria-label="삭제" @click="emit('remove')">
        ✕
      </button>
    </div>

    <!-- 인라인 편집 -->
    <div v-if="open" class="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-text-secondary">목표 세트</span>
        <NumberStepper :model-value="item.planned.targetSets" :step="1" :min="1" :max="10" @update:model-value="patchPlanned({ targetSets: $event })" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-text-secondary">목표 무게</span>
        <NumberStepper :model-value="item.planned.weight" :step="item.step || 2.5" unit="kg" @update:model-value="patchPlanned({ weight: $event })" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-text-secondary">목표 횟수</span>
        <NumberStepper :model-value="item.planned.reps" :step="1" :min="1" :max="50" unit="회" @update:model-value="patchPlanned({ reps: $event })" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-text-secondary">휴식 시간</span>
        <div class="flex items-center gap-2">
          <button class="h-tap-edge w-tap-edge rounded-field bg-surface-2 text-xl text-text-primary active:scale-95" @click="patch({ restSec: Math.max(0, item.restSec - 15) })">−</button>
          <span class="num w-12 text-center text-text-primary">{{ formatRest(item.restSec) }}</span>
          <button class="h-tap-edge w-tap-edge rounded-field bg-surface-2 text-xl text-text-primary active:scale-95" @click="patch({ restSec: item.restSec + 15 })">+</button>
        </div>
      </div>
    </div>
  </div>
</template>
