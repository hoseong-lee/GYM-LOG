import { ref } from 'vue'

// 운동 흐름(구성/러너/요약) 동안 true → 글로벌 하단 탭바 숨김.
// 모듈 레벨 단일 ref라 앱 전역에서 공유된다.
export const immersive = ref(false)
