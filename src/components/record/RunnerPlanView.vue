<script setup>
// 세션 구성 화면. draft(로컬) 로 종목/목표/순서를 편집한 뒤
// "운동 시작" 시 activeSession(RTDB) 을 생성하고 started emit.
import { ref, computed, onMounted } from 'vue'
import ExercisePicker from '@/components/record/ExercisePicker.vue'
import PlanExerciseRow from '@/components/record/PlanExerciseRow.vue'
import WeeklyPlanEditor from '@/components/record/WeeklyPlanEditor.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import { getExercise } from '@/data/exercises'
import { SEED_SETS, SEED_REPS } from '@/data/splits'
import { getLastForExercise, setActiveSession, saveRoutine } from '@/firebase/database'
import { defaultRestForPattern } from '@/utils/rest'
import { plannedFromLast } from '@/utils/session'
import { resolveExKey } from '@/utils/exercise'
import { todayKey } from '@/utils/date'
import { pushToast } from '@/composables/useToast'
import { serverTimestamp } from 'firebase/database'

const props = defineProps({
  // 시드: 요일/추천 세션에서 시작. { sessionName, bodyParts, exKeys?[] , splitId? } | null
  seed: { type: Object, default: null },
  splitId: { type: String, default: 'ppl' }
})
const emit = defineEmits(['started', 'cancel'])

const draft = ref([]) // [{ exKey,name,bodyPart,restSec,step,planned:{targetSets,weight,reps}, prev }]
const pickerOpen = ref(false)
const weeklyOpen = ref(false)
const starting = ref(false)

// 종목 1개를 draft 항목으로 — lastByExercise 로 프리필
async function makeRow(exKey, fallback = {}) {
  const cat = getExercise(exKey)
  const ex = cat || {
    id: exKey,
    name: fallback.name || exKey,
    bodyPart: fallback.bodyPart || 'chest',
    increment: 2.5,
    repRange: [8, 12],
    pattern: 'isolation'
  }
  const prev = await getLastForExercise(exKey)
  const pl = plannedFromLast(ex, prev)
  return {
    exKey: ex.id,
    name: ex.name,
    bodyPart: ex.bodyPart,
    step: ex.increment || 2.5,
    restSec: defaultRestForPattern(ex.pattern),
    // 전 종목 기본 12회×4세트 — 무게만 직전 기록 기반 추천. (세션 중 자유 조정)
    planned: { targetSets: SEED_SETS, weight: pl.weight, reps: SEED_REPS },
    prev
  }
}

// 저장된 루틴/지난 세션 항목(fullItems) → draft 행. 목표 세트/횟수 복원.
// item.planned.weight 가 있으면(지난세션) 그대로, 없으면(루틴) 직전기록으로 재계산(진행성).
async function makeRowFromItem(item) {
  const cat = getExercise(item.exKey)
  const ex = cat || {
    id: item.exKey,
    name: item.name || item.exKey,
    bodyPart: item.bodyPart || 'chest',
    increment: item.step || 2.5,
    repRange: [8, 12],
    pattern: 'isolation'
  }
  const prev = await getLastForExercise(item.exKey)
  let weight, reps
  if (item.planned?.weight != null) {
    weight = item.planned.weight
    reps = item.planned.reps
  } else {
    const pl = plannedFromLast(ex, prev)
    weight = pl.weight
    reps = item.planned?.reps ?? pl.reps
  }
  return {
    exKey: ex.id,
    name: ex.name,
    bodyPart: ex.bodyPart,
    step: ex.increment || 2.5,
    restSec: item.restSec ?? defaultRestForPattern(ex.pattern),
    planned: { targetSets: item.planned?.targetSets || SEED_SETS, weight, reps },
    prev
  }
}

onMounted(async () => {
  if (props.seed?.fullItems?.length) {
    for (const it of props.seed.fullItems) {
      draft.value.push(await makeRowFromItem(it))
    }
  } else if (props.seed?.exKeys?.length) {
    for (const k of props.seed.exKeys) {
      draft.value.push(await makeRow(k))
    }
  }
})

// ── 루틴으로 저장 ──
const saveOpen = ref(false)
const routineName = ref('')
const savingRoutine = ref(false)
function openSaveRoutine() {
  routineName.value = props.seed?.sessionName && props.seed.sessionName !== '직접 구성' ? props.seed.sessionName : ''
  saveOpen.value = true
}
async function doSaveRoutine() {
  const name = routineName.value.trim()
  if (!name) {
    pushToast('루틴 이름을 입력하세요.', 'error')
    return
  }
  savingRoutine.value = true
  try {
    const items = draft.value.map((r) => ({
      exKey: r.exKey,
      name: r.name,
      bodyPart: r.bodyPart,
      restSec: r.restSec,
      step: r.step,
      planned: { targetSets: r.planned.targetSets, reps: r.planned.reps }
    }))
    await saveRoutine({ name, splitId: props.splitId || null, sessionName: props.seed?.sessionName || null, order: 0, items })
    pushToast(`루틴 '${name}' 저장됨`, 'success')
    saveOpen.value = false
  } catch (e) {
    pushToast('저장 실패: ' + (e?.message || e), 'error')
  } finally {
    savingRoutine.value = false
  }
}

async function addCatalog(ex) {
  if (draft.value.some((r) => r.exKey === ex.id)) {
    pushToast('이미 추가된 종목입니다.', 'info')
    return
  }
  draft.value.push(await makeRow(ex.id))
}
async function addCustom({ name, bodyPart }) {
  const key = resolveExKey(null, name)
  draft.value.push(await makeRow(key, { name, bodyPart }))
}

