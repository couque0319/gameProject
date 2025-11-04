## 인트로 구현 ver1 

index.html
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROJECT: MECH</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div class="splash-screen">
        <div class="splash-content">
            <h1>PROJECT: DESTROYER</h1>
            <button id="enter-button">ENTER SITE</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

style.css
```
/* style.css */

/* 기본 여백 제거 및 전체 높이 설정 */
body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.splash-screen {
    /* 사용자가 업로드한 파일 이름(intro_image.png)을 사용합니다. */
    background-image: url('intro_image.png');

    /* 화면 전체 높이(100vh)를 차지하도록 설정 */
    height: 100vh; 

    /* 이미지가 화면 중앙에 오도록 설정 */
    background-position: center;
    background-repeat: no-repeat;

    /* 이미지가 비율을 유지하며 화면을 꽉 채우도록 설정 */
    background-size: cover; 

    /* 콘텐츠(텍스트, 버튼)를 화면 정중앙에 배치하기 위한 Flexbox 설정 */
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.splash-content {
    /* 텍스트와 버튼 색상을 흰색으로 설정 */
    color: white;
}

.splash-content h1 {
    font-size: 3.5rem; /* 제목 글자 크기 */
    margin-bottom: 20px;
    
    /* 어두운 배경에서도 글자가 잘 보이도록 그림자 추가 */
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9);
}

.splash-content button {
    font-size: 1.2rem;
    padding: 12px 25px;
    
    /* 버튼 배경을 살짝 투명하게 설정 */
    background-color: rgba(255, 255, 255, 0.15); 
    color: white;
    border: 2px solid white;
    border-radius: 5px;
    cursor: pointer;
    
    /* 마우스를 올렸을 때 부드럽게 변경되도록 transition 추가 */
    transition: background-color 0.3s, color 0.3s;
}

/* 버튼에 마우스를 올렸을 때 (hover) 스타일 변경 */
.splash-content button:hover {
    background-color: white;
    color: black;
}
```

script.js
```
// script.js

// 'enter-button' ID를 가진 버튼 요소를 찾습니다.
const enterButton = document.getElementById('enter-button');

// 버튼에 'click' 이벤트 리스너를 추가합니다.
enterButton.addEventListener('click', function() {
    
    // 버튼이 클릭되었을 때 실행할 동작
    console.log('Enter 버튼 클릭됨!');
    alert('메인 사이트로 이동합니다!');

    // (옵션) 만약 'main.html'이라는 다른 페이지로 이동하고 싶다면
    // 아래 코드의 주석을 해제
    // window.location.href = 'main.html';
});
```


파일 위치(이렇게 작업을 해야 파일이 안 꼬임)
```
📁 Webgame/ 
   |
   ├── 📄 index.html      (HTML 파일)
   ├── 📄 style.css        (CSS 파일)
   ├── 📄 script.js        (JavaScript 파일)
   └── 🖼️ intro_image.png (인트로 이미지 파일)
```

이거는 실행 화면 
<img width="1919" height="1024" alt="image" src="https://github.com/user-attachments/assets/55e4d6c5-e85d-4249-a9e6-bbbeb4b86065" />

--------------------------------------
## 인트로 구현 ver2 (인트로 글이 깜빡깜빡 거리고 버튼을 삭제하고 아무 곳이나 입력값이 들어오면 메인화면으로 넘어가도록 변경)

index.html
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROJECT: MECH</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div class="splash-screen">
        <div class="splash-content">
            <h1>PROJECT: DESTROYER</h1>
            </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

style.css
```
/* style.css */

/* 기본 여백 제거 및 전체 높이 설정 */
body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.splash-screen {
    /*여기에 이미지 파일 경로를 정확히 입력하세요! */
    background-image: url('intro_image.png');

    height: 100vh; /* 화면 전체 높이 */

    /* 이미지가 화면 중앙에 오도록 설정 */
    background-position: center;
    background-repeat: no-repeat;

    /* 이미지가 비율을 유지하며 화면을 꽉 채우도록 설정 */
    background-size: cover; 

    /* 콘텐츠(텍스트)를 화면 정중앙에 배치 */
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.splash-content {
    /* 텍스트 색상을 흰색으로 설정 */
    color: white;
}

/* 깜박임 애니메이션 정의 */
@keyframes blink {
    0% { opacity: 1; } /* 시작: 완전히 보임 */
    50% { opacity: 0; } /* 중간: 완전히 투명 */
    100% { opacity: 1; } /* 끝: 다시 완전히 보임 */
}

.splash-content h1 {
    font-size: 3.5rem; /* 제목 글자 크기 */
    margin-bottom: 20px;
    
    /* 어두운 배경에서도 글자가 잘 보이도록 그림자 추가 */
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9);
    
    /* 애니메이션 적용: blink 애니메이션을 1.5초 간격으로 무한 반복 */
    animation: blink 1.5s infinite; 
}
```

script.js
```
// script.js

// const enterButton = ... (버튼 관련 변수 삭제)
const splashScreen = document.querySelector('.splash-screen'); // 스플래시 스크린 요소

// 메인 페이지로 이동하는 함수
function goToMain() {
    splashScreen.style.opacity = '0'; 
    splashScreen.style.transition = 'opacity 1s ease-out'; 

    setTimeout(() => {
        splashScreen.style.display = 'none';

        console.log('메인 콘텐츠 로드!');
        
        // (옵션) 'main.html' 페이지로 이동
        // window.location.href = 'main.html';

    }, 1000); 
}


// 1. 'ENTER SITE' 버튼 클릭 (삭제됨)
// enterButton.addEventListener('click', ... (버튼 이벤트 리스너 삭제)


// 2. 아무 키나 눌렀을 때 (키보드 입력)
document.addEventListener('keydown', function(event) {
    console.log('아무 키나 눌림:', event.key);
    goToMain();
});

// 3. 아무 곳이나 마우스 클릭 시
document.addEventListener('click', function() {
    console.log('아무 곳이나 클릭됨!');
    goToMain();
});
```

