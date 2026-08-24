/*
 * viz/dfs-graph.js — DFS 그래프 순회 시각화
 * 색 언어: 현재 노드 = coral, 방문 완료 = blue, 순회에 사용된 간선 = ink, 미방문 = paper/line
 */
(function () {
  'use strict';

  VizEngine.register('dfs-graph', function (P) {
    // 노드 위치 (0~1 상대 좌표)
    var nodes = [
      [0.08, 0.5],
      [0.24, 0.18],
      [0.24, 0.82],
      [0.44, 0.08],
      [0.44, 0.5],
      [0.44, 0.92],
      [0.64, 0.3],
      [0.64, 0.7],
      [0.84, 0.12],
      [0.84, 0.5]
    ];
    var edges = [
      [0, 1], [0, 2],
      [1, 3], [1, 4],
      [2, 4], [2, 5],
      [3, 6],
      [4, 6], [4, 7],
      [5, 7],
      [6, 8], [6, 9],
      [7, 9],
      [8, 9]
    ];

    var order; // DFS 방문 순서 [{n, from}]
    var idx; // 공개 포인터
    var visited;
    var treeEdges; // 순회에 사용된 간선 "a-b"

    function shuffle(list) {
      for (var k = list.length - 1; k > 0; k--) {
        var r = Math.floor(Math.random() * (k + 1));
        var t = list[k];
        list[k] = list[r];
        list[r] = t;
      }
    }

    function computeOrder() {
      var adj = nodes.map(function () {
        return [];
      });
      edges.forEach(function (e) {
        adj[e[0]].push(e[1]);
        adj[e[1]].push(e[0]);
      });
      adj.forEach(shuffle);

      order = [];
      var seen = new Array(nodes.length).fill(false);
      var stack = [0];
      seen[0] = true;
      order.push({ n: 0, from: -1 });
      while (stack.length) {
        var cur = stack[stack.length - 1];
        var next = -1;
        for (var k = 0; k < adj[cur].length; k++) {
          if (!seen[adj[cur][k]]) {
            next = adj[cur][k];
            break;
          }
        }
        if (next === -1) {
          stack.pop();
          continue;
        }
        seen[next] = true;
        order.push({ n: next, from: cur });
        stack.push(next);
      }
    }

    function reset() {
      computeOrder();
      idx = 0;
      visited = new Array(nodes.length).fill(false);
      treeEdges = {};
    }

    function step() {
      if (idx >= order.length) return true;
      var item = order[idx];
      visited[item.n] = true;
      if (item.from !== -1) {
        var a = Math.min(item.from, item.n);
        var b = Math.max(item.from, item.n);
        treeEdges[a + '-' + b] = true;
      }
      idx++;
      return idx >= order.length;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var padX = w * 0.07;
      var padY = h * 0.1;
      var r = Math.max(8, Math.min(w, h) * 0.045);

      function px(i) {
        return padX + nodes[i][0] * (w - padX * 2);
      }
      function py(i) {
        return padY + nodes[i][1] * (h - padY * 2);
      }

      // 간선
      edges.forEach(function (e) {
        var a = Math.min(e[0], e[1]);
        var b = Math.max(e[0], e[1]);
        var used = treeEdges[a + '-' + b];
        ctx.strokeStyle = used ? P.ink : P.line;
        ctx.lineWidth = used ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(px(e[0]), py(e[0]));
        ctx.lineTo(px(e[1]), py(e[1]));
        ctx.stroke();
      });

      // 노드
      var current = idx > 0 && idx <= order.length ? order[idx - 1].n : -1;
      for (var i = 0; i < nodes.length; i++) {
        var x = px(i);
        var y = py(i);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (i === current) {
          ctx.fillStyle = P.coral;
        } else if (visited[i]) {
          ctx.fillStyle = P.blue;
        } else {
          ctx.fillStyle = P.paper;
        }
        ctx.fill();
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 노드 번호
        ctx.fillStyle = visited[i] || i === current ? P.paper : P.ink;
        ctx.font = '500 ' + Math.round(r * 0.9) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i), x, y + 0.5);
      }
    }

    return {
      stepInterval: 380,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