function updateRow(i, item) {
  draft.value[i] = item
}
function removeRow(i) {
  draft.value.splice(i, 1)
}
function moveRow(i, delta) {
  const j = i + delta
  if (j < 0 || j >= draft.value.length) return
  const [r] = draft.value.splice(i, 1)
  draft.value.splice(j, 0, r)
}

const canStart = computed(() => draft.value.length > 0)

async function start() {
  if (!canStart.value) return
  starting.value = true
  try {
    const exercises = {}
    draft.value.forEach((r, idx) => {
      const sets = []
      for (let s = 0; s < (r.planned.targetSets || 1); s++) {
        sets.push({ done: false, weight: r.planned.weight, reps: r.planned.reps })
      }
      exercises[`e${idx}`] = {
        order: idx,
        exKey: r.exKey,
        name: r.name,
        bodyPart: r.bodyPart,
        restSec: r.restSec,
        planned: { ...r.planned },
        sets,
        savedToLog: false,
        // 직전기록 핵심값(러너 표시용). 없으면 null.
        prev: r.prev
          ? {
              lastWeight: r.prev.lastWeight ?? null,
              lastReps: r.prev.lastReps ?? null,
              bestWeight: r.prev.bestWeight ?? null
            }
          : null
      }
    })
    const session = {
      startedAt: serverTimestamp(),
      status: 'running',
      date: todayKey(),
      sourceSplit: props.seed?.splitId || props.splitId || null,
      sourceSessionName: props.seed?.sessionName || '직접 구성',
      currentIndex: 0,
      exercises
    }
    await setActiveSession(session)
    emit('started')
  } catch (e) {
    pushToast('세션 시작 실패: ' + (e?.message || e), 'error')
  } finally {
    starting.value = false
  }
}
</script>

<template>
  <div>
    <header
      class="sticky top-0 z-40 flex items-center border-b border-border-subtle bg-bg/90 px-gutter backdrop-blur"
      style="padding-top: env(safe-area-inset-top)"
    >
      <div class="flex h-14 w-full items-center gap-2">
        <button class="-ml-2 flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-2" aria-label="뒤로" @click="emit('cancel')">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <h1 class="text-h1 text-text-primary">오늘 루틴 구성</h1>
      </div>
    </header>

    <div class="px-gutter py-3">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-unit text-text-muted">
          {{ seed?.sessionName ? `${seed.sessionName} 시드` : '직접 구성' }}
        </span>
        <button class="text-caption text-accent active:opacity-70" @click="weeklyOpen = true">요일 플랜</button>
      </div>

      <div v-if="!draft.length" class="rounded-card bg-surface-1 p-6 text-center">
        <p class="text-text-secondary">종목을 추가해 오늘 루틴을 만들어보세요.</p>
      </div>

      <div class="flex flex-col gap-2">
        <PlanExerciseRow
          v-for="(r, i) in draft"
          :key="r.exKey + '_' + i"
          :item="r"
          :index="i"
          :count="draft.length"
          @update="updateRow(i, $event)"
          @remove="removeRow(i)"
          @move="moveRow(i, $event)"
        />
      </div>

      <button
        class="mt-3 w-full rounded-field border border-border-subtle py-3.5 text-text-secondary active:bg-surface-1"
        @click="pickerOpen = true"
      >
        ＋ 종목 추가
      </button>

      <button
        v-if="draft.length"
        class="mt-2 w-full rounded-field py-2.5 text-center text-sm text-accent active:opacity-70"
        @click="openSaveRoutine"
      >
        ⭐ 이 구성을 내 루틴으로 저장
      </button>
    </div>

    <!-- sticky 하단 액션 -->
    <div class="fixed inset-x-0 z-30 px-gutter" style="bottom: calc(theme(spacing.tabbar) + env(safe-area-inset-bottom) + 0.5rem)">
      <div class="flex gap-2">
        <button class="rounded-field bg-surface-2 px-5 py-4 font-medium text-text-secondary active:scale-95" @click="emit('cancel')">취소</button>
        <button
          class="flex-1 rounded-field bg-accent py-4 font-semibold text-accent-text shadow-card transition-transform duration-tap active:scale-[0.99] disabled:opacity-50"
          :disabled="!canStart || starting"
          @click="start"
        >
          {{ starting ? '시작 중…' : `운동 시작 (${draft.length}종목)` }}
        </button>
      </div>
    </div>

    <ExercisePicker v-model="pickerOpen" @select="addCatalog" @select-custom="addCustom" />
    <WeeklyPlanEditor v-model="weeklyOpen" :split-id="splitId" />

    <!-- 루틴으로 저장 -->
    <BottomSheet v-model="saveOpen" title="루틴으로 저장">
      <input
        v-model="routineName"
        type="text"
        placeholder="루틴 이름 (예: Push A, 등·이두)"
        class="w-full rounded-field bg-surface-1 px-3 py-3 text-text-primary outline-none placeholder:text-text-muted"
        @keyup.enter="doSaveRoutine"
      />
      <p class="mt-2 text-caption text-text-muted">무게는 저장하지 않고, 시작할 때마다 직전 기록으로 자동 제안됩니다(점진적 과부하).</p>
      <button
        class="mt-4 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text active:scale-[0.99] disabled:opacity-60"
        :disabled="savingRoutine"
        @click="doSaveRoutine"
      >
        {{ savingRoutine ? '저장 중…' : '저장' }}
      </button>
    </BottomSheet>
  </div>
</template>
