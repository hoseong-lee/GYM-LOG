<script setup>
// 세션 러너 본체. 상태기계 호스트.
//  RUNNING_SET → (세트 체크) → RESTING → (끝/스킵) → 다음 세트 / 다음 종목 / 요약
// 세트 체크는 activeSession 증분 update. 종목 완료 시 saveStrengthEntry 로 flush.
import { ref, computed, watch } from 'vue'
import SetRow from '@/components/record/SetRow.vue'
import RestOverlay from '@/components/record/RestOverlay.vue'
import ExercisePicker from '@/components/record/ExercisePicker.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import ExerciseDemo from '@/components/guide/ExerciseDemo.vue'
import MuscleMap from '@/components/guide/MuscleMap.vue'
import { bodyPartLabels, getExercise } from '@/data/exercises'
import { muscles } from '@/data/muscles'
import { updateActiveSession, saveStrengthEntry } from '@/firebase/database'
import { sortedExercises, doneSetsOf } from '@/utils/session'
import { defaultRestForPattern, formatRest } from '@/utils/rest'
import { resolveExKey } from '@/utils/exercise'
import { DEFAULT_PLATE_SET } from '@/utils/plate'
import { useAuthStore } from '@/stores/auth'
import { pushToast } from '@/composables/useToast'

const props = defineProps({
  session: { type: Object, required: true } // activeSession (반응형 — 부모가 갱신)
})
const emit = defineEmits(['finish', 'abort', 'mutated'])

const authStore = useAuthStore()
const plateSet = computed(() => authStore.profile?.plateSet || DEFAULT_PLATE_SET)

// activeSession 증분 update 후 부모에게 재조회 신호.
async function mutate(patch) {
  await updateActiveSession(patch)
  emit('mutated')
}

// ── 파생 ──
const list = computed(() => sortedExercises(props.session))
const total = computed(() => list.value.length)
const idx = computed(() => Math.min(props.session.currentIndex || 0, Math.max(0, total.value - 1)))
const current = computed(() => list.value[idx.value] || null)
const currentSets = computed(() => current.value?.sets || [])

// 현재 진행 중(첫 미완료) 세트 인덱스. 모두 done 이면 -1
const currentSetIndex = computed(() => currentSets.value.findIndex((s) => !s.done))

// 경과 시간(초) — 1초마다 갱신용 틱
const elapsed = ref(0)
let elapsedTimer = null
function startElapsed() {
  stopElapsed()
  const base = Number(props.session.startedAt) || Date.now()
  const update = () => {
    elapsed.value = Math.max(0, Math.floor((Date.now() - base) / 1000))
  }
  update()
  elapsedTimer = setInterval(update, 1000)
}
function stopElapsed() {
  if (elapsedTimer) clearInterval(elapsedTimer)
  elapsedTimer = null
}
startElapsed()

