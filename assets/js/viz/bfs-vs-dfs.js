/*
 * viz/bfs-vs-dfs.js — [보조] 같은 미로에서 BFS vs DFS 탐색 순서 비교
 * 색 언어: 파면 = sage, 방문 = blue, 벽/시작 = ink
 */
(function () {
  'use strict';

  VizEngine.register('bfs-vs-dfs', function (P) {
    var COLS = 15;
    var ROWS = 9;
    var DENSITY = 0.22;

    var walls;
    var start;
    var bfs;
    var dfs;

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

    function reset() {
      walls = new Uint8Array(COLS * ROWS);
      for (var c = 0; c < walls.length; c++) {
        walls[c] = Math.random() < DENSITY ? 1 : 0;
      }
      start = idx(Math.floor(COLS / 2), Math.floor(ROWS / 2));
      // 시작점 주변은 열어둠
      neighbors(start).forEach(function (n) {
        walls[n] = 0;
      });
      walls[start] = 0;

      bfs = { state: new Uint8Array(COLS * ROWS), list: [start], head: 0, done: false };
      dfs = { state: new Uint8Array(COLS * ROWS), list: [start], done: false };
      bfs.state[start] = 1;
      dfs.state[start] = 1;
    }

    function stepOnce(s, isBfs) {
      if (s.done) return;
      var cur;
      if (isBfs) {
        if (s.head >= s.list.length) {
          s.done = true;
          return;
        }
        cur = s.list[s.head++];
      } else {
        if (!s.list.length) {
          s.done = true;
          return;
        }
        cur = s.list.pop();
      }
      s.state[cur] = 2;
      var ns = neighbors(cur);
      for (var k = 0; k < ns.length; k++) {
        var n = ns[k];
        if (!walls[n] && s.state[n] === 0) {
          s.state[n] = 1;
          if (isBfs) s.list.push(n);
          else s.list.push(n);
        }
      }
    }

    function step() {
      stepOnce(bfs, true);
      stepOnce(dfs, false);
      return bfs.done && dfs.done;
    }

    function drawGrid(ctx, s, ox, oy, gw, gh, label) {
      ctx.fillStyle = P.muted;
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(label, ox, oy - 6);

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
          else if (c === start) color = P.coral;
          else if (s.state[c] === 2) color = P.blue;
          else if (s.state[c] === 1) color = P.sage;

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
      drawGrid(ctx, bfs, 0, labelH, half, h - labelH, 'BFS');
      drawGrid(ctx, dfs, half, labelH, half, h - labelH, 'DFS');
    }

    return {
      stepInterval: 90,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
