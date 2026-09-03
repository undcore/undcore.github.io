/*
 * viz/engine.js — 알고리즘 도감 공통 캔버스 엔진
 * - DPR 대응 리사이즈, 스텝 기반 루프, 뷰포트 밖/탭 비활성 시 정지
 * - prefers-reduced-motion 이면 정지 프레임만 표시
 * 모듈 인터페이스: factory(Palette) => { stepInterval, holdTime?, reset(), step() => done, draw(ctx, w, h) }
 */
(function () {
  'use strict';

  var Palette = {
    paper: '#f7f7f3',
    ink: '#171717',
    muted: '#717171',
    line: '#deded9',
    sage: '#79ac90',
    blue: '#7da2c9',
    amber: '#e3c88f',
    coral: '#e07a52',
    neutral: '#c9c9c2'
  };

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var factories = {};

  function register(name, factory) {
    factories[name] = factory;
  }

  function mount(canvas, name, options) {
    options = options || {};
    var factory = factories[name];
    if (!factory) return null;

    var mod = factory(Palette);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var BASE_SPEED = 0.25; // 1× 버튼의 실제 배속 (요청으로 두 차례 하향)
    var speed = (options.speed || 1) * BASE_SPEED;
    var playing = false;
    var visible = false;
    var destroyed = false;
    var rafId = null;
    var lastTime = 0;
    var acc = 0;
    var holdUntil = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width * dpr));
      var h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      mod.draw(ctx, canvas.width, canvas.height);
    }

    function frame(now) {
      if (destroyed) return;
      rafId = requestAnimationFrame(frame);
      if (!playing || !visible || document.hidden) {
        lastTime = now;
        return;
      }
      if (holdUntil) {
        lastTime = now;
        if (now < holdUntil) return;
        holdUntil = 0;
        mod.reset();
        mod.draw(ctx, canvas.width, canvas.height);
        return;
      }
      var interval = mod.stepInterval / speed;
      acc += now - lastTime;
      lastTime = now;
      acc = Math.min(acc, interval * 4);
      var stepped = false;
      while (acc >= interval) {
        acc -= interval;
        var done = mod.step();
        stepped = true;
        if (done) {
          holdUntil = now + (mod.holdTime || 1800);
          acc = 0;
          break;
        }
      }
      if (stepped) mod.draw(ctx, canvas.width, canvas.height);
    }

    var io = new IntersectionObserver(
      function (entries) {
        visible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    var ro = new ResizeObserver(resize);
    ro.observe(canvas);

    mod.reset();
    resize();

    if (reduceMotionQuery.matches) {
      // 자동재생만 막는다 — 루프는 띄워 둬서 사용자가 직접 재생을 누르면 동작하게 한다
      for (var i = 0; i < 12; i++) {
        if (mod.step()) break;
      }
      mod.draw(ctx, canvas.width, canvas.height);
    } else {
      playing = true;
    }
    rafId = requestAnimationFrame(frame);

    return {
      play: function () {
        playing = true;
      },
      pause: function () {
        playing = false;
      },
      toggle: function () {
        playing = !playing;
        return playing;
      },
      restart: function () {
        holdUntil = 0;
        acc = 0;
        mod.reset();
        mod.draw(ctx, canvas.width, canvas.height);
      },
      setSpeed: function (s) {
        speed = s * BASE_SPEED;
      },
      isPlaying: function () {
        return playing;
      },
      destroy: function () {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        io.disconnect();
        ro.disconnect();
      }
    };
  }

  window.VizEngine = { register: register, mount: mount, palette: Palette };
})();