화면 넘어가지는 중..
<img width="1914" height="1028" alt="image" src="https://github.com/user-attachments/assets/60556e87-981b-4da7-8f1b-3513134479fb" />

-------------------------------------

## 인트로 구현 ver3 (인트로 소리 나오게) 

index.html
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROJECT: MECH</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div class="splash-screen">
        <div class="splash-content">
            <h1>PROJECT: DESTROYER</h1>
        </div>
    </div>

    <audio id="intro-music" src="intro_music.mp3" loop muted autoplay></audio>

    <script src="script.js"></script>
</body>
</html>
```

style.css 
```
/* style.css */

/* 기본 여백 제거 및 전체 높이 설정 */
body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.splash-screen {
    /*여기에 이미지 파일 경로를 정확히 입력하세요! */
    background-image: url('intro_image.png');

    height: 100vh; /* 화면 전체 높이 */

    /* 이미지가 화면 중앙에 오도록 설정 */
    background-position: center;
    background-repeat: no-repeat;

    /* 이미지가 비율을 유지하며 화면을 꽉 채우도록 설정 */
    background-size: cover; 

    /* 콘텐츠(텍스트)를 화면 정중앙에 배치 */
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.splash-content {
    /* 텍스트 색상을 흰색으로 설정 */
    color: white;
}

/* 깜박임 애니메이션 정의 */
@keyframes blink {
    0% { opacity: 1; } /* 시작: 완전히 보임 */
    50% { opacity: 0; } /* 중간: 완전히 투명 */
    100% { opacity: 1; } /* 끝: 다시 완전히 보임 */
}

.splash-content h1 {
    font-size: 3.5rem; /* 제목 글자 크기 */
    margin-bottom: 20px;
    
    /* 어두운 배경에서도 글자가 잘 보이도록 그림자 추가 */
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9);
    
    /* 애니메이션 적용: blink 애니메이션을 1.5초 간격으로 무한 반복 */
    animation: blink 1.5s infinite; 
}
```

script.js

``` 
// script.js

const splashScreen = document.querySelector('.splash-screen');
const audio = document.getElementById('intro-music');
let isTransitioning = false;
let isUnmuted = false;

// 초기 볼륨 설정
audio.volume = 0.7; // 70% 볼륨으로 시작

// 오디오 파일 로드 확인
audio.addEventListener('loadeddata', () => {
    console.log('오디오 파일 로드 완료');
});

audio.addEventListener('error', (e) => {
    console.error('오디오 로드 실패:', e);
    console.error('파일 경로를 확인하세요: intro_music.mp3');
});

// 자동재생 시도 (음소거 상태로)
audio.play().catch(e => {
    console.log("자동재생 대기 중 (사용자 상호작용 필요):", e.message);
});

// --- 메인으로 이동하는 함수 ---
function goToMain() {
    if (isTransitioning) return;
    isTransitioning = true;
    console.log('goToMain 실행: 화면 및 음악 페이드 아웃');

    // 1. 화면 페이드 아웃
    splashScreen.style.opacity = '0';
    splashScreen.style.transition = 'opacity 1s ease-out';

    // 2. 음악 페이드 아웃 (1초)
    let currentVolume = audio.volume;
    const fadeOutInterval = setInterval(() => {
        if (currentVolume > 0.05) {
            currentVolume -= 0.05;
            audio.volume = Math.max(0, currentVolume);
        } else {
            clearInterval(fadeOutInterval);
            audio.pause();
            audio.currentTime = 0;
        }
    }, 50);

    // 3. 1초 뒤 화면 숨김
    setTimeout(() => {
        splashScreen.style.display = 'none';
        console.log('메인 콘텐츠 로드!');
    }, 1000);
}

// --- 사용자 상호작용 처리 ---
function handleInteraction() {
    if (isTransitioning) return;

    if (!isUnmuted) {
        // 첫 번째 상호작용: 음소거 해제 및 재생
        audio.muted = false;
        audio.volume = 0.7; // 볼륨 재설정
        
        // 재생 시도
        audio.play()
            .then(() => {
                console.log('음악 재생 시작!');
                isUnmuted = true;
            })
            .catch(e => {
                console.error('재생 실패:', e);
            });
    } else {
        // 두 번째 상호작용: 메인으로 이동
        goToMain();
    }
}

// 이벤트 리스너
document.addEventListener('keydown', handleInteraction);
document.addEventListener('click', handleInteraction);

// 터치 이벤트 추가 (모바일 지원)
document.addEventListener('touchstart', handleInteraction); 
```

혹시 모르니 파일 위치 
```
📁 Webgame/
   |
   ├── 📄 index.html
   ├── 📄 style.css
   ├── 📄 script.js
   ├── 🖼️ intro_image.png
   └── 🎵 intro_music.mp3
```

--------------------------------------------------

## 파일 위치 바꾸기(파일이 더 추가 될 때 깔끔하게 구분하기 위해)


```
📁 Webgame/
   ├── 📄 index.html
   └── 📁 assets/
        ├── 📁 css/
        │   └── 📄 style.css
        ├── 📁 js/
        │   └── 📄 script.js
        ├── 📁 images/
        │   └── 🖼️ intro_image.png , ...
        └── 📁 audio/
            └── 🎵 intro_music.mp3 , ...
```

그에 따른 코드 수정  

index.html

```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROJECT: MECH</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <div class="splash-screen">
        <div class="splash-content">
            <h1>PROJECT: DESTROYER</h1>
        </div>
    </div>

    <audio id="intro-music" src="assets/audio/intro_music.mp3" loop muted autoplay></audio>

    <script src="assets/js/script.js"></script>
