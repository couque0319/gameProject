
(function () {
    const Boss0 = {
        _active: false,
        _refs: { container: null, tapes: [], scene: null, timers: [] },

        start(scene, opts = {}) {
            if (this._active) return;
            this._active = true;
            this._refs.scene = scene;

            // 1) 전투 정지 + 적 스폰 이벤트 잠시 멈춤
            try { if (typeof window.setBattle === "function") window.setBattle(false); } catch (_) { }
            try { if (window.enemySpawnEvent) window.enemySpawnEvent.paused = true; } catch (_) { }
            this._clearEnemies();

            // 2) 3초 대기 후 경고 UI
            this._delay(scene, 3000, () => {
                this._showWarningUI(scene, () => {
                    game.scene.keys.default.textures.exists('boss1_2')     //test
                    game.scene.keys.default.textures.exists('bulletBoss1') //test
                    const scn = scene || this; // 보스0 메서드 내부면 this가 Scene일 수도 있으니 안전
                    const B1 = window.Boss1;
                    if (B1 && typeof B1.spawn === 'function') {
                        B1.spawn(scn, { hp: 350 });
                    } else {
                        console.warn('[Boss0] Boss1 not ready', B1);
                        // 보스 생성 실패해도 게임 멈추지 않도록 안전 처리
                        this._delay(scn, 10, () => {
                            try { window.setBattle?.(true); } catch { }
                            try { if (window.enemySpawnEvent) window.enemySpawnEvent.paused = false; } catch { }
                            this._cleanup?.();
                        });
                    }
                });
            });
        },

        // === 내부 구현 ===

        _showWarningUI(scene, onDone) {
            const w = scene.game.config.width;
            const h = scene.game.config.height;
            const depth = 900;

            // 루트 컨테이너
            const container = scene.add.container(w / 2, h / 2).setDepth(depth).setAlpha(0);
            this._refs.container = container;

            // 메인 경고 텍스트
            const main = scene.add.text(0, 0, "고위험 목표 접근중", {
                fontSize: "28px",
                fontStyle: "bold",
                color: "#fff",
                fontFamily: "monospace",
                stroke: "#000",
                strokeThickness: 6,
                align: "center",
            })
                .setOrigin(0.5)
                .setShadow(0, 3, "#111", 10, true, true);

            // 메인 텍스트 주변 하자드(노/흑) 얇은 바 2개
            const hazardTop = this._makeHazardBar(scene, Math.ceil(w * 0.66), 10);
            const hazardBot = this._makeHazardBar(scene, Math.ceil(w * 0.66), 10);

            // 배치 (메인 텍스트에 "가깝게" 붙임)
            const gap = 22;
            hazardTop.y = -gap - 14;
            hazardBot.y = gap + 14;

            container.add([hazardTop, hazardBot, main]);

            // 상/하단 보조 테이프: "warring warring ..." 긴 반복 텍스트
            // 메인에 "가깝게" 2줄만
            const tapeTop = this._createWarningTape(scene, -(gap + 42), /*near*/ true);
            const tapeBot = this._createWarningTape(scene, +(gap + 42), /*near*/ true);
            this._refs.tapes.push(tapeTop, tapeBot);
            container.add([tapeTop, tapeBot]);

            // 등장 애니메이션
            scene.tweens.add({
                targets: container,
                alpha: { from: 0, to: 1 },
                duration: 250,
                ease: "Cubic.easeOut",
            });

            // 메인 텍스트 약간 펌핑
            scene.tweens.add({
                targets: main,
                scale: { from: 1.0, to: 1.06 },
                yoyo: true,
                repeat: 3,
                duration: 260,
                ease: "Sine.easeInOut",
            });

            // 테이프는 천천히 좌/우로 슬라이딩
            this._slideTape(scene, tapeTop, 1);
            this._slideTape(scene, tapeBot, -1);

            // 2초 유지 → 페이드아웃 → onDone
            this._delay(scene, 2000, () => {
                scene.tweens.add({
                    targets: container,
                    alpha: 0,
                    duration: 220,
                    ease: "Cubic.easeIn",
                    onComplete: () => {
                        // 안전 제거
                        container.destroy();
                        this._refs.container = null;
                        this._refs.tapes = [];
                        if (typeof onDone === "function") onDone();
                    },
                });
            });
        },

        _createWarningTape(scene, localY, near = false) {
            const w = scene.game.config.width;
            const tapeW = Math.ceil(w * (near ? 0.96 : 1.05));
            const tapeH = 18;

            const g = scene.add.graphics();
            // 바탕 회색
            g.fillStyle(0xbfbfbf, 1);
            g.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);

            // 상/하단 얇은 검은 라인
            g.lineStyle(2, 0x000000, 1);
            g.strokeRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);

            // 노/검 하자드 대각 패턴(가볍게)
            const stripeW = 16;
            for (let x = -tapeW / 2 - tapeH; x < tapeW / 2 + tapeH; x += stripeW) {
                g.fillStyle(0xffcc00, 1);
                g.fillTriangle(
                    x, -tapeH / 2,
                    x + stripeW, -tapeH / 2,
                    x + stripeW - tapeH, tapeH / 2
                );
            }

            // 반복 텍스트: "warring" (오타 의도 유지)
            const label = " WARRING ";
            const repeatCount = Math.ceil((tapeW / 8) / label.length) * 2; // 대충 여유있게
            const textStr = label.repeat(repeatCount).toUpperCase();

            const txt = scene.add.text(0, 0, textStr, {
                fontSize: "12px",
                color: "#000000",
                fontFamily: "monospace",
            }).setOrigin(0.5);

            const container = scene.add.container(0, localY, [g, txt]);
            container._tapeText = txt; // 슬라이드용 참조
            container._tapeWidth = tapeW;

            return container;
        },

        _slideTape(scene, tapeContainer, dir = 1) {
            // 텍스트를 살짝 좌우로 왕복 슬라이드해서 움직이는 느낌
            const span = 16 * dir;
            scene.tweens.add({
                targets: tapeContainer._tapeText,
                x: { from: -4, to: -4 + span },
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
        },

        _makeHazardBar(scene, w, h) {
            const g = scene.add.graphics();
            // 바탕 진회색
            g.fillStyle(0x444444, 1);
            g.fillRect(-w / 2, -h / 2, w, h);

            // 노/검 하자드 스트라이프
            const stripeW = 18;
            for (let x = -w / 2 - h; x < w / 2 + h; x += stripeW) {
                g.fillStyle(0xffcc00, 1);
                g.fillTriangle(
                    x, -h / 2,
                    x + stripeW, -h / 2,
                    x + stripeW - h, h / 2
                );
            }

            // 테두리
            g.lineStyle(2, 0x000000, 1);
            g.strokeRect(-w / 2, -h / 2, w, h);

            const container = scene.add.container(0, 0, [g]);
            return container;
        },

        _clearEnemies() {
            try {
                const enemies = window.enemies;
                if (!enemies) return;
                enemies.children.each((e) => {
                    if (!e.active) return;
                    e.setActive(false).setVisible(false);
                    if (e.body) e.body.enable = false;
                    if (e.destroy) e.destroy();
                });
            } catch (_) { }
        },

        _delay(scene, ms, fn) {
            const t = scene.time.delayedCall(ms, () => { try { fn(); } catch (_) { } });
            this._refs.timers.push(t);
        },

        _cleanup() {
            const scene = this._refs.scene;
            // 타이머 정리
            for (const t of this._refs.timers) {
                try { t.remove(false); } catch (_) { }
            }
            this._refs.timers = [];

            // 컨테이너/테이프 정리
            try { if (this._refs.container) this._refs.container.destroy(); } catch (_) { }
            this._refs.container = null;
            this._refs.tapes = [];

            this._refs.scene = null;
            this._active = false;
        },
    };

    window.Boss0 = Boss0;
})();
