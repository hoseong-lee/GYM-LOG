<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import NumberStepper from '@/components/common/NumberStepper.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  getLastByExercise,
  setGoals,
  setDietTarget,
  getLogsRange,
  getBodyRange,
  listRoutines,
  deleteRoutine,
  updateRoutine,
  upsertUser
} from '@/firebase/database'
import { getExercise } from '@/data/exercises'
import { e1rm } from '@/utils/exercise'
import { DEFAULT_PLATE_SET } from '@/utils/plate'
import { todayKey, daysAgoKey } from '@/utils/date'
import { pushToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const theme = useThemeStore()

const prBoard = ref([])
const goalOpen = ref(false)

// 루틴 관리
const routines = ref([])
const renameOpen = ref(false)
const renamingId = ref(null)
const renameName = ref('')

// 장비(플레이트) 설정
const plateOpen = ref(false)
const ALL_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]
const plateBarKg = ref(20)
const plateSel = ref([...DEFAULT_PLATE_SET.plates])

async function loadRoutines() {
  routines.value = await listRoutines()
}
async function removeRoutine(id) {
  await deleteRoutine(id)
  await loadRoutines()
  pushToast('루틴 삭제됨', 'info')
}
function openRename(r) {
  renamingId.value = r.id
  renameName.value = r.name
  renameOpen.value = true
}
async function saveRename() {
  const name = renameName.value.trim()
  if (!name) return
  await updateRoutine(renamingId.value, { name })
  await loadRoutines()
  renameOpen.value = false
}

function openPlate() {
  const ps = authStore.profile?.plateSet || DEFAULT_PLATE_SET
  plateBarKg.value = ps.barKg || 20
  plateSel.value = [...(ps.plates || DEFAULT_PLATE_SET.plates)]
  plateOpen.value = true
}
function togglePlate(p) {
  if (plateSel.value.includes(p)) plateSel.value = plateSel.value.filter((x) => x !== p)
  else plateSel.value = [...plateSel.value, p].sort((a, b) => b - a)
}
async function savePlate() {
  try {
    await upsertUser({ plateSet: { barKg: Number(plateBarKg.value) || 20, plates: [...plateSel.value].sort((a, b) => b - a) } })
    await authStore.loadProfile(authStore.user.uid)
    pushToast('장비 설정 저장됨', 'success')
    plateOpen.value = false
  } catch (e) {
    pushToast('저장 실패: ' + (e?.message || e), 'error')
  }
}

// 1RM 계산기
const rmWeight = ref(60)
const rmReps = ref(5)
const rm = computed(() => Math.round(e1rm(rmWeight.value, rmReps.value) * 10) / 10)

// 목표 편집 폼
const form = ref({
  weightTargetKg: '',
  bodyFatTarget: '',
  weeklyWorkoutTarget: '',
  waterTargetMl: '',
  kcal: '',
  protein: '',
  carb: '',
  fat: ''
})

async function loadPR() {
  const map = await getLastByExercise()
  prBoard.value = Object.entries(map)
    .filter(([, v]) => v.bestE1RM)
    .map(([exKey, v]) => ({
      exKey,
      name: getExercise(exKey)?.name || exKey,
      bestWeight: v.bestWeight,
      bestReps: v.bestReps,
      e1rm: Math.round(v.bestE1RM * 10) / 10,
      date: v.bestDate
    }))
    .sort((a, b) => b.e1rm - a.e1rm)
    .slice(0, 12)
}
onMounted(() => {
  loadPR()
  loadRoutines()
})

function openGoals() {
  const g = authStore.profile?.goals || {}
  const d = authStore.profile?.dietTarget || {}
  form.value = {
    weightTargetKg: g.weightTargetKg ?? '',
    bodyFatTarget: g.bodyFatTarget ?? '',
    weeklyWorkoutTarget: g.weeklyWorkoutTarget ?? 4,
    waterTargetMl: g.waterTargetMl ?? 2000,
    kcal: d.kcal ?? '',
    protein: d.protein ?? '',
    carb: d.carb ?? '',
    fat: d.fat ?? ''
  }
  goalOpen.value = true
}

