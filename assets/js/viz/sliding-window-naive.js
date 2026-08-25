/*
 * viz/sliding-window-naive.js — [보조] 매번 다시 합산 vs 슬라이딩 윈도우 연산 횟수
 */
(function () {
  'use strict';

  VizEngine.register('sliding-window-naive', function (P) {
    var N = 15;
    var K = 5;
    var values = [];
    var naive;
    var slide;

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
      naive = { pos: 0, ops: 0, phase: 0, done: false }; // phase: 윈도우 내 합산 진행
      slide = { pos: 0, sum: windowSum(0), ops: K, done: false }; // 첫 합 K회로 시작
    }

    function naiveStep(s) {
      if (s.done) return;
      s.ops++;
      s.phase++;
      if (s.phase >= K) {
        s.phase = 0;
        s.pos++;
        if (s.pos > N - K) s.done = true;
      }
    }

    function slideStep(s) {
      if (s.done) return;
      if (s.pos >= N - K) {
        s.done = true;
        return;
      }
      s.ops += 2; // 새 값 더하기 + 빠진 값 빼기
      s.sum += values[s.pos + K] - values[s.pos];
      s.pos++;
      if (s.pos >= N - K) s.done = true;
    }

    function step() {
      naiveStep(naive);
      slideStep(slide);
      return naive.done && slide.done;
    }

    function drawRow(ctx, w, pos, y0, rowH, label, ops) {
      var padX = w * 0.04;
      ctx.fillStyle = P.muted;
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(label, padX, y0 + 13);
      ctx.textAlign = 'right';
      ctx.fillText('연산 ' + ops + '회', w - padX, y0 + 13);

      var barTop = y0 + 20;
      var barBottom = y0 + rowH - 4;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.7);
      var maxH = barBottom - barTop;

      for (var idx = 0; idx < N; idx++) {
        var v = values[idx];
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = barBottom - bh;

        var inWindow = idx >= pos && idx < pos + K;
        ctx.fillStyle = inWindow ? P.blue : P.neutral;
        if (idx === pos + K - 1) ctx.fillStyle = P.coral;
        ctx.fillRect(x, y, barW, bh);
      }
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var rowH = h / 2;
      drawRow(ctx, w, naive.pos, 0, rowH, '매번 다시 합산 O(nk)', naive.ops);
      drawRow(ctx, w, slide.pos, rowH, rowH, '슬라이딩 윈도우 O(n)', slide.ops);
    }

    return {
      stepInterval: 120,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
