<script setup>
import { ref, watch, computed } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import NumberStepper from '@/components/common/NumberStepper.vue'
import { getLastForExercise, saveStrengthEntry } from '@/firebase/database'
import { getExercise } from '@/data/exercises'
import { pushToast } from '@/composables/useToast'
import { fromNow } from '@/utils/date'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  exercise: { type: Object, default: null }, // { id, name, bodyPart, increment, repRange }
  date: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const sets = ref([{ weight: 20, reps: 10 }])
const prev = ref(null)
const saving = ref(false)

// 동작 가이드(접이식) — 빠른기록 중에도 라우트 이탈 없이 폼 확인
const guide = computed(() => getExercise(props.exercise?.id || '')?.guide || null)
const showGuide = ref(false)

const step = computed(() => props.exercise?.increment || 2.5)
const repHi = computed(() => props.exercise?.repRange?.[1] || 10)
const repLo = computed(() => props.exercise?.repRange?.[0] || 8)

// 다음 목표 제안 (더블 프로그레션)
const suggestion = computed(() => {
  if (!prev.value) return null
  const { lastWeight = 0, lastReps = 0 } = prev.value
  if (lastReps >= repHi.value) {
    return { weight: round(lastWeight + step.value), reps: repLo.value, label: `+${step.value}kg` }
  }
  return { weight: lastWeight, reps: lastReps + 1, label: '+1회' }
})

function round(v) {
  return Math.round(v * 100) / 100
}

watch(
  () => [props.modelValue, props.exercise?.id],
  async ([open]) => {
    if (open && props.exercise) {
      showGuide.value = false
      prev.value = await getLastForExercise(props.exercise.id)
      if (prev.value) {
        sets.value = [{ weight: prev.value.lastWeight ?? 20, reps: prev.value.lastReps ?? 10 }]
      } else {
        sets.value = [{ weight: 20, reps: 10 }]
      }
    }
  }
)

function addSet() {
  const last = sets.value[sets.value.length - 1] || { weight: 20, reps: 10 }
  sets.value.push({ weight: last.weight, reps: last.reps })
}
function removeSet(i) {
  sets.value.splice(i, 1)
  if (!sets.value.length) sets.value.push({ weight: 20, reps: 10 })
}
function applySuggestion() {
  if (!suggestion.value) return
  const last = sets.value[sets.value.length - 1]
  last.weight = suggestion.value.weight
  last.reps = suggestion.value.reps
}

async function save() {
  const clean = sets.value
    .map((s) => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }))
    .filter((s) => s.reps > 0)
  if (!clean.length) {
    pushToast('세트를 한 개 이상 입력하세요.', 'error')
    return
  }
  saving.value = true
  try {
    const { isPR } = await saveStrengthEntry({
      date: props.date,
      exKey: props.exercise.id,
      name: props.exercise.name,
      bodyPart: props.exercise.bodyPart,
      sets: clean
    })
    pushToast(isPR ? `🏆 ${props.exercise.name} 새 기록!` : `${props.exercise.name} 저장됨`, isPR ? 'success' : 'info')
    emit('saved')
    emit('update:modelValue', false)
  } catch (e) {
    pushToast('저장 실패: ' + (e?.message || e), 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BottomSheet
    :model-value="modelValue"
    :title="exercise?.name || '운동'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- 직전 기록 -->
    <div class="mb-3 flex items-center justify-between rounded-field bg-surface-1 px-4 py-3">
      <div>
        <div class="text-unit text-text-muted">직전 기록</div>
        <div v-if="prev" class="num text-text-secondary">
          {{ prev.lastWeight }}kg × {{ prev.lastReps }}회
          <span class="text-text-muted">· {{ fromNow(prev.lastDate) }}</span>
        </div>
        <div v-else class="text-text-muted">기록 없음 (첫 세션)</div>
      </div>
      <button
        v-if="suggestion"
        class="rounded-pill bg-accent-subtle px-3 py-2 text-sm font-medium text-accent"
        @click="applySuggestion"
      >
        목표 {{ suggestion.weight }}kg×{{ suggestion.reps }} ({{ suggestion.label }})
      </button>
    </div>

    <!-- 동작 가이드 (접이식) -->
    <template v-if="guide">
      <button
        class="mb-3 flex w-full items-center justify-between rounded-field bg-surface-1 px-4 py-3 text-left transition-colors active:bg-surface-2"
        @click="showGuide = !showGuide"
      >
        <span class="text-sm font-medium text-text-secondary">📖 동작 가이드</span>
        <span class="text-text-muted">{{ showGuide ? '▲' : '▼' }}</span>
      </button>
      <div v-if="showGuide" class="mb-3 flex flex-col gap-3 rounded-card bg-surface-1 p-3">
        <div v-if="guide.cues?.length">
          <div class="mb-1.5 text-unit font-semibold text-text-primary">동작 순서</div>
          <ol class="flex flex-col gap-2">
            <li v-for="(c, i) in guide.cues" :key="i" class="flex gap-2">
              <span class="num flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-accent-subtle text-caption font-semibold text-accent">{{ i + 1 }}</span>
              <span class="text-sm leading-relaxed text-text-secondary">{{ c }}</span>
            </li>
          </ol>
        </div>
        <div v-if="guide.mistakes?.length">
          <div class="mb-1.5 text-unit font-semibold text-warn">흔한 실수</div>
          <ul class="flex flex-col gap-1.5">
            <li v-for="(m, i) in guide.mistakes" :key="i" class="flex gap-2">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" />
              <span class="text-sm leading-relaxed text-text-secondary">{{ m }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- 세트 -->
    <div class="flex flex-col gap-2">
      <div
        v-for="(s, i) in sets"
        :key="i"
        class="flex items-center gap-2 rounded-field bg-surface-1 px-3 py-2.5"
      >
        <span class="num w-6 shrink-0 text-center text-unit text-text-muted">{{ i + 1 }}</span>
        <div class="flex flex-1 items-center justify-center gap-3">
          <NumberStepper v-model="s.weight" :step="step" unit="kg" />
          <NumberStepper v-model="s.reps" :step="1" unit="회" />
        </div>
        <button class="flex h-tap w-8 shrink-0 items-center justify-center text-text-muted active:text-danger" aria-label="세트 삭제" @click="removeSet(i)">
          ✕
        </button>
      </div>
    </div>

    <button class="mt-3 w-full rounded-field border border-border-subtle py-3 text-text-secondary active:bg-surface-1" @click="addSet">
      ＋ 세트 추가
    </button>

    <button
      class="mt-3 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99] disabled:opacity-60"
      :disabled="saving"
      @click="save"
    >
      {{ saving ? '저장 중…' : '저장' }}
    </button>
  </BottomSheet>
</template>
