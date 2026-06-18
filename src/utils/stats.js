// logs 파생 계산 — 출석/스트릭/볼륨. logs 가 권위 데이터.
import { daysBetween, todayKey } from './date'

// 그날 운동일 여부: strength/cardio 항목 존재 OR manualCheck === true
export function isWorkoutDay(dayLog) {
  if (!dayLog) return false
  if (dayLog.manualCheck === true) return true
  const hasStrength = dayLog.strength && Object.keys(dayLog.strength).length > 0
  const hasCardio = dayLog.cardio && Object.keys(dayLog.cardio).length > 0
  return !!(hasStrength || hasCardio)
}

// 근력 항목 총 볼륨 (무게 × 횟수 합)
export function entryVolume(entry) {
  return (entry.sets || []).reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)
}

// 하루 총 볼륨
export function dayVolume(dayLog) {
  if (!dayLog?.strength) return 0
  return Object.values(dayLog.strength).reduce((sum, e) => sum + entryVolume(e), 0)
}

// 하루 운동 부위 집합
export function dayBodyParts(dayLog) {
  const parts = new Set()
  if (dayLog?.strength) Object.values(dayLog.strength).forEach((e) => e.bodyPart && parts.add(e.bodyPart))
  if (dayLog?.cardio && Object.keys(dayLog.cardio).length) parts.add('cardio')
  return [...parts]
}

// 연속 출석 스트릭 (오늘 또는 어제부터 역산). logsMap: { 'YYYY-MM-DD': dayLog }
export function currentStreak(logsMap) {
  let streak = 0
  let cursor = todayKey()
  // 오늘 운동 안 했으면 어제부터 시작 (오늘은 아직 진행중일 수 있음)
  if (!isWorkoutDay(logsMap[cursor])) {
    cursor = shiftDay(cursor, -1)
  }
  while (isWorkoutDay(logsMap[cursor])) {
    streak++
    cursor = shiftDay(cursor, -1)
  }
  return streak
}

function shiftDay(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

// 운동일 수 카운트
export function workoutDayCount(logsMap) {
  return Object.values(logsMap).filter(isWorkoutDay).length
}

// 부위별 마지막 수행일 { bodyPart: 'YYYY-MM-DD' }
export function lastTrainedByPart(logsMap) {
  const result = {}
  Object.entries(logsMap).forEach(([date, log]) => {
    dayBodyParts(log).forEach((part) => {
      if (!result[part] || date > result[part]) result[part] = date
    })
  })
  return result
}

// 부위별 마지막 수행 경과일 { bodyPart: n }
export function daysSincePart(logsMap, parts) {
  const last = lastTrainedByPart(logsMap)
  const out = {}
  parts.forEach((p) => {
    out[p] = last[p] ? daysBetween(todayKey(), last[p]) : null // null = 기록 없음
  })
  return out
}
