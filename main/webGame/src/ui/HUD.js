export default class HUD {
  constructor(scene) {
    this.scene = scene;
    this.scoreText = scene.add.text(16, 16, 'Score: 0', { fontSize: '24px', color: '#ffffff' });
  }

  updateScore(score) {
    this.scoreText.setText(`Score: ${score}`);
  }

  showGameOver() {
    const { width, height } = this.scene.scale;
    this.scene.add.text(width / 2, height / 2, 'GAME OVER', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);
    this.scene.add.text(width / 2, height / 2 + 60, 'Press F5 to Restart', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
  }
}