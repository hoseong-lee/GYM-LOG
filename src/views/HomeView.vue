<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import MiniLineChart from '@/components/common/MiniLineChart.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { getLogsRange, getBodyRange, getDietDay, getWater, getLastByExercise, getWeeklyPlan } from '@/firebase/database'
import { daysAgoKey, todayKey, formatDate, dayjs } from '@/utils/date'
import { currentStreak, isWorkoutDay, dayBodyParts, dayVolume } from '@/utils/stats'
import { daysSincePart } from '@/utils/stats'
import { rotationFromPlanDays, countWorkoutDays, rotationPick } from '@/utils/rotation'
import { toSeries, ema } from '@/utils/body'
import { sumMeals } from '@/utils/nutrition'
import { splits, DEFAULT_SPLIT } from '@/data/splits'
import { bodyPartLabels, getExercise } from '@/data/exercises'

const router = useRouter()
const authStore = useAuthStore()
const theme = useThemeStore()
const recentLogs = ref({})
const bodyRange = ref({})
const todayDiet = ref(null)
const todayWater = ref(0)
const lastByEx = ref({})
const weeklyPlan = ref(null)
const rotationLogs = ref({}) // 로테이션 카운트용(anchor 이후)
const loaded = ref(false)

const PARTS = ['chest', 'back', 'shoulder', 'legs', 'arms']

onMounted(async () => {
  recentLogs.value = await getLogsRange(daysAgoKey(14), todayKey())
  bodyRange.value = await getBodyRange(daysAgoKey(90), todayKey())
  todayDiet.value = await getDietDay(todayKey())
  todayWater.value = await getWater(todayKey())
  lastByEx.value = await getLastByExercise()
  weeklyPlan.value = await getWeeklyPlan()
  const plan = weeklyPlan.value
  if (plan?.updatedAt && plan.splitId === (authStore.split || DEFAULT_SPLIT)) {
    const anchorKey = dayjs(plan.updatedAt).format('YYYY-MM-DD')
    const start = anchorKey < daysAgoKey(14) ? anchorKey : daysAgoKey(14)
    rotationLogs.value = await getLogsRange(start, todayKey())
  } else {
    rotationLogs.value = recentLogs.value
  }
  loaded.value = true
})

// 오늘 세운 신기록 (bestDate === 오늘)
const todayPRs = computed(() =>
  Object.entries(lastByEx.value)
    .filter(([, v]) => v.bestDate === todayKey() && v.bestWeight)
    .map(([exKey, v]) => ({ name: getExercise(exKey)?.name || exKey, weight: v.bestWeight, reps: v.bestReps }))
)

const weightSeries = computed(() => ema(toSeries(bodyRange.value, 'weightKg')))
const proteinToday = computed(() => Math.round(sumMeals(todayDiet.value?.meals || {}).protein))
const proteinTarget = computed(() => Number(authStore.profile?.dietTarget?.protein) || 0)
const waterTarget = computed(() => Number(authStore.profile?.goals?.waterTargetMl) || 2000)
const pct = (v, t) => (t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0)

const name = computed(() => authStore.profile?.displayName || authStore.user?.displayName || '')
const streak = computed(() => currentStreak(recentLogs.value))
const didToday = computed(() => isWorkoutDay(recentLogs.value[todayKey()]))
const weekCount = computed(() => {
  let n = 0
  for (let i = 0; i < 7; i++) if (isWorkoutDay(recentLogs.value[daysAgoKey(i)])) n++
  return n
})

const currentSplit = computed(() => splits[authStore.split || DEFAULT_SPLIT] || splits[DEFAULT_SPLIT])
const sinceByPart = computed(() => daysSincePart(recentLogs.value, PARTS))
// 요일 플랜이 있으면 밀림 로테이션 추천(기록 탭과 동일), 없으면 부위 미수행 기반 추천.
const rotationSession = computed(() => {
  const plan = weeklyPlan.value
  if (!plan || plan.splitId !== (authStore.split || DEFAULT_SPLIT) || !plan.days) return null
  const rotation = rotationFromPlanDays(plan.days)
  if (!rotation.length) return null
  const anchorKey = plan.updatedAt ? dayjs(plan.updatedAt).format('YYYY-MM-DD') : null
  const completed = countWorkoutDays(rotationLogs.value, isWorkoutDay, anchorKey, todayKey())
  const name = rotationPick(rotation, completed)
  return currentSplit.value.sessions.find((s) => s.name === name) || null
})
const todaySession = computed(() => {
  if (rotationSession.value) return rotationSession.value
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

      <!-- 오늘의 신기록 -->
      <div v-if="todayPRs.length" class="mb-3 rounded-card border border-pr/40 bg-surface-1 p-4 shadow-card">
        <div class="flex items-center gap-2">
          <span class="text-xl">🎉</span>
          <span class="font-semibold text-pr">오늘 신기록 {{ todayPRs.length }}개!</span>
        </div>
        <div class="num mt-1.5 text-sm text-text-secondary">
          {{ todayPRs.map((p) => `${p.name} ${p.weight}kg×${p.reps}`).join(' · ') }}
        </div>
      </div>

      <!-- 스트릭 안전 배너 — 오늘 미운동 + 2일+ 연속일 때만 -->
      <button
        v-if="streak >= 2 && !didToday"
        class="mb-3 flex w-full items-center gap-2 rounded-card border border-accent/40 bg-accent-subtle p-3 text-left transition-opacity active:opacity-80"
        @click="router.push('/log')"
      >
        <span class="text-xl">🔥</span>
        <span class="text-sm font-medium text-text-primary">{{ streak }}일 연속 유지 중 — 오늘 한 세트면 {{ streak + 1 }}일!</span>
        <span class="ml-auto text-accent">›</span>
      </button>

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