</body>
</html>
```

style.css 

```
/* style.css */

/* 기본 여백 제거 및 전체 높이 설정 */
body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.splash-screen {
    /* 경로 수정!
      style.css는 assets/css/ 안에 있으므로, 
      상위 폴더(..)로 나간 뒤 images/ 폴더로 진입해야 합니다.
    */
    background-image: url('../images/intro_image.png');

    height: 100vh; /* 화면 전체 높이 */

    /* 이미지가 화면 중앙에 오도록 설정 */
    background-position: center;
    background-repeat: no-repeat;

    /* 이미지가 비율을 유지하며 화면을 꽉 채우도록 설정 */
    background-size: cover; 

    /* 콘텐츠(텍스트)를 화면 정중앙에 배치 */
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.splash-content {
    /* 텍스트 색상을 흰색으로 설정 */
    color: white;
}

/* 깜박임 애니메이션 정의 */
@keyframes blink {
    0% { opacity: 1; } /* 시작: 완전히 보임 */
    50% { opacity: 0; } /* 중간: 완전히 투명 */
    100% { opacity: 1; } /* 끝: 다시 완전히 보임 */
}

.splash-content h1 {
    font-size: 3.5rem; /* 제목 글자 크기 */
    margin-bottom: 20px;
    
    /* 어두운 배경에서도 글자가 잘 보이도록 그림자 추가 */
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9);
    
    /* 애니메이션 적용: blink 애니메이션을 1.5초 간격으로 무한 반복 */
    animation: blink 1.5s infinite; 
}
```

script.js
```
// script.js

const splashScreen = document.querySelector('.splash-screen');
const audio = document.getElementById('intro-music');
let isTransitioning = false;
let isUnmuted = false;

// 초기 볼륨 설정
audio.volume = 0.7; // 70% 볼륨으로 시작

// 오디오 파일 로드 확인
audio.addEventListener('loadeddata', () => {
    console.log('오디오 파일 로드 완료');
});

audio.addEventListener('error', (e) => {
    console.error('오디오 로드 실패:', e);
    // 경로 수정 (오류 메시지)
    console.error('파일 경로를 확인하세요: assets/audio/intro_music.mp3');
});

// 자동재생 시도 (음소거 상태로)
audio.play().catch(e => {
    console.log("자동재생 대기 중 (사용자 상호작용 필요):", e.message);
});

// --- 메인으로 이동하는 함수 ---
function goToMain() {
    if (isTransitioning) return;
    isTransitioning = true;
    console.log('goToMain 실행: 화면 및 음악 페이드 아웃');

    // 1. 화면 페이드 아웃
    splashScreen.style.opacity = '0';
    splashScreen.style.transition = 'opacity 1s ease-out';

    // 2. 음악 페이드 아웃 (1초)
    let currentVolume = audio.volume;
    const fadeOutInterval = setInterval(() => {
        if (currentVolume > 0.05) {
            currentVolume -= 0.05;
            audio.volume = Math.max(0, currentVolume);
        } else {
            clearInterval(fadeOutInterval);
            audio.pause();
            audio.currentTime = 0;
        }
    }, 50);

    // 3. 1초 뒤 화면 숨김
    setTimeout(() => {
        splashScreen.style.display = 'none';
        console.log('메인 콘텐츠 로드!');
    }, 1000);
}

// --- 사용자 상호작용 처리 ---
function handleInteraction() {
    if (isTransitioning) return;

    if (!isUnmuted) {
        // 첫 번째 상호작용: 음소거 해제 및 재생
        audio.muted = false;
        audio.volume = 0.7; // 볼륨 재설정
        
        // 재생 시도
        audio.play()
            .then(() => {
                console.log('음악 재생 시작!');
                isUnmuted = true;
            })
            .catch(e => {
                console.error('재생 실패:', e);
            });
    } else {
        // 두 번째 상호작용: 메인으로 이동
        goToMain();
    }
}

// 이벤트 리스너
document.addEventListener('keydown', handleInteraction);
document.addEventListener('click', handleInteraction);

// 터치 이벤트 추가 (모바일 지원)
document.addEventListener('touchstart', handleInteraction);
```
-------------------------------------------------------

## intex.html 파일을 intro.html로 변경과 main.html 추가 

```
📁 Webgame/
    ├── 📄 intro.html   (이전 index.html)
    ├── 📄 main.html    (새로 추가)
    └── 📁 assets/
        ├── 📁 css/
        │   └── 📄 style.css (main.html 스타일 추가)
        ├── 📁 js/
        │   └── 📄 script.js (페이지 이동 로직 수정)
        ├── 📁 images/
        │   └── 🖼️ intro_image.png
        └── 📁 audio/
            └── 🎵 intro_music.mp3
```

intro.html
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROJECT: MECH</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <div class="splash-screen">
        <div class="splash-content">
            <h1>PROJECT: DESTROYER</h1>
        </div>
    </div>

    <audio id="intro-music" src="assets/audio/intro_music.mp3" loop muted autoplay></audio>

    <script src="assets/js/script.js"></script>
</body>
</html>
```

main.html 
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAIN GAME - PROJECT: MECH</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <div class="main-content">
        <h1>메인 게임 화면</h1>
        <p>게임 콘텐츠가 여기에 표시됩니다.</p>
        
        </div>

    </body>
</html>
```

style.css
```
/* style.css */

body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.splash-screen {
    background-image: url('../images/intro_image.png');
    height: 100vh;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover; 
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.splash-content {
    color: white;
}
@keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
}
.splash-content h1 {
    font-size: 3.5rem;
    margin-bottom: 20px;
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9);
    animation: blink 1.5s infinite; 
}

