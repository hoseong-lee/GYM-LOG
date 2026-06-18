<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import MiniLineChart from '@/components/common/MiniLineChart.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { getLogsRange, getBodyRange, getDietDay, getWater } from '@/firebase/database'
import { daysAgoKey, todayKey, formatDate } from '@/utils/date'
import { currentStreak, isWorkoutDay, dayBodyParts, dayVolume } from '@/utils/stats'
import { daysSincePart } from '@/utils/stats'
import { toSeries, ema } from '@/utils/body'
import { sumMeals } from '@/utils/nutrition'
import { splits, DEFAULT_SPLIT } from '@/data/splits'
import { bodyPartLabels } from '@/data/exercises'

const router = useRouter()
const authStore = useAuthStore()
const theme = useThemeStore()
const recentLogs = ref({})
const bodyRange = ref({})
const todayDiet = ref(null)
const todayWater = ref(0)
const loaded = ref(false)

const PARTS = ['chest', 'back', 'shoulder', 'legs', 'arms']

onMounted(async () => {
  recentLogs.value = await getLogsRange(daysAgoKey(14), todayKey())
  bodyRange.value = await getBodyRange(daysAgoKey(90), todayKey())
  todayDiet.value = await getDietDay(todayKey())
  todayWater.value = await getWater(todayKey())
  loaded.value = true
})

const weightSeries = computed(() => ema(toSeries(bodyRange.value, 'weightKg')))
const proteinToday = computed(() => Math.round(sumMeals(todayDiet.value?.meals || {}).protein))
const proteinTarget = computed(() => Number(authStore.profile?.dietTarget?.protein) || 0)
const waterTarget = computed(() => Number(authStore.profile?.goals?.waterTargetMl) || 2000)
const pct = (v, t) => (t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0)

const name = computed(() => authStore.profile?.displayName || authStore.user?.displayName || '')
const streak = computed(() => currentStreak(recentLogs.value))
const weekCount = computed(() => {
  let n = 0
  for (let i = 0; i < 7; i++) if (isWorkoutDay(recentLogs.value[daysAgoKey(i)])) n++
  return n
})

const currentSplit = computed(() => splits[authStore.split || DEFAULT_SPLIT] || splits[DEFAULT_SPLIT])
const sinceByPart = computed(() => daysSincePart(recentLogs.value, PARTS))
const todaySession = computed(() => {
  let best = null
  let bestScore = -1
  for (const s of currentSplit.value.sessions) {
    const score = s.bodyParts.reduce((sum, p) => sum + (sinceByPart.value[p] === null ? 99 : sinceByPart.value[p]), 0)
    if (score > bestScore) {
      bestScore = score
      best = s
    }
  }
  return best
})

const lastSession = computed(() => {
  for (let i = 0; i <= 14; i++) {
    const k = daysAgoKey(i)
    const log = recentLogs.value[k]
    const has = (log?.strength && Object.keys(log.strength).length) || (log?.cardio && Object.keys(log.cardio).length)
    if (has) {
      return { date: k, parts: dayBodyParts(log).map((p) => bodyPartLabels[p] || p), volume: Math.round(dayVolume(log)), daysAgo: i }
    }
  }
  return null
})
</script>

