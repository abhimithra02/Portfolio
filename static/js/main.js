// ═══════════════════════════════════════════
//   SOLO LEVELING PORTFOLIO — MAIN JS
// ═══════════════════════════════════════════

// ═══ THEME TOGGLE (with OS preference detection) ═══
(function () {
  var saved;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

// ═══ DUNGEON GATE (click + keyboard) ═══
(function () {
  var gate = document.getElementById('gate-overlay');
  if (!gate) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gate.style.display = 'none';
    return;
  }
  function dismissGate() {
    gate.classList.add('fade-out');
    setTimeout(function () {
      gate.style.display = 'none';
      showSystemAlerts();
    }, 800);
  }
  gate.addEventListener('click', dismissGate);
  gate.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dismissGate();
    }
  });
})();

// ═══ SYSTEM ALERTS ═══
var alertQueue = [
  { msg: 'Player data loaded successfully.', sub: 'Welcome, S-Rank Hunter.' },
  { msg: 'Skill analysis complete.', sub: 'All abilities indexed.' },
  { msg: 'Shadow army standing by.', sub: 'Arise.' }
];
function showSystemAlerts() {
  var alertEl = document.getElementById('systemAlert');
  var msgEl = document.getElementById('alertMsg');
  var subEl = document.getElementById('alertSub');
  var i = 0;
  function showNext() {
    if (i >= alertQueue.length) {
      alertEl.classList.remove('show');
      return;
    }
    msgEl.textContent = alertQueue[i].msg;
    subEl.textContent = alertQueue[i].sub;
    alertEl.classList.add('show');
    i++;
    setTimeout(function () {
      alertEl.classList.remove('show');
      setTimeout(showNext, 400);
    }, 1800);
  }
  setTimeout(showNext, 500);
}

// ═══ SHADOW CURSOR AURA ═══
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;
  var aura = document.getElementById('shadow-aura');
  document.addEventListener('mousemove', function (e) {
    aura.style.left = e.clientX + 'px';
    aura.style.top = e.clientY + 'px';
  });
})();

// ═══ SHADOW SOLDIERS (deferred start) ═══
(function () {
  var canvas = document.getElementById('shadowSoldiers');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = canvas.getContext('2d');
  var w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = 200;
  }
  resize();
  window.addEventListener('resize', resize);

  var soldiers = [];
  for (var i = 0; i < 8; i++) {
    soldiers.push({
      x: Math.random() * w,
      baseH: 40 + Math.random() * 60,
      speed: 0.2 + Math.random() * 0.3,
      sway: Math.random() * Math.PI * 2,
      opacity: 0.03 + Math.random() * 0.06
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (var s of soldiers) {
      s.sway += 0.008;
      var sx = Math.sin(s.sway) * 5;
      ctx.beginPath();
      var bx = s.x + sx;
      var by = h;
      var sh = s.baseH;
      ctx.ellipse(bx, by - sh * 0.3, 8, sh * 0.4, 0, 0, Math.PI * 2);
      ctx.moveTo(bx + 6, by - sh * 0.75);
      ctx.arc(bx, by - sh * 0.75, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74,125,255,' + s.opacity + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx - 2, by - sh * 0.78, 1, 0, Math.PI * 2);
      ctx.arc(bx + 2, by - sh * 0.78, 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,' + (s.opacity * 3) + ')';
      ctx.fill();

      s.x += s.speed;
      if (s.x > w + 30) s.x = -30;
    }
    requestAnimationFrame(draw);
  }

  setTimeout(function () {
    canvas.classList.add('show');
    draw();
  }, 4000);
})();

// ═══ PARTICLES (deferred start) ═══
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var canvas = document.getElementById('particles');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function init() {
    resize();
    window.addEventListener('resize', resize);
    var count = Math.min(70, Math.floor(window.innerWidth / 18));
    var colors = ['74,125,255', '123,94,167', '0,212,255'];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: -Math.random() * 0.5 - 0.1,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * 3)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (var p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      p.pulse += p.pulseSpeed;
      var a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color + ',' + a + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color + ',' + (a * 0.12) + ')';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  // Defer particles until after gate interaction
  setTimeout(init, 1000);
})();

// ═══ REVEAL ON SCROLL ═══
(function () {
  var els = document.querySelectorAll('.reveal, .reveal-scale, .stagger-children');
  var obs = new IntersectionObserver(function (entries) {
    for (var e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    }
  }, { threshold: 0.1 });
  els.forEach(function (el) { obs.observe(el); });
})();

// ═══ SKILL BARS ═══
(function () {
  var bars = document.querySelectorAll('.skill-bar-fill');
  var obs = new IntersectionObserver(function (entries) {
    for (var e of entries) {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.level + '%';
        obs.unobserve(e.target);
        var row = e.target.closest('.skill-row');
        if (row) {
          var burst = document.createElement('div');
          burst.className = 'level-up-burst';
          row.appendChild(burst);
          setTimeout(function () { burst.classList.add('animate'); }, 100);
          setTimeout(function () { if (burst.parentNode) burst.parentNode.removeChild(burst); }, 1200);
        }
      }
    }
  }, { threshold: 0.2 });
  bars.forEach(function (bar) { obs.observe(bar); });
})();

