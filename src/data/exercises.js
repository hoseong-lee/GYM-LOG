// 읽기 전용 정적 운동 카탈로그 + 가이드 카드.
// key = slug id. RTDB users/{uid}/lastByExercise/{key} 와 동일 키.
// primaryMuscles/secondaryMuscles 는 src/data/bodyMap.js 의 18개 muscle id 를 참조.
//
// ⚠️ 이 파일은 시드 워크플로 결과로 전체(31종목)가 채워진다. 현재는 검증 완료된 대표 2종목.

export const BODY_PARTS = ['shoulder', 'chest', 'back', 'legs', 'arms', 'cardio']

export const bodyPartLabels = {
  shoulder: '어깨',
  chest: '가슴',
  back: '등',
  legs: '하체',
  arms: '팔',
  cardio: '유산소'
}

export const exercises = {
  'barbell-bench-press': {
    id: 'barbell-bench-press',
    demoId: 'Barbell_Bench_Press_-_Medium_Grip',
    name: '바벨 벤치프레스',
    bodyPart: 'chest',
    equipment: 'barbell',
    pattern: 'horizontal-push',
    weighted: true,
    increment: 2.5,
    repRange: [6, 10],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts', 'triceps'],
    guide: {
      target: '대흉근(흉골부/중앙), 보조로 전면 삼각근·삼두근',
      cues: [
        '벤치에 누워 눈이 바(bar) 바로 아래 오도록 위치를 잡는다.',
        '견갑을 뒤·아래로 모아 고정하고 가슴을 살짝 들어 아치를 만든다.',
        '양발은 바닥을 단단히 밀어 하체로 긴장을 만든다.',
        '바를 명치~젖꼭지 라인으로 통제하며 내린다(자유낙하 금지).',
        '가슴에 가볍게 닿으면 발로 바닥을 밀듯 폭발적으로 밀어올린다.'
      ],
      feel: '대흉근이 늘어났다가 모이며 미는 힘을 받는 느낌. 어깨 앞쪽이 찌릿하면 자세가 무너진 신호다.',
      mistakes: [
        '바를 가슴에 튕긴다 → 컨트롤하며 1~2초에 걸쳐 내린다.',
        '엉덩이를 들어 반동을 쓴다 → 둔근을 벤치에 붙인 채 유지한다.',
        '팔꿈치를 90도로 벌린다 → 몸통과 약 45~75도로 모아 어깨를 보호한다.'
      ],
      breathing: '내릴 때 들이마셔 흉강을 채우고(필요 시 가벼운 발살바), 밀어올리며 내쉰다.',
      refUrl: ''
    }
  },

  'back-squat': {
    id: 'back-squat',
    demoId: 'Barbell_Squat',
    name: '바벨 백스쿼트',
    bodyPart: 'legs',
    equipment: 'barbell',
    pattern: 'squat',
    weighted: true,
    increment: 5,
    repRange: [5, 8],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'lower-back', 'adductors'],
    guide: {
      target: '대퇴사두근, 둔근, 보조로 햄스트링·척추기립근',
      cues: [
        '바를 승모근 상부에 안정적으로 얹고 그립을 단단히 잡는다.',
        '랙에서 빼 한두 걸음 물러서고 발은 어깨너비, 발끝은 약 15~30도 벌린다.',
        '숨을 채워 복압을 만들고 코어를 단단히 고정한다.',
        '엉덩이를 뒤로 빼며 무릎을 발끝 방향으로 굽혀 앉는다.',
        '대퇴가 바닥과 평행 이상 깊이까지 통제하며 내려간다.',
        '발 전체로 바닥을 밀며 무릎과 엉덩이를 동시에 펴 일어선다.'
      ],
      feel: '허벅지 앞쪽과 엉덩이에 강한 부하. 무릎이 안으로 모이거나 허리가 말리면 즉시 중단할 신호다.',
      mistakes: [
        '무릎이 안으로 모인다(외반/knee valgus) → 무릎을 발끝 방향으로 밀어낸다.',
        '뒤꿈치가 뜬다 → 중심을 발 중앙에 두고 발 전체로 민다.',
        '상체가 과도하게 숙여진다 → 복압을 강화하고 가슴을 세운다.'
      ],
      breathing: '내려가기 전 크게 들이마셔 복압을 만들고(발살바), 일어서며 상단부에서 내쉰다.',
      refUrl: ''
    }
  },
