/*
 * viz/binary-vs-linear.js — [보조] 같은 목표를 찾는 선형 탐색 vs 이진 탐색 비교 횟수
 */
(function () {
  'use strict';

  VizEngine.register('binary-vs-linear', function (P) {
    var N = 21;
    var target;
    var lin;
    var bin;

    function reset() {
      target = 1 + Math.floor(Math.random() * N);
      lin = { idx: 0, found: -1, comparisons: 0, done: false };
      bin = { lo: 0, hi: N - 1, mid: -1, found: -1, comparisons: 0, done: false };
    }

    function linStep(s) {
      if (s.done) return;
      if (s.idx >= N) {
        s.done = true;
        return;
      }
      s.comparisons++;
      if (s.idx + 1 === target) {
        s.found = s.idx;
        s.done = true;
        return;
      }
      s.idx++;
    }

    function binStep(s) {
      if (s.done) return;
      if (s.lo > s.hi) {
        s.done = true;
        return;
      }
      s.comparisons++;
      s.mid = s.lo + ((s.hi - s.lo) >> 1);
      var v = s.mid + 1;
      if (v === target) {
        s.found = s.mid;
        s.done = true;
        return;
      }
      if (v < target) s.lo = s.mid + 1;
      else s.hi = s.mid - 1;
    }

    function step() {
      linStep(lin);
      binStep(bin);
      return lin.done && bin.done;
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
      drawRow(ctx, w, 0, rowH, '선형 탐색', lin.comparisons, function (idx) {
        if (idx === lin.found) return P.coral;
        if (idx === lin.idx && !lin.done) return P.blue;
        if (idx < lin.idx) return P.line;
        return P.neutral;
      });
      drawRow(ctx, w, rowH, rowH, '이진 탐색', bin.comparisons, function (idx) {
        if (idx === bin.found) return P.coral;
        if (idx === bin.mid && !bin.done) return P.blue;
        if (idx < bin.lo || idx > bin.hi) return P.line;
        return P.sage;
      });
    }

    return {
      stepInterval: 220,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
