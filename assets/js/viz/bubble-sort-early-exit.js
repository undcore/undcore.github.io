/*
 * viz/bubble-sort-early-exit.js — [보조] 거의 정렬된 입력에서 조기 종료 유무 비교
 */
(function () {
  'use strict';

  VizEngine.register('bubble-sort-early-exit', function (P) {
    var N = 13;
    var noExit;
    var early;

    function reset() {
      var base = [];
      for (var k = 0; k < N; k++) base.push(k + 1);
      // 두 곳만 뒤섞인 거의 정렬된 입력
      var t1 = base[3];
      base[3] = base[4];
      base[4] = t1;
      var t2 = base[8];
      base[8] = base[9];
      base[9] = t2;

      noExit = { values: base.slice(), end: N - 1, j: 0, passes: 0, done: false };
      early = { values: base.slice(), end: N - 1, j: 0, swapped: false, passes: 0, done: false };
    }

    function noExitStep(s) {
      if (s.done) return;
      if (s.end <= 0) {
        s.done = true;
        return;
      }
      if (s.j >= s.end) {
        s.end--;
        s.j = 0;
        s.passes++;
        if (s.end <= 0) s.done = true;
        return;
      }
      if (s.values[s.j] > s.values[s.j + 1]) {
        var t = s.values[s.j];
        s.values[s.j] = s.values[s.j + 1];
        s.values[s.j + 1] = t;
      }
      s.j++;
    }

    function earlyStep(s) {
      if (s.done) return;
      if (s.end <= 0) {
        s.done = true;
        return;
      }
      if (s.j >= s.end) {
        s.passes++;
        if (!s.swapped) {
          s.done = true; // 교환 없음 → 정렬 완료
          return;
        }
        s.swapped = false;
        s.end--;
        s.j = 0;
        return;
      }
      if (s.values[s.j] > s.values[s.j + 1]) {
        var t = s.values[s.j];
        s.values[s.j] = s.values[s.j + 1];
        s.values[s.j + 1] = t;
        s.swapped = true;
      }
      s.j++;
    }

    function step() {
      noExitStep(noExit);
      earlyStep(early);
      return noExit.done && early.done;
    }

    function drawRow(ctx, w, s, y0, rowH, label) {
      var padX = w * 0.04;
      ctx.fillStyle = P.muted;
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(label, padX, y0 + 13);
      ctx.textAlign = 'right';
      ctx.fillText('패스 ' + s.passes + '회', w - padX, y0 + 13);

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

        var color = P.neutral;
        if (s.done || idx > s.end) color = P.sage;
        else if (idx === s.j) color = P.blue;
        else if (idx === s.j + 1) color = P.coral;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barW, bh);
      }
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var rowH = h / 2;
      drawRow(ctx, w, noExit, 0, rowH, '조기 종료 없음');
      drawRow(ctx, w, early, rowH, rowH, '조기 종료 있음');
    }

    return {
      stepInterval: 100,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
