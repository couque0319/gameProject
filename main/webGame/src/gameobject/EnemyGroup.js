export default class EnemyGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene, textureKey) {
    super(scene.physics.world, scene);
    this.textureKey = textureKey;
  }

  spawn(x, y, vy, size = 30) {
    const enemy = this.getFirstDead(true, x, y, this.textureKey);
    enemy.setActive(true).setVisible(true);
    enemy.body.enable = true;
    enemy.setOrigin(0.5, 0.5).setDisplaySize(size, size);
    enemy.body.setSize(size, size);
    enemy.setVelocity(0, vy);
    return enemy;
  }

  recycleOffscreen(maxH) {
    this.children.iterate((e) => {
      if (!e.active) return;
      if (e.y > maxH + 50) this.disable(e);
    });
  }

  disable(enemy) {
    enemy.setActive(false).setVisible(false);
    enemy.body.enable = false;
    enemy.setPosition(-100, -100);
    enemy.setVelocity(0, 0);
  }
}