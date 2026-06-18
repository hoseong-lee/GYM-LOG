import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import relativeTime from 'dayjs/plugin/relativeTime'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(relativeTime)
dayjs.extend(isoWeek)
dayjs.locale('ko')

export { dayjs }

// RTDB 로그 키 — 정확히 'YYYY-MM-DD' 10자
export function dateKey(value) {
  return dayjs(value).format('YYYY-MM-DD')
}

export function todayKey() {
  return dayjs().format('YYYY-MM-DD')
}

export function monthKey(value) {
  return dayjs(value).format('YYYY-MM')
}

export function formatDate(value, fmt = 'YYYY.MM.DD (ddd)') {
  if (!value) return ''
  return dayjs(value).format(fmt)
}

export function fromNow(value) {
  if (!value) return ''
  return dayjs(value).fromNow()
}

export function isToday(dateStr) {
  return dateStr === todayKey()
}

export function isFuture(dateStr) {
  return dayjs(dateStr).isAfter(dayjs(), 'day')
}

// 'YYYY-MM-DD' 두 날짜의 일수 차 (a - b)
export function daysBetween(a, b) {
  return dayjs(a).startOf('day').diff(dayjs(b).startOf('day'), 'day')
}

// 오늘로부터 n일 전 키
export function daysAgoKey(n) {
  return dayjs().subtract(n, 'day').format('YYYY-MM-DD')
}

// 해당 월의 캘린더 그리드(앞뒤 공백 포함, 주 단위 배열). 일요일 시작.
export function monthGrid(yyyymm) {
  const start = dayjs(`${yyyymm}-01`)
  const daysInMonth = start.daysInMonth()
  const firstDow = start.day() // 0=일
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(start.date(d).format('YYYY-MM-DD'))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
