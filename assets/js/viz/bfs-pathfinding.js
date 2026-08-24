/*
 * viz/bfs-pathfinding.js — BFS 경로 탐색 격자 시각화
 * 색 언어: 탐색 파면(frontier) = sage, 방문 = blue, 최단 경로 = coral, 벽 = ink
 */
(function () {
  'use strict';

  VizEngine.register('bfs-pathfinding', function (P) {
    var COLS = 26;
    var ROWS = 16;
    var WALL_DENSITY = 0.24;

    var walls; // Uint8Array
    var state; // 0=미방문 1=frontier 2=visited
    var cameFrom; // Int32Array, 인덱스
    var queue;
    var qHead;
    var start;
    var goal;
    var phase; // 'search' | 'path'
    var path;
    var pathIndex;
    var lastCell; // 가장 최근에 처리된 칸 (변화 강조용)

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

    function solvable() {
      var seen = new Uint8Array(COLS * ROWS);
      var q = [start];
      seen[start] = 1;
      while (q.length) {
        var c = q.pop();
        if (c === goal) return true;
        var ns = neighbors(c);
        for (var k = 0; k < ns.length; k++) {
          var n = ns[k];
          if (!walls[n] && !seen[n]) {
            seen[n] = 1;
            q.push(n);
          }
        }
      }
      return false;
    }

    function reset() {
      start = idx(1, 1);
      goal = idx(COLS - 2, ROWS - 2);
      do {
        walls = new Uint8Array(COLS * ROWS);
        for (var c = 0; c < walls.length; c++) {
          walls[c] = Math.random() < WALL_DENSITY ? 1 : 0;
        }
        // 시작/목표 주변은 항상 열어둠
        for (var y = 0; y < 3; y++) {
          for (var x = 0; x < 3; x++) walls[idx(x, y)] = 0;
        }
        for (var y2 = ROWS - 3; y2 < ROWS; y2++) {
          for (var x2 = COLS - 3; x2 < COLS; x2++) walls[idx(x2, y2)] = 0;
        }
      } while (!solvable());

      state = new Uint8Array(COLS * ROWS);
      cameFrom = new Int32Array(COLS * ROWS).fill(-1);
      queue = [start];
      qHead = 0;
      state[start] = 1;
      phase = 'search';
      path = [];
      pathIndex = 0;
      lastCell = -1;
    }

    function step() {
      if (phase === 'search') {
        for (var k = 0; k < 3; k++) {
          if (qHead >= queue.length) {
            // 탐색 종료: 경로 역추적
            if (cameFrom[goal] !== -1 || goal === start) {
              var c = goal;
              while (c !== -1) {
                path.push(c);
                c = cameFrom[c];
              }
              path.reverse();
              phase = 'path';
              return false;
            }
            return true;
          }
          var cur = queue[qHead++];
          if (state[cur] === 2) continue;
          state[cur] = 2;
          lastCell = cur;
          if (cur === goal) {
            qHead = queue.length;
            break;
          }
          var ns = neighbors(cur);
          for (var m = 0; m < ns.length; m++) {
            var n = ns[m];
            if (!walls[n] && state[n] === 0) {
              state[n] = 1;
              cameFrom[n] = cur;
              queue.push(n);
            }
          }
        }
        return false;
      }
      // phase === 'path': 경로를 한 칸씩 점등
      pathIndex++;
      return pathIndex >= path.length;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var cell = Math.min(w / COLS, h / ROWS);
      var ox = (w - cell * COLS) / 2;
      var oy = (h - cell * ROWS) / 2;
      var gap = Math.max(1, cell * 0.12);
      var size = cell - gap;

      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          var c = idx(x, y);
          var px = ox + x * cell + gap / 2;
          var py = oy + y * cell + gap / 2;

          var color = null;
          if (walls[c]) color = P.ink;
          else if (c === start || c === goal) color = P.ink;
          else if (phase === 'path' && path.indexOf(c) !== -1 && path.indexOf(c) < pathIndex) color = P.coral;
          else if (state[c] === 2) color = P.blue;
          else if (state[c] === 1) color = P.sage;

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

      // 가장 최근에 처리된 칸에 밝은 점 (변화 추적용)
      var hot = phase === 'search' ? lastCell : pathIndex > 0 ? path[pathIndex - 1] : -1;
      if (hot !== -1 && hot !== undefined && !walls[hot]) {
        var hx = ox + (hot % COLS) * cell + cell / 2;
        var hy = oy + Math.floor(hot / COLS) * cell + cell / 2;
        ctx.fillStyle = P.paper;
        ctx.beginPath();
        ctx.arc(hx, hy, Math.max(1.5, size * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return {
      stepInterval: 70,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
