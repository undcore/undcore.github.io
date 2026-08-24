/*
 * viz/insertion-sort-cases.js — [보조] 삽입 정렬: 입력 상태에 따른 비교 횟수
 * 위: 거의 정렬된 입력 / 아래: 역순 입력, 같은 속도로 돌려 비교 횟수 차이를 보여줌
 */
(function () {
  'use strict';

  VizEngine.register('insertion-sort-cases', function (P) {
    var N = 13;
    var top;
    var bottom;

    function makeRunner(values) {
      return { values: values, i: 1, j: -1, key: null, comparisons: 0, done: false };
    }

    function runnerStep(r) {
      if (r.done) return;
      if (r.i >= N) {
        r.done = true;
        return;
      }
      if (r.key === null) {
        r.key = r.values[r.i];
        r.j = r.i - 1;
        return;
      }
      if (r.j >= 0) {
        r.comparisons++;
        if (r.values[r.j] > r.key) {
          r.values[r.j + 1] = r.values[r.j];
          r.j--;
          return;
        }
      }
      r.values[r.j + 1] = r.key;
      r.key = null;
      r.i++;
      if (r.i >= N) r.done = true;
    }

    function reset() {
      var nearly = [];
      for (var k = 0; k < N; k++) nearly.push(k + 1);
      // 두 곳만 뒤섞인 거의 정렬된 입력
      var t1 = nearly[3];
      nearly[3] = nearly[4];
      nearly[4] = t1;
      var t2 = nearly[8];
      nearly[8] = nearly[9];
      nearly[9] = t2;

      var reversed = [];
      for (var k2 = N; k2 >= 1; k2--) reversed.push(k2);

      top = makeRunner(nearly);
      bottom = makeRunner(reversed);
    }

    function step() {
      runnerStep(top);
      runnerStep(bottom);
      return top.done && bottom.done;
    }

    function drawRow(ctx, w, r, y0, rowH, label) {
      var padX = w * 0.04;
      ctx.fillStyle = P.muted;
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(label, padX, y0 + 13);

      var counter = '비교 ' + r.comparisons + '회';
      ctx.textAlign = 'right';
      ctx.fillText(counter, w - padX, y0 + 13);

      var barTop = y0 + 20;
      var barBottom = y0 + rowH - 4;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.7);
      var maxH = barBottom - barTop;

      for (var idx = 0; idx < N; idx++) {
        var v = r.values[idx];
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = barBottom - bh;

        var color = P.neutral;
        if (r.done || idx < r.i) color = P.sage;
        if (!r.done && r.key !== null && idx === r.j) color = P.blue;
        if (!r.done && r.key !== null && idx === r.j + 1) color = P.coral;

        // 활성 막대는 전체 폭으로 강조
        var hot = !r.done && r.key !== null && idx === r.j + 1;
        var bw = hot ? slot * 0.98 : barW;
        var bx = hot ? padX + idx * slot + (slot - bw) / 2 : x;

        ctx.fillStyle = color;
        ctx.fillRect(bx, y, bw, bh);
      }
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var rowH = h / 2;
      drawRow(ctx, w, top, 0, rowH, '거의 정렬된 입력');
      drawRow(ctx, w, bottom, rowH, rowH, '역순 입력');
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