const elapsedLabel = computed(() => {
  const m = Math.floor(elapsed.value / 60)
  const s = elapsed.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

// ── 휴식 오버레이 ──
const restOpen = ref(false)
const restSeconds = ref(90)
const restIsLast = ref(false)
const restNextLabel = ref('')

// ── PR 누적 (요약용) ──
const prCount = ref(0)

// ── 가이드 시트 ──
const guideOpen = ref(false)
const guideEx = computed(() => getExercise(current.value?.exKey || '') || null)
const guide = computed(() => guideEx.value?.guide || null)
const demoId = computed(() => guideEx.value?.demoId || '')
// 타겟 근육 모형 — 주동근이 후면에 많으면 후면도(默)로 자동 전환, 사용자가 토글 가능
const muscleSide = ref('front')
const hasMuscleMap = computed(() => (guideEx.value?.primaryMuscles || []).length > 0)
watch(
  guideEx,
  (e) => {
    if (!e) return
    const views = (e.primaryMuscles || []).map((m) => muscles[m]?.view)
    const back = views.filter((v) => v === 'back').length
    const front = views.filter((v) => v === 'front').length
    muscleSide.value = back > front ? 'back' : 'front'
  },
  { immediate: true }
)

// ── 추가 종목 picker ──
const pickerOpen = ref(false)

function setRowState(i) {
  if (currentSets.value[i]?.done) return 'done'
  if (i === currentSetIndex.value) return 'current'
  return 'pending'
}

// 프리필 칩용 — i번째 세트 이전의 마지막 완료 세트 값
function lastDoneSet(i) {
  const sets = currentSets.value
  for (let j = i - 1; j >= 0; j--) {
    if (sets[j]?.done) return { weight: sets[j].weight, reps: sets[j].reps }
  }
  return null
}

// 현재 종목의 RTDB 키
function curKey() {
  return current.value?.k
}

// 세트 값 수정(스테퍼) — 진행 중 세트만
async function onUpdateSet(i, newSet) {
  const k = curKey()
  if (!k) return
  await mutate({
    [`exercises/${k}/sets/${i}/weight`]: Number(newSet.weight) || 0,
    [`exercises/${k}/sets/${i}/reps`]: Number(newSet.reps) || 0
  })
}

// 세트 체크 → done 기록 + 휴식 시작
async function onCheck(i, payload) {
  const k = curKey()
  if (!k) return
  // 휴식 분기 판단은 update 전(stale) 데이터로 — i번을 done 으로 간주하고 제외 계산
  const remainingAfter = currentSets.value.filter((s, j) => j !== i && !s.done).length
  restIsLast.value = remainingAfter === 0
  if (remainingAfter > 0) {
    const next = currentSets.value.find((s, j) => j !== i && !s.done)
    restNextLabel.value = next ? `${next.weight}kg × ${next.reps}회` : ''
  } else {
    const nextEx = list.value[idx.value + 1]
    restNextLabel.value = nextEx ? `${nextEx.name}` : '세션 종료'
  }
  restSeconds.value = current.value?.restSec || 90

  await mutate({
    [`exercises/${k}/sets/${i}/weight`]: payload.weight,
    [`exercises/${k}/sets/${i}/reps`]: payload.reps,
    [`exercises/${k}/sets/${i}/done`]: true,
    [`exercises/${k}/sets/${i}/doneAt`]: Date.now()
  })
  restOpen.value = true
}

async function onUncheck(i) {
  const k = curKey()
  if (!k) return
  await mutate({ [`exercises/${k}/sets/${i}/done`]: false })
}

// 종목 완료 → logs flush (중복 가드)
async function flushExercise(ex) {
  if (!ex || ex.savedToLog) return
  const done = doneSetsOf(ex)
  if (done.length === 0) return // 미완료 종목 미기록
  try {
    const { isPR } = await saveStrengthEntry({
      date: props.session.date,
      exKey: ex.exKey,
      name: ex.name,
      bodyPart: ex.bodyPart,
      sets: done
    })
    if (isPR) {
      prCount.value += 1
      pushToast('🎉 신기록! ' + ex.name, 'success', 4000)
    }
    await mutate({ [`exercises/${ex.k}/savedToLog`]: true })
  } catch (e) {
    pushToast('저장 실패: ' + (e?.message || e), 'error')
  }
}

// 휴식 종료/스킵 후 분기
async function afterRest() {
  restOpen.value = false
  if (!restIsLast.value) return // 같은 종목 다음 세트로 (currentSetIndex 자동 갱신)
  // 종목 완료 → flush 후 다음 종목/요약
  const ex = current.value
  await flushExercise(ex)
  await goNextExercise()
}

async function goNextExercise() {
  if (idx.value + 1 >= total.value) {
    await finish()
    return
  }
  await mutate({ currentIndex: idx.value + 1 })
}

// 종목 네비 — 이전
async function prevExercise() {
  if (idx.value <= 0) return
  await mutate({ currentIndex: idx.value - 1 })
}
// 종목 네비 — 다음(수동). 현재 종목 done 세트 있으면 flush
async function nextExerciseManual() {
  await flushExercise(current.value)
  await goNextExercise()
}

// 세트 추가/삭제
async function addSet() {
  const k = curKey()
  if (!k) return
  const last = currentSets.value[currentSets.value.length - 1] || { weight: 20, reps: 10 }
  const newSets = [...currentSets.value.map((s) => ({ ...s })), { done: false, weight: last.weight, reps: last.reps }]
  await mutate({ [`exercises/${k}/sets`]: newSets })
}
// 세션 종료 — 모든 종목 flush 후 요약
const finishing = ref(false)
async function finish() {
  if (finishing.value) return
  finishing.value = true
  stopElapsed()
  try {
    for (const ex of list.value) {
      await flushExercise(ex)
    }
    emit('finish', { prCount: prCount.value })
  } finally {
    finishing.value = false
  }
}

// 진행 중 종목에 새 종목 추가 (러너 중에도)
async function addCatalogExercise(catEx) {
  if (list.value.some((e) => e.exKey === catEx.id)) {
    pushToast('이미 추가된 종목입니다.', 'info')
    return
  }
  await appendExercise(catEx)
}
async function addCustomExercise({ name, bodyPart }) {
  const key = resolveExKey(null, name)
  await appendExercise({ id: key, name, bodyPart, increment: 2.5, repRange: [8, 12], pattern: 'isolation' })
}
async function appendExercise(ex) {
  const order = list.value.length
  const k = `e${Date.now().toString(36)}`
  const w = 20
  const r = (ex.repRange && ex.repRange[0]) || 10
  const sets = [0, 1, 2].map(() => ({ done: false, weight: w, reps: r }))
  await mutate({
    [`exercises/${k}`]: {
      order,
      exKey: ex.id,
      name: ex.name,
      bodyPart: ex.bodyPart,
      restSec: defaultRestForPattern(ex.pattern),
      planned: { targetSets: 3, weight: w, reps: r },
      sets,
      savedToLog: false
    }
  })
}

// 종목 진행 도트
const progressDots = computed(() => list.value.map((_, i) => i <= idx.value))
</script>

<template>
  <div>
    <!-- 헤더: 종료 / 진행 / 경과 -->
    <header
      class="sticky top-0 z-40 flex items-center border-b border-border-subtle bg-bg/90 px-gutter backdrop-blur"
      style="padding-top: env(safe-area-inset-top)"
    >
      <div class="flex h-14 w-full items-center gap-3">
        <button class="-ml-1 flex h-tap items-center justify-center rounded-pill px-2 text-sm font-medium text-danger active:bg-surface-2" @click="finish">
          ✕ 종료
        </button>
        <div class="flex flex-1 items-center justify-center gap-1">
          <span
            v-for="(on, i) in progressDots"
            :key="i"
            class="h-1.5 rounded-pill transition-all"
            :class="on ? 'w-5 bg-accent' : 'w-2 bg-surface-3'"
          />
        </div>
        <span class="num shrink-0 text-sm text-text-muted">{{ idx + 1 }}/{{ total }} · {{ elapsedLabel }}</span>
      </div>
    </header>

    <div v-if="current" class="px-gutter py-4 pb-40">
      <!-- 현재 종목 -->
      <div class="mb-3">
        <div class="flex items-center gap-2">
          <h2 class="text-h1 font-bold text-text-primary">{{ current.name }}</h2>
          <span class="text-unit text-text-muted">{{ bodyPartLabels[current.bodyPart] || current.bodyPart }}</span>
        </div>
        <div class="num mt-1 flex items-center gap-3 text-unit text-text-secondary">
          <span>목표 {{ current.planned.weight }}kg × {{ current.planned.reps }} · {{ current.planned.targetSets }}세트</span>
          <span class="text-text-muted">휴식 {{ formatRest(current.restSec) }}</span>
        </div>
        <button v-if="guide" class="mt-1 text-caption text-accent active:opacity-70" @click="guideOpen = true">가이드 보기 ▸</button>
      </div>

      <!-- 세트 리스트 -->
      <div class="flex flex-col gap-2">
        <SetRow
          v-for="(s, i) in currentSets"
          :key="i"
          :set="s"
          :index="i"
          :state="setRowState(i)"
          :step="current.step || getExercise(current.exKey)?.increment || 2.5"
          :plate-set="getExercise(current.exKey)?.equipment === 'barbell' ? plateSet : null"
          :prev-record="current.prev"
          :last-set-vals="lastDoneSet(i)"
          @check="onCheck(i, $event)"
          @uncheck="onUncheck(i)"
          @update="onUpdateSet(i, $event)"
        />
      </div>

      <div class="mt-3 flex gap-2">
        <button class="flex-1 rounded-field border border-border-subtle py-2.5 text-sm text-text-secondary active:bg-surface-1" @click="addSet">＋ 세트 추가</button>
        <button class="rounded-field border border-border-subtle px-4 py-2.5 text-sm text-text-secondary active:bg-surface-1" @click="pickerOpen = true">＋ 종목</button>
      </div>

      <!-- 직전 기록 -->
      <div v-if="current.prev && current.prev.lastWeight != null" class="num mt-3 text-center text-caption text-text-muted">
        직전 {{ current.prev.lastWeight }}×{{ current.prev.lastReps }}
        <template v-if="current.prev.bestWeight"> · PR {{ current.prev.bestWeight }}kg</template>
      </div>
    </div>

    <!-- 종목 네비 -->
    <div class="fixed inset-x-0 z-30 px-gutter bottom-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom)+0.5rem)]">
      <div class="flex gap-2">
        <button
          class="flex-1 rounded-field bg-surface-2 py-3.5 font-medium text-text-secondary transition-transform active:scale-95 disabled:opacity-40"
          :disabled="idx <= 0"
          @click="prevExercise"
        >
          ◀ 이전
        </button>
        <button
          class="flex-1 rounded-field bg-surface-2 py-3.5 font-medium text-text-secondary transition-transform active:scale-95"
          @click="nextExerciseManual"
        >
          {{ idx + 1 >= total ? '종료 ▶' : '다음 ▶' }}
        </button>
      </div>
    </div>

    <!-- 휴식 오버레이 -->
    <RestOverlay
      v-model="restOpen"
      :seconds="restSeconds"
      :is-last-set="restIsLast"
      :next-label="restNextLabel"
      @done="afterRest"
      @skip="afterRest"
    />

    <!-- 가이드 시트 -->
    <BottomSheet v-model="guideOpen" :title="current?.name || '가이드'">
      <div class="flex flex-col gap-4 pb-3">
        <!-- 동작 시연 + 타겟 근육 모형 -->
        <div v-if="demoId || hasMuscleMap" class="flex gap-3">
          <ExerciseDemo v-if="demoId" :demo-id="demoId" class="min-w-0 flex-1" />
          <div v-if="hasMuscleMap" class="flex w-[120px] shrink-0 flex-col items-center rounded-card bg-surface-2 p-2">
            <div class="mx-auto w-full max-w-[92px]">
              <MuscleMap :side="muscleSide" :primary="guideEx.primaryMuscles" :secondary="guideEx.secondaryMuscles || []" />
            </div>
            <div class="mt-1.5 flex gap-1">
              <button
                v-for="s in [{ v: 'front', l: '정면' }, { v: 'back', l: '후면' }]"
                :key="s.v"
                class="rounded-pill px-2 py-0.5 text-caption font-medium transition-colors"
                :class="muscleSide === s.v ? 'bg-accent text-accent-text' : 'bg-surface-1 text-text-secondary'"
                @click="muscleSide = s.v"
              >
                {{ s.l }}
              </button>
            </div>
          </div>
        </div>

        <!-- 가이드 텍스트 (가독성: 카드 분리 + 줄간격 + 단계 배지) -->
        <template v-if="guide">
          <div v-if="guide.target" class="rounded-card bg-surface-1 p-3">
            <div class="mb-1 text-unit font-semibold text-accent">🎯 타깃</div>
            <p class="leading-relaxed text-text-secondary">{{ guide.target }}</p>
          </div>
          <div v-if="guide.cues?.length" class="rounded-card bg-surface-1 p-3">
            <div class="mb-2 text-unit font-semibold text-text-primary">동작 순서</div>
            <ol class="flex flex-col gap-2.5">
              <li v-for="(c, i) in guide.cues" :key="i" class="flex gap-2.5">
                <span class="num flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-accent-subtle text-caption font-semibold text-accent">{{ i + 1 }}</span>
                <span class="leading-relaxed text-text-secondary">{{ c }}</span>
              </li>
            </ol>
          </div>
          <div v-if="guide.mistakes?.length" class="rounded-card bg-surface-1 p-3">
            <div class="mb-2 text-unit font-semibold text-warn">흔한 실수</div>
            <ul class="flex flex-col gap-2">
              <li v-for="(m, i) in guide.mistakes" :key="i" class="flex gap-2">
                <span class="shrink-0 text-warn">⚠</span>
                <span class="leading-relaxed text-text-secondary">{{ m }}</span>
              </li>
            </ul>
          </div>
          <div v-if="guide.breathing" class="rounded-card bg-surface-1 p-3">
            <div class="mb-1 text-unit font-semibold text-text-primary">호흡</div>
            <p class="leading-relaxed text-text-secondary">{{ guide.breathing }}</p>
          </div>
        </template>
      </div>
    </BottomSheet>

    <!-- 종목 추가 picker -->
    <ExercisePicker v-model="pickerOpen" @select="addCatalogExercise" @select-custom="addCustomExercise" />
  </div>
</template>
