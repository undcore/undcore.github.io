/*
 * viz/two-pointers.js — 투 포인터 (정렬된 배열에서 합이 target인 쌍 찾기)
 * 색 언어: 왼쪽 포인터 = blue, 오른쪽 포인터 = coral, 찾은 쌍 = sage, 제외된 구간 = line
 */
(function () {
  'use strict';

  VizEngine.register('two-pointers', function (P) {
    var N = 26;
    var lo;
    var hi;
    var target;
    var found; // [lo, hi] 또는 null

    function reset() {
      // 합이 되는 쌍을 먼저 고르고 목표값을 정함
      var a = 1 + Math.floor(Math.random() * (N - 2));
      var b = a + 1 + Math.floor(Math.random() * (N - a - 1));
      target = a + 1 + (b + 1); // 값 = 인덱스 + 1
      lo = 0;
      hi = N - 1;
      found = null;
    }

    function step() {
      if (found) return true;
      if (lo >= hi) return true;
      var sum = lo + 1 + (hi + 1);
      if (sum === target) {
        found = [lo, hi];
        return true;
      }
      if (sum < target) lo++;
      else hi--;
      return false;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var padX = w * 0.04;
      var padTop = h * 0.2;
      var padBottom = h * 0.06;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.72);
      var maxH = h - padTop - padBottom;

      // 현재 합 / 목표 표시
      var sum = found ? target : lo < hi ? lo + 1 + (hi + 1) : 0;
      ctx.fillStyle = P.muted;
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('sum = ' + sum, padX, padTop * 0.45);
      ctx.textAlign = 'right';
      ctx.fillText('target = ' + target, w - padX, padTop * 0.45);

      for (var idx = 0; idx < N; idx++) {
        var v = idx + 1;
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = h - padBottom - bh;

        var color;
        if (found && (idx === found[0] || idx === found[1])) color = P.sage;
        else if (!found && idx === lo) color = P.blue;
        else if (!found && idx === hi) color = P.coral;
        else if (idx < lo || idx > hi) color = P.line;
        else color = P.neutral;

        // 포인터 막대는 전체 폭으로 강조
        var hot = (found && (idx === found[0] || idx === found[1])) || (!found && (idx === lo || idx === hi));
        var bw = hot ? slot * 0.98 : barW;
        var bx = hot ? padX + idx * slot + (slot - bw) / 2 : x;

        ctx.fillStyle = color;
        ctx.fillRect(bx, y, bw, bh);
      }

      // 포인터 마커 (윗쪽 삼각형)
      function marker(i, color) {
        var mx = padX + i * slot + slot / 2;
        var my = padTop * 0.72;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(mx - 4, my - 4);
        ctx.lineTo(mx + 4, my - 4);
        ctx.lineTo(mx, my + 3);
        ctx.closePath();
        ctx.fill();
      }
      if (found) {
        marker(found[0], P.sage);
        marker(found[1], P.sage);
      } else if (lo < hi) {
        marker(lo, P.blue);
        marker(hi, P.coral);
      }
    }

    return {
      stepInterval: 260,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
