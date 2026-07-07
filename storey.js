/* Storey — shared interactions (Apple-style: smooth, scroll-linked, restrained) */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Smart header ---- */
  var hdr = document.getElementById('hdr');
  var last = 0;
  function header() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (hdr) {
      hdr.classList.toggle('scrolled', y > 10);
      if (y > 260 && y > last + 4) hdr.classList.add('hide');
      else if (y < last - 4 || y < 260) hdr.classList.remove('hide');
    }
    last = y;
  }

  /* ---- Reveal on scroll (staggered, smooth) ---- */
  var revealEls = document.querySelectorAll('.reveal,[data-reveal]');
  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          var group = el.parentElement ? el.parentElement.children : [el];
          var idx = Array.prototype.indexOf.call(group, el);
          el.style.transitionDelay = Math.min(idx, 6) * 80 + 'ms';
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Hero headline mask reveal ---- */
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    requestAnimationFrame(function () { setTimeout(function () { h1.classList.add('in'); }, 120); });
  } else if (h1) { h1.classList.add('in'); }

  /* ---- Count-up stats ---- */
  function countUp(el) {
    var raw = el.getAttribute('data-count') || el.textContent;
    var m = raw.match(/^(\D*)(\d[\d,]*)(.*)$/);
    if (!m) return;
    var pre = m[1], target = parseInt(m[2].replace(/,/g, ''), 10), suf = m[3];
    if (reduce) { el.textContent = pre + target.toLocaleString() + suf; return; }
    var start = null, dur = 1500;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(target * eased).toLocaleString() + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var nums = document.querySelectorAll('.stat .num');
  if (nums.length) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); nio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) {
      if (/\d/.test(n.textContent) && !/-in-/.test(n.textContent)) { n.setAttribute('data-count', n.textContent); nio.observe(n); }
    });
  }

  /* ---- Scroll-linked motion: hero fade/rise + parallax (Apple-style) ---- */
  var heroContent = document.querySelector('.hero .wrap');
  var parallax = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY || document.documentElement.scrollTop;
    var vh = window.innerHeight;

    // Hero: gentle rise + fade as it leaves
    if (heroContent) {
      var p = Math.min(y / (vh * 0.9), 1);
      heroContent.style.transform = 'translateY(' + (y * 0.12) + 'px)';
      heroContent.style.opacity = (1 - p * 0.9).toFixed(3);
    }

    // Parallax elements: bounded pan based on progress through the viewport
    for (var i = 0; i < parallax.length; i++) {
      var el = parallax[i];
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.05;
      var r = el.getBoundingClientRect();
      var prog = (vh - r.top) / (vh + r.height); // 0 entering bottom → 1 leaving top
      prog = prog < 0 ? 0 : prog > 1 ? 1 : prog;
      var shift = (prog - 0.5) * (speed * 700); // clamped: |shift| <= speed*350
      el.style.transform = 'translateY(' + shift.toFixed(1) + 'px)';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } header(); }
  if (reduce) { header(); }
  else {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', frame, { passive: true });
    frame(); header();
  }

  /* ---- Mobile menu toggle ---- */
  var mb = document.querySelector('.menu-btn'), nl = document.querySelector('.nav-links');
  if (mb && nl) {
    mb.addEventListener('click', function () {
      var open = nl.style.display === 'flex';
      nl.style.display = open ? '' : 'flex';
      nl.style.flexDirection = 'column';
    });
  }
})();
