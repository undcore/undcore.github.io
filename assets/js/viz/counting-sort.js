/*
 * viz/counting-sort.js — 계수 정렬 시각화 (입력 → 개수 → 누적 → 배치, 이벤트 재생)
 * 색 언어: 현재 읽는 칸 = coral, 카운트된 입력/갱신 중인 개수 칸 = blue,
 *          누적 합 계산 대상 = coral(결과)+blue(직전), 배치 완료 = sage, 소진 = line
 */
(function () {
  'use strict';

  VizEngine.register('counting-sort', function (P) {
    var N = 24; // 입력 개수
    var K = 9;  // 값 범위 0..8
    var values = [];
    var events = [];
    var evIdx;

    var counted;   // 입력 칸: 개수에 반영됨
    var consumed;  // 입력 칸: 출력으로 옮겨짐
    var counts;    // 개수/누적 배열
    var outVals;   // 출력 칸 값 (null = 비어 있음)
    var curInput;  // 현재 읽는 입력 칸
    var cntHot;    // 방금 갱신된 개수 칸
    var cumA, cumB; // 누적 합 계산 중인 두 칸
    var placePos;  // 방금 채워진 출력 칸

    function buildEvents() {
      events = [];
      var cnt = new Array(K).fill(0);
      var i, j, v;
      for (i = 0; i < N; i++) {
        events.push({ type: 'count', i: i, v: values[i] });
        cnt[values[i]]++;
      }
      for (j = 1; j < K; j++) {
        events.push({ type: 'cum', j: j });
        cnt[j] += cnt[j - 1];
      }
      for (i = N - 1; i >= 0; i--) {
        v = values[i];
        cnt[v]--;
        events.push({ type: 'place', i: i, v: v, pos: cnt[v] });
      }
    }

    function reset() {
      values = [];
      for (var k = 0; k < N; k++) {
        values.push(Math.floor(Math.random() * K));
      }
      buildEvents();
      evIdx = 0;
      counted = new Array(N).fill(false);
      consumed = new Array(N).fill(false);
      counts = new Array(K).fill(0);
      outVals = new Array(N).fill(null);
      curInput = -1;
      cntHot = -1;
      cumA = -1;
      cumB = -1;
      placePos = -1;
    }

    function step() {
      if (evIdx >= events.length) return true;
      var e = events[evIdx++];
      if (e.type === 'count') {
        curInput = e.i;
        counted[e.i] = true;
        cntHot = e.v;
        counts[e.v]++;
        cumA = -1;
        cumB = -1;
      } else if (e.type === 'cum') {
        curInput = -1;
        cntHot = -1;
        cumA = e.j - 1;
        cumB = e.j;
        counts[e.j] += counts[e.j - 1];
      } else {
        curInput = -1;
        cntHot = -1;
        cumA = -1;
        cumB = -1;
        consumed[e.i] = true;
        counts[e.v]--;
        outVals[e.pos] = e.v;
        placePos = e.pos;
      }
      return evIdx >= events.length;
    }

    function drawStripLabel(ctx, text, x, y) {
      ctx.fillStyle = P.muted || '#8a8a84';
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(text, x, y);
    }

    function draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);

      var padX = w * 0.05;
      var labelY0 = h * 0.075;
      var stripGap = h * 0.315;
      var inputY = h * 0.1;
      var countY = inputY + stripGap;
      var outY = countY + stripGap;

      // --- 입력 스트립 ---
      var slot = (w - padX * 2) / N;
      var cellH = h * 0.17;
      var i, x, v;

      drawStripLabel(ctx, '입력', padX, labelY0);

      for (i = 0; i < N; i++) {
        x = padX + i * slot;
        var cw = slot - 2;
        var color;
        if (consumed[i]) color = P.line;
        else if (i === curInput) color = P.coral;
        else if (counted[i]) color = P.blue;
        else color = P.neutral;

        ctx.fillStyle = color;
        ctx.fillRect(x + 1, inputY, cw, cellH);

        ctx.fillStyle = P.ink;
        ctx.font = '500 ' + Math.max(9, Math.round(slot * 0.5)) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (!consumed[i]) {
          ctx.fillText(String(values[i]), x + slot / 2, inputY + cellH / 2 + 0.5);
        }
      }

      // --- 개수 스트립 ---
      var slot2 = (w - padX * 2) / K;

      drawStripLabel(ctx, '개수 → 누적 합', padX, countY - h * 0.025);

      for (i = 0; i < K; i++) {
        x = padX + i * slot2;
        var cw2 = slot2 - 3;
        var color2 = P.neutral;
        if (i === cumB) color2 = P.coral;
        else if (i === cntHot || i === cumA) color2 = P.blue;

        ctx.fillStyle = color2;
        ctx.fillRect(x + 1.5, countY, cw2, cellH);

        ctx.fillStyle = P.ink;
        ctx.font = '500 ' + Math.max(10, Math.round(slot2 * 0.32)) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(counts[i]), x + slot2 / 2, countY + cellH / 2 + 0.5);

        // 개수 칸 아래에 값(인덱스) 표시
        ctx.fillStyle = P.muted || '#8a8a84';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(String(i), x + slot2 / 2, countY + cellH + h * 0.045);
      }

      // --- 출력 스트립 ---
      drawStripLabel(ctx, '출력 (뒤에서부터 배치)', padX, outY - h * 0.025);

      for (i = 0; i < N; i++) {
        x = padX + i * slot;
        var cw3 = slot - 2;
        v = outVals[i];
        var color3;
        if (i === placePos) color3 = P.coral;
        else if (v !== null) color3 = P.sage;
        else color3 = null;

        ctx.strokeStyle = P.line;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1.5, outY + 0.5, cw3 - 1, cellH - 1);

        if (color3) {
          ctx.fillStyle = color3;
          ctx.fillRect(x + 1, outY, cw3, cellH);
        }

        if (v !== null) {
          ctx.fillStyle = P.ink;
          ctx.font = '500 ' + Math.max(9, Math.round(slot * 0.5)) + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(v), x + slot / 2, outY + cellH / 2 + 0.5);
        }
      }
    }

    return {
      stepInterval: 120,
      holdTime: 2200,
      reset: reset,
      step: step,
      draw: draw
    };
  });
})();
