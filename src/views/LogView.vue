<script setup>
// 기록 탭 — Planfit식 세션 러너.
// mode: idle(시작화면) / plan(구성) / run(러너) / summary(요약)
// activeSession(RTDB) 존재 시 자동 재개. 빠른기록(한 종목)은 보조 유지.
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import SessionStartCard from '@/components/record/SessionStartCard.vue'
import RunnerPlanView from '@/components/record/RunnerPlanView.vue'
import RunnerRunView from '@/components/record/RunnerRunView.vue'
import SessionSummary from '@/components/record/SessionSummary.vue'
import WeeklyPlanEditor from '@/components/record/WeeklyPlanEditor.vue'
import ExercisePicker from '@/components/record/ExercisePicker.vue'
import StrengthEditor from '@/components/record/StrengthEditor.vue'
import CardioEditor from '@/components/record/CardioEditor.vue'
import { getActiveSession, clearActiveSession, getWeeklyPlan } from '@/firebase/database'
import { splits, DEFAULT_SPLIT } from '@/data/splits'
import { exercisesByBodyPart } from '@/data/exercises'
import { sessionStats } from '@/utils/session'
import { resolveExKey } from '@/utils/exercise'
import { todayKey, dayjs } from '@/utils/date'
import { useAuthStore } from '@/stores/auth'
import { pushToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('idle') // idle | plan | run | summary
const session = ref(null) // activeSession 사본(반응형)
const planSeed = ref(null) // 구성 진입 시드
const summaryStats = ref(null)
const loading = ref(true)

const weeklyOpen = ref(false)
const todayMapping = ref(null) // weeklyPlan.days[today] | null

// 빠른 기록(보조)
const pickerOpen = ref(false)
const strengthOpen = ref(false)
const cardioOpen = ref(false)
const quickCurrent = ref(null)

const splitId = computed(() => authStore.split || DEFAULT_SPLIT)
const splitObj = computed(() => splits[splitId.value] || splits[DEFAULT_SPLIT])

// 오늘 요일 매핑 → 세션
const todaySession = computed(() => {
  const m = todayMapping.value
  if (!m || m.rest) return null
  return splitObj.value.sessions.find((s) => s.name === m.sessionName) || null
})
const isRestDay = computed(() => !!todayMapping.value?.rest)

async function refresh() {
  loading.value = true
  try {
    const s = await getActiveSession()
    if (s && s.status === 'running' && s.date === todayKey()) {
      session.value = s
      mode.value = 'run'
    } else if (s) {
      // 어제 등 잔존 세션 → 정리
      await clearActiveSession()
      session.value = null
      mode.value = 'idle'
    } else {
      session.value = null
      mode.value = 'idle'
    }

    const plan = await getWeeklyPlan()
    const dow = dayjs().day()
    if (plan && plan.splitId === splitId.value && plan.days?.[dow]) {
      todayMapping.value = plan.days[dow]
    } else {
      todayMapping.value = splitObj.value.defaultWeekly?.[dow] || null
    }
  } finally {
    loading.value = false
  }
}
onMounted(refresh)

// activeSession 재조회(러너 갱신용) — 자식의 증분 update 후 호출
async function reloadSession() {
  session.value = await getActiveSession()
}

// ── 시작 화면 액션 ──
function startFromRoutine() {
  if (!todaySession.value) return
  planSeed.value = {
    sessionName: todaySession.value.name,
    bodyParts: todaySession.value.bodyParts,
    exKeys: autoPickExercises(todaySession.value.bodyParts),
    splitId: splitId.value
  }
  mode.value = 'plan'
}
function startBlank() {
  planSeed.value = null
  mode.value = 'plan'
}

// 부위별 컴파운드1 + 고립1, 총 4~6종목 상한
function autoPickExercises(bodyParts) {
  const keys = []
  for (const part of bodyParts) {
    const all = exercisesByBodyPart(part)
    const compound = all.find((e) => e.pattern !== 'isolation' && e.pattern !== 'cardio')
    const isolation = all.find((e) => e.pattern === 'isolation')
    if (compound && !keys.includes(compound.id)) keys.push(compound.id)
    if (isolation && !keys.includes(isolation.id)) keys.push(isolation.id)
  }
  return keys.slice(0, 6)
}

// ── 러너 콜백 ──
async function onStarted() {
  await reloadSession()
  mode.value = 'run'
}
function onPlanCancel() {
  mode.value = 'idle'
}
function onRunFinish({ prCount } = {}) {
  summaryStats.value = sessionStats(session.value, { prCount: prCount || 0, nowMs: Date.now() })
  mode.value = 'summary'
}
async function onSummaryClose() {
  await clearActiveSession()
  session.value = null
  summaryStats.value = null
  mode.value = 'idle'
  await refresh()
}
async function onSummaryViewLog() {
  await onSummaryClose()
  router.push('/')
}
// 자식(러너)이 activeSession 을 update 한 뒤 부모 사본 동기화
async function onSessionMutated() {
  await reloadSession()
}
</script>

<template>
  <div>
    <!-- 러너/구성은 자체 헤더 사용 → idle/summary 에서만 공용 헤더 -->
    <template v-if="mode === 'idle' || mode === 'summary'">
      <AppHeader title="기록" />
    </template>

    <!-- idle: 시작 화면 -->
    <SessionStartCard
      v-if="mode === 'idle' && !loading"
      :today-session="todaySession"
      :is-rest-day="isRestDay"
      :split-label="splitObj.label"
      @start-routine="startFromRoutine"
      @start-blank="startBlank"
      @quick-log="pickerOpen = true"
      @edit-weekly="weeklyOpen = true"
    />

    <!-- plan: 세션 구성 -->
    <RunnerPlanView
      v-else-if="mode === 'plan'"
      :seed="planSeed"
      :split-id="splitId"
      @started="onStarted"
      @cancel="onPlanCancel"
    />

    <!-- run: 러너 -->
    <RunnerRunView
      v-else-if="mode === 'run' && session"
      :session="session"
      @finish="onRunFinish"
      @abort="onSummaryClose"
      @mutated="onSessionMutated"
    />

    <!-- summary -->
    <SessionSummary
      v-else-if="mode === 'summary' && summaryStats"
      :stats="summaryStats"
      @close="onSummaryClose"
      @view-log="onSummaryViewLog"
    />

    <!-- 요일 플랜 편집 -->
    <WeeklyPlanEditor v-model="weeklyOpen" :split-id="splitId" @saved="refresh" />

    <!-- 빠른 기록 (보조) -->
    <ExercisePicker
      v-model="pickerOpen"
      @select="
        (ex) => {
          quickCurrent = ex
          ex.bodyPart === 'cardio' ? (cardioOpen = true) : (strengthOpen = true)
        }
      "
      @select-custom="
        ({ name, bodyPart }) => {
          quickCurrent = { id: resolveExKey(null, name), name, bodyPart, increment: 2.5, repRange: [8, 12] }
          bodyPart === 'cardio' ? (cardioOpen = true) : (strengthOpen = true)
        }
      "
    />
    <StrengthEditor v-model="strengthOpen" :exercise="quickCurrent" :date="todayKey()" @saved="() => pushToast('기록 저장됨', 'info')" />
    <CardioEditor v-model="cardioOpen" :exercise="quickCurrent" :date="todayKey()" @saved="() => pushToast('기록 저장됨', 'info')" />
  </div>
</template>
