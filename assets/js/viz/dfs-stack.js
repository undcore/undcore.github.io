/*
 * viz/dfs-stack.js — [보조] DFS 진행에 따른 스택의 push/pop
 * 왼쪽: 7노드 트리 / 오른쪽: 스택 칸 (새로 쌓인 칸 = coral)
 */
(function () {
  'use strict';

  VizEngine.register('dfs-stack', function (P) {
    // 왼쪽 그래프 영역 기준 상대 좌표 (0~1)
    var nodes = [
      [0.5, 0.1],
      [0.28, 0.42],
      [0.72, 0.42],
      [0.14, 0.8],
      [0.42, 0.8],
      [0.6, 0.8],
      [0.88, 0.8]
    ];
    var edges = [
      [0, 1], [0, 2],
      [1, 3], [1, 4],
      [2, 5], [2, 6]
    ];
    var children = [
      [1, 2],
      [3, 4],
      [5, 6],
      [], [], [], []
    ];

    var events; // [{type:'push'|'pop'|'visit', n}]
    var evIdx;
    var stack;
    var visited;
    var current;
    var lastPush;

    function buildEvents() {
      events = [];
      var kids = children.map(function (list) {
        var c = list.slice();
        for (var k = c.length - 1; k > 0; k--) {
          var r = Math.floor(Math.random() * (k + 1));
          var t = c[k];
          c[k] = c[r];
          c[r] = t;
        }
        return c;
      });
      var s = [0];
      events.push({ type: 'push', n: 0 });
      while (s.length) {
        var v = s.pop();
        events.push({ type: 'pop', n: v });
        events.push({ type: 'visit', n: v });
        // 나중에 방문할 자식을 먼저 쌓음 (스택이므로 역순)
        for (var k = kids[v].length - 1; k >= 0; k--) {
          s.push(kids[v][k]);
          events.push({ type: 'push', n: kids[v][k] });
        }
      }
    }

    function reset() {
      buildEvents();
      evIdx = 0;
      stack = [];
      visited = new Array(nodes.length).fill(false);
      current = -1;
      lastPush = -1;
    }

    function step() {
      if (evIdx >= events.length) return true;
      var e = events[evIdx++];
      if (e.type === 'push') {
        stack.push(e.n);
        lastPush = e.n;
      } else if (e.type === 'pop') {
        stack.pop();
        lastPush = -1;
      } else {
        visited[e.n] = true;
        current = e.n;
      }
      return evIdx >= events.length;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var gw = w * 0.58; // 그래프 영역
      var r = Math.max(9, Math.min(gw, h) * 0.05);

      function px(i) {
        return gw * 0.08 + nodes[i][0] * gw * 0.84;
      }
      function py(i) {
        return h * 0.08 + nodes[i][1] * h * 0.84;
      }

      // 간선
      edges.forEach(function (e) {
        var used = visited[e[0]] && visited[e[1]];
        ctx.strokeStyle = used ? P.ink : P.line;
        ctx.lineWidth = used ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(px(e[0]), py(e[0]));
        ctx.lineTo(px(e[1]), py(e[1]));
        ctx.stroke();
      });

      // 노드
      for (var i = 0; i < nodes.length; i++) {
        var x = px(i);
        var y = py(i);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (i === current) ctx.fillStyle = P.coral;
        else if (visited[i]) ctx.fillStyle = P.blue;
        else ctx.fillStyle = P.paper;
        ctx.fill();
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = visited[i] || i === current ? P.paper : P.ink;
        ctx.font = '500 ' + Math.round(r * 0.9) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i), x, y + 0.5);
      }

      // 스택 영역
      var sx = w * 0.72;
      ctx.fillStyle = P.muted;
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('STACK', sx, h * 0.08);

      var box = Math.min(w * 0.16, h * 0.09);
      var baseY = h * 0.9;
      for (var k = 0; k < stack.length; k++) {
        var by = baseY - (k + 1) * (box + 4);
        var isTop = k === stack.length - 1;
        ctx.fillStyle = stack[k] === lastPush ? P.coral : P.sage;
        ctx.fillRect(sx, by, box, box);
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = isTop ? 2 : 1;
        ctx.strokeRect(sx + 0.5, by + 0.5, box - 1, box - 1);

        ctx.fillStyle = P.paper;
        ctx.font = '500 ' + Math.round(box * 0.45) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(stack[k]), sx + box / 2, by + box / 2 + 0.5);
      }
      // 바닥선
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 4, baseY);
      ctx.lineTo(sx + box + 4, baseY);
      ctx.stroke();
    }

    return {
      stepInterval: 300,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
