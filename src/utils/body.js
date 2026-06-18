// 체성분 파생 계산 — 저장하지 않고 클라이언트 계산 (stats.js 컨벤션 동형).

export function bmi(weightKg, heightCm) {
  const w = Number(weightKg) || 0
  const h = Number(heightCm) || 0
  if (!w || !h) return null
  const m = h / 100
  return Math.round((w / (m * m)) * 10) / 10
}

export function bodyFatMass(weightKg, bodyFatPct) {
  const w = Number(weightKg) || 0
  const p = Number(bodyFatPct) || 0
  if (!w || !p) return null
  return Math.round(w * (p / 100) * 10) / 10
}

// 현재-이전 변화량 (소수 1자리)
export function delta(cur, prev) {
  if (cur == null || prev == null) return null
  return Math.round((cur - prev) * 10) / 10
}

// { 'YYYY-MM-DD': {field..} } → [{ date, value }] (오름차순, 값 있는 항목만)
export function toSeries(map, field) {
  return Object.entries(map || {})
    .filter(([, v]) => v && v[field] != null && v[field] !== '')
    .map(([date, v]) => ({ date, value: Number(v[field]) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

// 지수이동평균 (추세 평활). series=[{date,value}] → [{date,value(ema)}]
export function ema(series, alpha = 0.3) {
  let prev = null
  return series.map((p) => {
    prev = prev == null ? p.value : alpha * p.value + (1 - alpha) * prev
    return { date: p.date, value: Math.round(prev * 10) / 10 }
  })
}
