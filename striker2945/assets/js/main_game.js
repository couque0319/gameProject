// assets/js/main_game.js — NO STOP-LINE VERSION (final)
(() => {
  const W = 480, H = 720;

  // === 글로벌 업그레이드/코인(상점 연동) ===
  const Upg = (window.GameUpgrades = window.GameUpgrades || {
    coins: 0, power: 1, fireRate: 1.0, speed: 1.0,
    gunShots: 1, missileUnlocked: false, missileShots: 0, maxHP: 3
  });

  // === URL 파라미터 ===
  const qp  = (k, fb=null) => { try{ return new URLSearchParams(location.search).get(k) ?? fb; }catch{ return fb; } };
  const pad2= (n)=> String(n).padStart(2,'0');
  const DIFF = (qp('difficulty','easy')||'easy').toLowerCase(); // 'easy' | 'hard'
  const STG  = qp('stage','01');                                // 'E1'/'01'/'H10' 등
  const IS_TUTORIAL = (DIFF==='easy' && (/^(E?0?1|1)$/i).test(String(STG)));

  const config = {
    type: Phaser.AUTO, parent: 'game-root', width: W, height: H, backgroundColor: '#000',
    physics: { default:'arcade', arcade:{ gravity:{y:0}, debug:false } },
    scene: { preload, create, update }
  };

  let scene, player, enemies, pBullets, eBullets, items, mMissiles;
  let hudTextEl, coinHud, checklist;
  let metaState = { safeMode:false, bulletScale:1.0, enemyFire:true };
  let _isEventRunning = false;

  // ---------- Preload ----------
  function preload(){
    scene = this;
    hudTextEl = document.getElementById('hud');

    // ★ 고정 경로(사운드/플레이어)
    this.load.audio('hit', 'assets/audio/피격사운드.mp3');
    this.load.image('player', 'assets/images/player1.png');

    // ★ 적 이미지 자동 로드
    for (let i = 1; i <= 10; i++) this.load.image(`enemy${i}`, `assets/images/enemy/en${i}.png`);
    // ★ 중간보스/보스 이미지
    this.load.image('midboss1', 'assets/images/enemy/middle_boss.png');
    this.load.image('boss1',    'assets/images/enemy/boss1.png');
    this.load.image('boss2',    'assets/images/enemy/boss2.png');

    // 폴백 텍스처
    this.textures.exists('tx_enemy')  || this.textures.generate('tx_enemy',  { data:['1111','1111','1111','1111'], pixelWidth:6 });
    this.textures.exists('tx_bullet') || this.textures.generate('tx_bullet', { data:['22','22'], pixelWidth:3 });
    this.textures.exists('tx_item')   || this.textures.generate('tx_item',   { data:[' 33 ','3333',' 33 '], pixelWidth:4 });
    this.textures.exists('tx_coin')   || this.textures.generate('tx_coin',   { data:[' 44 ','4444',' 44 '], pixelWidth:4 });
    this.textures.exists('tx_player') || this.textures.generate('tx_player', { data:['  0  ',' 000 ','00000',' 000 ','  0  '], pixelWidth:6 });
    this.textures.exists('tx_missile') || this.textures.generate('tx_missile', {
      data: ['  55  ',' 5555 ','055555',' 5555 ','  55  '], pixelWidth: 2
    });
    this.textures.exists('tx_explosion') || this.textures.generate('tx_explosion', {
      data: ['  66  ',' 6666 ','666666',' 6666 ','  66  '], pixelWidth: 2
    });

    mountChecklist();
  }

  // ---------- 튜토리얼 체크리스트(3개 항목) ----------
  function mountChecklist(){
    const hud = document.getElementById('hud');
    if (hud) {
      coinHud = document.createElement('div');
      coinHud.textContent = `COINS: ${Upg.coins}`;
      Object.assign(coinHud.style, { position:'absolute', right:'10px', top:'10px', color:'#bfe7ff' });
      hud.parentElement?.appendChild(coinHud);
    }
    if (!IS_TUTORIAL) return;

    const root = document.createElement('div');
    Object.assign(root.style, { position:'fixed', right:'10px', top:'36px', width:'220px', zIndex:1000,
      font:'13px/1.5 ui-monospace,Consolas,monospace', color:'#eaf6ff' });
    root.innerHTML = `
      <div style="background:#0b1928cc;border:1px solid #335a86;border-radius:10px;padding:10px 12px;">
        <div style="font-weight:800;margin-bottom:6px;">튜토리얼 목표</div>
        <ul id="todo" style="list-style:none;padding:0;margin:0;display:grid;gap:6px;">
          <li data-k="move">⬜ 이동해 보기</li>
          <li data-k="shoot">⬜ 사격해 보기</li>
          <li data-k="dodge">⬜ 탄 회피해 보기</li>
        </ul>
      </div>`;
    document.body.appendChild(root);

    checklist = {
      el: root,
      done: { move:false, shoot:false, dodge:false },
      set(k,v=true){
        if (this.done[k]) return; this.done[k]=v;
        const li = root.querySelector(`li[data-k="${k}"]`);
        if (li){ li.textContent = `✅ ${li.textContent.replace(/^⬜\s?|✅\s?/,'')}`; }
        if (Object.values(this.done).every(Boolean)) {
          showTip('튜토리얼 완료!');
          window._tutorialDone = true;
          scene.time.delayedCall(1000, () => startCarrierShopSequence('tutorial-complete'));
        }
      }
    };
  }

  // ---------- Create ----------
  function create(){
    this.physics.world.setBounds(0, 0, W, H);

    // ★ 플레이어: 스케일 0.06 고정 + 히트박스(원형 r=8)
    const playerKey = this.textures.exists('player') ? 'player' : 'tx_player';
    player = this.physics.add.sprite(W * 0.5, H - 84, playerKey).setDepth(10).setOrigin(0.5);
    player.setScale(0.06);
    {
      const r = 8, ox = (player.displayWidth * 0.5) - r, oy = (player.displayHeight * 0.5) - r;
      player.body.setCircle(r, ox, oy);
    }
    player.setCollideWorldBounds(true);
    player.body.onWorldBounds = true;
    player.baseSpeed = 260;
    player._movedAccum = 0; player._lastPos = new Phaser.Math.Vector2(player.x, player.y);
    player.hp = Math.max(1, Upg.maxHP || 3);
    // HP HUD
    const hpHud = document.createElement('div');
    Object.assign(hpHud.style, { position:'absolute', left:'10px', top:'10px', color:'#ffd5d5',
      font:'bold 13px/1 ui-monospace,Consolas,monospace' });
    hpHud.id = 'hp-hud';
    document.body.appendChild(hpHud);
    function renderHP(){ const max = Math.max(1, Upg.maxHP||3); const cur = Math.max(0, player.hp|0);
      hpHud.textContent = `HP: ${'❤'.repeat(cur)}${'·'.repeat(Math.max(0, max-cur))}`; }
    renderHP();
    
    // 입력
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

    // 그룹
    pBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize:300, runChildUpdate:true });
    eBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize:600, runChildUpdate:true });
    enemies  = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize:240, runChildUpdate:true });
    items    = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image,  maxSize:80,  runChildUpdate:true });
    mMissiles= this.physics.add.group({ classType: Phaser.Physics.Arcade.Image,  maxSize:60,  runChildUpdate:true });

    // 충돌
    this.physics.add.overlap(pBullets, enemies, onHitEnemy, null, this);
    this.physics.add.overlap(eBullets, player,  onHitPlayer, null, this);
    this.physics.add.overlap(items,    player,  onPickupItem, null, this);
    this.physics.add.overlap(mMissiles, enemies, onMissileHit, null, this);

    function coinDrop(x, y) {
      const it = items.get(x,y,'tx_coin'); if (!it) return;
      it.setActive(true).setVisible(true).setDepth(9);
      it.setVelocity(0, 40);
      it.type = 'coin';
      it.setCircle(6,0,0);
    }

    function onHitEnemy(bullet, enemy){
      bullet.destroy();
      enemy.hp = (enemy.hp ?? 3) - Upg.power;
      if (enemy.hp <= 0) {
        if (Math.random() < 0.6) coinDrop(enemy.x, enemy.y);
        enemy.destroy();
      }
    }

    function onHitPlayer(playerSpr, bullet){
      bullet.destroy();
        // SafeMode면 무시(특수 테스트/이벤트 스테이지 전용)
  if (metaState.safeMode) return;
  // 이미 무적이면 중복 피격 무시
  if (playerSpr.isInvincible) return;
 
  // ★ HP 감소 (전 스테이지 공통)
  playerSpr.hp = Math.max(0, (playerSpr.hp ?? (Upg.maxHP||3)) - 1);
  // HP HUD 업데이트(있을 경우)
  const hpHudEl = document.getElementById('hp-hud');
  if (hpHudEl) {
    const max = Math.max(1, Upg.maxHP||3);
    hpHudEl.textContent = `HP: ${'❤'.repeat(playerSpr.hp)}${'·'.repeat(Math.max(0, max-playerSpr.hp))}`;
  }
 
  // 피격 피드백 + 무적(전 스테이지 공통)
  scene.sound?.play?.('hit', { volume: 0.45 });
  navigator.vibrate?.(100);
  playerSpr.isInvincible = true;
  scene.tweens.add({
    targets: playerSpr, alpha: 0.3, yoyo: true, repeat: 5, duration: 100,
    onComplete: () => { playerSpr.alpha = 1; playerSpr.isInvincible = false; }
  });
  playerSpr.setTint(0xff6666);
  scene.time.delayedCall(100, () => playerSpr.clearTint());
 
  // ★ 공통 게임오버 트리거
  if (playerSpr.hp <= 0) { gameOver(); }
    }

    function onPickupItem(it){
      if (it.type === 'coin') {
        Upg.coins += 1; coinHud && (coinHud.textContent = `COINS: ${Upg.coins}`);
        scene.sound?.play?.('hit', { volume: .25 });
      }
      it.destroy();
    }

    function onMissileHit(mis, enemy){
      if (!mis.active || !enemy.active) return;
      enemy.hp = (enemy.hp ?? 3) - Math.ceil(Upg.power * 1.5);
      spawnExplosion(mis.x, mis.y, 40 + 4 * (Upg.power-1));
      mis.destroy();
      if (enemy.hp <= 0) { if (Math.random() < 0.6) coinDrop(enemy.x, enemy.y); enemy.destroy(); }
    }

    // HUD
    setHUD(DIFF, STG);

    // 사격 쿨다운
    this.shootCooldown = 0;
    this.playerShootBase = 120;
    this.playerShootInterval = ()=> Math.max(60, Math.floor(this.playerShootBase / Upg.fireRate));

    // ===== StageManager 연동 =====
    if (window.StageManager){
      StageManager.init({ scene:this, enemiesGroup:enemies });

      StageManager.onApplyMeta = ({ safeMode, bulletScale, enemyFire })=>{
        metaState.safeMode   = !!safeMode;
        metaState.bulletScale= Number(bulletScale||1.0);
        metaState.enemyFire  = enemyFire !== false;
        // 튜토리얼은 항상 전투 가능 & 적 발사 ON
        if (IS_TUTORIAL) {
          metaState.safeMode = false;
          metaState.enemyFire = true;
        }
      };
      StageManager.onShowTip = (text)=> showTip(text);

      // 일반 몬스터 스폰
      StageManager.onSpawnEnemy = ({ x, y, type, def, params }) => {
        const imgKey = def?.imageKey || (StageManager.currentStageDef?.enemyImage) || 'enemy1';
        const e = spawnEnemySure(x, y, {
          key: imgKey, size: (def?.size || 44),
          vy:  randIn(def?.speedY || [60, 120]) * (metaState.bulletScale || 1.0)
        });
        if (!e) return;
        const baseHP = def?.hp || 3;
        e.hp = baseHP * ((DIFF === 'hard') ? 1.2 : 1.0);
        e.t=0; e.fireT=0;

        // 지그재그
        const amp = (params && params.amp) || def?.zigAmp || 0;
        const hz  = (params && params.hz)  || def?.zigHz || 0;
        if (amp > 0 && hz > 0) {
          scene.tweens.add({ targets: e, x: { from: x - amp, to: x + amp },
            duration: Math.max(300, Math.floor(1000 / hz)), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // 타입별 단순 AI
        const shoot1  = ()=> fireBulletAt(scene, e, player, 1.0);
        const spread3 = ()=> fireSpread(scene, e, player, 3, 24, 1.0);
        const kind = (type || 'Grunt');
        if (kind === 'ZigZag'){ e.fireInt = 1200; e.update = function(t,d){ this.fireT+=d; if(this.fireT>=this.fireInt&&metaState.enemyFire){this.fireT=0; spread3();}}; }
        else { e.fireInt = (params?.noBullet? 999999: 1000); e.update = function(t,d){ this.fireT+=d; if(this.fireT>=this.fireInt&&metaState.enemyFire){this.fireT=0; shoot1();}}; }
      };

      // 스테이지 로드/캐시
      StageManager.loadStageByQuery(DIFF, STG);
      StageManager.currentStageDef =
        (StageDefs.STAGES?.[DIFF]?.[String(STG).toUpperCase()]) || null;

      StageManager.start();

      // === 중간보스/보스 출현 스케줄 ===
      try {
        const cdef = StageManager.currentStageDef || {};
        const len = Number(cdef.lengthSec || 80);
        const isHard = (DIFF === 'hard');
        const stKey = String(STG).toUpperCase();

        const scheduleMiddle = () => scene.time.delayedCall(Math.max(5, Math.floor(len * 0.60 * 1000)), () => {
          showTip('중간 보스 출현!');
          spawnMiddleBoss(scene, cdef.middleBossImage || 'midboss1');
        });
        const scheduleBoss   = () => scene.time.delayedCall(Math.max(6, Math.floor(len * 0.85 * 1000)), () => {
          showTip('보스 출현!');
          spawnBoss(scene, cdef.bossImage || 'boss1');
        });

        if (isHard && stKey === 'H10') {
          if (cdef.middle_boss) {
            // H10: 55% 시점에 middle_boss, 격파 후 보스
            scene.time.delayedCall(Math.max(5, Math.floor(len * 0.55 * 1000)), () => {
              showTip('중간 보스 출현!');
              spawnMiddleBoss(scene, cdef.middleBossImage || 'midboss1', {
                onDefeated: () => {
                  if (!scene || !player || !player.active) return;
                  scene.time.delayedCall(1200, () => {
                    showTip('보스 출현!');
                    spawnBoss(scene, cdef.bossImage || 'boss1');
                  });
                }
              });
            });
          }
          // H10은 boss 타임 스폰 사용 X
        } else {
          if (cdef.middle_boss) scheduleMiddle();
          if (cdef.boss)        scheduleBoss();
        }
      } catch (e) { console.warn('[BossScheduler] failed:', e); }

      // 스테이지 종료 → 항모 → 상점
      StageManager.onStageClear = ()=> {
        if (IS_TUTORIAL && !window._tutorialDone) {
          showTip('튜토리얼 목표를 모두 완료하세요!');
          return; // 튜토리얼은 목표 완료 전 클리어 보류
        }
        startCarrierShopSequence('stage-clear');
      };

      // Fallback: 길이 후 자동(이벤트가 없었을 때)
      try {
        const def = (window.StageDefs?.STAGES?.[DIFF] ?? {})[String(STG).toUpperCase()];
        const lenSec = Number(def?.lengthSec || 70);
        scene.time.delayedCall(Math.max(5, lenSec * 1000 + 2500), () => {
          if (_isEventRunning) return;
          if (IS_TUTORIAL && !window._tutorialDone) {
            showTip('튜토리얼 목표를 모두 완료하세요!');
            return; // 자동 종료도 보류
          }
          startCarrierShopSequence('fallback');
        });
      } catch {}
    }

    // 빠른 테스트: T키
    this.time.delayedCall(1200, () => { spawnEnemySure(W*0.5, -30, { key:'enemy1', size:48, vy:80 }); });
    this.input.keyboard.on('keydown-T', () => {
      spawnEnemySure(Phaser.Math.Between(40, W-40), -30, { key:'enemy2', size:48, vy:90 });
      showTip('Test spawn (T)');
    });

    this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.debugDraw = false;
  }

  // ---------- Update ----------
  const nearBullets = new WeakSet();
  function update(time, delta){
    const C=this.cursors, K=this.keys;

    // 이동(업그레이드 반영)
    const speed = (player.baseSpeed * Upg.speed);
    let vx=0, vy=0;
    if (C.left.isDown || K.A.isDown)  vx -= 1;
    if (C.right.isDown|| K.D.isDown)  vx += 1;
    if (C.up.isDown   || K.W.isDown)  vy -= 1;
    if (C.down.isDown || K.S.isDown)  vy += 1;
    const len = Math.hypot(vx,vy)||1;
    player.setVelocity((vx/len)*speed, (vy/len)*speed);

    // 경계 고정(월드 밖 이탈 방지)
    const halfW = (player.displayWidth) * 0.5;
    const halfH = (player.displayHeight) * 0.5;
    player.x = Phaser.Math.Clamp(player.x, halfW, W - halfW);
    player.y = Phaser.Math.Clamp(player.y, 6 + halfH, H - halfH - 6);

    // 튜토리얼 체크
    if (IS_TUTORIAL && checklist){
      player._movedAccum += Phaser.Math.Distance.Between(player._lastPos.x, player._lastPos.y, player.x, player.y);
      player._lastPos.set(player.x, player.y);
      if (player._movedAccum > 40) checklist.set('move');
    }

    // 사격
    this.shootCooldown -= delta;
    const interval = this.playerShootInterval();
    if ((Phaser.Input.Keyboard.JustDown(K.SPACE) || (C.space && C.space.isDown)) && this.shootCooldown <= 0){
      this.shootCooldown = interval;

      // 기관포: gunShots(1~3)
      const n = Math.max(1, Math.min(3, Upg.gunShots || 1));
      for (let i=0;i<n;i++){
        const off = (i - (n-1)/2) * 10;
        spawnPlayerBullet(this, player.x + off, player.y - 20, -360 * (metaState.bulletScale || 1.0));
      }

      // 미사일: 해금/발수 + 쿨다운
      this._missileCd = this._missileCd ?? 0; this._missileCd -= delta;
      if ((Upg.missileUnlocked && (Upg.missileShots||0) > 0) && this._missileCd <= 0) {
        fireMissiles(this, player.x, player.y - 12, Upg.missileShots);
        this._missileCd = 900;
      }

      if (IS_TUTORIAL && checklist) checklist.set('shoot');
    }

    // 회피 判정(튜토리얼)
    if (IS_TUTORIAL && checklist){
      eBullets.children.iterate(b=>{
        if (!b || !b.active) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, b.x, b.y);
        if (dist < 48) nearBullets.add(b);
        else if (dist > 140 && nearBullets.has(b)){ nearBullets.delete(b); checklist.set('dodge'); }
      });
    }

    // 정리
    purgeOffscreen(pBullets, W, H);
    purgeOffscreen(eBullets, W, H);
    purgeOffscreen(enemies,  W, H, true);
    purgeOffscreen(items,    W, H, true);
    purgeOffscreen(mMissiles,W, H);

    // 디버그 토글(H)
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)){
      this.debugDraw = !this.debugDraw;
      this.physics.world.drawDebug = this.debugDraw;
      this.physics.world.debugGraphic.clear();
    }
  }

  // ---------- HUD & TIP ----------
  function setHUD(diff, stg){
    if (!hudTextEl) return;
    const sNum = /^\d+$/.test(String(stg)) ? pad2(parseInt(stg,10)||1) : String(stg).toUpperCase();
    hudTextEl.textContent = `[ ${diff.toUpperCase()} ] STAGE ${sNum}${IS_TUTORIAL?'  (TUTORIAL)':''}`;
  }
  function showTip(text){
    const x=W/2, y=Math.round(H*0.2);
    const t = scene.add.text(x,y,text,{fontSize:'18px',fontFamily:'monospace',color:'#e8fdff',stroke:'#0b2a3a',strokeThickness:3})
      .setOrigin(0.5).setAlpha(0).setDepth(999);
    scene.tweens.add({ targets:t, alpha:1, y:y-6, duration:220, ease:'Cubic.easeOut',
      onComplete:()=> scene.time.delayedCall(2000, ()=> scene.tweens.add({targets:t, alpha:0, y:y-12, duration:260, onComplete:()=> t.destroy()})) });
  }

  // ---------- 발사/정리/공용 ----------
  function spawnPlayerBullet(scene, x, y, vy){
    const b = pBullets.get(x,y,'tx_bullet'); if (!b) return;
    b.setActive(true).setVisible(true); b.setVelocity(0, vy); b.setCircle(3,0,0);
  }
  function purgeOffscreen(group, W, H, removeBelowOnly=false){
    group.children.iterate(obj=>{
      if (!obj || !obj.active) return;
      if (obj.x < -20 || obj.x > W+20 || obj.y < -40 || obj.y > H+40){
        if (removeBelowOnly){ if (obj.y > H+40) obj.destroy(); }
        else obj.destroy();
      }
    });
  }
  function aimAngle(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
  function fireBulletAt(scene, from, to, speedMul=1, spreadRad=0) {
    if (!metaState.enemyFire) return;
    const base = 160;
    const spd = base * (metaState.bulletScale || 1.0) * (speedMul || 1.0);
    const ang = aimAngle(from.x, from.y, to.x, to.y) + (spreadRad || 0);
    const b = eBullets.get(from.x, from.y, 'tx_bullet'); if (!b) return;
    b.setActive(true).setVisible(true);
    b.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
    b.setCircle(3, 0, 0);
  }
  function fireSpread(scene, from, to, count, totalDeg=24, speedMul=1) {
    if (count <= 1) return fireBulletAt(scene, from, to, speedMul, 0);
    const half = (count - 1) / 2;
    const baseAng = aimAngle(from.x, from.y, to.x, to.y);
    const step = (totalDeg * Math.PI / 180) / (count - 1);
    for (let i = -half; i <= half; i++) {
      const ang = baseAng + (i * step);
      const b = eBullets.get(from.x, from.y, 'tx_bullet'); if (!b) continue;
      const spd = 150 * (metaState.bulletScale || 1.0) * (speedMul || 1.0);
      b.setActive(true).setVisible(true);
      b.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
      b.setCircle(3, 0, 0);
    }
  }

  // ---------- 미사일/폭발 ----------
  function findNearestEnemy(x, y, maxDist = 99999){
    let best=null, bestD=maxDist;
    enemies.children.iterate(e=>{
      if (!e || !e.active) return;
      const d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
      if (d < bestD) { bestD = d; best = e; }
    });
    return best;
  }
  function fireMissiles(scene, x, y, count){
    const n = Math.max(1, Math.min(4, count|0));
    const spread = n>1 ? 14 : 0;
    for (let i=0;i<n;i++){
      const off = (i - (n-1)/2) * spread;
      spawnMissile(scene, x + off, y, -220);
    }
    scene.sound?.play?.('hit', { volume: 0.25 });
    showTip('미사일 발사!');
  }
  function spawnMissile(scene, x, y, vy){
    const m = mMissiles.get(x, y, 'tx_missile'); if (!m) return null;
    m.setActive(true).setVisible(true).setDepth(11);
    m.setCircle(5, 0, 0);
    m.speed = 240; m.turnRate = 0.09;
    m.target = findNearestEnemy(x, y, 420) || null;
    m.angle = -90; m.body.setAllowGravity(false); m.setVelocity(0, vy);
    m.update = function(){
      if (!this.active) return;
      if (!this.target || !this.target.active) this.target = findNearestEnemy(this.x, this.y, 420);
      let vx=0, vy=-this.speed;
      if (this.target) {
        const desired = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        const cur = Phaser.Math.DegToRad(this.angle);
        let diff = Phaser.Math.Angle.Wrap(desired - cur);
        const step = Phaser.Math.Clamp(diff, -this.turnRate, this.turnRate);
        const next = cur + step;
        this.angle = Phaser.Math.RadToDeg(next);
        vx = Math.cos(next) * this.speed; vy = Math.sin(next) * this.speed;
      }
      this.setVelocity(vx, vy);
      if (this.x < -30 || this.x > (W+30) || this.y < -40 || this.y > (H+40)) this.destroy();
    };
    return m;
  }
  function spawnExplosion(x, y, radius=40){
    const fx = scene.add.image(x, y, 'tx_explosion').setDepth(12).setAlpha(0.9).setScale(1.0);
    scene.tweens.add({ targets: fx, alpha: 0, scale: 1.6, duration: 220, ease: 'Cubic.easeOut', onComplete: ()=> fx.destroy() });
    scene.sound?.play?.('hit', { volume: 0.35 });
    enemies.children.iterate(e=>{
      if (!e || !e.active) return;
      const d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
      if (d <= radius) {
        e.hp = (e.hp ?? 3) - Math.max(1, Math.ceil(Upg.power * 0.8));
        if (e.hp <= 0) { e.destroy(); }
      }
    });
  }

  // ---------- 확정 스폰/랜덤 ----------
  function spawnEnemySure(x, y, opts = {}) {
    const key = opts.key || 'tx_enemy';
    let e = enemies.get(x, y, key); if (!e) e = enemies.create ? enemies.create(x, y, key) : null;
    if (!e) { console.warn('[SPAWN] failed'); return null; }
    e.setActive(true).setVisible(true).setDepth(10);
    e.setDisplaySize(opts.size || 44, opts.size || 44);
    e.setTint(opts.tint ?? 0xffffff);
    const vy = opts.vy ?? 80; e.setVelocity(opts.vx ?? 0, vy);
    e.hp = opts.hp ?? 3;
    return e;
  }
  function randIn(range){ if (Array.isArray(range)&&range.length===2){ return Phaser.Math.Between(range[0], range[1]); } return Number(range)||100; }

  // ---------- 호위(공전 + 증원) ----------
  function spawnEscortOrbit(scene, boss, { count=4, radius=72, key=(StageManager.currentStageDef?.enemyImage)||'enemy3', fireInt=1200, rotateSpeed=0.02, hp=6 } = {}) {
    if (!boss || !boss.active) return [];
    const escorts = []; const baseAng = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const ang = baseAng + (i * ((Math.PI * 2) / count));
      const ex = boss.x + Math.cos(ang) * radius;
      const ey = boss.y + Math.sin(ang) * radius;
      const e = enemies.get(ex, ey, key); if (!e) continue;
      e.setActive(true).setVisible(true).setDepth(boss.depth - 1).setDisplaySize(36,36);
      e.hp = hp; e.orbit = { boss, ang, radius, rotateSpeed }; e.setVelocity(0,0); e.fireT = 0; e.fireInt = fireInt;
      e.update = function (time, delta) {
        if (!this.active || !this.orbit || !this.orbit.boss || !this.orbit.boss.active) return;
        this.orbit.ang += this.orbit.rotateSpeed;
        this.x = this.orbit.boss.x + Math.cos(this.orbit.ang) * this.orbit.radius;
        this.y = this.orbit.boss.y + Math.sin(this.orbit.ang) * this.orbit.radius;
        this.fireT += delta;
        if (this.fireT >= this.fireInt && metaState.enemyFire) { this.fireT = 0; fireSpread(scene, this, player, 3, 28, 1.0); }
        if (this.y > H + 50) this.destroy();
      };
      escorts.push(e);
    }
    return escorts;
  }
  function spawnEscortWave(scene, boss, { sideCount=2, key=(StageManager.currentStageDef?.enemyImage)||'enemy3', vy=90, fireInt=1000 } = {}) {
    if (!boss || !boss.active) return;
    const makeEscort = (x, y) => { const e = enemies.get(x, y, key); if (!e) return null;
      e.setActive(true).setVisible(true).setDepth(boss.depth - 1).setDisplaySize(34,34);
      e.hp = 4; e.setVelocity(0, vy); e.fireT = 0; e.fireInt = fireInt;
      e.update = function (time, delta) { if (!this.active) return; this.fireT += delta;
        if (this.fireT >= this.fireInt && metaState.enemyFire) { this.fireT = 0; fireBulletAt(scene, this, player, 1.0); }
        if (this.y > H + 40) this.destroy();
      }; return e; };
    for (let i = 0; i < sideCount; i++) { const offY = -40 - i * 24; makeEscort(24, offY); makeEscort(W - 24, offY); }
  }
  function cleanupEscort(boss) {
    try {
      if (boss._escortTimers) { boss._escortTimers.forEach(ev => { try { ev.remove(false); } catch{} }); boss._escortTimers.length = 0; }
      if (boss._escortRefs)    { boss._escortRefs.forEach(e => { if (e && e.active) e.destroy(); }); boss._escortRefs.length = 0; }
    } catch (e) { console.warn('[cleanupEscort] failed:', e); }
  }

  // ---------- 중간 보스/보스 ----------
  function spawnMiddleBoss(scene, imgKey='midboss1', opts = {}) {
    const b = enemies.get(W / 2, -60, imgKey); if (!b) return null;
    b.setActive(true).setVisible(true).setDepth(15).setScale(1.25);
    b.hp = opts.hp ?? 80; b.setVelocity(0, 50); b.fireT = 0; b._escortRefs = []; b._escortTimers = [];
    b.update = function (time, delta) {
      if (this.y < 160) this.setVelocity(0, 0);
      this.fireT += delta;
      if (this.fireT > (opts.fireInt ?? 700) && metaState.enemyFire) {
        this.fireT = 0; fireSpread(scene, this, player, 6, 46, 1.15);
      }
      if (this.hp <= 0) {
        cleanupEscort(this);
        this.destroy();
        showTip('중간 보스 격파!');
        scene.sound?.play?.('hit', { volume: 0.6 });
        if (typeof opts.onDefeated === 'function') opts.onDefeated();
      }
    };
    // 호위/증원
    if (opts.escort !== false) {
      b._escortRefs = spawnEscortOrbit(scene, b, { count:3, radius:60, key:(StageManager.currentStageDef?.enemyImage)||'enemy3', fireInt:1200, rotateSpeed:0.018, hp:5 });
      const t = scene.time.addEvent({
        delay: 6000, loop: true,
        callback: () => { if (!b.active) return; spawnEscortWave(scene, b, { sideCount:1, key:(StageManager.currentStageDef?.enemyImage)||'enemy3', vy:95, fireInt:1100 }); }
      });
      b._escortTimers.push(t);
    }
    return b;
  }

  function spawnBoss(scene, imgKey='boss1') {
    const b = enemies.get(W / 2, -60, imgKey); if (!b) return null;
    b.setActive(true).setVisible(true).setDepth(16).setScale(1.35);
    b.hp = 140; b.setVelocity(0, 45); b.fireT = 0; b.phase = 0; b._escortRefs = []; b._escortTimers = [];
    b.update = function (time, delta) {
      if (this.y < 140) this.setVelocity(0, 0);
      this.fireT += delta;
      if (this.phase === 0 && this.fireT > 600 && metaState.enemyFire) {
        this.fireT = 0; const n = 12, step = (Math.PI * 2) / n;
        for (let i = 0; i < n; i++) { const ang = i * step; const bll = eBullets.get(this.x, this.y, 'tx_bullet'); if (!bll) continue;
          const spd = 140*(metaState.bulletScale||1.0); bll.setActive(true).setVisible(true);
          bll.setVelocity(Math.cos(ang)*spd, Math.sin(ang)*spd); bll.setCircle(3,0,0); }
        if (this.hp < 80) this.phase = 1;
      } else if (this.phase === 1 && this.fireT > 500 && metaState.enemyFire) {
        this.fireT = 0; fireSpread(scene, this, player, 5, 48, 1.2);
      }
      if (this.hp <= 0) { cleanupEscort(this); this.destroy(); showTip('보스 격파!'); scene.sound?.play?.('hit', { volume: 0.65 }); }
    };
    b._escortRefs = spawnEscortOrbit(scene, b, { count:5, radius:72, key:(StageManager.currentStageDef?.enemyImage)||'enemy5', fireInt:1000, rotateSpeed:0.022, hp:7 });
    const t = scene.time.addEvent({
      delay: 5000, loop: true,
      callback: () => { if (!b.active) return; spawnEscortWave(scene, b, { sideCount:2, key:(StageManager.currentStageDef?.enemyImage)||'enemy5', vy:100, fireInt:950 }); }
    });
    b._escortTimers.push(t);
    return b;
  }

  // ---------- 항모→상점 시퀀스 ----------
  function startCarrierShopSequence(reason = 'stage-clear') {
    if (_isEventRunning) return;
    _isEventRunning = true;
    metaState.safeMode = true; metaState.enemyFire = false;
    try { StageManager.pause?.(); } catch(e){}
    const purgeAll = (g)=> g.children.iterate(o=> o && o.active && o.destroy());
    purgeAll(eBullets); purgeAll(pBullets);
    scene.input.keyboard.enabled = false;

    const goShop = () => {
      if (window.ShopEvent?.start) {
        ShopEvent.start(scene, {
          onExit: ({ upgrades } = {}) => {
            if (upgrades) Object.assign(Upg, upgrades);
            coinHud && (coinHud.textContent = `COINS: ${Upg.coins}`);
            scene.input.keyboard.enabled = true; _isEventRunning = false;
          }
        });
      } else { _isEventRunning = false; scene.input.keyboard.enabled = true; }
    };

    const cam = scene.cameras.main;
    cam.fadeOut(500, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => {
      cam.fadeIn(400, 0, 0, 0);
      if (window.CarrierEvent?.start) { CarrierEvent.start(scene, { reason, onComplete: goShop }); }
      else { goShop(); }
    });
  }

  new Phaser.Game(config);
})();

function gameOver(){
  if (scene._gameOver) return;
  scene._gameOver = true;

  // 입력/스테이지 정지
  try { StageManager.pause?.(); } catch(e){}
  metaState.enemyFire = false;

  // 탄/적 정리
  const purgeAll = (g)=> g && g.children && g.children.iterate(o=> o && o.active && o.destroy());
  purgeAll(eBullets); purgeAll(pBullets);

  // 연출
  const t = scene.add.text(W/2, H/2, 'GAME OVER', {
    fontFamily:'ui-monospace,Consolas,monospace', fontSize:'28px', color:'#ffb4b4',
    stroke:'#000', strokeThickness:4
  }).setOrigin(0.5).setDepth(999);
  scene.cameras.main.shake(300, 0.004);

  // 1.6초 후 모드 선택으로 복귀(원하시면 재시작으로 수정 가능)
  scene.time.delayedCall(1600, () => {
    try { location.href = 'select_stage.html'; } catch {}
  });
}
