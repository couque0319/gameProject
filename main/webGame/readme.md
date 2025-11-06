# 허접 드래곤 플라이트 (모듈 분리)

## 실행 방법
1. 위 구조 그대로 파일을 저장합니다.
2. 간단한 로컬 서버로 실행합니다. 예)
   - Python: `python -m http.server 5173`
   - Node: `npx serve .`
3. 브라우저에서 `http://localhost:5173` 접속.

## 리팩터링 포인트
- **Scene**: 라이프사이클과 전역 흐름 담당 (`MainScene`).
- **GameObjects/Groups**: Player, Bullet, Enemy의 생성/재사용 책임 분리.
- **Systems**: 발사, 스폰, 충돌은 각각 독립 로직으로 업데이트와 이벤트만 제공.
- **UI(HUD)**: 점수와 게임오버 표시를 한 곳에서 관리.
- **Config**: 상수와 튜닝 값을 한 곳에서 관리해 난이도 조절 용이.

## 확장 아이디어
- 웨이브/보스 추가: `EnemySpawner`에 난이도 스케일 파라미터(시간에 따라 interval 감소, 속도 증가).
- 피격/무적 처리: `Player`에 HP 속성 추가, `CollisionSystem`에서 HP 감소 → HUD에 체력 표시.
- 아이템: `ItemGroup` 추가 후 총알 속도/딜레이 버프.