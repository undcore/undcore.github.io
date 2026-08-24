/*
 * viz/quick-sort.js — 퀵 정렬 막대 시각화 (Lomuto 분할, 이벤트 재생)
 * 색 언어: 확정 = sage, 피벗 = coral, 비교 중 = blue, 현재 분할 구간 = neutral, 구간 밖 = line
 */
(function () {
  'use strict';

  VizEngine.register('quick-sort', function (P) {
    var N = 26;
    var values = [];
    var events = [];
    var evIdx;
    var range; // 현재 분할 구간 [lo, hi]
    var pivotIdx;
    var compareIdx;
    var placed; // 확정된 위치

    function buildEvents() {
      events = [];
      var a = values.slice();

      function qsort(lo, hi) {
        if (lo > hi) return;
        if (lo === hi) {
          events.push({ type: 'placed', idx: lo });
          return;
        }
        var pivot = a[hi];
        events.push({ type: 'range', lo: lo, hi: hi });
        events.push({ type: 'pivot', idx: hi });
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
      buildEvents();
      evIdx = 0;
      range = null;
      pivotIdx = -1;
      compareIdx = -1;
      placed = new Array(N).fill(false);
    }

    function step() {
      if (evIdx >= events.length) return true;
      var e = events[evIdx++];
      if (e.type === 'range') {
        range = [e.lo, e.hi];
      } else if (e.type === 'pivot') {
        pivotIdx = e.idx;
        compareIdx = -1;
      } else if (e.type === 'compare') {
        compareIdx = e.idx;
      } else if (e.type === 'swap') {
        var t = values[e.a];
        values[e.a] = values[e.b];
        values[e.b] = t;
      } else {
        placed[e.idx] = true;
        pivotIdx = -1;
        compareIdx = -1;
      }
      return evIdx >= events.length;
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
        var v = values[idx];
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = h - padBottom - bh;

        var color;
        if (placed[idx]) color = P.sage;
        else if (idx === pivotIdx) color = P.coral;
        else if (idx === compareIdx) color = P.blue;
        else if (range && idx >= range[0] && idx <= range[1]) color = P.neutral;
        else color = P.line;

        // 피벗 / 비교 중 막대는 전체 폭으로 강조
        var hot = idx === pivotIdx || idx === compareIdx;
        var bw = hot ? slot * 0.98 : barW;
        var bx = hot ? padX + idx * slot + (slot - bw) / 2 : x;

        ctx.fillStyle = color;
        ctx.fillRect(bx, y, bw, bh);
      }

      // 피벗 마커 (윗쪽 다이아몬드)
      if (pivotIdx !== -1) {
        var mx = padX + pivotIdx * slot + slot / 2;
        var my = padTop * 0.35;
        ctx.fillStyle = P.coral;
        ctx.beginPath();
        ctx.moveTo(mx, my - 4);
        ctx.lineTo(mx + 4, my);
        ctx.lineTo(mx, my + 4);
        ctx.lineTo(mx - 4, my);
        ctx.closePath();
        ctx.fill();
      }
    }

    return {
      stepInterval: 70,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
