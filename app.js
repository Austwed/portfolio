/* 作品集渲染逻辑。一般不需要改这个文件，内容都在 content.js。 */
(function () {
  'use strict';

  var D = window.PORTFOLIO || {};
  var P = D.profile || {};
  var SEC = D.sections || {};
  var SHOW_PENDING = !(D.site && D.site.showPending === false);
  var reg = {};          // id -> 查看器要打开的内容
  var current = null;    // 当前弹窗里打开的 id

  var LABEL = { web: '在线体验', video: '观看视频', pdf: '在线阅读', image: '查看大图', download: '下载', link: '打开链接' };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function paras(t) {
    if (!t) return '';
    return String(t).split(/\n{2,}/).map(function (p) {
      return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  function ph(label, ratio) {
    return '<div class="ph"' + (ratio ? ' style="--r:' + ratio + '"' : '') + '><span>' + esc(label || '图片待绑定') + '</span></div>';
  }
  function pic(src, alt, label) {
    return '<div class="pic">' + (src
      ? '<img loading="lazy" decoding="async" src="' + esc(src) + '" alt="' + esc(alt || '') + '" data-ph="' + esc(label || '') + '">'
      : ph(label || '图片待绑定')) + '</div>';
  }
  function chips(list, hi) {
    if (!list || !list.length) return '';
    return '<div class="chips">' + list.map(function (t, i) {
      return '<span class="chip' + (hi && i === 0 ? ' hi' : '') + '">' + esc(t) + '</span>';
    }).join('') + '</div>';
  }
  function secHead(key, def) {
    var s = SEC[key] || {};
    return '<div class="wrap"><div class="sec-head"><h2 id="h-' + key + '">' + esc(s.title || def) + '</h2>' +
      (s.sub ? '<p>' + esc(s.sub) + '</p>' : '') + '</div></div>';
  }

  /* ---- 按钮组：把 actions 变成按钮，并把需要弹窗的登记到 reg ---- */
  function actionsHTML(itemId, title, list) {
    var out = [];
    (list || []).forEach(function (a, i) {
      var pending = !a.src;
      if (pending && !SHOW_PENDING) return;
      var label = a.label || LABEL[a.type] || '打开';
      if (pending) {
        out.push('<span class="pending-label">' + esc(label) + ' · 待补</span>');
        return;
      }
      var cls = 'btn' + (a.primary ? ' primary' : '');
      var inner = '<span>' + esc(label) + '</span>' +
        (a.meta ? '<span class="btn-meta">' + esc(a.meta) + '</span>' : '');

      if (a.type === 'download') {
        out.push('<a class="' + cls + '" href="' + esc(a.src) + '" download>' + inner + '</a>');
      } else if (a.type === 'link') {
        var target = a.src.startsWith('#') ? '' : ' target="_blank" rel="noopener"';
        out.push('<a class="' + cls + '" href="' + esc(a.src) + '"' + target + '>' + inner + '</a>');
      } else {
        var id = itemId + '.' + a.type;
        if (reg[id]) id += '-' + i;
        reg[id] = { mode: 'file', title: title + '：' + label, kind: a.type, src: a.src, note: a.note, poster: a.poster };
        out.push('<button class="' + cls + '" type="button" data-open="' + esc(id) + '">' + inner + '</button>');
      }
    });
    return out.length ? '<div class="acts">' + out.join('') + '</div>' : '';
  }
  function hasVisibleAction(list) {
    return (list || []).some(function (a) { return SHOW_PENDING || a.src; });
  }

  /* ---------------- 顶栏 ---------------- */
  function renderNav() {
    document.title = (P.name ? P.name + '｜' : '') + (P.role || '') + '作品集';
    $('#brand').textContent = P.name || '作品集';
    var items = [['project', '代表项目'], ['playables', '在线试玩'], ['docs', '策划资料'], ['others', '其他作品'], ['resume', '简历']];
    $('#nav').innerHTML = items.filter(function (it) { return !document.getElementById(it[0]).hidden; }).map(function (it) {
      return '<a href="#' + it[0] + '">' + it[1] + '</a>';
    }).join('');
  }

  /* ---------------- 首页 ---------------- */
  function renderHero() {
    var h = D.hero || {};
    $('#top').innerHTML =
      '<div class="wrap hero-grid"><div class="hero-copy">' +
        '<p class="role">' + esc(P.role) + '</p>' +
        '<h1 class="name">' + esc(h.title) + '</h1>' +
        '<p class="tagline">' + esc(h.summary) + '</p>' +
        '<p class="hero-role">' + esc(h.role) + '</p>' +
        actionsHTML('hero', h.title, h.actions) +
      '</div>' +
      (h.cover ? '<figure class="hero-shot">' + pic(h.cover, h.caption || h.title) +
        (h.caption ? '<figcaption>' + esc(h.caption) + '</figcaption>' : '') + '</figure>' : '') +
      '</div>';
  }

  /* ---------------- 代表项目 ---------------- */
  function renderProject() {
    var f = D.featured || {};
    var shots = (f.gallery || []).filter(function (g) { return SHOW_PENDING || g.src; });
    var gal = shots.map(function (g, i) {
      var id = 'shot.' + i;
      reg[id] = { mode: 'file', title: f.title + '：' + (g.caption || '画面 ' + (i + 1)), kind: 'image', src: g.src };
      return '<button class="shot" type="button" data-open="' + id + '">' + pic(g.src, g.caption, '画面待绑定') +
        (g.caption ? '<small>' + esc(g.caption) + '</small>' : '') + '</button>';
    }).join('');

    var cases = (f.cases || []).map(function (c) {
      reg['case.' + c.id] = { mode: 'case', c: c, project: f.title, title: f.title + '：' + c.title,
        actionsHtml: actionsHTML('case.' + c.id, c.title, c.actions) };
      return '<button class="case" type="button" data-open="case.' + esc(c.id) + '">' +
        (c.tag ? '<span class="chip">' + esc(c.tag) + '</span>' : '') +
        '<h4>' + esc(c.title) + '</h4><p>' + esc(c.summary) + '</p><span class="more">查看完整拆解</span></button>';
    }).join('');

    var facts = (f.facts || []).map(function (x) {
      return '<dt>' + esc(x.label) + '</dt><dd>' + esc(x.value) + '</dd>';
    }).join('');

    $('#project').innerHTML = secHead('project', '代表项目') +
      '<div class="wrap">' +
        '<div class="proj">' +
          pic(f.cover, f.title, '项目封面待绑定') +
          '<div>' +
            '<h3>' + esc(f.title) + '</h3><p class="lead">' + esc(f.subtitle) + '</p>' +
            '<div class="body">' + paras(f.summary) + '</div>' +
            (facts ? '<dl class="facts">' + facts + '</dl>' : '') +
            actionsHTML('featured', f.title, f.actions) +
          '</div>' +
        '</div>' +
        (gal ? '<div class="gallery">' + gal + '</div>' : '') +
        (cases ? '<h3 class="sub-h">' + esc(f.casesTitle || '设计案例') + '</h3><div class="cases">' + cases + '</div>' : '') +
      '</div>';
  }

  /* ---------------- 在线试玩 ---------------- */
  function renderPlayables() {
    var html = (D.playables || []).filter(function (p) { return hasVisibleAction(p.actions); }).map(function (p) {
      return '<article class="play' + (p.cover ? '' : ' text-card') + '">' + (p.cover ? pic(p.cover, p.title) : '') +
        '<div class="txt"><h3>' + esc(p.title) + '</h3>' + chips(p.tags, true) +
        '<p>' + esc(p.summary) + '</p>' + actionsHTML(p.id, p.title, p.actions) + '</div></article>';
    }).join('');
    $('#playables').innerHTML = secHead('playables', '在线试玩') + '<div class="wrap">' + html + '</div>';
    if (!html) $('#playables').hidden = true;
  }

  /* ---------------- 策划资料 ---------------- */
  function renderDocs() {
    var docs = (D.docs || []).filter(function (d) { return hasVisibleAction(d.actions); });
    var cats = (D.docCategories || []).filter(function (c) { return docs.some(function (d) { return d.category === c; }); });
    var tabs = ['全部'].concat(cats).map(function (c, i) {
      return '<button class="tab" type="button" data-cat="' + (i ? esc(c) : '') + '" aria-pressed="' + (i === 0) + '">' + esc(c) + '</button>';
    }).join('');
    var rows = docs.map(function (d) {
      return '<article class="doc" data-cat="' + esc(d.category) + '"><div class="doc-type" aria-hidden="true">' + esc(d.type || '文件') + '</div>' +
        '<div><h3>' + esc(d.title) + '</h3><p>' + esc(d.summary) + '</p>' +
        (d.meta ? '<p class="meta">' + esc(d.category) + '　' + esc(d.meta) + '</p>' : '') + '</div>' +
        actionsHTML(d.id, d.title, d.actions) + '</article>';
    }).join('');

    $('#docs').innerHTML = secHead('docs', '策划资料') +
      '<div class="wrap">' + (cats.length ? '<div class="tabs" id="tabs">' + tabs + '</div>' : '') +
      '<div id="docList">' + rows + '</div></div>';
    if (!docs.length) $('#docs').hidden = true;

    var tabBox = $('#tabs');
    if (tabBox) tabBox.addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (!b) return;
      var cat = b.getAttribute('data-cat');
      $$('.tab', tabBox).forEach(function (t) { t.setAttribute('aria-pressed', t === b); });
      $$('#docList .doc').forEach(function (r) { r.hidden = !!cat && r.getAttribute('data-cat') !== cat; });
    });
  }

  /* ---------------- 其他作品 ---------------- */
  function renderOthers() {
    var list = (D.others || []).filter(function (o) { return o.case || hasVisibleAction(o.actions); });
    var html = list.map(function (o) {
      var id = 'case.' + o.id;
      if (o.case) reg[id] = { mode: 'case', c: o.case, title: o.case.title };
      return '<article class="other">' + (o.cover ? pic(o.cover, o.title) : '') +
        '<div><h3>' + esc(o.title) + '</h3>' + (o.role ? '<p class="who">' + esc(o.role) + '</p>' : '') + '</div>' +
        '<p>' + esc(o.summary) + '</p>' +
        (o.case ? '<div><button class="btn" type="button" data-open="' + esc(id) + '">查看设计说明</button></div>' : '') +
        actionsHTML(o.id, o.title, o.actions) + '</article>';
    }).join('');
    $('#others').innerHTML = secHead('others', '其他作品') + '<div class="wrap"><div class="others">' + html + '</div></div>';
    if (!list.length) $('#others').hidden = true;
  }

  /* ---------------- 简历 ---------------- */
  function renderResume() {
    var r = D.resume || {};
    var has = !!r.pdf;
    if (!has && !SHOW_PENDING) {
      $('#resume').hidden = true;
      return;
    }
    reg['resume.view'] = { mode: 'file', title: (P.name || '') + ' 简历', kind: 'pdf', src: r.pdf };
    var hl = (r.highlights || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('');
    var links = has
      ? '<button class="btn primary" type="button" data-open="resume.view">查看简历</button>' +
        '<a class="btn" href="' + esc(r.pdf) + '" download="' + esc(r.downloadName || '简历.pdf') + '">下载 PDF</a>'
      : (SHOW_PENDING ? '<span class="pending-label">简历 PDF · 待补</span>' : '');
    $('#resume').innerHTML = secHead('resume', '简历') +
      '<div class="wrap"><div class="cv' + (has ? '' : ' text-card') + '"><div>' +
      (hl ? '<ul>' + hl + '</ul>' : '') + '<div class="acts">' + links + '</div></div>' +
      (has ? '<div class="cv-frame"><iframe title="简历预览" loading="lazy" src="' + esc(r.pdf) + '#view=FitH&toolbar=0"></iframe></div>' : '') +
      '</div></div>';
  }

  function renderFoot() {
    var c = (D.contacts || []).map(function (x) {
      var v = x.href ? '<a href="' + esc(x.href) + '">' + esc(x.value) + '</a>' : esc(x.value);
      return '<li>' + esc(x.label) + '　' + v + '</li>';
    }).join('');
    $('#contact').innerHTML = '<div class="wrap foot-in"><div><h2>' + esc(P.name) + '</h2><p>' + esc(P.role) +
      (D.site && D.site.updated ? '　' + esc(D.site.updated) : '') + '</p></div><ul>' + c + '</ul></div>';
  }

  /* ---------------- 查看器（弹窗） ---------------- */
  var dlg, body, titleEl, actsEl, backBtn;

  function fileBody(d) {
    if (!d.src) {
      return { fill: false, html: '<div class="empty"><b>这份内容还在整理中</b><span>稍后会更新，也可以先看其他部分。</span></div>' };
    }
    var s = esc(d.src);
    if (d.kind === 'pdf') {
      return { fill: true, html: '<iframe class="frame" title="' + esc(d.title) + '" src="' + s + '#view=FitH"></iframe>' +
        '<p class="hint">如果这里没有显示内容（手机浏览器常见），请点右上角“新标签打开”。</p>' };
    }
    if (d.kind === 'web') {
      return { fill: true, html: (d.note ? '<p class="strip">' + esc(d.note) + '</p>' : '') +
        '<iframe class="frame" title="' + esc(d.title) + '" src="' + s + '" allow="fullscreen; gamepad; autoplay" allowfullscreen ' +
        'sandbox="allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms allow-modals"></iframe>' +
        '<p class="hint">画面太小或操作不便时，点“新标签打开”可以全屏体验。</p>' };
    }
    if (d.kind === 'video') {
      return { fill: true, html: (d.note ? '<p class="strip">' + esc(d.note) + '</p>' : '') +
        '<video controls playsinline preload="metadata" src="' + s + '"' + (d.poster ? ' poster="' + esc(d.poster) + '"' : '') + '></video>' };
    }
    return { fill: true, html: '<img class="viewimg" src="' + s + '" alt="' + esc(d.title) + '">' };
  }

  function caseBody(d) {
    var c = d.c;
    var secs = (c.sections || []).map(function (s) {
      return '<section><h3>' + esc(s.heading) + '</h3>' + paras(s.text) + '</section>';
    }).join('');
    var media = (c.media || []).filter(function (m) { return SHOW_PENDING || m.src; }).map(function (m) {
      var inner = m.type === 'video'
        ? (m.src ? '<video controls playsinline preload="metadata" src="' + esc(m.src) + '"></video>' : '<div class="pic">' + ph('视频待绑定') + '</div>')
        : pic(m.src, m.caption, '图片待绑定');
      return '<figure>' + inner + (m.caption ? '<figcaption>' + esc(m.caption) + '</figcaption>' : '') + '</figure>';
    }).join('');
    return '<article class="case-doc">' +
      (c.tag ? '<p class="tagline2">' + esc(c.tag) + '</p>' : '') +
      '<h2>' + esc(c.title) + '</h2><p class="lead">' + esc(c.summary) + '</p>' +
      secs + (media ? '<div class="case-media">' + media + '</div>' : '') +
      (d.actionsHtml || '') + '</article>';
  }

  function openItem(id, push) {
    var d = reg[id];
    if (!d) return;
    var prev = dlg.open ? current : null;
    var back = (prev && reg[prev] && reg[prev].mode === 'case' && d.mode === 'file') ? prev : null;
    current = id;

    titleEl.textContent = d.title;
    backBtn.hidden = !back;
    backBtn.setAttribute('data-open', back || '');

    var acts = '';
    if (d.mode === 'file' && d.src) {
      acts += '<a class="btn small" href="' + esc(d.src) + '" target="_blank" rel="noopener">新标签打开</a>';
      if (d.kind === 'pdf' || d.kind === 'video' || d.kind === 'image') {
        acts += '<a class="btn small" href="' + esc(d.src) + '" download>下载</a>';
      }
    }
    actsEl.innerHTML = acts;

    if (d.mode === 'case') {
      body.className = 'dlg-body';
      body.innerHTML = caseBody(d);
    } else {
      var fb = fileBody(d);
      body.className = 'dlg-body' + (fb.fill ? ' fill' : '');
      body.innerHTML = fb.html;
    }
    body.scrollTop = 0;

    if (!dlg.open) {
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
    }
    if (push !== false) {
      try { history.replaceState(null, '', '#/v/' + encodeURIComponent(id)); } catch (e) { /* 忽略 */ }
    }
  }

  function setupDialog() {
    dlg = $('#dlg'); body = $('#dlgBody'); titleEl = $('#dlgTitle'); actsEl = $('#dlgActs'); backBtn = $('#dlgBack');

    $('#dlgClose').addEventListener('click', function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg && dlg.close) dlg.close(); });
    dlg.addEventListener('close', function () {
      body.innerHTML = '';   // 停止视频和嵌入页面
      current = null;
      if (/^#\/v\//.test(location.hash)) {
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* 忽略 */ }
      }
    });
    $('#dlgCopy').addEventListener('click', function () {
      var btn = this, url = location.href;
      function done(ok) {
        btn.textContent = ok ? '已复制' : '请手动复制地址栏';
        setTimeout(function () { btn.textContent = '复制链接'; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
      } else { done(false); }
    });
  }

  function fromHash() {
    var m = location.hash.match(/^#\/v\/(.+)$/);
    if (m) {
      try { openItem(decodeURIComponent(m[1]), false); }
      catch (e) { if (!(e instanceof URIError)) throw e; }
    }
    else if (dlg && dlg.open && dlg.close) dlg.close();
  }

  /* ---------------- 导航高亮 ---------------- */
  function spy() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('#nav a');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('main > section').forEach(function (s) { if (s.id !== 'top') io.observe(s); });
  }

  /* ---------------- 启动 ---------------- */
  renderHero();
  renderProject();
  renderPlayables();
  renderDocs();
  renderOthers();
  renderResume();
  renderFoot();
  renderNav();
  setupDialog();
  spy();

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open]');
    if (t && t.getAttribute('data-open')) { e.preventDefault(); openItem(t.getAttribute('data-open')); }
  });
  // 图片加载失败时退回占位，避免出现破图图标
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG' && el.getAttribute('data-ph') !== null) {
      var box = document.createElement('div');
      box.innerHTML = ph(el.getAttribute('data-ph') || '图片加载失败');
      el.replaceWith(box.firstChild);
    }
  }, true);
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
