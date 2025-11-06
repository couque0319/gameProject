/* stage_manager.js (완전판)
 * PROJECT: MECH - Stage & Difficulty Manager (Phaser)
 * - URL 파라미터: ?difficulty=easy|hard (또는 ?diff=...), ?stage=01..10
 * - 두 가지 스테이지 정의 포맷 지원:
 *   (A) 신규: window.StageDefs.STAGES.easy.E01 / hard.H01 ... + 메타({tutorial,safeMode,bulletScale,enemyFire,tips, lengthSec, waves[]})
 *   (B) 구형: window.STAGE_DEFS[1..10] (waves만 있거나 기타 포맷) → 안전한 Fallback 변환
 * - 콜백 훅:
 *   StageManager.onApplyMeta({safeMode, bulletScale, enemyFire})
 *   StageManager.onShowTip(text)
 *   StageManager.onSpawnEnemy({x,y,type,def,params})
 * - API:
 *   StageManager.init({ scene, enemiesGroup })
 *   StageManager.loadStageByQuery(defaultDifficulty='easy', defaultEId='E1')  // 로딩만
 *   StageManager.start()               // 웨이브 스케줄 시작
 *   StageManager.setBattle(on)         // 전체 타이머 일시정지/재개
 *   StageManager.finish()              // 스테이지 종료(클리어 처리 등)
 *   StageManager.clear()               // 타이머/상태 정리
 */

