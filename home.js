/* Storey homepage motion — Lenis + GSAP ScrollTrigger.
   Premium, intentional easing. No bounce, no rotation. Falls back gracefully. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__storeyReady = true;

  // If motion is off or libraries failed to load, just show everything.
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.add('force-show');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  var EASE = 'power3.out';

  /* ---- Lenis smooth scroll, tied to GSAP ---- */
  if (window.Lenis) {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---- Line splitter (keeps <em> + <br>) ---- */
  function splitLines(el) {
    var tokens = [];
    function push(text, em) {
      text.split(/(\s+)/).forEach(function (t) {
        if (t === '') return;
        if (/^\s+$/.test(t)) tokens.push({ sp: true });
        else tokens.push({ t: t, em: em });
      });
    }
    (function walk(node) {
      Array.prototype.forEach.call(node.childNodes, function (n) {
        if (n.nodeType === 3) push(n.textContent, false);
        else if (n.nodeName === 'BR') tokens.push({ br: true });
        else if (n.nodeName === 'EM') push(n.textContent, true);
        else walk(n);
      });
    })(el);
    el.classList.add('split');
    el.innerHTML = '';
    tokens.forEach(function (tok) {
      if (tok.br) el.appendChild(document.createElement('br'));
      else if (tok.sp) el.appendChild(document.createTextNode(' '));
      else {
        var s = document.createElement('span'); s.className = 'w'; s.textContent = tok.t;
        if (tok.em) { s.style.fontStyle = 'italic'; s.style.color = 'var(--coral)'; }
        el.appendChild(s);
      }
    });
    var ws = Array.prototype.slice.call(el.querySelectorAll('.w')), lines = [], cur = [], top = null;
    ws.forEach(function (s) {
      var t = s.offsetTop;
      if (top === null) top = t;
      if (t - top > 6) { lines.push(cur); cur = []; top = t; }
      cur.push(s);
    });
    if (cur.length) lines.push(cur);
    el.innerHTML = '';
    var inners = [];
    lines.forEach(function (line) {
      var mask = document.createElement('span'); mask.className = 'line-mask';
      var inner = document.createElement('span'); inner.className = 'line-inner';
      line.forEach(function (s, i) { inner.appendChild(s); if (i < line.length - 1) inner.appendChild(document.createTextNode(' ')); });
      mask.appendChild(inner); el.appendChild(mask); inners.push(inner);
    });
    return inners;
  }

  var started = false;
  function init() {
    if (started) return; started = true;

    /* Line-by-line reveal on the marquee headlines */
    gsap.utils.toArray('.hero2 h1, .cta h2').forEach(function (el) {
      el.classList.add('is-split');
      gsap.set(el, { autoAlpha: 1 });
      var inners = splitLines(el);
      gsap.set(inners, { yPercent: 115 });
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () { gsap.to(inners, { yPercent: 0, duration: 1.15, ease: EASE, stagger: 0.1 }); }
      });
    });

    /* Everything else: rise / slide / scale in, auto-staggered by proximity */
    var items = gsap.utils.toArray('.reveal:not(.is-split), [data-reveal]:not(.is-split)');
    items.forEach(function (el) {
      var v = el.getAttribute('data-reveal'), s = { autoAlpha: 0 };
      if (v === 'left') s.x = -54; else if (v === 'right') s.x = 54;
      else if (v === 'scale') s.scale = 0.94; else if (v === 'fade') { } else s.y = 48;
      gsap.set(el, s);
    });
    ScrollTrigger.batch(items, {
      start: 'top 88%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.05, ease: EASE, stagger: 0.09, overwrite: true });
      }
    });

    /* Images scale gently as they pass through the viewport */
    gsap.utils.toArray('.media-wrap img').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.12 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: img.closest('.media-wrap'), start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* Hero fades and lifts softly as you leave it */
    gsap.to('.hero2 .wrap', {
      yPercent: -8, autoAlpha: 0.55, ease: 'none',
      scrollTrigger: { trigger: '.hero2', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* Pinned storytelling — crossfade statements across the pinned scroll */
    var pin = document.querySelector('.pin');
    var lines = gsap.utils.toArray('.pin-line');
    if (pin && lines.length) {
      gsap.set(lines, { autoAlpha: 0, y: 40 });
      gsap.set(lines[0], { autoAlpha: 1, y: 0 });
      ScrollTrigger.create({
        trigger: pin, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: function (self) {
          var n = lines.length, idx = Math.min(Math.floor(self.progress * n), n - 1);
          lines.forEach(function (l, k) {
            gsap.to(l, { autoAlpha: k === idx ? 1 : 0, y: k === idx ? 0 : (k < idx ? -40 : 40), duration: 0.5, ease: EASE, overwrite: 'auto' });
          });
        }
      });
    }

    ScrollTrigger.refresh();
  }

  // Run once fonts are ready so line-splitting measures correctly.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
    setTimeout(init, 900);
  } else {
    setTimeout(init, 300);
  }
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