'overhead-press': {
    id: 'overhead-press',
    demoId: 'Standing_Military_Press',
    name: '바벨 오버헤드 프레스',
    bodyPart: 'shoulder',
    equipment: 'barbell',
    pattern: 'vertical-push',
    weighted: true,
    increment: 2.5,
    repRange: [6, 10],
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['side-delts', 'triceps', 'traps'],
    guide: {
      target: '전면 삼각근, 보조로 측면 삼각근·삼두근·승모근',
      cues: [
        '바를 쇄골 위 랙 포지션에 얹고 손은 어깨너비보다 약간 넓게 잡는다.',
        '복부와 둔근에 힘을 줘 갈비뼈가 들리지 않게 몸통을 단단히 고정한다.',
        '턱을 살짝 당겨 바가 얼굴을 스치듯 수직으로 밀어올린다.',
        '바가 정수리를 지나면 머리를 약간 앞으로 통과시켜 어깨 위에 고정한다.'
      ],
      feel: '어깨 앞쪽과 측면이 미는 힘을 받고 마지막에 삼두근이 잠긴다. 허리가 과도하게 젖혀지며 아프면 몸통 고정이 풀린 신호다.',
      mistakes: [
        '허리를 과도하게 젖혀 민다 → 둔근·복부로 골반을 고정하고 수직으로만 민다.',
        '바를 앞으로 밀어 어깨가 앞으로 빠진다 → 머리를 살짝 뒤로 빼 수직 경로를 만든다.',
        '반동으로 무릎을 굽혀 올린다 → 무릎을 펴고 어깨 힘만으로 통제한다.'
      ],
      breathing: '밀어올리기 전 숨을 채워 몸통을 고정하고(고중량 시 발살바), 정점을 지나며 내쉰다.',
      refUrl: ''
    }
  },
  'dumbbell-shoulder-press': {
    id: 'dumbbell-shoulder-press',
    demoId: 'Dumbbell_Shoulder_Press',
    name: '덤벨 숄더 프레스',
    bodyPart: 'shoulder',
    equipment: 'dumbbell',
    pattern: 'vertical-push',
    weighted: true,
    increment: 2,
    repRange: [6, 10],
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['side-delts', 'triceps'],
    guide: {
      target: '전면 삼각근, 보조로 측면 삼각근·삼두근',
      cues: [
        '벤치에 등을 대고 앉아 덤벨을 어깨 높이 귀 옆에 둔다.',
        '팔꿈치는 몸통에서 약간 앞으로 둬 어깨가 비틀리지 않게 한다.',
        '복부에 힘을 주고 덤벨을 머리 위로 부드럽게 밀어올린다.',
        '정점에서 덤벨이 가볍게 모이게 한 뒤 통제하며 어깨 높이로 내린다.'
      ],
      feel: '어깨 앞·측면이 늘어났다 모이며 미는 힘을 받는다. 손목이 꺾이며 아프면 덤벨이 손바닥 뿌리 위에 정렬되지 않은 신호다.',
      mistakes: [
        '덤벨을 너무 깊게 내려 어깨가 들린다 → 어깨 높이 부근까지만 내린다.',
        '팔꿈치를 완전히 옆으로 벌린다 → 약간 앞으로 모아 어깨 충돌을 줄인다.',
        '반동으로 등을 젖혀 민다 → 몸통을 고정하고 어깨 힘으로만 통제한다.'
      ],
      breathing: '내릴 때 들이마시고 밀어올리며 내쉰다(고중량 시 정점 전까지 숨을 참아 몸통을 고정).',
      refUrl: ''
    }
  },
  'lateral-raise': {
    id: 'lateral-raise',
    demoId: 'Side_Lateral_Raise',
    name: '덤벨 레터럴 레이즈',
    bodyPart: 'shoulder',
    equipment: 'dumbbell',
    pattern: 'isolation',
    weighted: true,
    increment: 1.25,
    repRange: [10, 15],
    primaryMuscles: ['side-delts'],
    secondaryMuscles: ['traps'],
    guide: {
      target: '측면 삼각근, 보조로 승모근',
      cues: [
        '덤벨을 양옆에 들고 상체를 아주 살짝 앞으로 기울여 선다.',
        '팔꿈치를 약간 굽혀 고정하고 손목보다 팔꿈치가 먼저 올라가게 한다.',
        '덤벨을 어깨 높이까지 양옆으로 들어올린다(새끼손가락이 약간 위).',
        '정점에서 잠깐 멈춘 뒤 통제하며 천천히 내린다.'
      ],
      feel: '어깨 측면이 타듯이 차오르는 느낌. 목·승모근이 먼저 뻐근하면 어깨를 으쓱 들어 올린 신호다.',
      mistakes: [
        '반동으로 휙 들어올린다 → 무게를 낮추고 천천히 통제한다.',
        '어깨를 으쓱 들어 승모근이 개입한다 → 어깨를 아래로 누른 채 팔만 벌린다.',
        '어깨보다 훨씬 높이 든다 → 어깨 높이까지만 올려 자극을 측면에 유지한다.'
      ],
      breathing: '들어올리며 내쉬고 내리며 들이마신다.',
      refUrl: ''
    }
  },
  'rear-delt-fly': {
    id: 'rear-delt-fly',
    demoId: 'Reverse_Flyes',
    name: '리어 델트 플라이',
    bodyPart: 'shoulder',
    equipment: 'dumbbell',
    pattern: 'isolation',
    weighted: true,
    increment: 1.25,
    repRange: [10, 15],
    primaryMuscles: ['rear-delts'],
    secondaryMuscles: ['upper-back', 'traps'],
    guide: {
      target: '후면 삼각근, 보조로 상부 등·승모근',
      cues: [
        '상체를 골반에서 접어 바닥과 거의 평행하게 숙이고 등은 곧게 편다.',
        '덤벨을 가볍게 들고 팔꿈치를 약간 굽혀 고정한다.',
        '팔꿈치를 양옆 뒤로 펼치듯 들어 후면 삼각근으로 덤벨을 벌린다.',
        '정점에서 견갑이 과하게 모이기 직전까지만 올린 뒤 통제하며 내린다.'
      ],
      feel: '어깨 뒤쪽이 조여지는 느낌. 견갑 사이가 먼저 강하게 모이면 등 근육 위주로 끌린 신호다.',
      mistakes: [
        '견갑을 세게 모아 등으로 당긴다 → 팔을 옆으로 벌리는 데 집중해 후면 삼각근을 분리한다.',
        '반동으로 상체를 일으키며 든다 → 상체 각도를 고정하고 팔만 움직인다.',
        '팔꿈치를 펴며 당겨 이두로 끌린다 → 팔꿈치 각도를 일정하게 유지한다.'
      ],
      breathing: '벌려 올리며 내쉬고 내리며 들이마신다.',
      refUrl: ''
    }
  },
  'cable-face-pull': {
    id: 'cable-face-pull',
    demoId: 'Face_Pull',
    name: '케이블 페이스 풀',
    bodyPart: 'shoulder',
    equipment: 'cable',
    pattern: 'isolation',
    weighted: true,
    increment: 1.25,
    repRange: [10, 15],
    primaryMuscles: ['rear-delts'],
    secondaryMuscles: ['upper-back', 'traps'],
    guide: {
      target: '후면 삼각근, 보조로 상부 등·승모근',
      cues: [
        '도르래를 얼굴 높이에 맞추고 로프를 양손으로 잡아 한두 걸음 물러선다.',
        '가슴을 펴고 팔을 뻗어 장력을 건 자세에서 시작한다.',
        '로프를 얼굴 쪽으로 당기며 팔꿈치를 양옆 위로 벌린다.',
        '정점에서 양손이 귀 옆에 오게 하고 후면 삼각근을 조인 뒤 통제하며 돌아간다.'
      ],
      feel: '어깨 뒤쪽과 상부 등이 조여지는 느낌. 이두근이 먼저 뻐근하면 팔로만 당긴 신호다.',
      mistakes: [
        '팔꿈치를 아래로 떨어뜨려 당긴다 → 팔꿈치를 어깨 높이 이상으로 벌린다.',
        '무게가 무거워 상체가 끌려간다 → 무게를 낮추고 몸통을 고정한다.',
        '손만 당겨 이두로 끌린다 → 팔꿈치를 뒤로 벌리는 데 집중해 후면 삼각근을 쓴다.'
      ],
      breathing: '당기며 내쉬고 돌아가며 들이마신다.',
      refUrl: ''
    }
  },
