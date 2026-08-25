/*
 * viz/sliding-window.js — 슬라이딩 윈도우 (크기 k인 연속 구간의 최대 합)
 * 색 언어: 윈도우 = blue, 새로 들어온 막대 = coral, 최대 합 윈도우 = sage 밑줄, 기본 = neutral
 */
(function () {
  'use strict';

  VizEngine.register('sliding-window', function (P) {
    var N = 26;
    var K = 5;
    var values = [];
    var pos; // 윈도우 시작 위치
    var sum;
    var best;
    var bestPos;

    function windowSum(start) {
      var s = 0;
      for (var k = 0; k < K; k++) s += values[start + k];
      return s;
    }

    function reset() {
      values = [];
      for (var k = 0; k < N; k++) values.push(k + 1);
      for (var k2 = N - 1; k2 > 0; k2--) {
        var r = Math.floor(Math.random() * (k2 + 1));
        var t = values[k2];
        values[k2] = values[r];
        values[r] = t;
      }
      pos = 0;
      sum = windowSum(0);
      best = sum;
      bestPos = 0;
    }

    function step() {
      if (pos >= N - K) return true;
      sum += values[pos + K] - values[pos];
      pos++;
      if (sum > best) {
        best = sum;
        bestPos = pos;
      }
      return pos >= N - K;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var padX = w * 0.04;
      var padTop = h * 0.22;
      var padBottom = h * 0.08;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.72);
      var maxH = h - padTop - padBottom;

      // 현재 합 / 최대 합 표시
      ctx.fillStyle = P.muted;
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('sum = ' + sum, padX, padTop * 0.45);
      ctx.textAlign = 'right';
      ctx.fillText('max = ' + best, w - padX, padTop * 0.45);

      for (var idx = 0; idx < N; idx++) {
        var v = values[idx];
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = h - padBottom - bh;

        var inWindow = idx >= pos && idx < pos + K;
        var color = P.neutral;
        if (inWindow) color = P.blue;
        if (idx === pos + K - 1) color = P.coral; // 새로 들어온 막대

        var bw = idx === pos + K - 1 ? slot * 0.98 : barW;
        var bx = idx === pos + K - 1 ? padX + idx * slot + (slot - bw) / 2 : x;

        ctx.fillStyle = color;
        ctx.fillRect(bx, y, bw, bh);
      }

      // 최대 합 윈도우 밑줄
      var ux1 = padX + bestPos * slot;
      var ux2 = padX + (bestPos + K) * slot;
      var uy = h - padBottom * 0.4;
      ctx.strokeStyle = P.sage;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ux1, uy);
      ctx.lineTo(ux2, uy);
      ctx.stroke();
    }

    return {
      stepInterval: 220,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