.main-content {
    /* main.html의 콘텐츠를 중앙에 배치 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh; /* 화면 전체 높이 */

    /* 스플래시와 다른 배경/글자색 */
    background-color: #222; /* 어두운 배경 */
    color: #eee; /* 밝은 글씨 */
    text-align: center;
}

.main-content h1 {
    /* 스플래시 h1의 애니메이션/그림자 효과를 제거 */
    font-size: 2.5rem;
    text-shadow: none;
    animation: none; 
}
```

script.js
```
// script.js 

const splashScreen = document.querySelector('.splash-screen');
const audio = document.getElementById('intro-music');
let isTransitioning = false;
let isUnmuted = false;

audio.volume = 0.7;

audio.addEventListener('loadeddata', () => {
    console.log('오디오 파일 로드 완료');
});
audio.addEventListener('error', (e) => {
    console.error('오디오 로드 실패:', e);
    console.error('파일 경로를 확인하세요: assets/audio/intro_music.mp3');
});
audio.play().catch(e => {
    console.log("자동재생 대기 중 (사용자 상호작용 필요):", e.message);
});


function goToMain() {
    if (isTransitioning) return;
    isTransitioning = true;
    console.log('goToMain 실행: 화면 및 음악 페이드 아웃 후 페이지 이동');

    // 1. 화면 페이드 아웃
    splashScreen.style.opacity = '0';
    splashScreen.style.transition = 'opacity 1s ease-out';

    // 2. 음악 페이드 아웃 (1초)
    let currentVolume = audio.volume;
    const fadeOutInterval = setInterval(() => {
        if (currentVolume > 0.05) {
            currentVolume -= 0.05;
            audio.volume = Math.max(0, currentVolume);
        } else {
            clearInterval(fadeOutInterval);
            audio.pause();
            audio.currentTime = 0;
        }
    }, 50);

    setTimeout(() => {
        window.location.href = 'main.html'; 
    }, 1000); // 1초(1000ms)는 페이드 아웃 시간과 동일하게 설정
}

function handleInteraction() {
    if (isTransitioning) return;

    if (!isUnmuted) {
        // 첫 번째 상호작용: 음소거 해제 및 재생
        audio.muted = false;
        audio.volume = 0.7;
        
        audio.play()
            .then(() => {
                console.log('음악 재생 시작!');
                isUnmuted = true;
            })
            .catch(e => {
                console.error('재생 실패:', e);
            });
    } else {
        // 두 번째 상호작용: 메인으로 이동
        goToMain();
    }
}

// 이벤트 리스너 
document.addEventListener('keydown', handleInteraction);
document.addEventListener('click', handleInteraction);
document.addEventListener('touchstart', handleInteraction);
```

--------------------------------------------------------------------------

## 인트로 화면 살짝 바꾸고 메인 화면에 설정 버튼 생성 

```
📁 Webgame/
    ├── 📄 intro.html
    ├── 📄 main.html
    └── 📁 assets/
        ├── 📁 css/
        │   └── 📄 style.css
        ├── 📁 js/
        │   ├── 📄 script.js      (인트로 화면용)
        │   └── 📄 main_game.js   (메인 화면 설정창용)
        ├── 📁 images/
        │   ├── 🖼️ intro_image.png
        │   └── 🖼️ main.jpg
        └── 📁 audio/
            ├── 🎵 intro_music.mp3
            └── 🎵 main_music.mp3
```

<img width="1919" height="1006" alt="image" src="https://github.com/user-attachments/assets/413e61fa-3520-42a6-8282-81981d970b26" />

설정을 누르면 

<img width="1919" height="1009" alt="image" src="https://github.com/user-attachments/assets/04778caf-6636-46c2-abd6-6550c7d9d473" />


main_game.js 
```
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
audio.volume = volumeSlider.value / 100;

// 슬라이더를 '움직일 때마다'(input) 볼륨 변경
volumeSlider.addEventListener('input', (event) => {
    const newVolume = event.target.value / 100;
    audio.volume = newVolume;
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
```

style.css 
```
/* style.css */

body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.splash-screen {
    background-image: url('../images/intro_image.png');
    height: 100vh;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover; 
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.splash-content {
    color: white;
}
@keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
}
.splash-content h1 {
    font-size: 3.5rem;
    margin-bottom: 20px;
    
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9);
    
}

.splash-content p {
    font-size: 1.75rem; 
    margin-top: 20px; 
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
    
    animation: blink 1.5s infinite;
}

.main-content {
    /* 메인 콘텐츠를 중앙에 배치 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh; /* 화면 전체 높이 */
    text-align: center;

    /* ▼▼▼ 배경 이미지 추가 ▼▼▼ */
    /* style.css는 assets/css/ 안에 있으므로, ../images/로 이동 */
    background-image: url('../images/main.jpg');
    background-position: center;      /* 이미지 중앙 정렬 */
    background-repeat: no-repeat;   /* 이미지 반복 안 함 */
    background-size: cover;         /* 화면에 꽉 차게 */


    /* ▼▼▼ 배경 이미지가 밝아도 글씨가 잘 보이도록 수정 ▼▼▼ */
    color: white; /* 글자색을 흰색으로 */
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8); /* 그림자 추가 */
}

.main-content h1 {
    /* 스플래시 h1의 애니메이션/그림자 효과를 제거 */
    font-size: 2.5rem;
    text-shadow: none; /* .main-content의 text-shadow를 사용 */
    animation: none; 
}

/* 톱니바퀴 아이콘 */
.settings-cog {
    position: absolute; /* .main-content와 겹치도록 */
    top: 20px;
    right: 20px;
    font-size: 2.5rem; /* 아이콘 크기 */
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    cursor: pointer; /* 클릭 가능 표시 */
    z-index: 100; /* 다른 요소보다 위에 표시 */
    transition: transform 0.3s ease;
}

