// assets/js/stage_list_hard.js
(function () {
  const grid = document.getElementById('stage-grid');
  if (!grid) return;

  const TOTAL = 10;
  const pad2 = (n) => String(n).padStart(2, '0');

  grid.innerHTML = '';
  for (let i = 1; i <= TOTAL; i++) {
    const id = pad2(i);
    const a = document.createElement('a');
    a.className = 'stage-box hard';   // HARD는 하드 전용 색
    a.textContent = `H-${id}`;
    a.href = `game.html?difficulty=hard&stage=${id}`;
    a.setAttribute('aria-label', `Hard Stage ${id} 시작`);
    grid.appendChild(a);
  }
})();

const UNLOCK_KEY = 'progress_hard';
const unlockStage = Math.max(1, parseInt(localStorage.getItem(UNLOCK_KEY) || '1', 10));

const pad2 = (n) => String(n).padStart(2, '0');

const stageButtons = document.querySelectorAll('.stage-box');
stageButtons.forEach((btn) => {
  const num = parseInt(btn.dataset.stage, 10);
  const isUnlocked = num <= unlockStage;

  btn.classList.toggle('locked', !isUnlocked);

  if (isUnlocked) {
    btn.href = `game.html?difficulty=hard&stage=${pad2(num)}`;
    btn.setAttribute('aria-label', `Hard Stage ${pad2(num)} 시작`);
  } else {
    btn.href = '#';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast(`스테이지 ${pad2(num)}는 아직 잠겨 있습니다. 이전 스테이지를 먼저 클리어하세요!`);
    });
  }
});

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    Object.assign(t.style, {
      position: 'fixed', left: '50%', bottom: '32px', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '10px 14px',
      borderRadius: '10px', fontFamily: 'system-ui, sans-serif', fontSize: '14px',
      zIndex: 9999, opacity: 0, transition: 'opacity .2s ease'
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => (t.style.opacity = '0'), 1400);
}
