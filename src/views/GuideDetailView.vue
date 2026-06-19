<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import MuscleMap from '@/components/guide/MuscleMap.vue'
import ExerciseDemo from '@/components/guide/ExerciseDemo.vue'
import MiniLineChart from '@/components/common/MiniLineChart.vue'
import { getExercise, bodyPartLabels } from '@/data/exercises'
import { muscles } from '@/data/muscles'
import { getLogsRange, getLastForExercise } from '@/firebase/database'
import { exerciseProgressSeries } from '@/utils/progress'
import { plannedFromLast } from '@/utils/session'
import { daysAgoKey, todayKey, formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()

const ex = computed(() => getExercise(route.params.id))
const side = ref('front')

// 가이드 | 내 기록 세그먼트
const tab = ref('guide')
const progress = ref(null)
const nextTarget = ref(null)
const progressLoaded = ref(false)

async function loadProgress() {
  if (progressLoaded.value || !ex.value) return
  const logs = await getLogsRange(daysAgoKey(180), todayKey())
  progress.value = exerciseProgressSeries(logs, ex.value.id)
  const prev = await getLastForExercise(ex.value.id)
  nextTarget.value = prev ? plannedFromLast(ex.value, prev) : null
  progressLoaded.value = true
}
function switchTab(t) {
  tab.value = t
  if (t === 'history') loadProgress()
}

// 주동근 다수가 후면이면 기본 후면 뷰
function defaultSide(e) {
  if (!e) return 'front'
  const views = (e.primaryMuscles || []).map((m) => muscles[m]?.view)
  const back = views.filter((v) => v === 'back').length
  const front = views.filter((v) => v === 'front').length
  return back > front ? 'back' : 'front'
}
watch(
  ex,
  (e) => {
    side.value = defaultSide(e)
  },
  { immediate: true }
)

const primaryList = computed(() => (ex.value?.primaryMuscles || []).map((m) => muscles[m]).filter(Boolean))
const secondaryList = computed(() => (ex.value?.secondaryMuscles || []).map((m) => muscles[m]).filter(Boolean))

// 동작 영상: 종목별 지정 링크(ex.guide.refUrl)가 있으면 그것을, 없으면 YouTube 검색(항상 유효)
const videoUrl = computed(() => {
  if (!ex.value) return ''
  const ref = ex.value.guide?.refUrl
  if (ref) return ref
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.value.name + ' 자세 운동법')
})
</script>