'incline-dumbbell-press': {
    id: 'incline-dumbbell-press',
    demoId: 'Incline_Dumbbell_Press',
    name: '인클라인 덤벨 프레스',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    pattern: 'incline-push',
    weighted: true,
    increment: 2,
    repRange: [6, 10],
    primaryMuscles: ['chest', 'front-delts'],
    secondaryMuscles: ['triceps'],
    guide: {
      target: '대흉근 상부와 전면 삼각근, 보조로 삼두근',
      cues: [
        '등받이를 30~45도로 세우고 덤벨을 무릎에 올린 뒤 반동으로 가슴 위에 세팅한다.',
        '견갑을 뒤·아래로 모아 고정하고 가슴을 살짝 들어 흉곽을 연다.',
        '덤벨을 쇄골 아래 라인으로 통제하며 내려 대흉근 상부를 늘인다.',
        '명치 위 한 점을 향하듯 모으며 폭발적으로 밀어올린다.'
      ],
      feel: '대흉근 윗부분과 어깨 앞쪽이 늘어났다 모이는 느낌. 어깨 관절 앞쪽만 찌릿하면 각도가 너무 높거나 견갑이 풀린 신호다.',
      mistakes: [
        '등받이를 60도 이상 세운다 → 어깨 주도가 되므로 45도 이하로 낮춘다.',
        '덤벨을 머리 위로 모은다 → 쇄골 아래 수직 라인으로 밀어 대흉근 상부에 집중한다.',
        '바닥까지 떨어뜨려 어깨가 말린다 → 견갑 고정이 풀리지 않는 깊이까지만 내린다.'
      ],
      breathing: '내릴 때 들이마셔 흉강을 채우고, 밀어올리며 내쉰다(고중량 시 가벼운 발살바).',
      refUrl: ''
    }
  },
  'dumbbell-fly': {
    id: 'dumbbell-fly',
    demoId: 'Dumbbell_Flyes',
    name: '덤벨 플라이',
    bodyPart: 'chest',
    equipment: 'dumbbell',
    pattern: 'isolation',
    weighted: true,
    increment: 1.25,
    repRange: [10, 15],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts'],
    guide: {
      target: '대흉근(흉골부/중앙), 보조로 전면 삼각근',
      cues: [
        '평벤치에 누워 덤벨을 가슴 위로 들고 팔꿈치를 살짝 굽혀 고정한다.',
        '견갑을 모아 고정하고 가슴을 살짝 들어 아치를 만든다.',
        '팔꿈치 각도를 유지한 채 양팔을 큰 호를 그리며 옆으로 벌려 대흉근을 늘인다.',
        '가슴을 끌어안듯 모으며 같은 호를 따라 덤벨을 올린다.'
      ],
      feel: '대흉근 바깥쪽이 길게 늘어났다가 모이는 신전 자극. 어깨나 팔꿈치 안쪽이 당기면 팔을 너무 펴거나 무게가 과한 신호다.',
      mistakes: [
        '팔을 곧게 편다 → 팔꿈치를 살짝 굽힌 각도를 끝까지 유지한다.',
        '너무 무겁게 들어 미는 동작이 된다 → 무게를 낮추고 호를 그리는 궤적을 지킨다.',
        '바닥 너무 깊이 벌려 어깨가 말린다 → 어깨가 통증 없는 범위까지만 늘인다.'
      ],
      breathing: '벌리며 들이마시고, 모으며 내쉰다.',
      refUrl: ''
    }
  },
  'machine-chest-press': {
    id: 'machine-chest-press',
    demoId: 'Leverage_Chest_Press',
    name: '머신 체스트 프레스',
    bodyPart: 'chest',
    equipment: 'machine',
    pattern: 'horizontal-push',
    weighted: true,
    increment: 2.5,
    repRange: [6, 10],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts', 'triceps'],
    guide: {
      target: '대흉근(흉골부/중앙), 보조로 전면 삼각근·삼두근',
      cues: [
        '손잡이가 가슴 중앙 높이에 오도록 시트를 조절하고 앉는다.',
        '견갑을 뒤·아래로 모아 등받이에 붙이고 가슴을 편다.',
        '손잡이를 가슴 힘으로 통제하며 앞으로 밀어 거의 다 편다(팔꿈치 잠그지 않음).',
        '대흉근이 늘어나는 지점까지 천천히 되돌려 신전을 느낀다.'
      ],
      feel: '대흉근 중앙이 미는 내내 단단히 수축하는 느낌. 어깨 앞쪽이 주로 당기면 견갑이 풀렸거나 시트가 너무 높은 신호다.',
      mistakes: [
        '시트가 높아 손잡이가 어깨 위에 온다 → 손잡이가 가슴 중앙에 오도록 시트를 올린다.',
        '팔꿈치를 끝에서 완전히 잠근다 → 살짝 굽힌 상태로 멈춰 긴장을 유지한다.',
        '되돌릴 때 무게에 끌려간다 → 통제하며 천천히 내려 대흉근을 늘인다.'
      ],
      breathing: '밀어내며 내쉬고, 되돌리며 들이마신다.',
      refUrl: ''
    }
  },
  'cable-crossover': {
    id: 'cable-crossover',
    demoId: 'Cable_Crossover',
    name: '케이블 크로스오버',
    bodyPart: 'chest',
    equipment: 'cable',
    pattern: 'isolation',
    weighted: true,
    increment: 1.25,
    repRange: [10, 15],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts'],
    guide: {
      target: '대흉근(흉골부/중앙), 보조로 전면 삼각근',
      cues: [
        '도르래를 어깨 높이 이상에 두고 양손에 손잡이를 잡은 뒤 한 발 앞으로 내딛는다.',
        '상체를 살짝 앞으로 기울이고 견갑을 모아 가슴을 편다.',
        '팔꿈치를 살짝 굽힌 채 고정하고 양손을 큰 호로 모아 명치 앞에서 교차하듯 끌어당긴다.',
        '대흉근이 늘어나는 지점까지 통제하며 천천히 벌려 되돌린다.'
      ],
      feel: '모을 때 대흉근 안쪽과 중앙이 짜이듯 수축하는 느낌. 어깨나 팔에 힘이 몰리면 팔로 당기거나 무게가 과한 신호다.',
      mistakes: [
        '팔을 곧게 펴고 당긴다 → 팔꿈치 각도를 유지해 가슴으로 모은다.',
        '무게가 무거워 몸통이 흔들린다 → 무게를 낮추고 코어를 고정한다.',
        '벌릴 때 어깨가 앞으로 말린다 → 견갑 고정이 풀리지 않는 범위까지만 늘인다.'
      ],
      breathing: '모으며 내쉬고, 벌리며 들이마신다.',
      refUrl: ''
    }
  },
