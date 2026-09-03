/*
 * viz/counting-sort-stable.js — 계수 정렬의 안정성 (보조 캔버스)
 * 같은 값에 붙은 꼬리표(a, b, c)가 출력에서도 입력 순서를 유지함을 보여준다.
 * 색 언어: 현재 옮기는 칸 = coral, 배치 완료 = sage, 대기 = neutral
 */
(function () {
  'use strict';

  VizEngine.register('counting-sort-stable', function (P) {
    // 값 + 등장 순서 꼬리표
    var input = [
      { v: 2, tag: 'a' },
      { v: 1, tag: 'a' },
      { v: 2, tag: 'b' },
      { v: 1, tag: 'b' },
      { v: 2, tag: 'c' }
    ];
    // 안정 배치 순서 (뒤에서부터): (입력 인덱스 → 출력 위치)
    var moves = [
      { from: 4, to: 4 },
      { from: 3, to: 1 },
      { from: 2, to: 3 },
      { from: 1, to: 0 },
      { from: 0, to: 2 }
    ];
    var N = input.length;
    var stepCount;
    var outVals;

    function reset() {
      stepCount = 0;
      outVals = new Array(N).fill(null);
    }

    function step() {
      if (stepCount >= moves.length) return true;
      var m = moves[stepCount++];
      outVals[m.to] = input[m.from];
      return stepCount >= moves.length;
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);

      var padX = w * 0.08;
      var slot = (w - padX * 2) / N;
      var cellH = h * 0.26;
      var inY = h * 0.14;
      var outY = h * 0.58;
      var i, x;

      ctx.fillStyle = P.muted;
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('입력', padX, inY - h * 0.045);
      ctx.fillText('출력 — 뒤에서부터 채워도 같은 값은 입력 순서 유지', padX, outY - h * 0.045);

      var currentFrom = stepCount > 0 && stepCount <= moves.length ? moves[stepCount - 1].from : -1;

      // 입력 칸
      for (i = 0; i < N; i++) {
        x = padX + i * slot;
        var moved = moves.slice(0, stepCount).some(function (m) { return m.from === i; });
        var color;
        if (moved) color = P.line;
        else color = P.neutral;

        ctx.fillStyle = color;
        ctx.fillRect(x + 2, inY, slot - 4, cellH);

        if (!moved) {
          ctx.fillStyle = P.ink;
          ctx.font = '500 ' + Math.max(12, Math.round(slot * 0.3)) + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(input[i].v + input[i].tag, x + slot / 2, inY + cellH / 2 + 0.5);
        }
      }

      // 출력 칸
      for (i = 0; i < N; i++) {
        x = padX + i * slot;
        var cell = outVals[i];
        var latest = stepCount > 0 && moves[stepCount - 1].to === i;

        ctx.strokeStyle = P.line;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2.5, outY + 0.5, slot - 5, cellH - 1);

        if (cell) {
          ctx.fillStyle = latest ? P.coral : P.sage;
          ctx.fillRect(x + 2, outY, slot - 4, cellH);

          ctx.fillStyle = P.ink;
          ctx.font = '500 ' + Math.max(12, Math.round(slot * 0.3)) + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.v + cell.tag, x + slot / 2, outY + cellH / 2 + 0.5);
        }
      }

      // 이동 화살표 (가장 최근 이동)
      if (stepCount > 0) {
        var m = moves[stepCount - 1];
        var fx = padX + m.from * slot + slot / 2;
        var tx = padX + m.to * slot + slot / 2;
        var ay = inY + cellH + h * 0.02;
        var by = outY - h * 0.015;

        ctx.strokeStyle = P.coral;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, ay);
        ctx.bezierCurveTo(fx, ay + (by - ay) * 0.5, tx, ay + (by - ay) * 0.5, tx, by);
        ctx.stroke();

        // 화살촉
        ctx.fillStyle = P.coral;
        ctx.beginPath();
        ctx.moveTo(tx, by + 4);
        ctx.lineTo(tx - 4, by - 3);
        ctx.lineTo(tx + 4, by - 3);
        ctx.closePath();
        ctx.fill();
      }
    }

    return {
      stepInterval: 650,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
