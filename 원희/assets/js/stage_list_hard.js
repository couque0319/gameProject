// stage_list_hard.js

// 1. 스테이지 버튼들 가져오기
const stageButtons = document.querySelectorAll('.stage-box');

// 2. 각 버튼에 'hard' 난이도 링크 설정하기
stageButtons.forEach(button => {
    // 잠긴 버튼은 링크 설정 안 함
    if (button.classList.contains('locked')) {
        button.href = '#';
        return;
    }

    const stageNumber = button.dataset.stage; // data-stage="1"

    // 'hard' 모드용 링크 설정
    button.href = `game.html?difficulty=hard&stage=${stageNumber}`;
});