// ═══ STAT REROLL (counter with shuffle) ═══
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  var target = parseInt(el.dataset.target);
  var shuffleCount = 0;
  var shuffleMax = 15;
  var shuffleInterval = setInterval(function () {
    el.textContent = Math.floor(Math.random() * target * 1.5);
    shuffleCount++;
    if (shuffleCount >= shuffleMax) {
      clearInterval(shuffleInterval);
      var duration = 800;
      var start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    }
  }, 50);
}

(function () {
  var heroPanel = document.getElementById('step-identity');
  if (!heroPanel) return;

  var mutObs = new MutationObserver(function (mutations) {
    for (var m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        if (heroPanel.classList.contains('visible')) {
          setTimeout(function () {
            var counters = heroPanel.querySelectorAll('.counter');
            counters.forEach(function (c) { animateCounter(c); });
          }, 300);
          mutObs.disconnect();
        }
      }
    }
  });
  mutObs.observe(heroPanel, { attributes: true, attributeFilter: ['class'] });

  if (heroPanel.classList.contains('visible')) {
    var counters = heroPanel.querySelectorAll('.counter');
    counters.forEach(function (c) { animateCounter(c); });
    mutObs.disconnect();
  }
})();

// ═══ STEP TRACKER ═══
(function () {
  var tracker = document.getElementById('stepTracker');
  var dots = document.querySelectorAll('.step-dot');
  var sections = document.querySelectorAll('[data-step]');
  if (!tracker || !sections.length) return;

  setTimeout(function () { tracker.classList.add('show'); }, 3500);

  dots.forEach(function (dot) {
    dot.addEventListener('click', function (e) {
      e.preventDefault();
      var href = dot.getAttribute('href');
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  var stepObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var step = entry.target.dataset.step;
      var dot = tracker.querySelector('[data-step="' + step + '"]');
      if (!dot) return;
      if (entry.isIntersecting) {
        dots.forEach(function (d) {
          var ds = parseInt(d.dataset.step);
          var cs = parseInt(step);
          d.classList.remove('active');
          if (ds < cs) d.classList.add('visited');
          if (ds === cs) { d.classList.add('active'); d.classList.add('visited'); }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(function (sec) { stepObs.observe(sec); });
})();

// ═══ SCROLL DEPTH + BACK TO TOP ═══
(function () {
  var pd = document.getElementById('powerDisplay');
  var pct = document.getElementById('scrollPct');
  var btt = document.getElementById('backToTop');
  if (!pd) return;
  var shown = false;
  var bttShown = false;
  window.addEventListener('scroll', function () {
    var st = document.documentElement.scrollTop || document.body.scrollTop;
    var sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var p = Math.round((st / sh) * 100) || 0;
    pct.textContent = p;
    if (st > 200 && !shown) { pd.classList.add('show'); shown = true; }
    if (st < 100 && shown) { pd.classList.remove('show'); shown = false; }
    if (btt) {
      if (st > 600 && !bttShown) { btt.classList.add('show'); bttShown = true; }
      if (st < 400 && bttShown) { btt.classList.remove('show'); bttShown = false; }
    }
  });
  if (btt) {
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

// ═══ PAGE TITLE PER SECTION ═══
(function () {
  var baseTitle = 'Abhimithra Peddi';
  var sectionNames = {
    '1': 'AI/ML Engineer',
    '2': 'Professional Summary',
    '3': 'Technical Skills',
    '4': 'Experience',
    '5': 'Key Projects',
    '6': 'Education'
  };
  var sections = document.querySelectorAll('[data-step]');
  if (!sections.length) return;
  var titleObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var step = entry.target.dataset.step;
        var name = sectionNames[step] || '';
        document.title = baseTitle + (name ? ' — ' + name : '');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(function (sec) { titleObs.observe(sec); });
})();
