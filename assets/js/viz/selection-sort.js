/*
 * viz/selection-sort.js — 선택 정렬 막대 시각화
 * 색 언어: 정렬 완료 = sage, 탐색 중인 원소 = blue, 현재 최솟값 = coral, 기본 = neutral
 */
(function () {
  'use strict';

  VizEngine.register('selection-sort', function (P) {
    var N = 26;
    var values = [];
    var i; // 정렬 경계 (0..i-1 정렬됨)
    var j; // 탐색 인덱스
    var minIdx; // 현재까지의 최솟값 위치

    function reset() {
      values = [];
      for (var k = 0; k < N; k++) values.push(k + 1);
      for (var k2 = N - 1; k2 > 0; k2--) {
        var r = Math.floor(Math.random() * (k2 + 1));
        var t = values[k2];
        values[k2] = values[r];
        values[r] = t;
      }
      i = 0;
      j = 0;
      minIdx = 0;
    }

    function step() {
      if (i >= N - 1) return true;
      if (j > N - 1) {
        var t = values[i];
        values[i] = values[minIdx];
        values[minIdx] = t;
        i++;
        j = i;
        minIdx = i;
        return i >= N - 1;
      }
      if (values[j] < values[minIdx]) minIdx = j;
      j++;
      return false;
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
        if (idx < i || i >= N - 1) color = P.sage;
        else if (idx === minIdx) color = P.coral;
        else if (idx === j && j <= N - 1) color = P.blue;

        // 현재 최솟값 막대는 전체 폭으로 강조
        var hot = idx === minIdx && i < N - 1;
        var bw = hot ? slot * 0.98 : barW;
        var bx = hot ? padX + idx * slot + (slot - bw) / 2 : x;

        ctx.fillStyle = color;
        ctx.fillRect(bx, y, bw, bh);
      }

      // 현재 최솟값 마커 (윗쪽 다이아몬드)
      if (i < N - 1) {
        var mx = padX + minIdx * slot + slot / 2;
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
      stepInterval: 60,
      holdTime: 1800,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
