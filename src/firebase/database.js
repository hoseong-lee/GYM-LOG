import {
  ref as dbRef,
  get,
  set,
  update,
  push,
  query,
  orderByKey,
  startAt,
  endAt,
  serverTimestamp
} from 'firebase/database'
import { rtdb, auth } from './config'
import { e1rm, topSetByE1rm } from '@/utils/exercise'

// 모든 gym-log 데이터는 'gymlog/' 네임스페이스 하위에 둔다 (dokkaebi/travel 과 분리).
export const NS = 'gymlog'
export function nsPath(p) {
  return `${NS}/${p}`
}

// RTDB 키에는 '.' 를 쓸 수 없으므로 이메일은 '.' → ',' 로 인코딩한다.
export function encodeEmailKey(email) {
  return (email || '').toLowerCase().trim().replace(/\./g, ',')
}

function uid() {
  const u = auth.currentUser?.uid
  if (!u) throw new Error('로그인이 필요합니다.')
  return u
}

// ───────────── 화이트리스트 ─────────────
export async function isEmailAllowed(email) {
  const snap = await get(dbRef(rtdb, nsPath(`allowedEmails/${encodeEmailKey(email)}`)))
  return snap.exists() && snap.val().active === true
}

// 부트스트랩 관리자의 allowedEmails 노드를 보장 (없으면 active:true 로 생성)
export async function ensureBootstrapDoc(email) {
  const lower = (email || '').toLowerCase()
  const r = dbRef(rtdb, nsPath(`allowedEmails/${encodeEmailKey(lower)}`))
  const snap = await get(r)
  if (!snap.exists()) {
    await set(r, { email: lower, active: true, addedAt: serverTimestamp() })
  } else if (snap.val().active !== true) {
    await update(r, { email: lower, active: true })
  }
}

// ───────────── 사용자 프로필 ─────────────
export async function upsertUser(data) {
  await update(dbRef(rtdb, nsPath(`users/${uid()}/profile`)), data)
}

export async function getUserProfile(userId) {
  const snap = await get(dbRef(rtdb, nsPath(`users/${userId}/profile`)))
  return snap.exists() ? { uid: userId, ...snap.val() } : null
}

export async function setSplit(split) {
  await update(dbRef(rtdb, nsPath(`users/${uid()}/profile`)), { split })
}

// ───────────── 로그 (일자별) ─────────────
// 근력 1종목 저장: logs + manualCheck + lastByExercise(직전 + PR)를 단일 update 로 원자 반영
export async function saveStrengthEntry({ date, exKey, name, bodyPart, sets }) {
  const u = uid()
  const pushKey = push(dbRef(rtdb, nsPath(`users/${u}/logs/${date}/strength`))).key

  const cacheRef = dbRef(rtdb, nsPath(`users/${u}/lastByExercise/${exKey}`))
  const prev = (await get(cacheRef)).val() || {}
  const top = topSetByE1rm(sets)
  const newE1RM = e1rm(top.weight, top.reps)
  const isPR = newE1RM > (prev.bestE1RM || 0)

  const updates = {}
  updates[nsPath(`users/${u}/logs/${date}/strength/${pushKey}`)] = {
    exKey,
    name,
    bodyPart,
    sets,
    createdAt: serverTimestamp()
  }
  updates[nsPath(`users/${u}/logs/${date}/manualCheck`)] = true
  updates[nsPath(`users/${u}/lastByExercise/${exKey}/lastWeight`)] = top.weight
  updates[nsPath(`users/${u}/lastByExercise/${exKey}/lastReps`)] = top.reps
  updates[nsPath(`users/${u}/lastByExercise/${exKey}/lastDate`)] = date
  if (isPR) {
    updates[nsPath(`users/${u}/lastByExercise/${exKey}/bestWeight`)] = top.weight
    updates[nsPath(`users/${u}/lastByExercise/${exKey}/bestReps`)] = top.reps
    updates[nsPath(`users/${u}/lastByExercise/${exKey}/bestE1RM`)] = newE1RM
    updates[nsPath(`users/${u}/lastByExercise/${exKey}/bestDate`)] = date
  }

  await update(dbRef(rtdb), updates)
  return { pushKey, isPR }
}

export async function saveCardioEntry({ date, exKey, name, minutes, distanceKm, intensity }) {
  const u = uid()
  const pushKey = push(dbRef(rtdb, nsPath(`users/${u}/logs/${date}/cardio`))).key
  const updates = {}
  updates[nsPath(`users/${u}/logs/${date}/cardio/${pushKey}`)] = {
    exKey,
    name,
    bodyPart: 'cardio',
    minutes: Number(minutes) || 0,
    distanceKm: Number(distanceKm) || 0,
    intensity: intensity || 'mid',
    createdAt: serverTimestamp()
  }
  updates[nsPath(`users/${u}/logs/${date}/manualCheck`)] = true
  await update(dbRef(rtdb), updates)
  return { pushKey }
}

// 항목 삭제 (kind: 'strength' | 'cardio')
export async function deleteEntry(date, kind, pushKey) {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/logs/${date}/${kind}/${pushKey}`)), null)
}

// 수동 출석 토글
export async function setManualCheck(date, value) {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/logs/${date}/manualCheck`)), !!value)
}

export async function getDayLog(date) {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/logs/${date}`)))
  return snap.exists() ? snap.val() : null
}

export async function setMemo(date, memo) {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/logs/${date}/memo`)), memo || '')
}

// 월별 로그 — orderByKey 범위쿼리 ('YYYY-MM' → 해당 월 전체). { 'YYYY-MM-DD': {...} }
export async function getMonthLogs(yyyymm) {
  const q = query(
    dbRef(rtdb, nsPath(`users/${uid()}/logs`)),
    orderByKey(),
    startAt(`${yyyymm}-01`),
    endAt(`${yyyymm}-31`)
  )
  const snap = await get(q)
  return snap.val() || {}
}

// 키 범위 로그 (startDate~endDate, YYYY-MM-DD)
export async function getLogsRange(startDate, endDate) {
  const q = query(
    dbRef(rtdb, nsPath(`users/${uid()}/logs`)),
    orderByKey(),
    startAt(startDate),
    endAt(endDate)
  )
  const snap = await get(q)
  return snap.val() || {}
}

// 종목별 직전기록 + PR 캐시 전체
export async function getLastByExercise() {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/lastByExercise`)))
  return snap.val() || {}
}

export async function getLastForExercise(exKey) {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/lastByExercise/${exKey}`)))
  return snap.exists() ? snap.val() : null
}
