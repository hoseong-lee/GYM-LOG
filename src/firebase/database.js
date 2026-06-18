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
  serverTimestamp,
  increment
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

// 빈 문자열/undefined → null, 그 외 → Number
function numOrNull(v) {
  return v === '' || v == null ? null : Number(v)
}

// ───────────── 프로필 확장 (키/식단목표/목표) ─────────────
export async function setHeight(heightCm) {
  await update(dbRef(rtdb, nsPath(`users/${uid()}/profile`)), { heightCm: numOrNull(heightCm) })
}
export async function setDietTarget(target) {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/profile/dietTarget`)), {
    kcal: Number(target.kcal) || 0,
    protein: Number(target.protein) || 0,
    carb: Number(target.carb) || 0,
    fat: Number(target.fat) || 0
  })
}
export async function setGoals(goals) {
  await update(dbRef(rtdb, nsPath(`users/${uid()}/profile/goals`)), goals)
}

// ───────────── 체성분 (인바디) ─────────────
export async function saveBodyEntry({ date, weightKg, smmKg, bodyFatPct, bmrKcal, memo }) {
  const u = uid()
  const ref = dbRef(rtdb, nsPath(`users/${u}/body/${date}`))
  const existing = (await get(ref)).val() || {}
  const entry = {
    weightKg: numOrNull(weightKg),
    smmKg: numOrNull(smmKg),
    bodyFatPct: numOrNull(bodyFatPct),
    bmrKcal: numOrNull(bmrKcal),
    memo: memo || '',
    createdAt: existing.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  const updates = {}
  updates[nsPath(`users/${u}/body/${date}`)] = entry
  updates[nsPath(`users/${u}/bodyLatest`)] = {
    date,
    weightKg: entry.weightKg,
    smmKg: entry.smmKg,
    bodyFatPct: entry.bodyFatPct,
    bmrKcal: entry.bmrKcal
  }
  await update(dbRef(rtdb), updates)
}
export async function getBodyRange(startDate, endDate) {
  const q = query(dbRef(rtdb, nsPath(`users/${uid()}/body`)), orderByKey(), startAt(startDate), endAt(endDate))
  return (await get(q)).val() || {}
}
export async function getBodyLatest() {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/bodyLatest`)))
  return snap.exists() ? snap.val() : null
}
export async function getBodyDay(date) {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/body/${date}`)))
  return snap.exists() ? snap.val() : null
}
export async function deleteBodyEntry(date) {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/body/${date}`)), null)
}

// ───────────── 식단 (영양) ─────────────
export async function addMeal({ date, slot, name, kcal, protein, carb, fat, foodKey, saveAsFood }) {
  const u = uid()
  const mealKey = push(dbRef(rtdb, nsPath(`users/${u}/diet/${date}/meals`))).key
  const meal = {
    slot: slot || 'snack',
    name: name || '',
    kcal: Number(kcal) || 0,
    protein: Number(protein) || 0,
    carb: Number(carb) || 0,
    fat: Number(fat) || 0,
    foodKey: foodKey || null,
    createdAt: serverTimestamp()
  }
  const updates = {}
  updates[nsPath(`users/${u}/diet/${date}/meals/${mealKey}`)] = meal
  updates[nsPath(`users/${u}/diet/${date}/logged`)] = true
  if (foodKey) {
    updates[nsPath(`users/${u}/foods/${foodKey}/useCount`)] = increment(1)
    updates[nsPath(`users/${u}/foods/${foodKey}/lastUsed`)] = date
  } else if (saveAsFood && name) {
    const fk = push(dbRef(rtdb, nsPath(`users/${u}/foods`))).key
    updates[nsPath(`users/${u}/foods/${fk}`)] = {
      name,
      kcal: meal.kcal,
      protein: meal.protein,
      carb: meal.carb,
      fat: meal.fat,
      useCount: 1,
      lastUsed: date
    }
  }
  await update(dbRef(rtdb), updates)
}
export async function deleteMeal(date, mealKey) {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/diet/${date}/meals/${mealKey}`)), null)
}
export async function getDietDay(date) {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/diet/${date}`)))
  return snap.exists() ? snap.val() : null
}
export async function getDietRange(startDate, endDate) {
  const q = query(dbRef(rtdb, nsPath(`users/${uid()}/diet`)), orderByKey(), startAt(startDate), endAt(endDate))
  return (await get(q)).val() || {}
}
export async function getFoods() {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/foods`)))
  const v = snap.val() || {}
  return Object.entries(v)
    .map(([id, f]) => ({ id, ...f }))
    .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
}

// ───────────── 물 섭취 ─────────────
export async function addWater(date, deltaMl) {
  await update(dbRef(rtdb, nsPath(`users/${uid()}/water/${date}`)), { ml: increment(deltaMl) })
}
export async function getWater(date) {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/water/${date}/ml`)))
  return snap.exists() ? snap.val() : 0
}

// ───────────── 신체 둘레 (선택) ─────────────
export async function saveMeasure({ date, ...fields }) {
  const u = uid()
  const clean = {}
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== '' && v != null) clean[k] = Number(v)
  })
  clean.createdAt = serverTimestamp()
  await set(dbRef(rtdb, nsPath(`users/${u}/measure/${date}`)), clean)
}
export async function getMeasureRange(startDate, endDate) {
  const q = query(dbRef(rtdb, nsPath(`users/${uid()}/measure`)), orderByKey(), startAt(startDate), endAt(endDate))
  return (await get(q)).val() || {}
}

// ───────────── 진행 중 세션 (세션 러너) ─────────────
// 사용자당 0~1개. 새로고침/재진입 생존용 임시 영역. 종료 시 clearActiveSession 으로 삭제.
// 완료 종목은 saveStrengthEntry 로 logs 에 별도 flush (이 노드와 독립).
export async function getActiveSession() {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/activeSession`)))
  return snap.exists() ? snap.val() : null
}
export async function setActiveSession(session) {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/activeSession`)), session)
}
// patch: { 'exercises/<k>/savedToLog': true, currentIndex: 1, ... } 형태의 상대경로 맵
export async function updateActiveSession(patch) {
  const u = uid()
  const updates = {}
  Object.entries(patch || {}).forEach(([rel, val]) => {
    updates[nsPath(`users/${u}/activeSession/${rel}`)] = val
  })
  if (Object.keys(updates).length) await update(dbRef(rtdb), updates)
}
export async function clearActiveSession() {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/activeSession`)), null)
}

// ───────────── 요일별 루틴 매핑 (weeklyPlan) ─────────────
// days: { 0..6 : { sessionName } | { rest:true } }  (0=일 … 6=토, dayjs day())
export async function getWeeklyPlan() {
  const snap = await get(dbRef(rtdb, nsPath(`users/${uid()}/weeklyPlan`)))
  return snap.exists() ? snap.val() : null
}
export async function setWeeklyPlan(plan) {
  await set(dbRef(rtdb, nsPath(`users/${uid()}/weeklyPlan`)), {
    ...plan,
    updatedAt: serverTimestamp()
  })
}