'deadlift': {
    id: 'deadlift',
    demoId: 'Barbell_Deadlift',
    name: '컨벤셔널 데드리프트',
    bodyPart: 'back',
    equipment: 'barbell',
    pattern: 'hinge',
    weighted: true,
    increment: 5,
    repRange: [5, 8],
    primaryMuscles: ['glutes', 'hamstrings', 'lower-back'],
    secondaryMuscles: ['quads', 'traps', 'lats'],
    guide: {
      target: '둔근·햄스트링·기립근, 보조로 대퇴사두근·승모근·광배근',
      cues: [
        '바가 발 중앙 위에 오도록 서고 정강이가 바에 거의 닿게 발을 둔다.',
        '엉덩이를 뒤로 빼며 무릎을 굽혀 바를 잡고 가슴을 들어 허리를 곧게 편다.',
        '광배에 힘을 줘 바를 몸쪽으로 당기듯 붙이고 바닥을 발로 밀며 일어선다.',
        '바가 무릎을 지나면 둔근을 조여 골반을 끝까지 세우고 상체를 곧게 세운다.'
      ],
      feel: '엉덩이와 햄스트링이 강하게 당겨지며 등 전체가 버티는 느낌. 허리(요추)에 국소적인 통증이 오면 자세가 무너진 신호다.',
      mistakes: [
        '엉덩이가 먼저 솟구쳐 상체만 숙여진다 → 가슴과 엉덩이를 같은 속도로 함께 들어올린다.',
        '바가 몸에서 멀어진다 → 광배를 조여 바를 정강이·허벅지에 붙여 끌어올린다.',
        '허리가 둥글게 말린다 → 가슴을 들고 복압을 채워 척추 중립을 유지한다.',
        '꼭대기에서 허리를 과하게 젖힌다 → 둔근으로 골반만 세우고 상체는 곧게 멈춘다.'
      ],
      breathing: '서기 전에 숨을 크게 들이마셔 복압을 채우고(고중량 시 발살바), 정점을 지나며 내쉰다.',
      refUrl: ''
    }
  },
  'pull-up': {
    id: 'pull-up',
    demoId: 'Pullups',
    name: '풀업(턱걸이)',
    bodyPart: 'back',
    equipment: 'bodyweight',
    pattern: 'vertical-pull',
    weighted: false,
    increment: 0,
    repRange: [5, 10],
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'upper-back', 'rear-delts'],
    guide: {
      target: '광배근, 보조로 이두근·상부 등·후면 삼각근',
      cues: [
        '어깨너비보다 약간 넓게 오버그립으로 바를 잡고 매달린다.',
        '견갑을 아래로 내려 고정하고 가슴을 살짝 들어 약간 뒤로 기댄다.',
        '팔꿈치를 바닥쪽으로 끌어내린다는 느낌으로 가슴을 바에 가져간다.',
        '턱이 바를 넘으면 잠시 멈췄다가 통제하며 완전히 내려온다.'
      ],
      feel: '광배근 바깥쪽이 수축하며 등을 끌어올리는 느낌. 팔(이두)만 뻐근하고 등이 안 느껴지면 팔로만 당기는 신호다.',
      mistakes: [
        '반동으로 몸을 차올린다 → 다리를 고정하고 등 힘으로만 천천히 올린다.',
        '바닥에서 팔만 굽힌다 → 견갑을 먼저 끌어내려 등을 개입시킨 뒤 당긴다.',
        '반만 내려오고 다시 올린다 → 팔이 거의 펴질 때까지 완전 가동범위로 내린다.'
      ],
      breathing: '매달린 상태에서 들이마시고, 몸을 끌어올리며 내쉰다.',
      refUrl: ''
    }
  },
  'lat-pulldown': {
    id: 'lat-pulldown',
    demoId: 'Wide-Grip_Lat_Pulldown',
    name: '랫 풀다운',
    bodyPart: 'back',
    equipment: 'cable',
    pattern: 'vertical-pull',
    weighted: true,
    increment: 2,
    repRange: [10, 15],
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'upper-back', 'rear-delts'],
    guide: {
      target: '광배근, 보조로 이두근·상부 등·후면 삼각근',
      cues: [
        '허벅지 패드를 조여 몸을 고정하고 어깨너비보다 넓게 바를 잡는다.',
        '상체를 약 15~30도 뒤로 기울이고 가슴을 든다.',
        '팔꿈치를 옆구리쪽으로 끌어내린다는 느낌으로 바를 쇄골 윗가슴까지 당긴다.',
        '바닥에서 견갑을 모아 잠시 멈춘 뒤 통제하며 팔을 끝까지 편다.'
      ],
      feel: '광배근이 옆구리 쪽으로 조여지는 느낌. 팔뚝과 이두만 뻐근하면 팔로 당기는 신호다.',
      mistakes: [
        '몸을 크게 뒤로 젖혀 반동을 쓴다 → 상체 기울기를 고정하고 등 힘으로만 당긴다.',
        '바를 목 뒤로 내린다 → 어깨 부상 위험이 크니 쇄골~윗가슴 앞으로 당긴다.',
        '복귀할 때 바를 놓듯 빠르게 올린다 → 광배가 늘어나는 것을 느끼며 천천히 편다.'
      ],
      breathing: '바를 당겨 내리며 내쉬고, 팔을 펴 올리며 들이마신다.',
      refUrl: ''
    }
  },
  'barbell-row': {
    id: 'barbell-row',
    demoId: 'Bent_Over_Barbell_Row',
    name: '바벨 로우',
    bodyPart: 'back',
    equipment: 'barbell',
    pattern: 'horizontal-pull',
    weighted: true,
    increment: 5,
    repRange: [5, 8],
    primaryMuscles: ['lats', 'upper-back'],
    secondaryMuscles: ['rear-delts', 'biceps', 'lower-back'],
    guide: {
      target: '광배근·상부 등, 보조로 후면 삼각근·이두근·기립근',
      cues: [
        '어깨너비로 바를 잡고 엉덩이를 빼 상체를 약 45도 안팎으로 숙인다.',
        '가슴을 들고 허리를 곧게 펴 복압을 채워 척추 중립을 만든다.',
        '팔꿈치를 뒤로 끌어 바를 배꼽~명치 아래로 당긴다.',
        '정점에서 견갑을 모아 짜낸 뒤 통제하며 내린다.'
      ],
      feel: '등 가운데가 조여지고 광배가 수축하는 느낌. 허리가 뻐근하면 상체가 흔들려 기립근으로 버티는 신호다.',
      mistakes: [
        '반동으로 상체를 일으키며 당긴다 → 상체 각도를 고정하고 등 힘으로만 당긴다.',
        '허리가 둥글게 말린다 → 가슴을 들고 복압을 채워 척추 중립을 유지한다.',
        '바를 가슴 위쪽으로 당긴다 → 광배를 쓰려면 명치~배꼽 라인으로 당긴다.'
      ],
      breathing: '숙인 자세에서 복압을 채워 들이마시고, 바를 당기며 내쉰다.',
      refUrl: ''
    }
  },
  'seated-cable-row': {
    id: 'seated-cable-row',
    demoId: 'Seated_Cable_Rows',
    name: '시티드 케이블 로우',
    bodyPart: 'back',
    equipment: 'cable',
    pattern: 'horizontal-pull',
    weighted: true,
    increment: 2,
    repRange: [10, 15],
    primaryMuscles: ['lats', 'upper-back'],
    secondaryMuscles: ['rear-delts', 'biceps'],
    guide: {
      target: '광배근·상부 등, 보조로 후면 삼각근·이두근',
      cues: [
        '발을 발판에 받치고 무릎을 살짝 굽혀 상체를 곧게 세운다.',
        '핸들을 잡고 가슴을 들어 견갑을 약간 앞으로 내준 출발 자세를 만든다.',
        '팔꿈치를 옆구리에 붙여 뒤로 끌며 핸들을 배꼽쪽으로 당긴다.',
        '정점에서 견갑을 모아 짜낸 뒤 통제하며 팔을 펴 등을 늘인다.'
      ],
      feel: '등 가운데가 조여지고 광배가 수축하는 느낌. 상체를 크게 흔들어야 당겨지면 무게가 과한 신호다.',
      mistakes: [
        '상체를 앞뒤로 크게 흔들어 반동을 쓴다 → 몸통을 세워 고정하고 팔꿈치로 당긴다.',
        '어깨가 위로 솟는다 → 견갑을 아래로 내려 고정하고 등으로 끌어당긴다.',
        '복귀 시 등이 둥글게 끌려간다 → 가슴을 든 채 광배가 늘어나는 만큼만 편다.'
      ],
      breathing: '핸들을 당기며 내쉬고, 팔을 펴 늘이며 들이마신다.',
      refUrl: ''
    }
  },
  'dumbbell-row': {
    id: 'dumbbell-row',
    demoId: 'One-Arm_Dumbbell_Row',
    name: '원암 덤벨 로우',
    bodyPart: 'back',
    equipment: 'dumbbell',
    pattern: 'horizontal-pull',
    weighted: true,
    increment: 2,
    repRange: [10, 15],
    primaryMuscles: ['lats', 'upper-back'],
    secondaryMuscles: ['rear-delts', 'biceps'],
    guide: {
      target: '광배근·상부 등, 보조로 후면 삼각근·이두근',
      cues: [
        '한 손과 같은 쪽 무릎을 벤치에 올려 상체를 바닥과 거의 수평으로 만든다.',
        '반대 손으로 덤벨을 들고 가슴을 들어 허리를 곧게 편다.',
        '팔꿈치를 옆구리를 따라 뒤로 끌어 덤벨을 골반 쪽으로 당긴다.',
        '정점에서 견갑을 모아 짜낸 뒤 통제하며 팔을 완전히 편다.'
      ],
      feel: '당기는 쪽 광배와 등 가운데가 수축하는 느낌. 팔(이두)만 뻐근하면 팔로 당기는 신호다.',
      mistakes: [
        '몸통을 비틀어 회전 반동으로 들어올린다 → 상체를 고정하고 팔꿈치로만 당긴다.',
        '덤벨을 어깨쪽으로 당긴다 → 광배를 쓰려면 골반·허리 라인으로 당긴다.',
        '복귀할 때 덤벨을 떨어뜨리듯 내린다 → 광배가 늘어나는 것을 느끼며 천천히 편다.'
      ],
      breathing: '덤벨을 당기며 내쉬고, 팔을 펴 늘이며 들이마신다.',
      refUrl: ''
    }
  },
