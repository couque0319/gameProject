// boss1.js
(function () {

    // 크기/속도 상수 (원하면 여기 숫자만 바꿔서 재조절)
    const BOSS_BULLET_H = 18;   // 보스(날개) 탄 표시 높이(px)  // ver4
    const MINION_DISPLAY_H = 68;  // 미니언 표시 높이(px)          // ver4
    const MINION_BULLET_H = 22;  // 미니언 탄 표시 높이(px)        // ver4
    const BOSS_TRIPLE_INTERVAL = 2000; // 보스 3점사 주기(ms)       // ver4

    // 픽셀 "높이" 기준으로 스케일 맞추기 유틸        /
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
            bossBulletGroup: null,        // 보스(날개) 탄 그룹        // ver4
            minionGroup: null,            // 미니언 그룹               // ver4
            minionBullets: null,          // 미니언 탄 그룹            // ver4
            bulletVsMinionCollider: null, // 플레이어 총알 vs 미니언   // ver4
            timers: [],                   // 타이머 핸들 모음          // ver4
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
                    this._startPattern1(scene); // 양 날개 3점사
                    this._startPattern2(scene); // 미니언 소환 주기
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

        // 패턴 1: 양 날개 3점사(2초마다)
        _startPattern1(scene) {
            const boss = this._refs.sprite;
            if (!boss) return;

            const bulletKey = 'bulletBoss2';

            const timer = scene.time.addEvent({
                delay: 2000, // 2초마다
                loop: true,
                callback: () => {
                    if (!this.active || !this._refs.sprite) return;

                    const b = this._refs.sprite;
                    const wings = [
                        { offsetX: -b.displayWidth * 0.40, offsetY: b.displayHeight * -0.10 }, // 왼쪽 날개
                        { offsetX: b.displayWidth * 0.40, offsetY: b.displayHeight * -0.10 }  // 오른쪽 날개
                    ];

                    // 양쪽 날개에서 직선 3연발 (한줄로)
                    wings.forEach(({ offsetX, offsetY }) => {
                        const sx = b.x + offsetX;
                        const sy = b.y + offsetY;
                        this._fireLineTowardPlayer(scene, sx, sy, bulletKey, 18, 520);
                    });
                }
            });
            this._refs.timers.push(timer);
        },

        // 일렬(한 방향) 사격 함수
        _fireLineTowardPlayer(scene, sx, sy, textureKey, targetH, speed) {
            const player = this._findPlayer(scene);
            const ang = player ? Phaser.Math.Angle.Between(sx, sy, player.x, player.y) : (-Math.PI / 2);

            // 3발을 일정 간격으로 시간차 발사
            for (let i = 0; i < 3; i++) {
                scene.time.delayedCall(i * 180, () => {
                    const b = this._refs.bossBulletGroup.create(sx, sy, textureKey)
                        .setDepth(4);
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

        // 패턴 2: 미니언 소환(8초 주기, 전멸 전 재사용x)
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
        },

        _spawnMinionPair(scene) {
            const boss = this._refs.sprite;
            if (!boss) return;

            const wingX = boss.displayWidth * 0.38 - 15 ;
            const wingY = boss.displayHeight * 0.05 + 25;

            const spots = [
                { x: boss.x - wingX, y: boss.y + wingY },
                { x: boss.x + wingX, y: boss.y + wingY },
            ];

            spots.forEach((p) => {
                const m = this._refs.minionGroup.create(p.x, p.y, 'boss1_2')
                    .setDepth(6);
                __scaleToHeight(scene, m, MINION_DISPLAY_H);                  // 미니언 크기

                m.setImmovable(true);
                if (m.body) m.body.setSize(m.displayWidth * 0.85, m.displayHeight * 0.85, true);
                m.hp = 50;

                // 고정 포탑처럼 1.3초마다 1발 — 시각 전용
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
            const speed = 360;           // 필요하면 조절
            const lifeMs = 1400;         // 수명

            const b = this._refs.minionBullets.create(sx, sy, 'bulletBoss1')
                .setDepth(7);
            // 크기: 필요시 고정 높이로 맞추고 싶으면 아래 한 줄 대신 __scaleToHeight(scene, b, 16) 같은 헬퍼 사용
            b.setScale(0.1);

            if (b.body) {
                // ↓ 아래로 직진
                b.body.setVelocity(0, speed);
            }

            scene.time.delayedCall(lifeMs, () => {
                if (!b.active) return;
                b.destroy();
            });
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

        // ==== 소멸/정리 ==== // ver4
        despawn() {
            const s = this._refs.scene;

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
