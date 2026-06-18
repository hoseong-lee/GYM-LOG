// 종목별 진행 시리즈 — logs 범위에서 exKey 필터 → 날짜별 1포인트로 압축. 저장 없음.
import { e1rm, topSetByE1rm } from '@/utils/exercise'

// logsRange = { 'YYYY-MM-DD': dayLog } → 종목 exKey 의 날짜별 추세
// 같은 날 복수 entry: volume 합산, weight/e1rm 은 max 머지.
export function exerciseProgressSeries(logsRange, exKey) {
  const byDate = {}
  Object.entries(logsRange || {}).forEach(([date, day]) => {
    Object.values(day?.strength || {}).forEach((e) => {
      if (e.exKey !== exKey) return
      const top = topSetByE1rm(e.sets)
      const vol = (e.sets || []).reduce((s, x) => s + (Number(x.weight) || 0) * (Number(x.reps) || 0), 0)
      const cur = byDate[date] || { topWeight: 0, e1rm: 0, volume: 0, sets: 0 }
      byDate[date] = {
        topWeight: Math.max(cur.topWeight, Number(top.weight) || 0),
        e1rm: Math.max(cur.e1rm, e1rm(top.weight, top.reps)),
        volume: cur.volume + vol,
        sets: cur.sets + (e.sets || []).length
      }
    })
  })
  const dates = Object.keys(byDate).sort()
  const round1 = (v) => Math.round(v * 10) / 10
  return {
    dates,
    topWeight: dates.map((d) => ({ date: d, value: round1(byDate[d].topWeight) })),
    e1rm: dates.map((d) => ({ date: d, value: round1(byDate[d].e1rm) })),
    volume: dates.map((d) => ({ date: d, value: Math.round(byDate[d].volume) })),
    sessions: dates.map((d) => ({ date: d, ...byDate[d] })).reverse() // 최신순
  }
}