'romanian-deadlift': {
    id: 'romanian-deadlift',
    demoId: 'Romanian_Deadlift',
    name: '루마니안 데드리프트',
    bodyPart: 'legs',
    equipment: 'barbell',
    pattern: 'hinge',
    weighted: true,
    increment: 5,
    repRange: [5, 8],
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower-back'],
    guide: {
      target: '햄스트링·둔근, 보조로 기립근(하부등)',
      cues: [
        '바를 어깨너비로 잡고 발은 골반 너비로 선 채 무릎을 살짝만 굽혀 고정한다.',
        '가슴을 펴고 척추를 중립으로 둔 채 엉덩이를 뒤로 밀며 바를 다리에 붙여 내린다.',
        '햄스트링이 팽팽해지는 지점까지만 내리고 허리가 굽으면 멈춘다.',
        '엉덩이를 앞으로 밀어 바를 끌어올리며 정점에서 둔근을 조인다.'
      ],
      feel: '허벅지 뒤(햄스트링)가 길게 늘어나고 둔근으로 일어서는 느낌. 허리 아래쪽이 타듯 아프면 척추가 굽은 신호다.',
      mistakes: [
        '무릎을 과하게 굽혀 스쿼트처럼 한다 → 무릎 각도는 고정하고 엉덩이 경첩으로만 움직인다.',
        '바가 다리에서 떨어진다 → 바를 정강이·허벅지에 스치듯 붙여 이동시킨다.',
        '허리를 둥글게 말아 더 깊이 내린다 → 가동범위를 줄이고 척추 중립을 유지한다.'
      ],
      breathing: '내리기 전 숨을 채워 복압을 잡고(고중량 시 발살바), 일어서며 내쉰다.',
      refUrl: ''
    }
  },
  'leg-press': {
    id: 'leg-press',
    demoId: 'Leg_Press',
    name: '레그 프레스',
    bodyPart: 'legs',
    equipment: 'machine',
    pattern: 'squat',
    weighted: true,
    increment: 2.5,
    repRange: [5, 8],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    guide: {
      target: '대퇴사두근·둔근, 보조로 햄스트링',
      cues: [
        '등판에 허리·골반을 밀착하고 발은 발판 중앙에 어깨너비로 둔다.',
        '안전핀을 풀고 무릎이 발끝 방향을 향하게 통제하며 천천히 내린다.',
        '허벅지가 몸통에 가까워질 때까지 내리되 골반이 들리기 직전에 멈춘다.',
        '발 전체로 발판을 밀어 무릎을 끝까지 잠그지 말고 펴낸다.'
      ],
      feel: '허벅지 앞과 엉덩이가 함께 밀어내는 느낌. 무릎 앞쪽이 콕콕 쑤시면 깊이나 발 위치를 점검한다.',
      mistakes: [
        '무릎이 안으로 모인다(외반) → 무릎을 발끝 방향으로 벌려 밀어낸다.',
        '너무 깊이 내려 골반이 들린다 → 허리가 등판에서 뜨기 직전까지만 내린다.',
        '정점에서 무릎을 딱 잠근다 → 살짝 여유를 남겨 관절 부담을 줄인다.'
      ],
      breathing: '내릴 때 들이마시고, 밀어낼 때 내쉰다(고중량 시 가벼운 발살바).',
      refUrl: ''
    }
  },
  'leg-extension': {
    id: 'leg-extension',
    demoId: 'Leg_Extensions',
    name: '레그 익스텐션',
    bodyPart: 'legs',
    equipment: 'machine',
    pattern: 'isolation',
    weighted: true,
    increment: 2.5,
    repRange: [10, 15],
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    guide: {
      target: '대퇴사두근',
      cues: [
        '등받이를 조절해 무릎 관절축이 기계 회전축과 일치하도록 앉는다.',
        '발목 패드를 발등 위쪽에 걸고 손잡이를 잡아 상체를 고정한다.',
        '무릎을 펴 다리를 들어올리며 정점에서 허벅지 앞을 1초 조인다.',
        '내릴 때 반동 없이 통제하며 시작 직전까지만 천천히 되돌린다.'
      ],
      feel: '허벅지 앞쪽이 단독으로 타듯 수축하는 느낌. 무릎 관절이 시큰하면 무게나 패드 위치를 조정한다.',
      mistakes: [
        '반동으로 다리를 차올린다 → 속도를 낮춰 근육으로만 들어올린다.',
        '엉덩이가 의자에서 들린다 → 손잡이로 상체를 눌러 골반을 고정한다.',
        '내릴 때 추를 떨군다 → 신장성 구간을 통제해 자극을 유지한다.'
      ],
      breathing: '다리를 펴며 내쉬고, 내릴 때 들이마신다.',
      refUrl: ''
    }
  },
  'lying-leg-curl': {
    id: 'lying-leg-curl',
    demoId: 'Lying_Leg_Curls',
    name: '라잉 레그 컬',
    bodyPart: 'legs',
    equipment: 'machine',
    pattern: 'isolation',
    weighted: true,
    increment: 2.5,
    repRange: [10, 15],
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    guide: {
      target: '햄스트링, 보조로 종아리',
      cues: [
        '벤치에 엎드려 무릎이 패드 가장자리 밖으로 살짝 나오게 눕는다.',
        '발목 패드를 아킬레스건 바로 위에 걸고 손잡이를 잡아 상체를 고정한다.',
        '발뒤꿈치를 엉덩이 쪽으로 당겨 무릎을 끝까지 굽히고 정점에서 조인다.',
        '반동 없이 통제하며 다리를 다 펴기 직전까지 천천히 되돌린다.'
      ],
      feel: '허벅지 뒤가 짧아지며 조이는 느낌. 무릎 뒤 오금이 당기듯 아프면 패드 위치를 위로 옮긴다.',
      mistakes: [
        '엉덩이를 들썩이며 반동을 쓴다 → 골반을 벤치에 눌러 고정하고 다리만 움직인다.',
        '발끝을 곧게 펴 종아리에 힘을 뺀다 → 발끝을 정강이로 당겨 햄스트링 수축을 강화한다.',
        '내릴 때 추를 떨군다 → 신장성 구간을 통제해 긴장을 유지한다.'
      ],
      breathing: '다리를 당겨 굽힐 때 내쉬고, 펼 때 들이마신다.',
      refUrl: ''
    }
  },
  'standing-calf-raise': {
    id: 'standing-calf-raise',
    demoId: 'Standing_Calf_Raises',
    name: '스탠딩 카프 레이즈',
    bodyPart: 'legs',
    equipment: 'machine',
    pattern: 'isolation',
    weighted: true,
    increment: 2.5,
    repRange: [10, 15],
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    guide: {
      target: '종아리(비복근)',
      cues: [
        '어깨 패드 아래로 들어가 무릎을 편 채 발 앞쪽을 발판에 올린다.',
        '발뒤꿈치를 발판 아래로 충분히 내려 종아리를 길게 늘인다.',
        '발끝으로 밀어 발뒤꿈치를 최대한 높이 들고 정점에서 1초 멈춘다.',
        '천천히 통제하며 시작 위치까지 발뒤꿈치를 내린다.'
      ],
      feel: '종아리가 길게 늘어났다가 정점에서 강하게 조이는 느낌. 발목 관절만 뻐근하면 가동범위를 확보한다.',
      mistakes: [
        '반동으로 통통 튕긴다 → 정점과 바닥에서 멈춰 전 가동범위를 쓴다.',
        '가동범위가 짧다 → 뒤꿈치를 끝까지 내리고 끝까지 들어 신장과 수축을 모두 확보한다.',
        '무릎을 굽혀 비복근을 풀어준다 → 무릎을 편 채로 유지해 비복근에 집중한다.'
      ],
      breathing: '발뒤꿈치를 들어올리며 내쉬고, 내릴 때 들이마신다.',
      refUrl: ''
    }
  },
