/*
 * viz/binary-search.js — 이진 탐색 막대 시각화
 * 색 언어: 탐색 범위 = sage, 현재 mid = blue, 찾은 값 = coral, 제외된 범위 = line
 */
(function () {
  'use strict';

  VizEngine.register('binary-search', function (P) {
    var N = 26;
    var target;
    var lo;
    var hi;
    var mid;
    var found;

    function reset() {
      target = 1 + Math.floor(Math.random() * N);
      lo = 0;
      hi = N - 1;
      mid = -1;
      found = -1;
    }

    function step() {
      if (found !== -1) return true;
      if (lo > hi) return true;
      mid = lo + ((hi - lo) >> 1);
      var v = mid + 1; // 값 = 인덱스 + 1 (정렬된 상태)
      if (v === target) {
        found = mid;
        return true;
      }
      if (v < target) lo = mid + 1;
      else hi = mid - 1;
      return false;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var padX = w * 0.04;
      var padTop = h * 0.12;
      var padBottom = h * 0.06;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.72);
      var maxH = h - padTop - padBottom;

      for (var idx = 0; idx < N; idx++) {
        var v = idx + 1;
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = h - padBottom - bh;

        var color;
        if (idx === found) color = P.coral;
        else if (idx === mid && found === -1) color = P.blue;
        else if (idx < lo || idx > hi) color = P.line;
        else color = P.sage;

        // 현재 mid / 찾은 막대는 전체 폭으로 강조
        var hot = idx === found || (idx === mid && found === -1);
        var bw = hot ? slot * 0.98 : barW;
        var bx = hot ? padX + idx * slot + (slot - bw) / 2 : x;

        ctx.fillStyle = color;
        ctx.fillRect(bx, y, bw, bh);
      }

      // 목표 값 마커 (윗쪽 다이아몬드)
      var tx = padX + (target - 1) * slot + slot / 2;
      var ty = padTop * 0.35;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 4);
      ctx.lineTo(tx + 4, ty);
      ctx.lineTo(tx, ty + 4);
      ctx.lineTo(tx - 4, ty);
      ctx.closePath();
      if (found !== -1) {
        ctx.fillStyle = P.coral;
        ctx.fill();
      } else {
        ctx.strokeStyle = P.coral;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    return {
      stepInterval: 500,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
