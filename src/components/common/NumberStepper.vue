<script setup>
const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  step: { type: Number, default: 2.5 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 9999 },
  unit: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

function clamp(v) {
  return Math.min(props.max, Math.max(props.min, v))
}
function round(v) {
  // step 단위 정렬 (부동소수 방지)
  return Math.round(v * 100) / 100
}
function bump(dir) {
  const cur = Number(props.modelValue) || 0
  emit('update:modelValue', clamp(round(cur + dir * props.step)))
}
function onInput(e) {
  const v = e.target.value
  if (v === '') {
    emit('update:modelValue', '')
    return
  }
  emit('update:modelValue', clamp(round(Number(v))))
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <button
      type="button"
      class="flex h-tap-edge w-tap-edge shrink-0 items-center justify-center rounded-field bg-surface-2 text-xl text-text-primary transition-transform duration-tap active:scale-95"
      aria-label="감소"
      @click="bump(-1)"
    >
      −
    </button>
    <div class="relative flex min-w-[64px] flex-col items-center">
      <input
        :value="modelValue"
        type="number"
        inputmode="decimal"
        class="num w-full bg-transparent text-center text-num-display text-text-primary outline-none"
        @input="onInput"
      />
      <span v-if="unit" class="text-unit text-text-muted">{{ unit }}</span>
    </div>
    <button
      type="button"
      class="flex h-tap-edge w-tap-edge shrink-0 items-center justify-center rounded-field bg-surface-2 text-xl text-text-primary transition-transform duration-tap active:scale-95"
      aria-label="증가"
      @click="bump(1)"
    >
      +
    </button>
  </div>
</template>
