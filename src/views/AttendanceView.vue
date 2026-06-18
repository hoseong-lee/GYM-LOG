<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { getMonthLogs, getLogsRange, setManualCheck } from '@/firebase/database'
import { monthGrid, todayKey, daysAgoKey, isToday, isFuture } from '@/utils/date'
import { isWorkoutDay, currentStreak, workoutDayCount } from '@/utils/stats'
import { bodyPartLabels } from '@/data/exercises'
import { dayBodyParts } from '@/utils/stats'
import dayjs from 'dayjs'

const month = ref(dayjs().format('YYYY-MM'))
const monthLogs = ref({})
const recentLogs = ref({})

const weekDays = ['일', '월', '화', '수', '목', '금', '토']

async function loadMonth() {
  monthLogs.value = await getMonthLogs(month.value)
}
async function loadRecent() {
  recentLogs.value = await getLogsRange(daysAgoKey(45), todayKey())
}
onMounted(() => {
  loadMonth()
  loadRecent()
})

function shiftMonth(delta) {
  const next = dayjs(month.value + '-01').add(delta, 'month')
  if (delta > 0 && next.isAfter(dayjs(), 'month')) return
  month.value = next.format('YYYY-MM')
  loadMonth()
}

const weeks = computed(() => monthGrid(month.value))
const streak = computed(() => currentStreak(recentLogs.value))
const monthCount = computed(() => workoutDayCount(monthLogs.value))
const last30 = computed(() => {
  const m = {}
  for (let i = 0; i < 30; i++) {
    const k = daysAgoKey(i)
    if (recentLogs.value[k]) m[k] = recentLogs.value[k]
  }
  return workoutDayCount(m)
})

function isDone(d) {
  return d && isWorkoutDay(monthLogs.value[d])
}
function cellParts(d) {
  return dayBodyParts(monthLogs.value[d]).map((p) => bodyPartLabels[p] || p)
}

async function toggle(d) {
  if (!d || isFuture(d)) return
  const log = monthLogs.value[d]
  const hasEntries = (log?.strength && Object.keys(log.strength).length) || (log?.cardio && Object.keys(log.cardio).length)
  if (hasEntries) return // 기록 있는 날은 토글 불가
  await setManualCheck(d, !isWorkoutDay(log))
  await loadMonth()
  await loadRecent()
}
</script>

<template>
  <div>
    <AppHeader title="출석" />

    <div class="px-gutter py-3">
      <!-- 통계 -->
      <div class="mb-4 grid grid-cols-3 gap-2">
        <div class="rounded-card bg-surface-1 p-3 text-center">
          <div class="num text-h1 text-accent">🔥 {{ streak }}</div>
          <div class="text-caption text-text-muted">연속</div>
        </div>
        <div class="rounded-card bg-surface-1 p-3 text-center">
          <div class="num text-h1 text-text-primary">{{ monthCount }}</div>
          <div class="text-caption text-text-muted">이번 달</div>
        </div>
        <div class="rounded-card bg-surface-1 p-3 text-center">
          <div class="num text-h1 text-text-primary">{{ last30 }}</div>
          <div class="text-caption text-text-muted">최근 30일</div>
        </div>
      </div>

      <!-- 월 네비 -->
      <div class="mb-2 flex items-center justify-between">
        <button class="flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-1" @click="shiftMonth(-1)">‹</button>
        <div class="num font-semibold text-text-primary">{{ dayjs(month + '-01').format('YYYY년 M월') }}</div>
        <button class="flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-1" @click="shiftMonth(1)">›</button>
      </div>

      <!-- 캘린더 -->
      <div class="rounded-card bg-surface-1 p-3">
        <div class="mb-1 grid grid-cols-7">
          <div v-for="(w, i) in weekDays" :key="w" class="py-1 text-center text-caption" :class="i === 0 ? 'text-danger/80' : 'text-text-muted'">{{ w }}</div>
        </div>
        <div v-for="(week, wi) in weeks" :key="wi" class="grid grid-cols-7">
          <button
            v-for="(d, di) in week"
            :key="di"
            class="flex aspect-square items-center justify-center"
            :disabled="!d || isFuture(d)"
            @click="toggle(d)"
          >
            <span
              v-if="d"
              class="num flex h-9 w-9 items-center justify-center rounded-pill text-sm transition-colors"
              :class="[
                isDone(d) ? 'bg-accent font-semibold text-accent-text' : 'text-text-secondary',
                isToday(d) && !isDone(d) ? 'ring-1 ring-accent' : '',
                isFuture(d) ? 'text-text-muted/40' : ''
              ]"
            >
              {{ Number(d.slice(-2)) }}
            </span>
          </button>
        </div>
      </div>
      <p class="mt-3 text-center text-caption text-text-muted">
        운동 기록이 있는 날은 자동 출석됩니다. 쉰 날의 빈 칸을 탭하면 수동 체크할 수 있어요.
      </p>
    </div>
  </div>
</template>
