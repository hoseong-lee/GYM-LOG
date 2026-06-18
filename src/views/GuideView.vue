<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { BODY_PARTS, bodyPartLabels, allExercises } from '@/data/exercises'

const router = useRouter()
const filter = ref('all')

const filters = ['all', ...BODY_PARTS]
const list = computed(() => {
  const all = allExercises()
  if (filter.value === 'all') return all
  return all.filter((e) => e.bodyPart === filter.value)
})

const equipLabel = { barbell: '바벨', dumbbell: '덤벨', machine: '머신', cable: '케이블', bodyweight: '맨몸' }

function open(ex) {
  router.push(`/guide/${ex.id}`)
}
</script>

<template>
  <div>
    <AppHeader title="가이드" />

    <div class="px-gutter py-3">
      <!-- 부위 필터 -->
      <div class="-mx-gutter mb-3 flex gap-2 overflow-x-auto px-gutter pb-1">
        <button
          v-for="f in filters"
          :key="f"
          class="shrink-0 rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors duration-tap"
          :class="filter === f ? 'bg-accent text-accent-text' : 'bg-surface-2 text-text-secondary'"
          @click="filter = f"
        >
          {{ f === 'all' ? '전체' : bodyPartLabels[f] }}
        </button>
      </div>

      <!-- 종목 카드 -->
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="ex in list"
          :key="ex.id"
          class="flex flex-col rounded-card bg-surface-1 p-4 text-left shadow-card transition-transform duration-tap active:scale-[0.98]"
          @click="open(ex)"
        >
          <div class="flex items-center justify-between">
            <span class="rounded-pill bg-surface-3 px-2 py-0.5 text-caption text-text-secondary">{{ bodyPartLabels[ex.bodyPart] }}</span>
            <span class="text-caption text-text-muted">{{ equipLabel[ex.equipment] || ex.equipment }}</span>
          </div>
          <div class="mt-2 font-semibold leading-snug text-text-primary">{{ ex.name }}</div>
          <div class="mt-1 line-clamp-2 text-caption text-text-muted">{{ ex.guide?.target || '' }}</div>
        </button>
      </div>
    </div>
  </div>
</template>
