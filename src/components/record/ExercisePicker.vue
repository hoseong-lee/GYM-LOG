<script setup>
import { ref, computed } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import { BODY_PARTS, bodyPartLabels, exercisesByBodyPart } from '@/data/exercises'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'select', 'select-custom'])

const part = ref('chest')
const customMode = ref(false)
const customName = ref('')

const list = computed(() => exercisesByBodyPart(part.value))

const equipLabel = {
  barbell: '바벨',
  dumbbell: '덤벨',
  machine: '머신',
  cable: '케이블',
  bodyweight: '맨몸'
}

function pick(ex) {
  emit('select', ex)
  emit('update:modelValue', false)
}
function addCustom() {
  const name = customName.value.trim()
  if (!name) return
  emit('select-custom', { name, bodyPart: part.value })
  customName.value = ''
  customMode.value = false
  emit('update:modelValue', false)
}
</script>

<template>
  <BottomSheet
    :model-value="modelValue"
    title="종목 선택"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <button
        class="rounded-pill px-3 py-1.5 text-sm font-medium"
        :class="customMode ? 'bg-accent text-accent-text' : 'bg-surface-3 text-text-secondary'"
        @click="customMode = !customMode"
      >
        직접 입력
      </button>
    </template>

    <!-- 부위 탭 -->
    <div class="-mx-gutter mb-3 flex gap-2 overflow-x-auto px-gutter pb-1">
      <button
        v-for="p in BODY_PARTS"
        :key="p"
        class="shrink-0 rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors duration-tap"
        :class="part === p ? 'bg-accent text-accent-text' : 'bg-surface-3 text-text-secondary'"
        @click="part = p"
      >
        {{ bodyPartLabels[p] }}
      </button>
    </div>

    <!-- 직접 입력 -->
    <div v-if="customMode" class="mb-3 flex gap-2">
      <input
        v-model="customName"
        type="text"
        :placeholder="`${bodyPartLabels[part]} 종목명 입력`"
        class="flex-1 rounded-field bg-surface-1 px-3 py-3 text-text-primary outline-none placeholder:text-text-muted"
        @keyup.enter="addCustom"
      />
      <button class="rounded-field bg-accent px-4 font-medium text-accent-text" @click="addCustom">추가</button>
    </div>

    <!-- 종목 리스트 -->
    <div class="flex flex-col gap-2 pb-2">
      <button
        v-for="ex in list"
        :key="ex.id"
        class="flex items-center justify-between rounded-field bg-surface-1 px-4 py-3.5 text-left transition-colors active:bg-surface-3"
        @click="pick(ex)"
      >
        <span class="font-medium text-text-primary">{{ ex.name }}</span>
        <span class="text-unit text-text-muted">{{ equipLabel[ex.equipment] || ex.equipment }}</span>
      </button>
      <p v-if="!list.length" class="py-6 text-center text-sm text-text-muted">
        등록된 종목이 없습니다. ‘직접 입력’으로 추가하세요.
      </p>
    </div>
  </BottomSheet>
</template>
