/* Storey — shared interactions (Apple-style: smooth, scroll-linked, restrained) */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var GSAP_PAGE = document.body.classList.contains('gsap'); // homepage motion handled by home.js

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
  if (GSAP_PAGE) {
    /* homepage reveals handled by home.js (GSAP) */
  } else if (reduce) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          var group = el.parentElement ? el.parentElement.children : [el];
          var idx = Array.prototype.indexOf.call(group, el);
          el.style.transitionDelay = Math.min(idx, 6) * 105 + 'ms';
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

  /* ---- Kinetic hero: cycling verb ---- */
  var rot = document.querySelector('.hero .rot-word');
  if (rot) {
    var words = (rot.getAttribute('data-words') || 'brand,design,build,ship').split(',');
    if (reduce) {
      rot.textContent = 'brand, design & build';
    } else {
      var wi = 0, box = rot.parentElement;
      setInterval(function () {
        box.classList.add('out');
        setTimeout(function () {
          wi = (wi + 1) % words.length;
          rot.textContent = words[wi];
          box.classList.remove('out');
        }, 500);
      }, 2200);
    }
  }

  /* ---- Kinetic hero: mouse-reactive visual ---- */
  var heroEl = document.querySelector('.hero');
  var layers = heroEl ? heroEl.querySelectorAll('.hero-visual .layer') : [];
  if (heroEl && layers.length && fine && !reduce) {
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-depth')) || 20;
        l.style.transform = 'translate(' + (nx * d).toFixed(1) + 'px,' + (ny * d).toFixed(1) + 'px)';
      });
    });
    heroEl.addEventListener('pointerleave', function () {
      layers.forEach(function (l) { l.style.transform = ''; });
    });
  }

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

    // Parallax: bounded pan based on progress through the viewport.
    // Framed images (inside .cs-parallax) pan strongly but stay within their 25% slack;
    // loose images (phones) get a lighter drift.
    for (var i = 0; i < parallax.length; i++) {
      var el = parallax[i];
      var r = el.getBoundingClientRect();
      var prog = (vh - r.top) / (vh + r.height); // 0 entering bottom → 1 leaving top
      prog = prog < 0 ? 0 : prog > 1 ? 1 : prog;
      var framed = el.parentElement && el.parentElement.classList.contains('cs-parallax');
      var shift = framed
        ? (prog - 0.5) * (r.height * 0.40)   // up to ±20% of image height (big pan, within 40% slack)
        : (prog - 0.5) * ((parseFloat(el.getAttribute('data-parallax')) || 0.05) * 1000);
      el.style.transform = 'translateY(' + shift.toFixed(1) + 'px)';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } header(); }
  if (GSAP_PAGE) { addEventListener('scroll', header, { passive: true }); header(); }
  else if (reduce) { header(); }
  else {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', frame, { passive: true });
    frame(); header();
  }

  /* ---- Pinned storytelling ---- */
  var pin = document.querySelector('.pin');
  var pinLines = pin ? pin.querySelectorAll('.pin-line') : [];
  if (!GSAP_PAGE && pin && pinLines.length) {
    if (reduce) {
      pinLines.forEach(function (l) { l.classList.add('active'); });
    } else {
      var pinUpdate = function () {
        var top = pin.getBoundingClientRect().top;
        var total = pin.offsetHeight - window.innerHeight;
        var prog = total > 0 ? Math.min(Math.max(-top / total, 0), 0.9999) : 0;
        var idx = Math.floor(prog * pinLines.length);
        if (idx > pinLines.length - 1) idx = pinLines.length - 1;
        pinLines.forEach(function (l, k) { l.classList.toggle('active', k === idx); });
      };
      addEventListener('scroll', pinUpdate, { passive: true });
      addEventListener('resize', pinUpdate, { passive: true });
      pinUpdate();
    }
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
