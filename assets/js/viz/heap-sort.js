/*
 * viz/heap-sort.js — 힙 정렬 시각화 (최대 힙 트리 + 배열 막대, 이벤트 재생)
 * 색 언어: 확정(정렬됨) = sage, 추출 중인 루트 = coral, 비교 중 = blue,
 *          sift 중인 현재 노드 = coral 링, 힙 내부 = neutral
 */
(function () {
  'use strict';

  VizEngine.register('heap-sort', function (P) {
    var N = 15; // 4레벨 완전이진트리
    var initial = [];
    var values = [];
    var events = [];
    var evIdx;
    var sorted;      // 확정 여부
    var siftIdx;     // 현재 가라앉는 중인 노드
    var cmpA, cmpB;  // 비교 중인 두 노드
    var extractIdx;  // 추출 중인 루트

    function siftEvents(a, start, end) {
      var root = start;
      while (true) {
        var child = root * 2 + 1;
        if (child >= end) break;
        events.push({ type: 'sift', idx: root });
        if (child + 1 < end) {
          events.push({ type: 'compare', a: child, b: child + 1 });
          if (a[child + 1] > a[child]) child++;
        }
        events.push({ type: 'compare', a: root, b: child });
        if (a[root] < a[child]) {
          events.push({ type: 'swap', a: root, b: child });
          var t = a[root];
          a[root] = a[child];
          a[child] = t;
          root = child;
        } else {
          break;
        }
      }
    }

    function buildEvents() {
      events = [];
      var a = values.slice();
      var i;
      // 힙 만들기 (heapify)
      for (i = Math.floor(N / 2) - 1; i >= 0; i--) siftEvents(a, i, N);
      // 루트 추출 → 뒤에서부터 확정
      for (var end = N - 1; end > 0; end--) {
        events.push({ type: 'extract', idx: 0 });
        events.push({ type: 'swap', a: 0, b: end });
        var t = a[0];
        a[0] = a[end];
        a[end] = t;
        events.push({ type: 'sorted', idx: end });
        siftEvents(a, 0, end);
      }
      events.push({ type: 'sorted', idx: 0 });
    }

    function reset() {
      if (!initial.length) {
        initial = [];
        for (var k = 0; k < N; k++) initial.push(k + 1);
        for (var k2 = N - 1; k2 > 0; k2--) {
          var r = Math.floor(Math.random() * (k2 + 1));
          var t = initial[k2];
          initial[k2] = initial[r];
          initial[r] = t;
        }
      }
      values = initial.slice();
      buildEvents();
      evIdx = 0;
      sorted = new Array(N).fill(false);
      siftIdx = -1;
      cmpA = -1;
      cmpB = -1;
      extractIdx = -1;
    }

    function step() {
      if (evIdx >= events.length) return true;
      var e = events[evIdx++];
      if (e.type === 'sift') {
        siftIdx = e.idx;
        cmpA = -1;
        cmpB = -1;
      } else if (e.type === 'compare') {
        cmpA = e.a;
        cmpB = e.b;
      } else if (e.type === 'swap') {
        var t = values[e.a];
        values[e.a] = values[e.b];
        values[e.b] = t;
        cmpA = e.a;
        cmpB = e.b;
      } else if (e.type === 'extract') {
        extractIdx = e.idx;
        siftIdx = -1;
        cmpA = -1;
        cmpB = -1;
      } else {
        sorted[e.idx] = true;
        extractIdx = -1;
        siftIdx = -1;
        cmpA = -1;
        cmpB = -1;
      }
      return evIdx >= events.length;
    }

    function nodeColor(idx) {
      if (sorted[idx]) return P.sage;
      if (idx === extractIdx) return P.coral;
      if (idx === cmpA || idx === cmpB) return P.blue;
      return P.neutral;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);

      // --- 트리 영역 (위쪽) ---
      var treeTop = h * 0.04;
      var treeH = h * 0.66;
      var levels = 4;
      var levelH = treeH / levels;
      var padX = w * 0.05;
      var treeW = w - padX * 2;
      var r = Math.min(levelH * 0.3, treeW / 8 / 2.4);

      function pos(idx) {
        var d = Math.floor(Math.log2(idx + 1));
        var p = idx - (Math.pow(2, d) - 1);
        var count = Math.pow(2, d);
        return {
          x: padX + ((p + 0.5) / count) * treeW,
          y: treeTop + levelH * (d + 0.5)
        };
      }

      // 간선
      ctx.strokeStyle = P.line;
      ctx.lineWidth = 1;
      for (var i = 0; i < N; i++) {
        var l = i * 2 + 1;
        var rr = i * 2 + 2;
        var from = pos(i);
        if (l < N) {
          var tl = pos(l);
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(tl.x, tl.y);
          ctx.stroke();
        }
        if (rr < N) {
          var tr = pos(rr);
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(tr.x, tr.y);
          ctx.stroke();
        }
      }

      // 노드
      for (var n = 0; n < N; n++) {
        var c = pos(n);
        ctx.fillStyle = nodeColor(n);
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();

        // sift 중인 노드는 coral 링으로 표시
        if (n === siftIdx) {
          ctx.strokeStyle = P.coral;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(c.x, c.y, r + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = P.ink;
        ctx.font = '500 ' + Math.round(r * 0.85) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(values[n]), c.x, c.y + 0.5);
      }

      // --- 배열 막대 (아래쪽) ---
      var padBottom = h * 0.05;
      var barTop = h * 0.78;
      var maxBarH = h - barTop - padBottom;
      var slot = (w - padX * 2) / N;
      var barW = Math.max(1, slot * 0.7);

      for (var idx = 0; idx < N; idx++) {
        var bh = (values[idx] / N) * maxBarH;
        var hot = idx === extractIdx || idx === cmpA || idx === cmpB;
        var bw = hot ? slot * 0.98 : barW;
        var bx = padX + idx * slot + (slot - bw) / 2;
        ctx.fillStyle = nodeColor(idx);
        ctx.fillRect(bx, h - padBottom - bh, bw, bh);
      }
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
