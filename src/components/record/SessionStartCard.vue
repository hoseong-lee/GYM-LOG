<script setup>
// 활성 세션이 없을 때의 시작 화면.
//  (a) 오늘 요일 추천 루틴  (b) 내 루틴(저장됨)  (c) 지난 세션 반복  (d) 직접 구성  (e) 빠른 기록  (f) 요일 플랜
import { bodyPartLabels } from '@/data/exercises'

defineProps({
  todaySession: { type: Object, default: null }, // { name, bodyParts } | null
  isRestDay: { type: Boolean, default: false },
  isSuggestion: { type: Boolean, default: false }, // 저장된 플랜이 아닌 분할 기본값 추천
  splitLabel: { type: String, default: '' },
  routines: { type: Array, default: () => [] }, // [{ id, name, items }]
  lastSession: { type: Object, default: null } // { date, parts:[], count } | null
})
const emit = defineEmits(['start-routine', 'start-blank', 'quick-log', 'edit-weekly', 'start-saved', 'repeat-last'])
</script>

<template>
  <div class="px-gutter py-3">
    <!-- 오늘 추천 루틴 -->
    <div class="rounded-card bg-surface-1 p-5 shadow-card">
      <div class="flex items-center justify-between">
        <div class="text-unit text-text-muted">{{ isSuggestion ? '오늘 추천' : '오늘 루틴' }} {{ splitLabel ? `· ${splitLabel}` : '' }}</div>
        <button class="text-caption text-accent active:opacity-70" @click="emit('edit-weekly')">요일 플랜 편집</button>
      </div>

      <!-- 휴식일이어도 막다른 길 없이 시작 가능하게 안내만 표기 -->
      <p v-if="isRestDay" class="mt-2 text-sm text-text-muted">💤 오늘은 플랜상 휴식일 — 그래도 운동하려면 아래에서 바로 시작하세요.</p>

      <template v-if="todaySession">
        <div class="mt-1 text-h1 font-bold text-text-primary">{{ todaySession.name }}</div>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="p in todaySession.bodyParts" :key="p" class="rounded-pill bg-accent-subtle px-2.5 py-1 text-caption font-medium text-accent">
            {{ bodyPartLabels[p] || p }}
          </span>
        </div>
        <button class="mt-4 w-full rounded-field bg-accent py-3.5 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99]" @click="emit('start-routine')">
          이 루틴으로 시작 →
        </button>
      </template>
      <template v-else-if="!isRestDay">
        <div class="mt-2 text-text-secondary">요일 루틴이 설정되지 않았습니다.</div>
        <button class="mt-3 text-caption text-accent active:opacity-70" @click="emit('edit-weekly')">요일 플랜 설정하기</button>
      </template>
    </div>

    <!-- 지난 세션 반복 -->
    <button
      v-if="lastSession"
      class="mt-3 flex w-full items-center gap-3 rounded-card bg-surface-1 p-4 text-left shadow-card active:bg-surface-2"
      @click="emit('repeat-last')"
    >
      <span class="text-xl">↻</span>
      <div class="min-w-0 flex-1">
        <div class="font-medium text-text-primary">지난 세션 반복</div>
        <div class="truncate text-caption text-text-muted">{{ lastSession.date }} · {{ lastSession.parts.join(', ') }} · {{ lastSession.count }}종목</div>
      </div>
      <span class="text-text-muted">›</span>
    </button>

    <!-- 내 루틴 -->
    <div v-if="routines.length" class="mt-3">
      <div class="mb-1.5 text-unit text-text-muted">내 루틴</div>
      <div class="flex flex-col gap-2">
        <button
          v-for="r in routines"
          :key="r.id"
          class="flex items-center gap-3 rounded-card bg-surface-1 p-4 text-left shadow-card active:bg-surface-2"
          @click="emit('start-saved', r)"
        >
          <span class="text-xl">⭐</span>
          <div class="min-w-0 flex-1">
            <div class="font-medium text-text-primary">{{ r.name }}</div>
            <div class="truncate text-caption text-text-muted">{{ (r.items || []).map((i) => i.name).join(', ') }}</div>
          </div>
          <span class="text-text-muted">시작 ›</span>
        </button>
      </div>
    </div>

    <!-- 직접 구성 -->
    <button class="mt-4 w-full rounded-card border border-border-subtle py-4 font-semibold text-text-secondary active:bg-surface-1" @click="emit('start-blank')">
      ＋ 직접 루틴 구성
    </button>

    <!-- 빠른 기록 (보조) -->
    <button class="mt-3 w-full py-3 text-center text-sm text-text-muted active:text-text-secondary" @click="emit('quick-log')">
      빠른 기록 (한 종목만)
    </button>
  </div>
</template>
