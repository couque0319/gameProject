// hangar.js
(function () {
  const KEY = 'selectedAirplane';
  const cards = document.querySelectorAll('.airplane-box');
  const btn = document.getElementById('btn-plane-confirm');

  // 저장된 선택 복원
  const saved = localStorage.getItem(KEY) || 'airplane1';
  setSelected(saved);

  // 카드 클릭/키보드
  cards.forEach(card => {
    card.addEventListener('click', () => {
      setSelected(card.dataset.planeId);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelected(card.dataset.planeId);
      }
    });
  });

  // 스테이지 선택 화면으로 이동
  btn?.addEventListener('click', () => {
    const chosen = localStorage.getItem(KEY);
    if (!chosen) {
      alert('전투기를 먼저 선택해주세요!');
      return;
    }
    location.href = 'select_stage.html';
  });

  function setSelected(id) {
    localStorage.setItem(KEY, id);
    cards.forEach(c => {
      const on = c.dataset.planeId === id;
      c.classList.toggle('selected', on);           // 선택 시 시각 스타일만 변경
      c.setAttribute('aria-pressed', String(on));   // 접근성
    });
  }
})();
