// assets/js/hangar.js

// 1. HTML 요소 가져오기
const selectionBoxes = document.querySelectorAll('.airplane-box');

// --- 1-A. 사운드 파일 로드 추가 ---
const hoverSound = new Audio('assets/audio/chiose.mp3');
const clickSound = new Audio('assets/audio/pick.mp3');
// --- ---

// 2. 현재 저장된 기체 선택 불러오기
// localStorage는 브라우저를 껐다 켜도 유지되는 간단한 저장소입니다.
const savedPlaneId = localStorage.getItem('selectedAirplane');

// 3. 페이지 로드 시, 이전에 선택한 기체가 있으면 .selected 표시하기
if (savedPlaneId) {
    const savedBox = document.querySelector(`.airplane-box[data-plane-id="${savedPlaneId}"]`);
    if (savedBox) {
        savedBox.classList.add('selected');
    }
}

// 4. 각 기체 박스에 이벤트 추가하기
selectionBoxes.forEach(box => {
    
    // --- 4-A. 마우스 호버 사운드 추가 ---
    box.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play();
    });
    // --- ---

    // 4-B. 기존 클릭 이벤트 (localStorage 저장)
    box.addEventListener('click', () => {
        
        // --- 4-C. 클릭 사운드 재생 추가 ---
        clickSound.currentTime = 0;
        clickSound.play();
        // --- ---
        
        // (A) 일단 모든 박스에서 'selected' 클래스 제거
        selectionBoxes.forEach(b => b.classList.remove('selected'));
        
        // (B) 지금 클릭한 박스에만 'selected' 클래스 추가
        box.classList.add('selected');
        
        // (C) 가장 중요: 클릭한 기체의 ID (data-plane-id)를 localStorage에 저장
        const planeId = box.dataset.planeId;
        localStorage.setItem('selectedAirplane', planeId);
        
        console.log(`기체 선택됨: ${planeId}`);
    });
});