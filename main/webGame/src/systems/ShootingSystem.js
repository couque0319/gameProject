export default class ShootingSystem {
  constructor(scene, player, bullets, config) {
    this.scene = scene;
    this.player = player;
    this.bullets = bullets;
    this.delay = config.delayMs;
    this.speed = config.bulletSpeed;
    this.lastFired = 0;
  }

  update(time) {
    if (time < this.lastFired + this.delay) return;
    if (!this.player.active) return;
    this.bullets.fire(this.player.x, this.player.y - 20, this.speed);
    this.lastFired = time;
  }
}