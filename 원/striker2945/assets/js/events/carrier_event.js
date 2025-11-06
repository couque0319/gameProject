// assets/js/events/carrier_event.js
(function (global) {
  const NS = (global.CarrierEvent = global.CarrierEvent || {});

  function makeOverlay() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.75)',
      display: 'grid', placeItems: 'center', zIndex: 10000
    });
    el.innerHTML = `
      <div style="color:#cfe9ff;font:700 18px/1.4 ui-monospace,Consolas,monospace;text-align:center;">
        <div style="opacity:.9;margin-bottom:8px;">CARRIER DOCKING...</div>
        <div class="bar" style="width:260px;height:8px;border:1px solid #3a5e87;border-radius:6px;overflow:hidden;margin:0 auto;">
          <div style="height:100%;width:0;background:#61c1ff;transition:width .9s ease"></div>
        </div>
        <div style="margin-top:10px;font-weight:600;opacity:.8">착함 중… 잠시만요</div>
      </div>`;
    return el;
  }

  NS.start = function start(scene, { reason = 'stage-clear', onComplete } = {}) {
    const overlay = makeOverlay();
    document.body.appendChild(overlay);

    // 진행 바 애니메이션
    const bar = overlay.querySelector('.bar > div');
    requestAnimationFrame(() => (bar.style.width = '100%'));

    // 간단한 카메라 줌 인/아웃 연출
    const cam = scene.cameras.main;
    cam.zoomTo(1.06, 600, 'Cubic.easeOut', true);

    // 1.2초 후 완료
    scene.time.delayedCall(1200, () => {
      cam.zoomTo(1.0, 300, 'Cubic.easeIn', true);
      overlay.remove();
      onComplete && onComplete({ reason });
    });
  };
})(window);
