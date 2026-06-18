// 운동 키/계산 유틸 — RTDB 키 안전성과 점진적 과부하 계산.

// RTDB 키 금지문자: . # $ [ ] /  (이 문자가 키에 있으면 SDK 가 throw)
const FORBIDDEN = /[.#$/[\]]/g

function hashCode(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return h
}

// 카탈로그(exercises.js)에 있는 종목은 고정 slug id 를 그대로 쓴다.
// 자유입력(카탈로그 미존재) 종목만 이 함수로 안전 키를 만들어 'custom_' 으로 격리한다.
export function exerciseKey(name) {
  const norm = (name || '')
    .trim()
    .toLowerCase()
    .replace(FORBIDDEN, '_') // 금지문자 제거 (한글은 보존 — RTDB 키 UTF-8 허용)
    .replace(/\s+/g, '_') // 공백 → 단일 '_'
    .replace(/_+/g, '_') // 연속 '_' 축약
    .replace(/^_|_$/g, '') // 양끝 '_' 제거
  const safe = norm || 'x' + Math.abs(hashCode(name || '')).toString(36)
  return 'custom_' + safe
}

// 카탈로그 종목이면 catalog.id, 아니면 정규화 키
export function resolveExKey(catalogItem, rawName) {
  return catalogItem?.id ?? exerciseKey(rawName)
}

// Epley 추정 1RM
export function e1rm(weight, reps) {
  const w = Number(weight) || 0
  const r = Number(reps) || 0
  return w * (1 + r / 30)
}

// 세트 배열에서 추정 1RM 이 가장 높은 세트
export function topSetByE1rm(sets) {
  return (sets || []).reduce(
    (best, s) => (e1rm(s.weight, s.reps) > e1rm(best.weight, best.reps) ? s : best),
    { weight: 0, reps: 0 }
  )
}
