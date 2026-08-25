/*
 * viz/heap-sort-heapify.js — sift-down 확대 (보조 캔버스)
 * 힙 성질이 깨진 루트가 자식 중 큰 값과 자리를 바꾸며 가라앉는 과정만 크게.
 * 색 언어: 비교 중 = blue, 가라앉는 노드 = coral 링, 정상 = neutral
 */
(function () {
  'use strict';

  VizEngine.register('heap-sort-heapify', function (P) {
    var N = 7; // 3레벨 완전이진트리
    var initial = [2, 9, 8, 5, 6, 7, 4]; // 루트만 힙 성질 위반
    var values = [];
    var events = [];
    var evIdx;
    var siftIdx;
    var cmpA, cmpB;

    function buildEvents() {
      events = [];
      var a = values.slice();
      var root = 0;
      while (true) {
        var child = root * 2 + 1;
        if (child >= N) break;
        events.push({ type: 'sift', idx: root });
        if (child + 1 < N) {
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

    function reset() {
      values = initial.slice();
      buildEvents();
      evIdx = 0;
      siftIdx = -1;
      cmpA = -1;
      cmpB = -1;
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
      } else {
        var t = values[e.a];
        values[e.a] = values[e.b];
        values[e.b] = t;
        cmpA = e.a;
        cmpB = e.b;
      }
      return evIdx >= events.length;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);

      var levels = 3;
      var padX = w * 0.07;
      var treeW = w - padX * 2;
      var treeTop = h * 0.08;
      var treeH = h * 0.78;
      var levelH = treeH / levels;
      var r = Math.min(levelH * 0.32, treeW / 4 / 2.6);

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
        var from = pos(i);
        var l = i * 2 + 1;
        var rr = i * 2 + 2;
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
        var color = n === cmpA || n === cmpB ? P.blue : P.neutral;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();

        if (n === siftIdx) {
          ctx.strokeStyle = P.coral;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(c.x, c.y, r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = P.ink;
        ctx.font = '500 ' + Math.round(r * 0.8) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(values[n]), c.x, c.y + 0.5);
      }
    }

    return {
      stepInterval: 380,
      holdTime: 1800,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
