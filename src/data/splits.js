// 분할 추천 시드 (읽기 전용).
// targetWeeklyFrequency: 부위별 주간 목표 수행 횟수(회/주).
// 추천 로직 입력: (최근 7일 미수행 부위) + (부위별 마지막 수행일) + (목표 빈도 대비 부족분).
//
// 각 session.exercises = 해당 세션의 추천 종목(exercises.js id) 4~5개.
//   "이 루틴으로 시작" 시 이 시드가 그대로 채워진다. 세트/렙은 전 종목 공통(SEED_SETS×SEED_REPS).
//   컴파운드(고중량 복합)를 앞에, 고립/보조를 뒤에 배치.

// 시드 기본 볼륨 — 전 종목 12회 × 4세트 (무게는 직전 기록 기반으로 자동 추천)
export const SEED_SETS = 4
export const SEED_REPS = 12

export const splits = {
  fullBody: {
    id: 'fullBody',
    label: '무분할 (전신)',
    sessions: [
      {
        name: '전신 A',
        bodyParts: ['chest', 'back', 'legs'],
        exercises: ['back-squat', 'barbell-bench-press', 'barbell-row', 'overhead-press', 'dumbbell-curl']
      },
      {
        name: '전신 B',
        bodyParts: ['shoulder', 'legs', 'arms'],
        exercises: ['deadlift', 'incline-dumbbell-press', 'lat-pulldown', 'lateral-raise', 'triceps-pushdown']
      }
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
      {
        name: '상체',
        bodyParts: ['chest', 'back', 'shoulder', 'arms'],
        exercises: ['barbell-bench-press', 'barbell-row', 'overhead-press', 'dumbbell-curl', 'triceps-pushdown']
      },
      {
        name: '하체',
        bodyParts: ['legs'],
        exercises: ['back-squat', 'romanian-deadlift', 'leg-press', 'lying-leg-curl', 'standing-calf-raise']
      }
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
      {
        name: 'Push',
        bodyParts: ['chest', 'shoulder', 'arms'],
        exercises: ['barbell-bench-press', 'incline-dumbbell-press', 'overhead-press', 'lateral-raise', 'triceps-pushdown']
      },
      {
        name: 'Pull',
        bodyParts: ['back', 'arms'],
        exercises: ['deadlift', 'lat-pulldown', 'seated-cable-row', 'cable-face-pull', 'dumbbell-curl']
      },
      {
        name: 'Legs',
        bodyParts: ['legs'],
        exercises: ['back-squat', 'romanian-deadlift', 'leg-press', 'lying-leg-curl', 'standing-calf-raise']
      }
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
      {
        name: '가슴+삼두',
        bodyParts: ['chest', 'arms'],
        exercises: ['barbell-bench-press', 'incline-dumbbell-press', 'cable-crossover', 'triceps-pushdown', 'lying-triceps-extension']
      },
      {
        name: '등+이두',
        bodyParts: ['back', 'arms'],
        exercises: ['deadlift', 'lat-pulldown', 'seated-cable-row', 'dumbbell-curl', 'hammer-curl']
      },
      {
        name: '어깨+팔',
        bodyParts: ['shoulder', 'arms'],
        exercises: ['overhead-press', 'lateral-raise', 'rear-delt-fly', 'dumbbell-curl', 'triceps-pushdown']
      },
      {
        name: '하체',
        bodyParts: ['legs'],
        exercises: ['back-squat', 'romanian-deadlift', 'leg-extension', 'lying-leg-curl', 'standing-calf-raise']
      }
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
