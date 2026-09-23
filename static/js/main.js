// ═══════════════════════════════════════════
//   SOLO LEVELING PORTFOLIO — MAIN JS
// ═══════════════════════════════════════════

// Tells the inline <head> script that JS is running (otherwise it falls back to the no-JS page)
window.__siteReady = true;

var root = document.documentElement;
var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function isLight() { return root.getAttribute('data-theme') === 'light'; }

// Counters show their real value in the HTML (for no-JS); reset them until they animate
document.querySelectorAll('.counter').forEach(function (c) {
  if (!reducedMotion) c.textContent = '0';
});

// ═══ THEME TOGGLE (initial theme is set inline in <head> to avoid a flash) ═══
(function () {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var next = isLight() ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

// ═══ EXPERIENCE START (runs once, when the visitor is past the gate) ═══
var experienceStarted = false;
function startExperience(fromGate) {
  if (experienceStarted) return;
  experienceStarted = true;
  root.classList.add('started');
  startReveals();
  startSkillBars();
  startParticles();
  startSoldiers();
  startStepTracker();
  if (fromGate) setTimeout(showSystemAlerts, 800);
}

// ═══ DUNGEON GATE (click, Enter/Space on the button, or Escape) ═══
(function () {
  var gate = document.getElementById('gate-overlay');
  var skipGate = !gate || reducedMotion || root.classList.contains('gate-seen');
  if (skipGate) {
    if (gate) gate.style.display = 'none';
    startExperience(false);
    return;
  }

  // Keep keyboard and screen-reader users inside the gate while it is open
  var background = [];
  Array.prototype.forEach.call(document.body.children, function (el) {
    if (el !== gate && el.tagName !== 'SCRIPT') {
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
      background.push(el);
    }
  });

  var enterBtn = document.getElementById('gateEnter');
  if (enterBtn) enterBtn.focus();

  var dismissed = false;
  function dismissGate() {
    if (dismissed) return;
    dismissed = true;
    try { sessionStorage.setItem('gateSeen', '1'); } catch (e) {}
    document.removeEventListener('keydown', onKey);
    background.forEach(function (el) {
      el.removeAttribute('inert');
      el.removeAttribute('aria-hidden');
    });
    gate.classList.add('fade-out');
    startExperience(true);
    setTimeout(function () { gate.style.display = 'none'; }, 800);
  }
  function onKey(e) {
    if (e.key === 'Escape') dismissGate();
  }
  gate.addEventListener('click', dismissGate);
  document.addEventListener('keydown', onKey);
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
  if (!alertEl) return;
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
  setTimeout(showNext, 300);
}

// ═══ SHADOW CURSOR AURA ═══
(function () {
  if (reducedMotion) return;
  if ('ontouchstart' in window) return;
  var aura = document.getElementById('shadow-aura');
  if (!aura) return;
  document.addEventListener('mousemove', function (e) {
    aura.style.left = e.clientX + 'px';
    aura.style.top = e.clientY + 'px';
  });
})();

// ═══ SHADOW SOLDIERS ═══
function startSoldiers() {
  var canvas = document.getElementById('shadowSoldiers');
  if (!canvas || reducedMotion) return;
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
    requestAnimationFrame(draw);
    // Hidden by CSS in light theme — skip the drawing work
    if (isLight()) return;
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
  }

  setTimeout(function () {
    canvas.classList.add('show');
    draw();
  }, 1500);
}

// ═══ PARTICLES ═══
function startParticles() {
  var canvas = document.getElementById('particles');
  if (!canvas || reducedMotion) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
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
  draw();
}

// ═══ REVEAL ON SCROLL (hero counters start when the hero is revealed) ═══
function startReveals() {
  var heroPanel = document.getElementById('step-identity');
  var els = document.querySelectorAll('.reveal, .reveal-scale, .stagger-children');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      obs.unobserve(e.target);
      if (e.target === heroPanel) {
        setTimeout(function () {
          heroPanel.querySelectorAll('.counter').forEach(animateCounter);
        }, 300);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(function (el) { obs.observe(el); });
}

// ═══ SKILL BARS ═══
function startSkillBars() {
  var bars = document.querySelectorAll('.skill-bar-fill');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.style.width = e.target.dataset.level + '%';
      obs.unobserve(e.target);
      var row = e.target.closest('.skill-row');
      if (row && !reducedMotion) {
        var burst = document.createElement('div');
        burst.className = 'level-up-burst';
        row.appendChild(burst);
        setTimeout(function () { burst.classList.add('animate'); }, 100);
        setTimeout(function () { burst.remove(); }, 1200);
      }
    });
  }, { threshold: 0.2 });
  bars.forEach(function (bar) { obs.observe(bar); });
}

// ═══ STAT REROLL (counter with shuffle) ═══
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  var target = parseInt(el.dataset.target, 10);
  if (reducedMotion) { el.textContent = target; return; }
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

// ═══ ACTIVE SECTION (a section is "current" while it crosses the middle of the viewport,
//     which works even for sections taller than the screen) ═══
var sectionNames = {
  '1': 'AI/ML Engineer',
  '2': 'Professional Summary',
  '3': 'Technical Skills',
  '4': 'Experience',
  '5': 'Key Projects',
  '6': 'Education'
};
function setActiveStep(step) {
  var cs = parseInt(step, 10);
  document.querySelectorAll('.step-dot').forEach(function (d) {
    var ds = parseInt(d.dataset.step, 10);
    d.classList.toggle('active', ds === cs);
    if (ds <= cs) d.classList.add('visited');
  });
  var name = sectionNames[step] || '';
  document.title = 'Abhimithra Peddi' + (name ? ' — ' + name : '');
}

function startStepTracker() {
  var tracker = document.getElementById('stepTracker');
  var sections = document.querySelectorAll('section[data-step]');
  if (!tracker || !sections.length) return;

  setTimeout(function () { tracker.classList.add('show'); }, 1200);

  tracker.querySelectorAll('.step-dot').forEach(function (dot) {
    dot.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(dot.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  var stepObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActiveStep(entry.target.dataset.step);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (sec) { stepObs.observe(sec); });
}

// ═══ SCROLL DEPTH + BACK TO TOP (one update per frame) ═══
(function () {
  var pd = document.getElementById('powerDisplay');
  var pct = document.getElementById('scrollPct');
  var btt = document.getElementById('backToTop');
  if (!pd) return;
  var shown = false;
  var bttShown = false;
  var ticking = false;
  function update() {
    ticking = false;
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
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  if (btt) {
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }
})();
