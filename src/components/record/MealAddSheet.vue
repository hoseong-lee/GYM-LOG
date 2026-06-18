<script setup>
import { ref, watch, computed } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import { addMeal, getFoods } from '@/firebase/database'
import { pushToast } from '@/composables/useToast'
import { SLOTS, SLOT_LABELS } from '@/utils/nutrition'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  date: { type: String, required: true },
  dietTarget: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const slot = ref('lunch')
const foods = ref([])
const saving = ref(false)

// Quick Add
const name = ref('')
const kcal = ref('')
const protein = ref('')
const carb = ref('')
const fat = ref('')
const saveAsFood = ref(true)

const trackCarb = computed(() => Number(props.dietTarget?.carb) > 0)
const trackFat = computed(() => Number(props.dietTarget?.fat) > 0)

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    foods.value = await getFoods()
    name.value = ''
    kcal.value = ''
    protein.value = ''
    carb.value = ''
    fat.value = ''
  }
)

async function quickAddFood(f) {
  saving.value = true
  try {
    await addMeal({
      date: props.date,
      slot: slot.value,
      name: f.name,
      kcal: f.kcal,
      protein: f.protein,
      carb: f.carb,
      fat: f.fat,
      foodKey: f.id
    })
    pushToast(`${f.name} 추가됨`, 'info')
    emit('saved')
    emit('update:modelValue', false)
  } catch (e) {
    pushToast('실패: ' + (e?.message || e), 'error')
  } finally {
    saving.value = false
  }
}

async function addQuick() {
  if (!(Number(kcal.value) > 0) && !(Number(protein.value) > 0)) {
    pushToast('칼로리 또는 단백질을 입력하세요.', 'error')
    return
  }
  saving.value = true
  try {
    await addMeal({
      date: props.date,
      slot: slot.value,
      name: name.value,
      kcal: kcal.value,
      protein: protein.value,
      carb: carb.value,
      fat: fat.value,
      saveAsFood: saveAsFood.value && !!name.value.trim()
    })
    pushToast('기록됨', 'success')
    emit('saved')
    emit('update:modelValue', false)
  } catch (e) {
    pushToast('실패: ' + (e?.message || e), 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BottomSheet :model-value="modelValue" title="식단 추가" @update:model-value="emit('update:modelValue', $event)">
    <!-- 끼니 -->
    <div class="mb-3 flex gap-2">
      <button
        v-for="s in SLOTS"
        :key="s"
        class="flex-1 rounded-field py-2 text-sm font-medium transition-colors"
        :class="slot === s ? 'bg-accent text-accent-text' : 'bg-surface-1 text-text-secondary'"
        @click="slot = s"
      >
        {{ SLOT_LABELS[s] }}
      </button>
    </div>

    <!-- 자주 먹는 음식 -->
    <div v-if="foods.length" class="mb-4">
      <div class="mb-1.5 text-unit text-text-muted">자주 먹는 음식 (1탭 추가)</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in foods.slice(0, 12)"
          :key="f.id"
          class="rounded-pill bg-surface-2 px-3 py-2 text-left text-sm active:bg-surface-3"
          :disabled="saving"
          @click="quickAddFood(f)"
        >
          <span class="text-text-primary">{{ f.name }}</span>
          <span class="num ml-1.5 text-caption text-text-muted">{{ f.kcal }}kcal·P{{ f.protein }}</span>
        </button>
      </div>
    </div>

    <!-- 직접 입력 -->
    <div class="rounded-card bg-surface-1 p-3">
      <div class="mb-2 text-unit text-text-muted">직접 입력</div>
      <input
        v-model="name"
        type="text"
        placeholder="음식 이름 (선택)"
        class="mb-2 w-full rounded-field bg-surface-2 px-3 py-2.5 text-text-primary outline-none placeholder:text-text-muted"
      />
      <div class="grid grid-cols-2 gap-2">
        <label class="flex items-center gap-2 rounded-field bg-surface-2 px-3 py-2">
          <span class="text-unit text-text-muted">kcal</span>
          <input v-model="kcal" type="number" inputmode="numeric" class="num w-full bg-transparent text-right text-text-primary outline-none" placeholder="0" />
        </label>
        <label class="flex items-center gap-2 rounded-field bg-surface-2 px-3 py-2">
          <span class="text-unit text-accent">단백질 g</span>
          <input v-model="protein" type="number" inputmode="numeric" class="num w-full bg-transparent text-right text-text-primary outline-none" placeholder="0" />
        </label>
        <label v-if="trackCarb" class="flex items-center gap-2 rounded-field bg-surface-2 px-3 py-2">
          <span class="text-unit text-text-muted">탄수 g</span>
          <input v-model="carb" type="number" inputmode="numeric" class="num w-full bg-transparent text-right text-text-primary outline-none" placeholder="0" />
        </label>
        <label v-if="trackFat" class="flex items-center gap-2 rounded-field bg-surface-2 px-3 py-2">
          <span class="text-unit text-text-muted">지방 g</span>
          <input v-model="fat" type="number" inputmode="numeric" class="num w-full bg-transparent text-right text-text-primary outline-none" placeholder="0" />
        </label>
      </div>
      <label class="mt-2 flex items-center gap-2 text-caption text-text-secondary">
        <input v-model="saveAsFood" type="checkbox" class="accent-accent" />
        자주 먹는 음식으로 저장
      </label>
    </div>

    <button
      class="mt-4 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99] disabled:opacity-60"
      :disabled="saving"
      @click="addQuick"
    >
      {{ saving ? '저장 중…' : '기록' }}
    </button>
  </BottomSheet>
</template>
