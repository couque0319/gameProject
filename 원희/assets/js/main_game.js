// main_game.js

// --- 1. HTML 요소들 가져오기 ---
const settingsModal = document.getElementById('settings-modal');
const openBtn = document.getElementById('settings-open-btn');
const closeBtn = document.getElementById('settings-close-btn');

const audio = document.getElementById('main-music');
const volumeSlider = document.getElementById('volume-slider');

const controlButtonContainer = document.querySelector('.control-buttons');
const controlButtons = document.querySelectorAll('.control-btn');

// --- 2. 설정창 열기/닫기 이벤트 ---

// 톱니바퀴 클릭 시
openBtn.addEventListener('click', () => {
    settingsModal.classList.add('show'); // .show 클래스 추가해서 보이기
});

// X 버튼 클릭 시
closeBtn.addEventListener('click', () => {
    settingsModal.classList.remove('show'); // .show 클래스 제거해서 숨기기
});

// 모달 배경 클릭 시 (선택 사항)
settingsModal.addEventListener('click', (event) => {
    // 클릭된 곳이 모달 배경(자기 자신)일 때만 닫힘
    if (event.target === settingsModal) {
        settingsModal.classList.remove('show');
    }
});


// --- 3. 소리 조절 이벤트 ---

// 페이지 로드 시, 슬라이더 값을 실제 오디오 볼륨에 적용
// (audio.volume은 0~1 사이, 슬라이더는 0~100)
// audio가 로드되지 않았을 수 있으니 null 체크
if (audio) {
    audio.volume = volumeSlider.value / 100;
}

// 슬라이더를 '움직일 때마다'(input) 볼륨 변경
volumeSlider.addEventListener('input', (event) => {
    if (audio) {
        const newVolume = event.target.value / 100;
        audio.volume = newVolume;
    }
});


// --- 4. 조작 방식 선택 이벤트 ---

// '조작 방식' 버튼 그룹에 이벤트 리스너 추가
controlButtonContainer.addEventListener('click', (event) => {
    // 클릭된 요소가 .control-btn이 아니면 무시
    if (!event.target.classList.contains('control-btn')) {
        return;
    }

    // 1. 모든 버튼에서 'active' 클래스 제거
    controlButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 2. 지금 클릭한 버튼에만 'active' 클래스 추가
    const clickedButton = event.target;
    clickedButton.classList.add('active');

    // 3. 어떤 키가 선택되었는지 확인 (나중에 게임 로직에서 사용)
    const selectedControl = clickedButton.dataset.control; // (e.g., "wasd", "arrows", "mouse")
    console.log('선택된 조작 방식:', selectedControl);

    // (선택 사항) 사용자의 선택을 브라우저에 저장하기
    // localStorage.setItem('controlScheme', selectedControl);
});
