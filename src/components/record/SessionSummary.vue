<script setup>
// 세션 요약 화면. stats 는 sessionStats() 결과.
const props = defineProps({
  stats: { type: Object, required: true } // { durationMin, totalSets, totalVolume, prCount, perExercise[], incomplete[] }
})
const emit = defineEmits(['close', 'view-log'])
</script>

<template>
  <div class="px-gutter py-6">
    <div class="mb-5 text-center">
      <div class="text-h1 font-bold text-text-primary">오늘 운동 완료 🎉</div>
      <div class="num mt-1 text-text-secondary">
        <template v-if="stats.durationMin">{{ stats.durationMin }}분 · </template>{{ stats.perExercise.length }}종목 · {{ stats.totalSets }}세트
      </div>
    </div>

    <div class="mb-4 grid grid-cols-2 gap-3">
      <div class="rounded-card bg-surface-1 p-4 shadow-card">
        <div class="text-unit text-text-muted">총 볼륨</div>
        <div class="num text-h2 text-text-primary">{{ stats.totalVolume.toLocaleString() }}<span class="text-unit text-text-muted"> kg</span></div>
      </div>
      <div class="rounded-card bg-surface-1 p-4 shadow-card">
        <div class="text-unit text-text-muted">신기록</div>
        <div class="num text-h2" :class="stats.prCount > 0 ? 'text-pr' : 'text-text-primary'">
          {{ stats.prCount }}<span class="text-unit text-text-muted"> 개</span>
        </div>
      </div>
    </div>

    <div class="rounded-card bg-surface-1 p-4 shadow-card">
      <div class="mb-2 text-unit text-text-muted">종목별</div>
      <ul class="flex flex-col divide-y divide-border-subtle">
        <li v-for="(e, i) in stats.perExercise" :key="i" class="flex items-center justify-between py-2.5">
          <span class="truncate text-text-primary">{{ e.name }}</span>
          <span class="num shrink-0 text-sm text-text-secondary">{{ e.sets }}세트 · {{ e.volume.toLocaleString() }}kg</span>
        </li>
        <li v-if="!stats.perExercise.length" class="py-3 text-center text-sm text-text-muted">완료한 종목이 없습니다.</li>
      </ul>
    </div>

    <div v-if="stats.incomplete.length" class="mt-3 rounded-card bg-surface-1 p-4">
      <div class="text-unit text-warn">⚠ 미완료 {{ stats.incomplete.length }}종목</div>
      <div class="mt-1 text-sm text-text-muted">{{ stats.incomplete.map((x) => x.name).join(', ') }}</div>
    </div>

    <div class="mt-6 flex gap-2">
      <button class="flex-1 rounded-field border border-border-subtle py-3.5 text-text-secondary active:bg-surface-1" @click="emit('view-log')">
        기록 보기
      </button>
      <button class="flex-1 rounded-field bg-accent py-3.5 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99]" @click="emit('close')">
        닫기
      </button>
    </div>
  </div>
</template>
