<script setup>
// 요일별 루틴 매핑 편집기 (BottomSheet).
// days[0..6] = { sessionName } | { rest:true }. 분할의 sessions 이름 중 선택 or 휴식.
import { ref, computed, watch } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import { splits, DEFAULT_SPLIT } from '@/data/splits'
import { getWeeklyPlan, setWeeklyPlan } from '@/firebase/database'
import { pushToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  splitId: { type: String, default: DEFAULT_SPLIT }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const REST = '__rest__'

const split = computed(() => splits[props.splitId] || splits[DEFAULT_SPLIT])
const sessionNames = computed(() => split.value.sessions.map((s) => s.name))

const days = ref({}) // { 0..6 : sessionName | '__rest__' }
const saving = ref(false)

function fromPlan(plan) {
  const out = {}
  const src = plan?.days || split.value.defaultWeekly || {}
  for (let d = 0; d < 7; d++) {
    const cell = src[d]
    out[d] = cell?.rest ? REST : cell?.sessionName || REST
  }
  return out
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    const plan = await getWeeklyPlan()
    // 저장된 plan 의 splitId 가 현재와 다르면 현재 분할 기본값으로
    if (plan && plan.splitId === props.splitId) {
      days.value = fromPlan(plan)
    } else {
      days.value = fromPlan(null)
    }
  },
  { immediate: true }
)

function resetDefault() {
  days.value = fromPlan(null)
}

async function save() {
  saving.value = true
  try {
    const out = {}
    for (let d = 0; d < 7; d++) {
      const v = days.value[d]
      out[d] = v === REST ? { rest: true } : { sessionName: v }
    }
    await setWeeklyPlan({ splitId: props.splitId, days: out })
    pushToast('요일 플랜 저장됨', 'info')
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
    :title="`요일별 루틴 (${split.label})`"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col gap-2 pb-2">
      <div v-for="d in 7" :key="d - 1" class="flex items-center gap-3 rounded-field bg-surface-1 px-3 py-2.5">
        <span class="w-6 shrink-0 text-center font-semibold text-text-primary">{{ DOW[d - 1] }}</span>
        <select
          v-model="days[d - 1]"
          class="num flex-1 rounded-field bg-surface-2 px-3 py-2.5 text-text-primary outline-none"
        >
          <option v-for="n in sessionNames" :key="n" :value="n">{{ n }}</option>
          <option :value="REST">휴식</option>
        </select>
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <button class="flex-1 rounded-field border border-border-subtle py-3 text-text-secondary active:bg-surface-1" @click="resetDefault">
        기본값
      </button>
      <button
        class="flex-1 rounded-field bg-accent py-3 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99] disabled:opacity-60"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? '저장 중…' : '저장' }}
      </button>
    </div>
  </BottomSheet>
</template>
