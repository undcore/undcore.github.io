/*
 * viz/merge-sort-tree.js — [보조] 병합 정렬의 분할·병합 트리
 * 8개 원소 기준: 분할은 위에서 아래로, 병합 완료는 아래에서 위로 점등
 */
(function () {
  'use strict';

  VizEngine.register('merge-sort-tree', function (P) {
    var N = 8;
    var nodes; // {lo, hi, depth, slot} — slot은 같은 레벨 내 위치
    var treeEdges; // [parentIdx, childIdx]
    var mergeOrder; // 병합 완료 순서 (후위 순회)
    var idx;

    function build() {
      nodes = [];
      treeEdges = [];
      mergeOrder = [];

      function addNode(lo, hi, depth, slot, parent) {
        var myIdx = nodes.length;
        nodes.push({ lo: lo, hi: hi, depth: depth, slot: slot });
        if (parent !== -1) treeEdges.push([parent, myIdx]);
        if (hi - lo > 1) {
          var mid = (lo + hi) >> 1;
          addNode(lo, mid, depth + 1, slot * 2, myIdx);
          addNode(mid, hi, depth + 1, slot * 2 + 1, myIdx);
        }
        mergeOrder.push(myIdx); // 후위: 자식들 다음에 자신
        return myIdx;
      }

      addNode(0, N, 0, 0, -1);
    }

    function reset() {
      idx = 0;
    }

    build();

    function step() {
      idx++;
      return idx >= mergeOrder.length;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var maxDepth = 3;
      var padTop = h * 0.1;
      var padBottom = h * 0.08;
      var levelH = (h - padTop - padBottom) / maxDepth;

      function nx(node) {
        var count = 1 << node.depth;
        return ((node.slot + 0.5) / count) * w;
      }
      function ny(node) {
        return padTop + node.depth * levelH;
      }

      var revealed = {};
      for (var k = 0; k < idx && k < mergeOrder.length; k++) {
        revealed[mergeOrder[k]] = true;
      }
      var current = idx > 0 && idx <= mergeOrder.length ? mergeOrder[idx - 1] : -1;

      // 간선: 자식이 공개된 경우만
      treeEdges.forEach(function (e) {
        if (!revealed[e[1]]) return;
        ctx.strokeStyle = P.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nx(nodes[e[0]]), ny(nodes[e[0]]));
        ctx.lineTo(nx(nodes[e[1]]), ny(nodes[e[1]]));
        ctx.stroke();
      });

      // 노드
      nodes.forEach(function (node, i) {
        var x = nx(node);
        var y = ny(node);
        var r = Math.min(15, w / (1 << node.depth) * 0.16);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (i === current) ctx.fillStyle = P.coral;
        else if (revealed[i]) ctx.fillStyle = P.sage;
        else ctx.fillStyle = P.paper;
        ctx.fill();
        ctx.strokeStyle = revealed[i] || i === current ? P.ink : P.line;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 범위 라벨
        var label = node.lo + '–' + (node.hi - 1);
        ctx.fillStyle = revealed[i] || i === current ? P.paper : P.muted;
        ctx.font = '500 ' + Math.max(8, Math.round(r * 0.62)) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y + 0.5);
      });

      // 현재 병합 노드 펄스 링
      if (current !== -1) {
        var cnode = nodes[current];
        var cr = Math.min(15, w / (1 << cnode.depth) * 0.16);
        ctx.beginPath();
        ctx.arc(nx(cnode), ny(cnode), cr * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = P.coral;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    return {
      stepInterval: 320,
      holdTime: 2000,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
