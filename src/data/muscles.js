// 근육 taxonomy (18) + 한 줄 설명. bodyMap.js 의 muscle id 와 1:1.
// view: 가이드 바디맵에서 어느 면에 표시되는지 (front / back / both).

export const muscles = {
  chest: { id: 'chest', name: '가슴 (대흉근)', view: 'front', desc: '미는 동작의 주력. 팔을 몸 앞·안쪽으로 모으며 상체 밀기 파워를 낸다.' },
  'front-delts': { id: 'front-delts', name: '전면 삼각근', view: 'front', desc: '어깨 앞쪽. 팔을 앞·위로 들어올리는 프레스 동작에 크게 관여한다.' },
  'side-delts': { id: 'side-delts', name: '측면 삼각근', view: 'front', desc: '어깨 너비(볼륨)를 만드는 부위. 팔을 옆으로 벌리는 동작이 핵심.' },
  'rear-delts': { id: 'rear-delts', name: '후면 삼각근', view: 'back', desc: '어깨 뒤쪽. 팔을 뒤로 당기고 벌리는 동작, 자세 균형에 중요하다.' },
  biceps: { id: 'biceps', name: '이두근', view: 'front', desc: '팔 앞쪽. 팔꿈치를 굽히고(컬) 당기기 동작을 보조한다.' },
  triceps: { id: 'triceps', name: '삼두근', view: 'back', desc: '팔 뒤쪽, 팔 크기의 2/3. 팔꿈치를 펴는 모든 미는 동작의 핵심.' },
  forearms: { id: 'forearms', name: '전완근', view: 'both', desc: '손목·그립을 담당. 당기기·캐리 종목에서 악력 한계를 좌우한다.' },
  abs: { id: 'abs', name: '복근', view: 'front', desc: '몸통 앞면. 상체를 굽히고 복압으로 척추를 안정시킨다.' },
  obliques: { id: 'obliques', name: '복사근', view: 'front', desc: '몸통 측면. 회전·측굴과 코어 안정에 관여한다.' },
  traps: { id: 'traps', name: '승모근', view: 'both', desc: '목~상부 등. 견갑을 올리고 모으며 데드리프트·로우에서 강하게 작용.' },
  lats: { id: 'lats', name: '광배근', view: 'back', desc: '등 넓이를 만드는 큰 근육. 팔을 아래·뒤로 당기는 동작이 핵심.' },
  'upper-back': { id: 'upper-back', name: '상부 등 (능형근/중부 승모)', view: 'back', desc: '견갑 사이. 견갑을 모아 등 두께와 자세를 만든다.' },
  'lower-back': { id: 'lower-back', name: '기립근 (하부 등)', view: 'back', desc: '척추를 따라 세로로. 상체를 세우고 힌지 동작에서 척추를 지탱한다.' },
  glutes: { id: 'glutes', name: '둔근', view: 'back', desc: '엉덩이. 고관절을 펴는 가장 강한 근육으로 스쿼트·힌지의 주력.' },
  quads: { id: 'quads', name: '대퇴사두근', view: 'front', desc: '허벅지 앞쪽. 무릎을 펴 스쿼트·레그프레스의 주된 힘을 낸다.' },
  hamstrings: { id: 'hamstrings', name: '햄스트링', view: 'back', desc: '허벅지 뒤쪽. 무릎을 굽히고 고관절을 펴는 힌지 동작에 작용.' },
  calves: { id: 'calves', name: '종아리', view: 'both', desc: '발목을 펴(까치발) 추진력과 안정성을 낸다.' },
  adductors: { id: 'adductors', name: '내전근', view: 'front', desc: '허벅지 안쪽. 다리를 모으고 와이드 스쿼트·런지에서 보조한다.' }
}

export function muscleName(id) {
  return muscles[id]?.name || id
}
export function muscleDesc(id) {
  return muscles[id]?.desc || ''
}
