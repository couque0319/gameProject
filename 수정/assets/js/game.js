// assets/js/game.js
(() => {
  // ====== 파라미터/플래그 ======
  const qs = new URLSearchParams(location.search);
  const DIFF = qs.get('difficulty') || 'easy';        // 'easy' | 'morning' | 'hard'
  const STAGE = parseInt(qs.get('stage') || '1', 10); // 1..10
  const SELECTED_PLANE = localStorage.getItem('selectedAirplane') || 'airplane1';

  const IS_EASY = (DIFF === 'easy' || DIFF === 'morning'); // 이지 계열
  const EASY_MAX_ENEMIES = 10; // 이지 동시 적 최대

  // 🔧 이지 모드 고정 파라미터
  const EASY_EBULLET_SPEED = 1.1;  // 적 탄속(px/frame) 고정
  const EASY_FIRE_INTERVAL = 120;   // 적 발사 주기(프레임). 60=1초@60fps

  // ====== 유틸 ======
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => Math.random() * (b - a) + a;
  const angleTo = (x1,y1,x2,y2) => Math.atan2(y2 - y1, x2 - x1);
  function circleHit(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return dx*dx+dy*dy <= (a.size+b.size)**2; }
  function pointSegDist(px,py, x1,y1, x2,y2){
    const vx=x2-x1, vy=y2-y1, wx=px-x1, wy=py-y1;
    const c1 = vx*wx + vy*wy; if (c1<=0) return Math.hypot(px-x1,py-y1);
    const c2 = vx*vx + vy*vy; if (c2<=c1) return Math.hypot(px-x2,py-y2);
    const t = c1/c2; const qx = x1 + t*vx, qy = y1 + t*vy; return Math.hypot(px-qx, py-qy);
  }

  // ====== 캔버스/오디오/입력 ======
  const cvs = document.getElementById('game');
  const ctx = cvs.getContext('2d');
  const bgm = document.getElementById('bgm');
  const hud = document.getElementById('hud');
  const pauseLayer = document.getElementById('pause-layer');

  const keys = {};
  addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key==='p') togglePause(); });
  addEventListener('keyup',   e => { keys[e.key.toLowerCase()] = false; });

  document.getElementById('btn-pause')?.addEventListener('click', ()=>togglePause());
  document.getElementById('btn-retry')?.addEventListener('click', ()=>location.reload());

  // ====== 고정 타임스텝 ======
  let last = performance.now();
  const STEP = 1000/60; // ms
  let acc = 0, paused=false;

  function togglePause(){
    paused = !paused;
    pauseLayer?.classList.toggle('show', paused);
    if(!paused) last = performance.now();
    try { bgm[paused?'pause':'play']?.(); } catch(_) {}
  }

  // ====== 난이도 스케일/기체 스펙 ======
  const DIFF_SCALE = {
    easy:    { enemyHp:1,   enemyRate:1,   bulletSpeed:1,    scoreMul:1 },
    morning: { enemyHp:0.9, enemyRate:0.95,bulletSpeed:0.95, scoreMul:1 },
    hard:    { enemyHp:1.4, enemyRate:1.2, bulletSpeed:1.25, scoreMul:1.2 }
  }[DIFF] || { enemyHp:1, enemyRate:1, bulletSpeed:1, scoreMul:1 };

  const PLAYER_SPEC = {
    airplane1:{ speed:3.2, hp:5, shotDelay:120, bulletSpeed:6,   size:10 },
    airplane2:{ speed:2.6, hp:8, shotDelay:140, bulletSpeed:5.5, size:12 },
  }[SELECTED_PLANE] || { speed:3.0, hp:5, shotDelay:120, bulletSpeed:5.8, size:10 };

  // ====== 상태/풀 ======
  const state = {
    time:0, score:0, waveIndex:0, over:false,
    player:null, enemies:[], bullets:[], ebullets:[], lasers:[],
    respawnQueue:[],
  };

  function makePool(factory, size=256){
    const arr = Array.from({length:size}, factory);
    const free = [...arr];
    return {
      get(){ return free.length ? free.pop() : factory(); },
      release(obj){ obj.active=false; free.push(obj); },
      all: arr
    };
  }

  function makePlayer(){
    return {
      x:cvs.width/2, y:cvs.height-60, vx:0, vy:0, size:PLAYER_SPEC.size,
      hp:PLAYER_SPEC.hp, t:0, shotCd:0, alive:true, iFrame:0, speed:PLAYER_SPEC.speed
    };
  }
  function makeEnemy(x,y,kind='grunt', stopY=null){
    return { x,y, vx:0, vy:1.2*DIFF_SCALE.enemyRate, size:12,
             hp:Math.ceil(2*DIFF_SCALE.enemyHp), t:0, kind, alive:true, stopY, update:null, fire:null, alt:false };
  }
  function makeBullet(){  return { x:0,y:0, vx:0,vy:0, size:3, friendly:true,  dmg:1, active:false }; }
  function makeEBullet(){ return { x:0,y:0, vx:0,vy:0, size:4, friendly:false, dmg:1, active:false }; }
  function makeLaser(){   return { x:0,y:0, angle:0, length:520, width:6, life:0, lifeMax:60, warmup:30, owner:null, active:false, onTick:null }; }

  const bulletPool  = makePool(makeBullet, 256);
  const ebulletPool = makePool(makeEBullet,256);
  const laserPool   = makePool(makeLaser,  16);

  // ====== 적탄 속도 제한(Stage2+) + 이지 고정 ======
  const EBULLET_MAX_SPEED = 2.6;        // px/frame
  const EBULLET_SCALE_STAGE2PLUS = 0.9; // 완만
  function applyEnemyBulletSpeed(v){
    // 이지 모드는 완전 고정
    if (IS_EASY) return EASY_EBULLET_SPEED;
    if (STAGE >= 2) return Math.min(v * EBULLET_SCALE_STAGE2PLUS, EBULLET_MAX_SPEED);
    return v;
  }
  // 이지: 발사 주기 고정
  function enemyFireInterval(){
    return IS_EASY ? EASY_FIRE_INTERVAL : 60; // 기본 60프레임
  }
  // 적 탄속 헬퍼(패턴별 base 계수 → 실제 속도)
  function enemySpeed(base){
    if (IS_EASY) return EASY_EBULLET_SPEED;
    return applyEnemyBulletSpeed(base * DIFF_SCALE.bulletSpeed);
  }

  // ====== 탄막 API ======
  function spawnBullet(x,y,angle,speed, friendly=true, size=3, dmg=1){
    const pool = friendly ? bulletPool : ebulletPool;
    const b = pool.get();
    const v = friendly ? speed : applyEnemyBulletSpeed(speed);
    b.x=x; b.y=y; b.vx=Math.cos(angle)*v; b.vy=Math.sin(angle)*v;
    b.size=size; b.friendly=friendly; b.dmg=dmg; b.active=true;
    (friendly?state.bullets:state.ebullets).push(b);
    return b;
  }
  function spawnSpread(x,y,baseAngle,count,spread,speed,friendly){
    const start = baseAngle - spread*(count-1)/2;
    for(let i=0;i<count;i++) spawnBullet(x,y,start+spread*i,speed,friendly);
  }
  function spawnSpiral(x,y,startAngle,delta,count,speed,friendly){
    for(let i=0;i<count;i++) spawnBullet(x,y,startAngle+delta*i,speed,friendly);
  }
  function spawnLaser(x,y,angle,lifeMax=60,warmup=30,width=6,owner=null){
    const L = laserPool.get();
    Object.assign(L,{x,y,angle,life:0,lifeMax,warmup,width,owner,active:true,onTick:null});
    state.lasers.push(L);
    return L;
  }
  function offscreen(o){ return o.x<-24 || o.x>cvs.width+24 || o.y<-24 || o.y>cvs.height+24; }

  // ====== 이지 제한 & 리스폰 ======
  function enemyCountAlive(){ let n=0; for(const e of state.enemies){ if(e.alive) n++; } return n; }
  function canSpawnEnemy(){ return !IS_EASY || enemyCountAlive() < EASY_MAX_ENEMIES; }
  function spawnEnemyCapped(factoryCountFn){
    if (!IS_EASY){ factoryCountFn(Infinity); return; }
    const slots = EASY_MAX_ENEMIES - enemyCountAlive();
    if (slots <= 0) return;
    factoryCountFn(slots);
  }

  // ====== (중요) monsters.js 초기화 & 래퍼 ======
  // 반드시 game.html에서 <script src="assets/js/monsters.js"></script>가 먼저 로드되어야 합니다.
  if (!window.MONSTERS || typeof window.MONSTERS.init !== 'function') {
    console.warn('[MONSTERS] monsters.js가 로드되지 않았습니다. 기본 안전 타임라인을 사용합니다.');
  } else {
    window.MONSTERS.init({
      cvs, state, DIFF_SCALE, IS_EASY,
      enemySpeed, enemyFireInterval,
      spawnBullet, spawnSpread, spawnSpiral, spawnLaser,
      angleTo, spawnEnemyCapped,
      makeEnemy, rand
    });
  }
  // 스테이지에서 쓰던 함수명 유지용 래퍼
  const lineSpawn        = (...args)=> window.MONSTERS?.lineSpawn?.(...args);
  const ringBurst        = (cx,cy)=> window.MONSTERS?.ringTurret?.(cx,cy);
  const sideSweep        = (stopY)=> window.MONSTERS?.sideSweep?.(stopY);
  const respawnGruntTop  = ()=> window.MONSTERS?.respawnGruntTop?.();

  // ====== 미니보스/보스(유지) ======
  function miniBoss(stopY=90){
    const b = makeEnemy(cvs.width/2, 70, 'miniBoss', stopY);
    b.vy=0; b.hp = Math.ceil(40*DIFF_SCALE.enemyHp);
    b.update = (p)=>{
      b.t++;
      if (b.t%60===0) spawnSpiral(b.x,b.y, Math.random()*6.28, 0.35, 16, enemySpeed(2.6), false);
      if (b.t%90===30){
        const leadX = p.x + p.vx*18, leadY = p.y + p.vy*18;
        const a = angleTo(b.x,b.y, leadX,leadY);
        spawnSpread(b.x,b.y, a, 3, 0.12, enemySpeed(3.2), false);
      }
    };
    state.enemies.push(b);
  }

  function bossPhase(stopY=80){
    const boss = makeEnemy(cvs.width/2, 100, 'boss', stopY);
    boss.vy=0; boss.hp = Math.ceil(120*DIFF_SCALE.enemyHp);
    boss.update = (p)=>{
      boss.t++;
      if (boss.t%120===0){
        const a = angleTo(boss.x,boss.y, p.x,p.y);
        const L = spawnLaser(boss.x,boss.y, a, 100, 45, 8, boss);
        L.onTick = (t)=>{ if (t>L.warmup) L.angle += 0.010*(DIFF==='hard'?1.5:1.0); };
      }
      if (boss.t%50===25) spawnSpiral(boss.x,boss.y, Math.random()*6.28, (Math.PI*2)/20, 20, enemySpeed(2.0), false);
    };
    state.enemies.push(boss);
  }

  // ====== 튜토리얼 토스트 ======
  let toastTimer = 0, toastText = '';
  function tutorialToast(text, ms=1800){ toastText=text; toastTimer=ms; }

  // ====== 플레이어 자동 발사 ======
  const PLAYER_SHOT_BASE = -Math.PI/2;
  function playerShoot(p){
    if (p.shotCd>0) return;
    p.shotCd = PLAYER_SPEC.shotDelay; // ms
    if (SELECTED_PLANE==='airplane2'){
      spawnSpread(p.x, p.y-16, PLAYER_SHOT_BASE, 3, 0.12, PLAYER_SPEC.bulletSpeed, true);
    }else{
      spawnBullet(p.x-6, p.y-16, PLAYER_SHOT_BASE, PLAYER_SPEC.bulletSpeed, true);
      spawnBullet(p.x+6, p.y-16, PLAYER_SHOT_BASE, PLAYER_SPEC.bulletSpeed, true);
    }
  }

  // ====== 스테이지 컨텍스트 & 타임라인 ======
  function getStageContext(){
    return {
      cvs,
      toast: tutorialToast,
      // monsters.js 래퍼 사용
      lineSpawn: (n, startX, endX, vy, kind, stopY=120)=>lineSpawn?.(n, startX, endX, vy, kind, stopY),
      ringBurst: (cx,cy)=>ringBurst?.(cx,cy),
      sideSweep: (stopY=100)=>sideSweep?.(stopY),
      miniBoss: (stopY=90)=>miniBoss(stopY),
      bossPhase: (stopY=80)=>bossPhase(stopY),
      state,
    };
  }

  let TIMELINE = [];
  function buildTimeline(){
    const S = window.STAGES || { easy:{}, hard:{}, scale:()=>({bul:1,fire:1,n:1}) };
    const diffKey = (DIFF==='hard') ? 'hard' : 'easy';
    const builder = S[diffKey]?.[STAGE];
    const sc = typeof S.scale === 'function' ? S.scale(diffKey, STAGE) : {bul:1,fire:1,n:1};
    if (typeof builder === 'function') return builder(getStageContext(), sc);

    console.warn('[STAGE] 외부 정의 없음 → 기본 웨이브 사용');
    const ctx = getStageContext(); const cw = cvs.width;
    return [
      [ 500,  ()=>ctx.lineSpawn?.(5, 60, cw-60, 0.9, 'grunt', 120) ],
      [ 3000, ()=>ctx.ringBurst?.(cw/2, 220) ],
      [ 6000, ()=>ctx.sideSweep?.(100) ],
      [10000, ()=>ctx.miniBoss(95) ],
    ];
  }

  function runStageSchedule(){
    if (!TIMELINE.length) TIMELINE = buildTimeline();
    if (state.waveIndex >= TIMELINE.length) return;
    const [at, fn] = TIMELINE[state.waveIndex];
    if (state.time >= at) { fn?.(); state.waveIndex++; }
  }

  // ====== 업데이트/렌더 ======
  let fpsCount=0, fpsTimer=0, fpsNow=0;

  function update(ms){
    acc += ms;
    while(acc >= STEP){
      step(STEP/1000);
      acc -= STEP;
    }
  }

  function step(dt){
    if (paused || state.over) return;
    const stepMs = STEP;

    state.time += dt*1000;
    runStageSchedule();

    // 입력/이동
    const p = state.player;
    p.vx = (keys['arrowright']||keys['d']? 1:0) - (keys['arrowleft']||keys['a']?1:0);
    p.vy = (keys['arrowdown']||keys['s']? 1:0) - (keys['arrowup']||keys['w']?1:0);
    p.x = clamp(p.x + p.vx*p.speed, 12, cvs.width-12);
    p.y = clamp(p.y + p.vy*p.speed, 12, cvs.height-12);

    // 자동 발사
    if (p.shotCd>0) p.shotCd -= stepMs;
    playerShoot(p);

    // 적
    for (const e of state.enemies){
      if (!e.alive) continue;
      e.t++;
      e.x += e.vx;
      if (e.stopY != null){
        const nextY = e.y + e.vy;
        if (e.y < e.stopY && nextY >= e.stopY){ e.y = e.stopY; e.vy = 0; }
        else if (e.y < e.stopY){ e.y = nextY; }
      } else e.y += e.vy;

      e.update?.(p);
      // 기본 주기 사격(이지는 고정 간격)
      if (e.fire && e.t % enemyFireInterval() === 0) e.fire(p);

      if (e.y > cvs.height+40 || e.x<-40 || e.x>cvs.width+40) e.alive=false;
    }
    state.enemies = state.enemies.filter(e=>e.alive);

    // 리스폰(이지)
    if (IS_EASY && state.respawnQueue.length){
      for(const job of state.respawnQueue){ job.delay -= stepMs; }
      const run = state.respawnQueue.filter(j=>j.delay<=0);
      state.respawnQueue = state.respawnQueue.filter(j=>j.delay>0);
      for(const job of run){ if (canSpawnEnemy()) job.fn?.(); }
    }

    // 탄
    for (const b of state.bullets){ if(!b.active) continue; b.x+=b.vx; b.y+=b.vy; if (offscreen(b)) bulletPool.release(b); }
    for (const b of state.ebullets){ if(!b.active) continue; b.x+=b.vx; b.y+=b.vy; if (offscreen(b)) ebulletPool.release(b); }

    // 레이저
    for (const L of state.lasers){
      if (!L.active) continue;
      L.life++; L.onTick?.(L.life);
      if (L.life>=L.lifeMax) laserPool.release(L);
    }

    // 충돌: 플레이어 ↔ 적탄/레이저
    if (p.iFrame>0) p.iFrame -= 1;
    for (const eb of state.ebullets){
      if (!eb.active) continue;
      if (p.iFrame<=0 && circleHit(p, eb)){
        damagePlayer(1); ebulletPool.release(eb); eb.active=false;
      }
    }
    for (const L of state.lasers){
      if (!L.active || L.life < L.warmup) continue;
      const x1=L.x, y1=L.y, x2=L.x + Math.cos(L.angle)*L.length, y2=L.y + Math.sin(L.angle)*L.length;
      const d = pointSegDist(p.x,p.y, x1,y1, x2,y2);
      if (d < p.size + L.width*0.5 && p.iFrame<=0) damagePlayer(1);
    }

    // 충돌: 아군탄 ↔ 적
    outer: for (const b of state.bullets){
      if (!b.active) continue;
      for (const e of state.enemies){
        if (!e.alive) continue;
        if (circleHit(e, b)){
          e.hp -= b.dmg;
          bulletPool.release(b); b.active=false;
          if (e.hp<=0){
            e.alive=false;
            state.score += Math.floor(100*DIFF_SCALE.scoreMul);
            if (IS_EASY){
              // 이지: 사망 시 리스폰 예약(0.6~1.2s)
              state.respawnQueue.push({ delay: 600 + Math.random()*600, fn: ()=> respawnGruntTop?.() });
            }
          }
          continue outer;
        }
      }
    }

    // HUD/FPS
    fpsCount++; fpsTimer += stepMs;
    if (fpsTimer>=1000){ fpsNow=fpsCount; fpsCount=0; fpsTimer=0; }
    const aliveEnemies = enemyCountAlive();
    const bulletsF = state.bullets.filter(b=>b.active).length;
    const bulletsE = state.ebullets.filter(b=>b.active).length;
    if (hud) hud.textContent = `HP ${p.hp} | SCORE ${state.score} | STAGE ${STAGE} | DIFF ${DIFF.toUpperCase()} | FPS ${fpsNow} | E:${aliveEnemies} B:${bulletsF}/${bulletsE}`;

    if (p.hp<=0){ state.over=true; pauseLayer?.classList.add('show'); pauseLayer?.firstElementChild && (pauseLayer.firstElementChild.textContent='GAME OVER — 다시 시작을 눌러주세요'); }
  }

  function damagePlayer(d){ const p=state.player; p.hp -= d; p.iFrame=60; }

  // ====== 렌더 ======
  const stars = Array.from({length:60}, ()=>({x:rand(0,480), y:rand(0,640), s:rand(0.5,1.5)}));
  function drawStars(){
    ctx.fillStyle='#89a';
    for (const st of stars){
      st.y += st.s*0.6; if (st.y>640) { st.y = 0; st.x=rand(0,480); }
      ctx.fillRect(st.x, st.y, 2, 2);
    }
  }

  function render(){
    // 1) 배경
    ctx.fillStyle = '#03080e';
    ctx.fillRect(0,0,cvs.width,cvs.height);
    // 2) 별
    drawStars();

    // 3) 레이저
    for (const L of state.lasers){
      if (!L.active) continue;
      const warm = L.life < L.warmup;
      const x1=L.x, y1=L.y, x2=L.x+Math.cos(L.angle)*L.length, y2=L.y+Math.sin(L.angle)*L.length;
      ctx.lineWidth = L.width;
      ctx.strokeStyle = warm ? 'rgba(255,60,60,.5)' : 'rgba(120,220,255,.9)';
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }

    // 4) 적
    for (const e of state.enemies){
      ctx.fillStyle = '#f55';
      ctx.beginPath(); ctx.arc(e.x,e.y,e.size,0,6.28); ctx.fill();
    }

    // 5) 플레이어
    const p = state.player;
    ctx.fillStyle = p.iFrame>0 ? '#ffff88' : '#8ef';
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,6.28); ctx.fill();

    // 6) 탄
    ctx.fillStyle = '#aff';
    for (const b of state.bullets){ if(!b.active) continue; ctx.fillRect(b.x-2,b.y-2,4,4); }
    ctx.fillStyle = '#fb8';
    for (const b of state.ebullets){ if(!b.active) continue; ctx.fillRect(b.x-2,b.y-2,4,4); }

    // 7) 토스트
    if (toastTimer > 0){
      toastTimer -= 16;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#111';
      const w = 360, h = 44;
      ctx.fillRect((cvs.width-w)/2, 40, w, h);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#fff';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(toastText, cvs.width/2, 40+28);
      ctx.restore();
    }
  }

  // ====== 루프/시작 ======
  function loop(now){
    const ms = now - last; last = now;
    if (!paused) { update(ms); render(); }
    requestAnimationFrame(loop);
  }

  function start(){
    state.player = makePlayer();
    try { bgm.volume = IS_EASY?0.35:0.45; bgm.play().catch(()=>{}); } catch(_) {}
    requestAnimationFrame(loop);
  }

  start();
})();