'barbell-curl': {
    id: 'barbell-curl',
    demoId: 'Barbell_Curl',
    name: '바벨 컬',
    bodyPart: 'arms',
    equipment: 'barbell',
    pattern: 'isolation',
    weighted: true,
    increment: 2.5,
    repRange: [10, 15],
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    guide: {
      target: '이두근, 보조로 전완근',
      cues: [
        '바를 어깨너비로 언더그립으로 잡고 똑바로 선다.',
        '팔꿈치를 옆구리에 고정한 채 위치를 흔들지 않는다.',
        '이두근의 힘으로만 바를 어깨 앞까지 말아 올린다.',
        '정점에서 이두근을 짧게 조인 뒤 천천히 내려 완전히 편다.'
      ],
      feel: '이두근 앞쪽이 수축하며 조여지는 느낌. 손목이나 어깨 앞이 아프면 그립이 넓거나 반동을 쓰는 신호다.',
      mistakes: [
        '상체를 뒤로 젖히며 반동을 쓴다 → 코어를 잠그고 팔만 움직인다.',
        '팔꿈치가 앞으로 끌려간다 → 팔꿈치를 옆구리에 붙여 고정한다.',
        '내릴 때 끝까지 펴지 않는다 → 매 반복 팔을 완전히 신전해 가동 범위를 확보한다.'
      ],
      breathing: '올릴 때 내쉬고 내릴 때 들이마신다.',
      refUrl: ''
    }
  },
  'dumbbell-curl': {
    id: 'dumbbell-curl',
    demoId: 'Dumbbell_Bicep_Curl',
    name: '덤벨 컬',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    pattern: 'isolation',
    weighted: true,
    increment: 2,
    repRange: [10, 15],
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    guide: {
      target: '이두근, 보조로 전완근',
      cues: [
        '양손에 덤벨을 들고 손바닥이 몸쪽을 향하게 선다.',
        '팔꿈치를 옆구리에 고정하고 올리는 동안 손목을 바깥으로 돌려 수파인한다.',
        '이두근으로 덤벨을 어깨 앞까지 말아 올린다.',
        '정점에서 짧게 조인 뒤 통제하며 내려 팔을 완전히 편다.'
      ],
      feel: '이두근이 회전과 함께 강하게 조여지는 느낌. 어깨가 앞으로 말리면 무게가 과하거나 반동을 쓰는 신호다.',
      mistakes: [
        '몸통을 좌우로 흔들며 올린다 → 코어를 잠그고 팔만 움직인다.',
        '손목 회전 없이 그냥 올린다 → 올리며 새끼손가락을 위로 돌려 수축을 극대화한다.',
        '빠르게 떨어뜨리듯 내린다 → 천천히 통제하며 신장 구간을 활용한다.'
      ],
      breathing: '올릴 때 내쉬고 내릴 때 들이마신다.',
      refUrl: ''
    }
  },
  'hammer-curl': {
    id: 'hammer-curl',
    demoId: 'Hammer_Curls',
    name: '해머 컬',
    bodyPart: 'arms',
    equipment: 'dumbbell',
    pattern: 'isolation',
    weighted: true,
    increment: 2,
    repRange: [10, 15],
    primaryMuscles: ['biceps', 'forearms'],
    secondaryMuscles: [],
    guide: {
      target: '이두근(상완요골근 포함)과 전완근',
      cues: [
        '양손에 덤벨을 들고 손바닥이 서로 마주보는 중립 그립을 유지한다.',
        '팔꿈치를 옆구리에 고정하고 그립을 끝까지 중립으로 유지한다.',
        '망치를 휘두르듯 덤벨을 어깨 앞까지 말아 올린다.',
        '정점에서 짧게 조인 뒤 통제하며 내려 팔을 완전히 편다.'
      ],
      feel: '이두근 바깥쪽과 전완 윗부분이 함께 조여지는 느낌. 손목이 꺾이거나 통증이 있으면 그립이 무너진 신호다.',
      mistakes: [
        '올리며 손바닥이 위로 돌아간다 → 중립 그립을 끝까지 유지한다.',
        '반동으로 들어 올린다 → 상체를 고정하고 팔만 움직인다.',
        '팔꿈치가 앞으로 나간다 → 옆구리에 붙여 고정한다.'
      ],
      breathing: '올릴 때 내쉬고 내릴 때 들이마신다.',
      refUrl: ''
    }
  },
  'triceps-pushdown': {
    id: 'triceps-pushdown',
    demoId: 'Triceps_Pushdown',
    name: '케이블 트라이셉스 푸시다운',
    bodyPart: 'arms',
    equipment: 'cable',
    pattern: 'isolation',
    weighted: true,
    increment: 2,
    repRange: [10, 15],
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    guide: {
      target: '삼두근',
      cues: [
        '하이 풀리에 바나 로프를 걸고 어깨너비로 잡는다.',
        '상체를 약간 앞으로 기울이고 팔꿈치를 옆구리에 고정한다.',
        '팔꿈치 위치를 고정한 채 전완만 내려 팔을 완전히 편다.',
        '바닥 정점에서 삼두근을 짧게 조인 뒤 통제하며 되돌린다.'
      ],
      feel: '삼두근 뒤쪽이 펴지는 구간에서 강하게 조여지는 느낌. 어깨나 팔꿈치가 아프면 팔꿈치가 흔들리는 신호다.',
      mistakes: [
        '팔꿈치가 앞뒤로 흔들린다 → 옆구리에 붙여 회전축으로만 사용한다.',
        '상체를 위아래로 펌프질한다 → 몸통을 고정하고 전완만 움직인다.',
        '끝까지 펴지 않는다 → 정점에서 팔을 완전히 신전해 수축을 만든다.'
      ],
      breathing: '내려 펼 때 내쉬고 되돌릴 때 들이마신다.',
      refUrl: ''
    }
  },
  'lying-triceps-extension': {
    id: 'lying-triceps-extension',
    demoId: 'Lying_Triceps_Press',
    name: '라잉 트라이셉스 익스텐션',
    bodyPart: 'arms',
    equipment: 'barbell',
    pattern: 'isolation',
    weighted: true,
    increment: 2.5,
    repRange: [10, 15],
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    guide: {
      target: '삼두근',
      cues: [
        '벤치에 누워 EZ바나 바를 어깨너비보다 좁게 잡고 팔을 위로 뻗는다.',
        '상완을 살짝 머리 쪽으로 기울여 삼두근에 장력을 건다.',
        '팔꿈치 위치를 고정한 채 전완만 굽혀 바를 이마 위나 정수리 뒤로 내린다.',
        '삼두근의 힘으로 팔을 다시 완전히 펴 올린다.'
      ],
      feel: '삼두근이 늘어났다가 펴며 조여지는 느낌. 팔꿈치 관절이 시큰하면 무게가 과하거나 팔꿈치를 너무 벌린 신호다.',
      mistakes: [
        '팔꿈치가 바깥으로 벌어진다 → 어깨너비로 모아 고정한다.',
        '상완이 함께 움직여 풀오버가 된다 → 상완을 고정하고 전완만 굽힌다.',
        '바를 빠르게 떨어뜨린다 → 통제하며 내려 신장 구간을 안전하게 다룬다.'
      ],
      breathing: '내릴 때 들이마시고 밀어 펼 때 내쉰다.',
      refUrl: ''
    }
  },
