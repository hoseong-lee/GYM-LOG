// 세션 러너 보조 유틸 — 목표 프리필 계산, 종목 정렬, 요약 집계.
import { e1rm } from '@/utils/exercise'

// activeSession.exercises 객체맵 → order 정렬된 배열 [{ k, ...ex }]
export function sortedExercises(session) {
  const ex = session?.exercises || {}
  return Object.entries(ex)
    .map(([k, v]) => ({ k, ...v }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

// 직전기록(lastByExercise) + repRange → 목표(planned) 프리필.
// 더블 프로그레션: 직전이 repRange 상한 도달이면 +increment & 하한 reps, 아니면 +1회.
//   prev = { lastWeight, lastReps } | null
//   exercise = { increment, repRange }
export function plannedFromLast(exercise, prev) {
  const step = exercise?.increment || 2.5
  const [repLo, repHi] = exercise?.repRange || [8, 12]
  if (!prev || prev.lastWeight == null) {
    return { weight: 20, reps: repLo }
  }
  const lastWeight = Number(prev.lastWeight) || 0
  const lastReps = Number(prev.lastReps) || repLo
  if (lastReps >= repHi) {
    return { weight: round(lastWeight + step), reps: repLo }
  }
  return { weight: lastWeight, reps: lastReps + 1 }
}

function round(v) {
  return Math.round(v * 100) / 100
}

// 종목의 완료(done) 세트만 정제 → saveStrengthEntry 용 [{weight,reps}]
export function doneSetsOf(ex) {
  return (ex.sets || [])
    .filter((s) => s.done)
    .map((s) => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }))
    .filter((s) => s.reps > 0)
}

// 세션 요약 집계.
//   prMap: { [exKey]: bestE1RM } — flush 전 PR 판정 기준(직전 베스트). 없으면 PR 0.
//   nowMs: 종료 시각(ms) — 기본 Date.now()
// 반환: { durationMin, totalSets, totalVolume, prCount, perExercise[], incomplete[] }
export function sessionStats(session, opts = {}) {
  const list = sortedExercises(session)
  const startedAt = Number(session?.startedAt) || null
  const nowMs = opts.nowMs || Date.now()
  const prCount = Number(opts.prCount) || 0

  let totalSets = 0
  let totalVolume = 0
  const perExercise = []
  const incomplete = []

  for (const ex of list) {
    const done = doneSetsOf(ex)
    const vol = done.reduce((s, x) => s + x.weight * x.reps, 0)
    if (done.length > 0) {
      totalSets += done.length
      totalVolume += vol
      perExercise.push({ name: ex.name, sets: done.length, volume: Math.round(vol) })
    } else {
      incomplete.push({ name: ex.name })
    }
  }

  const durationMin =
    startedAt && nowMs > startedAt ? Math.max(1, Math.round((nowMs - startedAt) / 60000)) : null

  return {
    durationMin,
    totalSets,
    totalVolume: Math.round(totalVolume),
    prCount,
    perExercise,
    incomplete
  }
}

// (보조) 세트 배열 추정 1RM 최대 — 필요 시 사용
export function topE1rm(sets) {
  return (sets || []).reduce((m, s) => Math.max(m, e1rm(s.weight, s.reps)), 0)
}