<template>
  <div>
    <AppHeader title="GYM LOG">
      <template #actions>
        <button class="flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-1" aria-label="테마" @click="theme.toggle()">
          <span v-if="theme.isDark">🌙</span><span v-else>☀️</span>
        </button>
      </template>
    </AppHeader>

    <div class="px-gutter py-3">
      <p class="mb-4 text-text-secondary">
        <span v-if="name" class="font-semibold text-text-primary">{{ name }}</span>님, 오늘도 한 세트 가볍게 시작해요.
      </p>

      <!-- 오늘 추천 -->
      <button class="w-full rounded-card bg-accent p-5 text-left shadow-card transition-transform duration-tap active:scale-[0.99]" @click="router.push('/log')">
        <div class="text-unit text-accent-text/70">오늘 추천 · {{ currentSplit.label }}</div>
        <div class="mt-1 text-h1 font-bold text-accent-text">{{ todaySession?.name || '운동 시작' }}</div>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="p in todaySession?.bodyParts || []" :key="p" class="rounded-pill bg-black/15 px-2.5 py-1 text-caption font-medium text-accent-text">
            {{ bodyPartLabels[p] }}
          </span>
        </div>
      </button>

      <!-- 출석 요약 -->
      <button class="mt-3 flex w-full items-center gap-4 rounded-card bg-surface-1 p-4 text-left shadow-card active:bg-surface-2" @click="router.push('/attendance')">
        <div class="text-center">
          <div class="num text-h1 text-accent">🔥 {{ streak }}</div>
          <div class="text-caption text-text-muted">연속</div>
        </div>
        <div class="h-8 w-px bg-border-subtle" />
        <div class="text-center">
          <div class="num text-h1 text-text-primary">{{ weekCount }}</div>
          <div class="text-caption text-text-muted">최근 7일</div>
        </div>
        <div class="ml-auto text-text-muted">›</div>
      </button>

      <!-- 체중 추세 -->
      <button v-if="weightSeries.length" class="mt-3 w-full rounded-card bg-surface-1 p-4 text-left shadow-card active:bg-surface-2" @click="router.push('/body')">
        <div class="mb-1 flex items-center justify-between">
          <span class="text-unit text-text-muted">체중 추세</span>
          <span class="num text-text-primary">{{ weightSeries[weightSeries.length - 1].value }} kg ›</span>
        </div>
        <MiniLineChart :series="weightSeries" color="accent" :height="56" />
      </button>

      <!-- 오늘 영양/수분 -->
      <button class="mt-3 w-full rounded-card bg-surface-1 p-4 text-left shadow-card active:bg-surface-2" @click="router.push('/diet')">
        <div class="text-unit text-text-muted">오늘 영양 · 수분</div>
        <div class="mt-2 space-y-2">
          <div>
            <div class="mb-1 flex justify-between text-caption"><span class="text-accent">단백질</span><span class="num text-text-secondary">{{ proteinToday }}{{ proteinTarget ? ' / ' + proteinTarget : '' }} g</span></div>
            <div class="h-2 overflow-hidden rounded-pill bg-surface-3"><div class="h-full rounded-pill bg-accent" :style="{ width: pct(proteinToday, proteinTarget || proteinToday || 1) + '%' }" /></div>
          </div>
          <div>
            <div class="mb-1 flex justify-between text-caption"><span class="text-text-secondary">수분</span><span class="num text-text-secondary">{{ todayWater }} / {{ waterTarget }} ml</span></div>
            <div class="h-2 overflow-hidden rounded-pill bg-surface-3"><div class="h-full rounded-pill bg-accent/70" :style="{ width: pct(todayWater, waterTarget) + '%' }" /></div>
          </div>
        </div>
      </button>

      <!-- 직전 세션 -->
      <div class="mt-3 rounded-card bg-surface-1 p-4 shadow-card">
        <div class="text-unit text-text-muted">직전 세션</div>
        <template v-if="lastSession">
          <div class="mt-1 flex items-baseline justify-between">
            <div class="font-semibold text-text-primary">{{ lastSession.daysAgo === 0 ? '오늘' : formatDate(lastSession.date, 'M월 D일 (ddd)') }}</div>
            <div class="num text-text-secondary">{{ lastSession.volume.toLocaleString() }} kg</div>
          </div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span v-for="p in lastSession.parts" :key="p" class="rounded-pill bg-surface-3 px-2.5 py-1 text-caption text-text-secondary">{{ p }}</span>
          </div>
        </template>
        <p v-else-if="loaded" class="mt-1 text-text-muted">아직 기록이 없어요. 첫 운동을 기록해보세요!</p>
      </div>
    </div>
  </div>
</template>
