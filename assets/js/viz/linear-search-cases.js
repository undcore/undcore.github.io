/*
 * viz/linear-search-cases.js — [보조] 목표 위치(맨 앞/중간/맨 끝)에 따른 비교 횟수
 */
(function () {
  'use strict';

  VizEngine.register('linear-search-cases', function (P) {
    var N = 13;
    var values = [];
    var rows; // [{label, targetIdx, idx, found, comparisons, done}]

    function reset() {
      values = [];
      for (var k = 0; k < N; k++) values.push(k + 1);
      for (var k2 = N - 1; k2 > 0; k2--) {
        var r = Math.floor(Math.random() * (k2 + 1));
        var t = values[k2];
        values[k2] = values[r];
        values[r] = t;
      }
      rows = [
        { label: '목표가 맨 앞', targetIdx: 0, idx: 0, found: -1, comparisons: 0, done: false },
        { label: '목표가 중간', targetIdx: Math.floor(N / 2), idx: 0, found: -1, comparisons: 0, done: false },
        { label: '목표가 맨 끝', targetIdx: N - 1, idx: 0, found: -1, comparisons: 0, done: false }
      ];
    }

    function rowStep(r) {
      if (r.done) return;
      r.comparisons++;
      if (r.idx === r.targetIdx) {
        r.found = r.idx;
        r.done = true;
        return;
      }
      r.idx++;
    }

    function step() {
      rows.forEach(rowStep);
      return rows.every(function (r) {
        return r.done;
      });
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var rowH = h / 3;
      var padX = w * 0.04;

      rows.forEach(function (r, ri) {
        var y0 = ri * rowH;
        ctx.fillStyle = P.muted;
        ctx.font = '11px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(r.label, padX, y0 + 13);
        ctx.textAlign = 'right';
        ctx.fillText('비교 ' + r.comparisons + '회', w - padX, y0 + 13);

        var barTop = y0 + 19;
        var barBottom = y0 + rowH - 3;
        var slot = (w - padX * 2) / N;
        var barW = Math.max(1, slot * 0.7);
        var maxH = barBottom - barTop;

        for (var idx = 0; idx < N; idx++) {
          var v = values[idx];
          var bh = (v / N) * maxH;
          var x = padX + idx * slot + (slot - barW) / 2;
          var y = barBottom - bh;

          var color;
          if (idx === r.found) color = P.coral;
          else if (idx === r.idx && !r.done) color = P.blue;
          else if (idx < r.idx) color = P.line;
          else color = P.neutral;

          ctx.fillStyle = color;
          ctx.fillRect(x, y, barW, bh);
        }
      });
    }

    return {
      stepInterval: 160,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
