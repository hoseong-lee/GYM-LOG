<script setup>
// 활성 세션이 없을 때의 시작 화면.
//  (a) 오늘 요일 추천 루틴으로 시작  (b) 직접 구성  (c) 빠른 기록(보조)  (d) 요일 플랜 편집
import { bodyPartLabels } from '@/data/exercises'

const props = defineProps({
  todaySession: { type: Object, default: null }, // { name, bodyParts } | null
  isRestDay: { type: Boolean, default: false }, // 오늘 요일이 휴식으로 매핑됐는가
  splitLabel: { type: String, default: '' }
})
const emit = defineEmits(['start-routine', 'start-blank', 'quick-log', 'edit-weekly'])
</script>

<template>
  <div class="px-gutter py-3">
    <!-- 오늘 추천 루틴 -->
    <div class="rounded-card bg-surface-1 p-5 shadow-card">
      <div class="flex items-center justify-between">
        <div class="text-unit text-text-muted">오늘 루틴 {{ splitLabel ? `· ${splitLabel}` : '' }}</div>
        <button class="text-caption text-accent active:opacity-70" @click="emit('edit-weekly')">요일 플랜 편집</button>
      </div>

      <template v-if="isRestDay">
        <div class="mt-2 text-h1 font-bold text-text-primary">오늘은 쉬는 날 💤</div>
        <p class="mt-1 text-sm text-text-muted">요일 플랜상 휴식일입니다. 그래도 운동하려면 아래에서 직접 구성하세요.</p>
      </template>
      <template v-else-if="todaySession">
        <div class="mt-1 text-h1 font-bold text-text-primary">{{ todaySession.name }}</div>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="p in todaySession.bodyParts"
            :key="p"
            class="rounded-pill bg-accent-subtle px-2.5 py-1 text-caption font-medium text-accent"
          >
            {{ bodyPartLabels[p] || p }}
          </span>
        </div>
        <button
          class="mt-4 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99]"
          @click="emit('start-routine')"
        >
          이 루틴으로 시작 →
        </button>
      </template>
      <template v-else>
        <div class="mt-2 text-text-secondary">요일 루틴이 설정되지 않았습니다.</div>
        <button class="mt-3 text-caption text-accent active:opacity-70" @click="emit('edit-weekly')">요일 플랜 설정하기</button>
      </template>
    </div>

    <!-- 직접 구성 -->
    <button
      class="mt-4 w-full rounded-card border border-border-subtle py-4 font-semibold text-text-secondary active:bg-surface-1"
      @click="emit('start-blank')"
    >
      ＋ 직접 루틴 구성
    </button>

    <!-- 빠른 기록 (보조) -->
    <button class="mt-3 w-full py-3 text-center text-sm text-text-muted active:text-text-secondary" @click="emit('quick-log')">
      빠른 기록 (한 종목만)
    </button>
  </div>
</template>
