// 바벨 한쪽에 끼울 원판 조합 (탐욕 알고리즘). 순수 함수, 저장 없음.
// target = 총 무게(바 포함), barKg = 바 무게, plates = 보유 원판(kg) 목록.
export function solvePlates(target, barKg = 20, plates = [25, 20, 15, 10, 5, 2.5, 1.25]) {
  const t = Number(target) || 0
  const bar = Number(barKg) || 20
  if (t <= bar) return { perSide: [], leftover: 0, ok: t === bar }
  let rem = Math.round(((t - bar) / 2) * 100) / 100
  const sorted = [...plates].map(Number).filter((p) => p > 0).sort((a, b) => b - a)
  const perSide = []
  for (const p of sorted) {
    while (rem >= p - 1e-9) {
      perSide.push(p)
      rem = Math.round((rem - p) * 100) / 100
    }
  }
  return { perSide, leftover: rem, ok: rem < 1e-9 }
}

// "20+10+2.5×2" 형태 라벨. 못 맞춘 잔량은 (+x).
export function platesLabel(target, barKg, plates) {
  const { perSide, leftover, ok } = solvePlates(target, barKg, plates)
  if (!perSide.length) return ''
  const counts = {}
  perSide.forEach((p) => (counts[p] = (counts[p] || 0) + 1))
  const parts = Object.entries(counts)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([p, c]) => (c > 1 ? `${p}×${c}` : `${p}`))
  return parts.join('+') + (ok ? '' : ` (+${leftover})`)
}

export const DEFAULT_PLATE_SET = { barKg: 20, plates: [25, 20, 15, 10, 5, 2.5, 1.25] }
