// assets/js/stage_list_hard.js

// --- 1. 사운드 파일 로드 ---
const hoverSound = new Audio('assets/audio/chiose.mp3');
const clickSound = new Audio('assets/audio/pick.mp3');

// --- 2. 스테이지 버튼들 가져오기 ---
const stageButtons = document.querySelectorAll('.stage-box');

// --- 3. 각 버튼에 링크 설정 및 사운드 이벤트 추가 ---
stageButtons.forEach(button => {
    
    // --- (A) 잠겼는지 먼저 확인 ---
    const isLocked = button.classList.contains('locked');

    // --- (B) 링크 설정 (기존과 동일) ---
    if (isLocked) {
        button.href = '#';
    } else {
        const stageNumber = button.dataset.stage; // data-stage="1"
        button.href = `game.html?difficulty=hard&stage=${stageNumber}`;
    }

    // --- (C) 마우스 호버 사운드 (수정) ---
    button.addEventListener('mouseenter', () => {
        // ▼▼▼ 잠긴 버튼이면 아무것도 안 함 ▼▼▼
        if (isLocked) return;
        
        hoverSound.currentTime = 0;
        hoverSound.play();
    });

    // --- (D) 클릭 사운드 및 지연 이동 (수정) ---
    button.addEventListener('click', (event) => {
        // (1) 기본 이동 막기
        event.preventDefault();
        
        // ▼▼▼ 잠긴 버튼이면 아무것도 안 함 ▼▼▼
        if (isLocked) return;
        
        // (3) 안 잠긴 버튼: 클릭 소리 재생 + 0.5초 후 이동
        clickSound.currentTime = 0;
        clickSound.play();
        
        const destination = button.href;
        
        setTimeout(() => {
            window.location.href = destination;
        }, 500); // 0.5초 지연
    });
});