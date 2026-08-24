/*
 * viz/bubble-sort.js — 버블 정렬 막대 시각화
 * 색 언어: 정렬 확정(뒤쪽) = sage, 비교 중인 왼쪽 원소 = blue, 오른쪽 원소 = coral, 기본 = neutral
 */
(function () {
  'use strict';

  VizEngine.register('bubble-sort', function (P) {
    var N = 26;
    var values = [];
    var end; // 미정렬 구간 끝 (end+1..N-1 확정)
    var j; // 현재 비교 쌍 (j, j+1)

    function reset() {
      values = [];
      for (var k = 0; k < N; k++) values.push(k + 1);
      for (var k2 = N - 1; k2 > 0; k2--) {
        var r = Math.floor(Math.random() * (k2 + 1));
        var t = values[k2];
        values[k2] = values[r];
        values[r] = t;
      }
      end = N - 1;
      j = 0;
    }

    function step() {
      if (end <= 0) return true;
      if (j >= end) {
        end--;
        j = 0;
        return end <= 0;
      }
      if (values[j] > values[j + 1]) {
        var t = values[j];
        values[j] = values[j + 1];
        values[j + 1] = t;
      }
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
        if (idx > end || end <= 0) color = P.sage;
        else if (idx === j) color = P.blue;
        else if (idx === j + 1) color = P.coral;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barW, bh);
      }
    }

    return {
      stepInterval: 50,
      holdTime: 1800,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