<template>
  <div v-if="ex">
    <AppHeader :title="ex.name" back>
      <template #actions>
        <span class="rounded-pill bg-surface-2 px-2.5 py-1 text-caption text-text-secondary">{{ bodyPartLabels[ex.bodyPart] }}</span>
      </template>
    </AppHeader>

    <div class="px-gutter py-3">
      <!-- 세그먼트 -->
      <div class="mb-4 flex gap-1 rounded-pill bg-surface-2 p-1">
        <button class="flex-1 rounded-pill py-2 text-sm font-medium transition-colors" :class="tab === 'guide' ? 'bg-accent text-accent-text' : 'text-text-secondary'" @click="switchTab('guide')">가이드</button>
        <button class="flex-1 rounded-pill py-2 text-sm font-medium transition-colors" :class="tab === 'history' ? 'bg-accent text-accent-text' : 'text-text-secondary'" @click="switchTab('history')">내 기록</button>
      </div>

      <!-- ── 내 기록 ── -->
      <template v-if="tab === 'history'">
        <template v-if="progress && progress.dates.length">
          <div class="mb-3 grid grid-cols-3 gap-2">
            <div class="rounded-card bg-surface-1 p-3 text-center">
              <div class="text-unit text-text-muted">최고 무게</div>
              <div class="num text-h2 text-text-primary">{{ progress.topWeight[progress.topWeight.length - 1].value }}<span class="text-unit text-text-muted">kg</span></div>
            </div>
            <div class="rounded-card bg-surface-1 p-3 text-center">
              <div class="text-unit text-text-muted">추정 1RM</div>
              <div class="num text-h2 text-accent">{{ progress.e1rm[progress.e1rm.length - 1].value }}<span class="text-unit text-text-muted">kg</span></div>
            </div>
            <div class="rounded-card bg-surface-1 p-3 text-center">
              <div class="text-unit text-text-muted">세션 수</div>
              <div class="num text-h2 text-text-primary">{{ progress.dates.length }}</div>
            </div>
          </div>

          <div v-if="nextTarget" class="mb-3 rounded-card bg-accent-subtle p-3 text-center">
            <span class="text-unit text-text-muted">다음 목표</span>
            <span class="num ml-2 font-semibold text-accent">{{ nextTarget.weight }}kg × {{ nextTarget.reps }}회</span>
          </div>

          <div class="space-y-3">
            <div class="rounded-card bg-surface-1 p-4">
              <div class="mb-1 text-unit text-text-muted">추정 1RM 추세</div>
              <MiniLineChart :series="progress.e1rm" color="accent" />
            </div>
            <div class="rounded-card bg-surface-1 p-4">
              <div class="mb-1 text-unit text-text-muted">세션 볼륨</div>
              <MiniLineChart :series="progress.volume" color="pr" />
            </div>
          </div>

          <div class="mt-4 rounded-card bg-surface-1 p-4">
            <div class="mb-2 text-unit text-text-muted">최근 세션</div>
            <ul class="flex flex-col divide-y divide-border-subtle">
              <li v-for="s in progress.sessions.slice(0, 8)" :key="s.date" class="flex items-center justify-between py-2">
                <span class="text-text-secondary">{{ formatDate(s.date, 'M월 D일') }}</span>
                <span class="num text-text-primary">{{ s.topWeight }}kg · {{ s.sets }}세트 · {{ s.volume.toLocaleString() }}kg</span>
              </li>
            </ul>
          </div>
        </template>
        <div v-else-if="progressLoaded" class="rounded-card bg-surface-1 p-8 text-center">
          <p class="text-text-secondary">아직 이 종목 기록이 없어요.</p>
          <button class="mt-3 rounded-field bg-accent px-4 py-2 font-medium text-accent-text" @click="router.push('/log')">기록하러 가기 →</button>
        </div>
        <div v-else class="py-10 text-center text-text-muted">불러오는 중…</div>
      </template>

      <!-- ── 가이드 ── -->
      <template v-else>
      <!-- 동작 시연 -->
      <ExerciseDemo v-if="ex.demoId" :demo-id="ex.demoId" :label="ex.name" class="mb-3" />
      <!-- 바디맵 -->
      <div class="rounded-card bg-surface-1 p-4">
        <div class="mb-2 flex justify-center gap-2">
          <button
            v-for="s in [{ v: 'front', l: '정면' }, { v: 'back', l: '후면' }]"
            :key="s.v"
            class="rounded-pill px-4 py-1.5 text-sm font-medium transition-colors"
            :class="side === s.v ? 'bg-accent text-accent-text' : 'bg-surface-2 text-text-secondary'"
            @click="side = s.v"
          >
            {{ s.l }}
          </button>
        </div>
        <div class="mx-auto max-w-[240px]">
          <MuscleMap :side="side" :primary="ex.primaryMuscles" :secondary="ex.secondaryMuscles" />
        </div>
        <div class="mt-2 flex justify-center gap-4 text-caption">
          <span class="flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm" style="background:rgb(var(--accent))" /> 주동근</span>
          <span class="flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm" style="background:rgb(var(--accent) / 0.4)" /> 협응근</span>
        </div>
      </div>

      <!-- 동작 영상 -->
      <a
        :href="videoUrl"
        target="_blank"
        rel="noopener"
        class="mt-3 flex items-center justify-center gap-2 rounded-card border border-border-subtle bg-surface-1 py-3 font-medium text-text-secondary transition-colors active:bg-surface-2"
      >
        <span class="text-danger">▶</span> 동작 영상 보기 (YouTube)
      </a>

      <!-- 근육 설명 -->
      <div class="mt-4 rounded-card bg-surface-1 p-4">
        <h2 class="mb-2 text-h2 text-text-primary">타겟 근육</h2>
        <ul class="flex flex-col gap-2.5">
          <li v-for="m in primaryList" :key="m.id" class="flex gap-2">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" style="background:rgb(var(--accent))" />
            <div><span class="font-medium text-text-primary">{{ m.name }}</span><span class="text-text-secondary"> — {{ m.desc }}</span></div>
          </li>
          <li v-for="m in secondaryList" :key="m.id" class="flex gap-2">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" style="background:rgb(var(--accent) / 0.4)" />
            <div><span class="font-medium text-text-secondary">{{ m.name }}</span><span class="text-text-muted"> — {{ m.desc }}</span></div>
          </li>
        </ul>
      </div>

      <!-- 가이드 -->
      <template v-if="ex.guide">
        <div class="mt-4 rounded-card bg-surface-1 p-4">
          <h2 class="mb-2 text-h2 text-text-primary">동작 큐</h2>
          <ol class="flex flex-col gap-2">
            <li v-for="(c, i) in ex.guide.cues" :key="i" class="flex gap-2.5">
              <span class="num flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-accent-subtle text-caption font-semibold text-accent">{{ i + 1 }}</span>
              <span class="pt-0.5 text-text-secondary">{{ c }}</span>
            </li>
          </ol>
        </div>

        <div class="mt-4 rounded-card bg-surface-1 p-4">
          <h2 class="mb-1 text-h2 text-text-primary">이런 느낌이어야</h2>
          <p class="text-text-secondary">{{ ex.guide.feel }}</p>
        </div>

        <div class="mt-4 rounded-card bg-surface-1 p-4">
          <h2 class="mb-2 text-h2 text-text-primary">흔한 실수</h2>
          <ul class="flex flex-col gap-2">
            <li v-for="(m, i) in ex.guide.mistakes" :key="i" class="flex gap-2">
              <span class="shrink-0 text-warn">⚠</span>
              <span class="text-text-secondary">{{ m }}</span>
            </li>
          </ul>
        </div>

        <div class="mt-4 rounded-card bg-surface-1 p-4">
          <h2 class="mb-1 text-h2 text-text-primary">호흡</h2>
          <p class="text-text-secondary">{{ ex.guide.breathing }}</p>
        </div>
      </template>

      <button
        class="mt-5 w-full rounded-card bg-accent py-3.5 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99]"
        @click="router.push('/log')"
      >
        기록하러 가기 →
      </button>
      </template>
    </div>
  </div>

  <div v-else class="px-gutter py-20 text-center">
    <p class="text-text-secondary">운동을 찾을 수 없습니다.</p>
    <button class="mt-4 rounded-field bg-surface-2 px-4 py-2 text-text-primary" @click="router.push('/guide')">가이드로 돌아가기</button>
  </div>
</template>
