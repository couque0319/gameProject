import { GAME_WIDTH, GAME_HEIGHT, COLORS, SHOOT, ENEMY } from '../config.js';
import Player from '../gameobjects/Player.js';
import BulletGroup from '../gameobjects/BulletGroup.js';
import EnemyGroup from '../gameobjects/EnemyGroup.js';
import ShootingSystem from '../systems/ShootingSystem.js';
import EnemySpawner from '../systems/EnemySpawner.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import HUD from '../ui/HUD.js';

export default class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }

  init() {
    this.gameOver = false;
    this.score = 0;
  }

  preload() {
    // 더미 텍스처(사각형) 키 등록: player/enemy/bullet
    this.createSolidTexture('playerTex', 32, 32, COLORS.player);
    this.createSolidTexture('enemyTex', 32, 32, COLORS.enemy);
    this.createSolidTexture('bulletTex', 10, 20, COLORS.bullet);
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);

    // GameObjects
    this.player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 50, 'playerTex');
    this.bullets = new BulletGroup(this, 'bulletTex');
    this.enemies = new EnemyGroup(this, 'enemyTex');

    // UI
    this.hud = new HUD(this);
    this.hud.updateScore(this.score);

    // 입력: 포인터로 X 이동
    this.input.on('pointermove', (p) => { if (!this.gameOver) this.player.x = p.x; });

    // Systems
    this.shootingSystem = new ShootingSystem(this, this.player, this.bullets, SHOOT);
    this.enemySpawner = new EnemySpawner(this, this.enemies, ENEMY);
    this.collisionSystem = new CollisionSystem(this, this.player, this.bullets, this.enemies, {
      onBulletHitEnemy: (bullet, enemy) => this.onBulletHitEnemy(bullet, enemy),
      onEnemyHitPlayer: (player, enemy) => this.onEnemyHitPlayer(player, enemy),
    });
  }

  update(time, delta) {
    if (this.gameOver) return;
    this.shootingSystem.update(time);
    this.bullets.recycleOffscreen();
    this.enemies.recycleOffscreen(GAME_HEIGHT);
  }

  // --- 콜백 로직 분리 ---
  onBulletHitEnemy(bullet, enemy) {
    bullet.disable();
    enemy.disable();
    this.addScore(10);
  }

  onEnemyHitPlayer(player, enemy) {
    if (this.gameOver) return;
    this.physics.pause();
    this.gameOver = true;
    player.setTint(COLORS.enemy);
    this.hud.showGameOver();
  }

  addScore(v) {
    this.score += v;
    this.hud.updateScore(this.score);
  }

  // 32x32 단색 텍스처 생성 헬퍼
  createSolidTexture(key, w, h, color) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}