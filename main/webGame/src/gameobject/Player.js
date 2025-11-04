export default class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5).setDisplaySize(40, 40);
    this.setCollideWorldBounds(true);
  }
}