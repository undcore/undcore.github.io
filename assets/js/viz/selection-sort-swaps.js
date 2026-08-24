/*
 * viz/selection-sort-swaps.js — [보조] 같은 입력에서 선택 정렬 vs 버블 정렬 교환 횟수
 */
(function () {
  'use strict';

  VizEngine.register('selection-sort-swaps', function (P) {
    var N = 13;
    var sel;
    var bub;

    function reset() {
      var base = [];
      for (var k = 0; k < N; k++) base.push(k + 1);
      for (var k2 = N - 1; k2 > 0; k2--) {
        var r = Math.floor(Math.random() * (k2 + 1));
        var t = base[k2];
        base[k2] = base[r];
        base[r] = t;
      }
      sel = { values: base.slice(), i: 0, j: 0, minIdx: 0, swaps: 0, done: false };
      bub = { values: base.slice(), end: N - 1, j: 0, swaps: 0, done: false };
    }

    function selStep(s) {
      if (s.done) return;
      if (s.i >= N - 1) {
        s.done = true;
        return;
      }
      if (s.j > N - 1) {
        if (s.minIdx !== s.i) {
          var t = s.values[s.i];
          s.values[s.i] = s.values[s.minIdx];
          s.values[s.minIdx] = t;
          s.swaps++;
        }
        s.i++;
        s.j = s.i;
        s.minIdx = s.i;
        if (s.i >= N - 1) s.done = true;
        return;
      }
      if (s.values[s.j] < s.values[s.minIdx]) s.minIdx = s.j;
      s.j++;
    }

    function bubStep(s) {
      if (s.done) return;
      if (s.end <= 0) {
        s.done = true;
        return;
      }
      if (s.j >= s.end) {
        s.end--;
        s.j = 0;
        if (s.end <= 0) s.done = true;
        return;
      }
      if (s.values[s.j] > s.values[s.j + 1]) {
        var t = s.values[s.j];
        s.values[s.j] = s.values[s.j + 1];
        s.values[s.j + 1] = t;
        s.swaps++;
      }
      s.j++;
    }

    function step() {
      selStep(sel);
      bubStep(bub);
      return sel.done && bub.done;
    }

    function drawRow(ctx, w, s, y0, rowH, label, colorOf) {
      var padX = w * 0.04;
      ctx.fillStyle = P.muted;
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(label, padX, y0 + 13);
      ctx.textAlign = 'right';
      ctx.fillText('교환 ' + s.swaps + '회', w - padX, y0 + 13);

      var barTop = y0 + 20;
      var barBottom = y0 + rowH - 4;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.7);
      var maxH = barBottom - barTop;

      for (var idx = 0; idx < N; idx++) {
        var v = s.values[idx];
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
      drawRow(ctx, w, sel, 0, rowH, '선택 정렬', function (idx) {
        if (sel.done || idx < sel.i) return P.sage;
        if (idx === sel.minIdx) return P.coral;
        if (idx === sel.j && sel.j <= N - 1) return P.blue;
        return P.neutral;
      });
      drawRow(ctx, w, bub, rowH, rowH, '버블 정렬', function (idx) {
        if (bub.done || idx > bub.end) return P.sage;
        if (idx === bub.j) return P.blue;
        if (idx === bub.j + 1) return P.coral;
        return P.neutral;
      });
    }

    return {
      stepInterval: 110,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
