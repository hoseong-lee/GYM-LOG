<script setup>
import { ref, watch } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import NumberStepper from '@/components/common/NumberStepper.vue'
import { saveCardioEntry } from '@/firebase/database'
import { pushToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  exercise: { type: Object, default: null },
  date: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const minutes = ref(30)
const distanceKm = ref(0)
const intensity = ref('mid')
const saving = ref(false)

const intensities = [
  { v: 'low', label: '저강도' },
  { v: 'mid', label: '중강도' },
  { v: 'high', label: '고강도' }
]

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      minutes.value = 30
      distanceKm.value = 0
      intensity.value = 'mid'
    }
  }
)

async function save() {
  if (!(Number(minutes.value) > 0)) {
    pushToast('시간을 입력하세요.', 'error')
    return
  }
  saving.value = true
  try {
    await saveCardioEntry({
      date: props.date,
      exKey: props.exercise.id,
      name: props.exercise.name,
      minutes: minutes.value,
      distanceKm: distanceKm.value,
      intensity: intensity.value
    })
    pushToast(`${props.exercise.name} 저장됨`, 'info')
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
    :title="exercise?.name || '유산소'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex items-center justify-around rounded-field bg-surface-1 px-3 py-4">
      <div class="flex flex-col items-center">
        <NumberStepper v-model="minutes" :step="5" unit="분" />
      </div>
      <div class="flex flex-col items-center">
        <NumberStepper v-model="distanceKm" :step="0.5" unit="km" />
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <button
        v-for="it in intensities"
        :key="it.v"
        class="flex-1 rounded-field py-3 text-sm font-medium transition-colors"
        :class="intensity === it.v ? 'bg-accent text-accent-text' : 'bg-surface-1 text-text-secondary'"
        @click="intensity = it.v"
      >
        {{ it.label }}
      </button>
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
