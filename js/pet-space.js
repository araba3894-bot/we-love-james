/* Pet companion space — threshold, daze room, focus room, ledger. */
window.installPetSpace = function installPetSpace(env) {
  const getCtx = env.getCtx;
  const getW = env.getW;
  const getH = env.getH;
  const getLocale = env.getLocale;
  const sfx = env.sfx;
  const drawHost = typeof env.drawHost === 'function' ? env.drawHost : null;
  const drawCat = typeof env.drawCat === 'function' ? env.drawCat : null;
  const drawWindowView = typeof env.drawWindowView === 'function' ? env.drawWindowView : null;

  const STORAGE = 'nvc-pet-space-v1';
  const onAudioScene = typeof env.onAudioScene === 'function' ? env.onAudioScene : null;
  let lastAudioScene = null;

  function getAudioSceneId() {
    if (state.phase === 'closed') return null;
    const s = state.session;
    if (s && s.mode === 'focus' && s.animalId) {
      const id = s.animalId === '600' ? '600' : s.animalId;
      return `quiet_${id}`;
    }
    if (s && s.mode === 'daze') return 'quiet_daze';
    return 'quiet_threshold';
  }

  function syncAudioScene() {
    if (!onAudioScene) return;
    const id = getAudioSceneId();
    if (id === lastAudioScene) return;
    lastAudioScene = id;
    if (id) {
      try { onAudioScene(id); } catch (_) { /* ignore */ }
    }
  }

  const ANIMALS = [
    {
      id: 'king', name: 'King', theme: 'city',
      done: { zh: '她一直坐着。我在桌子另一头。', en: 'She stayed. I was at the other end of the desk.' },
      early: { zh: '她先起来了。我还在那边。', en: 'She stood up first. I was still over there.' },
      trait: { zh: '好脾气，但不靠近人', en: 'Kind, and keeps a distance' },
    },
    {
      id: '600', name: '600', theme: 'country',
      done: { zh: '她在写。我换了三次姿势。', en: 'She was writing. I changed pose three times.' },
      early: { zh: '她起来了。姿势还没换完。', en: 'She got up. I was not done posing.' },
      trait: { zh: '机灵，好动，很好看', en: 'Quick, restless, easy to look at' },
    },
    {
      id: 'bonbon', name: 'Bonbon', theme: 'wind',
      done: { zh: '她坐完了。我没飞。', en: 'She finished sitting. I did not fly.' },
      early: { zh: '她起来了。', en: 'She got up.' },
      trait: { zh: '疯，凶，会离地', en: 'Wild, fierce, leaves the ground' },
    },
    {
      id: 'chocolate', name: 'Chocolate', theme: 'jungle',
      done: { zh: '这张桌子这一轮是我的。她坐到了最后。', en: 'This desk was mine. She stayed to the end.' },
      early: { zh: '她先走了。桌子还是我的。', en: 'She left first. The desk is still mine.' },
      trait: { zh: '暴脾气，占地方', en: 'Hot temper, claims the ground' },
    },
    {
      id: 'silver', name: 'Silver', theme: 'tank',
      done: { zh: '缸里又乱了一次。她没抬头。', en: 'The tank got messy once. She did not look up.' },
      early: { zh: '她抬头了。我还在缸里。', en: 'She looked up. I am still in the tank.' },
      trait: { zh: '大缸是她的房子', en: 'The big tank is her house' },
    },
    {
      id: 'coin', name: 'Coin', theme: 'pit',
      done: { zh: '……在。', en: '...here.' },
      early: { zh: '……', en: '...' },
      trait: { zh: '存在感很低的陆龟', en: 'A land tortoise, easy to miss' },
    },
  ];

  const state = {
    phase: 'closed',
    draftMode: null,
    draftStep: 'mode',
    cardIndex: 0,
    cardPos: 0,
    drag: null,
    task: 'study',
    dur: '25',
    customMin: 40,
    session: null,
    ledger: [],
    enterT0: 0,
    skipEnter: false,
    actors: [],
    critters: [],
    lastNow: 0,
    hover: null,
    booklet: false,
    bookletOrganize: false,
    bookletIdx: 0,
    lunge: null,
    entrySource: 'hub',
  };

  function isFoundingDay(d = new Date()) {
    try {
      if (window.__holidayDebug && window.__holidayDebug.foundingForced) return true;
    } catch (_) { /* ignore */ }
    try {
      if (window.NVC_OUTFITS && typeof window.NVC_OUTFITS.isFoundingDay === 'function') {
        return window.NVC_OUTFITS.isFoundingDay(d);
      }
    } catch (_) { /* ignore */ }
    return d.getMonth() === 4 && d.getDate() === 20;
  }

  function zh() {
    try { return getLocale() === 'zh'; } catch (_) { return false; }
  }
  function t(pair) {
    return zh() ? pair.zh : pair.en;
  }
  function ui() {
    try { sfx().ui(); } catch (_) { /* ignore */ }
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE) || '{}');
      if (Array.isArray(raw.ledger)) {
        state.ledger = raw.ledger.slice(0, 20);
        state.ledger.forEach((e, i) => {
          if (e && e.sortOrder == null) e.sortOrder = Number(e.at) || (Date.now() - i);
        });
        state.ledger.sort((a, b) => (Number(b.sortOrder) || 0) - (Number(a.sortOrder) || 0));
      }
      if (raw.session && raw.session.mode) {
        state.session = raw.session;
        state.session.running = false;
        state.session.segmentStart = null;
      }
    } catch (_) { /* ignore */ }
  }
  function persist() {
    try {
      const session = state.session ? {
        ...state.session,
        running: false,
        segmentStart: null,
        elapsedMs: elapsedMs(performance.now()),
      } : null;
      localStorage.setItem(STORAGE, JSON.stringify({
        ledger: state.ledger.slice(0, 20),
        session,
      }));
    } catch (_) { /* ignore */ }
  }
  function animalById(id) {
    return ANIMALS.find((a) => a.id === id) || ANIMALS[0];
  }
  function hasSession() {
    return !!(state.session && !state.session.loggedOut);
  }
  function isOpen() {
    return state.phase !== 'closed';
  }
  function doorRect() {
    const W = getW();
    const H = getH();
    const w = Math.max(32, W * 0.048);
    const h = Math.max(44, H * 0.11);
    return { x: W - w - Math.max(6, W * 0.012), y: H * 0.42, w, h };
  }
  function hitDoor() {
    return false;
  }
  function getEntrySource() {
    return state.entrySource === 'yifan' ? 'yifan' : 'hub';
  }
  function open(opts) {
    if (opts && (opts.from === 'yifan' || opts.from === 'hub')) {
      state.entrySource = opts.from;
    } else if (!state.entrySource) {
      state.entrySource = 'hub';
    }
    if (state.session) {
      state.session.running = true;
      state.session.segmentStart = performance.now();
      state.phase = 'room';
      state.booklet = false;
      ensureActors(false);
      ui();
      syncAudioScene();
      return;
    }
    state.phase = 'threshold';
    state.booklet = false;
    state.draftMode = null;
    state.draftStep = 'mode';
    ui();
    syncAudioScene();
  }
  function closeToRoom() {
    if (state.session && state.session.running) {
      state.session.elapsedMs = elapsedMs(performance.now());
      state.session.running = false;
      state.session.segmentStart = null;
      persist();
    }
    state.phase = 'closed';
    state.booklet = false;
    state.drag = null;
    lastAudioScene = null;
  }
  function elapsedMs(now) {
    const s = state.session;
    if (!s) return 0;
    const extra = s.running && s.segmentStart ? Math.max(0, now - s.segmentStart) : 0;
    return (s.elapsedMs || 0) + extra;
  }
  function limitMs() {
    const s = state.session;
    if (!s || s.limitMs == null) return null;
    return s.limitMs;
  }
  function remainingMs(now) {
    const lim = limitMs();
    if (lim == null) return null;
    return lim - elapsedMs(now);
  }

  function ensureActors(reset) {
    if (!reset && state.actors.length === ANIMALS.length) return;
    const focus = !!(state.session && state.session.mode === 'focus');
    state.actors = ANIMALS.map((a) => {
      const p = spawnPoint(a.id, focus);
      const x = p.x;
      const y = p.y;
      return {
        id: a.id,
        x, y, tx: x, ty: y,
        stillUntil: 0,
        turnUntil: 0,
        flying: 0,
        flyFrom: 0,
        moving: false,
        rush: 1,
        facing: 1,
      };
    });
    state.critters = [0, 1, 2].map((i) => ({
      u: 0.25 + i * 0.2,
      v: 0.3 + i * 0.15,
    }));
    state.lunge = null;
  }

  const HOMES = {
    king: { x: 0.1, y: 0.78 },
    '600': { x: 0.28, y: 0.8 },
    bonbon: { x: 0.74, y: 0.78 },
    chocolate: { x: 0.86, y: 0.8 },
    coin: { x: 0.2, y: 0.86 },
    silver: { x: 0.29, y: 0.56 },
  };

  function tankNorm(focus) {
    // Focus: keep tank left so the right wall can hold the balancing window.
    if (focus) return { x0: 0.06, y0: 0.42, x1: 0.32, y1: 0.68 };
    return { x0: 0.24, y0: 0.48, x1: 0.38, y1: 0.64 };
  }

  function fishPad(focus) {
    const tank = tankNorm(focus);
    const padX = (tank.x1 - tank.x0) * 0.32;
    const padY = (tank.y1 - tank.y0) * 0.32;
    return {
      x0: tank.x0 + padX,
      y0: tank.y0 + padY,
      x1: tank.x1 - padX,
      y1: tank.y1 - padY,
    };
  }

  function boundsFor(id, focus) {
    // Fish stay in the tank; land animals (incl. chicken feet) use the full floor strip.
    // Chicken flight altitude is visual-only via flyLift — not actor.y.
    if (id === 'silver') return fishPad(focus);
    return { x0: 0.05, y0: 0.70, x1: 0.94, y1: 0.88 };
  }

  function spawnPoint(id, focus) {
    const b = boundsFor(id, focus);
    return {
      x: (b.x0 + b.x1) / 2 + (Math.random() - 0.5) * 0.02,
      y: (b.y0 + b.y1) / 2 + (Math.random() - 0.5) * 0.012,
    };
  }

  function updateActors(now, dt) {
    ensureActors(false);
    const focus = state.session && state.session.mode === 'focus';
    const focusId = focus ? state.session.animalId : null;
    const stepMs = Math.max(8, Math.min(32, dt || 16));
    state.actors.forEach((actor) => {
      if (focus && actor.id !== focusId) return;
      const b = boundsFor(actor.id, focus);
      const dist = Math.hypot(actor.tx - actor.x, actor.ty - actor.y);
      if (dist < 0.008) {
        actor.moving = false;
        if (!actor.waiting) {
          actor.waiting = true;
          actor.stillUntil = now + (actor.id === 'coin'
            ? 5000 + Math.random() * 8000
            : 700 + Math.random() * 1100);
          return;
        }
        if (now < (actor.stillUntil || 0) || now < (actor.turnUntil || 0)) return;
        actor.waiting = false;
        // Longer steps so roam reads as room-scale, not nest-jitter.
        const reach = actor.id === 'coin' ? 0.06
          : actor.id === 'silver' ? 0.08
          : actor.id === 'bonbon' ? 0.28
          : 0.22;
        if (actor.id === 'bonbon' && Math.random() < 0.42) {
          // Cross-room flight: land feet stay on floor strip; height is flyLift.
          actor.tx = b.x0 + Math.random() * (b.x1 - b.x0);
          actor.ty = b.y0 + Math.random() * (b.y1 - b.y0);
          actor.flying = 1;
          actor.flyFrom = now;
        } else {
          actor.tx = Math.max(b.x0, Math.min(b.x1, actor.x + (Math.random() - 0.5) * reach * 2));
          actor.ty = Math.max(b.y0, Math.min(b.y1, actor.y + (Math.random() - 0.5) * reach));
        }
        const want = actor.tx >= actor.x ? 1 : -1;
        if (want !== actor.facing && Math.abs(actor.tx - actor.x) > 0.012) {
          actor.facing = want;
          actor.turnUntil = now + 180;
          actor.waiting = true;
          actor.stillUntil = now + 180;
          return;
        }
        actor.moving = true;
      }
      if (now < (actor.turnUntil || 0)) {
        actor.moving = false;
        return;
      }
      const speed = (actor.id === 'coin' ? 0.000012 : actor.id === 'silver' ? 0.00004 : 0.000028) * (actor.rush || 1);
      const dx = actor.tx - actor.x;
      const dy = actor.ty - actor.y;
      const len = Math.hypot(dx, dy) || 1;
      const move = Math.min(len, speed * stepMs);
      actor.x += (dx / len) * move;
      actor.y += (dy / len) * move;
      actor.moving = move > 0.0001;
      actor.x = Math.max(b.x0, Math.min(b.x1, actor.x));
      actor.y = Math.max(b.y0, Math.min(b.y1, actor.y));
      if (actor.flying > 0 && now - actor.flyFrom > 1400) actor.flying = 0;
      if (actor.rush > 1) actor.rush = Math.max(1, actor.rush - stepMs * 0.002);
    });
    if (focus && focusId === 'silver' && state.session) {
      const el = elapsedMs(now);
      const silver = state.actors.find((a) => a.id === 'silver');
      if (silver && !state.lunge && el > 12000 && !state.session.lunged) {
        state.session.lunged = true;
        const c = state.critters[(Math.random() * state.critters.length) | 0];
        const tank = fishPad(true);
        silver.tx = tank.x0 + c.u * (tank.x1 - tank.x0);
        silver.ty = tank.y0 + c.v * (tank.y1 - tank.y0);
        silver.rush = 3.2;
        silver.stillUntil = now + 1400;
        state.lunge = { until: now + 1400 };
      }
      if (state.lunge && now > state.lunge.until) state.lunge = null;
    }
    state.critters.forEach((c, i) => {
      c.u = 0.2 + (i * 0.22) + Math.sin(now * 0.0007 + i) * 0.08;
      c.v = 0.25 + i * 0.18 + Math.cos(now * 0.0009 + i) * 0.06;
    });
  }

  function maybeFinishTimer(now) {
    const s = state.session;
    if (!s || !s.running || s.chime) return;
    const left = remainingMs(now);
    if (left == null || left > 0) return;
    s.chime = true;
    ui();
    if (s.mode === 'focus' && !s.logged) commitFocus(true, now);
  }

  function commitFocus(done, now) {
    const s = state.session;
    if (!s || s.mode !== 'focus' || s.logged) return;
    if (!s.photo) s.photo = capture(now);
    const animal = animalById(s.animalId);
    const line = done ? animal.done : animal.early;
    state.ledger.unshift({
      id: `ps-${now}`,
      at: Date.now(),
      sortOrder: Date.now(),
      mode: 'focus',
      animalId: animal.id,
      task: s.task,
      durationMs: elapsedMs(now),
      completed: !!done,
      line: t(line),
      photo: s.photo || null,
    });
    state.ledger = state.ledger.slice(0, 20);
    s.logged = true;
    persist();
  }

  function commitDazePhoto(now) {
    const s = state.session;
    if (!s || !s.photo) return;
    const existing = state.ledger.find((e) => e.id === s.photoId);
    if (existing) {
      existing.photo = s.photo;
      existing.at = Date.now();
      persist();
      return;
    }
    s.photoId = `ps-daze-${now}`;
    state.ledger.unshift({
      id: s.photoId,
      at: Date.now(),
      sortOrder: Date.now(),
      mode: 'daze',
      animalId: null,
      task: null,
      durationMs: elapsedMs(now),
      completed: false,
      line: '',
      photo: s.photo,
    });
    state.ledger = state.ledger.slice(0, 20);
    persist();
  }

  function beginSession(now) {
    const mode = state.draftMode;
    if (!mode) return;
    const dur = state.dur;
    let limit = null;
    if (dur === '25') limit = 25 * 60000;
    else if (dur === '50') limit = 50 * 60000;
    else if (dur === 'custom') limit = Math.max(5, state.customMin) * 60000;
    state.session = {
      mode,
      animalId: mode === 'focus'
        ? ANIMALS[((Math.round(state.cardPos) % ANIMALS.length) + ANIMALS.length) % ANIMALS.length].id
        : null,
      task: mode === 'focus' ? state.task : null,
      limitMs: limit,
      elapsedMs: 0,
      segmentStart: now,
      running: true,
      photo: null,
      autoShot: false,
      logged: false,
      lunged: false,
      chime: false,
      photoId: null,
    };
    state.booklet = false;
    state.phase = 'entering';
    state.enterT0 = now;
    state.skipEnter = false;
    state.lunge = null;
    ensureActors(true);
    persist();
    ui();
    syncAudioScene();
  }

  function endSession(now) {
    const s = state.session;
    if (s && s.mode === 'focus' && !s.logged) commitFocus(false, now);
    state.session = null;
    state.phase = 'threshold';
    state.draftMode = null;
    state.draftStep = 'mode';
    persist();
    ui();
    syncAudioScene();
  }

  function capture(now) {
    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 120;
    const cctx = canvas.getContext('2d');
    drawWorld(cctx, 192, 120, now, true);
    try { return canvas.toDataURL('image/jpeg', 0.72); } catch (_) { return null; }
  }

  function shutter(now) {
    const s = state.session;
    if (!s) return;
    if (!s.autoShot) s.autoShot = true;
    s.photo = capture(now);
    if (s.mode === 'daze') commitDazePhoto(now);
    else persist();
    ui();
  }

  function maybeAutoShot(now) {
    const s = state.session;
    if (!s || s.mode !== 'focus' || s.autoShot || state.phase !== 'room') return;
    if (now - (s.segmentStart || now) < 700) return;
    s.autoShot = true;
    s.photo = capture(now);
    persist();
  }

  function fmt(ms) {
    const sign = ms < 0 ? 0 : ms;
    const total = Math.floor(sign / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
  }

  function breathOf(actor, now) {
    if (!actor) return 0;
    const rate = actor.moving ? 0.012 : 0.0045;
    const amp = actor.moving ? 1.5 : 0.7;
    return Math.sin(now * rate + actor.x * 12) * amp;
  }

  function flyLift(actor, now) {
    if (!actor || !actor.flying) return 0;
    // Tall arc so chicken reads as flying over the desk / across the room.
    const p = Math.max(0, Math.min(1, (now - (actor.flyFrom || now)) / 1400));
    return Math.sin(p * Math.PI) * 72;
  }

  function drawAnimal(c, id, x, y, s, facing, lift) {
    c.save();
    c.translate(x, y - (lift || 0));
    if ((id === 'king' || id === '600') && drawCat) {
      drawCat(c, s, facing || 1, id);
      c.restore();
      return;
    }
    c.scale(facing || 1, 1);
    if (id === 'king') {
      // Brown tabby — grey-brown body, forehead M, dark stripes, dark paw tips
      c.fillStyle = '#6b5340';
      c.fillRect(-s * 0.48, -s * 0.18, s * 0.9, s * 0.42);
      c.fillRect(s * 0.18, -s * 0.52, s * 0.36, s * 0.38);
      c.fillStyle = '#8a6a50';
      c.fillRect(-s * 0.4, -s * 0.1, s * 0.72, s * 0.28);
      c.fillStyle = '#3a2a1c';
      c.fillRect(-s * 0.22, -s * 0.08, s * 0.1, s * 0.22);
      c.fillRect(-s * 0.02, -s * 0.12, s * 0.08, s * 0.26);
      c.fillRect(s * 0.16, -s * 0.06, s * 0.08, s * 0.2);
      c.fillRect(s * 0.26, -s * 0.5, s * 0.06, s * 0.16);
      c.fillRect(s * 0.36, -s * 0.48, s * 0.05, s * 0.12);
      c.fillRect(-s * 0.42, s * 0.18, s * 0.12, s * 0.08);
      c.fillRect(s * 0.18, s * 0.18, s * 0.12, s * 0.08);
      c.fillStyle = '#2a1a10';
      c.fillRect(s * 0.38, -s * 0.36, s * 0.08, s * 0.08);
      c.fillStyle = '#c4a888';
      c.fillRect(s * 0.22, -s * 0.28, s * 0.14, s * 0.08);
    } else if (id === '600') {
      // Ginger tabby — white chest/chin/socks, ringed tail
      c.fillStyle = '#e8a038';
      c.fillRect(-s * 0.42, -s * 0.16, s * 0.82, s * 0.4);
      c.fillRect(s * 0.16, -s * 0.5, s * 0.34, s * 0.36);
      c.fillStyle = '#c87820';
      c.fillRect(-s * 0.28, -s * 0.08, s * 0.1, s * 0.22);
      c.fillRect(-s * 0.08, -s * 0.12, s * 0.08, s * 0.26);
      c.fillRect(s * 0.12, -s * 0.06, s * 0.08, s * 0.2);
      c.fillRect(-s * 0.55, -s * 0.04, s * 0.18, s * 0.12);
      c.fillRect(-s * 0.62, -s * 0.1, s * 0.1, s * 0.08);
      c.fillRect(-s * 0.58, s * 0.04, s * 0.1, s * 0.08);
      c.fillStyle = '#f8f4ec';
      c.fillRect(s * 0.05, -s * 0.02, s * 0.28, s * 0.22);
      c.fillRect(s * 0.22, -s * 0.28, s * 0.14, s * 0.1);
      c.fillRect(-s * 0.38, s * 0.16, s * 0.14, s * 0.1);
      c.fillRect(s * 0.12, s * 0.16, s * 0.14, s * 0.1);
      c.fillStyle = '#2a1810';
      c.fillRect(s * 0.36, -s * 0.34, s * 0.08, s * 0.08);
    } else if (id === 'bonbon') {
      const g = s * 0.2;
      c.fillStyle = '#1a1210';
      c.beginPath();
      c.moveTo(-s * 0.08, -s * 0.02);
      c.lineTo(-s * 0.34, -s * 0.16);
      c.lineTo(-s * 0.22, s * 0.02);
      c.lineTo(-s * 0.32, s * 0.08);
      c.lineTo(-s * 0.06, s * 0.06);
      c.fill();
      c.fillStyle = '#2a1814';
      c.beginPath();
      c.ellipse(s * 0.02, s * 0.02, s * 0.24, s * 0.16, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#8a2830';
      c.beginPath();
      c.ellipse(s * 0.06, -s * 0.02, s * 0.12, s * 0.07, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#f0f0ec';
      c.fillRect(s * 0.02, -s * 0.02, s * 0.1, s * 0.05);
      c.fillStyle = '#e8a028';
      c.beginPath();
      c.ellipse(s * 0.2, -s * 0.08, s * 0.1, s * 0.09, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#f4e2b0';
      c.beginPath();
      c.ellipse(s * 0.28, -s * 0.1, s * 0.09, s * 0.08, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#e82828';
      c.beginPath();
      c.moveTo(s * 0.22, -s * 0.16);
      c.lineTo(s * 0.3, -s * 0.34);
      c.lineTo(s * 0.36, -s * 0.14);
      c.fill();
      c.fillRect(s * 0.24, -s * 0.08, s * 0.05, s * 0.07);
      c.fillStyle = '#e8a028';
      c.fillRect(s * 0.34, -s * 0.08, s * 0.07, s * 0.035);
      // Legs sit under mid/rear of body — not under the breast (avoids crawl read).
      c.fillStyle = '#f0c040';
      c.fillRect(-s * 0.1, s * 0.1, s * 0.04, g - s * 0.05);
      c.fillRect(s * 0.02, s * 0.11, s * 0.04, g - s * 0.06);
      c.fillStyle = '#c88820';
      c.fillRect(-s * 0.11, s * 0.18, s * 0.055, s * 0.028);
      c.fillRect(s * 0.01, s * 0.19, s * 0.055, s * 0.028);
      c.fillStyle = '#1a1020';
      c.fillRect(s * 0.3, -s * 0.12, s * 0.035, s * 0.035);
    } else if (id === 'chocolate') {
      const g = s * 0.2;
      c.fillStyle = '#c48848';
      c.beginPath();
      c.ellipse(-s * 0.02, s * 0.02, s * 0.26, s * 0.14, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(s * 0.18, -s * 0.08, s * 0.12, s * 0.1, 0, 0, Math.PI * 2);
      c.fill();
      c.fillRect(s * 0.08, -s * 0.36, s * 0.06, s * 0.22);
      c.fillRect(s * 0.2, -s * 0.36, s * 0.06, s * 0.22);
      c.fillStyle = '#a86a38';
      c.fillRect(s * 0.09, -s * 0.32, s * 0.035, s * 0.16);
      c.fillRect(s * 0.21, -s * 0.32, s * 0.035, s * 0.16);
      c.fillStyle = '#f8f4ec';
      c.beginPath();
      c.ellipse(s * 0.04, s * 0.04, s * 0.12, s * 0.07, 0, 0, Math.PI * 2);
      c.fill();
      c.fillRect(s * 0.14, -s * 0.12, s * 0.06, s * 0.05);
      // Far-side legs (dimmer, shorter) then near-side — four-leg side silhouette.
      c.fillStyle = 'rgba(140, 90, 50, 0.55)';
      c.fillRect(-s * 0.14, s * 0.09, s * 0.055, g - s * 0.1);
      c.fillRect(s * 0.06, s * 0.1, s * 0.055, g - s * 0.11);
      c.fillStyle = '#f8f4ec';
      c.fillRect(-s * 0.08, s * 0.1, s * 0.065, g - s * 0.07);
      c.fillRect(s * 0.12, s * 0.1, s * 0.065, g - s * 0.07);
      c.fillStyle = '#2a1810';
      c.fillRect(s * 0.22, -s * 0.1, s * 0.035, s * 0.035);
    } else if (id === 'silver') {
      const g = c.createLinearGradient(-s * 0.25, 0, s * 0.35, 0);
      g.addColorStop(0, '#e8eef4');
      g.addColorStop(0.35, '#f4f6fa');
      g.addColorStop(0.55, '#f07848');
      g.addColorStop(0.85, '#e84838');
      g.addColorStop(1, '#d8dce8');
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(0, 0, s * 0.31, s * 0.16, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#e8eef4';
      c.beginPath();
      c.moveTo(-s * 0.22, 0);
      c.lineTo(-s * 0.42, -s * 0.1);
      c.lineTo(-s * 0.42, s * 0.1);
      c.fill();
      c.fillStyle = 'rgba(20,16,28,0.85)';
      c.beginPath();
      c.arc(s * 0.2, 0, s * 0.04, 0, Math.PI * 2);
      c.fill();
      c.fillRect(-s * 0.1, -s * 0.08, s * 0.03, s * 0.16);
      c.fillStyle = '#e84828';
      c.beginPath();
      c.arc(s * 0.14, -s * 0.03, s * 0.035, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#1a1020';
      c.beginPath();
      c.arc(s * 0.15, -s * 0.03, s * 0.015, 0, Math.PI * 2);
      c.fill();
    } else {
      const ground = s * 0.2;
      c.fillStyle = '#c4a060';
      c.beginPath();
      c.ellipse(0, s * 0.06, s * 0.28, s * 0.08, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#2a1c10';
      c.beginPath();
      c.ellipse(-s * 0.02, -s * 0.02, s * 0.26, s * 0.16, 0, Math.PI, 0);
      c.lineTo(s * 0.24, s * 0.04);
      c.lineTo(-s * 0.28, s * 0.04);
      c.fill();
      c.fillStyle = '#e8c868';
      c.beginPath();
      c.moveTo(-s * 0.16, -s * 0.02);
      c.lineTo(-s * 0.06, -s * 0.16);
      c.lineTo(s * 0.04, s * 0.02);
      c.fill();
      c.beginPath();
      c.moveTo(-s * 0.02, -s * 0.02);
      c.lineTo(s * 0.08, -s * 0.14);
      c.lineTo(s * 0.16, s * 0.02);
      c.fill();
      c.fillStyle = '#d4b070';
      c.beginPath();
      c.ellipse(s * 0.24, s * 0.0, s * 0.1, s * 0.07, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#2a1810';
      c.fillRect(s * 0.32, -s * 0.01, s * 0.06, s * 0.03);
      c.fillStyle = '#c4a060';
      c.fillRect(-s * 0.12, s * 0.08, s * 0.06, ground - s * 0.08);
      c.fillRect(s * 0.06, s * 0.08, s * 0.06, ground - s * 0.08);
      c.fillStyle = '#1a1020';
      c.fillRect(s * 0.26, -s * 0.02, s * 0.03, s * 0.03);
    }
    c.restore();
  }

  function drawTankInterior(c, x, y, tw, th, large) {
    c.fillStyle = '#d9c4a4';
    c.fillRect(x + 4, y + th * 0.72, tw - 8, th * 0.28);
    c.fillStyle = '#6a5344';
    c.fillRect(x + tw * 0.18, y + th * 0.42, tw * 0.16, th * 0.32);
    c.fillStyle = '#2f6a3a';
    c.beginPath();
    c.ellipse(x + tw * 0.28, y + th * 0.48, tw * 0.12, th * 0.22, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#7dcea0';
    for (let i = 0; i < 4; i++) {
      c.fillRect(x + tw * 0.62, y + th * (0.28 + i * 0.1), Math.max(2, tw * 0.02), th * 0.14);
    }
    c.fillStyle = '#8fd4a8';
    c.beginPath();
    c.ellipse(x + tw * 0.7, y + th * 0.34, tw * 0.1, th * 0.08, 0, 0, Math.PI * 2);
    c.fill();
    state.critters.forEach((cr) => {
      c.fillStyle = 'rgba(70, 130, 150, 0.85)';
      c.beginPath();
      c.arc(x + (cr.u || 0.5) * tw, y + (cr.v || 0.5) * th, large ? 3.5 : 2.2, 0, Math.PI * 2);
      c.fill();
    });
  }

  function drawTank(c, w, h, focus) {
    const tank = tankNorm(focus);
    const x = tank.x0 * w;
    const y = tank.y0 * h;
    const tw = (tank.x1 - tank.x0) * w;
    const th = (tank.y1 - tank.y0) * h;
    const cab = h * (focus ? 0.06 : 0.045);
    c.fillStyle = '#6a5344';
    c.fillRect(x - 4, y + th, tw + 8, cab);
    c.fillStyle = '#4e3b32';
    c.fillRect(x + 6, y + th + cab * 0.55, 6, cab * 0.45);
    c.fillRect(x + tw - 12, y + th + cab * 0.55, 6, cab * 0.45);
    c.save();
    c.beginPath();
    c.rect(x, y, tw, th);
    c.clip();
    c.fillStyle = 'rgba(150, 206, 224, 0.55)';
    c.fillRect(x, y, tw, th);
    c.fillStyle = 'rgba(220, 244, 255, 0.35)';
    c.fillRect(x, y, tw, Math.max(3, th * 0.08));
    drawTankInterior(c, x, y, tw, th, focus);
    c.restore();
    c.strokeStyle = 'rgba(230, 246, 252, 0.85)';
    c.lineWidth = focus ? 4 : 3;
    c.strokeRect(x - 2, y - 4, tw + 4, th + 6);
  }

  /** Animal corner props. sharedLobby = threshold/daze: floor presence only (no 2nd window/lamp/wall perch). */
  function drawHabit(c, w, h, id, large, sharedLobby) {
    const u = Math.min(w, h) * (large ? 1.35 : 1);
    if (id === 'king') {
      const m = quietBody(w, h, false);
      if (!sharedLobby) {
        const ww = m.shoulder * 1.3;
        const wh = m.shoulder * 1.5;
        const x = w * 0.05;
        const y = h * 0.1;
        drawNightWindow(c, x, y, ww, wh);
        drawCoolLamp(c, x + ww + m.shoulder * 0.45, y + wh * 0.72, m.floor, m.shoulder * 0.7);
      }
      drawCatBed(c, w * HOMES.king.x, h * HOMES.king.y, m.shoulder * (sharedLobby ? 0.75 : 0.9));
    } else if (id === '600') {
      const bx = w * HOMES['600'].x;
      const by = h * HOMES['600'].y;
      c.fillStyle = 'rgba(255, 214, 140, 0.35)';
      c.beginPath();
      c.ellipse(bx, by, u * 0.055, u * 0.02, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#c4a06a';
      c.beginPath();
      c.ellipse(bx, by, u * 0.032, u * 0.014, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#8a6840';
      c.lineWidth = 2;
      c.stroke();
    } else if (id === 'bonbon') {
      if (sharedLobby) {
        // Floor perch ring — keep off the shared wall lamp / cabinet
        const x = w * HOMES.bonbon.x;
        const y = h * HOMES.bonbon.y;
        c.strokeStyle = '#8aa0b4';
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(x, y, u * 0.035, u * 0.014, 0, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = 'rgba(138, 160, 180, 0.25)';
        c.beginPath();
        c.ellipse(x, y, u * 0.022, u * 0.008, 0, 0, Math.PI * 2);
        c.fill();
      } else {
        const x = w * 0.72;
        const y = h * 0.2;
        c.fillStyle = '#8aa0b4';
        c.fillRect(x, y, u * 0.012, u * 0.05);
        c.fillRect(x, y, u * 0.07, u * 0.012);
      }
    } else if (id === 'chocolate') {
      const x = w * HOMES.chocolate.x;
      const y = h * HOMES.chocolate.y;
      c.fillStyle = '#2f6a3a';
      c.beginPath();
      c.ellipse(x + u * 0.05, y - u * 0.01, u * 0.02, u * 0.028, -0.4, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#c4a574';
      c.fillRect(x - u * 0.03, y - u * 0.02, u * 0.06, u * 0.028);
      c.fillStyle = '#a68458';
      c.fillRect(x - u * 0.03, y - u * 0.028, u * 0.06, u * 0.01);
      c.fillStyle = '#e6d2a8';
      c.fillRect(x - u * 0.012, y - u * 0.012, u * 0.024, u * 0.008);
    } else if (id === 'coin') {
      const x = w * HOMES.coin.x;
      const y = h * HOMES.coin.y;
      c.fillStyle = '#b7a48a';
      c.beginPath();
      c.ellipse(x, y, u * 0.04, u * 0.014, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#d8c4a4';
      c.beginPath();
      c.ellipse(x, y, u * 0.026, u * 0.008, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#c47a4a';
      c.beginPath();
      c.ellipse(x + u * 0.012, y - u * 0.002, u * 0.01, u * 0.005, 0, 0, Math.PI * 2);
      c.fill();
    } else if (id === 'silver') {
      drawTank(c, w, h, !!large && !sharedLobby);
    }
  }

  function drawConfigs(c, w, h, which) {
    const map = { city: 'king', country: '600', wind: 'bonbon', jungle: 'chocolate', pit: 'coin', tank: 'silver', silver: 'silver' };
    if (!which) {
      // Shared lobby: one architecture from drawHomeShell; animals only leave floor corners.
      ['king', '600', 'bonbon', 'chocolate', 'coin', 'silver'].forEach((id) => drawHabit(c, w, h, id, false, true));
      return;
    }
    drawHabit(c, w, h, map[which] || which, true, false);
  }

  function drawYifan(c, x, y, s, task) {
    if (drawHost) {
      drawHost(c, x, y, s, { task: task || 'daze' });
      return;
    }
    c.save();
    c.translate(x, y);
    c.fillStyle = '#ff6ec7';
    c.fillRect(-s * 0.28, -s * 0.05, s * 0.56, s * 0.38);
    c.fillStyle = '#ffcb9a';
    c.fillRect(-s * 0.16, -s * 0.42, s * 0.32, s * 0.28);
    c.fillStyle = '#2a1520';
    c.fillRect(-s * 0.18, -s * 0.5, s * 0.36, s * 0.16);
    c.restore();
  }

  function quietBody(w, h, focus) {
    const body = Math.min(w, h) * (focus ? 0.09 : 0.065);
    const host = body * (focus ? 1.6 : 1.5);
    const P = Math.max(4.2, host / 8.4);
    return { body, host, P, shoulder: P * 4.2, floor: h * 0.7 };
  }

  function deskPalette(animalId, task) {
    // Per-room wood + accent so focus scenes don't share one identical desk.
    const byAnimal = {
      king: { top: '#7a8a92', leg: '#3a4850', accent: '#c8d4dc', prop: 'lamp' },
      '600': { top: '#c4a06a', leg: '#6a4828', accent: '#e8d0a0', prop: 'mug' },
      bonbon: { top: '#d8c090', leg: '#8a6840', accent: '#f0e0b0', prop: 'grain' },
      chocolate: { top: '#b88878', leg: '#5a3830', accent: '#e8c8c0', prop: 'carrot' },
      coin: { top: '#5a5040', leg: '#2a2418', accent: '#a89870', prop: 'stone' },
      silver: { top: '#90a0b0', leg: '#405060', accent: '#d0e0f0', prop: 'bowl' },
    };
    const base = byAnimal[animalId] || { top: '#6b4a55', leg: '#4a342c', accent: '#c8a8b0', prop: 'none' };
    if (task === 'study') return { ...base, prop: base.prop === 'none' ? 'book' : base.prop, mode: 'study' };
    if (task === 'work') return { ...base, prop: base.prop === 'none' ? 'pad' : base.prop, mode: 'work' };
    if (task === 'daze') return { ...base, prop: 'mug', mode: 'daze' };
    return { ...base, mode: task || 'daze' };
  }

  function drawDesk(c, w, h, task, focus, animalId) {
    const m = quietBody(w, h, !!focus);
    const pal = deskPalette(animalId || null, task);
    // Desk must read as a real work surface — not the tiniest prop in the room.
    const dw = m.shoulder * (animalId === 'coin' ? 2.55 : animalId === 'silver' ? 2.7 : 2.95);
    const topH = Math.max(6, m.P * (animalId === 'silver' ? 0.36 : 0.48));
    const topY = h * 0.72 - m.P * 3.2;
    const x = w * 0.58 - dw * 0.5;
    const legW = Math.max(5, dw * (animalId === 'bonbon' ? 0.08 : 0.11));
    const legH = Math.max(0, m.floor - topY - topH);
    c.fillStyle = pal.leg;
    if (animalId === 'bonbon') {
      // Tapered farm-table legs
      c.fillRect(x + dw * 0.12, topY + topH, legW * 0.85, legH);
      c.fillRect(x + dw * 0.8, topY + topH, legW * 0.85, legH);
    } else if (animalId === 'silver') {
      // Slim metal legs
      c.fillRect(x + dw * 0.1, topY + topH, Math.max(3, legW * 0.45), legH);
      c.fillRect(x + dw * 0.86, topY + topH, Math.max(3, legW * 0.45), legH);
    } else {
      c.fillRect(x + dw * 0.14, topY + topH, legW, legH);
      c.fillRect(x + dw * 0.76, topY + topH, legW, legH);
    }
    c.fillStyle = pal.top;
    c.fillRect(x, topY, dw, topH);
    c.fillStyle = pal.accent;
    c.globalAlpha = 0.35;
    c.fillRect(x + dw * 0.06, topY + 1, dw * 0.88, Math.max(2, topH * 0.35));
    c.globalAlpha = 1;
    // Scene prop on the desk surface (animal accent first, then task fallback).
    const px = x + dw * 0.55;
    const py = topY - 2;
    if (pal.prop === 'lamp') {
      c.fillStyle = '#d8e0e8';
      c.fillRect(px + m.P * 0.25, py - m.P * 0.85, m.P * 0.35, m.P * 0.55);
      c.fillStyle = '#a0b0c0';
      c.fillRect(px + m.P * 0.35, py - m.P * 0.35, m.P * 0.14, m.P * 0.35);
    } else if (pal.prop === 'grain') {
      c.fillStyle = '#e8d060';
      c.beginPath();
      c.ellipse(px + m.P * 0.35, py - m.P * 0.2, m.P * 0.35, m.P * 0.18, 0, 0, Math.PI * 2);
      c.fill();
    } else if (pal.prop === 'carrot') {
      c.fillStyle = '#e87030';
      c.beginPath();
      c.moveTo(px + m.P * 0.15, py);
      c.lineTo(px + m.P * 0.55, py - m.P * 0.55);
      c.lineTo(px + m.P * 0.65, py);
      c.fill();
      c.fillStyle = '#58a040';
      c.fillRect(px + m.P * 0.48, py - m.P * 0.7, m.P * 0.12, m.P * 0.22);
    } else if (pal.prop === 'stone') {
      c.fillStyle = '#887858';
      c.beginPath();
      c.ellipse(px + m.P * 0.3, py - m.P * 0.15, m.P * 0.4, m.P * 0.18, 0, 0, Math.PI * 2);
      c.fill();
    } else if (pal.prop === 'bowl') {
      c.fillStyle = '#d0d8e0';
      c.beginPath();
      c.ellipse(px + m.P * 0.3, py - m.P * 0.12, m.P * 0.38, m.P * 0.16, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#70b0d0';
      c.beginPath();
      c.ellipse(px + m.P * 0.3, py - m.P * 0.18, m.P * 0.22, m.P * 0.08, 0, 0, Math.PI * 2);
      c.fill();
    } else if (pal.mode === 'study' || pal.prop === 'book') {
      c.fillStyle = '#406080';
      c.fillRect(px, py - m.P * 0.55, m.P * 0.85, m.P * 0.55);
      c.fillStyle = '#f0e8d8';
      c.fillRect(px + 2, py - m.P * 0.42, m.P * 0.55, m.P * 0.08);
    } else if (pal.mode === 'work' || pal.prop === 'pad') {
      c.fillStyle = '#2a3038';
      c.fillRect(px - m.P * 0.15, py - m.P * 0.7, m.P * 1.15, m.P * 0.72);
      c.fillStyle = 'rgba(140, 200, 255, 0.45)';
      c.fillRect(px - m.P * 0.05, py - m.P * 0.58, m.P * 0.95, m.P * 0.48);
    } else if (pal.prop === 'mug' || pal.mode === 'daze') {
      c.fillStyle = '#e8d0b0';
      c.fillRect(px + m.P * 0.2, py - m.P * 0.55, m.P * 0.42, m.P * 0.55);
      c.fillStyle = '#c8a888';
      c.fillRect(px + m.P * 0.55, py - m.P * 0.35, m.P * 0.18, m.P * 0.12);
    }
  }

  function drawWorld(c, w, h, now, photo) {
    const s = state.session;
    const focus = s && s.mode === 'focus';
    const animal = focus ? animalById(s.animalId) : null;
    c.clearRect(0, 0, w, h);
    if (!s) {
      c.fillStyle = '#1a1218';
      c.fillRect(0, 0, w, h);
      return;
    }
    const body = Math.min(w, h) * (focus ? 0.09 : 0.065);
    if (focus) {
      drawFocusRoom(c, w, h, animal.id);
      drawDesk(c, w, h, s.task, true, animal.id);
      drawYifan(c, w * 0.4, h * 0.72, body * 1.6, s.task || 'study');
      const actor = state.actors.find((a) => a.id === animal.id);
      const ax = actor ? actor.x * w : w * 0.3;
      const ay = (actor ? actor.y * h : h * 0.7) + breathOf(actor, now);
      const size = body * 0.82;
      if (animal.id === 'silver') {
        const tank = tankNorm(true);
        c.save();
        c.beginPath();
        c.rect(tank.x0 * w, tank.y0 * h, (tank.x1 - tank.x0) * w, (tank.y1 - tank.y0) * h);
        c.clip();
        drawAnimal(c, animal.id, ax, ay, size, actor ? actor.facing : 1, 0);
        c.restore();
      } else {
        drawAnimal(c, animal.id, ax, ay, size, actor ? actor.facing : 1, flyLift(actor, now));
      }
    } else {
      drawHomeShell(c, w, h, { dim: 0.72, now });
      drawConfigs(c, w, h, null);
      drawDesk(c, w, h, 'daze', false, null);
      drawYifan(c, w * 0.4, h * 0.72, body * 1.5, 'daze');
      const tank = tankNorm(false);
      state.actors.forEach((actor) => {
        const size = body * 0.82;
        const ay = actor.y * h + breathOf(actor, now);
        if (actor.id === 'silver') {
          c.save();
          c.beginPath();
          c.rect(tank.x0 * w, tank.y0 * h, (tank.x1 - tank.x0) * w, (tank.y1 - tank.y0) * h);
          c.clip();
          drawAnimal(c, actor.id, actor.x * w, ay, size, actor.facing, 0);
          c.restore();
        } else {
          drawAnimal(c, actor.id, actor.x * w, ay, size, actor.facing, flyLift(actor, now));
        }
      });
    }
    if (photo) return;
  }

  function button(c, x, y, w, h, label, hot) {
    c.fillStyle = hot ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.78)';
    roundRect(c, x, y, w, h, 8);
    c.fill();
    c.fillStyle = '#2a1520';
    c.font = '14px "Courier New", monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(label, x + w / 2, y + h / 2);
  }

  function layout(w, h) {
    const bw = Math.min(148, w * 0.28);
    const bh = 40;
    const midY = h * 0.52;
    const footY = h - 58;
    const durGap = 10;
    const durTotal = 52 + 52 + 72 + 72 + durGap * 3;
    let durX = Math.max(12, (w - durTotal) / 2);
    const durY = midY;
    const d25 = { id: 'd25', x: durX, y: durY, w: 52, h: bh };
    durX += 52 + durGap;
    const d50 = { id: 'd50', x: durX, y: durY, w: 52, h: bh };
    durX += 52 + durGap;
    const custom = { id: 'custom', x: durX, y: durY, w: 72, h: bh };
    durX += 72 + durGap;
    const openDur = { id: 'openDur', x: durX, y: durY, w: 72, h: bh };
    return {
      book: { id: 'book', x: w - 58, y: 16, w: 46, h: 40 },
      daze: { id: 'daze', x: w * 0.5 - bw - 8, y: midY, w: bw, h: 48 },
      focus: { id: 'focus', x: w * 0.5 + 8, y: midY, w: bw, h: 48 },
      study: { id: 'study', x: w * 0.5 - 90, y: midY, w: 84, h: 48 },
      work: { id: 'work', x: w * 0.5 + 6, y: midY, w: 84, h: 48 },
      d25, d50, custom, openDur,
      minus: { id: 'minus', x: w * 0.5 - 50, y: midY + 56, w: 36, h: bh },
      plus: { id: 'plus', x: w * 0.5 + 14, y: midY + 56, w: 36, h: bh },
      nextStep: { id: 'nextStep', x: w * 0.5 - 70, y: footY, w: 140, h: 40 },
      backStep: { id: 'backStep', x: 16, y: footY, w: 88, h: 40 },
      go: { id: 'go', x: w * 0.5 - 70, y: footY, w: 140, h: 40 },
      shutter: { id: 'shutter', x: w * 0.5 - 150, y: h - 52, w: 88, h: 36 },
      leave: { id: 'leave', x: w * 0.5 - 44, y: h - 52, w: 88, h: 36 },
      end: { id: 'end', x: w * 0.5 + 62, y: h - 52, w: 88, h: 36 },
      cards: { id: 'cards', x: w * 0.22, y: h * 0.22, w: w * 0.56, h: h * 0.28 },
      cardPrev: { id: 'cardPrev', x: w * 0.1, y: h * 0.32, w: 40, h: 40 },
      cardNext: { id: 'cardNext', x: w * 0.84, y: h * 0.32, w: 40, h: 40 },
      prev: { id: 'prev', x: w * 0.2 + 12, y: h * 0.78 - 40, w: 64, h: 28 },
      next: { id: 'next', x: w * 0.48 + 16, y: h * 0.78 - 40, w: 64, h: 28 },
      organize: { id: 'organize', x: w * 0.2 + w * 0.56 - 84, y: h * 0.16 + 12, w: 72, h: 26 },
      moveUp: { id: 'moveUp', x: w * 0.2 + 12, y: h * 0.78 - 40, w: 64, h: 28 },
      moveDown: { id: 'moveDown', x: w * 0.2 + 84, y: h * 0.78 - 40, w: 64, h: 28 },
      delEntry: { id: 'delEntry', x: w * 0.2 + 156, y: h * 0.78 - 40, w: 64, h: 28 },
      clearAll: { id: 'clearAll', x: w * 0.2 + w * 0.56 - 84, y: h * 0.16 + 44, w: 72, h: 26 },
    };
  }

  function hitList(w, h) {
    const L = layout(w, h);
    const phase = state.phase;
    if (phase === 'threshold') {
      const ids = ['book'];
      if (state.booklet) {
        ids.push('organize', 'book');
        if (state.bookletOrganize) {
          if (state.ledger.length) ids.push('delEntry', 'clearAll');
          if (state.ledger.length > 1) ids.push('moveUp', 'moveDown', 'next');
        } else if (state.ledger.length > 1) {
          ids.push('prev', 'next');
        }
        return ids.map((id) => L[id]).filter(Boolean);
      }
      const step = state.draftStep || 'mode';
      if (step === 'mode') {
        ids.push('daze', 'focus');
      } else if (step === 'animal') {
        ids.push('cardPrev', 'cardNext', 'nextStep', 'backStep');
      } else if (step === 'task') {
        ids.push('study', 'work', 'nextStep', 'backStep');
      } else if (step === 'duration') {
        ids.push('d25', 'd50', 'custom', 'openDur', 'go', 'backStep');
        if (state.dur === 'custom') ids.push('minus', 'plus');
      }
      return ids.map((id) => L[id]).filter(Boolean);
    }
    if (phase === 'room') return ['shutter', 'leave', 'end'].map((id) => L[id]);
    return [];
  }

  function hitAt(x, y) {
    const w = getW();
    const h = getH();
    const hits = hitList(w, h);
    for (let i = hits.length - 1; i >= 0; i--) {
      const r = hits[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.id;
    }
    if (state.booklet) {
      const spread = { x: w * 0.18, y: h * 0.14, w: w * 0.64, h: h * 0.68 };
      if (x < spread.x || x > spread.x + spread.w || y < spread.y || y > spread.y + spread.h) return 'book-close';
    }
    return null;
  }

  function drawCards(c, w, h) {
    const L = layout(w, h);
    const cw = Math.min(220, w * 0.3);
    const ch = Math.min(150, h * 0.24);
    const cx = w * 0.5;
    const cy = L.cards.y + L.cards.h * 0.42;
    const pos = state.cardPos;
    const base = Math.round(pos);
    for (let offset = -1; offset <= 1; offset++) {
      const idx = (base + offset + ANIMALS.length * 4) % ANIMALS.length;
      const animal = ANIMALS[idx];
      const shift = (base + offset - pos) * (cw * 0.78);
      const scale = offset === 0 ? 1 : 0.72;
      c.save();
      c.globalAlpha = offset === 0 ? 1 : 0.55;
      c.translate(cx + shift, cy);
      c.scale(scale, scale);
      c.translate(-cw / 2, -ch / 2);
      c.fillStyle = '#fffaf6';
      roundRect(c, 0, 0, cw, ch, 12);
      c.fill();
      c.save();
      roundRect(c, 8, 8, cw - 16, ch - 16, 8);
      c.clip();
      const iw = cw - 16;
      const ih = ch - 16;
      const wall = (FOCUS_ROOM[animal.id] || FOCUS_ROOM.king).wall[1];
      c.fillStyle = wall;
      c.fillRect(8, 8, iw, ih);
      drawAnimal(c, animal.id, 8 + iw * 0.5, 8 + ih * 0.58, Math.min(iw, ih) * 0.34, 1, 0);
      c.restore();
      c.restore();
    }
    const chosen = ANIMALS[((Math.round(pos) % ANIMALS.length) + ANIMALS.length) % ANIMALS.length];
    c.fillStyle = '#f4eadc';
    c.font = 'bold 16px "Courier New", monospace';
    c.textAlign = 'center';
    c.fillText(chosen.name, cx, cy + ch * 0.62);
    button(c, L.cardPrev.x, L.cardPrev.y, L.cardPrev.w, L.cardPrev.h, '‹', state.hover === 'cardPrev');
    button(c, L.cardNext.x, L.cardNext.y, L.cardNext.w, L.cardNext.h, '›', state.hover === 'cardNext');
  }

  function drawClosedBook(c, r, hot) {
    c.fillStyle = 'rgba(40, 20, 30, 0.28)';
    c.fillRect(r.x + 4, r.y + 5, r.w, r.h);
    c.fillStyle = hot ? '#fffaf3' : '#f4eadc';
    roundRect(c, r.x, r.y, r.w, r.h, 4);
    c.fill();
    c.strokeStyle = hot ? '#8d3b45' : 'rgba(90, 50, 60, 0.45)';
    c.lineWidth = hot ? 2 : 1;
    c.stroke();
    c.fillStyle = '#8d3b45';
    c.fillRect(r.x, r.y, 6, r.h);
    c.fillStyle = '#c45a4a';
    c.fillRect(r.x + r.w * 0.62, r.y + r.h - 2, 5, 12);
    c.fillStyle = 'rgba(80, 50, 60, 0.35)';
    c.fillRect(r.x + 12, r.y + 10, r.w - 20, 2);
    c.fillRect(r.x + 12, r.y + 16, r.w - 24, 2);
  }

  function drawHomeShell(c, w, h, opts) {
    const dim = opts && opts.dim != null ? opts.dim : 0.55;
    const now = opts && opts.now != null ? opts.now : (state.lastNow || performance.now());
    const floorY = h * 0.7;
    const wall = c.createLinearGradient(0, 0, 0, floorY);
    wall.addColorStop(0, `rgba(${Math.round(72 + 80 * (1 - dim))},${Math.round(58 + 70 * (1 - dim))},${Math.round(64 + 60 * (1 - dim))},1)`);
    wall.addColorStop(0.55, `rgba(${Math.round(58 + 70 * (1 - dim))},${Math.round(46 + 58 * (1 - dim))},${Math.round(52 + 50 * (1 - dim))},1)`);
    wall.addColorStop(1, `rgba(${Math.round(48 + 55 * (1 - dim))},${Math.round(38 + 48 * (1 - dim))},${Math.round(42 + 42 * (1 - dim))},1)`);
    c.fillStyle = wall;
    c.fillRect(0, 0, w, floorY);
    const floor = c.createLinearGradient(0, floorY, 0, h);
    floor.addColorStop(0, `rgba(${Math.round(90 + 40 * (1 - dim))},${Math.round(70 + 30 * (1 - dim))},${Math.round(52 + 24 * (1 - dim))},1)`);
    floor.addColorStop(1, `rgba(${Math.round(62 + 28 * (1 - dim))},${Math.round(48 + 20 * (1 - dim))},${Math.round(36 + 16 * (1 - dim))},1)`);
    c.fillStyle = floor;
    c.fillRect(0, floorY, w, h - floorY);
    c.fillStyle = `rgba(${Math.round(70 + 30 * (1 - dim))},${Math.round(54 + 24 * (1 - dim))},${Math.round(44 + 18 * (1 - dim))},1)`;
    c.fillRect(0, floorY - 3, w, 4);
    // Window frame — pane follows Yifan room city view (not flat black)
    const wx = w * 0.08;
    const wy = h * 0.12;
    const ww = w * 0.22;
    const wh = h * 0.28;
    c.fillStyle = `rgba(40, 32, 36, ${0.55 + dim * 0.2})`;
    c.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
    paintWindowPane(c, wx, wy, ww, wh, now);
    c.strokeStyle = 'rgba(200, 180, 150, 0.35)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(wx + ww / 2, wy);
    c.lineTo(wx + ww / 2, wy + wh);
    c.moveTo(wx, wy + wh / 2);
    c.lineTo(wx + ww, wy + wh / 2);
    c.stroke();
    // Side cabinet
    c.fillStyle = `rgba(${Math.round(88 + 30 * (1 - dim))},${Math.round(68 + 22 * (1 - dim))},${Math.round(54 + 16 * (1 - dim))},1)`;
    c.fillRect(w * 0.78, floorY - h * 0.22, w * 0.16, h * 0.22);
    c.fillStyle = `rgba(30, 22, 20, ${0.25 + dim * 0.15})`;
    c.fillRect(w * 0.79, floorY - h * 0.2, w * 0.14, h * 0.04);
    // Lamp glow (readable, not black void)
    const tint = [255, 196, 140];
    const reach = Math.min(w, h) * 0.5;
    const glow = c.createRadialGradient(w * 0.72, h * 0.28, 8, w * 0.72, h * 0.28, reach);
    glow.addColorStop(0, `rgba(${tint[0]},${tint[1]},${tint[2]},${0.35 - dim * 0.12})`);
    glow.addColorStop(0.5, `rgba(${tint[0]},${tint[1]},${tint[2]},${0.1 - dim * 0.04})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, w, floorY);
    // Floor lamp — shade above desk height, stem + base grounded on floorY.
    const lampX = w * 0.715;
    const shadeTop = h * 0.16;
    const stemTop = h * 0.22;
    const stemW = Math.max(3.5, Math.min(w, h) * 0.006);
    // Base disc on floor
    c.fillStyle = 'rgba(55, 40, 32, 0.82)';
    c.beginPath();
    c.ellipse(lampX + stemW * 0.5, floorY, Math.max(8, stemW * 3.2), Math.max(3, h * 0.008), 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(90, 65, 50, 0.75)';
    c.beginPath();
    c.ellipse(lampX + stemW * 0.5, floorY - 1.5, Math.max(5, stemW * 2.2), Math.max(2, h * 0.005), 0, 0, Math.PI * 2);
    c.fill();
    // Stem from shade to floor
    c.fillStyle = '#6a5040';
    c.fillRect(lampX, stemTop, stemW, Math.max(8, floorY - stemTop - 2));
    // Shade
    c.fillStyle = '#f0d7a8';
    c.beginPath();
    c.moveTo(w * 0.68, stemTop + 2);
    c.lineTo(w * 0.76, stemTop + 2);
    c.lineTo(w * 0.74, shadeTop);
    c.lineTo(w * 0.7, shadeTop);
    c.fill();
    if (isFoundingDay()) {
      const cx = w * 0.86;
      const cy = floorY - h * 0.24;
      const r = Math.min(w, h) * 0.028;
      c.fillStyle = '#3a8a9a';
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#e8d080';
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = '#e8d080';
      c.font = `${Math.max(8, r)}px "Courier New", monospace`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('N', cx, cy + 0.5);
    }
  }

  function drawLampHalo(c, w, h, rgb) {
    drawHomeShell(c, w, h, { dim: 0.85 });
  }

  function haloTint(id) {
    if (id === 'king') return [170, 198, 230];
    if (id === 'chocolate') return [150, 196, 120];
    if (id === 'silver') return [140, 206, 230];
    if (id === 'coin') return [214, 156, 90];
    if (id === 'bonbon') return [236, 214, 160];
    return [255, 186, 110];
  }

  function drawNightBase(c, w, h) {
    drawLampHalo(c, w, h);
  }

  function paintWindowPane(c, x, y, ww, wh, now) {
    if (drawWindowView) {
      try {
        drawWindowView(c, x, y, ww, wh, now || state.lastNow || performance.now());
        return;
      } catch (_) { /* fall through */ }
    }
    const sky = c.createLinearGradient(x, y, x, y + wh);
    sky.addColorStop(0, '#1a2038');
    sky.addColorStop(1, '#0c101c');
    c.fillStyle = sky;
    c.fillRect(x, y, ww, wh);
  }

  function drawNightWindow(c, x, y, ww, wh, now) {
    c.fillStyle = '#c8d4e4';
    c.fillRect(x - 4, y - 4, ww + 8, wh + 8);
    paintWindowPane(c, x, y, ww, wh, now);
    c.strokeStyle = 'rgba(200, 214, 230, 0.55)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x + ww * 0.5, y);
    c.lineTo(x + ww * 0.5, y + wh);
    c.moveTo(x, y + wh * 0.5);
    c.lineTo(x + ww, y + wh * 0.5);
    c.stroke();
  }

  function drawCoolLamp(c, x, shadeY, floorY, shoulder) {
    const stem = Math.max(3, shoulder * 0.08);
    const midX = x + stem * 0.5;
    c.fillStyle = 'rgba(50, 60, 90, 0.8)';
    c.beginPath();
    c.ellipse(midX, floorY, Math.max(7, stem * 2.8), Math.max(2.5, shoulder * 0.06), 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#8aa0c8';
    c.fillRect(x, shadeY, stem, Math.max(8, floorY - shadeY - 2));
    c.fillStyle = '#d5e6ff';
    c.beginPath();
    c.moveTo(x - shoulder * 0.28, shadeY + stem);
    c.lineTo(x + stem + shoulder * 0.28, shadeY + stem);
    c.lineTo(x + stem + shoulder * 0.12, shadeY - shoulder * 0.22);
    c.lineTo(x - shoulder * 0.12, shadeY - shoulder * 0.22);
    c.fill();
  }

  function drawCatBed(c, x, y, width) {
    c.fillStyle = '#241c30';
    c.beginPath();
    c.ellipse(x, y, width * 0.55, width * 0.2, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#3a3148';
    c.fillRect(x - width * 0.48, y - width * 0.16, width, width * 0.16);
  }

  function drawFloorPatch(c, x, y, rx, ry, color) {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
  }

  const FOCUS_ROOM = Object.freeze({
    king: {
      wall: ['#e8e4de', '#d8d2c8', '#c8c0b4'],
      floor: ['#d4c4a8', '#c0ac88', '#a89070'],
      base: '#9a8a78',
      light: [255, 220, 180],
    },
    '600': {
      wall: ['#f2e6d4', '#e8d8c0', '#dcc8a8'],
      floor: ['#8a6040', '#6e4a30', '#5a3a24'],
      base: '#5c4030',
      light: [255, 196, 120],
    },
    bonbon: {
      wall: ['#f8f6f2', '#f0ebe4', '#e4ddd4'],
      floor: ['#484850', '#3a3a42', '#2e2e34'],
      base: '#28282e',
      light: [255, 230, 160],
    },
    chocolate: {
      wall: ['#f4dce8', '#e8f0dc', '#f0e4f4'],
      floor: ['#e8d0a0', '#d8bc88', '#c8a870'],
      base: '#b89060',
      light: [255, 160, 200],
    },
    silver: {
      wall: ['#e8dcc8', '#dccfb8', '#d0c0a4'],
      floor: ['#c8b898', '#b8a880', '#a89870'],
      base: '#8a7858',
      light: [255, 236, 200],
    },
    coin: {
      wall: ['#d8c4a4', '#c8b090', '#b89c78'],
      floor: ['#8a7050', '#6e5840', '#5a4834'],
      base: '#4a3a28',
      light: [255, 186, 110],
    },
  });

  function drawFocusRoomShell(c, w, h, pal) {
    const floorY = h * 0.7;
    const wall = c.createLinearGradient(0, 0, 0, floorY);
    wall.addColorStop(0, pal.wall[0]);
    wall.addColorStop(0.55, pal.wall[1]);
    wall.addColorStop(1, pal.wall[2]);
    c.fillStyle = wall;
    c.fillRect(0, 0, w, floorY);
    const floor = c.createLinearGradient(0, floorY, 0, h);
    floor.addColorStop(0, pal.floor[0]);
    floor.addColorStop(0.4, pal.floor[1]);
    floor.addColorStop(1, pal.floor[2]);
    c.fillStyle = floor;
    c.fillRect(0, floorY, w, h - floorY);
    c.fillStyle = pal.base;
    c.fillRect(0, floorY - 3, w, 4);
    const tint = pal.light;
    const reach = Math.min(w, h) * 0.55;
    const glow = c.createRadialGradient(w * 0.72, h * 0.28, 6, w * 0.72, h * 0.28, reach);
    glow.addColorStop(0, `rgba(${tint[0]},${tint[1]},${tint[2]},0.28)`);
    glow.addColorStop(0.45, `rgba(${tint[0]},${tint[1]},${tint[2]},0.08)`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, w, floorY);
  }

  function drawWarmTableLamp(c, x, shadeY, floorY, sh) {
    const stem = Math.max(3, sh * 0.07);
    const midX = x + stem * 0.5;
    c.fillStyle = 'rgba(55, 40, 32, 0.82)';
    c.beginPath();
    c.ellipse(midX, floorY, Math.max(7, stem * 2.8), Math.max(2.5, sh * 0.06), 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#6a5040';
    c.fillRect(x, shadeY, stem, Math.max(8, floorY - shadeY - 2));
    c.fillStyle = '#f0d7a8';
    c.beginPath();
    c.moveTo(x - sh * 0.3, shadeY + stem);
    c.lineTo(x + stem + sh * 0.3, shadeY + stem);
    c.lineTo(x + stem + sh * 0.12, shadeY - sh * 0.2);
    c.lineTo(x - sh * 0.1, shadeY - sh * 0.2);
    c.fill();
  }

  /** City window — per-room frame styles (no shared 田字格). Pane via paintWindowPane. */
  function drawFocusWindow(c, w, h, sh, now, opts) {
    const o = opts || {};
    const style = o.style || 'casement';
    const ww = o.ww != null ? o.ww : Math.max(sh * 3.2, w * 0.3);
    const wh = o.wh != null ? o.wh : Math.max(sh * 2.45, h * 0.3);
    const wx = o.wx != null ? o.wx : w * 0.2;
    const wy = o.wy != null ? o.wy : h * 0.17;
    const frame = o.frame || '#c8c0b4';
    const frameW = o.frameW != null ? o.frameW : Math.max(6, Math.min(8, sh * 0.1));
    const sillH = o.sill != null ? o.sill : Math.max(5, frameW * 0.9);
    const sill = o.sillColor || frame;
    const mullion = o.mullion || 'rgba(200, 214, 230, 0.55)';
    const mullionW = o.mullionW != null ? o.mullionW : Math.max(2, frameW * 0.32);
    const tNow = now || state.lastNow || performance.now();

    function paintRectPane(x, y, pw, ph) {
      paintWindowPane(c, x, y, pw, ph, tNow);
    }

    function drawSill(x, yBottom, width) {
      c.fillStyle = sill;
      c.fillRect(x - frameW * 0.2, yBottom, width + frameW * 0.4, sillH);
      c.fillStyle = 'rgba(0,0,0,0.12)';
      c.fillRect(x - frameW * 0.2, yBottom + sillH - 2, width + frameW * 0.4, 2);
    }

    if (style === 'archPair') {
      // Twin open arches — almost no inner grid.
      const gap = Math.max(6, ww * 0.06);
      const aw = (ww - gap) * 0.5;
      const r = aw * 0.5;
      for (let i = 0; i < 2; i++) {
        const ax = wx + i * (aw + gap);
        c.fillStyle = frame;
        c.beginPath();
        c.moveTo(ax - frameW, wy + r);
        c.arc(ax + aw * 0.5, wy + r, r + frameW, Math.PI, 0, false);
        c.lineTo(ax + aw + frameW, wy + wh);
        c.lineTo(ax - frameW, wy + wh);
        c.closePath();
        c.fill();
        c.save();
        c.beginPath();
        c.moveTo(ax, wy + r);
        c.arc(ax + aw * 0.5, wy + r, r, Math.PI, 0, false);
        c.lineTo(ax + aw, wy + wh);
        c.lineTo(ax, wy + wh);
        c.closePath();
        c.clip();
        paintRectPane(ax, wy, aw, wh);
        c.restore();
      }
      drawSill(wx - frameW, wy + wh, ww + frameW * 2);
      return { wx, wy, ww, wh };
    }

    // Rectangular outer frame + sill for remaining styles.
    c.fillStyle = frame;
    c.fillRect(wx - frameW, wy - frameW, ww + frameW * 2, wh + frameW * 2);
    drawSill(wx - frameW * 1.1, wy + wh, ww + frameW * 2.2);
    paintRectPane(wx, wy, ww, wh);

    c.strokeStyle = mullion;
    c.lineWidth = mullionW;
    c.beginPath();
    if (style === 'casement') {
      // Two vertical leaves; hint of an open right sash.
      const mid = wx + ww * 0.5;
      c.moveTo(mid, wy);
      c.lineTo(mid, wy + wh);
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.12)';
      c.beginPath();
      c.moveTo(mid, wy + 4);
      c.lineTo(wx + ww - 4, wy + wh * 0.08);
      c.lineTo(wx + ww - 4, wy + wh - 4);
      c.lineTo(mid, wy + wh - 4);
      c.closePath();
      c.fill();
      c.strokeStyle = mullion;
      c.strokeRect(mid + 2, wy + 4, ww * 0.42, wh - 8);
    } else if (style === 'triptych') {
      // Three vertical panes — center wider.
      const a = wx + ww * 0.22;
      const b = wx + ww * 0.78;
      c.moveTo(a, wy);
      c.lineTo(a, wy + wh);
      c.moveTo(b, wy);
      c.lineTo(b, wy + wh);
      c.stroke();
    } else if (style === 'transom') {
      // Top transom band + two lower leaves (no center cross).
      const ty = wy + wh * 0.22;
      c.moveTo(wx, ty);
      c.lineTo(wx + ww, ty);
      c.moveTo(wx + ww * 0.5, ty);
      c.lineTo(wx + ww * 0.5, wy + wh);
      c.stroke();
    } else if (style === 'shoji') {
      // Sparse vertical slats only.
      const n = 5;
      for (let i = 1; i < n; i++) {
        const x = wx + (ww * i) / n;
        c.moveTo(x, wy + 2);
        c.lineTo(x, wy + wh - 2);
      }
      c.stroke();
    } else if (style === 'landscape') {
      // Wide: top transom strip + three lower verticals.
      const ty = wy + wh * 0.2;
      c.moveTo(wx, ty);
      c.lineTo(wx + ww, ty);
      c.moveTo(wx + ww / 3, ty);
      c.lineTo(wx + ww / 3, wy + wh);
      c.moveTo(wx + (ww * 2) / 3, ty);
      c.lineTo(wx + (ww * 2) / 3, wy + wh);
      c.stroke();
    }
    return { wx, wy, ww, wh };
  }

  function drawFocusRoom(c, w, h, id) {
    const m = quietBody(w, h, true);
    const sh = m.shoulder;
    const pal = FOCUS_ROOM[id] || FOCUS_ROOM.king;
    drawFocusRoomShell(c, w, h, pal);
    const now = state.lastNow || performance.now();

    if (id === 'king') {
      const win = drawFocusWindow(c, w, h, sh, now, {
        style: 'archPair',
        ww: Math.max(sh * 3.4, w * 0.32), wh: Math.max(sh * 2.6, h * 0.32),
        wx: w * 0.2, wy: h * 0.16, frame: '#b8b0a4', sillColor: '#9a9288', frameW: 7,
      });
      drawCoolLamp(c, win.wx + win.ww + sh * 0.35, win.wy + win.wh * 0.4, m.floor, sh);
      c.fillStyle = '#b8aea0';
      c.fillRect(w * 0.78, m.floor - sh * 1.4, sh * 0.9, sh * 1.4);
      c.fillStyle = '#d0c8bc';
      c.fillRect(w * 0.78, m.floor - sh * 1.5, sh * 0.9, sh * 0.12);
      const bx = w * HOMES.king.x;
      const by = h * HOMES.king.y;
      drawFloorPatch(c, bx, by, sh * 1.5, sh * 0.42, 'rgba(90, 80, 70, 0.35)');
      drawCatBed(c, bx, by, sh * 1.7);
    } else if (id === '600') {
      // Window upper-right — balances left cabinet / rug cluster.
      drawFocusWindow(c, w, h, sh, now, {
        style: 'casement',
        ww: Math.max(sh * 3.2, w * 0.28), wh: Math.max(sh * 2.4, h * 0.29),
        wx: w * 0.56, wy: h * 0.17, frame: '#a88860', sillColor: '#8a6840',
        mullion: 'rgba(220, 190, 150, 0.55)', frameW: 7,
      });
      drawWarmTableLamp(c, w * 0.48, h * 0.3, m.floor, sh * 0.9);
      c.fillStyle = '#c4a06a';
      c.fillRect(w * 0.08, m.floor - sh * 1.1, sh * 1.2, sh * 1.1);
      c.fillStyle = '#8a6840';
      c.fillRect(w * 0.08, m.floor - sh * 1.2, sh * 1.2, sh * 0.12);
      const bx = w * 0.28;
      const by = h * HOMES['600'].y;
      drawFloorPatch(c, bx, by + sh * 0.08, sh * 1.5, sh * 0.45, 'rgba(140, 90, 50, 0.4)');
      c.fillStyle = '#6a5340';
      c.beginPath();
      c.ellipse(bx, by, sh * 1.15, sh * 0.38, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#c4a06a';
      c.beginPath();
      c.ellipse(bx, by - sh * 0.06, sh * 0.95, sh * 0.28, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#8a6840';
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = '#d8c4a0';
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          if ((row + col) % 2 === 0) {
            c.fillRect(bx - sh * 0.9 + col * sh * 0.45, by + sh * 0.2 + row * sh * 0.22, sh * 0.4, sh * 0.18);
          }
        }
      }
    } else if (id === 'bonbon') {
      // Window upper-center — clears Mondrian left and perch right.
      drawFocusWindow(c, w, h, sh, now, {
        style: 'triptych',
        ww: Math.max(sh * 3.3, w * 0.3), wh: Math.max(sh * 2.45, h * 0.3),
        wx: w * 0.36, wy: h * 0.17, frame: '#e8e4dc', sillColor: '#3a3a42',
        mullion: 'rgba(58, 58, 66, 0.55)', frameW: 6, mullionW: 2.5,
      });
      c.fillStyle = '#c04040';
      c.fillRect(w * 0.06, h * 0.18, sh * 1.1, sh * 1.1);
      c.fillStyle = '#3060a0';
      c.fillRect(w * 0.06 + sh * 0.55, h * 0.18 + sh * 0.55, sh * 0.55, sh * 0.55);
      c.fillStyle = '#e8c040';
      c.fillRect(w * 0.88, h * 0.22, sh * 0.7, sh * 0.7);
      c.fillStyle = '#2a2a2e';
      c.fillRect(w * 0.82, m.floor - sh * 0.9, sh * 1.0, sh * 0.9);
      const x = w * 0.68;
      const top = h * 0.16;
      const foot = h * HOMES.bonbon.y;
      drawFloorPatch(c, x + sh * 0.7, foot, sh * 1.15, sh * 0.3, 'rgba(40, 40, 44, 0.55)');
      c.fillStyle = '#707880';
      c.fillRect(x + sh * 0.55, top + sh * 0.15, Math.max(8, sh * 0.14), foot - top);
      c.fillStyle = '#a0b0c0';
      c.fillRect(x, top, Math.max(6, sh * 0.1), sh * 1.35);
      c.fillRect(x, top, sh * 2.0, Math.max(8, sh * 0.12));
      drawWarmTableLamp(c, w * 0.12, h * 0.32, m.floor, sh * 0.85);
    } else if (id === 'chocolate') {
      // Window upper mid-left — between candy and right shelf.
      drawFocusWindow(c, w, h, sh, now, {
        style: 'transom',
        ww: Math.max(sh * 3.2, w * 0.28), wh: Math.max(sh * 2.5, h * 0.3),
        wx: w * 0.32, wy: h * 0.16, frame: '#f0c8d8', sillColor: '#e0a8c0',
        mullion: 'rgba(230, 170, 200, 0.55)', frameW: 7,
      });
      c.fillStyle = '#ff90c0';
      c.beginPath();
      c.arc(w * 0.14, h * 0.22, sh * 0.35, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#90e070';
      c.beginPath();
      c.arc(w * 0.22, h * 0.28, sh * 0.28, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#80c0ff';
      c.fillRect(w * 0.8, m.floor - sh * 1.0, sh * 0.85, sh * 1.0);
      c.fillStyle = '#ffe080';
      c.fillRect(w * 0.8, m.floor - sh * 1.1, sh * 0.85, sh * 0.14);
      const x = w * HOMES.chocolate.x;
      const y = h * HOMES.chocolate.y;
      drawFloorPatch(c, x, y + sh * 0.08, sh * 1.35, sh * 0.42, 'rgba(120, 200, 140, 0.35)');
      c.fillStyle = '#2f6a3a';
      c.beginPath();
      c.ellipse(x + sh * 0.85, y - sh * 0.35, sh * 0.55, sh * 0.9, -0.5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#c4a574';
      c.fillRect(x - sh * 0.7, y - sh * 0.42, sh * 1.6, sh * 0.62);
      c.fillStyle = '#a68458';
      c.fillRect(x - sh * 0.7, y - sh * 0.58, sh * 1.6, sh * 0.22);
      c.fillStyle = '#e6d2a8';
      c.fillRect(x - sh * 0.22, y - sh * 0.28, sh * 0.62, sh * 0.16);
      c.fillStyle = '#ffb0d0';
      c.fillRect(x - sh * 1.1, y - sh * 0.15, sh * 0.45, sh * 0.35);
    } else if (id === 'silver') {
      // Window upper-right — balances tank on the left.
      drawFocusWindow(c, w, h, sh, now, {
        style: 'shoji',
        ww: Math.max(sh * 3.3, w * 0.3), wh: Math.max(sh * 2.5, h * 0.3),
        wx: w * 0.58, wy: h * 0.17, frame: '#d8c8a8', sillColor: '#b8a888',
        mullion: 'rgba(200, 185, 160, 0.55)', frameW: 7,
      });
      c.fillStyle = '#c8b898';
      c.fillRect(w * 0.72, m.floor - sh * 1.15, sh * 1.3, sh * 1.15);
      c.fillStyle = '#a89070';
      c.fillRect(w * 0.72, m.floor - sh * 1.25, sh * 1.3, sh * 0.12);
      c.fillStyle = '#f5ecd8';
      c.beginPath();
      c.ellipse(w * 0.86, h * 0.52, sh * 0.4, sh * 0.3, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#d8c8a8';
      c.fillRect(w * 0.85, h * 0.52, Math.max(4, sh * 0.07), m.floor - h * 0.52);
      drawTank(c, w, h, true);
    } else if (id === 'coin') {
      // Window upper-right — sand pit stays lower-center-left.
      drawFocusWindow(c, w, h, sh, now, {
        style: 'landscape',
        ww: Math.max(sh * 3.4, w * 0.32), wh: Math.max(sh * 2.35, h * 0.28),
        wx: w * 0.55, wy: h * 0.18, frame: '#c8a878', sillColor: '#a88858',
        mullion: 'rgba(210, 180, 130, 0.55)', frameW: 7,
      });
      drawWarmTableLamp(c, w * 0.42, h * 0.34, m.floor, sh * 0.9);
      c.fillStyle = '#a88860';
      c.beginPath();
      c.ellipse(w * 0.86, m.floor - sh * 0.15, sh * 0.45, sh * 0.55, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#8a6840';
      c.fillRect(w * 0.84, m.floor - sh * 0.05, sh * 0.35, sh * 0.05);
      const x = w * HOMES.coin.x;
      const y = h * HOMES.coin.y;
      c.fillStyle = '#4a3424';
      c.beginPath();
      c.ellipse(x, y + sh * 0.06, sh * 1.85, sh * 0.58, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#6a5038';
      c.beginPath();
      c.ellipse(x, y, sh * 1.45, sh * 0.4, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#b7a48a';
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = '#d8c4a4';
      c.beginPath();
      c.ellipse(x - sh * 0.15, y - sh * 0.04, sh * 0.85, sh * 0.2, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#c47a4a';
      c.beginPath();
      c.ellipse(x + sh * 0.55, y - sh * 0.02, sh * 0.32, sh * 0.14, 0.4, 0, Math.PI * 2);
      c.fill();
    }
  }

  function drawRoomShell(c, w, h) {
    drawHomeShell(c, w, h, { dim: 0.55 });
  }

  function drawThreshold(c, w, h, now) {
    drawHomeShell(c, w, h, { dim: 0.48, now });
    drawConfigs(c, w, h, null);
    drawDesk(c, w, h, 'daze', false, null);
    const L = layout(w, h);
    drawClosedBook(c, L.book, state.hover === 'book');
    if (state.booklet) {
      drawBooklet(c, w, h);
      return;
    }
    const step = state.draftStep || 'mode';
    c.fillStyle = 'rgba(255,248,240,0.88)';
    c.font = '15px "Courier New", monospace';
    c.textAlign = 'center';
    if (step === 'mode') {
      c.fillText(zh() ? '选一种待法' : 'How will you stay?', w / 2, h * 0.42);
      button(c, L.daze.x, L.daze.y, L.daze.w, L.daze.h, zh() ? '发呆' : 'Daze', state.hover === 'daze');
      button(c, L.focus.x, L.focus.y, L.focus.w, L.focus.h, zh() ? '专注' : 'Focus', state.hover === 'focus');
      return;
    }
    if (step === 'animal') {
      c.fillText(zh() ? '选一只陪伴' : 'Pick a companion', w / 2, h * 0.14);
      drawCards(c, w, h);
      button(c, L.backStep.x, L.backStep.y, L.backStep.w, L.backStep.h, zh() ? '返回' : 'Back', state.hover === 'backStep');
      button(c, L.nextStep.x, L.nextStep.y, L.nextStep.w, L.nextStep.h, zh() ? '下一步' : 'Next', state.hover === 'nextStep');
      return;
    }
    if (step === 'task') {
      c.fillText(zh() ? '今天做什么' : 'What are you doing?', w / 2, h * 0.42);
      button(c, L.study.x, L.study.y, L.study.w, L.study.h, zh() ? '学习' : 'Study', state.task === 'study' || state.hover === 'study');
      button(c, L.work.x, L.work.y, L.work.w, L.work.h, zh() ? '工作' : 'Work', state.task === 'work' || state.hover === 'work');
      button(c, L.backStep.x, L.backStep.y, L.backStep.w, L.backStep.h, zh() ? '返回' : 'Back', state.hover === 'backStep');
      button(c, L.nextStep.x, L.nextStep.y, L.nextStep.w, L.nextStep.h, zh() ? '下一步' : 'Next', state.hover === 'nextStep');
      return;
    }
    // duration
    c.fillText(zh() ? '坐多久' : 'How long?', w / 2, h * 0.38);
    button(c, L.d25.x, L.d25.y, L.d25.w, L.d25.h, '25', state.dur === '25');
    button(c, L.d50.x, L.d50.y, L.d50.w, L.d50.h, '50', state.dur === '50');
    button(c, L.custom.x, L.custom.y, L.custom.w, L.custom.h, zh() ? '自定义' : 'Custom', state.dur === 'custom');
    button(c, L.openDur.x, L.openDur.y, L.openDur.w, L.openDur.h, zh() ? '一直' : 'Open', state.dur === 'open');
    if (state.dur === 'custom') {
      button(c, L.minus.x, L.minus.y, L.minus.w, L.minus.h, '-', state.hover === 'minus');
      button(c, L.plus.x, L.plus.y, L.plus.w, L.plus.h, '+', state.hover === 'plus');
      c.fillStyle = '#fff8f0';
      c.font = '14px "Courier New", monospace';
      c.textAlign = 'left';
      c.fillText(`${state.customMin}m`, L.plus.x + 48, L.plus.y + 22);
    }
    button(c, L.backStep.x, L.backStep.y, L.backStep.w, L.backStep.h, zh() ? '返回' : 'Back', state.hover === 'backStep');
    button(c, L.go.x, L.go.y, L.go.w, L.go.h, zh() ? '进入' : 'Enter', state.hover === 'go');
  }

  function drawBooklet(c, w, h) {
    const x = w * 0.2;
    const y = h * 0.16;
    const pw = w * 0.28;
    const ph = h * 0.62;
    c.fillStyle = '#5c4033';
    c.fillRect(x - 8, y - 6, pw * 2 + 16, ph + 14);
    c.fillStyle = '#f7f1e6';
    c.fillRect(x, y, pw, ph);
    c.fillRect(x + pw, y, pw, ph);
    c.fillStyle = '#8d3b45';
    c.fillRect(x + pw - 3, y, 6, ph);
    const entry = state.ledger[state.bookletIdx];
    c.fillStyle = '#2a1520';
    c.font = '14px "Courier New", monospace';
    c.textAlign = 'left';
    if (!entry) {
      c.fillText(zh() ? '空白' : 'Blank', x + 16, y + 36);
      return;
    }
    if (entry.photo) {
      const img = imageFor(entry.photo);
      if (img && img.complete && img.naturalWidth) {
        c.drawImage(img, x + 12, y + 16, pw - 24, ph * 0.55);
      }
    }
    const when = new Date(entry.at);
    const date = `${when.getMonth() + 1}/${when.getDate()}`;
    const who = entry.animalId ? animalById(entry.animalId).name : (zh() ? '发呆' : 'Daze');
    const kind = entry.task === 'study' ? (zh() ? '学习' : 'Study') : entry.task === 'work' ? (zh() ? '工作' : 'Work') : '';
    const rx = x + pw + 16;
    const foundingStar = (() => {
      try {
        const d = new Date(entry.at);
        return isFoundingDay(d) ? ' ★' : '';
      } catch (_) { return ''; }
    })();
    c.fillText(`${date}${foundingStar}`, rx, y + 36);
    c.fillText(`${who}  ${kind}`, rx, y + 58);
    c.fillText(fmt(entry.durationMs), rx, y + 80);
    c.fillText(entry.completed ? (zh() ? '坐到点' : 'Finished') : (zh() ? '未坐到点' : 'Ended'), rx, y + 102);
    c.fillText(entry.line || '', rx, y + 140);
    const orgLabel = state.bookletOrganize ? (zh() ? '完成' : 'Done') : (zh() ? '整理' : 'Organize');
    button(c, x + pw * 2 - 84, y + 12, 72, 26, orgLabel, state.hover === 'organize' || state.bookletOrganize);
    if (state.bookletOrganize) {
      if (state.ledger.length) {
        button(c, x + pw * 2 - 84, y + 44, 72, 26, zh() ? '清空' : 'Clear', state.hover === 'clearAll');
        button(c, x + 156, y + ph - 40, 64, 28, zh() ? '删除' : 'Del', state.hover === 'delEntry');
      }
      if (state.ledger.length > 1) {
        button(c, x + 12, y + ph - 40, 64, 28, zh() ? '上移' : 'Up', state.hover === 'moveUp');
        button(c, x + 84, y + ph - 40, 64, 28, zh() ? '下移' : 'Down', state.hover === 'moveDown');
        button(c, x + pw + 16, y + ph - 40, 64, 28, zh() ? '下一笔' : 'Next', state.hover === 'next');
      }
    } else if (state.ledger.length > 1) {
      button(c, x + 12, y + ph - 40, 64, 28, zh() ? '上一笔' : 'Prev', state.hover === 'prev');
      button(c, x + pw + 16, y + ph - 40, 64, 28, zh() ? '下一笔' : 'Next', state.hover === 'next');
    }
  }

  const images = new Map();
  function imageFor(src) {
    if (!src) return null;
    let img = images.get(src);
    if (!img) {
      img = new Image();
      img.src = src;
      images.set(src, img);
    }
    return img;
  }

  function drawRoom(c, w, h, now) {
    const enter = state.phase === 'entering' && !state.skipEnter;
    let p = 1;
    if (enter) p = Math.min(1, (now - state.enterT0) / 1000);
    c.save();
    if (p < 1) {
      const sx = 0.86 + 0.14 * p;
      c.translate(w / 2, h / 2);
      c.scale(sx, sx);
      c.translate(-w / 2, -h / 2);
    }
    drawWorld(c, w, h, now, false);
    c.restore();
    if (p < 1) return;
    const s = state.session;
    const left = remainingMs(now);
    c.fillStyle = 'rgba(255,255,255,0.92)';
    c.font = '22px "Courier New", monospace';
    c.textAlign = 'center';
    c.fillText(left == null ? fmt(elapsedMs(now)) : fmt(Math.max(0, left)), w / 2, 36);
    const L = layout(w, h);
    button(c, L.shutter.x, L.shutter.y, L.shutter.w, L.shutter.h, zh() ? '快门' : 'Shot', state.hover === 'shutter');
    button(c, L.leave.x, L.leave.y, L.leave.w, L.leave.h, zh() ? '暂停' : 'Pause', state.hover === 'leave');
    button(c, L.end.x, L.end.y, L.end.w, L.end.h, zh() ? '结束' : 'End', state.hover === 'end');
  }

  function withScreen(fn) {
    const c = getCtx();
    const w = getW();
    const h = getH();
    const canvas = c.canvas;
    c.save();
    c.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    fn(c, w, h);
    c.restore();
  }

  function draw(now) {
    if (!isOpen()) return;
    const dt = state.lastNow ? Math.min(48, now - state.lastNow) : 16;
    state.lastNow = now;
    if (!state.drag) state.cardPos += (state.cardIndex - state.cardPos) * 0.22;
    if (state.phase === 'room' || state.phase === 'entering') {
      updateActors(now, dt);
      maybeFinishTimer(now);
      maybeAutoShot(now);
      if (state.phase === 'entering' && (state.skipEnter || now - state.enterT0 >= 1000)) {
        state.phase = 'room';
      }
    }
    syncAudioScene();
    withScreen((c, w, h) => {
      if (state.phase === 'threshold') drawThreshold(c, w, h, now);
      else drawRoom(c, w, h, now);
    });
  }

  function drawDoor() {}

  function stepCard(dir) {
    state.cardIndex = (state.cardIndex + dir + ANIMALS.length) % ANIMALS.length;
    ui();
  }

  /** Wizard step back. Returns true if stayed in Quiet (step changed); false if caller should exit. */
  function stepWizardBack() {
    if (state.phase !== 'threshold' || state.booklet) return false;
    const step = state.draftStep || 'mode';
    if (step === 'mode') return false;
    if (step === 'animal' || (step === 'duration' && state.draftMode !== 'focus')) {
      state.draftMode = null;
      state.draftStep = 'mode';
    } else if (step === 'task') {
      state.draftStep = 'animal';
    } else if (step === 'duration' && state.draftMode === 'focus') {
      state.draftStep = 'task';
    } else {
      state.draftMode = null;
      state.draftStep = 'mode';
    }
    ui();
    return true;
  }

  function activate(id, x, y, now) {
    if (id === 'book') {
      state.booklet = !state.booklet;
      if (!state.booklet) state.bookletOrganize = false;
      ui();
      return;
    }
    if (id === 'book-close') {
      state.booklet = false;
      state.bookletOrganize = false;
      return;
    }
    if (state.booklet) {
      if (id === 'organize') {
        state.bookletOrganize = !state.bookletOrganize;
        ui();
        return;
      }
      if (id === 'prev') state.bookletIdx = Math.max(0, state.bookletIdx - 1);
      if (id === 'next') state.bookletIdx = Math.min(state.ledger.length - 1, state.bookletIdx + 1);
      if (id === 'delEntry') {
        if (!state.ledger.length) return;
        const i = Math.max(0, Math.min(state.bookletIdx, state.ledger.length - 1));
        const gone = state.ledger[i];
        state.ledger.splice(i, 1);
        if (gone && gone.photo) {
          try { images.delete(gone.photo); } catch (_) { /* ignore */ }
        }
        state.bookletIdx = Math.min(i, Math.max(0, state.ledger.length - 1));
        persist();
        ui();
        return;
      }
      if (id === 'clearAll') {
        if (!state.ledger.length) return;
        const ok = typeof window !== 'undefined' && window.confirm
          ? window.confirm(zh() ? '清空全部记录？' : 'Clear all ledger entries?')
          : true;
        if (!ok) return;
        state.ledger.forEach((e) => {
          if (e && e.photo) {
            try { images.delete(e.photo); } catch (_) { /* ignore */ }
          }
        });
        state.ledger = [];
        state.bookletIdx = 0;
        persist();
        ui();
        return;
      }
      if (id === 'moveUp' || id === 'moveDown') {
        const i = state.bookletIdx;
        const j = id === 'moveUp' ? i - 1 : i + 1;
        if (j < 0 || j >= state.ledger.length) return;
        state.ledger.forEach((e, k) => {
          if (e && e.sortOrder == null) e.sortOrder = Number(e.at) || (Date.now() - k);
        });
        const a = state.ledger[i];
        const b = state.ledger[j];
        const tmp = a.sortOrder;
        a.sortOrder = b.sortOrder;
        b.sortOrder = tmp;
        if (a.sortOrder === b.sortOrder) a.sortOrder = (Number(b.sortOrder) || 0) + (id === 'moveUp' ? 1 : -1);
        state.ledger.sort((x, y) => (Number(y.sortOrder) || 0) - (Number(x.sortOrder) || 0));
        state.bookletIdx = state.ledger.findIndex((e) => e === a);
        if (state.bookletIdx < 0) state.bookletIdx = Math.min(i, state.ledger.length - 1);
        persist();
        ui();
        return;
      }
      return;
    }
    if (id === 'daze' || id === 'focus') {
      state.draftMode = id;
      if (id === 'daze') {
        state.dur = 'open';
        state.draftStep = 'duration';
      } else {
        if (state.dur === 'open') state.dur = state.task === 'work' ? '50' : '25';
        state.draftStep = 'animal';
      }
      ui();
      return;
    }
    if (id === 'backStep') {
      stepWizardBack();
      return;
    }
    if (id === 'nextStep') {
      const step = state.draftStep || 'mode';
      if (step === 'animal') state.draftStep = 'task';
      else if (step === 'task') state.draftStep = 'duration';
      ui();
      return;
    }
    if (id === 'study' || id === 'work') {
      state.task = id;
      ui();
      return;
    }
    if (id === 'd25') state.dur = '25';
    else if (id === 'd50') state.dur = '50';
    else if (id === 'custom') state.dur = 'custom';
    else if (id === 'openDur') state.dur = 'open';
    else if (id === 'minus') state.customMin = Math.max(5, state.customMin - 5);
    else if (id === 'plus') state.customMin = Math.min(180, state.customMin + 5);
    else if (id === 'go') beginSession(now);
    else if (id === 'shutter') shutter(now);
    else if (id === 'leave') closeToRoom();
    else if (id === 'end') endSession(now);
    else if (id === 'cardPrev') stepCard(-1);
    else if (id === 'cardNext') stepCard(1);
    if (id !== 'cardPrev' && id !== 'cardNext') ui();
  }

  function pointerDown(x, y, now) {
    if (!isOpen()) return false;
    if (state.phase === 'entering') {
      state.skipEnter = true;
      state.phase = 'room';
      return true;
    }
    const id = hitAt(x, y);
    state.hover = id;
    if (id) activate(id, x, y, now);
    return true;
  }
  function pointerMove(x, y) {
    if (!isOpen()) {
      state.hover = null;
      return;
    }
    state.hover = hitAt(x, y);
  }
  function pointerUp() {
    state.drag = null;
  }

  load();
  window.addEventListener('pagehide', () => {
    if (state.session && state.session.running) {
      state.session.elapsedMs = elapsedMs(performance.now());
      state.session.running = false;
      state.session.segmentStart = null;
      persist();
    }
  });

  return {
    isOpen,
    hasSession,
    getEntrySource,
    getAudioSceneId,
    open,
    leave: closeToRoom,
    wizardBack: stepWizardBack,
    draw,
    drawDoor,
    hitDoor,
    doorHover: () => state.hover === 'door',
    pointerDown,
    pointerMove,
    pointerUp,
  };
};
