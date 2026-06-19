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
  plateSet: { type: Object, default: null }, // { barKg, plates } — 있으면 플레이트 조합 표시
  prevRecord: { type: Object, default: null }, // { lastWeight, lastReps } 지난 세션 직전 기록
  lastSetVals: { type: Object, default: null } // { weight, reps } 이번 세션 직전 완료 세트
})
const emit = defineEmits(['check', 'uncheck', 'update'])

function setWeight(v) {
  emit('update', { ...props.set, weight: v })
}
function setReps(v) {
  emit('update', { ...props.set, reps: v })
}

// 스마트 프리필 칩 — 직전 완료 세트/지난 기록을 1탭으로 채운다(현재 값과 다를 때만 노출).
const chips = computed(() => {
  const out = []
  const cw = Number(props.set.weight)
  const cr = Number(props.set.reps)
  if (props.lastSetVals && props.lastSetVals.weight != null) {
    const { weight, reps } = props.lastSetVals
    if (weight !== cw || reps !== cr) out.push({ label: `전 세트 ${weight}×${reps}`, weight, reps })
  }
  if (props.prevRecord?.lastWeight != null) {
    const weight = props.prevRecord.lastWeight
    const reps = props.prevRecord.lastReps
    const dup = out.some((o) => o.weight === weight && o.reps === reps)
    if (!dup && (weight !== cw || reps !== cr)) out.push({ label: `지난 ${weight}×${reps}`, weight, reps })
  }
  return out
})
function applyChip(c) {
  emit('update', { ...props.set, weight: c.weight, reps: c.reps })
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
    <div v-if="chips.length" class="mb-2 flex flex-wrap justify-center gap-1.5">
      <button
        v-for="c in chips"
        :key="c.label"
        type="button"
        class="num rounded-pill bg-surface-2 px-2.5 py-1 text-caption font-medium text-text-secondary transition-colors active:bg-accent-subtle active:text-accent"
        @click="applyChip(c)"
      >
        {{ c.label }}
      </button>
    </div>
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
