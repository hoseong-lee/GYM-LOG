// 식단 영양 파생 계산 — 저장하지 않고 클라이언트 계산.

// meals 맵/배열 → 합계 { kcal, protein, carb, fat }
export function sumMeals(meals) {
  const list = Array.isArray(meals) ? meals : Object.values(meals || {})
  return list.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (Number(m.kcal) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carb: acc.carb + (Number(m.carb) || 0),
      fat: acc.fat + (Number(m.fat) || 0)
    }),
    { kcal: 0, protein: 0, carb: 0, fat: 0 }
  )
}

// 섭취/목표 → 0~1 비율 (목표 0이면 null=미추적)
export function progress(sum, target) {
  const t = Number(target) || 0
  if (!t) return null
  return Math.min(1.5, (Number(sum) || 0) / t)
}

export const SLOT_LABELS = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식'
}
export const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']
