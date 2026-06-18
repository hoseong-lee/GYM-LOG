// 휴식 시간 유틸 — AI 대신 종목 pattern 기반 규칙으로 기본 휴식을 정한다.

// pattern → 기본 휴식(초)
//  대근육 고중량 컴파운드(스쿼트/힌지/데드) 180
//  다관절 컴파운드(프레스/풀/로우) 120
//  단관절 고립 75
//  유산소 0 (러너 미사용)
const REST_BY_PATTERN = {
  squat: 180,
  hinge: 180,
  deadlift: 180,
  'horizontal-push': 120,
  'vertical-push': 120,
  'incline-push': 120,
  'vertical-pull': 120,
  'horizontal-pull': 120,
  isolation: 75,
  cardio: 0
}

export function defaultRestForPattern(pattern) {
  return REST_BY_PATTERN[pattern] ?? 90
}

// 초 → "m:ss" (음수 방어)
export function formatRest(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}