async function saveGoals() {
  try {
    await setGoals({
      weightTargetKg: Number(form.value.weightTargetKg) || 0,
      bodyFatTarget: Number(form.value.bodyFatTarget) || 0,
      weeklyWorkoutTarget: Number(form.value.weeklyWorkoutTarget) || 0,
      waterTargetMl: Number(form.value.waterTargetMl) || 0
    })
    await setDietTarget({
      kcal: form.value.kcal,
      protein: form.value.protein,
      carb: form.value.carb,
      fat: form.value.fat
    })
    await authStore.loadProfile(authStore.user.uid)
    pushToast('목표 저장됨', 'success')
    goalOpen.value = false
  } catch (e) {
    pushToast('저장 실패: ' + (e?.message || e), 'error')
  }
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function exportWorkouts() {
  const logs = await getLogsRange(daysAgoKey(365), todayKey())
  const rows = [['date', 'exercise', 'bodyPart', 'set', 'weight', 'reps']]
  Object.entries(logs)
    .sort()
    .forEach(([date, day]) => {
      Object.values(day.strength || {}).forEach((e) => {
        ;(e.sets || []).forEach((s, i) => rows.push([date, e.name, e.bodyPart, i + 1, s.weight, s.reps]))
      })
    })
  download(`gymlog-workouts-${todayKey()}.csv`, rows.map((r) => r.join(',')).join('\n'))
  pushToast('운동 기록 CSV 다운로드', 'info')
}

async function exportBody() {
  const body = await getBodyRange(daysAgoKey(365), todayKey())
  const rows = [['date', 'weightKg', 'smmKg', 'bodyFatPct', 'bmrKcal']]
  Object.entries(body)
    .sort()
    .forEach(([date, b]) => rows.push([date, b.weightKg ?? '', b.smmKg ?? '', b.bodyFatPct ?? '', b.bmrKcal ?? '']))
  download(`gymlog-body-${todayKey()}.csv`, rows.map((r) => r.join(',')).join('\n'))
  pushToast('체성분 CSV 다운로드', 'info')
}

async function logout() {
  await authStore.logout()
  router.replace('/login')
}

const links = [
  { to: '/attendance', label: '출석 캘린더', icon: '📅' },
  { to: '/guide', label: '운동 가이드', icon: '📖' },
  { to: '/recommend', label: '분할·추천', icon: '🎯' }
]
</script>

<template>
  <div>
    <AppHeader title="더보기">
      <template #actions>
        <button class="flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-1" @click="theme.toggle()">
          <span v-if="theme.isDark">🌙</span><span v-else>☀️</span>
        </button>
      </template>
    </AppHeader>

    <div class="px-gutter py-3">
      <!-- 바로가기 -->
      <div class="mb-4 overflow-hidden rounded-card bg-surface-1">
        <button
          v-for="l in links"
          :key="l.to"
          class="flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3.5 text-left last:border-0 active:bg-surface-2"
          @click="router.push(l.to)"
        >
          <span>{{ l.icon }}</span>
          <span class="text-text-primary">{{ l.label }}</span>
          <span class="ml-auto text-text-muted">›</span>
        </button>
      </div>

      <!-- 내 루틴 -->
      <div v-if="routines.length" class="mb-4 rounded-card bg-surface-1 p-4">
        <h2 class="mb-2 text-h2 text-text-primary">내 루틴</h2>
        <ul class="flex flex-col divide-y divide-border-subtle">
          <li v-for="r in routines" :key="r.id" class="flex items-center gap-2 py-2.5">
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium text-text-primary">{{ r.name }}</div>
              <div class="truncate text-caption text-text-muted">{{ (r.items || []).length }}종목 · {{ (r.items || []).map((i) => i.name).join(', ') }}</div>
            </div>
            <button class="rounded-field px-2 py-1 text-caption text-text-secondary active:bg-surface-2" @click="openRename(r)">이름</button>
            <button class="rounded-field px-2 py-1 text-caption text-danger active:bg-surface-2" @click="removeRoutine(r.id)">삭제</button>
          </li>
        </ul>
      </div>

      <!-- PR 보드 -->
      <div class="mb-4 rounded-card bg-surface-1 p-4">
        <h2 class="mb-2 text-h2 text-text-primary">개인 기록 (PR)</h2>
        <ul v-if="prBoard.length" class="flex flex-col divide-y divide-border-subtle">
          <li v-for="p in prBoard" :key="p.exKey" class="flex items-center justify-between py-2">
            <span class="text-text-secondary">{{ p.name }}</span>
            <span class="num text-text-primary">{{ p.bestWeight }}kg×{{ p.bestReps }} <span class="text-text-muted">(1RM {{ p.e1rm }})</span></span>
          </li>
        </ul>
        <p v-else class="text-caption text-text-muted">근력 기록을 쌓으면 PR이 표시됩니다.</p>
      </div>

      <!-- 1RM 계산기 -->
      <div class="mb-4 rounded-card bg-surface-1 p-4">
        <h2 class="mb-2 text-h2 text-text-primary">1RM 계산기</h2>
        <div class="flex items-center justify-around">
          <NumberStepper v-model="rmWeight" :step="2.5" unit="kg" />
          <NumberStepper v-model="rmReps" :step="1" unit="회" />
        </div>
        <div class="mt-3 text-center">
          <span class="text-unit text-text-muted">추정 1RM</span>
          <div class="num text-num-display text-accent">{{ rm }} <span class="text-unit text-text-muted">kg</span></div>
        </div>
      </div>

      <!-- 설정 -->
      <div class="overflow-hidden rounded-card bg-surface-1">
        <button class="flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3.5 text-left active:bg-surface-2" @click="openGoals">
          <span>🎯</span><span class="text-text-primary">목표 설정 (체중·체지방·운동·물·식단)</span><span class="ml-auto text-text-muted">›</span>
        </button>
        <button class="flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3.5 text-left active:bg-surface-2" @click="openPlate">
          <span>🏋️</span><span class="text-text-primary">장비 설정 (바벨·원판 — 플레이트 계산)</span><span class="ml-auto text-text-muted">›</span>
        </button>
        <button class="flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3.5 text-left active:bg-surface-2" @click="exportWorkouts">
          <span>⬇️</span><span class="text-text-primary">운동 기록 CSV 내보내기</span>
        </button>
        <button class="flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3.5 text-left active:bg-surface-2" @click="exportBody">
          <span>⬇️</span><span class="text-text-primary">체성분 CSV 내보내기</span>
        </button>
        <button class="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface-2" @click="logout">
          <span>🚪</span><span class="text-danger">로그아웃</span>
        </button>
      </div>

      <p class="mt-6 text-center text-caption text-text-muted">GYM LOG · {{ authStore.user?.email }}</p>
    </div>

    <!-- 목표 설정 시트 -->
    <BottomSheet v-model="goalOpen" title="목표 설정">
      <div class="space-y-3">
        <div class="text-unit text-text-muted">신체 목표</div>
        <div class="grid grid-cols-2 gap-2">
          <label class="rounded-field bg-surface-1 px-3 py-2.5"><div class="text-caption text-text-muted">목표 체중(kg)</div><input v-model="form.weightTargetKg" type="number" class="num w-full bg-transparent text-text-primary outline-none" /></label>
          <label class="rounded-field bg-surface-1 px-3 py-2.5"><div class="text-caption text-text-muted">목표 체지방(%)</div><input v-model="form.bodyFatTarget" type="number" class="num w-full bg-transparent text-text-primary outline-none" /></label>
          <label class="rounded-field bg-surface-1 px-3 py-2.5"><div class="text-caption text-text-muted">주간 운동(일)</div><input v-model="form.weeklyWorkoutTarget" type="number" class="num w-full bg-transparent text-text-primary outline-none" /></label>
          <label class="rounded-field bg-surface-1 px-3 py-2.5"><div class="text-caption text-text-muted">물 목표(ml)</div><input v-model="form.waterTargetMl" type="number" class="num w-full bg-transparent text-text-primary outline-none" /></label>
        </div>
        <div class="pt-1 text-unit text-text-muted">식단 목표 (0 = 추적 안 함)</div>
        <div class="grid grid-cols-2 gap-2">
          <label class="rounded-field bg-surface-1 px-3 py-2.5"><div class="text-caption text-text-muted">칼로리(kcal)</div><input v-model="form.kcal" type="number" class="num w-full bg-transparent text-text-primary outline-none" /></label>
          <label class="rounded-field bg-surface-1 px-3 py-2.5"><div class="text-caption text-accent">단백질(g)</div><input v-model="form.protein" type="number" class="num w-full bg-transparent text-text-primary outline-none" /></label>
          <label class="rounded-field bg-surface-1 px-3 py-2.5"><div class="text-caption text-text-muted">탄수(g)</div><input v-model="form.carb" type="number" class="num w-full bg-transparent text-text-primary outline-none" /></label>
          <label class="rounded-field bg-surface-1 px-3 py-2.5"><div class="text-caption text-text-muted">지방(g)</div><input v-model="form.fat" type="number" class="num w-full bg-transparent text-text-primary outline-none" /></label>
        </div>
      </div>
      <button class="mt-4 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text active:scale-[0.99]" @click="saveGoals">저장</button>
    </BottomSheet>

    <!-- 장비 설정 -->
    <BottomSheet v-model="plateOpen" title="장비 설정">
      <div class="mb-3 flex items-center justify-between rounded-field bg-surface-1 px-3 py-3">
        <span class="text-text-secondary">바벨 무게</span>
        <NumberStepper v-model="plateBarKg" :step="1" unit="kg" />
      </div>
      <div class="text-unit text-text-muted">보유 원판 (kg)</div>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="p in ALL_PLATES"
          :key="p"
          class="num rounded-pill px-3.5 py-2 text-sm font-medium transition-colors"
          :class="plateSel.includes(p) ? 'bg-accent text-accent-text' : 'bg-surface-1 text-text-secondary'"
          @click="togglePlate(p)"
        >
          {{ p }}
        </button>
      </div>
      <button class="mt-4 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text active:scale-[0.99]" @click="savePlate">저장</button>
    </BottomSheet>

    <!-- 루틴 이름 변경 -->
    <BottomSheet v-model="renameOpen" title="루틴 이름 변경">
      <input
        v-model="renameName"
        type="text"
        class="w-full rounded-field bg-surface-1 px-3 py-3 text-text-primary outline-none"
        @keyup.enter="saveRename"
      />
      <button class="mt-4 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text active:scale-[0.99]" @click="saveRename">저장</button>
    </BottomSheet>
  </div>
</template>