.settings-cog:hover {
    transform: rotate(90deg); /* 마우스 올리면 회전 */
}

/* 설정 모달 배경 (화면 전체 덮기) */
.settings-modal {
    display: none; /* ▼▼▼ 평소에는 숨김 ▼▼▼ */
    position: fixed; /* 화면에 고정 */
    z-index: 1000; /* 가장 위에 표시 */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7); /* 반투명 검은색 배경 */

    /* 자식 요소를 중앙 정렬 (flex 사용) */
    justify-content: center;
    align-items: center;
}

/* ▼▼▼ JS로 이 클래스를 추가하면 모달이 보임 ▼▼▼ */
.settings-modal.show {
    display: flex; 
}

/* 설정창 흰색 박스 */
.settings-content {
    background-color: #fefefe;
    color: #333;
    margin: auto;
    padding: 20px 30px;
    border: 1px solid #888;
    width: 80%;
    max-width: 400px; /* 최대 넓이 */
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    position: relative;
}

/* 닫기 버튼 (X) */
.close-btn {
    color: #aaa;
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close-btn:hover {
    color: #000;
}

.settings-content h2 {
    text-align: center;
    margin-top: 0;
}

/* 각 설정 그룹 (소리, 조작) */
.setting-group {
    margin-bottom: 25px;
}

.setting-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
}

/* 볼륨 슬라이더 */
#volume-slider {
    width: 100%;
    cursor: pointer;
}

/* 조작 방식 버튼 그룹 */
.control-buttons {
    display: flex;
    justify-content: space-between; /* 버튼들을 균등하게 배치 */
}

.control-btn {
    padding: 10px 15px;
    border: 2px solid #ccc;
    background-color: #f0f0f0;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    flex-grow: 1; /* 버튼들이 공간을 나눠 가짐 */
    margin: 0 5px;
}

/* 선택된 버튼 스타일 */
.control-btn.active {
    background-color: #007bff; /* 파란색 */
    color: white;
    border-color: #007bff;
}
```

main.html
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAIN GAME - PROJECT: MECH</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <div class="settings-cog" id="settings-open-btn">
        ⚙️
    </div>

    <div class="main-content">
        <h1>메인 게임 화면</h1>
        <p>게임 콘텐츠가 여기에 표시됩니다.</p>
    </div>

    <div class="settings-modal" id="settings-modal">
        <div class="settings-content">
            <span class="close-btn" id="settings-close-btn">&times;</span>
            <h2>설정</h2>

            <div class="setting-group">
                <label for="volume-slider">배경 음악</label>
                <input type="range" id="volume-slider" min="0" max="100" value="70">
            </div>

            <div class="setting-group">
                <label>조작 방식</label>
                <div class="control-buttons">
                    <button class="control-btn active" data-control="wasd">WASD</button>
                    <button class="control-btn" data-control="arrows">방향키</button>
                    <button class="control-btn" data-control="mouse">마우스</button>
                </div>
            </div>
        </div>
    </div>


    <audio id="main-music" src="assets/audio/main_music.mp3" autoplay loop></audio>

    <script src="assets/js/main_game.js"></script>

</body>
</html>
```

------------------------------------------------

## 메인 화면 

```
📁 Webgame/
    ├── 📄 intro.html
    ├── 📄 main.html
    ├── 📄 select_stage.html  (✨ 새로 추가)
    └── 📁 assets/
        ├── 📁 css/
        │   └── 📄 style.css
        ├── 📁 js/
        │   ├── 📄 script.js
        │   └── 📄 main_game.js
        ├── 📁 images/
        │   ├── 🖼️ intro_image.png
        │   └── 🖼️ main.jpg
        └── 📁 audio/
            ├── 🎵 intro_music.mp3
            └── 🎵 main_music.mp3
```

main.html
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAIN GAME - PROJECT: MECH</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <div class="settings-cog" id="settings-open-btn">
        ⚙️
    </div>

    <div class="main-content">
        
        <div class="main-menu-buttons">
            <a href="select_stage.html" class="menu-btn">
                전장 선택
            </a>
            
            <a href="hangar.html" class="menu-btn">
                격납고
            </a>
        </div>
        
    </div>

    <div class="settings-modal" id="settings-modal">
        </div>

    <audio id="main-music" src="assets/audio/main_music.mp3" autoplay loop></audio>

    <script src="assets/js/main_game.js"></script>

</body>
</html>
```

select_stage.html 
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>STAGE SELECT - PROJECT: MECH</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <div class="main-content">

        <div class="stage-select-options">
            <h2>전장 선택</h2>
            
            <a href="game_easy.html" class="stage-btn easy">
                아침 <span>(Easy Mode)</span>
            </a>
            
            <a href="game_hard.html" class="stage-btn hard">
                밤 <span>(Hard Mode)</span>
            </a>
            
            <a href="main.html" class="back-btn">
                &laquo; 뒤로가기
            </a>
        </div>

    </div>
    
</body>
</html>
```

