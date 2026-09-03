/*
 * algorithm.js — 알고리즘 도감 페이지 컨트롤러
 * 인덱스 그리드 렌더링 + 해시 라우팅(#항목id)으로 상세 뷰 전환
 */
(function () {
  'use strict';

  var grid = document.getElementById('fg-grid');
  var indexView = document.getElementById('fg-index');
  var detailView = document.getElementById('fg-detail');
  var miniControllers = [];
  var detailController = null;
  var extraControllers = [];
  var currentEntry = null;
  var currentLang = 'cpp';

  /* ---------- 구문 하이라이팅 (외부 라이브러리 없이 경량 토크나이저) ---------- */

  var HIGHLIGHT_PATTERNS = {
    cpp: [
      { cls: 'com', src: '\\/\\/[^\\n]*' },
      { cls: 'str', src: '"(?:[^"\\\\]|\\\\.)*"' },
      { cls: 'kw', src: '\\b(?:void|int|char|long|bool|return|if|else|while|for|const|auto|break|continue|size_t)\\b' },
      { cls: 'type', src: '\\b(?:std|vector|queue|string|Grid)\\b' },
      { cls: 'num', src: '\\b\\d+(?:\\.\\d+)?\\b' },
      { cls: 'fn', src: '[A-Za-z_]\\w*(?=\\()' }
    ],
    c: [
      { cls: 'com', src: '\\/\\/[^\\n]*' },
      { cls: 'str', src: '"(?:[^"\\\\]|\\\\.)*"' },
      { cls: 'kw', src: '\\b(?:void|int|char|long|return|if|else|while|for|const|break|continue|sizeof|typedef|struct|static|unsigned)\\b' },
      { cls: 'type', src: '\\b(?:size_t)\\b' },
      { cls: 'num', src: '\\b\\d+(?:\\.\\d+)?\\b' },
      { cls: 'fn', src: '[A-Za-z_]\\w*(?=\\()' }
    ],
    csharp: [
      { cls: 'com', src: '\\/\\/[^\\n]*' },
      { cls: 'str', src: '"(?:[^"\\\\]|\\\\.)*"' },
      { cls: 'kw', src: '\\b(?:void|int|bool|return|if|else|while|for|foreach|in|var|break|continue|static|public|private|new|true|false|null)\\b' },
      { cls: 'type', src: '\\b(?:List|Queue|Dictionary|Array|Math|Console|String|Enumerable|Grid)\\b' },
      { cls: 'num', src: '\\b\\d+(?:\\.\\d+)?\\b' },
      { cls: 'fn', src: '[A-Za-z_]\\w*(?=\\()' }
    ],
    python: [
      { cls: 'com', src: '#[^\\n]*' },
      { cls: 'str', src: "'(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\"" },
      { cls: 'kw', src: '\\b(?:def|return|if|elif|else|while|for|in|not|and|or|import|from|break|continue|pass|None|True|False)\\b' },
      { cls: 'type', src: '\\b(?:list|dict|set|tuple|int|str|deque)\\b' },
      { cls: 'num', src: '\\b\\d+(?:\\.\\d+)?\\b' },
      { cls: 'fn', src: '[A-Za-z_]\\w*(?=\\()' }
    ],
    java: [
      { cls: 'com', src: '\\/\\/[^\\n]*' },
      { cls: 'str', src: '"(?:[^"\\\\]|\\\\.)*"' },
      { cls: 'kw', src: '\\b(?:void|int|boolean|return|if|else|while|for|break|continue|static|public|private|new|true|false|null|final)\\b' },
      { cls: 'type', src: '\\b(?:Arrays|Collections|ArrayDeque|Queue|List|ArrayList|IntStream|String|Integer|Grid)\\b' },
      { cls: 'num', src: '\\b\\d+(?:\\.\\d+)?\\b' },
      { cls: 'fn', src: '[A-Za-z_]\\w*(?=\\()' }
    ]
  };

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightCode(source, lang) {
    var patterns = HIGHLIGHT_PATTERNS[lang] || [];
    var re = new RegExp(
      patterns
        .map(function (p) {
          return '(' + p.src + ')';
        })
        .join('|'),
      'g'
    );
    var out = '';
    var last = 0;
    var m;
    while ((m = re.exec(source)) !== null) {
      out += escapeHtml(source.slice(last, m.index));
      for (var k = 0; k < patterns.length; k++) {
        if (m[k + 1] !== undefined) {
          out += '<span class="tok-' + patterns[k].cls + '">' + escapeHtml(m[0]) + '</span>';
          break;
        }
      }
      last = m.index + m[0].length;
    }
    out += escapeHtml(source.slice(last));
    return out;
  }

  function renderCode(lang) {
    if (!currentEntry) return;
    currentLang = lang;
    document.getElementById('fg-detail-code').innerHTML = highlightCode(
      currentEntry.code[lang].join('\n'),
      lang
    );
    document.querySelectorAll('.fg-code-tabs button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function entryById(id) {
    for (var k = 0; k < VIZ_CATALOG.length; k++) {
      if (VIZ_CATALOG[k].id === id) return VIZ_CATALOG[k];
    }
    return null;
  }

  /* ---------- 인덱스 뷰 ---------- */

  var cardRefs = [];

  function buildTabs() {
    var tabs = document.getElementById('fg-tabs');
    var preferredOrder = ['Searching', 'Sorting', 'Graph'];
    var categories = [];
    VIZ_CATALOG.forEach(function (entry) {
      if (categories.indexOf(entry.category) === -1) categories.push(entry.category);
    });
    categories.sort(function (a, b) {
      var ia = preferredOrder.indexOf(a);
      var ib = preferredOrder.indexOf(b);
      if (ia === -1) ia = preferredOrder.length;
      if (ib === -1) ib = preferredOrder.length;
      return ia - ib;
    });

    function filter(category) {
      cardRefs.forEach(function (ref) {
        ref.el.style.display = category === 'all' || ref.category === category ? '' : 'none';
      });
      tabs.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('active', b.dataset.category === category);
      });
    }

    ['all'].concat(categories).forEach(function (category) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.category = category;
      btn.textContent = category === 'all' ? 'All' : category;
      btn.addEventListener('click', function () {
        filter(category);
      });
      tabs.appendChild(btn);
    });

    filter('all');
  }

  function complexityText(entry) {
    if (entry.best && entry.worst) {
      if (entry.best === entry.worst) {
        return '최적·최악 ' + entry.best;
      }
      return '최적 ' + entry.best + ' · 최악 ' + entry.worst;
    }
    return entry.complexity;
  }

  function buildCards() {
    VIZ_CATALOG.forEach(function (entry) {
      var card = document.createElement('article');
      card.className = 'fg-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', entry.title + ' 상세 보기');
      card.innerHTML =
        '<div class="fg-card-head">' +
        '<span class="fg-no" style="color:' + entry.color + '">No. ' + entry.no + '</span>' +
        '<span class="fg-cat">' + entry.category + '</span>' +
        '</div>' +
        '<div class="fg-card-canvas"><canvas aria-hidden="true"></canvas></div>' +
        '<div class="fg-card-body">' +
        '<h2>' + entry.title + '</h2>' +
        '<p class="fg-ko">' + entry.ko + '</p>' +
        '<span class="fg-badge" style="color:' + entry.color + ';border-color:' + entry.color + '">' + complexityText(entry) + '</span>' +
        '</div>';

      function open() {
        location.hash = entry.id;
      }
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });

      grid.appendChild(card);
      cardRefs.push({ el: card, category: entry.category });
      var ctrl = VizEngine.mount(card.querySelector('canvas'), entry.id, { forceAutoplay: true });
      if (ctrl) miniControllers.push(ctrl);
    });
  }

  /* ---------- 상세 뷰 ---------- */

  function openDetail(entry) {
    document.getElementById('fg-detail-no').textContent = 'No. ' + entry.no;
    document.getElementById('fg-detail-no').style.color = entry.color;
    document.getElementById('fg-detail-cat').textContent = entry.category;
    document.getElementById('fg-detail-title').textContent = entry.title;
    document.getElementById('fg-detail-ko').textContent = entry.ko;

    var badge = document.getElementById('fg-detail-bigo');
    badge.textContent = complexityText(entry);
    badge.style.color = entry.color;

    document.getElementById('fg-detail-note').textContent = entry.note;

    var tags = document.getElementById('fg-detail-tags');
    tags.innerHTML = '';
    entry.tags.forEach(function (tag) {
      var chip = document.createElement('span');
      chip.className = 'fg-chip';
      chip.textContent = tag;
      tags.appendChild(chip);
    });

    currentEntry = entry;
    renderCode(currentLang);

    indexView.hidden = true;
    detailView.hidden = false;
    window.scrollTo({ top: 0 });

    var canvas = document.getElementById('fg-detail-canvas');
    detailController = VizEngine.mount(canvas, entry.id);
    syncPlayButton();

    // 보조 캔버스 (extras)
    var extrasBox = document.getElementById('fg-extras');
    extrasBox.innerHTML = '';
    extraControllers = [];
    (entry.extras || []).forEach(function (extra) {
      var card = document.createElement('div');
      card.className = 'fg-extra';
      card.innerHTML =
        '<p class="fg-extra-title">' + extra.title + '</p>' +
        '<div class="fg-extra-canvas"><canvas></canvas></div>' +
        '<p class="fg-extra-cap">' + extra.caption + '</p>';
      extrasBox.appendChild(card);
      var ctrl = VizEngine.mount(card.querySelector('canvas'), extra.module, { forceAutoplay: true });
      if (ctrl) extraControllers.push(ctrl);
    });
  }

  function closeDetail() {
    if (detailController) {
      detailController.destroy();
      detailController = null;
    }
    extraControllers.forEach(function (ctrl) {
      ctrl.destroy();
    });
    extraControllers = [];
    detailView.hidden = true;
    indexView.hidden = false;
  }

  /* ---------- 컨트롤 ---------- */

  document.querySelectorAll('.fg-code-tabs button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      renderCode(btn.dataset.lang);
    });
  });

  var playButton = document.getElementById('fg-play');
  var restartButton = document.getElementById('fg-restart');
  var speedButtons = document.querySelectorAll('.fg-speed button');

  function syncPlayButton() {
    if (!detailController) return;
    playButton.textContent = detailController.isPlaying() ? '⏸ 일시정지' : '▶ 재생';
  }

  playButton.addEventListener('click', function () {
    if (!detailController) return;
    detailController.toggle();
    syncPlayButton();
  });

  restartButton.addEventListener('click', function () {
    if (!detailController) return;
    detailController.restart();
    detailController.play();
    syncPlayButton();
  });

  speedButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!detailController) return;
      detailController.setSpeed(parseFloat(btn.dataset.speed));
      speedButtons.forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
    });
  });

  document.getElementById('fg-back').addEventListener('click', function () {
    location.hash = '';
  });

  /* ---------- 라우팅 ---------- */

  function route() {
    var id = location.hash.replace(/^#/, '');
    var entry = id && entryById(id);
    if (entry) {
      if (detailController) detailController.destroy();
      openDetail(entry);
    } else {
      closeDetail();
    }
  }

  buildCards();
  buildTabs();
  window.addEventListener('hashchange', route);
  route();
})();
