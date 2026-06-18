<script setup>
// 세션 구성 화면. draft(로컬) 로 종목/목표/순서를 편집한 뒤
// "운동 시작" 시 activeSession(RTDB) 을 생성하고 started emit.
import { ref, computed, onMounted } from 'vue'
import ExercisePicker from '@/components/record/ExercisePicker.vue'
import PlanExerciseRow from '@/components/record/PlanExerciseRow.vue'
import WeeklyPlanEditor from '@/components/record/WeeklyPlanEditor.vue'
import { getExercise } from '@/data/exercises'
import { getLastForExercise, setActiveSession } from '@/firebase/database'
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
    planned: { targetSets: 3, weight: pl.weight, reps: pl.reps },
    prev
  }
}

onMounted(async () => {
  if (props.seed?.exKeys?.length) {
    for (const k of props.seed.exKeys) {
      draft.value.push(await makeRow(k))
    }
  }
})

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
  </div>
</template>
