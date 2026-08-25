/*
 * viz/dijkstra-vs-bfs.js — [보조] 가중치 미로에서 BFS vs Dijkstra
 * BFS는 칸 수만 세고, Dijkstra는 누적 비용을 본다 → 경로와 총비용이 달라짐
 */
(function () {
  'use strict';

  VizEngine.register('dijkstra-vs-bfs', function (P) {
    var COLS = 15;
    var ROWS = 9;
    var WALL_DENSITY = 0.16;
    var MUD_DENSITY = 0.24;
    var MUD_COST = 5;

    var walls;
    var mud;
    var start;
    var goal;
    var bfs;
    var dij;

    function idx(x, y) {
      return y * COLS + x;
    }

    function neighbors(c) {
      var x = c % COLS;
      var y = Math.floor(c / COLS);
      var out = [];
      if (x > 0) out.push(c - 1);
      if (x < COLS - 1) out.push(c + 1);
      if (y > 0) out.push(c - COLS);
      if (y < ROWS - 1) out.push(c + COLS);
      return out;
    }

    function pathCost(path) {
      var sum = 0;
      for (var k = 0; k < path.length; k++) {
        sum += mud[path[k]] ? MUD_COST : 1;
      }
      return sum;
    }

    function reset() {
      walls = new Uint8Array(COLS * ROWS);
      mud = new Uint8Array(COLS * ROWS);
      for (var c = 0; c < walls.length; c++) {
        walls[c] = Math.random() < WALL_DENSITY ? 1 : 0;
        mud[c] = !walls[c] && Math.random() < MUD_DENSITY ? 1 : 0;
      }
      start = idx(1, Math.floor(ROWS / 2));
      goal = idx(COLS - 2, Math.floor(ROWS / 2));
      [start, goal].forEach(function (s) {
        walls[s] = 0;
        mud[s] = 0;
        neighbors(s).forEach(function (n) {
          walls[n] = 0;
        });
      });

      bfs = {
        state: new Uint8Array(COLS * ROWS),
        q: [start],
        head: 0,
        cameFrom: new Int32Array(COLS * ROWS).fill(-1),
        path: null,
        cost: 0,
        done: false
      };
      dij = {
        state: new Uint8Array(COLS * ROWS),
        dist: new Array(COLS * ROWS).fill(Infinity),
        cameFrom: new Int32Array(COLS * ROWS).fill(-1),
        path: null,
        cost: 0,
        done: false
      };
      bfs.state[start] = 1;
      dij.state[start] = 1;
      dij.dist[start] = 0;
    }

    function trace(cameFrom) {
      var path = [];
      var c = goal;
      while (c !== -1) {
        path.push(c);
        c = cameFrom[c];
      }
      return path.reverse();
    }

    function bfsStep() {
      if (bfs.done) return;
      if (bfs.head >= bfs.q.length) {
        bfs.path = bfs.cameFrom[goal] !== -1 ? trace(bfs.cameFrom) : [];
        bfs.cost = pathCost(bfs.path);
        bfs.done = true;
        return;
      }
      var cur = bfs.q[bfs.head++];
      bfs.state[cur] = 2;
      if (cur === goal) {
        bfs.head = bfs.q.length;
        return;
      }
      var ns = neighbors(cur);
      for (var k = 0; k < ns.length; k++) {
        var n = ns[k];
        if (!walls[n] && bfs.state[n] === 0) {
          bfs.state[n] = 1;
          bfs.cameFrom[n] = cur;
          bfs.q.push(n);
        }
      }
    }

    function dijStep() {
      if (dij.done) return;
      var cur = -1;
      for (var c = 0; c < dij.dist.length; c++) {
        if (dij.state[c] === 1 && (cur === -1 || dij.dist[c] < dij.dist[cur])) cur = c;
      }
      if (cur === -1) {
        dij.path = dij.cameFrom[goal] !== -1 ? trace(dij.cameFrom) : [];
        dij.cost = pathCost(dij.path);
        dij.done = true;
        return;
      }
      dij.state[cur] = 2;
      if (cur === goal) {
        dij.path = trace(dij.cameFrom);
        dij.cost = pathCost(dij.path);
        dij.done = true;
        return;
      }
      var ns = neighbors(cur);
      for (var k = 0; k < ns.length; k++) {
        var n = ns[k];
        if (walls[n] || dij.state[n] === 2) continue;
        var nd = dij.dist[cur] + (mud[n] ? MUD_COST : 1);
        if (nd < dij.dist[n]) {
          dij.dist[n] = nd;
          dij.cameFrom[n] = cur;
          dij.state[n] = 1;
        }
      }
    }

    function step() {
      bfsStep();
      dijStep();
      return bfs.done && dij.done;
    }

    function drawGrid(ctx, s, ox, oy, gw, gh, label) {
      ctx.fillStyle = P.muted;
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(label, ox, oy - 6);
      if (s.done && s.path) {
        ctx.textAlign = 'right';
        ctx.fillText('비용 ' + s.cost, ox + gw, oy - 6);
      }

      var cell = Math.min(gw / COLS, gh / ROWS);
      var gx = ox + (gw - cell * COLS) / 2;
      var gy = oy + (gh - cell * ROWS) / 2;
      var gap = Math.max(1, cell * 0.12);
      var size = cell - gap;

      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          var c = idx(x, y);
          var px = gx + x * cell + gap / 2;
          var py = gy + y * cell + gap / 2;

          var color = null;
          if (walls[c]) color = P.ink;
          else if (c === start || c === goal) color = P.ink;
          else if (s.path && s.path.indexOf(c) !== -1) color = P.coral;
          else if (s.state[c] === 2) color = P.blue;
          else if (s.state[c] === 1) color = P.sage;
          else if (mud[c]) color = P.amber;

          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(px, py, size, size);
          } else {
            ctx.strokeStyle = P.line;
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
          }
        }
      }
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var labelH = 20;
      var half = w / 2;
      drawGrid(ctx, bfs, 0, labelH, half, h - labelH, 'BFS (칸 수 기준)');
      drawGrid(ctx, dij, half, labelH, half, h - labelH, 'Dijkstra (비용 기준)');
    }

    return {
      stepInterval: 90,
      holdTime: 2400,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
