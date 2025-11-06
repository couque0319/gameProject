// boss1.js
(function () {

    // 크기/속도 상수 (원하면 여기 숫자만 바꿔서 재조절)
    const BOSS_BULLET_H = 18;           // 보스(날개) 탄 표시 높이(px)              
    const MINION_DISPLAY_H = 68;        // 미니언 표시 높이(px)                      
    const MINION_BULLET_H = 22;         // 미니언 탄 표시 높이(px)                    
    const BOSS_TRIPLE_INTERVAL = 2000;  // 보스 3점사 주기(ms)                         

    // ====== 패턴3(필살기) 튜닝 상수 ======                                         // ver5
    const EYE_OFFSET_X = -5;            // 보스 "눈" 위치 보정 X(px)                  // ver5
    const EYE_OFFSET_Y = -150;          // 보스 "눈" 위치 보정 Y(px)                  // ver5
    const LASER_DISPLAY_H = 700;        // 레이저(보여줄) 길이                         // ver5
    const LASER_SCALE_X = 0.6;          // 레이저 가로 두께(1.0=원본, 0.3~0.7 권장)      // ver5
    const LASER_WARN_MS = 1000;         // 경고 점멸 시간                               // ver5
    const LASER_FIRE_MS = 6400;         // 실사격 총 지속                               // ver5
    const LASER_TICK_MS = 200;          // 데미지 틱 간격(0.2s)                         // ver5
    const LASER_DMG = 3;                // 틱당 피해                                     // ver5

    // 픽셀 "높이" 기준으로 스케일 맞추기 유틸
    function __scaleToHeight(scene, imageObj, targetH) {
        const tex = scene.textures.get(imageObj.texture.key);
        const texH = tex.getSourceImage().height;
        imageObj.setScale(targetH / texH);
    }

    const Boss1 = {
        active: false,
        hp: 0,
        hpMax: 0,
        _refs: {
            scene: null,
            sprite: null,
            hpGfx: null,
            nameText: null,
            bossBulletGroup: null,        // 보스(날개) 탄 그룹                         // ver4
            minionGroup: null,            // 미니언 그룹                                // ver4
            minionBullets: null,          // 미니언 탄 그룹                             // ver4
            bulletVsMinionCollider: null, // 플레이어 총알 vs 미니언                     // ver4
            timers: [],                   // 타이머 핸들 모음                           // ver4

            // ===== 패턴3 레퍼런스 =====                                            // ver5
            p3LoopTimer: null,            // 주기적 발동 타이머                         // ver5
            p3Active: false,              // 패턴3 동작 플래그                           // ver5
            laserSprite: null,            // 현재 표시중인 레이저 스프라이트             // ver5
            laserTick: null,              // 데미지 틱 타이머                            // ver5
            moveTween: null               // 레이저 사격 중 보스 이동 트윈               // ver5
        },

        // ==== 스폰 ====
        spawn(scene, opts = {}) {
            if (this.active) return;
            this.active = true;
            this._refs.scene = scene;

            this.hpMax = Number.isFinite(opts.hp) ? opts.hp : 350;
            this.hp = this.hpMax;

            // 그룹 준비(물리 이동만, 적 충돌판정은 미사용)
            this._refs.bossBulletGroup = scene.physics.add.group({ allowGravity: false });
            this._refs.minionGroup = scene.physics.add.group({ allowGravity: false });
            this._refs.minionBullets = scene.physics.add.group({ allowGravity: false });

            // 플레이어 총알 → 미니언 피격 처리
            const bulletsGroup = window.bullets;
            if (bulletsGroup) {
                this._refs.bulletVsMinionCollider = scene.physics.add.overlap(
                    bulletsGroup,
                    this._refs.minionGroup,
                    (bullet, minion) => {
                        if (!bullet.active || !minion.active) return;

                        // 총알 소모
                        bullet.setActive(false).setVisible(false);
                        if (bullet.body) bullet.body.enable = false;

                        // 미니언 HP 감소
                        const dmg = Number(window.weapon?.damage ?? 1);
                        minion.hp = Math.max(0, minion.hp - dmg);

                        // 플래시
                        scene.tweens.add({
                            targets: minion,
                            alpha: { from: 1, to: 0.35 },
                            yoyo: true,
                            repeat: 1,
                            duration: 80
                        });

                        // 파괴
                        if (minion.hp <= 0) {
                            minion.setActive(false).setVisible(false);
                            if (minion.body) minion.body.enable = false;
                            minion.destroy();
                        }
                    },
                    null,
                    scene
                );
            }

            // 보스 본체(위에서 내려오기)
            const cx = scene.game.config.width / 2;
            const boss = scene.physics.add.image(cx, -120, 'boss1')
                .setOrigin(0.5, 0.5)
                .setDepth(5)          // HUD 가림 방지
                .setScale(0.45);
            boss.setImmovable(true);
            if (boss.body) boss.body.setSize(boss.width * 0.9, boss.height * 0.9, true);
            this._refs.sprite = boss;

            // HP HUD (이름만 + 바)
            this._createHpHud(scene);

            // 내려오는 트윈 후 패턴 가동
            scene.tweens.add({
                targets: boss,
                y: 140,
                duration: 1500,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    this._startPattern1(scene);     // 양 날개 3점사(유도각 고정)         // ver4
                    this._startPattern2(scene);     // 미니언 소환 주기                    // ver4
                    this._initPattern3Loop(scene);  // 20초 쿨 필살기 주기적 발동 시작     // ver5
                }
            });
        },

        // ==== HP HUD ====
        _createHpHud(scene) {
            const cx = scene.game.config.width / 2;

            const name = scene.add.text(cx, 6, 'RedEYE', {
                fontSize: '18px',
                fontFamily: 'monospace',
                fontStyle: 'bold',
                color: '#ffe6ee',
                stroke: '#50121f',
                strokeThickness: 3
            }).setOrigin(0.5, 0).setDepth(521);
            this._refs.nameText = name;

            const g = scene.add.graphics().setDepth(520);
            this._refs.hpGfx = g;
            this._redrawHpHud();
        },

        _redrawHpHud() {
            const g = this._refs.hpGfx;
            const scene = this._refs.scene;
            if (!g || !scene) return;

            const cx = scene.game.config.width / 2;
            const BAR_W = 300;
            const BAR_H = 12;
            const R = 6;

            const nameY = this._refs.nameText ? (this._refs.nameText.y + this._refs.nameText.height + 4) : 22;
            const barY = nameY + 12;

            const ratio = Math.max(0, Math.min(1, this.hp / this.hpMax));

            g.clear();
            // 레일
            g.lineStyle(2, 0x5a0b1a, 1);
            g.fillStyle(0x29131a, 0.85);
            g.fillRoundedRect(cx - BAR_W / 2, barY, BAR_W, BAR_H, R);
            g.strokeRoundedRect(cx - BAR_W / 2, barY, BAR_W, BAR_H, R);

            // 채운 부분
            const filledW = Math.round(BAR_W * ratio);
            if (filledW > 0) {
                g.fillStyle(0xff3355, 1);
                g.fillRoundedRect(cx - BAR_W / 2, barY, filledW, BAR_H, R);
            }
        },

        takeDamage(amount = 0) {
            if (!this.active) return;
            const dmg = Math.max(0, Math.floor(amount));
            this.hp = Math.max(0, this.hp - dmg);
            this._redrawHpHud();
            if (this.hp <= 0) this._onDefeated();
        },

        setHP(newHP) {
            if (!this.active) return;
            this.hp = Math.max(0, Math.min(this.hpMax, Math.floor(newHP)));
            this._redrawHpHud();
        },

        _onDefeated() {
            this.despawn();
        },

        // ===== 패턴 1: 양 날개 3점사(2초마다, 플레이어 방향 각도로 발사) =====
        _startPattern1(scene) {
            const boss = this._refs.sprite;
            if (!boss) return;

            const bulletKey = 'bulletBoss2';

            const timer = scene.time.addEvent({
                delay: BOSS_TRIPLE_INTERVAL, // 2초마다
                loop: true,
                callback: () => {
                    if (!this.active || !this._refs.sprite) return;

                    const b = this._refs.sprite;
                    const wings = [
                        { offsetX: -b.displayWidth * 0.40, offsetY: b.displayHeight * -0.10 }, // 왼쪽 날개
                        { offsetX:  b.displayWidth * 0.40, offsetY: b.displayHeight * -0.10 }  // 오른쪽 날개
                    ];

                    // 양쪽 날개에서 직선 3연발(플레이어 각도 고정)
                    wings.forEach(({ offsetX, offsetY }) => {
                        const sx = b.x + offsetX;
                        const sy = b.y + offsetY;
                        this._fireLineTowardPlayer(scene, sx, sy, bulletKey, BOSS_BULLET_H, 520);
                    });
                }
            });
            this._refs.timers.push(timer);
            this._refs.pattern1Timer = timer; // ver5
        },

        // 일렬(한 방향) 사격 함수
        _fireLineTowardPlayer(scene, sx, sy, textureKey, targetH, speed) {
            const player = this._findPlayer(scene);
            const ang = player ? Phaser.Math.Angle.Between(sx, sy, player.x, player.y) : (-Math.PI / 2);

            // 3발을 일정 간격으로 시간차 발사
            for (let i = 0; i < 3; i++) {
                scene.time.delayedCall(i * 180, () => {
                    const b = this._refs.bossBulletGroup.create(sx, sy, textureKey)
                        .setDepth(10);
                    __scaleToHeight(scene, b, targetH);

                    if (b.body) {
                        b.body.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
                    }

                    // 수명 지나면 제거
                    scene.time.delayedCall(1500, () => {
                        if (!b.active) return;
                        b.destroy();
                    });
                });
            }
        },

        // ===== 패턴 2: 미니언 소환(8초 주기, 전멸 전 재사용x) =====
        _startPattern2(scene) {
            const t = scene.time.addEvent({
                delay: 8000,
                loop: true,
                callback: () => {
                    if (!this.active) return;
                    // 살아있는 미니언 있으면 스킵
                    if (this._refs.minionGroup.countActive(true) > 0) return;
                    this._spawnMinionPair(scene);
                }
            });
            this._refs.timers.push(t);
            this._refs.pattern2Timer = t; // ver5
        },

        _spawnMinionPair(scene) {
            const boss = this._refs.sprite;
            if (!boss) return;

            // (요청대로) 약간 아래(+25), 안쪽으로 모음(±15)
            const wingX = boss.displayWidth * 0.38 - 15;
            const wingY = boss.displayHeight * 0.05 + 25;

            const spots = [
                { x: boss.x - wingX, y: boss.y + wingY },
                { x: boss.x + wingX, y: boss.y + wingY }
            ];

            spots.forEach((p) => {
                const m = this._refs.minionGroup.create(p.x, p.y, 'boss1_2')
                    .setDepth(11);
                __scaleToHeight(scene, m, MINION_DISPLAY_H);
                m.setImmovable(true);
                if (m.body) m.body.setSize(m.displayWidth * 0.85, m.displayHeight * 0.85, true);
                m.hp = 50;

                // 제자리 포탑: 1.3초마다 직진탄(아래로)
                const shooter = scene.time.addEvent({
                    delay: 1300,
                    loop: true,
                    callback: () => {
                        if (!m.active) { shooter.remove(false); return; }
                        this._fireMinionBullet(scene, m.x, m.y);
                    }
                });
                this._refs.timers.push(shooter);
            });
        },

        _fireMinionBullet(scene, sx, sy) {
            const speed = 360;
            const lifeMs = 1400;

            const b = this._refs.minionBullets.create(sx, sy, 'bulletBoss1')
                .setDepth(12);
            __scaleToHeight(scene, b, MINION_BULLET_H);

            if (b.body) {
                // ↓ 아래로 직진
                b.body.setVelocity(0, speed);
            }

            scene.time.delayedCall(lifeMs, () => {
                if (!b.active) return;
                b.destroy();
            });
        },

        // ===== 패턴3: 20초 쿨 필살기 루프 시작 =====                               // ver5
        _initPattern3Loop(scene) {                                                    // ver5
            if (this._refs.p3LoopTimer) { try { this._refs.p3LoopTimer.remove(false); } catch (_) { } }
            this._refs.p3LoopTimer = scene.time.addEvent({
                delay: 20000,  // 20초
                loop: true,
                callback: () => this._triggerPattern3(scene)
            });
            this._refs.timers.push(this._refs.p3LoopTimer);
        },

        // 패턴3 트리거: 경고 → 실사격(레이저+이동) → 종료/정리 → 패턴1 재개          // ver5
        _triggerPattern3(scene) {                                                     // ver5
            if (!this.active || this._refs.p3Active) return;
            this._refs.p3Active = true;

            // 1) 패턴1 일시정지
            this._pausePattern1();

            // 2) 경고 레이저 점멸 (데미지 없음)
            this._showWarningLaser(scene, () => {
                // 3) 실 레이저 + 보스 이동(좌→우→센터)
                this._startDamageLaser(scene, () => {
                    // 4) 종료/정리 → 패턴1 재개
                    this._stopPattern3(scene);
                    this._resumePattern1();
                });
            });
        },

        _pausePattern1() {                                                            // ver5
            const t = this._refs.pattern1Timer;
            if (t) t.paused = true;
        },
        _resumePattern1() {                                                           // ver5
            const t = this._refs.pattern1Timer;
            if (t) t.paused = false;
        },

        // 경고(데미지 없음) 레이저 점멸 후 콜백                                     // ver5
        _showWarningLaser(scene, done) {                                              // ver5
            const boss = this._refs.sprite;
            if (!boss) { done?.(); return; }

            const tex = scene.textures.get('bossRazer0');
            const baseH = tex.getSourceImage().height;
            const scaleY = LASER_DISPLAY_H / baseH;

            const laser = scene.add.image(
                boss.x + EYE_OFFSET_X,
                boss.y + EYE_OFFSET_Y,
                'bossRazer0'
            )
            .setOrigin(0.5, 0)      // 위 기준, 아래로 뻗음
            .setDepth(15)
            .setScale(LASER_SCALE_X, scaleY)   // X 두께, Y 길이
            .setAlpha(0.8);

            this._refs.laserSprite = laser;

            // 보스 움직임을 따라가도록
            const follow = () => this._updateLaserAttach();
            laser._followCb = follow;
            scene.events.on('update', follow);

            // 깜빡임
            const blink = scene.tweens.add({
                targets: laser,
                alpha: { from: 0.3, to: 1 },
                yoyo: true,
                repeat: Math.max(1, Math.floor(LASER_WARN_MS / 200)),
                duration: 100
            });

            scene.time.delayedCall(LASER_WARN_MS, () => {
                try { blink.remove(); } catch(_) {}
                scene.events.off('update', follow);
                try { laser.destroy(); } catch(_) {}
                this._refs.laserSprite = null;
                done?.();
            });
        },

        // 실 레이저 발사 + 데미지 틱 + 좌↔우 이동 후 완료 콜백                      // ver5
        _startDamageLaser(scene, done) {                                              // ver5
            const boss = this._refs.sprite;
            if (!boss) { done?.(); return; }

            // 실 레이저 스프라이트
            const baseH = scene.textures.get('bossRazer').getSourceImage().height;
            const scaleY = LASER_DISPLAY_H / baseH;

            let laser = this._refs.laserSprite;
            if (!laser) {
                laser = scene.add.image(boss.x + EYE_OFFSET_X, boss.y + EYE_OFFSET_Y, 'bossRazer')
                    .setOrigin(0.5, 0)
                    .setDepth(15)
                    .setScale(LASER_SCALE_X, scaleY);
                this._refs.laserSprite = laser;
            } else {
                laser.setTexture('bossRazer')
                     .setOrigin(0.5, 0)
                     .setDepth(15)
                     .setScale(LASER_SCALE_X, scaleY)
                     .setAlpha(1);
            }

            // 레이저가 보스 이동을 따라가게
            const follow = () => this._updateLaserAttach();
            laser._followCb = follow;
            scene.events.on('update', follow);

            // 0.2초마다 피해 적용(간단 판정: 레이저 X축 근접 + 레이저 아래쪽에 플레이어)
            if (this._refs.laserTick) { try { this._refs.laserTick.remove(false); } catch (_) { } }
            this._refs.laserTick = scene.time.addEvent({
                delay: LASER_TICK_MS,
                loop: true,
                callback: () => {
                    const player = this._findPlayer(scene);
                    if (!player || !this._refs.laserSprite) return;
                    const nearX = Math.abs(player.x - this._refs.laserSprite.x) <= (player.displayWidth * 0.45);
                    const inY = player.y >= this._refs.laserSprite.y;
                    if (nearX && inY) {
                        try { window.applyPlayerDamage && window.applyPlayerDamage(LASER_DMG); } catch (_) { }
                    }
                }
            });
            this._refs.timers.push(this._refs.laserTick);

            // 이동 경로: 센터(현재) → 좌 → 우 → 센터 (피할 공간 확보 위해 과도한 이동 금지)
            const minX = 80;
            const maxX = scene.game.config.width - 80;
            const midX = scene.game.config.width / 2;
            const stepMs = Math.floor(LASER_FIRE_MS / 4);

            const chain = [
                { x: Phaser.Math.Clamp(midX - 90, minX, maxX), d: stepMs },     // 좌
                { x: Phaser.Math.Clamp(midX + 90, minX, maxX), d: stepMs * 2 }, // 우(두 구간 합)
                { x: Phaser.Math.Clamp(midX,      minX, maxX), d: stepMs }      // 센터
            ];

            const runStep = (i = 0) => {
                if (i >= chain.length) { done?.(); return; }
                if (this._refs.moveTween) { try { this._refs.moveTween.remove(); } catch (_) { } }
                this._refs.moveTween = scene.tweens.add({
                    targets: boss,
                    x: chain[i].x,
                    duration: chain[i].d,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => this._updateLaserAttach(),
                    onComplete: () => runStep(i + 1)
                });
            };
            runStep(0);

            scene.time.delayedCall(LASER_FIRE_MS, () => done?.());
        },

        _updateLaserAttach() {                                                         // ver5
            const boss = this._refs.sprite;
            const laser = this._refs.laserSprite;
            if (!boss || !laser) return;
            laser.x = boss.x + EYE_OFFSET_X;
            laser.y = boss.y + EYE_OFFSET_Y;
        },

        _stopPattern3(scene) {                                                         // ver5
            if (this._refs.laserTick) { try { this._refs.laserTick.remove(false); } catch (_) { } this._refs.laserTick = null; }
            if (this._refs.moveTween) { try { this._refs.moveTween.remove(); } catch (_) { } this._refs.moveTween = null; }

            if (this._refs.laserSprite) {
                if (this._refs.laserSprite._followCb) {
                    try { this._refs.scene.events.off('update', this._refs.laserSprite._followCb); } catch (_) { }
                    this._refs.laserSprite._followCb = null;
                }
                try { this._refs.laserSprite.destroy(); } catch (_) { }
                this._refs.laserSprite = null;
            }
            this._refs.p3Active = false;
        },

        // 플레이어 찾기: window.player → children에서
        _findPlayer(scene) {
            if (window.player && window.player.x != null) return window.player;

            const list = scene.children.list;
            for (let i = 0; i < list.length; i++) {
                const o = list[i];
                if (o && o.texture && o.texture.key && typeof o.x === 'number' && typeof o.y === 'number') {
                    const k = o.texture.key;
                    if (k === 'playerShip' || k === 'playerShip_0' || k === 'playerShip_1' || k === 'playerShip_2') {
                        return o;
                    }
                }
            }
            return null;
        },

        // ==== 소멸/정리 ====
        despawn() {
            const s = this._refs.scene;

            // 패턴3 안전 정리                                                     // ver5
            this._stopPattern3(s);                                                    // ver5
            if (this._refs.p3LoopTimer) { try { this._refs.p3LoopTimer.remove(false); } catch (_) { } this._refs.p3LoopTimer = null; } // ver5

            // 타이머 정리
            this._refs.timers.forEach(t => { try { t.remove(false); } catch (_) { } });
            this._refs.timers = [];

            // 콜라이더 정리
            if (this._refs.bulletVsMinionCollider && s) {
                try { s.physics.world.removeCollider(this._refs.bulletVsMinionCollider); } catch (_) { }
                this._refs.bulletVsMinionCollider = null;
            }

            // 그룹/스프라이트 제거
            ['bossBulletGroup', 'minionGroup', 'minionBullets'].forEach(k => {
                const g = this._refs[k];
                if (!g) return;
                try {
                    if (g.clear) g.clear(true, true);
                    if (g.destroy) g.destroy(true);
                } catch (_) { }
                this._refs[k] = null;
            });

            if (this._refs.sprite && this._refs.sprite.destroy) this._refs.sprite.destroy();
            if (this._refs.hpGfx && this._refs.hpGfx.destroy) this._refs.hpGfx.destroy();
            if (this._refs.nameText && this._refs.nameText.destroy) this._refs.nameText.destroy();

            this._refs.sprite = null;
            this._refs.hpGfx = null;
            this._refs.nameText = null;

            this._refs.scene = null;
            this.active = false;
            this.hp = 0;
            this.hpMax = 0;
        }
    };

    window.Boss1 = Boss1;
})();
