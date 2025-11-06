// assets/js/stages/stage_defs.js
// Canvas 전용 스테이지 정의(최종본) — StageManager.init(stageDef) / StageManager.update(dt, cbs)와 호환
// 웨이브 파라미터 요약:
//  - t: 웨이브 시작 시간(ms) — 보통 START + GAP * offset
//  - count: 스폰 수
//  - pattern: 'straight' | 'aim' | 'spread3' | 'spread5'
//  - form: 'line' | 'random' | 'edges'
//  - enemy: { hp, speedY, fireInt }    // 체력/하강속도(px/s)/발사간격(ms)
//  - repeat: (선택) 같은 웨이브를 추가로 반복 소환(총 횟수)
//  - every:  (선택) repeat 간격(ms)
//  - vx, vy: (선택) 폼 기본 이동값 덮어쓰기
//  - scatter: (선택) form:'random' 꼬리 간격(px)
//  - midBoss: [{ at, key }, ...], boss: { at, key }

(function (global) {
  const NS = (global.StageDefs = global.StageDefs || {});
  const STAGES = (NS.STAGES = NS.STAGES || {});

  // ===== 공통 타임라인 상수 =====
  const START = 1200;  // 첫 웨이브까지 대기(ms) - EASY
  const GAP   = 3000;  // 웨이브 간격(ms)       - EASY

  const START_H = 1000; // 첫 웨이브까지 대기(ms) - HARD(빠르게 시작)
  const GAP_H   = 3600; // 웨이브 간격(ms)       - HARD(조밀)

  // ===== 자주 쓰는 기본 파라미터 =====
  const ENEMY_BASE   = { hp: 3, speedY: 70,  fireInt: 1000 }; // EASY
  const ENEMY_BASE_H = { hp: 4, speedY: 84,  fireInt: 850  }; // HARD(권장 시작점)

  // 도우미(보스 타이밍 계산)
  const bossAt = (start, gap, lastOffset, delay=3500) => (start + gap * lastOffset) + delay;
  const midAt  = (start, gap, thirdOffset, delay=3000) => (start + gap * thirdOffset) + delay;

  // =========================================
  // EASY (완성본) — 중간보스: 03/06/08, 보스: 09/10
  // =========================================
  STAGES.easy = STAGES.easy || {};

  STAGES.easy['01'] = {
    id: '01', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 3,  pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 3,  pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 8 },
      { t: START + GAP*2, count: 3,  pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*3, count: 3, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 5, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
    ],
    midBoss: [{ at: midAt(START, GAP, 2), key: 'midboss1' }],
    boss: null
  };

  STAGES.easy['02'] = {
    id: '02', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 5,  pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 5,  pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 8 },
      { t: START + GAP*2, count: 3, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 2, every: 800 },
      { t: START + GAP*3, count: 7, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 7, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
    ],
    midBoss: [],
    boss: null
  };

  STAGES.easy['03'] = {
    id: '03', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 9,  pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 9,  pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 8 },
      { t: START + GAP*2, count: 12, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 2, every: 1000 },
      { t: START + GAP*3, count: 12, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 12, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
    ],
    midBoss: [{ at: midAt(START, GAP, 2), key: 'midboss1' }],
    boss: null
  };

  STAGES.easy['04'] = {
    id: '04', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 10, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 10, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 8 },
      { t: START + GAP*2, count: 12, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 3, every: 900 },
      { t: START + GAP*3, count: 14, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 14, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
    ],
    midBoss: [],
    boss: null
  };

  STAGES.easy['05'] = {
    id: '05', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 10, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 10, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 8 },
      { t: START + GAP*2, count: 14, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 2, every: 900 },
      { t: START + GAP*3, count: 14, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 16, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
    ],
    midBoss: [],
    boss: null
  };

  STAGES.easy['06'] = {
    id: '06', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 12, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 12, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 9 },
      { t: START + GAP*2, count: 16, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 2, every: 800 },
      { t: START + GAP*3, count: 16, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 16, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
    ],
    midBoss: [{ at: midAt(START, GAP, 2), key: 'midboss1' }],
    boss: null
  };

  STAGES.easy['07'] = {
    id: '07', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 12, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 12, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 9 },
      { t: START + GAP*2, count: 18, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 2, every: 800 },
      { t: START + GAP*3, count: 18, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 18, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 12 },
    ],
    midBoss: [],
    boss: null
  };

  STAGES.easy['08'] = {
    id: '08', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 14, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 14, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
      { t: START + GAP*2, count: 18, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 3, every: 800 },
      { t: START + GAP*3, count: 20, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 20, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 12 },
    ],
    midBoss: [{ at: midAt(START, GAP, 2), key: 'midboss1' }],
    boss: null
  };

  STAGES.easy['09'] = {
    id: '09', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 16, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 16, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
      { t: START + GAP*2, count: 20, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 3, every: 800 },
      { t: START + GAP*3, count: 22, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 22, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 12 },
    ],
    midBoss: [],
    boss: { at: bossAt(START, GAP, 4), key: 'boss1' }
  };

  STAGES.easy['10'] = {
    id: '10', difficulty: 'easy',
    waves: [
      { t: START + GAP*0, count: 18, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*1, count: 18, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE }, scatter: 10 },
      { t: START + GAP*2, count: 22, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE }, repeat: 3, every: 700 },
      { t: START + GAP*3, count: 24, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE } },
      { t: START + GAP*4, count: 24, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE }, scatter: 12 },
    ],
    midBoss: [],
    boss: { at: bossAt(START, GAP, 4), key: 'boss1' }
  };

  // =========================================
  // HARD (편집 템플릿) — 더 높은 밀도/속도/빈도
  // =========================================
  STAGES.hard = STAGES.hard || {};

  STAGES.hard['01'] = {
    id: '01', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 9,  pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*1, count: 9,  pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H }, scatter: 8 },
      { t: START_H + GAP_H*2, count: 12, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H }, repeat: 2, every: 900 },
      { t: START_H + GAP_H*3, count: 12, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 12, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H }, scatter: 10 },
    ],
    midBoss: [],
    boss: null
  };

  STAGES.hard['02'] = {
    id: '02', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 10, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*1, count: 10, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H }, scatter: 9 },
      { t: START_H + GAP_H*2, count: 14, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H, fireInt: 820 }, repeat: 2, every: 800 },
      { t: START_H + GAP_H*3, count: 14, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 14, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H }, scatter: 12 },
    ],
    // 필요하면 활성화
    midBoss: [{ at: midAt(START_H, GAP_H, 2), key: 'midboss1' }],
    boss: null
  };

  STAGES.hard['03'] = {
    id: '03', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 12, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H, hp: 5 } },
      { t: START_H + GAP_H*1, count: 12, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 820 }, scatter: 10 },
      { t: START_H + GAP_H*2, count: 16, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H }, repeat: 3, every: 800 },
      { t: START_H + GAP_H*3, count: 16, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 16, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 800 }, scatter: 12 },
    ],
    midBoss: [],
    boss: null
  };

  STAGES.hard['04'] = {
    id: '04', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 12, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H, hp: 5 } },
      { t: START_H + GAP_H*1, count: 12, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H }, scatter: 10 },
      { t: START_H + GAP_H*2, count: 18, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H, fireInt: 800 }, repeat: 3, every: 750 },
      { t: START_H + GAP_H*3, count: 18, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 18, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H }, scatter: 12 },
    ],
    midBoss: [],
    boss: null
  };

  STAGES.hard['05'] = {
    id: '05', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 14, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H, hp: 5, speedY: 88 } },
      { t: START_H + GAP_H*1, count: 14, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 780 }, scatter: 10 },
      { t: START_H + GAP_H*2, count: 18, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H }, repeat: 3, every: 700 },
      { t: START_H + GAP_H*3, count: 20, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 20, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 760 }, scatter: 12 },
    ],
    midBoss: [{ at: midAt(START_H, GAP_H, 2), key: 'midboss1' }],
    boss: null
  };

  STAGES.hard['06'] = {
    id: '06', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 16, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H, hp: 6, speedY: 90 } },
      { t: START_H + GAP_H*1, count: 16, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 760 }, scatter: 12 },
      { t: START_H + GAP_H*2, count: 20, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H }, repeat: 3, every: 700 },
      { t: START_H + GAP_H*3, count: 20, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 22, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 740 }, scatter: 12 },
    ],
    midBoss: [],
    boss: null
  };

  STAGES.hard['07'] = {
    id: '07', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 18, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H, hp: 6, speedY: 92 } },
      { t: START_H + GAP_H*1, count: 18, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 740 }, scatter: 12 },
      { t: START_H + GAP_H*2, count: 22, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H }, repeat: 3, every: 650 },
      { t: START_H + GAP_H*3, count: 22, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 24, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 720 }, scatter: 14 },
    ],
    midBoss: [{ at: midAt(START_H, GAP_H, 2), key: 'midboss1' }],
    boss: null
  };

  STAGES.hard['08'] = {
    id: '08', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 20, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H, hp: 6, speedY: 94 } },
      { t: START_H + GAP_H*1, count: 20, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 720 }, scatter: 12 },
      { t: START_H + GAP_H*2, count: 24, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H }, repeat: 4, every: 600 },
      { t: START_H + GAP_H*3, count: 24, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 26, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 700 }, scatter: 14 },
    ],
    midBoss: [],
    boss: { at: bossAt(START_H, GAP_H, 4), key: 'boss1' } // 필요시 보스 제거/이동 가능
  };

  STAGES.hard['09'] = {
    id: '09', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 22, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H, hp: 6, speedY: 96 } },
      { t: START_H + GAP_H*1, count: 22, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 700 }, scatter: 12 },
      { t: START_H + GAP_H*2, count: 26, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H }, repeat: 4, every: 600 },
      { t: START_H + GAP_H*3, count: 26, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 28, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 680 }, scatter: 14 },
    ],
    midBoss: [],
    boss: { at: bossAt(START_H, GAP_H, 4), key: 'boss1' }
  };

  STAGES.hard['10'] = {
    id: '10', difficulty: 'hard',
    waves: [
      { t: START_H + GAP_H*0, count: 24, pattern:'straight', form:'line',   enemy:{ ...ENEMY_BASE_H, hp: 6, speedY: 100 } },
      { t: START_H + GAP_H*1, count: 24, pattern:'aim',      form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 680 }, scatter: 14 },
      { t: START_H + GAP_H*2, count: 28, pattern:'spread3',  form:'line',   enemy:{ ...ENEMY_BASE_H }, repeat: 4, every: 550 },
      { t: START_H + GAP_H*3, count: 30, pattern:'aim',      form:'edges',  enemy:{ ...ENEMY_BASE_H } },
      { t: START_H + GAP_H*4, count: 30, pattern:'spread5',  form:'random', enemy:{ ...ENEMY_BASE_H, fireInt: 660 }, scatter: 16 },
    ],
    midBoss: [],
    boss: { at: bossAt(START_H, GAP_H, 4), key: 'boss1' }
  };
})(window);
