<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ExercisePicker from '@/components/record/ExercisePicker.vue'
import StrengthEditor from '@/components/record/StrengthEditor.vue'
import CardioEditor from '@/components/record/CardioEditor.vue'
import RestTimer from '@/components/record/RestTimer.vue'
import { getDayLog, deleteEntry as dbDelete, setManualCheck } from '@/firebase/database'
import { todayKey, formatDate, isToday, isFuture } from '@/utils/date'
import { dayVolume, dayBodyParts } from '@/utils/stats'
import { bodyPartLabels } from '@/data/exercises'
import { resolveExKey } from '@/utils/exercise'
import { pushToast } from '@/composables/useToast'
import dayjs from 'dayjs'

const date = ref(todayKey())
const dayLog = ref(null)
const loading = ref(false)

const pickerOpen = ref(false)
const strengthOpen = ref(false)
const cardioOpen = ref(false)
const current = ref(null)

async function load() {
  loading.value = true
  try {
    dayLog.value = await getDayLog(date.value)
  } finally {
    loading.value = false
  }
}
onMounted(load)

function shiftDay(delta) {
  if (delta > 0 && isToday(date.value)) return // 미래 금지
  date.value = dayjs(date.value).add(delta, 'day').format('YYYY-MM-DD')
  load()
}

const strengthEntries = computed(() => {
  const s = dayLog.value?.strength || {}
  return Object.entries(s)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
})
const cardioEntries = computed(() => {
  const c = dayLog.value?.cardio || {}
  return Object.entries(c)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
})
const totalVolume = computed(() => Math.round(dayVolume(dayLog.value)))
const parts = computed(() => dayBodyParts(dayLog.value).map((p) => bodyPartLabels[p] || p))
const hasAny = computed(() => strengthEntries.value.length || cardioEntries.value.length)

function onSelect(ex) {
  current.value = ex
  if (ex.bodyPart === 'cardio') cardioOpen.value = true
  else strengthOpen.value = true
}
function onSelectCustom({ name, bodyPart }) {
  current.value = {
    id: resolveExKey(null, name),
    name,
    bodyPart,
    increment: 2.5,
    repRange: [8, 12]
  }
  if (bodyPart === 'cardio') cardioOpen.value = true
  else strengthOpen.value = true
}

function setVol(e) {
  return Math.round((e.sets || []).reduce((s, x) => s + (x.weight || 0) * (x.reps || 0), 0))
}

async function remove(kind, key) {
  try {
    await dbDelete(date.value, kind, key)
    await load()
  } catch (e) {
    pushToast('삭제 실패: ' + (e?.message || e), 'error')
  }
}

async function markRest() {
  await setManualCheck(date.value, true)
  await load()
  pushToast('휴식일로 출석 체크됨', 'info')
}
</script>

<template>
  <div>
    <AppHeader title="기록" />

    <div class="px-gutter py-3">
      <!-- 날짜 네비 -->
      <div class="mb-4 flex items-center justify-between rounded-card bg-surface-1 px-2 py-2">
        <button class="flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-2" @click="shiftDay(-1)">‹</button>
        <div class="text-center">
          <div class="font-semibold text-text-primary">{{ isToday(date) ? '오늘' : formatDate(date, 'M월 D일 (ddd)') }}</div>
          <div class="num text-caption text-text-muted">{{ date }}</div>
        </div>
        <button
          class="flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-2 disabled:opacity-30"
          :disabled="isToday(date)"
          @click="shiftDay(1)"
        >›</button>
      </div>

      <!-- 요약 -->
      <div v-if="hasAny" class="mb-4 flex items-center gap-4 rounded-card bg-surface-1 px-4 py-3">
        <div>
          <div class="text-unit text-text-muted">총 볼륨</div>
          <div class="num text-h2 text-text-primary">{{ totalVolume.toLocaleString() }}<span class="text-unit text-text-muted"> kg</span></div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="p in parts" :key="p" class="rounded-pill bg-surface-3 px-2.5 py-1 text-caption text-text-secondary">{{ p }}</span>
        </div>
      </div>

      <!-- 근력 엔트리 -->
      <div class="flex flex-col gap-3">
        <div v-for="e in strengthEntries" :key="e.key" class="rounded-card bg-surface-1 p-4 shadow-card">
          <div class="mb-2 flex items-start justify-between">
            <div>
              <div class="font-semibold text-text-primary">{{ e.name }}</div>
              <div class="text-unit text-text-muted">{{ bodyPartLabels[e.bodyPart] || e.bodyPart }} · 볼륨 {{ setVol(e).toLocaleString() }}kg</div>
            </div>
            <button class="-mr-1 flex h-8 w-8 items-center justify-center text-text-muted active:text-danger" @click="remove('strength', e.key)">✕</button>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="(s, i) in e.sets" :key="i" class="num rounded-field bg-surface-2 px-2.5 py-1 text-sm text-text-secondary">
              {{ s.weight }}×{{ s.reps }}
            </span>
          </div>
        </div>

        <!-- 유산소 엔트리 -->
        <div v-for="e in cardioEntries" :key="e.key" class="rounded-card bg-surface-1 p-4 shadow-card">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-semibold text-text-primary">{{ e.name }}</div>
              <div class="num text-unit text-text-muted">
                {{ e.minutes }}분<template v-if="e.distanceKm"> · {{ e.distanceKm }}km</template>
                · {{ { low: '저강도', mid: '중강도', high: '고강도' }[e.intensity] || e.intensity }}
              </div>
            </div>
            <button class="-mr-1 flex h-8 w-8 items-center justify-center text-text-muted active:text-danger" @click="remove('cardio', e.key)">✕</button>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-if="!hasAny && !loading" class="mt-10 flex flex-col items-center text-center">
        <p class="text-text-secondary">아직 기록이 없습니다.</p>
        <p class="mt-1 text-caption text-text-muted">아래 버튼으로 첫 종목을 추가해보세요.</p>
        <button v-if="dayLog?.manualCheck" disabled class="mt-4 rounded-pill bg-surface-2 px-4 py-2 text-caption text-text-muted">휴식일 인증됨</button>
        <button v-else class="mt-4 rounded-pill border border-border-subtle px-4 py-2 text-caption text-text-secondary active:bg-surface-1" @click="markRest">
          오늘은 쉬는 날로 체크
        </button>
      </div>

      <!-- 종목 추가 -->
      <button
        class="mt-6 w-full rounded-card bg-accent py-4 font-semibold text-accent-text shadow-card transition-transform duration-tap active:scale-[0.99]"
        @click="pickerOpen = true"
      >
        ＋ 종목 추가
      </button>
    </div>

    <ExercisePicker v-model="pickerOpen" @select="onSelect" @select-custom="onSelectCustom" />
    <StrengthEditor v-model="strengthOpen" :exercise="current" :date="date" @saved="load" />
    <CardioEditor v-model="cardioOpen" :exercise="current" :date="date" @saved="load" />
    <RestTimer v-if="isToday(date)" />
  </div>
</template>
