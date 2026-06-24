<script setup>
// 기록 탭 — Planfit식 세션 러너.
// mode: idle(시작화면) / plan(구성) / run(러너) / summary(요약)
// activeSession(RTDB) 존재 시 자동 재개. 빠른기록(한 종목)은 보조 유지.
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
import { getActiveSession, clearActiveSession, getWeeklyPlan, listRoutines, getLogsRange } from '@/firebase/database'
import { splits, DEFAULT_SPLIT, SEED_SETS, SEED_REPS } from '@/data/splits'
import { exercisesByBodyPart, bodyPartLabels } from '@/data/exercises'
import { sessionStats, sessionFromDayLog } from '@/utils/session'
import { dayBodyParts, isWorkoutDay } from '@/utils/stats'
import { resolveExKey } from '@/utils/exercise'
import { todayKey, daysAgoKey, dayjs } from '@/utils/date'
import { rotationFromPlanDays, countWorkoutDays, rotationPick } from '@/utils/rotation'
import { immersive } from '@/composables/useImmersive'
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
const routines = ref([])
const lastSession = ref(null) // { date, parts, count }
let lastDayLog = null // 지난 세션 반복용 원본

// 빠른 기록(보조)
const pickerOpen = ref(false)
const strengthOpen = ref(false)
const cardioOpen = ref(false)
const quickCurrent = ref(null)

const splitId = computed(() => authStore.split || DEFAULT_SPLIT)
const splitObj = computed(() => splits[splitId.value] || splits[DEFAULT_SPLIT])

// 오늘 추천 세션 — 요일 플랜을 "밀림 로테이션"으로 해석(빠진 날만큼 자동 이월).
const todaySession = ref(null) // { name, bodyParts, exercises? } | null
const isRestDay = ref(false) // 오늘 요일이 플랜상 휴식일 (밀림과 별개로 배너 표기용)
const isSuggestion = ref(false) // 저장된 플랜이 아닌 분할 기본값 기반 추천일 때 true

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
    const usingSaved = !!(plan && plan.splitId === splitId.value && plan.days)
    const planDays = usingSaved ? plan.days : splitObj.value.defaultWeekly || null
    isSuggestion.value = !usingSaved
    isRestDay.value = !!planDays?.[dow]?.rest

    // 밀림 로테이션 — anchor(플랜 저장일) 이후 "운동한 날 수" mod 로테이션 길이.
    // 빠진 날엔 카운트가 안 늘어 다음 날로 자동 이월된다.
    const rotation = rotationFromPlanDays(planDays)
    const anchorKey = usingSaved && plan.updatedAt ? dayjs(plan.updatedAt).format('YYYY-MM-DD') : null
    const rangeStart = anchorKey && anchorKey < daysAgoKey(30) ? anchorKey : daysAgoKey(30)

    // 내 루틴 + 지난 세션(최근 근력 기록일)
    routines.value = await listRoutines()
    const recent = await getLogsRange(rangeStart, todayKey())

    const completed = countWorkoutDays(recent, isWorkoutDay, anchorKey, todayKey())
    const recName = rotationPick(rotation, completed)
    todaySession.value = recName ? splitObj.value.sessions.find((s) => s.name === recName) || null : null
    lastSession.value = null
    lastDayLog = null
    const days = Object.keys(recent).sort().reverse()
    for (const d of days) {
      const log = recent[d]
      if (log?.strength && Object.keys(log.strength).length) {
        lastDayLog = log
        lastSession.value = {
          date: d,
          parts: dayBodyParts(log).map((p) => bodyPartLabels[p] || p),
          count: Object.keys(log.strength).length
        }
        break
      }
    }
  } finally {
    loading.value = false
  }
}
onMounted(refresh)

// 운동 흐름(구성/러너/요약) 동안 글로벌 탭바 숨김 → 공간 확보 + 실수 이탈 방지.
watch(mode, (m) => { immersive.value = m !== 'idle' }, { immediate: true })
onUnmounted(() => { immersive.value = false })

// 저장된 루틴으로 시작
function startSavedRoutine(routine) {
  planSeed.value = { sessionName: routine.name, fullItems: routine.items || [], splitId: splitId.value }
  mode.value = 'plan'
}
// 지난 세션 반복
function repeatLast() {
  if (!lastDayLog) return
  planSeed.value = { sessionName: '지난 세션 반복', fullItems: sessionFromDayLog(lastDayLog), splitId: splitId.value }
  mode.value = 'plan'
}

// activeSession 재조회(러너 갱신용) — 자식의 증분 update 후 호출
async function reloadSession() {
  session.value = await getActiveSession()
}

// ── 시작 화면 액션 ──
function startFromRoutine() {
  if (!todaySession.value) return
  // 분할 세션에 종목 시드가 있으면 그대로(전 종목 12회×4세트), 없으면 부위 기반 autoPick
  const seedEx = todaySession.value.exercises
  planSeed.value = {
    sessionName: todaySession.value.name,
    bodyParts: todaySession.value.bodyParts,
    ...(seedEx?.length
      ? { fullItems: seedEx.map((k) => ({ exKey: k, planned: { targetSets: SEED_SETS, reps: SEED_REPS } })) }
      : { exKeys: autoPickExercises(todaySession.value.bodyParts) }),
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
      :is-suggestion="isSuggestion"
      :split-label="splitObj.label"
      :routines="routines"
      :last-session="lastSession"
      @start-routine="startFromRoutine"
      @start-blank="startBlank"
      @start-saved="startSavedRoutine"
      @repeat-last="repeatLast"
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
