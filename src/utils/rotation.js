// 요일 플랜 "밀림" 로테이션 (순수 함수, 외부 의존 없음 → 테스트 용이).
//
// 핵심: 요일 플랜을 달력 고정이 아니라 "비휴식 세션의 순서 목록(R)"으로 보고,
//       오늘 추천 = R[ (anchor 이후 오늘 이전에 운동한 날 수) mod R.length ].
//       운동한 날에만 카운트가 늘어나므로, 빠진 날은 자동으로 다음 날로 밀린다.
//       (월 가슴 완료 → 화 거름 → 수에 어깨)

// plan.days({0=일..6=토}) → 월요일 시작 순서의 비휴식 sessionName 배열.
export function rotationFromPlanDays(days) {
  if (!days) return []
  const order = [1, 2, 3, 4, 5, 6, 0] // 월·화·수·목·금·토·일
  const out = []
  for (const d of order) {
    const m = days[d]
    if (m && !m.rest && m.sessionName) out.push(m.sessionName)
  }
  return out
}

// anchorKey 이후(포함) ~ beforeKey 이전(미포함) 범위에서 운동한 날 수.
// isWorkoutDay 는 주입(테스트 용이 + utils/stats 순환참조 회피).
export function countWorkoutDays(logsByDate, isWorkoutDay, anchorKey, beforeKey) {
  let n = 0
  for (const k in logsByDate) {
    if (beforeKey && k >= beforeKey) continue
    if (anchorKey && k < anchorKey) continue
    if (isWorkoutDay(logsByDate[k])) n++
  }
  return n
}

// 로테이션 + 완료 일수 → 오늘 추천 sessionName (없으면 null).
export function rotationPick(rotation, completed) {
  const len = rotation.length
  if (!len) return null
  return rotation[(((completed % len) + len) % len)]
}
