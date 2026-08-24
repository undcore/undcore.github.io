/*
 * viz/merge-sort.js — 병합 정렬 막대 시각화
 * 색 언어: 병합 중인 구간 = blue, 방금 쓴 위치 = coral, 병합 완료 구간 = sage, 기본 = neutral
 * 리셋 시 병합 정렬을 미리 실행해 이벤트 열을 만들고, 스텝마다 하나씩 재생
 */
(function () {
  'use strict';

  VizEngine.register('merge-sort', function (P) {
    var N = 26;
    var values = [];
    var events = [];
    var evIdx;
    var range; // 병합 중인 구간 [lo, hi)
    var writeIdx; // 방금 값을 쓴 위치
    var mergedRange; // 직전에 병합 완료된 구간 [lo, hi)

    function buildEvents() {
      events = [];
      var a = values.slice();

      function msort(lo, hi) {
        if (hi - lo <= 1) return;
        var mid = (lo + hi) >> 1;
        msort(lo, mid);
        msort(mid, hi);
        events.push({ type: 'begin', lo: lo, hi: hi });
        var buf = [];
        var i = lo;
        var j = mid;
        while (i < mid && j < hi) {
          if (a[i] <= a[j]) buf.push(a[i++]);
          else buf.push(a[j++]);
        }
        while (i < mid) buf.push(a[i++]);
        while (j < hi) buf.push(a[j++]);
        for (var k = 0; k < buf.length; k++) {
          a[lo + k] = buf[k];
          events.push({ type: 'write', idx: lo + k, value: buf[k] });
        }
        events.push({ type: 'merged', lo: lo, hi: hi });
      }

      msort(0, N);
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
      writeIdx = -1;
      mergedRange = null;
    }

    function step() {
      if (evIdx >= events.length) return true;
      var e = events[evIdx++];
      if (e.type === 'begin') {
        range = [e.lo, e.hi];
        writeIdx = -1;
        mergedRange = null;
      } else if (e.type === 'write') {
        values[e.idx] = e.value;
        writeIdx = e.idx;
      } else {
        mergedRange = [e.lo, e.hi];
        range = null;
        writeIdx = -1;
      }
      return evIdx >= events.length;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var padX = w * 0.04;
      var padTop = h * 0.08;
      var padBottom = h * 0.06;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.72);
      var maxH = h - padTop - padBottom;

      for (var idx = 0; idx < N; idx++) {
        var v = values[idx];
        var bh = (v / N) * maxH;
        var x = padX + idx * slot + (slot - barW) / 2;
        var y = h - padBottom - bh;

        var color = P.neutral;
        if (mergedRange && idx >= mergedRange[0] && idx < mergedRange[1]) color = P.sage;
        if (range && idx >= range[0] && idx < range[1]) color = P.blue;
        if (idx === writeIdx) color = P.coral;

        // 방금 값이 쓰인 막대는 전체 폭으로 강조
        var hot = idx === writeIdx;
        var bw = hot ? slot * 0.98 : barW;
        var bx = hot ? padX + idx * slot + (slot - bw) / 2 : x;

        ctx.fillStyle = color;
        ctx.fillRect(bx, y, bw, bh);
      }

      // 쓰기 위치 마커 (윗쪽 다이아몬드)
      if (writeIdx !== -1) {
        var mx = padX + writeIdx * slot + slot / 2;
        var my = padTop * 0.4;
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
      stepInterval: 55,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
