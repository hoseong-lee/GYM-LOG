import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { serverTimestamp } from 'firebase/database'
import { auth } from './config'
import { isEmailAllowed, ensureBootstrapDoc, upsertUser } from './database'

// 부트스트랩 관리자: allowedEmails 가 비어 있어도 첫 로그인 시 본인 노드를 self-set 한다.
export const BOOTSTRAP_ADMINS = ['3hosungo@gmail.com']

export class NotAllowedError extends Error {
  constructor(message = '아직 승인되지 않은 계정입니다. 관리자 승인 후 사용할 수 있어요.') {
    super(message)
    this.name = 'NotAllowedError'
  }
}

function isBootstrapAdmin(email) {
  return BOOTSTRAP_ADMINS.includes((email || '').toLowerCase())
}

// 화이트리스트 검증. 부트스트랩 관리자는 노드가 없으면 self-set 후 통과.
export async function verifyAllowed(user) {
  if (!user?.email) return false
  const email = user.email.toLowerCase()
  let allowed = await isEmailAllowed(email)
  if (!allowed && isBootstrapAdmin(email)) {
    await ensureBootstrapDoc(email)
    allowed = true
  }
  return allowed
}

// 화이트리스트 검증 후 users/{uid}/profile upsert. 반환: { user }
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  let result
  try {
    result = await signInWithPopup(auth, provider)
  } catch (e) {
    // 모바일/팝업 차단 환경은 redirect 로 폴백
    if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw e
  }

  const user = result.user
  const allowed = await verifyAllowed(user)
  if (!allowed) {
    await fbSignOut(auth)
    throw new NotAllowedError()
  }

  await upsertUser({
    email: user.email.toLowerCase(),
    displayName: user.displayName || '',
    lastLoginAt: serverTimestamp()
  })

  return { user }
}

export function signOut() {
  return fbSignOut(auth)
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback)
}