style.css
```
/* style.css */

body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.splash-screen {
    background-image: url('../images/intro_image.png');
    height: 100vh;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover; 
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.splash-content {
    color: white;
}
@keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
}
.splash-content h1 {
    font-size: 3.5rem;
    margin-bottom: 20px;
    
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9);
    
}

.splash-content p {
    font-size: 1.75rem; 
    margin-top: 20px; 
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
    
    animation: blink 1.5s infinite;
}

.main-content {
    /* 메인 콘텐츠를 중앙에 배치 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh; /* 화면 전체 높이 */
    text-align: center;

    /* ▼▼▼ 배경 이미지 추가 ▼▼▼ */
    /* style.css는 assets/css/ 안에 있으므로, ../images/로 이동 */
    background-image: url('../images/main.jpg');
    background-position: center;      /* 이미지 중앙 정렬 */
    background-repeat: no-repeat;   /* 이미지 반복 안 함 */
    background-size: cover;         /* 화면에 꽉 차게 */


    /* ▼▼▼ 배경 이미지가 밝아도 글씨가 잘 보이도록 수정 ▼▼▼ */
    color: white; /* 글자색을 흰색으로 */
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8); /* 그림자 추가 */
}

.main-content h1 {
    /* 스플래시 h1의 애니메이션/그림자 효과를 제거 */
    font-size: 2.5rem;
    text-shadow: none; /* .main-content의 text-shadow를 사용 */
    animation: none; 
}

/* 톱니바퀴 아이콘 */
.settings-cog {
    position: absolute; /* .main-content와 겹치도록 */
    top: 20px;
    right: 20px;
    font-size: 2.5rem; /* 아이콘 크기 */
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    cursor: pointer; /* 클릭 가능 표시 */
    z-index: 100; /* 다른 요소보다 위에 표시 */
    transition: transform 0.3s ease;
}

.settings-cog:hover {
    transform: rotate(90deg); /* 마우스 올리면 회전 */
}

/* 설정 모달 배경 (화면 전체 덮기) */
.settings-modal {
    display: none; /* ▼▼▼ 평소에는 숨김 ▼▼▼ */
    position: fixed; /* 화면에 고정 */
    z-index: 1000; /* 가장 위에 표시 */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7); /* 반투명 검은색 배경 */

    /* 자식 요소를 중앙 정렬 (flex 사용) */
    justify-content: center;
    align-items: center;
}

/* ▼▼▼ JS로 이 클래스를 추가하면 모달이 보임 ▼▼▼ */
.settings-modal.show {
    display: flex; 
}

/* 설정창 흰색 박스 */
.settings-content {
    background-color: #fefefe;
    color: #333;
    margin: auto;
    padding: 20px 30px;
    border: 1px solid #888;
    width: 80%;
    max-width: 400px; /* 최대 넓이 */
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    position: relative;
}

/* 닫기 버튼 (X) */
.close-btn {
    color: #aaa;
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close-btn:hover {
    color: #000;
}

.settings-content h2 {
    text-align: center;
    margin-top: 0;
}

/* 각 설정 그룹 (소리, 조작) */
.setting-group {
    margin-bottom: 25px;
}

.setting-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
}

/* 볼륨 슬라이더 */
#volume-slider {
    width: 100%;
    cursor: pointer;
}

/* 조작 방식 버튼 그룹 */
.control-buttons {
    display: flex;
    justify-content: space-between; /* 버튼들을 균등하게 배치 */
}

.control-btn {
    padding: 10px 15px;
    border: 2px solid #ccc;
    background-color: #f0f0f0;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    flex-grow: 1; /* 버튼들이 공간을 나눠 가짐 */
    margin: 0 5px;
}

/* 선택된 버튼 스타일 */
.control-btn.active {
    background-color: #007bff; /* 파란색 */
    color: white;
    border-color: #007bff;
}

.main-menu-buttons {
    display: flex;
    flex-direction: column; /* 버튼을 세로로 나열 */
    gap: 20px; /* 버튼 사이 간격 */
    width: 300px; /* 버튼 너비 고정 */
}

.menu-btn {
    display: block;
    padding: 25px 20px;
    font-size: 2rem; /* 글씨 크기 */
    font-weight: bold;
    color: white;
    background-color: rgba(0, 0, 0, 0.6); /* 반투명 검은 배경 */
    border: 3px solid white;
    border-radius: 10px;
    text-decoration: none; /* 밑줄 제거 */
    text-align: center;
    transition: all 0.3s ease;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.menu-btn:hover {
    background-color: rgba(255, 255, 255, 0.9); /* 흰색 배경 */
    color: #333; /* 어두운 글씨 */
    border-color: #333;
    transform: scale(1.05); /* 살짝 커짐 */
}

.stage-select-options {
    width: 90%;
    max-width: 500px;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.7); /* 반투명 검은 배경 */
    border-radius: 10px;
    border: 2px solid #ddd;
    display: flex;
    flex-direction: column;
    gap: 15px; /* 요소 사이 간격 */
}

.stage-select-options h2 {
    font-size: 2.5rem;
    color: white;
    text-align: center;
    margin: 0 0 15px 0;
    text-shadow: 2px 2px 4px #000;
}

.stage-btn {
    display: block;
    padding: 20px;
    font-size: 1.8rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    text-align: center;
    transition: transform 0.2s ease;
}

.stage-btn span {
    display: block; /* 줄바꿈 */
    font-size: 1rem;
    font-weight: normal;
    opacity: 0.8;
}

.stage-btn:hover {
    transform: scale(1.03);
}

/* 이지/하드 모드 색상 구분 */
.stage-btn.easy {
    background-color: #4a90e2; /* 파란색 계열 */
    border: 2px solid #8ec5fc;
}
.stage-btn.hard {
    background-color: #d0021b; /* 붉은색 계열 */
    border: 2px solid #ff788a;
}

/* 뒤로가기 버튼 */
.back-btn {
    margin-top: 10px;
    font-size: 1rem;
    color: #ddd;
    text-decoration: none;
    text-align: center;
    transition: color 0.2s;
}

.back-btn:hover {
    color: white;
    text-decoration: underline;
}
```

<img width="1919" height="1008" alt="image" src="https://github.com/user-attachments/assets/8bcfc76a-e181-48fc-bf4e-cff2e2673f67" />

