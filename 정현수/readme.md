@@@ 이미지들 경로 다를 수 있음 확인 요청 @@@


항모호출 임시키 'B'


1. 수정부는 주석으로 "수정" 혹은 "ver2" 달아놓음 컨+F 로 검색해서 확인

2. "수정" 은 처음 항모 등장씬 제작할때 만진 코드들 //-------수정------// 이후 하단 //-------//까지 전체가 범위

-------------수정부분1--------------------

let gameOver = false; 아래 

변수선언 + 함수수정&생성{
function spawnEnemy()
function setBattle()
function startCarrierApproach()
function drawGuides()
function startCarrierDocking()
function lockToCenter()
function playEngineShutdown()

----------------수정부분2-------------------

 function update(time) {
            if (gameOver) return; 아래
            
if (docking.active)
if (Phaser.Input.Keyboard.JustDown(this.bKey))
if (sway.active)
if (battleOn && time > lastFired + 200) @<- 기존 무장 발사코드 수정함@
function updateCarrierDocking(scene, deltaMs) 

----------------수정부분3-------------------

그 외 

이미지 로드(function preload() 아래로)
player1_2
player1_1
player1_0
carrier1

라인 339 마우스 감지 & 플레이어 이동
this.input.on('pointermove', (pointer) => {

4. "ver2"는 이후 상점과 출격 제작할때 만들거나 수정한 코드들 범위가 아니라 각 함수 이름 옆에 주석으로 달아놓음

5. 항모 연출을 위해 무장발사 플레이어 이동을 제어하는 관련된 코드들도 일부 만짐
