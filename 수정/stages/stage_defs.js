// assets/js/stage/stage_defs.js
(function (global) {
  const EnemyTypes = {
    Basic:  { speedY: [60, 120], size: 28, tint: 0xff5a5a },
    ZigZag: { speedY: [70, 130], size: 26, tint: 0xffb24d, zigAmp: 42, zigHz: 1.2 },
    Tank:   { speedY: [40, 80],  size: 36, tint: 0xcc3344, hp: 6 },
  };

  const W = (t, duration, repeatEvery, count, type, region, params = {}) =>
    ({ t, duration, repeatEvery, count, type, region, params });

  const EASY = {
    E01: {
      name: '튜토리얼 — 기본 조작',
      lengthSec: 60,
      tutorial: true,
      safeMode: false,        // ← 튜토리얼에서도 피격/무적 연출 포함 실제 전투
      bulletScale: 0.8,       // ← 조금 느린 탄속(원하면 조정)
      enemyFire: true, 
      // === added ===
      enemyImage: 'enemy1',
      middle_boss: false,
      boss: false,
      // =============
      tips: [
        { at: 0.5,  text: '이동: WASD/화살표로 움직여 보세요.' },
        { at: 6,    text: '사격: 스페이스로 발사!' },
        { at: 12,   text: '회피: 천천히 내려오는 탄을 피해보세요.' },
        { at: 28,   text: '좋아요! 짧은 웨이브를 클리어하면 튜토리얼 완료.' },
      ],
      waves: [
        W(0,   10, 2.5, 2, 'Basic',  'top-random', {}),
        W(12,  10, 2.0, 3, 'Basic',  'top-random', {}),
        W(24,  16, 3.0, 3, 'ZigZag', 'top-random', { amp: 28, hz: 0.9 }),
      ],
    },

    E02: {
      name: '초원 방어선',
      lengthSec: 75,
      bulletScale: 0.8,
      // === added ===
      enemyImage: 'enemy1',
      middle_boss: false,
      boss: false,
      // =============
      waves: [
        W(0,  12, 2.0, 2, 'Basic',  'top-random'),
        W(12, 12, 2.5, 3, 'Basic',  'top-random'),
        W(28, 16, 2.0, 4, 'ZigZag', 'top-random', { amp: 38, hz: 1.1 }),
        W(48, 16, 4.0, 2, 'Tank',   'top-mid'),
      ],
    },

    E03: {
      name: '협곡 통로',
      lengthSec: 80,
      bulletScale: 0.85,
      // === added ===
      enemyImage: 'enemy2',
      middle_boss: true,
      middleBossImage: 'midboss1',
      boss: false,
      // =============
      waves: [
        W(0,  16, 2.2, 3, 'ZigZag', 'top-random', { amp: 42, hz: 1.2 }),
        W(14, 14, 4.0, 2, 'Tank',   'top-mid'),
        W(30, 20, 1.8, 4, 'Basic',  'top-random'),
      ],
    },

    E04: {
      name: '야영지 급습',
      lengthSec: 85,
      bulletScale: 0.9,
      // === added ===
      enemyImage: 'enemy2',
      middle_boss: false,
      boss: false,
      // =============
      waves: [
        W(0, 16, 2.0, 3, 'Basic',  'top-random'),
        W(14,18, 1.8, 4, 'ZigZag', 'top-random', { amp: 46, hz: 1.25 }),
        W(40,18, 4.0, 2, 'Tank',   'top-mid'),
      ],
    },

    E05: {
      name: '공습 차단',
      lengthSec: 90,
      bulletScale: 0.95,
      // === added ===
      enemyImage: 'enemy3',
      middle_boss: false,
      boss: false,
      // =============
      waves: [
        W(0,  20, 2.0, 3, 'ZigZag', 'top-random', { amp: 48, hz: 1.3 }),
        W(20, 20, 1.6, 4, 'Basic',  'top-random'),
        W(48, 12, 3.5, 2, 'Tank',   'top-mid'),
      ],
    },

    E06: {
      name: '연료기지',
      lengthSec: 90,
      bulletScale: 1.0,
      // === added ===
      enemyImage: 'enemy3',
      middle_boss: true,
      middleBossImage: 'midboss1',
      boss: false,
      // =============
      waves: [
        W(0,  18, 1.8, 4, 'Basic',  'top-random'),
        W(16, 22, 1.8, 4, 'ZigZag', 'top-random', { amp: 52, hz: 1.35 }),
        W(44, 18, 3.2, 3, 'Tank',   'top-mid'),
      ],
    },

    E07: {
      name: '설원 돌파',
      lengthSec: 95,
      bulletScale: 1.05,
      // === added ===
      enemyImage: 'enemy4',
      middle_boss: false,
      boss: false,
      // =============
      waves: [
        W(0,  22, 1.7, 4, 'ZigZag', 'top-random', { amp: 54, hz: 1.4 }),
        W(18, 22, 1.6, 5, 'Basic',  'top-random'),
        W(46, 18, 3.0, 3, 'Tank',   'top-mid'),
      ],
    },

    E08: {
      name: '통신기지',
      lengthSec: 95,
      bulletScale: 1.1,
      // === added ===
      enemyImage: 'enemy4',
      middle_boss: true,
      middleBossImage: 'midboss1',
      boss: false,
      // =============
      waves: [
        W(0,  20, 1.6, 4, 'Basic',  'top-random'),
        W(16, 22, 1.5, 5, 'ZigZag', 'top-random', { amp: 56, hz: 1.45 }),
        W(44, 20, 2.8, 3, 'Tank',   'top-mid'),
      ],
    },

    E09: {
      name: '해협 교차로',
      lengthSec: 100,
      bulletScale: 1.15,
      // === added ===
      enemyImage: 'enemy5',
      middle_boss: false,
      boss: true,
      bossImage: 'boss1',
      // =============
      waves: [
        W(0,  20, 1.5, 5, 'ZigZag', 'top-random', { amp: 58, hz: 1.5 }),
        W(18, 22, 1.4, 5, 'Basic',  'top-random'),
        W(46, 20, 2.6, 3, 'Tank',   'top-mid'),
      ],
    },

    E10: {
      name: '항만 탈환',
      lengthSec: 105,
      bulletScale: 1.2,
      // === added ===
      enemyImage: 'enemy5',
      middle_boss: false,
      boss: true,
      bossImage: 'boss1',
      // =============
      waves: [
        W(0,  22, 1.4, 5, 'ZigZag', 'top-random', { amp: 60, hz: 1.55 }),
        W(18, 24, 1.3, 6, 'Basic',  'top-random'),
        W(50, 22, 2.4, 4, 'Tank',   'top-mid'),
      ],
    },
  };

  const HARD = {
    H01: { 
      name: '산맥 관문', 
      lengthSec: 90,
      bulletScale: 1.2, 
      enemyImage: 'enemy6',
      middle_boss: false,
      boss: false,

      waves: [
      W(0,  20, 1.6, 3, 'ZigZag', 'top-random', { amp: 58, hz: 1.5 }),
      W(12, 18, 3.2, 3, 'Tank',   'top-mid'),
      W(30, 26, 1.4, 5, 'Basic',  'top-random'),
    ]},
    H02: { 
      name: '황무지 급습', 
      lengthSec: 95,
      bulletScale: 1.25, 
      enemyImage: 'enemy6',
      middle_boss: true,         // ← 스테이지 2부터 중간 보스 출현
      middleBossImage: 'midboss2',
      boss: false,
      waves: [
      W(0,  20, 1.5, 5, 'Basic',  'top-random'),
      W(16, 20, 1.5, 5, 'ZigZag', 'top-random', { amp: 60, hz: 1.6 }),
      W(44, 18, 3.0, 4, 'Tank',   'top-mid'),
    ]},
    H03: { 
      name: '사막 채널', 
      lengthSec: 95, 
      bulletScale: 1.3, 
      enemyImage: 'enemy10',
    middle_boss: true,
    middleBossImage: 'midboss2',
    boss: true,
    bossImage: 'boss2',
      waves: [
      W(0,  22, 1.4, 5, 'ZigZag', 'top-random', { amp: 62, hz: 1.65 }),
      W(18, 20, 1.3, 6, 'Basic',  'top-random'),
      W(44, 20, 2.8, 4, 'Tank',   'top-mid'),
    ]},
    H04: { 
      name: '고원 요새',
       lengthSec: 100, 
       bulletScale: 1.35, 
       enemyImage: 'enemy10',
    middle_boss: true,
    middleBossImage: 'midboss2',
    boss: true,
    bossImage: 'boss2',
       waves: [
      W(0,  22, 1.3, 6, 'Basic',  'top-random'),
      W(16, 24, 1.2, 6, 'ZigZag', 'top-random', { amp: 64, hz: 1.7 }),
      W(46, 22, 2.6, 4, 'Tank',   'top-mid'),
    ]},
    H05: { 
      name: '용암 지대', 
      lengthSec: 100, 
      bulletScale: 1.4, 
      enemyImage: 'enemy10',
    middle_boss: true,
    middleBossImage: 'midboss2',
    boss: true,
    bossImage: 'boss2',
      waves: [
      W(0,  24, 1.2, 6, 'ZigZag', 'top-random', { amp: 66, hz: 1.75 }),
      W(18, 24, 1.1, 7, 'Basic',  'top-random'),
      W(48, 20, 2.4, 4, 'Tank',   'top-mid'),
    ]},
    H06: { 
      name: '밤의 협곡', 
      lengthSec: 105, 
      bulletScale: 1.45, 
      enemyImage: 'enemy10',
    middle_boss: true,
    middleBossImage: 'midboss2',
    boss: true,
    bossImage: 'boss2',
      waves: [
      W(0,  24, 1.1, 7, 'Basic',  'top-random'),
      W(16, 26, 1.0, 7, 'ZigZag', 'top-random', { amp: 68, hz: 1.8 }),
      W(46, 24, 2.2, 4, 'Tank',   'top-mid'),
    ]},
    H07: { 
      name: '철벽 방위선', 
      lengthSec: 105, 
      bulletScale: 1.5, 
      enemyImage: 'enemy10',
    middle_boss: true,
    middleBossImage: 'midboss2',
    boss: true,
    bossImage: 'boss2',
      waves: [
      W(0,  26, 1.0, 7, 'ZigZag', 'top-random', { amp: 70, hz: 1.85 }),
      W(18, 24, 0.95, 7, 'Basic',  'top-random'),
      W(48, 22, 2.1, 5, 'Tank',   'top-mid'),
    ]},
    H08: { 
      name: '동토 최전선', 
      lengthSec: 110, 
      bulletScale: 1.55, 
      enemyImage: 'enemy10',
    middle_boss: true,
    middleBossImage: 'midboss2',
    boss: true,
    bossImage: 'boss2',
      waves: [
      W(0,  26, 0.95, 7, 'Basic',  'top-random'),
      W(16, 26, 0.9,  8, 'ZigZag', 'top-random', { amp: 72, hz: 1.9 }),
      W(46, 24, 2.0,  5, 'Tank',   'top-mid'),
    ]},
    H09: { 
      name: '극한 전투', 
      lengthSec: 110, 
      bulletScale: 1.6, 
      enemyImage: 'enemy10',
    middle_boss: true,
    middleBossImage: 'midboss2',
    boss: true,
    bossImage: 'boss2',
      waves: [
      W(0,  28, 0.9,  8, 'ZigZag', 'top-random', { amp: 74, hz: 1.95 }),
      W(16, 26, 0.85, 8, 'Basic',  'top-random'),
      W(44, 26, 1.9,  5, 'Tank',   'top-mid'),
    ]},
    H10: { 
      name: '사령부 돌격', 
      lengthSec: 115, 
      bulletScale: 1.65, 
      enemyImage: 'enemy10',
    middle_boss: true,
    middleBossImage: 'midboss2',
    boss: true,
    bossImage: 'boss2',
      waves: [
      W(0,  28, 0.85, 8, 'Basic',  'top-random'),
      W(14, 28, 0.82, 9, 'ZigZag', 'top-random', { amp: 76, hz: 2.0 }),
      W(44, 26, 1.8,  6, 'Tank',   'top-mid'),
    ]},
  };

  global.StageDefs = { STAGES: { easy: EASY, hard: HARD }, EnemyTypes };
})(window);