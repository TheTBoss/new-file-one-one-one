/* Thomas Willmott — site behaviour. No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (light / dark / follow system) ---------- */

  function initTheme() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    function current() {
      var stored = null;
      try { stored = localStorage.getItem('tw-theme'); } catch (e) {}
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function label() {
      btn.setAttribute('aria-label',
        current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }

    label();
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('tw-theme', next); } catch (e) {}
      label();
    });
  }

  /* ---------- Mobile navigation ---------- */

  function initNav() {
    var btn = document.querySelector('.menu-btn');
    var nav = document.querySelector('.nav');
    if (!btn || !nav) return;

    function setOpen(open) {
      nav.setAttribute('data-open', open ? 'true' : 'false');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    setOpen(false);
    btn.addEventListener('click', function () {
      setOpen(nav.getAttribute('data-open') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.getAttribute('data-open') !== 'true') return;
      if (!nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 52em)').addEventListener('change', function () {
      setOpen(false);
    });
  }

  /* ---------- Scroll reveal ---------- */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Filterable, searchable collections ----------
     Items carry data-tags. An optional wrapper marked data-filter-section
     hides itself when every item inside it is filtered out. Works for a flat
     grid of project cards and for skills grouped inside category cards. */

  function initFilters() {
    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
      var items = Array.prototype.slice.call(group.querySelectorAll('[data-tags]'));
      var sections = Array.prototype.slice.call(group.querySelectorAll('[data-filter-section]'));
      var buttons = Array.prototype.slice.call(group.querySelectorAll('.filter'));
      var input = group.querySelector('.search input');
      var count = group.querySelector('.result-count');
      var empty = group.querySelector('.empty-state');
      var clears = Array.prototype.slice.call(group.querySelectorAll('[data-clear]'));
      var clearChip = group.querySelector('.filter[data-clear]');
      var noun = group.getAttribute('data-noun') || 'item';
      var active = 'all';

      function apply(pushState) {
        var q = input ? input.value.trim().toLowerCase() : '';
        var shown = 0;

        items.forEach(function (item) {
          var tags = (item.getAttribute('data-tags') || '').toLowerCase();
          var text = (item.textContent || '').toLowerCase();
          var show = (active === 'all' || tags.split(/\s+/).indexOf(active) !== -1) &&
                     (!q || text.indexOf(q) !== -1);
          item.hidden = !show;
          if (show) shown++;
        });

        sections.forEach(function (section) {
          var any = section.querySelectorAll('[data-tags]:not([hidden])').length;
          section.hidden = any === 0;
        });

        if (count) count.textContent = shown + ' ' + noun + (shown === 1 ? '' : 's');
        if (empty) empty.hidden = shown !== 0;
        if (clearChip) clearChip.hidden = active === 'all' && !q;

        if (pushState) {
          var url = new URL(window.location.href);
          if (active === 'all') url.searchParams.delete('filter');
          else url.searchParams.set('filter', active);
          if (q) url.searchParams.set('q', q);
          else url.searchParams.delete('q');
          history.replaceState(null, '', url);
        }
      }

      function select(name, pushState) {
        active = name || 'all';
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed',
            b.getAttribute('data-filter') === active ? 'true' : 'false');
        });
        apply(pushState);
      }

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          select(btn.getAttribute('data-filter'), true);
        });
      });

      if (input) {
        var timer = null;
        input.addEventListener('input', function () {
          window.clearTimeout(timer);
          timer = window.setTimeout(function () { apply(true); }, 80);
        });
        input.addEventListener('keydown', function (e) {
          if (e.key !== 'Escape') return;
          input.value = '';
          apply(true);
        });
      }

      clears.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (input) input.value = '';
          select('all', true);
          if (input) input.focus();
        });
      });

      /* "/" focuses the search box, the way a search-first interface should. */
      if (input) {
        document.addEventListener('keydown', function (e) {
          if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
          var el = document.activeElement;
          var tag = el ? el.tagName : '';
          if (tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable)) return;
          e.preventDefault();
          input.focus();
          input.select();
        });
      }

      var params = new URL(window.location.href).searchParams;
      if (input && params.get('q')) input.value = params.get('q');
      var preset = params.get('filter');
      var presetBtn = preset
        ? group.querySelector('.filter[data-filter="' + preset.replace(/["\\]/g, '') + '"]')
        : null;
      select(presetBtn ? preset : 'all', false);
    });
  }

  /* ---------- Timeline ---------- */

  function initTimeline() {
    var items = document.querySelectorAll('.timeline li');
    items.forEach(function (li) {
      var btn = li.querySelector('.tl-btn');
      var body = li.querySelector('.tl-body');
      if (!btn || !body) return;
      var id = body.id;
      btn.setAttribute('aria-expanded', 'false');
      if (id) btn.setAttribute('aria-controls', id);

      btn.addEventListener('click', function () {
        var open = li.getAttribute('data-open') === 'true';
        items.forEach(function (other) {
          if (other !== li) other.setAttribute('data-open', 'false');
          var b = other.querySelector('.tl-btn');
          if (b && other !== li) b.setAttribute('aria-expanded', 'false');
        });
        li.setAttribute('data-open', open ? 'false' : 'true');
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });
  }

  /* ---------- Copy to clipboard ---------- */

  function initCopy() {
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-copy') || '';
        var done = function () {
          btn.setAttribute('data-copied', 'true');
          window.setTimeout(function () { btn.removeAttribute('data-copied'); }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done, function () {});
          return;
        }
        var ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      });
    });
  }

  /* ---------- Back to top ---------- */

  function initToTop() {
    var btn = document.querySelector('.to-top');
    if (!btn) return;
    var ticking = false;
    function update() {
      btn.setAttribute('data-show', window.scrollY > 700 ? 'true' : 'false');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ---------- Deep links: /projects.html#clarifin opens that card ---------- */

  function initDeepLink() {
    function openTarget() {
      var id = window.location.hash.slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      var details = el.querySelector('details');
      if (details) details.open = true;
      el.hidden = false;
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
    window.addEventListener('hashchange', openTarget);
    if (window.location.hash) window.setTimeout(openTarget, 60);
  }

  /* ---------- Prefetch a page on hover so navigation feels instant ---------- */

  function initPrefetch() {
    if (navigator.connection && (navigator.connection.saveData ||
        /2g/.test(navigator.connection.effectiveType || ''))) return;

    var done = {};
    function prefetch(href) {
      if (!href || done[href]) return;
      done[href] = true;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }

    function candidate(e) {
      var a = e.target.closest ? e.target.closest('a[href$=".html"]') : null;
      if (!a || a.origin !== window.location.origin) return;
      prefetch(a.href);
    }

    document.addEventListener('pointerenter', candidate, true);
    document.addEventListener('touchstart', candidate, { capture: true, passive: true });
    document.addEventListener('focusin', candidate);
  }

  /* ---------- Printing: expand every collapsed panel, then restore ---------- */

  function initPrintExpand() {
    var reopened = [];
    function expand() {
      reopened = [];
      document.querySelectorAll('details:not([open])').forEach(function (d) {
        d.open = true;
        reopened.push(d);
      });
    }
    function restore() {
      reopened.forEach(function (d) { d.open = false; });
      reopened = [];
    }
    window.addEventListener('beforeprint', expand);
    window.addEventListener('afterprint', restore);
    if (window.matchMedia) {
      var mq = window.matchMedia('print');
      var onChange = function (e) { if (e.matches) expand(); else restore(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
    }
    document.querySelectorAll('[data-print-page]').forEach(function (btn) {
      btn.addEventListener('click', function () { expand(); window.print(); });
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initTheme();
    initNav();
    initReveal();
    initFilters();
    initTimeline();
    initCopy();
    initToTop();
    initDeepLink();
    initPrefetch();
    initPrintExpand();
  });
})();
