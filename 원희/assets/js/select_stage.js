// assets/js/select_stage.js

// 1. 사운드 파일 로드
const hoverSound = new Audio('assets/audio/chiose.mp3');
const clickSound = new Audio('assets/audio/pick.mp3');

// 2. 난이도 선택 버튼들 가져오기 ('.stage-btn')
const difficultyButtons = document.querySelectorAll('.stage-btn');

difficultyButtons.forEach(button => {
    // 3. 마우스 올렸을 때 (chiose.mp3)
    button.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0; // 소리 초기화
        hoverSound.play();
    });

    // 4. 클릭했을 때 (pick.mp3)
    button.addEventListener('click', (event) => {
        // (A) 기본 링크 이동을 즉시 막음
        event.preventDefault(); 
        
        // (B) 클릭 사운드 재생
        clickSound.currentTime = 0;
        clickSound.play();
        
        // (C) 이동할 주소(href) 저장
        const destination = event.currentTarget.href;
        
        // (D) 사운드가 재생될 시간(0.5초)을 기다린 후 페이지 이동
        setTimeout(() => {
            window.location.href = destination;
        }, 500); // 0.5초 지연
    });
});