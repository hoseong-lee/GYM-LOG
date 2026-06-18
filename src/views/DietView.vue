<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import ProgressRing from '@/components/common/ProgressRing.vue'
import MealAddSheet from '@/components/record/MealAddSheet.vue'
import { useAuthStore } from '@/stores/auth'
import { getDietDay, deleteMeal } from '@/firebase/database'
import { todayKey, formatDate, isToday } from '@/utils/date'
import { sumMeals, SLOT_LABELS, SLOTS } from '@/utils/nutrition'
import { pushToast } from '@/composables/useToast'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const date = ref(todayKey())
const dietDay = ref(null)
const addOpen = ref(false)

const target = computed(() => authStore.profile?.dietTarget || {})
const hasTarget = computed(() => Number(target.value.kcal) > 0 || Number(target.value.protein) > 0)

async function load() {
  dietDay.value = await getDietDay(date.value)
}
onMounted(load)

function shiftDay(d) {
  if (d > 0 && isToday(date.value)) return
  date.value = dayjs(date.value).add(d, 'day').format('YYYY-MM-DD')
  load()
}

const meals = computed(() => {
  const m = dietDay.value?.meals || {}
  return Object.entries(m)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
})
const totals = computed(() => sumMeals(dietDay.value?.meals || {}))
const bySlot = computed(() => {
  const g = {}
  SLOTS.forEach((s) => (g[s] = []))
  meals.value.forEach((m) => {
    ;(g[m.slot] || (g[m.slot] = [])).push(m)
  })
  return g
})

async function remove(key) {
  try {
    await deleteMeal(date.value, key)
    await load()
  } catch (e) {
    pushToast('삭제 실패: ' + (e?.message || e), 'error')
  }
}
</script>

<template>
  <div>
    <AppHeader title="식단" />

    <div class="px-gutter py-3">
      <!-- 날짜 -->
      <div class="mb-4 flex items-center justify-between rounded-card bg-surface-1 px-2 py-2">
        <button class="flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-2" @click="shiftDay(-1)">‹</button>
        <div class="text-center font-semibold text-text-primary">{{ isToday(date) ? '오늘' : formatDate(date, 'M월 D일 (ddd)') }}</div>
        <button class="flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-2 disabled:opacity-30" :disabled="isToday(date)" @click="shiftDay(1)">›</button>
      </div>

      <!-- 목표 진행 -->
      <div v-if="hasTarget" class="mb-4 flex items-center justify-around rounded-card bg-surface-1 p-4">
        <ProgressRing :value="totals.protein" :target="Number(target.protein) || 0" label="단백질" unit="g" color="accent" :size="104" />
        <ProgressRing :value="totals.kcal" :target="Number(target.kcal) || 0" label="칼로리" unit="" color="pr" :size="104" />
      </div>
      <button v-else class="mb-4 w-full rounded-card border border-dashed border-border-subtle bg-surface-1 py-4 text-center text-text-secondary active:bg-surface-2" @click="router.push('/more')">
        <div class="num text-h2 text-text-primary">{{ Math.round(totals.kcal) }} kcal · 단백질 {{ Math.round(totals.protein) }}g</div>
        <div class="mt-1 text-caption text-accent">+ 일일 목표 설정하기 (더보기)</div>
      </button>

      <!-- 끼니 리스트 -->
      <div v-for="s in SLOTS" :key="s" class="mb-3">
        <div v-if="bySlot[s].length" class="rounded-card bg-surface-1 p-3">
          <div class="mb-1.5 text-unit text-text-muted">{{ SLOT_LABELS[s] }}</div>
          <div v-for="m in bySlot[s]" :key="m.key" class="flex items-center justify-between border-b border-border-subtle py-2 last:border-0">
            <div class="min-w-0">
              <div class="truncate text-text-primary">{{ m.name || '(이름 없음)' }}</div>
              <div class="num text-caption text-text-muted">{{ m.kcal }}kcal · 단백질 {{ m.protein }}g<template v-if="m.carb"> · 탄 {{ m.carb }}</template><template v-if="m.fat"> · 지 {{ m.fat }}</template></div>
            </div>
            <button class="ml-2 flex h-8 w-8 shrink-0 items-center justify-center text-text-muted active:text-danger" @click="remove(m.key)">✕</button>
          </div>
        </div>
      </div>

      <div v-if="!meals.length" class="mt-10 text-center text-text-muted">아직 식단 기록이 없어요.</div>

      <button class="mt-4 w-full rounded-card bg-accent py-4 font-semibold text-accent-text shadow-card transition-transform duration-tap active:scale-[0.99]" @click="addOpen = true">
        ＋ 식단 추가
      </button>
    </div>

    <MealAddSheet v-model="addOpen" :date="date" :diet-target="target" @saved="load" />
  </div>
</template>
