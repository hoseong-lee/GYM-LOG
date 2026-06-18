// 분할 추천 시드 (읽기 전용).
// targetWeeklyFrequency: 부위별 주간 목표 수행 횟수(회/주).
// 추천 로직 입력: (최근 7일 미수행 부위) + (부위별 마지막 수행일) + (목표 빈도 대비 부족분).

export const splits = {
  fullBody: {
    id: 'fullBody',
    label: '무분할 (전신)',
    sessions: [
      { name: '전신 A', bodyParts: ['chest', 'back', 'legs'] },
      { name: '전신 B', bodyParts: ['shoulder', 'legs', 'arms'] }
    ],
    targetWeeklyFrequency: { chest: 2, back: 2, shoulder: 2, legs: 3, arms: 2 },
    // 요일별 기본 매핑 (0=일 … 6=토). { sessionName } | { rest:true }
    defaultWeekly: {
      0: { rest: true },
      1: { sessionName: '전신 A' },
      2: { rest: true },
      3: { sessionName: '전신 B' },
      4: { rest: true },
      5: { sessionName: '전신 A' },
      6: { rest: true }
    }
  },

  upperLower: {
    id: 'upperLower',
    label: '상하체 2분할',
    sessions: [
      { name: '상체', bodyParts: ['chest', 'back', 'shoulder', 'arms'] },
      { name: '하체', bodyParts: ['legs'] }
    ],
    targetWeeklyFrequency: { chest: 2, back: 2, shoulder: 2, legs: 2, arms: 2 },
    defaultWeekly: {
      0: { rest: true },
      1: { sessionName: '상체' },
      2: { sessionName: '하체' },
      3: { rest: true },
      4: { sessionName: '상체' },
      5: { sessionName: '하체' },
      6: { rest: true }
    }
  },

  ppl: {
    id: 'ppl',
    label: 'PPL (밀기 / 당기기 / 하체)',
    sessions: [
      // arms 는 이두/삼두를 구분하지 않으므로 간접 포함으로 표기 (Phase2 세분 예정)
      { name: 'Push', bodyParts: ['chest', 'shoulder', 'arms'] },
      { name: 'Pull', bodyParts: ['back', 'arms'] },
      { name: 'Legs', bodyParts: ['legs'] }
    ],
    targetWeeklyFrequency: { chest: 2, back: 2, shoulder: 2, legs: 2, arms: 2 },
    defaultWeekly: {
      0: { rest: true },
      1: { sessionName: 'Push' },
      2: { sessionName: 'Pull' },
      3: { sessionName: 'Legs' },
      4: { sessionName: 'Push' },
      5: { sessionName: 'Pull' },
      6: { rest: true }
    }
  },

  fourDay: {
    id: 'fourDay',
    label: '4분할 (가슴+삼두 / 등+이두 / 어깨+팔 / 하체)',
    sessions: [
      { name: '가슴+삼두', bodyParts: ['chest', 'arms'] },
      { name: '등+이두', bodyParts: ['back', 'arms'] },
      { name: '어깨+팔', bodyParts: ['shoulder', 'arms'] },
      { name: '하체', bodyParts: ['legs'] }
    ],
    targetWeeklyFrequency: { chest: 1, back: 1, shoulder: 1, legs: 1, arms: 2 },
    defaultWeekly: {
      0: { rest: true },
      1: { sessionName: '가슴+삼두' },
      2: { sessionName: '등+이두' },
      3: { rest: true },
      4: { sessionName: '어깨+팔' },
      5: { sessionName: '하체' },
      6: { rest: true }
    }
  }
}

export const splitList = Object.values(splits)

// 유산소는 분할과 독립 — ACSM 중강도 기준 주 150분 권장
export const cardioGoal = { weeklyMinutes: 150 }

export const DEFAULT_SPLIT = 'ppl'
