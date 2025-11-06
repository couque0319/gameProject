// assets/js/events/shop_event.js
(function (global) {
  const NS = (global.ShopEvent = global.ShopEvent || {});

  // 전역 업그레이드 상태(없으면 생성)
  const U = (global.GameUpgrades = global.GameUpgrades || {
    coins: 0,
    // 기존 값과의 호환
    power: 1,       // 데미지 배수(탄 1발이 빼는 HP)
    fireRate: 1.0,  // 발사간격 배수(높을수록 빨라짐)
    speed: 1.0,     // 이동속도 배수
    // base.html 항목용 확장
    gunShots: 1,            // 기관포 발수(1→2→3)
    missileUnlocked: false, // 미사일 해금
    missileShots: 0,        // 미사일 발수(0→2)
    maxHP: 3                // 체력 강화(표시만, 실제 체력 시스템 연결 시 사용)
  });

  // 버튼/UI 생성
  function makeUI() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position:'fixed', inset:'0', background:'rgba(10,14,22,.86)', zIndex: 10001,
      display:'grid', placeItems:'center'
    });

    el.innerHTML = `
      <div style="min-width:560px;background:#0f1c2a;border:1px solid #2f4c69;border-radius:14px;padding:16px 18px;color:#e7f5ff;font:14px ui-monospace,Consolas,monospace;box-shadow:0 8px 30px rgba(0,0,0,.35)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;">
          <div style="font-weight:800;">함재 상점</div>
          <div>보유 코인: <b id="coins">${U.coins}</b></div>
          <button id="btn-exit" style="background:#1c2f44;color:#bfe7ff;border:1px solid #335a86;border-radius:10px;padding:6px 10px;cursor:pointer;">출항</button>
        </div>

        <div class="grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          <!-- 1행 -->
          ${slotBtn('1','기관포 2발',1)}
          ${slotBtn('2','기관포 3발',1)}
          ${slotBtn('3','미사일 해금',1)}
          ${slotBtn('4','미사일 2발',1)}
          <!-- 2행 -->
          ${slotBtn('5','연사력 강화',1)}
          ${slotBtn('6','데미지 강화',1)}
          ${slotBtn('7','체력 강화',1)}
          ${slotBtn('8','empty',1,true)}
        </div>

        <div style="opacity:.75;margin-top:12px;display:flex;gap:12px;flex-wrap:wrap">
          <span>기관포: <b id="st-gun">${U.gunShots}</b>발</span>
          <span>미사일: <b id="st-miss">${U.missileUnlocked ? (U.missileShots||0) : '잠김'}</b></span>
          <span>연사: <b id="st-fr">${(U.fireRate*100)|0}%</b></span>
          <span>데미지: <b id="st-pw">${U.power}x</b></span>
          <span>이속: <b id="st-sp">${(U.speed*100)|0}%</b></span>
          <span>체력: <b id="st-hp">${U.maxHP}</b></span>
        </div>
      </div>`;
    return el;
  }

  function slotBtn(key, title, price, disabled) {
    const dis = disabled ? 'disabled' : '';
    return `<button class="slot" data-k="${key}" data-price="${price}" ${dis}
      style="padding:10px;border-radius:10px;border:1px solid #395a7c;background:#142437;color:#e7f5ff;cursor:${dis?'not-allowed':'pointer'};text-align:left">
      <div style="font-weight:700">${title}</div>
      <div style="opacity:.75;font-size:12px">가격 ${price}C</div>
    </button>`;
  }

  // 구매 로직
  function refreshStats(ui){
    ui.querySelector('#coins').textContent = U.coins;
    ui.querySelector('#st-gun').textContent = U.gunShots;
    ui.querySelector('#st-miss').textContent = U.missileUnlocked ? (U.missileShots||0) : '잠김';
    ui.querySelector('#st-fr').textContent = (U.fireRate*100)|0 + '%';
    ui.querySelector('#st-pw').textContent = U.power + 'x';
    ui.querySelector('#st-sp').textContent = (U.speed*100)|0 + '%';
    ui.querySelector('#st-hp').textContent = U.maxHP;
  }

  function canBuy(key){
    // 선행조건
    if (key==='2' && U.gunShots < 2) return false;         // 2는 1(기관포 2발) 선행
    if (key==='4' && !U.missileUnlocked) return false;      // 4는 3(미사일 해금) 선행
    if (key==='8') return false;                            // empty
    return true;
  }

  function applyBuy(key){
    switch(key){
      case '1': // 기관포 2발
        if (U.gunShots < 2) U.gunShots = 2;
        break;
      case '2': // 기관포 3발
        if (U.gunShots >= 2) U.gunShots = 3;
        break;
      case '3': // 미사일 해금
        U.missileUnlocked = true;
        U.missileShots = Math.max(U.missileShots, 0);
        break;
      case '4': // 미사일 2발
        if (U.missileUnlocked) U.missileShots = 2;
        break;
      case '5': // 연사력 +10%
        U.fireRate = Math.min(2.5, U.fireRate * 1.10);
        break;
      case '6': // 데미지 +1
        U.power += 1;
        break;
      case '7': // 체력 +1 (표시용)
        U.maxHP += 1;
        break;
      default:
        return false;
    }
    return true;
  }

  NS.start = function start(scene, { onExit } = {}) {
    const ui = makeUI();
    document.body.appendChild(ui);

    const playClick = ()=> scene.sound?.play?.('hit', { volume: .25 });

    function tryBuy(key, price){
      if (!canBuy(key)) { shake(ui); return; }
      if (U.coins < price) { shake(ui); return; }
      U.coins -= price;
      if (applyBuy(key)) {
        flash(ui);
        refreshStats(ui);
        playClick();
      }
    }

    ui.querySelectorAll('.slot').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const key = btn.dataset.k;
        const price = Number(btn.dataset.price||1);
        tryBuy(key, price);
      });
    });

    ui.querySelector('#btn-exit').addEventListener('click', ()=>{
      ui.remove();
      onExit && onExit({ upgrades: { ...U } });
    });

    refreshStats(ui);
  };

  // 작은 연출
  function flash(ui){
    ui.style.transition='filter .15s';
    ui.style.filter='brightness(1.25)';
    setTimeout(()=> ui.style.filter='', 160);
  }
  function shake(ui){
    const el = ui.querySelector('.grid');
    el.style.transition='transform .08s';
    el.style.transform='translateX(4px)';
    setTimeout(()=> el.style.transform='', 90);
  }

})(window);