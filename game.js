/* =====================================================================
   ASHEN BLADE — arena survivor (Telegram Mini App)
   Pure canvas + WebAudio. Sprites from the uploaded packs; all magic,
   backgrounds, lighting and SFX are generated in code (no extra assets).
   ===================================================================== */
(function () {
'use strict';

/* ---------- Telegram ---------- */
var TG = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (TG) { try { TG.ready(); TG.expand(); TG.setHeaderColor && TG.setHeaderColor('#0b0710'); TG.disableVerticalSwipes && TG.disableVerticalSwipes(); } catch (e) {} }
function haptic(kind) {
  if (!TG || !TG.HapticFeedback) return;
  try {
    if (kind === 'sel') TG.HapticFeedback.selectionChanged();
    else if (kind === 'heavy') TG.HapticFeedback.impactOccurred('heavy');
    else if (kind === 'rigid') TG.HapticFeedback.impactOccurred('rigid');
    else if (kind === 'med') TG.HapticFeedback.impactOccurred('medium');
    else if (kind === 'light') TG.HapticFeedback.impactOccurred('light');
    else if (kind === 'warn') TG.HapticFeedback.notificationOccurred('warning');
    else if (kind === 'err') TG.HapticFeedback.notificationOccurred('error');
    else if (kind === 'ok') TG.HapticFeedback.notificationOccurred('success');
  } catch (e) {}
}

/* ---------- Math / utils ---------- */
var PI = Math.PI, TAU = PI * 2, abs = Math.abs, max = Math.max, min = Math.min,
    sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt, floor = Math.floor,
    rnd = Math.random, atan2 = Math.atan2, hypot = Math.hypot;
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rr(a, b) { return a + rnd() * (b - a); }
function ri(a, b) { return floor(rr(a, b + 1)); }
function pick(arr) { return arr[(rnd() * arr.length) | 0]; }
function sign(x) { return x < 0 ? -1 : 1; }

/* ---------- Save ---------- */
var SAVE_KEY = 'ashenblade.v1';
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; } }
function storeSave(o) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(o)); } catch (e) {} }
var SAVE = loadSave();
if (SAVE.best == null) SAVE.best = 0;
if (SAVE.bestWave == null) SAVE.bestWave = 0;
if (SAVE.muted == null) SAVE.muted = false;
if (SAVE.plays == null) SAVE.plays = 0;

/* =====================================================================
   CANVAS / VIEWPORT
   ===================================================================== */
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var DPR = 1, VW = 0, VH = 0, GROUND = 0, SCALE = 1;

function resize() {
  var w = window.innerWidth, h = window.innerHeight;
  if (TG && TG.viewportStableHeight) h = TG.viewportStableHeight;
  DPR = min(window.devicePixelRatio || 1, 2);
  VW = w; VH = h;
  canvas.width = (w * DPR) | 0;
  canvas.height = (h * DPR) | 0;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  GROUND = VH * 0.84;
  // character scale relative to a 420px reference height, clamped
  SCALE = clamp(VH / 400, 1.1, 2.4);
}
window.addEventListener('resize', resize);
if (TG && TG.onEvent) { try { TG.onEvent('viewportChanged', resize); } catch (e) {} }
resize();

/* =====================================================================
   ASSET LOADING + SPRITE SLICING
   Each sheet is a horizontal strip of equal frames. We slice every frame
   into its own small canvas so draws are cheap and we can tint/flip.
   ===================================================================== */
var SHEETS = {
  knight: { w: 120, h: 80, dir: 'assets/knight/', anims: {
    idle:   ['idle.png', 10], run: ['run.png', 10], attack1: ['attack1.png', 4],
    attack2:['attack2.png', 6], attack3: ['attack3.png', 10], roll: ['roll.png', 12],
    hit:    ['hit.png', 1], death: ['death.png', 10], jump: ['jump.png', 3], fall: ['fall.png', 3]
  }},
  demon: { w: 100, h: 100, dir: 'assets/demon/', anims: {
    idle: ['idle.png', 6], walk: ['walk.png', 8], attack: ['attack.png', 7], hurt: ['hurt.png', 4], death: ['death.png', 4]
  }},
  blood: { w: 100, h: 100, dir: 'assets/blood/', anims: {
    idle: ['idle.png', 6], walk: ['walk.png', 8], attack: ['attack.png', 8], hurt: ['hurt.png', 4], death: ['death.png', 4]
  }}
};

var ASSETS = {};        // ASSETS[kind][anim] = [frameCanvas, ...]
var TINTED = {};        // cache of tinted frame sets

function sliceSheet(img, fw, fh, n) {
  var frames = [];
  for (var i = 0; i < n; i++) {
    var c = document.createElement('canvas');
    c.width = fw; c.height = fh;
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(img, i * fw, 0, fw, fh, 0, 0, fw, fh);
    frames.push(c);
  }
  return frames;
}

// Build a recolored copy of a frame set (for the Dark Knight boss).
function tintFrames(frames, color, amount) {
  var out = [];
  for (var i = 0; i < frames.length; i++) {
    var src = frames[i], c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = amount;
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    out.push(c);
  }
  return out;
}

function loadImage(src) {
  return new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () { res(im); };
    im.onerror = function () { rej(new Error('load ' + src)); };
    im.src = src;
  });
}

function loadAll(onProgress) {
  var tasks = [];
  Object.keys(SHEETS).forEach(function (kind) {
    var sh = SHEETS[kind];
    ASSETS[kind] = {};
    Object.keys(sh.anims).forEach(function (anim) {
      var def = sh.anims[anim];
      tasks.push({ kind: kind, anim: anim, src: sh.dir + def[0], n: def[1], w: sh.w, h: sh.h });
    });
  });
  var done = 0, total = tasks.length;
  return Promise.all(tasks.map(function (t) {
    return loadImage(t.src).then(function (img) {
      ASSETS[t.kind][t.anim] = sliceSheet(img, t.w, t.h, t.n);
      done++; if (onProgress) onProgress(done / total);
    });
  })).then(function () {
    // Dark-knight boss = tinted knight frames (programmatic recolor).
    TINTED.boss = {};
    Object.keys(ASSETS.knight).forEach(function (anim) {
      TINTED.boss[anim] = tintFrames(ASSETS.knight[anim], '#8a1030', 0.55);
    });
  });
}

function framesFor(kind, anim) {
  if (kind === 'boss') return TINTED.boss[anim] || ASSETS.knight[anim];
  return ASSETS[kind][anim];
}

/* =====================================================================
   ANIMATION METADATA  (fps, loop, active-hit frame window)
   ===================================================================== */
var ANIM = {
  'knight:idle':   { fps: 10, loop: true },
  'knight:run':    { fps: 16, loop: true },
  'knight:attack1':{ fps: 18, loop: false, hit: [2, 2] },
  'knight:attack2':{ fps: 18, loop: false, hit: [3, 4] },
  'knight:attack3':{ fps: 20, loop: false, hit: [5, 8] },
  'knight:roll':   { fps: 24, loop: false },
  'knight:hit':    { fps: 10, loop: false },
  'knight:death':  { fps: 12, loop: false },
  'knight:jump':   { fps: 12, loop: false },
  'knight:fall':   { fps: 12, loop: true },
  'demon:idle':  { fps: 8,  loop: true },
  'demon:walk':  { fps: 12, loop: true },
  'demon:attack':{ fps: 14, loop: false, hit: [4, 5] },
  'demon:hurt':  { fps: 16, loop: false },
  'demon:death': { fps: 10, loop: false },
  'blood:idle':  { fps: 7,  loop: true },
  'blood:walk':  { fps: 10, loop: true },
  'blood:attack':{ fps: 12, loop: false, hit: [4, 6] },
  'blood:hurt':  { fps: 14, loop: false },
  'blood:death': { fps: 9,  loop: false }
};
function meta(kind, anim) {
  var k = (kind === 'boss' ? 'knight' : kind) + ':' + anim;
  return ANIM[k] || { fps: 10, loop: true };
}

