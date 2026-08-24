/*
 * viz/insertion-sort.js — 삽입 정렬 막대 시각화
 * 색 언어: 정렬 완료 = sage, 비교 대상 = blue, 삽입 위치(키) = coral, 기본 = neutral
 */
(function () {
  'use strict';

  VizEngine.register('insertion-sort', function (P) {
    var N = 26;
    var values = [];
    var i; // 정렬 경계 (0..i-1 정렬됨)
    var j; // 비교 인덱스
    var key; // 현재 삽입 중인 값 (null이면 대기)

    function reset() {
      values = [];
      for (var k = 0; k < N; k++) values.push(k + 1);
      for (var k2 = N - 1; k2 > 0; k2--) {
        var r = Math.floor(Math.random() * (k2 + 1));
        var t = values[k2];
        values[k2] = values[r];
        values[r] = t;
      }
      i = 1;
      j = -1;
      key = null;
    }

    function step() {
      if (i >= N) return true;
      if (key === null) {
        key = values[i];
        j = i - 1;
        return false;
      }
      if (j >= 0 && values[j] > key) {
        values[j + 1] = values[j];
        j--;
        return false;
      }
      values[j + 1] = key;
      key = null;
      i++;
      return i >= N;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var padX = w * 0.04;
      var padTop = h * 0.08;
      var padBottom = h * 0.06;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.72);
      var maxH = h - padTop - padBottom;

      for (var idx = 0; idx < N; idx++) {
        var v = values[idx];
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = h - padBottom - bh;

        var color = P.neutral;
        if (idx < i) color = P.sage;
        if (key !== null && idx === j) color = P.blue;
        if (key !== null && idx === j + 1) color = P.coral;
        if (i >= N) color = P.sage;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barW, bh);
      }

      // 키 값 표시 마커 (삽입 위치 위쪽 작은 다이아몬드)
      if (key !== null && j + 1 >= 0 && j + 1 < N) {
        var mx = padX + (j + 1) * slot + slot / 2;
        var my = padTop * 0.4;
        ctx.fillStyle = P.coral;
        ctx.beginPath();
        ctx.moveTo(mx, my - 4);
        ctx.lineTo(mx + 4, my);
        ctx.lineTo(mx, my + 4);
        ctx.lineTo(mx - 4, my);
        ctx.closePath();
        ctx.fill();
      }
    }

    return {
      stepInterval: 90,
      holdTime: 1800,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
