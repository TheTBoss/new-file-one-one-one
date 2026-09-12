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

  /* ---------- Filterable, searchable collections ---------- */

  function initFilters() {
    var groups = document.querySelectorAll('[data-filter-group]');
    groups.forEach(function (group) {
      var items = group.querySelectorAll('[data-tags]');
      var buttons = group.querySelectorAll('.filter');
      var input = group.querySelector('.search input');
      var count = group.querySelector('.result-count');
      var empty = group.querySelector('.empty-state');
      var active = 'all';

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var shown = 0;

        items.forEach(function (item) {
          var tags = (item.getAttribute('data-tags') || '').toLowerCase();
          var text = (item.textContent || '').toLowerCase();
          var matchTag = active === 'all' || tags.indexOf(active) !== -1;
          var matchText = !q || text.indexOf(q) !== -1;
          var show = matchTag && matchText;
          item.hidden = !show;
          if (show) shown++;
        });

        if (count) {
          var noun = group.getAttribute('data-noun') || 'item';
          count.textContent = shown + ' ' + noun + (shown === 1 ? '' : 's');
        }
        if (empty) empty.hidden = shown !== 0;
      }

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          active = btn.getAttribute('data-filter') || 'all';
          buttons.forEach(function (b) {
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          apply();
          var url = new URL(window.location.href);
          if (active === 'all') url.searchParams.delete('filter');
          else url.searchParams.set('filter', active);
          history.replaceState(null, '', url);
        });
      });

      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { input.value = ''; apply(); }
        });
      }

      var preset = new URL(window.location.href).searchParams.get('filter');
      if (preset) {
        var match = group.querySelector('.filter[data-filter="' + preset.replace(/"/g, '') + '"]');
        if (match) match.click();
      }
      apply();
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

  /* ---------- Print ---------- */

  function initPrint() {
    document.querySelectorAll('[data-print-page]').forEach(function (btn) {
      btn.addEventListener('click', function () { window.print(); });
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
    initPrint();
  });
})();
