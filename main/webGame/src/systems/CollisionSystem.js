export default class CollisionSystem {
  constructor(scene, player, bullets, enemies, { onBulletHitEnemy, onEnemyHitPlayer }) {
    this.scene = scene;

    scene.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
      onBulletHitEnemy(bullet, enemy);
    });

    scene.physics.add.overlap(player, enemies, (p, enemy) => {
      onEnemyHitPlayer(p, enemy);
    });
  }
}