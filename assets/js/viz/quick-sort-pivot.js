/*
 * viz/quick-sort-pivot.js — [보조] 피벗 선택과 입력 상태에 따른 비교 횟수
 * 위: 무작위 입력 (평균 O(n log n)) / 아래: 정렬된 입력 + 끝 원소 피벗 (최악 O(n²))
 */
(function () {
  'use strict';

  VizEngine.register('quick-sort-pivot', function (P) {
    var N = 15;
    var top;
    var bottom;

    // 퀵 정렬을 이벤트 열로 변환 (compare/swap/placed)
    function buildEvents(src) {
      var a = src.slice();
      var events = [];

      function qsort(lo, hi) {
        if (lo > hi) return;
        if (lo === hi) {
          events.push({ type: 'placed', idx: lo });
          return;
        }
        var pivot = a[hi];
        var i = lo;
        for (var j = lo; j < hi; j++) {
          events.push({ type: 'compare', idx: j });
          if (a[j] < pivot) {
            if (i !== j) events.push({ type: 'swap', a: i, b: j });
            var t = a[i];
            a[i] = a[j];
            a[j] = t;
            i++;
          }
        }
        if (i !== hi) events.push({ type: 'swap', a: i, b: hi });
        var t2 = a[i];
        a[i] = a[hi];
        a[hi] = t2;
        events.push({ type: 'placed', idx: i });
        qsort(lo, i - 1);
        qsort(i + 1, hi);
      }

      qsort(0, N - 1);
      return events;
    }

    function makeRunner(src) {
      return {
        values: src.slice(),
        events: buildEvents(src),
        evIdx: 0,
        comparisons: 0,
        placed: new Array(N).fill(false),
        compareIdx: -1,
        done: false
      };
    }

    function runnerStep(r) {
      if (r.done) return;
      if (r.evIdx >= r.events.length) {
        r.done = true;
        return;
      }
      var e = r.events[r.evIdx++];
      if (e.type === 'compare') {
        r.comparisons++;
        r.compareIdx = e.idx;
      } else if (e.type === 'swap') {
        var t = r.values[e.a];
        r.values[e.a] = r.values[e.b];
        r.values[e.b] = t;
      } else {
        r.placed[e.idx] = true;
        r.compareIdx = -1;
      }
      if (r.evIdx >= r.events.length) r.done = true;
    }

    function reset() {
      var shuffled = [];
      for (var k = 0; k < N; k++) shuffled.push(k + 1);
      for (var k2 = N - 1; k2 > 0; k2--) {
        var r = Math.floor(Math.random() * (k2 + 1));
        var t = shuffled[k2];
        shuffled[k2] = shuffled[r];
        shuffled[r] = t;
      }
      var sorted = [];
      for (var k3 = 1; k3 <= N; k3++) sorted.push(k3);

      top = makeRunner(shuffled);
      bottom = makeRunner(sorted);
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
      ctx.textAlign = 'right';
      ctx.fillText('비교 ' + r.comparisons + '회', w - padX, y0 + 13);

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
        if (r.placed[idx] || r.done) color = P.sage;
        if (!r.done && idx === r.compareIdx) color = P.blue;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barW, bh);
      }
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var rowH = h / 2;
      drawRow(ctx, w, top, 0, rowH, '무작위 입력');
      drawRow(ctx, w, bottom, rowH, rowH, '정렬된 입력 + 끝 원소 피벗 (최악)');
    }

    return {
      stepInterval: 130,
      holdTime: 2400,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