/* =====================================================================
   INPUT  (keyboard + on-screen buttons -> shared intent object)
   ===================================================================== */
var IN = { left: false, right: false, magicHeld: false };
var QUEUE = { attack: false, dash: false, magicUp: false };
function pressAttack() { QUEUE.attack = true; }
function pressDash() { QUEUE.dash = true; }
function magicDown() { IN.magicHeld = true; }
function magicUp() { if (IN.magicHeld) { IN.magicHeld = false; QUEUE.magicUp = true; } }

window.addEventListener('keydown', function (e) {
  if (e.repeat) return;
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA': IN.left = true; break;
    case 'ArrowRight': case 'KeyD': IN.right = true; break;
    case 'KeyJ': case 'KeyZ': pressAttack(); break;
    case 'KeyK': case 'KeyX': case 'ShiftLeft': pressDash(); break;
    case 'KeyL': case 'KeyC': case 'Space': magicDown(); e.preventDefault(); break;
    case 'Enter': if (GAME.state !== 'play') startRun(); break;
  }
});
window.addEventListener('keyup', function (e) {
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA': IN.left = false; break;
    case 'ArrowRight': case 'KeyD': IN.right = false; break;
    case 'KeyL': case 'KeyC': case 'Space': magicUp(); break;
  }
});

function bindHold(el, on, off) {
  if (!el) return;
  var down = function (e) { e.preventDefault(); el.classList.add('on'); on(); };
  var up = function (e) { if (e) e.preventDefault(); el.classList.remove('on'); if (off) off(); };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('pointerleave', up);
}
function bindTap(el, fn) {
  if (!el) return;
  el.addEventListener('pointerdown', function (e) { e.preventDefault(); el.classList.add('on'); fn(); });
  var clr = function () { el.classList.remove('on'); };
  el.addEventListener('pointerup', clr); el.addEventListener('pointercancel', clr); el.addEventListener('pointerleave', clr);
}
bindHold(document.getElementById('btn-left'),  function () { IN.left = true; },  function () { IN.left = false; });
bindHold(document.getElementById('btn-right'), function () { IN.right = true; }, function () { IN.right = false; });
bindTap(document.getElementById('btn-attack'), pressAttack);
bindTap(document.getElementById('btn-dash'), pressDash);
bindHold(document.getElementById('btn-magic'), magicDown, magicUp);

/* =====================================================================
   AUDIO — fully synthesized (WebAudio). No sound files.
   ===================================================================== */
