<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <transition name="sheet">
    <div v-if="modelValue" class="fixed inset-0 z-[80]" @keydown.esc="close">
      <div class="absolute inset-0 bg-black/60" @click="close" />
      <div
        class="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-sheet bg-surface-2 shadow-sheet"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 1rem)"
      >
        <div class="sticky top-0 flex flex-col items-center bg-surface-2 pt-3">
          <div class="h-1 w-9 rounded-pill bg-surface-3" />
          <div v-if="title || $slots.header" class="mt-3 flex w-full items-center justify-between px-gutter pb-2">
            <h2 class="text-h2 text-text-primary">{{ title }}</h2>
            <slot name="header" />
          </div>
        </div>
        <div class="px-gutter pt-1">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 200ms ease;
}
.sheet-enter-active > div:last-child,
.sheet-leave-active > div:last-child {
  transition: transform 340ms cubic-bezier(0.4, 0, 0.2, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > div:last-child,
.sheet-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
