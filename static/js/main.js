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
  document.dispatchEvent(new Event('experience:start'));
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

// ═══ RESUME CHATBOT (answers come from /api/chat, grounded in the resume PDF) ═══
(function () {
  var launcher = document.getElementById('chatLauncher');
  var panel = document.getElementById('chatPanel');
  var closeBtn = document.getElementById('chatClose');
  var log = document.getElementById('chatLog');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var suggestions = document.getElementById('chatSuggestions');
  if (!launcher || !panel || !form) return;

  var sendBtn = form.querySelector('button[type="submit"]');
  var history = [];   // completed {role, content} turns, sent for follow-up questions
  var busy = false;

  // ─── Voice: Igris reads replies aloud (speechSynthesis) and takes spoken questions
  //     (SpeechRecognition). Both are built into the browser; each control only
  //     appears where the browser supports it.
  var synth = window.speechSynthesis;
  var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var voiceToggle = document.getElementById('chatVoiceToggle');
  var micBtn = document.getElementById('chatMic');
  var voiceOn = true;
  try { voiceOn = localStorage.getItem('igrisVoice') !== 'off'; } catch (e) {}
  var speakingMsg = null;
  var utterances = [];   // Chrome can drop onend for utterances nothing references

  function pickVoice() {
    var voices = synth.getVoices().filter(function (v) { return /^en/i.test(v.lang); });
    // A deep British voice suits a shadow knight; fall back to any English voice
    return voices.filter(function (v) { return /UK English Male|Daniel|Arthur|George|Ryan/i.test(v.name); })[0]
      || voices.filter(function (v) { return /en[-_]GB/i.test(v.lang); })[0]
      || voices[0] || null;
  }

  // Answers are written for reading; smooth out symbols that sound odd aloud
  function forSpeech(text) {
    return text
      .replace(/^[-*•] /gm, '')
      .replace(/ [|·—] /g, ', ')
      .replace(/&/g, ' and ')
      .replace(/~(\d)/g, 'about $1');
  }

  function stopSpeaking() {
    utterances = [];
    if (synth) synth.cancel();
    if (speakingMsg) { speakingMsg.classList.remove('speaking'); speakingMsg = null; }
  }

  function speak(text, msg, onDone) {
    if (!synth || !voiceOn) { if (onDone) onDone(); return; }
    stopSpeaking();
    // Queue sentence-sized pieces: Chrome silently stops long single utterances.
    // (No regex lookbehind here: older Safari can't parse it, which would break the whole script.)
    var parts = forSpeech(text).replace(/([.!?;])\s+/g, '$1\n').split('\n')
      .map(function (p) { return p.trim(); })
      .filter(Boolean);
    if (!parts.length) { if (onDone) onDone(); return; }
    var voice = pickVoice();
    speakingMsg = msg;
    parts.forEach(function (part, i) {
      var u = new SpeechSynthesisUtterance(part);
      utterances.push(u);
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      u.rate = 0.95;
      u.pitch = 0.8;
      if (i === 0) u.onstart = function () { if (speakingMsg === msg) msg.classList.add('speaking'); };
      if (i === parts.length - 1) u.onend = u.onerror = function () {
        if (speakingMsg === msg) { msg.classList.remove('speaking'); speakingMsg = null; }
        if (onDone) onDone();
      };
      synth.speak(u);
    });
  }

  if (synth && voiceToggle) {
    voiceToggle.hidden = false;
    voiceToggle.setAttribute('aria-pressed', String(voiceOn));
    voiceToggle.addEventListener('click', function () {
      voiceOn = !voiceOn;
      voiceToggle.setAttribute('aria-pressed', String(voiceOn));
      try { localStorage.setItem('igrisVoice', voiceOn ? 'on' : 'off'); } catch (e) {}
      if (!voiceOn) stopSpeaking();
    });
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};  // warms the voice list in Chrome
  }

  // Browsers always ask once before a site may use the microphone. Track the answer so
  // Igris can explain the prompt before it appears, and never trigger it unexpectedly.
  var micPermission = 'unknown';
  var permissionReady = (navigator.permissions && navigator.permissions.query
    ? navigator.permissions.query({ name: 'microphone' }).then(function (status) {
        micPermission = status.state;
        status.onchange = function () { micPermission = status.state; };
      })
    : Promise.reject()).catch(function () {});
  function explainMicPrompt() {
    if (micPermission !== 'prompt' || micHeld()) return;
    addMessage('bot', holdMic
      ? 'Your browser will ask to use the microphone. Allow it and I won\u2019t ask again during this visit. To stop Safari asking on every visit, tap \u201caA\u201d in the address bar, then Website Settings \u203a Microphone \u203a Allow.'
      : 'Your browser will ask once to use the microphone. Choose the option that keeps it allowed for this site (not \u201cthis time only\u201d), and it won\u2019t ask again.');
  }

  // On Apple devices (every iPhone and iPad browser, and Safari on Mac) speech recognition
  // asks for the microphone again each time it starts, unless the page already has the
  // microphone open. There, the first mic tap opens it once and Igris holds it while voice
  // is in use, releasing it when the chat closes (unless "Arise" is on).
  var ua = navigator.userAgent;
  var holdMic = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) &&
    (navigator.maxTouchPoints > 1 || (/Safari\//.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua))));
  var micStream = null;
  function micHeld() {
    return !!micStream && micStream.getAudioTracks().some(function (t) { return t.readyState === 'live'; });
  }
  function holdMicThen(done) {   // done(ok); synchronous where nothing needs holding
    if (!holdMic || micHeld() || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { done(true); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      releaseMic();
      micStream = stream;
      done(true);
    }, function () { done(false); });
  }
  function releaseMic() {
    if (micStream) micStream.getTracks().forEach(function (t) { t.stop(); });
    micStream = null;
  }
  // Igris starts the mic on its own (follow-ups, "Arise") only when that can't pop up a prompt
  function canListenQuietly() {
    return holdMic ? micHeld() : micPermission !== 'prompt' && micPermission !== 'denied';
  }
  window.addEventListener('pagehide', releaseMic);

  var rec = null;
  var listening = false;
  var followUp = false;   // listening for a follow-up on its own, like a voice assistant
  if (Recognition && micBtn) {
    rec = new Recognition();
    rec.lang = /^en/i.test(navigator.language) ? navigator.language : 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    var heard = '';

    rec.onstart = function () {
      listening = true;
      heard = '';
      micBtn.setAttribute('aria-pressed', 'true');
      micBtn.setAttribute('aria-label', 'Stop listening');
      input.value = '';
      input.placeholder = 'Listening…';
    };
    rec.onresult = function (e) {
      var text = '';
      for (var i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      input.value = text;
      if (e.results[e.results.length - 1].isFinal) heard = text;
    };
    rec.onerror = function (e) {
      var msg = {
        'not-allowed': 'Microphone access is blocked. Allow it in your browser settings to ask by voice.',
        'service-not-allowed': 'Voice input isn\'t available in this browser. Please type your question.',
        'no-speech': 'I didn\'t catch that. Tap the mic and try again.',
        'audio-capture': 'No microphone was found.',
        'network': 'Voice input needs an internet connection. Please type your question.'
      }[e.error];
      if (e.error === 'no-speech' && followUp) return;  // the visitor is done talking
      if (msg) addMessage('bot', msg, 'error');
    };
    rec.onend = function () {
      listening = false;
      followUp = false;
      setTimeout(startWake, 300);
      micBtn.setAttribute('aria-pressed', 'false');
      micBtn.setAttribute('aria-label', 'Ask by voice');
      input.placeholder = 'Ask about skills, experience…';
      if (heard.trim()) ask(heard, true);
    };

    micBtn.hidden = false;
    micBtn.addEventListener('click', function () {
      if (listening) { rec.stop(); return; }
      if (busy) return;
      stopSpeaking();
      stopWake();
      explainMicPrompt();
      holdMicThen(function (ok) {
        if (!ok) { addMessage('bot', 'Microphone access is blocked. Allow it in your browser settings to ask by voice.', 'error'); return; }
        try { rec.start(); } catch (e) {}  // start() throws if a session is already running
      });
    });
    // Typing takes over from an automatic follow-up
    input.addEventListener('keydown', function () { if (listening && followUp) rec.abort(); });
  }

  function startQuestionMic(isFollowUp) {
    if (!rec || listening || busy || panel.hidden || !canListenQuietly()) return;
    try { rec.start(); followUp = !!isFollowUp; } catch (e) {}
  }

  // ─── "Arise": an opt-in wake word. While it is on and the chat is closed, a second
  //     recognizer listens continuously; hearing "Arise" opens Igris, who greets the
  //     visitor and then listens for a question. "Arise, <question>" asks it directly.
  //     A dot on the launcher shows whenever the mic is listening for the wake word.
  var wakeToggle = document.getElementById('chatWakeToggle');
  // Speech engines often hear "Arise" as "a rise"; accept that only at the start of a
  // phrase, so ordinary speech ("there was a rise in prices") doesn't summon Igris
  var WAKE_WORD = /^\W*a ?rise\b|\barise\b/i;
  var wakeRec = null;
  var wakeOn = false;
  var wakeRunning = false;
  var wakeStartedAt = 0;
  var quickEnds = 0;
  var wakeTimer = null;

  function wakeShouldRun() {
    return wakeOn && panel.hidden && !listening && !document.hidden && root.classList.contains('started');
  }
  function startWake() {
    clearTimeout(wakeTimer);
    if (!wakeRec || wakeRunning || !wakeShouldRun() || !canListenQuietly()) return;
    try { wakeRec.start(); wakeRunning = true; } catch (e) {}
  }
  function stopWake() {
    clearTimeout(wakeTimer);
    if (wakeRec && wakeRunning) wakeRec.abort();
  }
  function setWake(on) {
    wakeOn = on;
    if (wakeToggle) wakeToggle.setAttribute('aria-pressed', String(on));
    try { localStorage.setItem('igrisWake', on ? 'on' : 'off'); } catch (e) {}
    if (on) startWake(); else { stopWake(); if (panel.hidden) releaseMic(); }
  }

  function summon(question) {
    stopWake();
    open();
    if (question.split(/\s+/).length >= 2) {
      // An earlier answer may still be loading; ask this one as soon as it arrives
      if (busy) queuedQuestion = question; else ask(question, true);
      return;
    }
    // Start listening only after the greeting has been spoken and the wake
    // recognizer has released the mic, so Igris doesn't hear itself
    var waiting = 2;
    function ready() { if (--waiting === 0) setTimeout(startQuestionMic, 150); }
    wakeReleased = ready;
    var greeting = 'I am here, my liege. What would you like to know about Abhimithra?';
    speak(greeting, addMessage('bot', greeting), ready);
  }
  var wakeReleased = null;
  var queuedQuestion = null;

  if (Recognition && wakeToggle) {
    wakeRec = new Recognition();
    wakeRec.lang = rec ? rec.lang : 'en-US';
    wakeRec.continuous = true;
    wakeRec.interimResults = true;

    wakeRec.onstart = function () {
      wakeRunning = true;
      wakeStartedAt = Date.now();
      launcher.classList.add('wake-listening');
      launcher.title = 'Listening for \u201cArise\u201d';
    };
    wakeRec.onresult = function (e) {
      if (!panel.hidden) return;  // already summoned; ignore a repeated "Arise"
      for (var i = e.resultIndex; i < e.results.length; i++) {
        // Wait for the final result so "Arise, where does he work?" arrives whole
        if (!e.results[i].isFinal) continue;
        var text = e.results[i][0].transcript;
        var m = text.match(WAKE_WORD);
        if (m) {
          summon(text.slice(m.index + m[0].length).replace(/^[\s,.!?]+/, '').trim());
          return;
        }
      }
    };
    wakeRec.onerror = function (e) {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
        setWake(false);
        addMessage('bot', 'I couldn\'t start listening for \u201cArise\u201d because the microphone isn\'t available. Allow microphone access and switch it on again.', 'error');
      }
    };
    wakeRec.onend = function () {
      wakeRunning = false;
      launcher.classList.remove('wake-listening');
      launcher.removeAttribute('title');
      if (wakeReleased) { var cb = wakeReleased; wakeReleased = null; cb(); }
      if (!wakeShouldRun()) return;
      // Browsers end continuous recognition periodically; restart, backing off if it keeps failing
      quickEnds = Date.now() - wakeStartedAt < 2000 ? quickEnds + 1 : 0;
      wakeTimer = setTimeout(startWake, quickEnds > 3 ? 10000 : 250);
    };

    wakeToggle.hidden = false;
    wakeToggle.addEventListener('click', function () {
      if (wakeOn) {
        setWake(false);
        addMessage('bot', 'Understood. I will no longer listen for \u201cArise\u201d.');
        return;
      }
      var enable = function () {
        setWake(true);
        var msg = 'Say \u201cArise\u201d any time to summon me, even with this chat closed. I listen only while this switch is on; the glowing dot on my button shows when I am listening.';
        speak(msg, addMessage('bot', msg));
      };
      // Ask for microphone permission now, while the visitor is clicking
      explainMicPrompt();
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
          if (holdMic) { releaseMic(); micStream = stream; }   // keep it, so listening won't ask again
          else stream.getTracks().forEach(function (t) { t.stop(); });
          micPermission = 'granted';
          enable();
        }, function () {
          addMessage('bot', 'Microphone access is blocked, so I can\'t listen for \u201cArise\u201d. Allow it in your browser settings and try again.', 'error');
        });
      } else {
        enable();
      }
    });

    // Remembered from an earlier visit: resume only if the microphone is still allowed, so a
    // visit never opens with a surprise permission prompt. Otherwise the switch stays off
    // until the visitor turns it on again (the saved choice is kept for when access returns).
    var saved = null;
    try { saved = localStorage.getItem('igrisWake'); } catch (e) {}
    if (saved === 'on') {
      permissionReady.then(function () {
        // Apple devices would ask again without a held microphone, so they wait for a tap
        if (micPermission === 'granted' && !holdMic) {
          wakeOn = true;
          wakeToggle.setAttribute('aria-pressed', 'true');
          startWake();
        } else if (micPermission === 'denied') {
          setWake(false);
        }
      });
    }
    document.addEventListener('experience:start', startWake);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopWake(); else startWake();
    });
  }

  function open() {
    stopWake();
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    input.focus();
  }
  function close() {
    stopSpeaking();
    if (listening) rec.abort();
    if (!wakeOn) releaseMic();
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
    setTimeout(startWake, 300);
  }
  launcher.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  panel.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  // Plain text in, safe DOM out: "- " lines become a list, other lines paragraphs
  function renderText(el, text) {
    var list = null;
    text.split('\n').forEach(function (line) {
      line = line.trim();
      if (!line) { list = null; return; }
      if (/^[-*•] /.test(line)) {
        if (!list) { list = document.createElement('ul'); el.appendChild(list); }
        var li = document.createElement('li');
        li.textContent = line.slice(2);
        list.appendChild(li);
      } else {
        list = null;
        var p = document.createElement('p');
        p.textContent = line;
        el.appendChild(p);
      }
    });
  }

  function addMessage(role, text, extraClass) {
    var msg = document.createElement('div');
    msg.className = 'chat-msg ' + role + (extraClass ? ' ' + extraClass : '');
    renderText(msg, text);
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
    return msg;
  }

  function addSources(msg, sources) {
    var seen = [];
    (sources || []).forEach(function (s) {
      if (seen.indexOf(s.section) === -1) seen.push(s.section);
    });
    if (!seen.length) return;
    var el = document.createElement('div');
    el.className = 'chat-sources';
    el.textContent = 'Source: resume · ' + seen.join(', ');
    msg.appendChild(el);
  }

  function setBusy(state) {
    busy = state;
    sendBtn.disabled = state;
    if (micBtn) micBtn.disabled = state;
  }

  function ask(question, byVoice) {
    question = question.trim();
    if (!question || busy) return;
    stopSpeaking();
    if (suggestions) suggestions.hidden = true;
    addMessage('user', question);
    input.value = '';
    setBusy(true);

    var typing = document.createElement('div');
    typing.className = 'chat-msg bot chat-typing';
    typing.setAttribute('aria-label', 'Assistant is typing');
    typing.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, history: history.slice(-6) })
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.answer) throw new Error(data.error || 'The system could not answer right now. Please try again.');
          return data;
        });
      })
      .then(function (data) {
        typing.remove();
        var msg = addMessage('bot', data.answer);
        addSources(msg, data.sources);
        // The visitor may have closed the chat while waiting; don't talk to an empty room.
        // A spoken question gets a spoken answer, then Igris listens for a follow-up.
        if (!panel.hidden) speak(data.answer, msg, byVoice && voiceOn ? function () {
          if (voiceOn) setTimeout(function () { startQuestionMic(true); }, 250);
        } : null);
        history.push({ role: 'user', content: question }, { role: 'assistant', content: data.answer });
      })
      .catch(function (err) {
        typing.remove();
        var text = err instanceof TypeError ? 'Connection lost. Check your network and try again.' : err.message;
        addMessage('bot', text, 'error');
      })
      .then(function () {
        setBusy(false);
        input.focus();
        if (queuedQuestion) { var next = queuedQuestion; queuedQuestion = null; ask(next, true); }
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
  });
  if (suggestions) {
    suggestions.addEventListener('click', function (e) {
      if (e.target.tagName === 'BUTTON') ask(e.target.textContent);
    });
  }
})();
