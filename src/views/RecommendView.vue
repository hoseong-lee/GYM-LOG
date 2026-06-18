<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { splits, splitList, DEFAULT_SPLIT, cardioGoal } from '@/data/splits'
import { setSplit, getLogsRange } from '@/firebase/database'
import { daysAgoKey, todayKey } from '@/utils/date'
import { daysSincePart } from '@/utils/stats'
import { bodyPartLabels } from '@/data/exercises'
import { pushToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const recentLogs = ref({})

const PARTS = ['chest', 'back', 'shoulder', 'legs', 'arms']

const currentSplitId = computed(() => authStore.split || DEFAULT_SPLIT)
const currentSplit = computed(() => splits[currentSplitId.value] || splits[DEFAULT_SPLIT])

onMounted(async () => {
  recentLogs.value = await getLogsRange(daysAgoKey(21), todayKey())
})

const sinceByPart = computed(() => daysSincePart(recentLogs.value, PARTS))

// 세션 점수 = 구성 부위의 경과일 합 (기록 없으면 큰 값). 가장 오래된 세션 추천.
const todaySession = computed(() => {
  const sessions = currentSplit.value.sessions
  let best = null
  let bestScore = -1
  for (const s of sessions) {
    const score = s.bodyParts.reduce((sum, p) => {
      const d = sinceByPart.value[p]
      return sum + (d === null ? 99 : d)
    }, 0)
    if (score > bestScore) {
      bestScore = score
      best = s
    }
  }
  return best
})

async function selectSplit(id) {
  try {
    await setSplit(id)
    authStore.setProfileSplit(id)
    pushToast(`${splits[id].label} 선택됨`, 'info')
  } catch (e) {
    pushToast('저장 실패: ' + (e?.message || e), 'error')
  }
}

function sinceLabel(p) {
  const d = sinceByPart.value[p]
  if (d === null) return '기록 없음'
  if (d === 0) return '오늘'
  return `${d}일 전`
}
function goLog() {
  router.push('/log')
}
</script>

<template>
  <div>
    <AppHeader title="추천" />

    <div class="px-gutter py-3">
      <!-- 분할 선택 -->
      <div class="mb-4">
        <div class="mb-2 text-unit text-text-muted">분할 방식</div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="s in splitList"
            :key="s.id"
            class="rounded-field px-3 py-2.5 text-left text-sm font-medium transition-colors"
            :class="currentSplitId === s.id ? 'bg-accent text-accent-text' : 'bg-surface-1 text-text-secondary'"
            @click="selectSplit(s.id)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- 오늘 추천 -->
      <div class="rounded-card bg-surface-1 p-5 shadow-card">
        <div class="text-unit text-text-muted">오늘 추천</div>
        <div class="mt-1 text-h1 font-bold text-text-primary">{{ todaySession?.name || '—' }}</div>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="p in todaySession?.bodyParts || []" :key="p" class="rounded-pill bg-accent-subtle px-2.5 py-1 text-caption font-medium text-accent">
            {{ bodyPartLabels[p] }}
          </span>
        </div>
        <button class="mt-4 w-full rounded-field bg-accent py-3 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99]" @click="goLog">
          바로 기록하기 →
        </button>
      </div>

      <!-- 부위별 마지막 수행 -->
      <div class="mt-4 rounded-card bg-surface-1 p-4">
        <div class="mb-2 text-unit text-text-muted">부위별 마지막 수행</div>
        <ul class="flex flex-col divide-y divide-border-subtle">
          <li v-for="p in PARTS" :key="p" class="flex items-center justify-between py-2.5">
            <span class="text-text-primary">{{ bodyPartLabels[p] }}</span>
            <span
              class="num text-sm"
              :class="(sinceByPart[p] === null || sinceByPart[p] >= 7) ? 'font-semibold text-danger' : 'text-text-secondary'"
            >
              {{ sinceLabel(p) }}
              <span v-if="sinceByPart[p] === null || sinceByPart[p] >= 7"> 🔴</span>
            </span>
          </li>
        </ul>
      </div>

      <p class="mt-3 text-center text-caption text-text-muted">
        유산소는 분할과 별개로 주 {{ cardioGoal.weeklyMinutes }}분을 권장합니다.
      </p>
    </div>
  </div>
</template>