'treadmill-run': {
    id: 'treadmill-run',
    demoId: 'Running_Treadmill',
    name: '트레드밀 러닝',
    bodyPart: 'cardio',
    equipment: 'machine',
    pattern: 'cardio',
    weighted: false,
    increment: 0,
    repRange: [0, 0],
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes'],
    guide: {
      target: '대퇴사두근·햄스트링·종아리, 보조로 둔근(전신 유산소)',
      cues: [
        '벨트가 멈춘 상태에서 양옆 손잡이를 잡고 올라선 뒤 천천히 속도를 올린다.',
        '시선은 정면을 보고 상체를 살짝만 앞으로 기울여 곧게 세운다.',
        '발은 중족부로 가볍게 디디며 보폭을 과하게 늘리지 않는다.',
        '팔은 90도로 굽혀 어깨 힘을 빼고 앞뒤로 자연스럽게 흔든다.',
        '마무리는 속도를 단계적으로 낮춰 걷기로 전환한 뒤 정지한다.'
      ],
      feel: '허벅지와 종아리에 지속적인 펌핑과 호흡 상승이 느껴진다. 정강이 앞쪽이 타는 듯 아프면 발뒤꿈치로 착지하며 보폭이 과한 신호다.',
      mistakes: [
        '손잡이를 계속 붙잡고 달린다 → 손을 떼고 자연스러운 팔 스윙으로 칼로리 소모와 균형을 확보한다.',
        '발뒤꿈치로 쾅쾅 착지한다 → 중족부로 가볍게 굴리듯 디뎌 무릎 충격을 줄인다.',
        '상체를 뒤로 젖히거나 과하게 숙인다 → 골반 위로 몸통을 곧게 세워 호흡로를 연다.',
        '처음부터 최고 속도로 시작한다 → 3~5분 워밍업으로 점진적으로 올린다.'
      ],
      breathing: '리듬에 맞춰 코로 들이마시고 입으로 길게 내쉬며 일정한 호흡 주기를 유지한다.',
      refUrl: ''
    }
  },
  'incline-walk': {
    id: 'incline-walk',
    demoId: 'Walking_Treadmill',
    name: '경사 빠르게 걷기',
    bodyPart: 'cardio',
    equipment: 'machine',
    pattern: 'cardio',
    weighted: false,
    increment: 0,
    repRange: [0, 0],
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['quads', 'calves'],
    guide: {
      target: '둔근·햄스트링, 보조로 대퇴사두근·종아리(경사 유산소)',
      cues: [
        '경사를 8~15% 범위로 올리고 손잡이를 잡지 않은 채 걷기 시작한다.',
        '상체를 곧게 세우고 시선은 정면을 본다.',
        '발 전체로 디디며 뒤꿈치로 바닥을 밀어 둔근에 힘을 싣는다.',
        '보폭을 넓혀 엉덩이가 뒤에서 늘어났다가 펴지는 느낌을 만든다.',
        '마무리는 경사를 낮추고 속도를 줄여 평지 걷기로 정리한다.'
      ],
      feel: '엉덩이와 햄스트링 뒤쪽이 당기고 데워지는 느낌. 종아리 앞이나 허리가 과하게 뻐근하면 손잡이에 기대 상체가 무너진 신호다.',
      mistakes: [
        '손잡이에 체중을 실어 매달린다 → 손을 떼거나 가볍게만 닿아 다리로 온전히 부하를 받는다.',
        '발끝으로만 종종걸음 한다 → 보폭을 넓혀 뒤꿈치로 밀며 둔근을 동원한다.',
        '상체를 앞으로 무너뜨린다 → 골반 위로 몸통을 세워 자세를 유지한다.',
        '경사만 높이고 속도도 과하게 올린다 → 자세 유지가 가능한 속도로 조절한다.'
      ],
      breathing: '걸음 리듬에 맞춰 코로 들이마시고 입으로 내쉬며 대화 가능한 강도를 유지한다.',
      refUrl: ''
    }
  },
  'stationary-bike': {
    id: 'stationary-bike',
    demoId: 'Bicycling_Stationary',
    name: '실내 사이클',
    bodyPart: 'cardio',
    equipment: 'machine',
    pattern: 'cardio',
    weighted: false,
    increment: 0,
    repRange: [0, 0],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    guide: {
      target: '대퇴사두근·둔근, 보조로 햄스트링·종아리(하체 유산소)',
      cues: [
        '안장 높이를 페달이 가장 낮을 때 무릎이 살짝만 굽도록 맞춘다.',
        '핸들을 가볍게 잡고 등을 곧게 펴 상체 긴장을 뺀다.',
        '발 앞쪽을 페달에 얹고 원을 그리듯 누르고 끌어올린다.',
        '저항을 다리에 부하가 느껴질 정도로 올려 헛도는 페달링을 피한다.',
        '마무리는 저항을 낮춰 가벼운 페달링으로 쿨다운한다.'
      ],
      feel: '허벅지 앞쪽과 엉덩이에 지속적인 펌핑이 차오르는 느낌. 무릎 앞쪽이 시큰하면 안장이 너무 낮은 신호다.',
      mistakes: [
        '안장이 너무 낮다 → 페달 최저점에서 무릎이 약 25~35도만 굽도록 높인다.',
        '저항 없이 빠르게만 돌린다 → 다리에 부하가 실리도록 저항을 적절히 올린다.',
        '상체를 핸들에 무겁게 기댄다 → 코어로 몸통을 지지하고 손은 가볍게만 둔다.',
        '발끝으로만 누른다 → 페달 전체를 원형으로 밀고 당겨 효율을 높인다.'
      ],
      breathing: '페달 회전 리듬에 맞춰 코로 들이마시고 입으로 길게 내쉰다.',
      refUrl: ''
    }
  },
  'rowing-machine': {
    id: 'rowing-machine',
    demoId: 'Rowing_Stationary',
    name: '로잉 머신',
    bodyPart: 'cardio',
    equipment: 'machine',
    pattern: 'cardio',
    weighted: false,
    increment: 0,
    repRange: [0, 0],
    primaryMuscles: ['lats', 'quads'],
    secondaryMuscles: ['glutes', 'upper-back', 'biceps'],
    guide: {
      target: '광배근·대퇴사두근, 보조로 둔근·상부등·이두근(전신 유산소)',
      cues: [
        '발을 발판에 고정하고 정강이가 수직이 되도록 무릎을 굽혀 캐치 자세를 잡는다.',
        '먼저 다리로 바닥을 밀어 펴고(다리→상체→팔 순서) 마지막에 손잡이를 갈비뼈 아래로 당긴다.',
        '당길 때 등을 곧게 세우고 견갑을 모으며 상체를 약간만 뒤로 기울인다.',
        '복귀는 역순으로 팔을 먼저 펴고 상체를 세운 뒤 무릎을 굽혀 부드럽게 돌아온다.',
        '마무리는 스트로크 속도를 낮춰 가벼운 로잉으로 정리한다.'
      ],
      feel: '드라이브에서 다리와 등 전체로 힘이 퍼지고 당길 때 광배에 수축이 느껴진다. 허리 아래쪽이 찌릿하면 다리보다 등을 먼저 쓴 신호다.',
      mistakes: [
        '팔로 먼저 당긴다 → 다리→상체→팔 순서를 지켜 다리에서 힘을 시작한다.',
        '등을 둥글게 말고 당긴다 → 척추 중립을 유지하고 견갑을 모으며 당긴다.',
        '복귀 시 무릎을 먼저 굽힌다 → 손잡이가 무릎을 지난 뒤 무릎을 굽혀 충돌을 막는다.',
        '상체를 과하게 뒤로 눕힌다 → 종료 시 몸통을 수직에서 약간만 뒤로 둔다.'
      ],
      breathing: '드라이브로 밀며 내쉬고 복귀하며 들이마셔 스트로크마다 한 호흡을 맞춘다.',
      refUrl: ''
    }
  }
}

export function exercisesByBodyPart(part) {
  return Object.values(exercises).filter((e) => e.bodyPart === part)
}

export function getExercise(id) {
  return exercises[id] || null
}

export function allExercises() {
  return Object.values(exercises)
}