<img width="1919" height="1006" alt="image" src="https://github.com/user-attachments/assets/adc40446-03d0-4aae-a1e6-210a34171f88" />

------------------------------------------------

## style.css 분리(너무 길어짐) 

style.css 코드가 intro.html, main.html, select_stage.html에 필요한 모든 스타일을 넣어서 너무 길어짐 


- base.css: body, html 등 모든 페이지에 공통으로 쓰이는 기본 스타일

- intro.css: intro.html 전용 스타일 (스플래시 화면)

- main_layout.css: main.html과 select_stage.html이 공유하는 배경 (main.jpg) 스타일

- main.css: main.html 전용 스타일 (설정창, 메인 메뉴 버튼)

- stage.css: select_stage.html 전용 스타일 (전장 선택 버튼)

base.css 
```
/* base.css */
/* 모든 페이지에 공통으로 적용되는 기본 스타일 */
body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

```

intro.css
```
/* intro.css */
/* intro.html 전용 스타일 */

.splash-screen {
    background-image: url('../images/intro_image.png');
    height: 100vh;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover; 
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.splash-content {
    color: white;
}
@keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
}
.splash-content h1 {
    font-size: 3.5rem;
    margin-bottom: 20px;
    text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9);
}

.splash-content p {
    font-size: 1.75rem; 
    margin-top: 20px; 
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
    animation: blink 1.5s infinite;
}

```

main_layout.css
```
/* main_layout.css */
/* main.html, select_stage.html 등 메인 화면 레이아웃을 공유하는 스타일 */

.main-content {
    /* 메인 콘텐츠를 중앙에 배치 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh; /* 화면 전체 높이 */
    text-align: center;

    /* ▼▼▼ 배경 이미지 추가 ▼▼▼ */
    background-image: url('../images/main.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    /* ▼▼▼ 배경 이미지가 밝아도 글씨가 잘 보이도록 수정 ▼▼▼ */
    color: white; /* 글자색을 흰색으로 */
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8); /* 그림자 추가 */
}

```

main.css 
```
/* main.css */
/* main.html 전용 스타일 (설정창, 메인 메뉴) */

.main-content h1 {
    /* 스플래시 h1의 애니메이션/그림자 효과를 제거 */
    font-size: 2.5rem;
    text-shadow: none; /* .main-content의 text-shadow를 사용 */
    animation: none; 
}

/* 톱니바퀴 아이콘 */
.settings-cog {
    position: absolute; /* .main-content와 겹치도록 */
    top: 20px;
    right: 20px;
    font-size: 2.5rem; /* 아이콘 크기 */
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    cursor: pointer; /* 클릭 가능 표시 */
    z-index: 100; /* 다른 요소보다 위에 표시 */
    transition: transform 0.3s ease;
}

.settings-cog:hover {
    transform: rotate(90deg); /* 마우스 올리면 회전 */
}

/* 설정 모달 배경 (화면 전체 덮기) */
.settings-modal {
    display: none; /* ▼▼▼ 평소에는 숨김 ▼▼▼ */
    position: fixed; /* 화면에 고정 */
    z-index: 1000; /* 가장 위에 표시 */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7); /* 반투명 검은색 배경 */
    justify-content: center;
    align-items: center;
}

.settings-modal.show {
    display: flex; 
}

/* 설정창 흰색 박스 */
.settings-content {
    background-color: #fefefe;
    color: #333;
    margin: auto;
    padding: 20px 30px;
    border: 1px solid #888;
    width: 80%;
    max-width: 400px; /* 최대 넓이 */
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    position: relative;
}

/* 닫기 버튼 (X) */
.close-btn {
    color: #aaa;
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close-btn:hover {
    color: #000;
}

.settings-content h2 {
    text-align: center;
    margin-top: 0;
}

/* 각 설정 그룹 (소리, 조작) */
.setting-group {
    margin-bottom: 25px;
}

.setting-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
}

/* 볼륨 슬라이더 */
#volume-slider {
    width: 100%;
    cursor: pointer;
}

/* 조작 방식 버튼 그룹 */
.control-buttons {
    display: flex;
    justify-content: space-between;
}

.control-btn {
    padding: 10px 15px;
    border: 2px solid #ccc;
    background-color: #f0f0f0;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    flex-grow: 1; /* 버튼들이 공간을 나눠 가짐 */
    margin: 0 5px;
}

/* 선택된 버튼 스타일 */
.control-btn.active {
    background-color: #007bff; /* 파란색 */
    color: white;
    border-color: #007bff;
}

/* 메인 메뉴 버튼 */
.main-menu-buttons {
    display: flex;
    flex-direction: column; /* 버튼을 세로로 나열 */
    gap: 20px; /* 버튼 사이 간격 */
    width: 300px; /* 버튼 너비 고정 */
}

.menu-btn {
    display: block;
    padding: 25px 20px;
    font-size: 2rem; /* 글씨 크기 */
    font-weight: bold;
    color: white;
    background-color: rgba(0, 0, 0, 0.6); /* 반투명 검은 배경 */
    border: 3px solid white;
    border-radius: 10px;
    text-decoration: none; /* 밑줄 제거 */
    text-align: center;
    transition: all 0.3s ease;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.menu-btn:hover {
    background-color: rgba(255, 255, 255, 0.9); /* 흰색 배경 */
    color: #333; /* 어두운 글씨 */
    border-color: #333;
    transform: scale(1.05); /* 살짝 커짐 */
}

```

