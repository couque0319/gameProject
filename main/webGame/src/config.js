export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;
export const COLORS = {
  bg: 0x000033,
  player: 0x00ff00,
  enemy: 0xff0000,
  bullet: 0xffffff,
};

export const SHOOT = {
  delayMs: 200, // 자동 발사 주기
  bulletSpeed: -400,
  poolSize: 100,
};

export const ENEMY = {
  spawnIntervalMs: 2000,
  minSpeed: 50,
  maxSpeed: 150,
  size: 30,
};