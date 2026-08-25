/*
 * viz/two-pointers-vs-brute.js — [보조] 브루트포스 vs 투 포인터 비교 횟수
 */
(function () {
  'use strict';

  VizEngine.register('two-pointers-vs-brute', function (P) {
    var N = 15;
    var target;
    var brute;
    var tp;

    function reset() {
      var a = 1 + Math.floor(Math.random() * (N - 2));
      var b = a + 1 + Math.floor(Math.random() * (N - a - 1));
      target = a + 1 + (b + 1);
      brute = { i: 0, j: 1, found: null, comparisons: 0, done: false };
      tp = { lo: 0, hi: N - 1, found: null, comparisons: 0, done: false };
    }

    function bruteStep(s) {
      if (s.done) return;
      if (s.i >= N - 1) {
        s.done = true;
        return;
      }
      s.comparisons++;
      if (s.i + 1 + (s.j + 1) === target) {
        s.found = [s.i, s.j];
        s.done = true;
        return;
      }
      s.j++;
      if (s.j >= N) {
        s.i++;
        s.j = s.i + 1;
      }
    }

    function tpStep(s) {
      if (s.done) return;
      if (s.lo >= s.hi) {
        s.done = true;
        return;
      }
      s.comparisons++;
      var sum = s.lo + 1 + (s.hi + 1);
      if (sum === target) {
        s.found = [s.lo, s.hi];
        s.done = true;
        return;
      }
      if (sum < target) s.lo++;
      else s.hi--;
    }

    function step() {
      bruteStep(brute);
      tpStep(tp);
      return brute.done && tp.done;
    }

    function drawRow(ctx, w, y0, rowH, label, comparisons, colorOf) {
      var padX = w * 0.04;
      ctx.fillStyle = P.muted;
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(label, padX, y0 + 13);
      ctx.textAlign = 'right';
      ctx.fillText('비교 ' + comparisons + '회', w - padX, y0 + 13);

      var barTop = y0 + 20;
      var barBottom = y0 + rowH - 4;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.7);
      var maxH = barBottom - barTop;

      for (var idx = 0; idx < N; idx++) {
        var v = idx + 1;
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = barBottom - bh;
        ctx.fillStyle = colorOf(idx);
        ctx.fillRect(x, y, barW, bh);
      }
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var rowH = h / 2;
      drawRow(ctx, w, 0, rowH, '모든 쌍 검사 (브루트포스)', brute.comparisons, function (idx) {
        if (brute.found && (idx === brute.found[0] || idx === brute.found[1])) return P.sage;
        if (!brute.done && idx === brute.i) return P.blue;
        if (!brute.done && idx === brute.j) return P.coral;
        if (idx < brute.i) return P.line;
        return P.neutral;
      });
      drawRow(ctx, w, rowH, rowH, '투 포인터', tp.comparisons, function (idx) {
        if (tp.found && (idx === tp.found[0] || idx === tp.found[1])) return P.sage;
        if (!tp.done && idx === tp.lo) return P.blue;
        if (!tp.done && idx === tp.hi) return P.coral;
        if (idx < tp.lo || idx > tp.hi) return P.line;
        return P.neutral;
      });
    }

    return {
      stepInterval: 130,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