stage.css
```
/* stage.css */
/* select_stage.html 전용 스타일 */

.stage-select-options {
    width: 90%;
    max-width: 500px;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.7); /* 반투명 검은 배경 */
    border-radius: 10px;
    border: 2px solid #ddd;
    display: flex;
    flex-direction: column;
    gap: 15px; /* 요소 사이 간격 */
}

.stage-select-options h2 {
    font-size: 2.5rem;
    color: white;
    text-align: center;
    margin: 0 0 15px 0;
    text-shadow: 2px 2px 4px #000;
}

.stage-btn {
    display: block;
    padding: 20px;
    font-size: 1.8rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    text-align: center;
    transition: transform 0.2s ease;
}

.stage-btn span {
    display: block; /* 줄바꿈 */
    font-size: 1rem;
    font-weight: normal;
    opacity: 0.8;
}

.stage-btn:hover {
    transform: scale(1.03);
}

/* 이지/하드 모드 색상 구분 */
.stage-btn.easy {
    background-color: #4a90e2; /* 파란색 계열 */
    border: 2px solid #8ec5fc;
}
.stage-btn.hard {
    background-color: #d0021b; /* 붉은색 계열 */
    border: 2px solid #ff788a;
}

/* 뒤로가기 버튼 */
.back-btn {
    margin-top: 10px;
    font-size: 1rem;
    color: #ddd;
    text-decoration: none;
    text-align: center;
    transition: color 0.2s;
}

.back-btn:hover {
    color: white;
    text-decoration: underline;
}

```

intro.html 
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROJECT: MECH</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/intro.css">
</head>
<body>

    <div class="splash-screen">
        <div class="splash-content">
            <h1>PROJECT: DESTROYER</h1>
            <p>Touch To Start</p>
        </div>
    </div>

    <audio id="intro-music" src="assets/audio/intro_music.mp3" loop muted autoplay></audio>

    <script src="assets/js/script.js"></script>
    
</body>
</html>
```

main.html 
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAIN GAME - PROJECT: MECH</title>

    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/main_layout.css">
    <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

    <div class="settings-cog" id="settings-open-btn">
        ⚙️
    </div>

    <!-- 메인 콘텐츠 영역 -->
    <div class="main-content">
        
        <div class="main-menu-buttons">
            <a href="select_stage.html" class="menu-btn">
                전장 선택
            </a>
            <a href="hangar.html" class="menu-btn">
                격납고
            </a>
        </div>
        
    </div>

    <div class="settings-modal" id="settings-modal">
        <div class="settings-content">
            <span class="close-btn" id="settings-close-btn">&times;</span>
            <h2>설정</h2>

            <!-- 소리 조절 -->
            <div class="setting-group">
                <label for="volume-slider">배경 음악</label>
                <input type="range" id="volume-slider" min="0" max="100" value="70">
            </div>

            <!-- 조작 방식 선택 -->
            <div class="setting-group">
                <label>조작 방식</label>
                <div class="control-buttons">
                    <button class="control-btn active" data-control="wasd">WASD</button>
                    <button class="control-btn" data-control="arrows">방향키</button>
                    <button class="control-btn" data-control="mouse">마우스</button>
                </div>
            </div>
        </div>
    </div>


    <!-- 배경 음악 -->
    <audio id="main-music" src="assets/audio/main_music.mp3" autoplay loop></audio>

    <script src="assets/js/main_game.js"></script>

</body>
</html>
```

select_stage.html 
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>STAGE SELECT - PROJECT: MECH</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/main_layout.css">
    <link rel="stylesheet" href="assets/css/stage.css">
</head>
<body>

    <div class="main-content">

        <div class="stage-select-options">
            <h2>전장 선택</h2>
            
            <a href="game_easy.html" class="stage-btn easy">
                아침 <span>(Easy Mode)</span>
            </a>
            
            <a href="game_hard.html" class="stage-btn hard">
                밤 <span>(Hard Mode)</span>
            </a>
            
            <a href="main.html" class="back-btn">
                &laquo; 뒤로가기
            </a>
        </div>

    </div>
    
</body>
</html>
```
파일 위치
```
📁 Webgame/
    ├── 📄 intro.html
    ├── 📄 main.html
    ├── 📄 select_stage.html
    └── 📁 assets/
        ├── 📁 css/
        │   ├── 📄 base.css          (공통 스타일)
        │   ├── 📄 intro.css         (인트로 화면용)
        │   ├── 📄 main.css          (메인 화면용)
        │   ├── 📄 main_layout.css   (메인 배경/레이아웃)
        │   └── 📄 stage.css         (전장 선택용)
        ├── 📁 js/
        │   ├── 📄 script.js         (인트로 화면용)
        │   └── 📄 main_game.js      (메인 화면용)
        ├── 📁 images/
        │   ├── 🖼️ intro_image.png
        │   └── 🖼️ main.jpg
        └── 📁 audio/
            ├── 🎵 intro_music.mp3
            └── 🎵 main_music.mp3
```
------------------------------------------------------

## 스테이지 선택 만들기 

```
📁 Webgame/
    ├── 📄 intro.html
    ├── 📄 main.html
    ├── 📄 select_stage.html
    ├── 📄 stage_list_easy.html   (10개 스테이지)
    ├── 📄 stage_list_hard.html   (10개 스테이지)
    └── 📁 assets/
        ├── 📁 css/
        │   ├── 📄 base.css
        │   ├── 📄 intro.css
        │   ├── 📄 main.css
        │   ├── 📄 main_layout.css
        │   ├── 📄 stage.css
        │   └── 📄 stage_list.css    
        ├── 📁 js/
        │   ├── 📄 script.js
        │   ├── 📄 main_game.js
        │   ├── 📄 stage_list_easy.js
        │   └── 📄 stage_list_hard.js
        ├── 📁 images/
        │   ├── 🖼️ intro_image.png
        │   ├── 🖼️ main.jpg
        │   ├── 🖼️ moring.jpg
        │   └── 🖼️ night.jpg
        └── 📁 audio/
            ├── 🎵 intro_music.mp3
            └── 🎵 main_music.mp3
```















