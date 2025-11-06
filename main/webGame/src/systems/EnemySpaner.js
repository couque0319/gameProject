export default class EnemySpawner {
  constructor(scene, enemies, cfg) {
    this.scene = scene;
    this.enemies = enemies;
    this.cfg = cfg;

    this.timer = this.scene.time.addEvent({
      delay: cfg.spawnIntervalMs,
      callback: this.spawn,
      callbackScope: this,
      loop: true,
    });
  }

  spawn() {
    if (this.scene.gameOver) return;
    const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
    const vy = Phaser.Math.Between(this.cfg.minSpeed, this.cfg.maxSpeed);
    this.enemies.spawn(x, -50, vy, this.cfg.size);
  }
}