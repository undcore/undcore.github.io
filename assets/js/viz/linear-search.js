/*
 * viz/linear-search.js — 선형 탐색 막대 시각화
 * 색 언어: 현재 비교 원소 = blue, 찾은 값 = coral, 이미 지나친 원소 = line, 기본 = neutral
 */
(function () {
  'use strict';

  VizEngine.register('linear-search', function (P) {
    var N = 26;
    var values = [];
    var target;
    var idx; // 현재 탐색 위치
    var found;

    function reset() {
      values = [];
      for (var k = 0; k < N; k++) values.push(k + 1);
      for (var k2 = N - 1; k2 > 0; k2--) {
        var r = Math.floor(Math.random() * (k2 + 1));
        var t = values[k2];
        values[k2] = values[r];
        values[r] = t;
      }
      target = 1 + Math.floor(Math.random() * N);
      idx = 0;
      found = -1;
    }

    function step() {
      if (found !== -1) return true;
      if (idx >= N) return true;
      if (values[idx] === target) {
        found = idx;
        return true;
      }
      idx++;
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

      for (var i = 0; i < N; i++) {
        var v = values[i];
        var bh = (v / N) * maxH;
        var x = padX + i * slot + (slot - barW) / 2;
        var y = h - padBottom - bh;

        var color;
        if (i === found) color = P.coral;
        else if (i === idx && found === -1) color = P.blue;
        else if (i < idx) color = P.line;
        else color = P.neutral;

        // 현재 비교 / 찾은 막대는 전체 폭으로 강조
        var hot = i === found || (i === idx && found === -1);
        var bw = hot ? slot * 0.98 : barW;
        var bx = hot ? padX + i * slot + (slot - bw) / 2 : x;

        ctx.fillStyle = color;
        ctx.fillRect(bx, y, bw, bh);
      }

      // 목표 값 마커 (윗쪽 다이아몬드)
      var tx = padX + (target === -1 ? 0 : values.indexOf(target)) * slot + slot / 2;
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
      stepInterval: 130,
      holdTime: 1800,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
