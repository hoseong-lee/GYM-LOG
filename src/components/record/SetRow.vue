<script setup>
// 세트 1행. state 에 따라 표시/조작이 다르다.
//  done    : 완료(흐림, ✅). 탭하면 uncheck(되돌리기)
//  current : 진행 중(스테퍼 활성 + 큰 체크버튼). check(weight,reps) emit
//  pending : 대기(프리필 표시만)
import { computed } from 'vue'
import NumberStepper from '@/components/common/NumberStepper.vue'
import { platesLabel } from '@/utils/plate'

const props = defineProps({
  set: { type: Object, required: true }, // { weight, reps, done }
  index: { type: Number, required: true }, // 0-base
  state: { type: String, default: 'pending' }, // 'done' | 'current' | 'pending'
  step: { type: Number, default: 2.5 },
  plateSet: { type: Object, default: null } // { barKg, plates } — 있으면 플레이트 조합 표시
})
const emit = defineEmits(['check', 'uncheck', 'update'])

function setWeight(v) {
  emit('update', { ...props.set, weight: v })
}
function setReps(v) {
  emit('update', { ...props.set, reps: v })
}

const plate = computed(() => {
  if (!props.plateSet) return ''
  return platesLabel(props.set.weight, props.plateSet.barKg, props.plateSet.plates)
})
</script>

<template>
  <!-- 완료 -->
  <div
    v-if="state === 'done'"
    class="flex items-center gap-2 rounded-field bg-surface-1 px-3 py-2.5 opacity-70 transition-opacity active:opacity-100"
    @click="emit('uncheck')"
  >
    <span class="num w-6 shrink-0 text-center text-unit text-text-muted">{{ index + 1 }}</span>
    <div class="num flex-1 text-center text-text-secondary">{{ set.weight }}kg × {{ set.reps }}회</div>
    <span class="flex h-tap w-tap shrink-0 items-center justify-center text-pr" aria-label="완료됨">✅</span>
  </div>

  <!-- 진행 중 -->
  <div v-else-if="state === 'current'" class="rounded-field bg-surface-1 px-3 py-2.5 ring-2 ring-accent">
    <div class="flex items-center gap-2">
      <span class="num w-6 shrink-0 text-center text-unit text-accent">{{ index + 1 }}</span>
      <div class="flex flex-1 items-center justify-center gap-2">
        <NumberStepper :model-value="set.weight" :step="step" unit="kg" @update:model-value="setWeight" />
        <NumberStepper :model-value="set.reps" :step="1" unit="회" @update:model-value="setReps" />
      </div>
      <button
        class="flex h-tap w-tap shrink-0 items-center justify-center rounded-field bg-accent text-2xl text-accent-text transition-transform duration-tap active:scale-95"
        aria-label="세트 완료"
        @click="emit('check', { weight: Number(set.weight) || 0, reps: Number(set.reps) || 0 })"
      >
        ✓
      </button>
    </div>
    <div v-if="plate" class="num mt-1.5 text-center text-caption text-text-muted">🏋️ 한쪽 {{ plate }}</div>
  </div>

  <!-- 대기 -->
  <div v-else class="flex items-center gap-2 rounded-field bg-surface-1 px-3 py-2.5">
    <span class="num w-6 shrink-0 text-center text-unit text-text-muted">{{ index + 1 }}</span>
    <div class="num flex-1 text-center text-text-muted">{{ set.weight }}kg × {{ set.reps }}회</div>
    <span class="flex h-tap w-tap shrink-0 items-center justify-center text-text-muted" aria-hidden="true">○</span>
  </div>
</template>