(function (global) {
  'use strict';

  // ---------------------------------------
  // URL 파라미터 유틸
  // ---------------------------------------
  function getQueryParam(key, fallback = null) {
    try {
      const u = new URL(global.location.href);
      return u.searchParams.get(key) ?? fallback;
    } catch (e) {
      return fallback;
    }
  }
  function getDifficultyParam() {
    const raw = getQueryParam('difficulty') || getQueryParam('diff') || 'easy';
    const s = String(raw).toLowerCase();
    return (s === 'hard' || s === 'easy') ? s : 'easy';
  }
  function getStageParam() {
    const s = String(getQueryParam('stage','01')).replace(/\D/g,'');
    const n = parseInt(s || '1', 10);
    return Math.min(Math.max(1, n), 99); // 1..99
  }
  const pad2 = (n) => String(n).padStart(2,'0');

  // ---------------------------------------
  // 난이도 스케일 (원하면 확장)
  // ---------------------------------------
  const DIFF_SCALES = {
    easy:   { bulletSpeedScale: 0.6, enemyHpScale: 0.9,  spawnCountScale: 0.9 },
    hard:   { bulletSpeedScale: 1.35, enemyHpScale: 1.15, spawnCountScale: 1.1 },
  };
  function getScales(diffStr) {
    return DIFF_SCALES[diffStr] || DIFF_SCALES.easy;
  }

  // ---------------------------------------
  // 좌표/유틸
  // ---------------------------------------
  function toMs(secLike, fallbackSec=0) {
    const v = Number(secLike);
    return Number.isFinite(v) ? Math.round(v * 1000) : Math.round(fallbackSec * 1000);
  }
  function toNum(v, fb=0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // ---------------------------------------
  // 스테이지 정의 로딩 (신형/구형 모두 지원)
  // 반환 형식:
  //   {
  //     meta: { name, lengthSec, tutorial, safeMode, bulletScale, enemyFire, tips: [{at,text}, ...] }
  //     waves: [{ at(ms), duration(ms?), repeatEvery(ms), count, type, region, params }, ...]
  //   }
  // ---------------------------------------
  function loadStageDefinition(diff, stageNumber) {
    const EID = (diff === 'easy' ? 'E' : 'H') + String(stageNumber); // 예: E1, H1
    // (A) 신형 StageDefs
    if (global.StageDefs && global.StageDefs.STAGES && global.StageDefs.STAGES[diff]) {
      const dict = global.StageDefs.STAGES[diff];
      // 키가 E01/H01 또는 E1/H1 등일 수 있으니 둘 다 시도
      const key1 = (diff === 'easy' ? 'E' : 'H') + pad2(stageNumber); // E01
      const key2 = EID; // E1
      const def = dict[key1] || dict[key2];
      if (def) {
        const meta = {
          name: def.name || `${diff.toUpperCase()}-${pad2(stageNumber)}`,
          lengthSec: toNum(def.lengthSec, def.length || 0) || 0,
          tutorial: !!def.tutorial,
          safeMode: !!def.safeMode,
          bulletScale: toNum(def.bulletScale, 1.0),
          enemyFire: (def.enemyFire !== false),
          tips: Array.isArray(def.tips) ? def.tips.map(t => ({ at: toNum(t.at, 0), text: String(t.text||'') })) : [],
        };
        const waves = Array.isArray(def.waves) ? def.waves.map(w => ({
          at: toMs(w.t ?? w.at ?? 0, 0),
          duration: toMs(w.duration, 0),
          repeatEvery: Math.max(100, toMs(w.repeatEvery ?? w.interval ?? 1.0, 1.0)),
          count: clamp(toNum(w.count, 1), 1, 99),
          type: String(w.type || 'Basic'),
          region: String(w.region || 'top-random'),
          params: w.params || {}
        })) : [];
        return { meta, waves };
      }
    }

    // (B) 구형 STAGE_DEFS (번호 기반)
    if (global.STAGE_DEFS && global.STAGE_DEFS[stageNumber]) {
      const def = global.STAGE_DEFS[stageNumber];
      // waves 포맷을 알 수 없으므로 최대한 추정 및 안전 변환
      const waves = Array.isArray(def.waves) ? def.waves.map(w => ({
        at: toMs(w.at ?? 0, 0),
        duration: toMs(w.duration, 0),
        repeatEvery: Math.max(100, toMs(w.repeatEvery ?? 0.3, 0.3)),
        count: clamp(toNum(w.count, 3), 1, 99),
        type: String(w.type || 'Basic'),
        region: String(w.region || 'top-random'),
        params: w.params || {}
      })) : buildFallbackWaves();
      const meta = {
        name: def.name || `STAGE ${pad2(stageNumber)}`,
        lengthSec: toNum(def.lengthSec || def.length, 0),
        tutorial: !!def.tutorial,
        safeMode: !!def.safeMode,
        bulletScale: toNum(def.bulletScale, 1.0),
        enemyFire: (def.enemyFire !== false),
        tips: Array.isArray(def.tips) ? def.tips.map(t => ({ at: toNum(t.at, 0), text: String(t.text||'') })) : [],
      };
      return { meta, waves };
    }

    // (C) 미정의 → Fallback
    console.warn('[StageManager] stage definition not found, using fallback waves.');
    return { meta: { name: `${diff.toUpperCase()}-${pad2(stageNumber)}`, lengthSec: 60, tutorial:false, safeMode:false, bulletScale:1.0, enemyFire:true, tips:[] },
             waves: buildFallbackWaves() };
  }

  function buildFallbackWaves() {
    return [
      { at:  500, duration: 6000, repeatEvery: 500, count: 2, type:'Basic',  region:'top-random', params:{} },
      { at: 7000, duration: 6000, repeatEvery: 400, count: 3, type:'ZigZag', region:'top-random', params:{amp:40,hz:1.2} },
      { at: 14000, duration: 8000, repeatEvery: 350, count: 4, type:'Tank',   region:'top-mid',   params:{} },
    ];
  }

  // ---------------------------------------
  // StageManager 본체
  // ---------------------------------------
  const StageManager = {
    // 외부에서 연결할 씬/그룹
    scene: null,
    enemiesGroup: null,

    // 현재 스테이지 상태
    diff: 'easy',
    stageNum: 1,
    def: null,      // {meta,waves}
    timers: [],
    running: false,
    paused: false,
    startAt: 0,

    // 외부 훅 (필요 시 게임 쪽에서 할당)
    onApplyMeta: null,  // (meta)=>void
    onShowTip: null,    // (text)=>void
    onSpawnEnemy: null, // ({x,y,type,def,params})=>void

    // 초기화
    init({ scene, enemiesGroup }) {
      this.scene = scene;
      this.enemiesGroup = enemiesGroup;
    },

    // 파라미터로 스테이지 로드(아직 시작은 안 함)
    loadStageByQuery(defaultDifficulty='easy', defaultEId='E1') {
      this.diff = getDifficultyParam() || defaultDifficulty;
      const n = getStageParam(); // 1..99
      this.stageNum = n;
      this.def = loadStageDefinition(this.diff, n);
      return { diff: this.diff, stage: n, def: this.def };
    },

    // 메타를 게임 시스템에 적용
    _applyMeta() {
      if (!this.def || !this.def.meta) return;
      const scales = getScales(this.diff);
      const meta = {
        safeMode: !!this.def.meta.safeMode,
        enemyFire: (this.def.meta.enemyFire !== false),
        // bulletScale: 스테이지 자체 스케일 × 난이도 탄속 배수(적 탄/패턴이 참조)
        bulletScale: toNum(this.def.meta.bulletScale, 1.0) * (scales.bulletSpeedScale || 1.0),
        tutorial: !!this.def.meta.tutorial
      };
      if (typeof this.onApplyMeta === 'function') {
        try { this.onApplyMeta(meta); } catch(e){}
      }
      // 팁 스케줄
      if (Array.isArray(this.def.meta.tips)) {
        this.def.meta.tips.forEach(t => {
          const ms = Math.max(0, Math.floor((t.at || 0) * 1000));
          const text = String(t.text || '');
          const ev = this.scene.time.delayedCall(ms, () => {
            if (typeof this.onShowTip === 'function') {
              try { this.onShowTip(text); } catch(e){}
            }
          });
          this.timers.push(ev);
        });
      }
    },

    // 웨이브 스케줄 시작
    start() {
      if (!this.scene) { console.warn('[StageManager] scene not set'); return; }
      if (!this.def) { this.loadStageByQuery('easy','E1'); }
      this.clear(); // 혹시 남은 타이머 제거
      this.running = true;
      this.paused = false;
      this.startAt = this.scene.time.now;

      // 메타 적용
      this._applyMeta();

      // 웨이브 타이머 등록
      const waves = Array.isArray(this.def.waves) ? this.def.waves : [];
      waves.forEach((w) => {
        const startMs = Math.max(0, toNum(w.at, 0));
        const endMs   = startMs + Math.max(0, toNum(w.duration, 0));
        const period  = Math.max(100, toNum(w.repeatEvery, 1000));
        const count   = clamp(toNum(w.count, 1), 1, 99);

        const tm = this.scene.time.addEvent({
          delay: period,
          startAt: startMs,
          loop: true,
          callback: () => {
            // duration이 지정되면 마감 검사
            const now = this.scene.time.now - this.startAt;
            if (endMs > 0 && now > endMs) {
              tm.remove(false);
              return;
            }
            // 스폰 count만큼 수행
            for (let i = 0; i < count; i++) {
              const pos = this._getSpawnPos(w.region || 'top-random');
              const typeName = String(w.type || 'Basic');
              const def = this._getEnemyTypeDef(typeName, w.params || {});
              // 외부가 정의했으면 그 로직 실행, 아니면 기본 스폰
              if (typeof this.onSpawnEnemy === 'function') {
                try { this.onSpawnEnemy({ x: pos.x, y: pos.y, type: typeName, def, params: w.params || {} }); }
                catch(e){}
              } else {
                this._defaultSpawn(pos, def, typeName, w.params || {});
              }
            }
          }
        });
        this.timers.push(tm);
      });

      // 스테이지 종료 타이머
      const lenSec = toNum(this.def && this.def.meta && this.def.meta.lengthSec, 0);
      if (lenSec > 0) {
        const endTimer = this.scene.time.addEvent({
          delay: Math.floor(lenSec * 1000),
          loop: false,
          callback: () => this.finish()
        });
        this.timers.push(endTimer);
      }
    },

    // 배틀 일시정지/재개
    setBattle(on) {
      this.paused = !on;
      this.timers.forEach(t => t.paused = this.paused);
    },

    // 스테이지 종료(클리어 처리 등)
    finish() {
      this.running = false;
      // 튜토리얼 클리어 보상: EASY-01 완료 시 다음 스테이지 해제
      try {
        if (this.def && this.def.meta && this.def.meta.tutorial && this.diff === 'easy') {
          const key = 'progress_easy';
          const cur = Math.max(1, parseInt(global.localStorage.getItem(key) || '1', 10));
          if (cur < 2) global.localStorage.setItem(key, '2');
        }
      } catch (_) {}
      // 필요한 후처리는 외부에서 핸들(예: 보스 진입/클리어 UI)
    },

    // 타이머 정리
    clear() {
      this.timers.forEach(t => t.remove(false));
      this.timers.length = 0;
      this.running = false;
    },

    // ---------------------------------------------------
    // 내부 유틸: 기본 스폰, 스폰 위치/적 타입
    // ---------------------------------------------------
    _defaultSpawn(pos, typeDef, typeName, params) {
      if (!this.enemiesGroup || !this.scene) return;
      const e = this.enemiesGroup.create(pos.x, pos.y, 'enemy').setDepth(10);
      e.setOrigin(0.5).setDisplaySize(typeDef.size||28, typeDef.size||28).setTint(typeDef.tint||0xffffff);

      // 속도: 타입 기본값 + 난이도 배수(bulletScale는 적/탄/패턴 속도 스케일로 같이 사용)
      const scales = getScales(this.diff);
      const vyBase = this._randIn(typeDef.speedY || [60, 120]);
      const vy = vyBase * (toNum(this.def.meta && this.def.meta.bulletScale, 1.0) * (scales.bulletSpeedScale || 1.0));
      e.body.setVelocity(0, vy);

      // ZigZag 트윈(옵션)
      const amp = (params && params.amp) || typeDef.zigAmp || 0;
      const hz  = (params && params.hz)  || typeDef.zigHz || 0;
      if (amp > 0 && hz > 0) {
        this.scene.tweens.add({
          targets: e, x: { from: pos.x - amp, to: pos.x + amp },
          duration: Math.max(300, Math.floor(1000 / hz)), yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
      }
    },

    _getSpawnPos(region) {
      const W = this.scene.game.config.width;
      switch ((region||'top-random')) {
        case 'top-mid':     return { x: Math.round(W/2),        y: -40 };
        case 'top':         return { x: this._randIn([40, W-40]), y: -40 };
        case 'top-random':
        default:            return { x: this._randIn([40, W-40]), y: -40 };
      }
    },

    _getEnemyTypeDef(typeName, params) {
      const dict = (global.StageDefs && global.StageDefs.EnemyTypes) || {};
      // 기본값(없으면 심플)
      const fb = { size: 28, speedY: [60, 120], tint: 0xff5a5a };
      const base = dict[typeName] || fb;
      return { ...base, ...(params || {}) };
    },

    _randIn(range) {
      if (Array.isArray(range) && range.length === 2) {
        const a = Number(range[0]), b = Number(range[1]);
        if (Number.isFinite(a) && Number.isFinite(b)) return Phaser.Math.Between(a, b);
      }
      return Number(range) || 100;
    },
  };

  // 공개
  global.StageManager = StageManager;

  // (선택) 콘솔 디버그
  try {
    const diff = getDifficultyParam();
    const stage = getStageParam();
    console.log(`[StageManager] diff=${diff}, stage=${pad2(stage)}`);
  } catch (e) {}
})(window);