var AC = null, MASTER = null, MUSIC = null, noiseBuf = null;
function initAudio() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    MASTER = AC.createGain(); MASTER.gain.value = SAVE.muted ? 0 : 0.9; MASTER.connect(AC.destination);
    MUSIC = AC.createGain(); MUSIC.gain.value = SAVE.muted ? 0 : 0.5; MUSIC.connect(MASTER);
    var n = AC.sampleRate * 1.5, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = rnd() * 2 - 1;
    noiseBuf = b;
    startMusic();
  } catch (e) { AC = null; }
}
function resumeAudio() { if (AC && AC.state === 'suspended') AC.resume(); }
function setMuted(m) {
  SAVE.muted = m; storeSave(SAVE);
  if (MASTER) MASTER.gain.value = m ? 0 : 0.9;
  if (MUSIC) MUSIC.gain.value = m ? 0 : 0.5;
}
function env(g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function tone(type, f0, f1, a, d, peak, dest) {
  if (!AC) return; var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(max(1, f1), t + a + d);
  env(g, t, a, d, peak); o.connect(g); g.connect(dest || MASTER); o.start(t); o.stop(t + a + d + 0.05);
}
function noise(a, d, peak, lp, dest) {
  if (!AC) return; var t = AC.currentTime, s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter();
  s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = lp || 2000; env(g, t, a, d, peak);
  s.connect(f); f.connect(g); g.connect(dest || MASTER); s.start(t); s.stop(t + a + d + 0.05);
}
var SFX = {
  swish: function () { noise(0.005, 0.12, 0.25, 3800); tone('triangle', 420, 180, 0.005, 0.1, 0.08); },
  hit:   function () { noise(0.002, 0.09, 0.5, 2600); tone('square', 180, 90, 0.002, 0.09, 0.18); },
  heavy: function () { noise(0.002, 0.18, 0.7, 1400); tone('sawtooth', 150, 60, 0.004, 0.2, 0.25); },
  magic: function () { tone('sawtooth', 120, 900, 0.02, 0.1, 0.2); tone('sine', 900, 180, 0.02, 0.5, 0.25); noise(0.01, 0.5, 0.4, 3200); },
  charge:function () { tone('sine', 200, 700, 0.4, 0.1, 0.12); },
  die:   function () { tone('sawtooth', 300, 70, 0.01, 0.4, 0.22); noise(0.01, 0.3, 0.3, 1600); },
  hurt:  function () { tone('square', 300, 120, 0.005, 0.18, 0.22); noise(0.003, 0.1, 0.3, 1800); },
  pickup:function () { tone('sine', 700, 1250, 0.01, 0.14, 0.18); tone('sine', 1050, 1600, 0.02, 0.14, 0.12); },
  ui:    function () { tone('triangle', 500, 760, 0.005, 0.08, 0.15); },
  wave:  function () { tone('sine', 220, 440, 0.03, 0.3, 0.2); tone('sine', 330, 660, 0.05, 0.4, 0.14); },
  boss:  function () { tone('sawtooth', 90, 55, 0.05, 1.1, 0.3); noise(0.05, 1.0, 0.3, 900); }
};
function sfx(name) { if (AC && SFX[name]) { try { SFX[name](); } catch (e) {} } }

// Simple evolving dark-fantasy drone (two detuned saws + slow filter LFO).
function startMusic() {
  if (!AC) return;
  var base = AC.createGain(); base.gain.value = 0.12; base.connect(MUSIC);
  var filt = AC.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 500; filt.Q.value = 6; filt.connect(base);
  [55, 55.4, 82.5].forEach(function (f) { var o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(filt); o.start(); });
  var lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 0.05; lg.gain.value = 260;
  lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
}

/* =====================================================================
   VFX — pooled particles, slash arcs, shock rings, floating text, shake
   ===================================================================== */
var MAXP = 420;
var P = new Array(MAXP);
(function () { for (var i = 0; i < MAXP; i++) P[i] = { on: false }; })();
var pHead = 0;
function spawnP(x, y, vx, vy, life, size, color, grav, fade, add) {
  for (var k = 0; k < MAXP; k++) {
    var i = (pHead + k) % MAXP, p = P[i];
    if (!p.on) {
      p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life;
      p.size = size; p.color = color; p.grav = grav || 0; p.fade = fade !== false; p.add = !!add;
      pHead = (i + 1) % MAXP; return p;
    }
  }
  return null;
}
function burstEmber(x, y, n, spread, up) {
  for (var i = 0; i < n; i++) {
    var a = -PI / 2 + rr(-spread, spread), s = rr(0.5, 2.4) * (up || 1);
    spawnP(x, y, cos(a) * s * 30, sin(a) * s * 30, rr(0.5, 1.1), rr(1.5, 3.5), pick(['#ffd27a', '#ff8a3c', '#ff5a2a']), -20, true, true);
  }
}
function burstSpark(x, y, n, col) {
  for (var i = 0; i < n; i++) { var a = rr(0, TAU), s = rr(40, 220); spawnP(x, y, cos(a) * s, sin(a) * s, rr(0.15, 0.4), rr(1, 2.5), col || '#ffe9b0', 120, true, true); }
}
function burstBlood(x, y, n, col) {
  for (var i = 0; i < n; i++) { var a = rr(-PI, 0), s = rr(60, 240); spawnP(x, y, cos(a) * s, sin(a) * s, rr(0.3, 0.7), rr(2, 4), col || '#9b1b2e', 520, true, false); }
}
function burstSmoke(x, y, n, col) {
  for (var i = 0; i < n; i++) { var a = -PI / 2 + rr(-0.9, 0.9); spawnP(x, y, cos(a) * rr(10, 40), sin(a) * rr(20, 70), rr(0.6, 1.3), rr(5, 11), col || 'rgba(60,30,60,1)', -8, true, false); }
}

var RINGS = [];
function ring(x, y, r0, r1, life, color, width) { RINGS.push({ x: x, y: y, r0: r0, r1: r1, r: r0, life: life, max: life, color: color, w: width || 4 }); }
var SLASH = [];
function slash(x, y, dir, reach, kind) { SLASH.push({ x: x, y: y, dir: dir, reach: reach, life: 0.16, max: 0.16, kind: kind || 0 }); }
var FLOAT = [];
function floatText(x, y, txt, color, big) { FLOAT.push({ x: x, y: y, txt: '' + txt, color: color || '#fff', life: 0.9, max: 0.9, big: !!big, vy: -46 }); }

var shakeT = 0, shakeMag = 0;
function shake(mag, dur) { shakeMag = max(shakeMag, mag); shakeT = max(shakeT, dur); }
var flashT = 0, flashCol = '#fff';
function flash(col, dur) { flashCol = col; flashT = dur; }

function updateVFX(dt) {
  for (var i = 0; i < MAXP; i++) {
    var p = P[i]; if (!p.on) continue;
    p.life -= dt; if (p.life <= 0) { p.on = false; continue; }
    p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (var r = RINGS.length - 1; r >= 0; r--) { var R = RINGS[r]; R.life -= dt; if (R.life <= 0) { RINGS.splice(r, 1); continue; } var t = 1 - R.life / R.max; R.r = lerp(R.r0, R.r1, t); }
  for (var s = SLASH.length - 1; s >= 0; s--) { SLASH[s].life -= dt; if (SLASH[s].life <= 0) SLASH.splice(s, 1); }
  for (var f = FLOAT.length - 1; f >= 0; f--) { var F = FLOAT[f]; F.life -= dt; F.y += F.vy * dt; F.vy *= 0.9; if (F.life <= 0) FLOAT.splice(f, 1); }
  if (shakeT > 0) { shakeT -= dt; if (shakeT <= 0) shakeMag = 0; }
  if (flashT > 0) flashT -= dt;
}

/* =====================================================================
   GAME STATE + ENTITIES
   ===================================================================== */
var GAME = {
  state: 'menu', hero: null, enemies: [], orbs: [],
  wave: 0, score: 0, kills: 0, combo: 0, comboTimer: 0, mult: 1,
  spawnQueue: [], toSpawn: 0, breather: 0, banner: '', bannerSub: '', bannerT: 0,
  time: 0, bossActive: false, slowmo: 0
};

function setAnim(e, anim, reset) {
  if (e.alias && e.alias[anim]) anim = e.alias[anim];
  if (e.anim === anim && !reset) return;
  e.anim = anim; e.frame = 0; e.frameT = 0; e.animDone = false;
}
function advAnim(e, dt) {
  var m = meta(e.kind, e.anim), frames = framesFor(e.kind, e.anim);
  if (!frames) return;
  var n = frames.length;
  e.frameT += dt * m.fps;
  while (e.frameT >= 1) {
    e.frameT -= 1; e.frame++;
    if (e.frame >= n) {
      if (m.loop) e.frame = 0; else { e.frame = n - 1; e.animDone = true; }
    }
  }
}
function curMeta(e) { return meta(e.kind, e.anim); }
function inHitWindow(e) {
  var m = curMeta(e); if (!m.hit) return false;
  return e.frame >= m.hit[0] && e.frame <= m.hit[1];
}

/* ---------- Hero ---------- */
function makeHero() {
  return {
    kind: 'knight', x: VW * 0.5, y: GROUND, facing: 1, vx: 0,
    hp: 100, maxhp: 100, mana: 100, maxmana: 100, ember: 0, maxember: 100,
    anim: 'idle', frame: 0, frameT: 0, animDone: false,
    st: 'idle',            // idle|run|attack|roll|hit|death
    attackStep: 0, comboBuf: false, atkTimer: 0, hitSet: null,
    rollCd: 0, iframes: 0, charge: 0, charging: false, dead: false,
    knock: 0, blink: 0
  };
}

/* ---------- Enemy ---------- */
var ETYPE = {
  demon: { hp: 34, speed: 62, dmg: 10, reach: 60, scoreBase: 10, range: 58, windup: 0.0, w: 100, h: 100 },
  blood: { hp: 70, speed: 40, dmg: 18, reach: 70, scoreBase: 16, range: 66, windup: 0.1, w: 100, h: 100 },
  boss:  { hp: 520, speed: 70, dmg: 26, reach: 95, scoreBase: 220, range: 92, windup: 0.0, w: 120, h: 80 }
};
function makeEnemy(kind, side, wave) {
  var t = ETYPE[kind], mul = 1 + (wave - 1) * 0.08;
  var hp = kind === 'boss' ? t.hp * (1 + (floor(wave / 5) - 1) * 0.35) : floor(t.hp * mul);
  var x = side < 0 ? -40 : VW + 40;
  return {
    kind: kind, x: x, y: GROUND, facing: side < 0 ? 1 : -1, vx: 0,
    hp: hp, maxhp: hp, dmg: t.dmg + (wave - 1) * 0.6, speed: t.speed * (1 + (wave - 1) * 0.015),
    reach: t.reach, range: t.range, scoreBase: t.scoreBase,
    anim: 'idle', frame: 0, frameT: 0, animDone: false,
    st: 'walk', atkCd: rr(0.2, 0.9), hitDone: false, dead: false,
    hurtT: 0, stun: 0, knock: 0, flash: 0, fade: 1, isBoss: kind === 'boss',
    alias: kind === 'boss' ? { walk: 'run', attack: 'attack2', hurt: 'hit' } : null
  };
}

/* ---------- Pickup orb ---------- */
function makeOrb(x, type) {
  return { x: x, y: GROUND - rr(10, 40), type: type, vy: -rr(40, 90), life: 9, bob: rr(0, TAU), got: false };
}

/* =====================================================================
   HERO UPDATE
   ===================================================================== */
var ARENA_PAD = 26;
function nearestEnemy(x, maxd) {
  var best = null, bd = maxd || 1e9;
  for (var i = 0; i < GAME.enemies.length; i++) {
    var e = GAME.enemies[i]; if (e.dead) continue;
    var d = abs(e.x - x); if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function heroReach() { return 70 * SCALE; }

function startAttack(h) {
  h.st = 'attack'; h.attackStep = 1; h.comboBuf = false; h.hitSet = [];
  setAnim(h, 'attack1', true);
  slash(h.x + h.facing * heroReach() * 0.5, h.y - 42 * SCALE, h.facing, heroReach(), 0);
  var tgt = nearestEnemy(h.x, 240 * SCALE);
  if (tgt) h.facing = tgt.x >= h.x ? 1 : -1;
  else if (IN.left) h.facing = -1; else if (IN.right) h.facing = 1;
  sfx('swish'); haptic('light');
}
function advCombo(h) {
  h.attackStep++; h.comboBuf = false; h.hitSet = [];
  setAnim(h, 'attack' + h.attackStep, true);
  slash(h.x + h.facing * heroReach() * 0.5, h.y - 42 * SCALE, h.facing, heroReach() * (h.attackStep === 3 ? 1.3 : 1), h.attackStep === 3 ? 2 : 1);
  var tgt = nearestEnemy(h.x, 240 * SCALE);
  if (tgt) h.facing = tgt.x >= h.x ? 1 : -1;
  sfx('swish');
}
function startRoll(h) {
  h.st = 'roll'; setAnim(h, 'roll', true);
  h.rollDir = IN.left ? -1 : IN.right ? 1 : h.facing; h.facing = h.rollDir;
  h.iframes = 0.5; sfx('swish'); haptic('rigid');
}

function updateHero(dt) {
  var h = GAME.hero;
  h.rollCd -= dt; h.iframes -= dt; h.atkTimer -= dt; if (h.blink > 0) h.blink -= dt;
  if (h.knock) { h.x += h.knock * dt; h.knock *= 0.86; if (abs(h.knock) < 4) h.knock = 0; }

  if (h.st === 'death') { advAnim(h, dt); return; }

  var move = 150 * SCALE, roll = 360 * SCALE;

  // ----- discrete inputs -----
  if (QUEUE.dash && h.rollCd <= 0 && h.st !== 'roll') { startRoll(h); QUEUE.dash = false; }
  QUEUE.dash = false;
  if (QUEUE.attack) {
    if (h.st === 'idle' || h.st === 'run') startAttack(h);
    else if (h.st === 'attack') h.comboBuf = true;
    QUEUE.attack = false;
  }
  // ----- magic charge -----
  if (IN.magicHeld && (h.st === 'idle' || h.st === 'run')) {
    if (!h.charging) { h.charging = true; sfx('charge'); }
    h.charge = min(1, h.charge + dt / 0.9);
    if (rnd() < 0.6) { var a = rr(0, TAU), rad = rr(16, 34) * SCALE; spawnP(h.x + cos(a) * rad, h.y - 36 * SCALE + sin(a) * rad * 0.6, -cos(a) * 50, -sin(a) * 50 - 20, 0.3, rr(1.5, 3), '#b98bff', 0, true, true); }
  }
  if (QUEUE.magicUp) { QUEUE.magicUp = false; if (h.charging) releaseMagic(h); }

  // ----- state machine -----
  if (h.st === 'roll') {
    h.x += h.rollDir * roll * dt;
    advAnim(h, dt);
    if (h.animDone) { h.st = 'idle'; h.rollCd = 0.65; }
  } else if (h.st === 'attack') {
    h.x += h.facing * 30 * SCALE * dt;    // slight lunge
    if (inHitWindow(h)) heroHitscan(h);
    advAnim(h, dt);
    if (h.animDone) {
      if (h.comboBuf && h.attackStep < 3) advCombo(h);
      else { h.st = 'idle'; h.attackStep = 0; }
    }
  } else if (h.st === 'hit') {
    advAnim(h, dt); if (h.animDone) h.st = 'idle';
  } else {
    // idle / run
    var dir = (IN.right ? 1 : 0) - (IN.left ? 1 : 0);
    var spd = h.charging ? move * 0.4 : move;
    if (dir !== 0) { h.vx = dir * spd; h.facing = dir; h.st = 'run'; setAnim(h, 'run'); }
    else { h.vx = 0; h.st = 'idle'; setAnim(h, 'idle'); }
    h.x += h.vx * dt;
    advAnim(h, dt);
  }

  h.x = clamp(h.x, ARENA_PAD, VW - ARENA_PAD);
  // passive regen
  h.mana = min(h.maxmana, h.mana + 11 * dt);
  // combo decay
  if (GAME.comboTimer > 0) { GAME.comboTimer -= dt; if (GAME.comboTimer <= 0) { GAME.combo = 0; GAME.mult = 1; } }
  updateMagicBtn();
}

function updateMagicBtn() {
  var b = document.getElementById('btn-magic');
  if (b) { if (GAME.hero && GAME.hero.ember >= GAME.hero.maxember) b.classList.add('ready'); else b.classList.remove('ready'); }
}

/* =====================================================================
   COMBAT RESOLUTION
   ===================================================================== */
function comboHit() {
  GAME.combo++; GAME.comboTimer = 2.4;
  GAME.mult = min(6, 1 + floor(GAME.combo / 5) * 0.5);
}
function addScore(n) { GAME.score += n; }
function addEmber(n) { var h = GAME.hero; h.ember = min(h.maxember, h.ember + n); }

function heroHitscan(h) {
  var reach = heroReach() + 30 * SCALE;
  var dmg = h.attackStep === 1 ? 16 : h.attackStep === 2 ? 22 : 42;
  var finisher = h.attackStep === 3;
  for (var i = 0; i < GAME.enemies.length; i++) {
    var e = GAME.enemies[i]; if (e.dead) continue;
    if (h.hitSet.indexOf(e) >= 0) continue;
    var dx = e.x - h.x;
    if (sign(dx || h.facing) !== h.facing && abs(dx) > 24) continue;
    if (abs(dx) > reach) continue;
    h.hitSet.push(e);
    var kn = (finisher ? 320 : 120) * SCALE * h.facing;
    damageEnemy(e, dmg, kn, finisher ? 0.5 : 0.12);
    h.mana = min(h.maxmana, h.mana + 6); addEmber(8); comboHit();
    burstSpark(e.x, e.y - 50 * SCALE, finisher ? 12 : 6, '#ffe9b0');
    sfx(finisher ? 'heavy' : 'hit'); haptic(finisher ? 'heavy' : 'light');
    if (finisher) { shake(9, 0.18); ring(e.x, e.y - 24 * SCALE, 6, 46 * SCALE, 0.3, '#ff9a4a', 4); }
  }
}

function damageEnemy(e, dmg, knock, stun) {
  if (e.dead) return;
  dmg = floor(dmg);
  e.hp -= dmg; e.flash = 0.1;
  if (knock) e.knock = knock;
  if (stun) e.stun = max(e.stun || 0, stun);
  floatText(e.x, e.y - 72 * SCALE, dmg, '#ffd27a');
  if (e.hp <= 0) { enemyDie(e); return; }
  if (!e.isBoss && e.st !== 'death') { e.st = 'hurt'; setAnim(e, 'hurt', true); }
}

function enemyDie(e) {
  if (e.dead) return;
  e.dead = true; e.st = 'death'; setAnim(e, 'death', true); e.vx = 0; e.fade = 1.2;
  GAME.kills++;
  var pts = floor(e.scoreBase * (1 + (GAME.wave - 1) * 0.1) * GAME.mult);
  addScore(pts); addEmber(e.isBoss ? 60 : 15);
  floatText(e.x, e.y - 86 * SCALE, '+' + pts, '#8affab');
  if (e.kind === 'blood') burstBlood(e.x, e.y - 46 * SCALE, 16);
  else burstSmoke(e.x, e.y - 46 * SCALE, 10, 'rgba(70,30,70,1)');
  burstEmber(e.x, e.y - 40 * SCALE, e.isBoss ? 50 : 14, 1.3, 1.4);
  sfx('die');
  if (e.isBoss) {
    GAME.bossActive = false; shake(16, 0.5); GAME.slowmo = 0.6; haptic('ok');
    ring(e.x, e.y - 30 * SCALE, 10, 180 * SCALE, 0.6, '#ff9a4a', 7);
    GAME.orbs.push(makeOrb(e.x, 'heal')); GAME.orbs.push(makeOrb(e.x + 24, 'heal'));
  } else if (rnd() < 0.16) GAME.orbs.push(makeOrb(e.x, 'heal'));
}

function releaseMagic(h) {
  h.charging = false; var c = h.charge; h.charge = 0;
  var emp = h.ember >= h.maxember;
  if (emp) h.ember = 0;
  else if (h.mana >= 34) h.mana -= 34;
  else { burstSmoke(h.x, h.y - 40 * SCALE, 6, 'rgba(120,90,160,1)'); sfx('ui'); return; }
  var radius = lerp(90, 180, c) * SCALE * (emp ? 1.5 : 1);
  var dmg = (28 + 46 * c) * (emp ? 1.7 : 1);
  var x = h.x, y = h.y - 20 * SCALE;
  ring(x, y, 10, radius, 0.5, emp ? '#c9a2ff' : '#ff9a4a', emp ? 8 : 5);
  ring(x, y, 8, radius * 0.65, 0.35, '#ffe9b0', 3);
  burstEmber(x, y - 20 * SCALE, emp ? 44 : 26, 1.5, 1.6);
  burstSpark(x, y - 10 * SCALE, emp ? 30 : 18, emp ? '#d9b8ff' : '#ffd27a');
  shake(emp ? 14 : 9, emp ? 0.35 : 0.22);
  flash(emp ? 'rgba(180,140,255,.5)' : 'rgba(255,160,90,.4)', 0.12);
  sfx('magic'); haptic('heavy');
  for (var i = 0; i < GAME.enemies.length; i++) {
    var e = GAME.enemies[i]; if (e.dead) continue;
    var dx = e.x - x; var R = radius + 30 * SCALE;
    if (abs(dx) > R) continue;
    var fall = 1 - abs(dx) / R;
    damageEnemy(e, dmg * (0.5 + 0.5 * fall), sign(dx || 1) * (emp ? 360 : 240) * SCALE, emp ? 1.2 : 0.4);
  }
  if (emp) GAME.slowmo = max(GAME.slowmo, 0.22);
}

function heroHit(dmg, fromX) {
  var h = GAME.hero;
  if (h.st === 'roll' || h.iframes > 0 || h.st === 'death') return;
  h.hp -= dmg; h.iframes = 0.8; h.blink = 0.8;
  h.knock = sign(h.x - fromX || 1) * 170 * SCALE;
  GAME.combo = 0; GAME.mult = 1; GAME.comboTimer = 0;
  shake(10, 0.25); flash('rgba(200,30,30,.4)', 0.15); sfx('hurt'); haptic('warn');
  burstBlood(h.x, h.y - 50 * SCALE, 8, '#c0303a');
  if (h.hp <= 0) { h.hp = 0; h.st = 'death'; setAnim(h, 'death', true); gameOver(); }
  else if (h.st !== 'attack') { h.st = 'hit'; setAnim(h, 'hit', true); }
}

function updateOrbs(dt) {
  var h = GAME.hero;
  for (var i = GAME.orbs.length - 1; i >= 0; i--) {
    var o = GAME.orbs[i];
    o.vy += 620 * dt; o.y += o.vy * dt; o.bob += dt * 5;
    if (o.y > GROUND - 16 * SCALE) { o.y = GROUND - 16 * SCALE; o.vy *= -0.4; if (abs(o.vy) < 20) o.vy = 0; }
    o.life -= dt;
    if (!o.got && h && h.st !== 'death' && abs(h.x - o.x) < 42 * SCALE) {
      o.got = true; h.hp = min(h.maxhp, h.hp + 18); floatText(h.x, h.y - 90 * SCALE, '+18', '#8affab');
      sfx('pickup'); burstEmber(o.x, o.y, 10, 1.2, 1.3); GAME.orbs.splice(i, 1); continue;
    }
    if (o.life <= 0) GAME.orbs.splice(i, 1);
  }
}

/* =====================================================================
   ENEMY UPDATE + WAVES
   ===================================================================== */
function updateEnemy(e, dt) {
  if (e.flash > 0) e.flash -= dt;
  if (e.knock) { e.x += e.knock * dt; e.knock *= 0.85; if (abs(e.knock) < 4) e.knock = 0; }
  e.x = clamp(e.x, -60, VW + 60);

  if (e.dead) { advAnim(e, dt); if (e.animDone) e.fade -= dt * 1.2; return; }
  if (e.stun > 0) { e.stun -= dt; advAnim(e, dt); return; }
  if (e.st === 'hurt') { advAnim(e, dt); if (e.animDone) e.st = 'walk'; return; }

  e.atkCd -= dt;
  var h = GAME.hero, dx = h.x - e.x, dist = abs(dx);
  if (e.st !== 'attack') e.facing = dx >= 0 ? 1 : -1;

  if (e.st === 'attack') {
    advAnim(e, dt);
    if (!e.hitDone && inHitWindow(e)) {
      if (abs(h.x - e.x) < e.reach * SCALE) heroHit(e.dmg, e.x);
      e.hitDone = true;
    }
    if (e.animDone) { e.st = 'walk'; e.atkCd = e.isBoss ? rr(0.5, 1.0) : rr(0.8, 1.6); }
    return;
  }

  if (dist > e.range * SCALE) {
    e.st = 'walk'; setAnim(e, 'walk'); e.x += sign(dx) * e.speed * SCALE * dt;
  } else if (e.atkCd <= 0) {
    e.st = 'attack'; setAnim(e, 'attack', true); e.hitDone = false;
  } else {
    e.st = 'idle'; setAnim(e, 'idle');
  }
  advAnim(e, dt);
}

function aliveCount() { var n = 0; for (var i = 0; i < GAME.enemies.length; i++) if (!GAME.enemies[i].dead) n++; return n; }

function showBanner(t, sub, dur) { GAME.banner = t; GAME.bannerSub = sub || ''; GAME.bannerT = dur || 1.8; }

function beginWave() {
  GAME.wave++;
  GAME.phase = 'spawning';
  var w = GAME.wave, list = [];
  if (w % 5 === 0) {
    list.push('boss');
    for (var i = 0; i < min(2 + floor(w / 10), 5); i++) list.push('demon');
    GAME.bossActive = true;
    showBanner('WAVE ' + w, '— DARK KNIGHT —', 2.6); sfx('boss'); shake(10, 0.6); haptic('heavy');
  } else {
    var total = min(3 + w, 16);
    var bloods = min(floor(w / 3), 6);
    for (var b = 0; b < bloods; b++) list.push('blood');
    while (list.length < total) list.push('demon');
    showBanner('WAVE ' + w, '', 1.6); sfx('wave');
  }
  // shuffle
  for (var k = list.length - 1; k > 0; k--) { var j = ri(0, k); var tmp = list[k]; list[k] = list[j]; list[j] = tmp; }
  GAME.spawnList = list;
  GAME.spawnEvery = max(0.4, 1.1 - w * 0.03);
  GAME.spawnTimer = 0.3;
  GAME.maxAlive = min(3 + floor(w / 2), 9);
}

function waveComplete() {
  GAME.phase = 'breather';
  GAME.breather = 2.4;
  var bonus = 50 + GAME.wave * 15;
  addScore(bonus);
  showBanner('WAVE CLEARED', '+' + bonus, 1.8); sfx('ui'); haptic('ok');
  if (GAME.wave > SAVE.bestWave) { SAVE.bestWave = GAME.wave; storeSave(SAVE); }
}

function updateWaves(dt) {
  if (GAME.bannerT > 0) GAME.bannerT -= dt;
  if (GAME.phase === 'breather') { GAME.breather -= dt; if (GAME.breather <= 0) beginWave(); return; }
  if (GAME.phase === 'spawning') {
    if (GAME.spawnList.length > 0) {
      GAME.spawnTimer -= dt;
      if (GAME.spawnTimer <= 0 && aliveCount() < GAME.maxAlive) {
        var kind = GAME.spawnList.shift();
        GAME.enemies.push(makeEnemy(kind, pick([-1, 1]), GAME.wave));
        GAME.spawnTimer = GAME.spawnEvery;
      }
    } else if (aliveCount() === 0) {
      waveComplete();
    }
  }
}

/* =====================================================================
   RENDER — background, world, entities, VFX
   ===================================================================== */
var BGEMBERS = [];
function buildEmbers() { BGEMBERS = []; for (var i = 0; i < 26; i++) BGEMBERS.push({ x: rr(0, VW), y: rr(0, VH), s: rr(0.6, 2.2), v: rr(8, 26), ph: rr(0, TAU) }); }
buildEmbers();

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function drawBackground(t) {
  var g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#1a0e22'); g.addColorStop(0.45, '#2a1026'); g.addColorStop(0.8, '#140a16'); g.addColorStop(1, '#0a0610');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  // blood moon
  var mx = VW * 0.76, my = VH * 0.26, mr = min(VW, VH) * 0.14;
  var rg = ctx.createRadialGradient(mx, my, mr * 0.3, mx, my, mr * 3);
  rg.addColorStop(0, 'rgba(255,90,60,0.35)'); rg.addColorStop(1, 'rgba(255,90,60,0)');
  ctx.fillStyle = rg; ctx.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
  ctx.fillStyle = '#e8604a'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(180,40,30,0.4)'; ctx.beginPath(); ctx.arc(mx + mr * 0.3, my - mr * 0.2, mr * 0.9, 0, TAU); ctx.fill();
  // mountains (two layers)
  function ridge(baseY, amp, step, col, seed) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, VH);
    for (var x = 0; x <= VW; x += step) {
      var y = baseY + sin(x * 0.004 + seed) * amp + sin(x * 0.013 + seed * 2) * amp * 0.4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill();
  }
  ridge(VH * 0.56, VH * 0.08, 40, '#1d1020', 1.3);
  ridge(VH * 0.66, VH * 0.06, 36, '#140a16', 3.1);
  // ruined pillars
  ctx.fillStyle = '#0f0712';
  var pw = 16 * SCALE;
  [0.12, 0.3, 0.88].forEach(function (fx, i) {
    var px = VW * fx, ph = VH * (0.18 + (i % 2) * 0.06);
    ctx.fillRect(px, GROUND - ph, pw, ph);
    ctx.fillRect(px - 4, GROUND - ph, pw + 8, 8);
  });
  // bg embers
  for (var e = 0; e < BGEMBERS.length; e++) {
    var p = BGEMBERS[e]; p.y -= p.v * (1 / 60); p.ph += 0.03;
    if (p.y < -4) { p.y = VH + 4; p.x = rr(0, VW); }
    ctx.globalAlpha = 0.4 + 0.3 * sin(p.ph);
    ctx.fillStyle = '#ff8a3c';
    ctx.fillRect(p.x + sin(p.ph) * 6, p.y, p.s, p.s);
  }
  ctx.globalAlpha = 1;
  // ground
  var gg = ctx.createLinearGradient(0, GROUND, 0, VH);
  gg.addColorStop(0, '#241424'); gg.addColorStop(1, '#0c0710');
  ctx.fillStyle = gg; ctx.fillRect(0, GROUND, VW, VH - GROUND);
  ctx.fillStyle = 'rgba(255,120,60,0.5)'; ctx.fillRect(0, GROUND - 1, VW, 2);
  var fog = ctx.createLinearGradient(0, GROUND - 24, 0, GROUND + 10);
  fog.addColorStop(0, 'rgba(120,50,80,0)'); fog.addColorStop(1, 'rgba(120,50,80,0.25)');
  ctx.fillStyle = fog; ctx.fillRect(0, GROUND - 24, VW, 34);
}

function drawShadow(x, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(x, GROUND + 2, w, w * 0.28, 0, 0, TAU); ctx.fill();
}

var DRAW = { knight: { s: 1.9, feet: 0.95 }, boss: { s: 2.6, feet: 0.95 }, demon: { s: 2.0, feet: 0.9 }, blood: { s: 2.1, feet: 0.9 } };
function drawEntity(e, t) {
  var frames = framesFor(e.kind, e.anim); if (!frames) return;
  var fr = frames[min(e.frame, frames.length - 1)]; if (!fr) return;
  var d = DRAW[e.kind] || DRAW.demon, s = d.s * SCALE;
  var dw = fr.width * s, dh = fr.height * s;
  var dx = -dw / 2, dy = GROUND - dh * d.feet;
  var alpha = 1;
  if (e.dead) alpha = clamp(e.fade, 0, 1);
  if (e === GAME.hero && e.blink > 0 && (floor(t * 22) % 2) === 0) alpha = 0.35;
  ctx.save();
  ctx.translate(e.x, 0);
  if (e.facing < 0) ctx.scale(-1, 1);
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(fr, dx, dy, dw, dh);
  if (e.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = min(1, e.flash * 5); ctx.drawImage(fr, dx, dy, dw, dh); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  ctx.globalAlpha = 1;
  // boss health bar
  if (e.isBoss && !e.dead) {
    var bw = 120 * SCALE, bx = e.x - bw / 2, by = GROUND - dh * d.feet - 14 * SCALE;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(bx, by, bw, 7 * SCALE, 3); ctx.fill();
    ctx.fillStyle = '#ff3b4e'; roundRect(bx, by, bw * clamp(e.hp / e.maxhp, 0, 1), 7 * SCALE, 3); ctx.fill();
  }
}

function drawOrb(o, t) {
  var pul = 0.7 + 0.3 * sin(o.bob);
  var r = 8 * SCALE * pul;
  var rg = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r * 2.4);
  rg.addColorStop(0, 'rgba(140,255,180,0.9)'); rg.addColorStop(1, 'rgba(140,255,180,0)');
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(o.x, o.y, r * 2.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#daffe8'; ctx.beginPath(); ctx.arc(o.x, o.y, r * 0.5, 0, TAU); ctx.fill();
}

function drawVFX() {
  // shock rings
  for (var r = 0; r < RINGS.length; r++) {
    var R = RINGS[r], a = R.life / R.max;
    ctx.globalAlpha = a; ctx.strokeStyle = R.color; ctx.lineWidth = R.w * (0.4 + a);
    ctx.beginPath(); ctx.ellipse(R.x, R.y, R.r, R.r * 0.4, 0, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
  // slashes (crescent arcs)
  for (var s = 0; s < SLASH.length; s++) {
    var S = SLASH[s], a2 = S.life / S.max;
    ctx.save(); ctx.translate(S.x, S.y); ctx.scale(S.dir, 1); ctx.globalAlpha = a2;
    ctx.strokeStyle = S.kind === 2 ? '#fff2c8' : '#ffd9a0'; ctx.lineWidth = (S.kind === 2 ? 7 : 4) * (0.5 + a2);
    ctx.beginPath(); ctx.arc(0, 0, S.reach, -0.9, 0.9); ctx.stroke();
    ctx.globalAlpha = a2 * 0.5; ctx.lineWidth *= 2.2; ctx.beginPath(); ctx.arc(0, 0, S.reach, -0.7, 0.7); ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
  // particles (additive first)
  ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < MAXP; i++) {
    var p = P[i]; if (!p.on || !p.add) continue;
    ctx.globalAlpha = p.fade ? clamp(p.life / p.max, 0, 1) : 1;
    ctx.fillStyle = p.color; ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalCompositeOperation = 'source-over';
  for (var j = 0; j < MAXP; j++) {
    var q = P[j]; if (!q.on || q.add) continue;
    ctx.globalAlpha = q.fade ? clamp(q.life / q.max, 0, 1) : 1;
    ctx.fillStyle = q.color; ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
  }
  ctx.globalAlpha = 1;
  // floating text
  for (var f = 0; f < FLOAT.length; f++) {
    var F = FLOAT[f], af = clamp(F.life / F.max, 0, 1);
    ctx.globalAlpha = af; ctx.fillStyle = F.color;
    ctx.font = (F.big ? 700 : 700) + ' ' + ((F.big ? 20 : 14) * SCALE) + "px 'Trebuchet MS',sans-serif";
    ctx.textAlign = 'center'; ctx.fillText(F.txt, F.x, F.y);
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

function drawWorld(t) {
  var h = GAME.hero;
  // charge preview ring
  if (h && h.charging) {
    var pr = lerp(90, 180, h.charge) * SCALE * (h.ember >= h.maxember ? 1.5 : 1);
    ctx.globalAlpha = 0.25 + 0.15 * sin(t * 10);
    ctx.strokeStyle = h.ember >= h.maxember ? '#c9a2ff' : '#ff9a4a';
    ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(h.x, GROUND - 10 * SCALE, pr, pr * 0.4, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 1;
  }
  // shadows
  for (var i = 0; i < GAME.enemies.length; i++) { var e = GAME.enemies[i]; drawShadow(e.x, (e.isBoss ? 34 : 26) * SCALE * (e.dead ? clamp(e.fade, 0, 1) : 1)); }
  if (h) drawShadow(h.x, 24 * SCALE);
  // enemies (corpses drawn under living via fade already)
  for (var k = 0; k < GAME.enemies.length; k++) drawEntity(GAME.enemies[k], t);
  if (h) drawEntity(h, t);
  for (var o = 0; o < GAME.orbs.length; o++) drawOrb(GAME.orbs[o], t);
  drawVFX();
}

function bar(x, y, w, hh, frac, fill, glow) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(x - 2, y - 2, w + 4, hh + 4, 5); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; roundRect(x, y, w, hh, 4); ctx.fill();
  frac = clamp(frac, 0, 1);
  if (frac > 0) {
    if (glow) { ctx.shadowColor = fill; ctx.shadowBlur = 10; }
    ctx.fillStyle = fill; roundRect(x, y, w * frac, hh, 4); ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawHUD(t) {
  var h = GAME.hero; if (!h) return;
  var m = 14, bw = min(VW * 0.46, 230);
  bar(m, m, bw, 13, h.hp / h.maxhp, '#e23b4e');
  bar(m, m + 20, bw * 0.72, 8, h.mana / h.maxmana, '#5aa2ff');
  var full = h.ember >= h.maxember;
  bar(m, m + 34, bw * 0.72, 8, h.ember / h.maxember, full ? '#ffd27a' : '#c08a3a', full);
  // labels
  ctx.fillStyle = '#f3e9d8'; ctx.font = 700 + " 11px 'Trebuchet MS',sans-serif"; ctx.textAlign = 'left';
  ctx.fillText('HP', m + 4, m + 10);
  if (full) { ctx.fillStyle = '#ffe9b0'; ctx.fillText('EMBER READY — hold ✦', m + bw * 0.72 + 8, m + 41); }
  // wave (top center)
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffd27a'; ctx.font = 800 + ' ' + (16) + "px 'Trebuchet MS',sans-serif";
  ctx.fillText('WAVE ' + max(1, GAME.wave), VW / 2, m + 14);
  // score + combo (top right)
  ctx.textAlign = 'right'; ctx.fillStyle = '#f3e9d8'; ctx.font = 800 + " 18px 'Trebuchet MS',sans-serif";
  ctx.fillText(GAME.score.toLocaleString(), VW - m, m + 14);
  if (GAME.mult > 1) {
    ctx.fillStyle = '#ff8a3c'; ctx.font = 800 + " 15px 'Trebuchet MS',sans-serif";
    ctx.fillText('x' + GAME.mult.toFixed(1) + '  ⚔' + GAME.combo, VW - m, m + 34);
  }
  ctx.textAlign = 'left';
  // low HP vignette
  if (h.hp / h.maxhp < 0.3 && h.st !== 'death') {
    var vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VH * 0.7);
    vg.addColorStop(0, 'rgba(180,0,0,0)'); vg.addColorStop(1, 'rgba(180,0,0,' + (0.25 + 0.15 * sin(t * 6)) + ')');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  }
}

function drawBanner() {
  if (GAME.bannerT <= 0) return;
  var a = clamp(GAME.bannerT, 0, 1);
  ctx.globalAlpha = a; ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe3b0'; ctx.font = 900 + ' ' + (34 * clamp(SCALE, 1, 1.6)) + "px 'Trebuchet MS',sans-serif";
  ctx.shadowColor = 'rgba(255,100,40,0.8)'; ctx.shadowBlur = 16;
  ctx.fillText(GAME.banner, VW / 2, VH * 0.34);
  ctx.shadowBlur = 0;
  if (GAME.bannerSub) { ctx.fillStyle = '#ff784a'; ctx.font = 800 + ' ' + (16 * clamp(SCALE, 1, 1.6)) + "px 'Trebuchet MS',sans-serif"; ctx.fillText(GAME.bannerSub, VW / 2, VH * 0.34 + 30); }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

function drawFlash() {
  if (flashT <= 0) return;
  ctx.globalAlpha = clamp(flashT / 0.15, 0, 1) * 0.6;
  ctx.fillStyle = flashCol; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1;
}

function render(t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, VW, VH);
  var ox = 0, oy = 0;
  if (shakeMag > 0) { ox = rr(-shakeMag, shakeMag); oy = rr(-shakeMag, shakeMag); }
  ctx.save(); ctx.translate(ox, oy);
  drawBackground(t);
  if (GAME.hero) drawWorld(t);
  ctx.restore();
  if (GAME.state === 'play' || GAME.state === 'pause') { drawHUD(t); drawBanner(); }
  drawFlash();
}

/* =====================================================================
   UPDATE TICK + GAME FLOW + SCREENS + LOOP + BOOT
   ===================================================================== */
function update(dt) {
  GAME.time += dt;
  if (GAME.slowmo > 0) GAME.slowmo -= dt;
  updateHero(dt);
  for (var i = 0; i < GAME.enemies.length; i++) updateEnemy(GAME.enemies[i], dt);
  for (var j = GAME.enemies.length - 1; j >= 0; j--) { var e = GAME.enemies[j]; if (e.dead && e.fade <= 0) GAME.enemies.splice(j, 1); }
  updateOrbs(dt);
  updateWaves(dt);
  updateVFX(dt);
  if (GAME.dying && !GAME.over) { GAME.deathT -= dt; if (GAME.deathT <= 0) finishGameOver(); }
}

function gameOver() { if (GAME.dying) return; GAME.dying = true; GAME.deathT = 1.6; GAME.slowmo = 0.8; shake(12, 0.4); }

/* ---------- DOM screens ---------- */
var SCR = document.getElementById('screen');
function hideScreen() { SCR.classList.add('hide'); }
function openScreen(html) { SCR.innerHTML = html; SCR.classList.remove('hide'); }
function setControls(show) {
  document.getElementById('touch').classList.toggle('hidden', !show);
  document.getElementById('btn-pause').classList.toggle('hidden', !show);
}

function muteLabel() { return SAVE.muted ? '♪ Sound: OFF' : '♪ Sound: ON'; }

function showMenu() {
  GAME.state = 'menu'; setControls(false);
  openScreen(
    '<div class="panel">' +
      '<div class="logo">ASHEN<span>BLADE</span></div>' +
      '<div class="tagline">Hold the arena · Slay the horde</div>' +
      '<div class="best">Best <b>' + SAVE.best.toLocaleString() + '</b> · Wave <b>' + SAVE.bestWave + '</b></div>' +
      '<div class="row"><button class="btn" id="m-play">Play</button></div>' +
      '<div class="how"><b>Move</b> ◀ ▶ · <b>Attack</b> ⚔ (tap again to chain a 3-hit combo)<br>' +
      '<b>Dash</b> » to dodge through enemies · <b>Magic</b> ✦ hold to charge an Ember Nova<br>' +
      'Land hits to fill the gold <b>Ember</b> bar — at full, your next Nova is empowered.</div>' +
      '<div class="row"><button class="btn ghost" id="m-mute">' + muteLabel() + '</button></div>' +
    '</div>');
  document.getElementById('m-play').addEventListener('click', function () { initAudio(); resumeAudio(); sfx('ui'); startRun(); });
  document.getElementById('m-mute').addEventListener('click', function (ev) { initAudio(); setMuted(!SAVE.muted); ev.target.textContent = muteLabel(); sfx('ui'); });
}

function startRun() {
  GAME.state = 'play';
  GAME.hero = makeHero(); GAME.enemies = []; GAME.orbs = [];
  GAME.wave = 0; GAME.score = 0; GAME.kills = 0; GAME.combo = 0; GAME.mult = 1; GAME.comboTimer = 0;
  GAME.phase = 'breather'; GAME.breather = 1.0; GAME.bannerT = 0;
  GAME.dying = false; GAME.over = false; GAME.slowmo = 0; GAME.bossActive = false; GAME.newBest = false;
  RINGS.length = 0; SLASH.length = 0; FLOAT.length = 0; for (var i = 0; i < MAXP; i++) P[i].on = false;
  SAVE.plays++; storeSave(SAVE);
  hideScreen(); setControls(true);
  showBanner('ASHEN BLADE', 'Survive the horde', 1.4);
}

function finishGameOver() {
  GAME.over = true; GAME.state = 'over'; setControls(false);
  GAME.newBest = GAME.score > SAVE.best;
  if (GAME.newBest) SAVE.best = GAME.score;
  if (GAME.wave > SAVE.bestWave) SAVE.bestWave = GAME.wave;
  storeSave(SAVE);
  openScreen(
    '<div class="panel">' +
      '<div class="go-title">YOU FELL</div>' +
      (GAME.newBest ? '<div class="newbest">★ NEW BEST ★</div>' : '') +
      '<div class="stats">' +
        '<div>Score</div><div class="v">' + GAME.score.toLocaleString() + '</div>' +
        '<div>Wave reached</div><div class="v">' + GAME.wave + '</div>' +
        '<div>Foes slain</div><div class="v">' + GAME.kills + '</div>' +
        '<div>Best score</div><div class="v">' + SAVE.best.toLocaleString() + '</div>' +
      '</div>' +
      '<div class="row"><button class="btn" id="g-retry">Fight again</button>' +
      '<button class="btn ghost" id="g-menu">Menu</button></div>' +
    '</div>');
  document.getElementById('g-retry').addEventListener('click', function () { sfx('ui'); resumeAudio(); startRun(); });
  document.getElementById('g-menu').addEventListener('click', function () { sfx('ui'); showMenu(); });
  haptic('err');
}

/* ---------- Pause ---------- */
document.getElementById('btn-pause').addEventListener('click', function () {
  if (GAME.state === 'play') {
    GAME.state = 'pause';
    openScreen('<div class="panel"><div class="logo" style="font-size:clamp(30px,9vw,54px)">PAUSED</div>' +
      '<div class="row"><button class="btn" id="p-resume">Resume</button>' +
      '<button class="btn ghost" id="p-mute">' + muteLabel() + '</button></div>' +
      '<div class="row"><button class="btn ghost" id="p-quit">Quit to menu</button></div></div>');
    document.getElementById('p-resume').addEventListener('click', function () { sfx('ui'); GAME.state = 'play'; hideScreen(); });
    document.getElementById('p-mute').addEventListener('click', function (ev) { setMuted(!SAVE.muted); ev.target.textContent = muteLabel(); });
    document.getElementById('p-quit').addEventListener('click', function () { sfx('ui'); showMenu(); });
  }
});
if (TG && TG.onEvent) { try { TG.onEvent('viewportChanged', function () { buildEmbers(); }); } catch (e) {} }

/* ---------- Main loop ---------- */
var last = 0;
function loop(now) {
  var raw = last ? (now - last) / 1000 : 0; last = now;
  if (raw > 0.05) raw = 0.05;
  var sc = GAME.slowmo > 0 ? 0.4 : 1;
  if (GAME.state === 'play') update(raw * sc);
  else { updateVFX(raw); GAME.time += raw; }
  render(now / 1000);
  requestAnimationFrame(loop);
}

/* ---------- Boot ---------- */
var loadEl = document.getElementById('loading'), fillEl = document.getElementById('loadfill');
loadAll(function (p) { if (fillEl) fillEl.style.width = (p * 100).toFixed(0) + '%'; }).then(function () {
  if (loadEl) loadEl.classList.add('hide');
  showMenu();
  requestAnimationFrame(loop);
}).catch(function (err) {
  if (loadEl) loadEl.innerHTML = '<div class="loadbox"><div class="logo">⚠</div><div class="loadtxt">Failed to load assets</div></div>';
  console.error(err);
});

})();
