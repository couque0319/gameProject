export default class BulletGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene, textureKey) {
    super(scene.physics.world, scene);
    this.createMultiple({
      key: textureKey,
      repeat: 99,
      setXY: { x: -100, y: -100 },
      active: false,
      visible: false,
    });

    this.children.iterate((b) => {
      b.setOrigin(0.5, 0.5).setDisplaySize(10, 20);
      b.body.setSize(10, 20);
      b.body.enable = false;
    });
  }

  fire(x, y, vy) {
    const bullet = this.getFirstDead(false);
    if (!bullet) return null;
    bullet.setActive(true).setVisible(true);
    bullet.body.enable = true;
    bullet.setPosition(x, y);
    bullet.setVelocity(0, vy);
    return bullet;
  }

  recycleOffscreen() {
    this.children.iterate((b) => {
      if (!b.active) return;
      if (b.y < -30) this.disable(b);
    });
  }

  disable(bullet) {
    bullet.setActive(false).setVisible(false);
    bullet.body.enable = false;
    bullet.setPosition(-100, -100);
    bullet.setVelocity(0, 0);
  }
}