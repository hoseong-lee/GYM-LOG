<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import MetricCard from '@/components/common/MetricCard.vue'
import MiniLineChart from '@/components/common/MiniLineChart.vue'
import ProgressRing from '@/components/common/ProgressRing.vue'
import NumberStepper from '@/components/common/NumberStepper.vue'
import BodyEntrySheet from '@/components/record/BodyEntrySheet.vue'
import { useAuthStore } from '@/stores/auth'
import {
  getBodyLatest,
  getBodyRange,
  getWater,
  addWater,
  getLogsRange,
  setHeight as dbSetHeight
} from '@/firebase/database'
import { todayKey, daysAgoKey, daysBetween, fromNow } from '@/utils/date'
import { toSeries, ema, delta, bmi, bodyFatMass } from '@/utils/body'
import { isWorkoutDay } from '@/utils/stats'
import { pushToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()

const seg = ref('body')
const segs = [
  { v: 'body', l: '체성분' },
  { v: 'water', l: '물' },
  { v: 'goals', l: '목표' }
]

const range = ref({})
const latest = ref(null)
const waterMl = ref(0)
const recentLogs = ref({})
const entryOpen = ref(false)
const heightInput = ref('')

const height = computed(() => authStore.profile?.heightCm || null)
const goals = computed(() => authStore.profile?.goals || {})

async function load() {
  range.value = await getBodyRange(daysAgoKey(180), todayKey())
  latest.value = await getBodyLatest()
  waterMl.value = await getWater(todayKey())
  recentLogs.value = await getLogsRange(daysAgoKey(7), todayKey())
}
onMounted(load)

const weightSeries = computed(() => toSeries(range.value, 'weightKg'))
const smmSeries = computed(() => toSeries(range.value, 'smmKg'))
const fatSeries = computed(() => toSeries(range.value, 'bodyFatPct'))

function curPrev(series) {
  const n = series.length
  return { cur: n ? series[n - 1].value : null, prev: n > 1 ? series[n - 2].value : null }
}
const w = computed(() => curPrev(weightSeries.value))
const smm = computed(() => curPrev(smmSeries.value))
const fat = computed(() => curPrev(fatSeries.value))

const daysSince = computed(() => (latest.value?.date ? daysBetween(todayKey(), latest.value.date) : null))
const bmiVal = computed(() => bmi(latest.value?.weightKg, height.value))
const fatMass = computed(() => bodyFatMass(latest.value?.weightKg, latest.value?.bodyFatPct))

const weekWorkouts = computed(() => {
  let n = 0
  for (let i = 0; i < 7; i++) if (isWorkoutDay(recentLogs.value[daysAgoKey(i)])) n++
  return n
})

async function saveHeight() {
  if (!(Number(heightInput.value) > 0)) return
  await dbSetHeight(heightInput.value)
  await authStore.loadProfile(authStore.user.uid)
  heightInput.value = ''
  pushToast('키 등록됨', 'info')
}

async function water(delta) {
  waterMl.value = Math.max(0, waterMl.value + delta)
  try {
    await addWater(todayKey(), delta)
  } catch (e) {
    pushToast('실패: ' + (e?.message || e), 'error')
    await load()
  }
}
</script>

<template>
  <div>
    <AppHeader title="내 몸" />

    <div class="px-gutter py-3">
      <!-- 세그먼트 -->
      <div class="mb-4 flex gap-1 rounded-pill bg-surface-2 p-1">
        <button
          v-for="s in segs"
          :key="s.v"
          class="flex-1 rounded-pill py-2 text-sm font-medium transition-colors"
          :class="seg === s.v ? 'bg-accent text-accent-text' : 'text-text-secondary'"
          @click="seg = s.v"
        >
          {{ s.l }}
        </button>
      </div>

      <!-- ── 체성분 ── -->
      <template v-if="seg === 'body'">
        <div v-if="latest" class="mb-3 text-caption text-text-muted">
          최근 측정: {{ latest.date }} ({{ daysSince === 0 ? '오늘' : fromNow(latest.date) }})
        </div>

        <div class="mb-3 grid grid-cols-3 gap-2">
          <MetricCard label="체중" :value="w.cur" unit="kg" :delta="delta(w.cur, w.prev)" />
          <MetricCard label="골격근량" :value="smm.cur" unit="kg" :delta="delta(smm.cur, smm.prev)" good-dir="up" />
          <MetricCard label="체지방률" :value="fat.cur" unit="%" :delta="delta(fat.cur, fat.prev)" good-dir="down" />
        </div>

        <!-- 파생 칩 -->
        <div class="mb-4 flex gap-2">
          <span v-if="fatMass != null" class="num rounded-pill bg-surface-2 px-3 py-1.5 text-caption text-text-secondary">체지방량 {{ fatMass }}kg</span>
          <span v-if="bmiVal != null" class="num rounded-pill bg-surface-2 px-3 py-1.5 text-caption text-text-secondary">BMI {{ bmiVal }}</span>
          <button v-else class="rounded-pill bg-surface-2 px-3 py-1.5 text-caption text-accent" @click="seg = 'body'">키 등록 필요 ↓</button>
        </div>

        <!-- 키 등록 -->
        <div v-if="!height" class="mb-4 flex items-center gap-2 rounded-card bg-surface-1 p-3">
          <span class="text-unit text-text-muted">키(cm)</span>
          <NumberStepper v-model="heightInput" :step="1" unit="cm" />
          <button class="ml-auto rounded-field bg-accent px-4 py-2 text-sm font-medium text-accent-text" @click="saveHeight">저장</button>
        </div>

        <!-- 차트 -->
        <div class="space-y-3">
          <div class="rounded-card bg-surface-1 p-4">
            <div class="mb-1 text-unit text-text-muted">체중 추세 (평활)</div>
            <MiniLineChart :series="ema(weightSeries)" color="accent" />
          </div>
          <div class="rounded-card bg-surface-1 p-4">
            <div class="mb-1 text-unit text-text-muted">골격근량</div>
            <MiniLineChart :series="smmSeries" color="pr" />
          </div>
          <div class="rounded-card bg-surface-1 p-4">
            <div class="mb-1 text-unit text-text-muted">체지방률</div>
            <MiniLineChart :series="fatSeries" color="warn" />
          </div>
        </div>

        <button class="mt-5 w-full rounded-card bg-accent py-4 font-semibold text-accent-text shadow-card transition-transform duration-tap active:scale-[0.99]" @click="entryOpen = true">
          ＋ 체성분 기록
        </button>
      </template>

      <!-- ── 물 ── -->
      <template v-else-if="seg === 'water'">
        <div class="flex flex-col items-center rounded-card bg-surface-1 p-6">
          <ProgressRing :value="waterMl" :target="Number(goals.waterTargetMl) || 2000" unit="ml" label="오늘 수분" color="accent" :size="140" />
          <div class="mt-5 flex gap-3">
            <button class="rounded-field bg-surface-2 px-5 py-3 font-medium text-text-primary active:bg-surface-3" @click="water(250)">+250ml</button>
            <button class="rounded-field bg-surface-2 px-5 py-3 font-medium text-text-primary active:bg-surface-3" @click="water(500)">+500ml</button>
            <button class="rounded-field bg-surface-2 px-4 py-3 text-text-muted active:bg-surface-3" @click="water(-250)">−250</button>
          </div>
        </div>
      </template>

      <!-- ── 목표 ── -->
      <template v-else>
        <div class="space-y-3">
          <div class="rounded-card bg-surface-1 p-4">
            <div class="flex items-center justify-between">
              <span class="text-text-secondary">체중 목표</span>
              <span class="num text-text-primary">{{ w.cur ?? '—' }} → {{ goals.weightTargetKg || '—' }} kg</span>
            </div>
          </div>
          <div class="rounded-card bg-surface-1 p-4">
            <div class="flex items-center justify-between">
              <span class="text-text-secondary">체지방률 목표</span>
              <span class="num text-text-primary">{{ fat.cur ?? '—' }} → {{ goals.bodyFatTarget || '—' }} %</span>
            </div>
          </div>
          <div class="rounded-card bg-surface-1 p-4">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-text-secondary">주간 운동</span>
              <span class="num text-text-primary">{{ weekWorkouts }} / {{ goals.weeklyWorkoutTarget || 4 }}일</span>
            </div>
            <ProgressRing :value="weekWorkouts" :target="Number(goals.weeklyWorkoutTarget) || 4" unit="일" label="" color="accent" :size="80" />
          </div>
          <button class="w-full rounded-field border border-border-subtle py-3 text-text-secondary active:bg-surface-1" @click="router.push('/more')">
            목표 수정 (더보기)
          </button>
        </div>
      </template>
    </div>

    <BodyEntrySheet v-model="entryOpen" :date="todayKey()" @saved="load" />
  </div>
</template>
