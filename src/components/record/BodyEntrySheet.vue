<script setup>
import { ref, watch, computed } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import NumberStepper from '@/components/common/NumberStepper.vue'
import { saveBodyEntry, getBodyLatest } from '@/firebase/database'
import { pushToast } from '@/composables/useToast'
import { delta } from '@/utils/body'
import { todayKey } from '@/utils/date'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  date: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const weightKg = ref('')
const smmKg = ref('')
const bodyFatPct = ref('')
const bmrKcal = ref('')
const memo = ref('')
const latest = ref(null)
const saving = ref(false)

const targetDate = computed(() => props.date || todayKey())

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    latest.value = await getBodyLatest()
    // 직전값 프리필 (편집 자유)
    weightKg.value = latest.value?.weightKg ?? ''
    smmKg.value = latest.value?.smmKg ?? ''
    bodyFatPct.value = latest.value?.bodyFatPct ?? ''
    bmrKcal.value = latest.value?.bmrKcal ?? ''
    memo.value = ''
  }
)

const dWeight = computed(() => delta(Number(weightKg.value) || null, latest.value?.weightKg ?? null))
const dSmm = computed(() => delta(Number(smmKg.value) || null, latest.value?.smmKg ?? null))
const dFat = computed(() => delta(Number(bodyFatPct.value) || null, latest.value?.bodyFatPct ?? null))

function deltaText(d) {
  if (d == null || d === 0) return ''
  return (d > 0 ? '+' : '') + d
}

async function save() {
  if (!(Number(weightKg.value) > 0)) {
    pushToast('체중을 입력하세요.', 'error')
    return
  }
  saving.value = true
  try {
    await saveBodyEntry({
      date: targetDate.value,
      weightKg: weightKg.value,
      smmKg: smmKg.value,
      bodyFatPct: bodyFatPct.value,
      bmrKcal: bmrKcal.value,
      memo: memo.value
    })
    pushToast('체성분 기록 저장됨', 'success')
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
    title="체성분 기록"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col gap-3">
      <div class="rounded-field bg-surface-1 p-3">
        <div class="mb-1 flex items-center justify-between">
          <span class="text-unit text-text-muted">체중 (kg)</span>
          <span v-if="deltaText(dWeight)" class="num text-caption text-text-secondary">{{ deltaText(dWeight) }}kg</span>
        </div>
        <div class="flex justify-center"><NumberStepper v-model="weightKg" :step="0.1" unit="kg" /></div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-field bg-surface-1 p-3">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-unit text-text-muted">골격근량</span>
            <span v-if="deltaText(dSmm)" class="num text-caption" :class="dSmm > 0 ? 'text-pr' : 'text-danger'">{{ deltaText(dSmm) }}</span>
          </div>
          <div class="flex justify-center"><NumberStepper v-model="smmKg" :step="0.1" unit="kg" /></div>
        </div>
        <div class="rounded-field bg-surface-1 p-3">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-unit text-text-muted">체지방률</span>
            <span v-if="deltaText(dFat)" class="num text-caption" :class="dFat < 0 ? 'text-pr' : 'text-danger'">{{ deltaText(dFat) }}</span>
          </div>
          <div class="flex justify-center"><NumberStepper v-model="bodyFatPct" :step="0.1" unit="%" /></div>
        </div>
      </div>

      <div class="rounded-field bg-surface-1 p-3">
        <div class="mb-1 text-unit text-text-muted">기초대사량 BMR (선택)</div>
        <div class="flex justify-center"><NumberStepper v-model="bmrKcal" :step="10" unit="kcal" /></div>
      </div>

      <input
        v-model="memo"
        type="text"
        placeholder="메모 (측정 조건 등, 선택)"
        class="rounded-field bg-surface-1 px-3 py-3 text-text-primary outline-none placeholder:text-text-muted"
      />
    </div>

    <button
      class="mt-4 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99] disabled:opacity-60"
      :disabled="saving"
      @click="save"
    >
      {{ saving ? '저장 중…' : '저장' }}
    </button>
  </BottomSheet>
</template>
