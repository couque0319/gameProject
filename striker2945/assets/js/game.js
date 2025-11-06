// game.js — Canvas STG 최종본
// 요구사항 통합: 이미지 렌더(플레이어/탄/적), StageManager 연동, 스테이지 클리어

(function(){
  // ====== 캔버스/컨텍스트 ======
  const W = 480, H = 720;
  const cvs = document.getElementById('game');
  const ctx = cvs.getContext('2d');
  cvs.width = W; cvs.height = H;

  // ====== 유틸 ======
  const clamp = (v,min,max)=> Math.max(min, Math.min(max, v));
  const nowMS = ()=> performance.now();

  // ====== 입력 ======
  const key = {};
  addEventListener('keydown', e => key[e.code]=true);
  addEventListener('keyup',   e => key[e.code]=false);

  // ====== 전역 상태 ======
  let lastTS = nowMS();
  let acc = 0;
  const FIXED_DT = 1000/60; // 60fps 고정
  const AUTO_FIRE_MS = 200;
  const BOSS_HIT_RADIUS    = 30; // 보스: 원래 r=24, 판정만 넓힘
  const MIDBOSS_HIT_RADIUS = 26; // 중간보스: 원래 r=20, 판정만 넓힘

  // ====== 플레이어 ======
  const player = {
    x: W*0.5, y: H-80, r: 8,
    spd: 200,
    fireCd: 0,
    blink: 0,
    alive: true,
    hp: 3
  };

  // ====== 이미지: 로더 없이 즉시 생성(렌더 시 안전 체크) ======
  // 플레이어
  const playerImg = new Image();
  playerImg.src = 'assets/images/player1.png';

  // 플레이어 탄(고정 1장)
  const bulletImg = new Image();
  bulletImg.src = 'assets/images/bullets/bullet1.png';

  // 적 이미지(en1~en13)
  const enemyImages = [];
  for (let i=1;i<=13;i++){
    const img = new Image();
    img.src = `assets/images/enemy/en${i}.png`;
    enemyImages.push(img);
  }

  // 적 탄 이미지(고정 1장)
  const enemyBulletImg = new Image();
  enemyBulletImg.src = 'assets/images/enemy_bullet/enemy_bullet.png';

  // ====== 오브젝트 풀 ======
  function makePool(factory, size){
    const arr = new Array(size).fill(0).map(factory);
    return {
      arr,
      get(){
        for(let i=0;i<arr.length;i++){
          if(!arr[i].active) return arr[i];
        }
        return null;
      }
    };
  }

  const pBullets = makePool(()=>({active:false,x:0,y:0,vx:0,vy:-360,img:null}), 512);
  const eBullets = makePool(()=>({active:false,x:0,y:0,vx:0,vy:120,img:null}), 768);
  const enemies  = makePool(()=>({active:false,x:0,y:0,vx:0,vy:70,hp:3,r:14,t:0,fireInt:1000,fireT:0,pattern:'straight',img:null}), 256);

  // ====== 보스(단일 슬롯) ======
  let boss = null;
  function spawnBoss(){
    boss = {active:true,x:W*0.5,y:-60,vx:0,vy:60,
            r:24,                   // 시각 표시용 반경(원 그리기)
            hitR: BOSS_HIT_RADIUS,  // 충돌 판정용 반경(더 큼)
            hp:120,t:0,fireInt:600,fireT:0};
  }
  function spawnMiniBoss(){
    boss = {active:true,x:W*0.5,y:-60,vx:0,vy:60,
            r:20,                      // 시각 표시용
            hitR: MIDBOSS_HIT_RADIUS,  // 충돌 판정용
            hp:70,t:0,fireInt:800,fireT:0};
  }

  // ====== 스테이지 클리어 상태 ======
  let stageCleared = false;
  let stageClearTime = 0;
  let bannerAlpha = 0;

  // ====== 스폰 함수 ======
  function tHP(h){ return h|0; }

  function spawnEnemy(x,y,vx,vy,hp,fireInt,pattern){
    const e = enemies.get(); if(!e) return null;
    const img = enemyImages.length ? enemyImages[(Math.random()*enemyImages.length)|0] : null;
    Object.assign(e,{active:true,x,y,vx,vy,hp:tHP(hp),r:19,t:0,fireInt,fireT:0,pattern,img});
    return e;
  }

  function spawnPBullet(x,y,vy=-360){
    const b = pBullets.get(); if(!b) return null;
    Object.assign(b,{active:true,x,y,vx:0,vy,img: bulletImg || null});
    return b;
  }

  function spawnEBullet(x,y,vx,vy){
    const b = eBullets.get(); if(!b) return null;
    Object.assign(b,{active:true,x,y,vx,vy,img: enemyBulletImg || null});
    return b;
  }

  // ====== 스테이지/쿼리 ======
  function getQuery(){
    const p = new URLSearchParams(location.search);
    return { difficulty: p.get('difficulty') || 'easy', stage: p.get('stage') || '01' };
  }
  const {difficulty, stage} = getQuery();
  const isEasy = (difficulty === 'easy');
  // 이지 모드에서만 적 탄속에 곱해줄 스케일(30% 감속)
  const EASY_EBULLET_SPEED_SCALE = 0.70;

  // ====== 토스트/Tip(옵션) ======
  let tipMsg = ''; let tipTime = 0;
  function showTip(s){ tipMsg = s; tipTime = nowMS(); }

  // ====== 업데이트 로직 ======
  function update(dt){
    // 입력
    const spd = player.spd * (key['ShiftLeft']||key['ShiftRight'] ? 0.5 : 1);
    if (player.alive){
      if (key['ArrowLeft'])  player.x -= spd*dt/1000;
      if (key['ArrowRight']) player.x += spd*dt/1000;
      if (key['ArrowUp'])    player.y -= spd*dt/1000;
      if (key['ArrowDown'])  player.y += spd*dt/1000;
      player.x = clamp(player.x, 14, W-14);
      player.y = clamp(player.y, 20, H-20);

      // 자동 발사
    player.fireCd -= dt;
    if (player.fireCd <= 0){
      spawnPBullet(player.x, player.y - 20, -420);
      player.fireCd = AUTO_FIRE_MS;
    }
  }

    // 플레이어 탄
    pBullets.arr.forEach(b=>{
      if(!b.active) return;
      b.x += b.vx*dt/1000;
      b.y += b.vy*dt/1000;
      if (b.y < -24 || b.x < -24 || b.x > W+24) b.active=false;
    });

    // 적
    enemies.arr.forEach(e=>{
      if(!e.active) return;
      e.t += dt;
      e.x += e.vx*dt/1000;
      e.y += e.vy*dt/1000;

      // 간단 패턴: straight/aim/spread3/spread5
      e.fireT -= dt;
      if (e.fireT<=0){
        enemyFire(e);
        e.fireT = e.fireInt;
      }

      if (e.y > H+50 || e.x < -60 || e.x > W+60) e.active=false;
    });

    // 보스
    if (boss && boss.active){
      boss.t += dt;
      boss.x += boss.vx*dt/1000;
      boss.y += boss.vy*dt/1000;
      if (boss.y > 120) boss.vy = 0; // 진입 후 정지
      boss.fireT -= dt;
      if (boss.fireT<=0){
        bossFire();
        boss.fireT = boss.fireInt;
      }
      if (boss.hp<=0){ boss.active=false; }
    }

    // 적 탄
    eBullets.arr.forEach(b=>{
      if(!b.active) return;
      b.x += b.vx*dt/1000;
      b.y += b.vy*dt/1000;
      if (b.y > H+24 || b.x < -24 || b.x > W+24) b.active=false;
    });

    // 충돌
    handleCollisions(dt);

    // 무적/블링크
    if (player.blink>0) player.blink = Math.max(0, player.blink - dt);

    // StageManager 진행
    StageManager.update(dt, {
      onTip: showTip,
      onSpawnEnemy: ({x,y,vx,vy,hp,fireInt,pattern})=>{
        spawnEnemy(x,y,vx,vy,hp,fireInt,pattern);
      },
      onSpawnMidBoss: spawnMiniBoss,
      onSpawnBoss: spawnBoss
    });

    // 스테이지 클리어 체크
    if (!stageCleared && canStageClear()){
      triggerStageClear();
    }
  }

  // ====== 적 발사 패턴 ======
  function angleToPlayer(ex,ey){
    const dx = player.x - ex, dy = player.y - ey;
    return Math.atan2(dy, dx);
  }
  function enemyFire(e){
    const p = e.pattern || 'straight';
    // 이지 모드일 때만 스피드 스케일 적용
    const spdScale = isEasy ? EASY_EBULLET_SPEED_SCALE : 1.0;
 
    if (p === 'straight'){
      // 아래로 단발
      const vy = 160 * spdScale;
      spawnEBullet(e.x, e.y+10, 0, vy);
    } else if (p === 'aim'){
      // 플레이어 조준
      const ang = angleToPlayer(e.x, e.y);
      const spd = 180 * spdScale;
      spawnEBullet(e.x, e.y, Math.cos(ang)*spd, Math.sin(ang)*spd);
    } else if (p === 'spread3'){
      // 스프레드3: 이지=2way(좌/우), 노멀/하드=3way
      const base = Math.PI/2; // 아래
      const spd = 160 * spdScale, spread = Math.PI/12;
      const rays = isEasy ? [-1, +1] : [-1, 0, +1];
      for (const i of rays){
        spawnEBullet(e.x, e.y, Math.cos(base + i*spread)*spd, Math.sin(base + i*spread)*spd);
      }
    } else if (p === 'spread5'){
      // 스프레드5: 이지=3way(좌/중/우), 노멀/하드=5way
      const base = Math.PI/2;
      const spd = 170 * spdScale, spread = Math.PI/16;
      const rays = isEasy ? [-1, 0, +1] : [-2, -1, 0, +1, +2];
      for (const i of rays){
        spawnEBullet(e.x, e.y, Math.cos(base + i*spread)*spd, Math.sin(base + i*spread)*spd);
      }
    } else {
      // 알 수 없는 패턴: 안전하게 단발(스케일 적용)
      const vy = 150 * spdScale;
      spawnEBullet(e.x, e.y+10, 0, vy);
    }
  }
  function bossFire(){
    // 간단 라운드 탄막 + 조준 단발 섞기
    const n = 12; const spd = 160;
    for (let i=0;i<n;i++){
      const a = (Math.PI*2) * (i/n);
      spawnEBullet(boss.x, boss.y, Math.cos(a)*spd, Math.sin(a)*spd);
    }
    // 조준
    const ang = angleToPlayer(boss.x, boss.y);
    spawnEBullet(boss.x, boss.y, Math.cos(ang)*220, Math.sin(ang)*220);
  }

  // ====== 충돌 ======
  function hitCircle(ax,ay,ar, bx,by,br){
    const dx=ax-bx, dy=ay-by;
    return (dx*dx + dy*dy) <= (ar+br)*(ar+br);
  }

  function handleCollisions(dt){
    // 플레이어 탄 vs 적
    enemies.arr.forEach(e=>{
      if(!e.active) return;
      for (let i=0;i<pBullets.arr.length;i++){
        const b = pBullets.arr[i];
        if(!b.active) continue;
        if (hitCircle(e.x,e.y,e.r, b.x,b.y,6)){
          b.active=false;
          e.hp -= 1;
          if (e.hp<=0){ e.active=false; }
          break;
        }
      }
    });

    // 플레이어 탄 vs 보스
    if (boss && boss.active){
      for (let i=0;i<pBullets.arr.length;i++){
        const b = pBullets.arr[i];
        if(!b.active) continue;
        const br = boss.hitR ?? boss.r;
        if (hitCircle(boss.x,boss.y,br, b.x,b.y,6)){
          b.active=false;
          boss.hp -= 1;
          if (boss.hp<=0){ boss.active=false; }
        }
      }
    }

    // 적/적탄 vs 플레이어
    if (player.alive && player.blink<=0){
      // 적탄
      for (let i=0;i<eBullets.arr.length;i++){
        const b = eBullets.arr[i];
        if(!b.active) continue;
        if (hitCircle(player.x,player.y,player.r, b.x,b.y,4)){
          b.active=false; damagePlayer();
          break;
        }
      }
      // 적 몸통
      for (let i=0;i<enemies.arr.length;i++){
        const e = enemies.arr[i];
        if(!e.active) continue;
        if (hitCircle(player.x,player.y,player.r, e.x,e.y,e.r)){
          e.active=false; damagePlayer();
          break;
        }
      }
      // 보스 몸통
      if (boss && boss.active && hitCircle(player.x,player.y,player.r, boss.x,boss.y,(boss.hitR ?? boss.r))){
        damagePlayer();
      }
    }
  }

  function damagePlayer(){
    player.hp -= 1;
    player.blink = 1500; // 1.5s 무적
    if (player.hp<=0){
      player.alive=false;
      // 게임 오버 처리(간단): 스테이지 선택으로
      setTimeout(()=>{
        if (difficulty === 'easy') location.href='stage_list_easy.html';
        else location.href='stage_list_hard.html';
      }, 1200);
    }
  }

  // ====== 스테이지 클리어 판정/연출 ======
  function noneActive(pool){
    for (let i=0;i<pool.arr.length;i++){
      if (pool.arr[i].active) return false;
    }
    return true;
  }
  function isBossGone(){
    return !boss || !boss.active || boss.hp<=0 || boss.y<-100 || boss.y>H+100;
  }
  function canStageClear(){
    const scheduleDone = StageManager.isAllScheduled();
    const enemiesGone  = noneActive(enemies);
    const eBulletsGone = noneActive(eBullets);
    return scheduleDone && enemiesGone && eBulletsGone && isBossGone();
  }
  function triggerStageClear(){
    stageCleared = true;
    stageClearTime = nowMS();
    bannerAlpha = 0;
    // 잔여 적탄 제거
    eBullets.arr.forEach(b=> b.active=false);
  }

  function goNextOrSelect(){
    const s = parseInt(stage,10)||1;
    const next = (s+1).toString().padStart(2,'0');
    if (s<10){
      location.href = `game.html?difficulty=${difficulty}&stage=${next}`;
    }else{
      location.href = (difficulty==='easy') ? 'stage_list_easy.html' : 'stage_list_hard.html';
    }
  }

  // ====== 그리기 ======
  function draw(){
    // 배경
    ctx.fillStyle = '#071521';
    ctx.fillRect(0,0,W,H);

    // 간단 별 효과
    ctx.fillStyle = '#0d2a3f';
    const t = nowMS()/20|0;
    for(let i=0;i<40;i++){
      const x = (i*53 + t) % W;
      const y = (i*97 + t) % H;
      ctx.fillRect(x,y,2,2);
    }

    // 플레이어
    const blinkOn = (player.blink>0) ? ((nowMS()/80|0)%2===0) : false;
    if (player.alive && !blinkOn){
      if (playerImg && playerImg.complete && playerImg.naturalWidth>0){
        const w=64, h=64;
        ctx.drawImage(playerImg, player.x-w/2, player.y-h/2, w, h);
      }else{
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath(); ctx.arc(player.x,player.y,player.r,0,Math.PI*2); ctx.fill();
      }
    }

    // 플레이어 탄
    pBullets.arr.forEach(b=>{
      if(!b.active) return;
      const img = b.img;
      if (img && img.complete && img.naturalWidth>0){
        const w=12,h=24;
        ctx.drawImage(img, b.x-w/2, b.y-h/2, w, h);
      }else{
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(b.x-2,b.y-6,4,12);
      }
    });

    // 적
    enemies.arr.forEach(e=>{
      if(!e.active) return;
      const img = e.img;
      if (img && img.complete && img.naturalWidth>0){
        const size = e.r*4; // 확대
        ctx.drawImage(img, e.x-size/2, e.y-size/2, size, size);
      }else{
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fill();
      }
    });

    // 보스
    if (boss && boss.active){
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(boss.x,boss.y,boss.r,0,Math.PI*2); ctx.stroke();
      // HP 바
      const w=200, h=8;
      const ratio = clamp(boss.hp/120,0,1);
      ctx.fillStyle='#111827'; ctx.fillRect(W/2-w/2, 20, w, h);
      ctx.fillStyle='#ef4444'; ctx.fillRect(W/2-w/2, 20, w*ratio, h);
      ctx.strokeStyle='#fecaca'; ctx.strokeRect(W/2-w/2, 20, w, h);
    }

    // 적 탄
    eBullets.arr.forEach(b=>{
      if(!b.active) return;
      const img = b.img;
      if (img && img.complete && img.naturalWidth>0){
        const w=14,h=14;
        ctx.drawImage(img, b.x-w/2, b.y-h/2, w, h);
      }else{
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(b.x-2,b.y-2,4,4);
      }
    });

    // Tip
    if (nowMS() - tipTime < 1200){
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tipMsg, W/2, 64);
      ctx.restore();
    }

    // STAGE CLEAR 배너
    if (stageCleared){
      const elapsed = nowMS() - stageClearTime;
      bannerAlpha = Math.min(1, elapsed/800);
      ctx.save();
      ctx.globalAlpha = bannerAlpha;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STAGE CLEAR!', W/2, H/2);
      ctx.restore();

      if (elapsed > 1800) goNextOrSelect();
    }

    // 플레이어 HP 표시(간단)
    ctx.fillStyle='#e5e7eb';
    ctx.font='bold 14px sans-serif';
    ctx.textAlign='left';
    ctx.fillText(`HP: ${Math.max(0,player.hp)}`, 16, H-16);
  }

  // ====== 메인 루프 ======
  function frame(ts){
    const delta = ts - lastTS;
    lastTS = ts;
    acc += delta;
    // 고정 타임스텝
    while (acc >= FIXED_DT){
      update(FIXED_DT);
      acc -= FIXED_DT;
    }
    draw();
    requestAnimationFrame(frame);
  }

  // ====== 스테이지 초기화 ======
  function initStage(){
    const def = (StageDefs && StageDefs.STAGES && StageDefs.STAGES[difficulty] && StageDefs.STAGES[difficulty][stage]) || null;
    if (!def){
      alert(`스테이지 정의를 찾을 수 없습니다: ${difficulty}-${stage}`);
      location.href = (difficulty==='easy') ? 'stage_list_easy.html' : 'stage_list_hard.html';
      return;
    }
    StageManager.init(def);
  }

  // ====== 시작 ======
  initStage();
  requestAnimationFrame(frame);
})();
