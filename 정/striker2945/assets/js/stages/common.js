// 전역 레지스트리
(function () {
  const NS = (window.STAGES = window.STAGES || { easy:{}, hard:{} });

  // 등록 헬퍼: register('easy', 1, builderFn)
  NS.register = function (difficulty, index, builder) {
    if (!NS[difficulty]) NS[difficulty] = {};
    NS[difficulty][index] = builder;
  };

  // 파라미터 스케일러: 스테이지 번호에 따라 적당히 상승
  // base: {bul:총알속도배수, fire:발사주기배수(낮을수록 촘촘), n:적 수/발 수 배수}
  NS.scale = function (difficulty, index) {
    const clamped = Math.max(1, Math.min(10, index));
    if (difficulty === 'easy' || difficulty === 'morning') {
      return {
        bul: 1.0 + (clamped - 1) * 0.05,     // 1.00 ~ 1.45
        fire: 1.0 - (clamped - 1) * 0.03,    // 1.00 ~ 0.73 (간격 조금씩 짧아짐)
        n: 1.0 + (clamped - 1) * 0.07        // 1.00 ~ 1.63
      };
    } else { // hard
      return {
        bul: 1.15 + (clamped - 1) * 0.06,    // 1.15 ~ 1.69
        fire: 0.90 - (clamped - 1) * 0.035,  // 0.90 ~ 0.585
        n: 1.15 + (clamped - 1) * 0.09       // 1.15 ~ 1.96
      };
    }
  };
})();
