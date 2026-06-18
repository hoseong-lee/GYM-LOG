<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import MuscleMap from '@/components/guide/MuscleMap.vue'
import { getExercise, bodyPartLabels } from '@/data/exercises'
import { muscles } from '@/data/muscles'

const route = useRoute()
const router = useRouter()

const ex = computed(() => getExercise(route.params.id))
const side = ref('front')

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
</script>

<template>
  <div v-if="ex">
    <AppHeader :title="ex.name" back>
      <template #actions>
        <span class="rounded-pill bg-surface-2 px-2.5 py-1 text-caption text-text-secondary">{{ bodyPartLabels[ex.bodyPart] }}</span>
      </template>
    </AppHeader>

    <div class="px-gutter py-3">
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
          <span class="flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm" style="background:#3D7DFF" /> 주동근</span>
          <span class="flex items-center gap-1"><i class="inline-block h-3 w-3 rounded-sm" style="background:rgba(61,125,255,0.4)" /> 협응근</span>
        </div>
      </div>

      <!-- 근육 설명 -->
      <div class="mt-4 rounded-card bg-surface-1 p-4">
        <h2 class="mb-2 text-h2 text-text-primary">타겟 근육</h2>
        <ul class="flex flex-col gap-2.5">
          <li v-for="m in primaryList" :key="m.id" class="flex gap-2">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" style="background:#3D7DFF" />
            <div><span class="font-medium text-text-primary">{{ m.name }}</span><span class="text-text-secondary"> — {{ m.desc }}</span></div>
          </li>
          <li v-for="m in secondaryList" :key="m.id" class="flex gap-2">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" style="background:rgba(61,125,255,0.4)" />
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
    </div>
  </div>

  <div v-else class="px-gutter py-20 text-center">
    <p class="text-text-secondary">운동을 찾을 수 없습니다.</p>
    <button class="mt-4 rounded-field bg-surface-2 px-4 py-2 text-text-primary" @click="router.push('/guide')">가이드로 돌아가기</button>
  </div>
</template>
