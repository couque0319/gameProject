# 어디를 바꾸었나? 

  1. `game.html`의 스크립트 경로 오류: 앞서 언급했듯이, game.html에서 stage_defs.js와 stage_manager.js를
      불러오는 경로가 assets/js/stage/로 되어 있습니다. 실제 디렉토리 구조는 assets/js/stages/이므로, 이 부분을
      수정해야 합니다.

   2. `main_game.js`의 역할 변경: 기존의 main.html에서 사용되던 main_game.js는 설정 창, 소리 조절 등 메인 메뉴의
      상호작용을 처리하는 코드였습니다. 하지만 game.html에서는 Phaser 게임 로직의 일부로 포함되려고 하는 것
      같습니다. game.html에는 main_game.js가 사용하는 HTML 요소들(설정창, 버튼 등)이 없기 때문에, 이 스크립트는
      game.html에서 오류를 발생시킬 것입니다.

   3. 새로운 게임 로직의 부재: game.html은 Phaser 라이브러리와 여러 설정 파일(monsters.js, stage_defs.js 등)을
      불러오지만, 정작 Phaser 게임 인스턴스를 생성하고 실행하는 핵심 게임 로직 코드가 보이지 않습니다. 아마도
      game.js 파일에 해당 내용이 있을 것으로 추측되지만, 현재 game.html에는 game.js가 포함되어 있지 않습니다.

  이 문제들을 해결하기 위해 다음 두 가지를 제안합니다.

   1. `game.html` 수정:
       * 잘못된 스크립트 경로를 assets/js/stages/로 바로잡습니다.
       * Phaser 게임을 실행하는 데 필요할 것으로 보이는 game.js를 스크립트 목록에 추가합니다.
       * game.html 환경과 맞지 않는 main_game.js는 제거합니다.

   2. `game.js` 파일 내용 확인: game.js 파일이 어떤 역할을 하는지, 그리고 Phaser 게임을 어떻게 시작하는지 코드를
      확인해야 합니다.
