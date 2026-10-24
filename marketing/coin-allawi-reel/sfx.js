// The sound design of the Orange Coin, on six tracks: Whoosh 1 (a deep air whoosh at 82.76%, for the heavy camera
// moves), Whoosh 3 (a snappy one at 118.92%, for fast pops), FireWhoosh (warm, low-passed, for the full-screen colour
// changes), Counting 8 (soft mechanical ticks on text), Deep (a 120 to 50 Hz thud when a hero element lands) and UI Pop
// (marimba plucks, cascades 60 ms apart, and the tactile clicks, slaps and latches).
//
// Every sound is made here with Web Audio: pink or brown noise through moving band-pass and low-pass filters for the
// whooshes, sine and triangle pitch drops for the thuds and pops. A track can take a recorded .wav instead
// (engine.load). Each cue is rendered on its own, its peak set 12 to 16 dB under the voice, and the cues are summed
// into one bus that plays from the same clock as the voice. The noise is seeded, so every render is identical.
(function (root) {
  const VOICE_PEAK = -1.5; // dBFS of the voice-over's loudest word
  const UNDER = { "Whoosh 1": 14, "Whoosh 3": 15, FireWhoosh: 13, "Counting 8": 16, Deep: 12, "UI Pop": 15 };
  const TRACKS = Object.keys(UNDER);

  // which track each kind of sound sits on
  const KIND = {
    whoosh1: "Whoosh 1", whoosh3: "Whoosh 3", swipe: "Whoosh 3", fire: "FireWhoosh", count: "Counting 8", deep: "Deep",
    pop: "UI Pop", stagger: "UI Pop", click: "UI Pop", slap: "UI Pop", lens: "UI Pop", chime: "UI Pop", latch: "UI Pop", padlock: "UI Pop", phone: "UI Pop",
  };

  // [time, kind, options]: each on the frame where its move starts or lands in reel.html
  const CUES = [
    // A · the wallet and the stamp
    [0.02, "count", { n: 8, gap: 0.045 }],
    [0.13, "whoosh1", { len: 0.9, pan: [0.25, -0.05], under: 2 }],
    [2.1, "deep"], [2.1, "slap"],
    // B · the orange opens, «موشن جرافيك», the box, the megaphone, the shop owner
    [2.74, "fire"],
    [3.45, "swipe"], [3.5, "count", { n: 8, gap: 0.034 }],
    [4.17, "whoosh3", { pan: [-0.5, 0.2] }],
    [5.17, "whoosh1", { len: 0.62, pan: [-0.5, 0.1] }], [5.38, "pop", { f: 470 }],
    [6.6, "deep", { len: 0.7, under: 2 }],
    // F · the camera over the page
    [7.76, "whoosh3"], [8.02, "lens"],
    [8.2, "whoosh1", { len: 0.75, under: 3 }],
    [9.05, "whoosh1", { len: 0.55, pan: [0.5, -0.5], under: 2 }],
    [9.22, "chime"], [9.24, "deep", { len: 0.6, under: 3 }],
    [10.6, "whoosh1", { len: 0.8, under: 3 }],
    [10.8, "count", { n: 8, gap: 0.04 }], [11.08, "latch"],
    // I · the stopwatch and the 3, the magnifier
    [12.97, "count", { n: 8, gap: 0.15, watch: true }],
    [14.58, "whoosh3", { pan: [0.6, 0.2], under: 3 }], [15.38, "whoosh3", { len: 1.4, pan: [0.3, -0.4] }],
    // J2 · the diagonal sweep and the handshake
    [16.22, "fire"], [16.72, "deep"],
    // L · the pawns pop in 60 ms apart around the king, then slide away
    [19.3, "stagger", { n: 4, gap: 0.06, f: 560, pans: [-0.4, 0.2, -0.2, 0.4] }],
    [21.72, "whoosh1", { len: 0.8, under: 2 }],
    // M · the dark stage: one bag, two, then ten in an arc
    [23.26, "fire", { deep: true }],
    [24.99, "pop", { f: 600 }],
    [25.37, "pop", { f: 600 }], [25.44, "pop", { f: 712 }],
    [25.93, "fire"], [25.97, "deep"], [25.99, "stagger", { n: 4, gap: 0.06, f: 600 }],
    // M2 · the page comes back, the man with the binoculars
    [26.42, "fire", { under: 3 }], [26.63, "whoosh3"],
    // O · the crowd, the stop hand, the padlock
    [28.55, "whoosh1", { len: 3.8, pan: [0.7, -0.7], under: 3, slow: true }],
    [32.6, "deep"], [32.6, "slap", { hard: true }],
    [34.37, "padlock"],
    // R · the orange opens from the padlock, the receiver, the three phones, the end card
    [35.21, "fire"], [35.5, "phone"],
    [36.86, "stagger", { n: 1, f: 600 }], [36.96, "stagger", { n: 1, f: 672 }], [37.06, "stagger", { n: 1, f: 756 }],
    [39.38, "whoosh3", { len: 1.6 }], [39.82, "click"],
  ].map(([t, kind, o = {}], i) => ({ id: i + 1, t, kind, o, track: KIND[kind], name: KIND[kind] }));

  // ───── noise ─────
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function noiseBuffers(ctx) {
    const n = ctx.sampleRate * 4, R = rng(1729);
    const pink = ctx.createBuffer(1, n, ctx.sampleRate), brown = ctx.createBuffer(1, n, ctx.sampleRate);
    const p = pink.getChannelData(0), b = brown.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = R() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      p[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
      last = (last + 0.02 * w) / 1.02;
      b[i] = last * 3.5;
    }
    return { pink, brown };
  }

  // ───── building blocks ─────
  // a smooth swell: rises as p^a to the peak, falls as (1-p)^b
  function swell(param, t, dur, peak, top, a = 2.2, b = 1.7) {
    const N = 256, c = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const p = i / (N - 1);
      c[i] = top * (p < peak ? Math.pow(p / peak, a) : Math.pow(1 - (p - peak) / (1 - peak), b));
    }
    c[0] = 0; c[N - 1] = 0;
    param.setValueCurveAtTime(c, t, dur);
  }
  // a hit: a few ms up, an exponential tail
  function hit(param, t, top, decay, attack = 0.003) {
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(top, t + attack);
    param.setTargetAtTime(0, t + attack, decay / 4.6);
  }
  function noise(E, t, dur, which = "pink", rate = 1) {
    const s = E.ctx.createBufferSource();
    s.buffer = E.noise[which];
    s.loop = true;
    s.playbackRate.value = rate;
    s.start(t, E.rand() * 3);
    s.stop(t + dur + 0.05);
    return s;
  }
  function filt(E, type, f, q = 0.7) {
    const b = E.ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    return b;
  }
  function amp(E, v = 0) {
    const g = E.ctx.createGain();
    g.gain.value = v;
    return g;
  }
  function chain(...n) {
    for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]);
    return n[n.length - 1];
  }
  function panner(E, t, dur, pan) {
    const p = E.ctx.createStereoPanner();
    p.pan.setValueAtTime(pan[0], t);
    p.pan.linearRampToValueAtTime(pan[1], t + dur);
    return p;
  }
  function tone(E, type, t, f0, f1, drop, dur) {
    const o = E.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + drop);
    o.start(t);
    o.stop(t + dur);
    return o;
  }
  const warm = (E, k = 1.6) => {
    const w = E.ctx.createWaveShaper(), N = 1024, c = new Float32Array(N);
    for (let i = 0; i < N; i++) { const x = (i / (N - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
    w.curve = c;
    return w;
  };

  // ───── the sounds ─────
  // a whoosh: noise through a band-pass that sweeps up to the peak and back down, at a pitch (rate)
  function airWhoosh(E, out, t, { rate, len, peak, f, q, mix, pan = [-0.2, 0.2], body = 0 }) {
    const d = len / rate, fp = f.map((x) => x * rate);
    const g = amp(E);
    swell(g.gain, t, d, peak, 1);
    for (const [which, lvl, qq] of mix) {
      const bp = filt(E, "bandpass", fp[0], qq || q);
      bp.frequency.setValueAtTime(fp[0], t);
      bp.frequency.exponentialRampToValueAtTime(fp[1], t + d * peak);
      bp.frequency.exponentialRampToValueAtTime(fp[2], t + d);
      chain(noise(E, t, d, which, rate), bp, amp(E, lvl), g);
    }
    if (body) {
      const lp = filt(E, "lowpass", 140 * rate, 0.9);
      chain(noise(E, t, d, "brown", rate), lp, amp(E, body), g);
    }
    chain(g, filt(E, "lowpass", 7000, 0.5), panner(E, t, d, pan), out);
  }
  const SOUNDS = {
    whoosh1: (E, out, t, o) => airWhoosh(E, out, t, {
      rate: 0.8276, len: o.len || 0.7, peak: o.slow ? 0.45 : 0.55, f: o.slow ? [160, 620, 220] : [220, 1150, 360], q: 1.3,
      mix: [["brown", 1.6, 1.1], ["pink", 0.7, 1.6]], pan: o.pan, body: 0.8,
    }),
    whoosh3: (E, out, t, o) => airWhoosh(E, out, t, {
      rate: 1.1892, len: o.len ? 0.32 * o.len : 0.32, peak: 0.58, f: [700, 3300, 1500], q: 1.7,
      mix: [["pink", 1.4, 1.7], ["pink", 0.5, 3.5]], pan: o.pan || [0.3, -0.3],
    }),
    swipe: (E, out, t) => airWhoosh(E, out, t, { rate: 1.1892, len: 0.2, peak: 0.35, f: [1800, 6200, 3000], q: 2.2, mix: [["pink", 1.2]], pan: [0.4, -0.4] }),
    // warm and textured: pink and brown noise under a low-pass that opens and closes, a little crackle, a low body
    fire: (E, out, t, o) => {
      const d = o.deep ? 1.15 : 0.95, top = o.deep ? 1500 : 2600;
      const g = amp(E);
      swell(g.gain, t, d, 0.42, 1, 1.8, 1.5);
      const lp = filt(E, "lowpass", 260, 1.1);
      lp.frequency.setValueAtTime(260, t);
      lp.frequency.exponentialRampToValueAtTime(top, t + d * 0.42);
      lp.frequency.exponentialRampToValueAtTime(420, t + d);
      const bp = filt(E, "bandpass", 500, 0.6);
      bp.frequency.setValueAtTime(380, t);
      bp.frequency.exponentialRampToValueAtTime(top * 0.6, t + d * 0.42);
      bp.frequency.exponentialRampToValueAtTime(500, t + d);
      chain(noise(E, t, d, "pink"), bp, amp(E, 1.3), lp);
      chain(noise(E, t, d, "brown"), amp(E, 1.4), lp);
      chain(lp, g);
      // crackle: sparse little grains of noise, like a flame catching
      const R = E.rand, n = Math.round(d * 38);
      for (let i = 0; i < n; i++) {
        const tt = t + d * (0.15 + 0.7 * R()), cg = amp(E);
        hit(cg.gain, tt, 0.25 + 0.5 * R(), 0.012);
        chain(noise(E, tt, 0.04, "pink"), filt(E, "bandpass", 1400 + 1800 * R(), 1.2), cg, g);
      }
      const sub = filt(E, "lowpass", o.deep ? 110 : 150, 0.8);
      chain(noise(E, t, d, "brown"), sub, amp(E, o.deep ? 2.2 : 1.4), g);
      chain(g, warm(E, 1.3), panner(E, t, d, [-0.15, 0.15]), out);
    },
    // soft mechanical ticks, tick and tock a touch apart in pitch, each a little off the grid like a real mechanism
    count: (E, out, t, o) => {
      const n = o.n || 8, gap = o.gap || 0.045, R = E.rand;
      for (let i = 0; i < n; i++) {
        const tt = t + i * gap + (R() - 0.5) * 0.004, v = 0.8 + 0.2 * R(), hi = i % 2 ? 0.9 : 1;
        const g = amp(E);
        hit(g.gain, tt, v, o.watch ? 0.03 : 0.018, 0.0015);
        chain(noise(E, tt, 0.05, "pink"), filt(E, "bandpass", (o.watch ? 4200 : 3200) * hi, 4), g);
        const s = amp(E);
        hit(s.gain, tt, 0.35 * v, 0.012, 0.001);
        chain(tone(E, "triangle", tt, 2300 * hi, 1700 * hi, 0.01, 0.05), s, g);
        chain(g, filt(E, "highpass", 900), out);
      }
    },
    // the weight: a sine dropping from 120 to 50 Hz, a triangle an octave up so phones hear it, a soft knock on top
    deep: (E, out, t, o) => {
      const d = o.len || 0.9, g = amp(E);
      hit(g.gain, t, 1, d, 0.004);
      chain(tone(E, "sine", t, 120, 50, 0.16, d + 0.1), g);
      const h = amp(E);
      hit(h.gain, t, 0.45, d * 0.45, 0.004);
      chain(tone(E, "triangle", t, 240, 100, 0.14, d), h, g);
      const k = amp(E);
      hit(k.gain, t, 0.5, 0.03, 0.001);
      chain(noise(E, t, 0.06, "brown"), filt(E, "lowpass", 900, 0.8), k, g);
      chain(g, warm(E, 2.2), filt(E, "lowpass", 2400, 0.6), out);
    },
    // a marimba pluck: a sine that drops onto its note, a bright partial that dies fast
    pop: (E, out, t, o) => {
      const f = o.f || 640, g = amp(E);
      hit(g.gain, t, 1, 0.16, 0.002);
      chain(tone(E, "sine", t, f * 1.45, f, 0.03, 0.25), g);
      const tr = amp(E);
      hit(tr.gain, t, 0.3, 0.07, 0.002);
      chain(tone(E, "triangle", t, f * 2.1, f * 2, 0.02, 0.15), tr, g);
      const hp = amp(E);
      hit(hp.gain, t, 0.22, 0.025, 0.001);
      chain(tone(E, "sine", t, f * 4, f * 3.93, 0.01, 0.06), hp, g);
      chain(g, panner(E, t, 0.2, [o.pan || 0, o.pan || 0]), out);
    },
    // several pops 60 ms apart, each a step higher (0, 2, 4, 5 semitones)
    stagger: (E, out, t, o) => {
      const steps = [0, 2, 4, 5], n = o.n || 4, gap = o.gap || 0.06;
      for (let i = 0; i < n; i++) SOUNDS.pop(E, out, t + i * gap, { f: (o.f || 600) * Math.pow(2, steps[i % 4] / 12), pan: o.pans ? o.pans[i] : n > 1 ? -0.35 + (0.7 * i) / (n - 1) : 0 });
    },
    // a crisp cursor click: two tiny transients
    click: (E, out, t) => {
      for (const [dt, f, v] of [[0, 4600, 1], [0.0016, 3100, 0.6]]) {
        const g = amp(E);
        hit(g.gain, t + dt, v, 0.012, 0.0005);
        chain(noise(E, t + dt, 0.03, "pink"), filt(E, "highpass", 2600, 0.7), g, out);
        const s = amp(E);
        hit(s.gain, t + dt, 0.4 * v, 0.008, 0.0005);
        chain(tone(E, "sine", t + dt, f, f * 0.9, 0.005, 0.03), s, out);
      }
    },
    // a hand slapping down: a band of noise and a short low knock
    slap: (E, out, t, o) => {
      const g = amp(E);
      hit(g.gain, t, 1, o.hard ? 0.09 : 0.07, 0.001);
      chain(noise(E, t, 0.15, "pink"), filt(E, "bandpass", o.hard ? 1100 : 1500, 0.8), filt(E, "highpass", 380), g, out);
      const k = amp(E);
      hit(k.gain, t, 0.7, 0.05, 0.002);
      chain(tone(E, "sine", t, 210, 120, 0.04, 0.1), k, out);
    },
    // a lens ring clicking into focus: two detents
    lens: (E, out, t) => { SOUNDS.click(E, out, t); SOUNDS.click(E, out, t + 0.045); SOUNDS.pop(E, out, t + 0.045, { f: 1900 }); },
    // glass and filament: a few inharmonic partials ringing out under a low-pass
    chime: (E, out, t) => {
      const g = amp(E, 1), lp = filt(E, "lowpass", 5200, 0.5);
      for (const [f, v, d] of [[1318, 0.6, 1.3], [1979, 0.35, 0.9], [2663, 0.25, 0.6], [3511, 0.15, 0.35], [659, 0.25, 1.0]]) {
        const a = amp(E);
        hit(a.gain, t, v, d, 0.004);
        chain(tone(E, "sine", t, f, f, 0.01, d + 0.2), a, g);
      }
      chain(g, lp, out);
    },
    // the till: a metal latch, then a small bell
    latch: (E, out, t) => {
      SOUNDS.click(E, out, t);
      for (const [f, v, d] of [[2350, 0.45, 0.08], [3170, 0.35, 0.07], [4890, 0.2, 0.05]]) {
        const a = amp(E);
        hit(a.gain, t, v, d, 0.001);
        chain(tone(E, "sine", t, f, f, 0.01, d + 0.05), a, out);
      }
      for (const [f, v, d] of [[2093, 0.35, 0.8], [4186, 0.12, 0.4], [3140, 0.08, 0.3]]) {
        const a = amp(E);
        hit(a.gain, t + 0.07, v, d, 0.002);
        chain(tone(E, "sine", t + 0.07, f, f, 0.01, d + 0.1), a, out);
      }
    },
    // a heavy padlock: the shackle going in, then the latch, metal ringing under both
    padlock: (E, out, t) => {
      [[0, 0.8], [0.055, 1]].forEach(([dt, v]) => {
        const tt = t + dt, g = amp(E);
        hit(g.gain, tt, v, 0.03, 0.0008);
        chain(noise(E, tt, 0.06, "pink"), filt(E, "bandpass", 2600, 3), g, out);
        for (const [f, a, d] of [[1850, 0.35, 0.09], [2780, 0.25, 0.07], [4100, 0.15, 0.05]]) {
          const m = amp(E);
          hit(m.gain, tt, a * v, d, 0.001);
          chain(tone(E, "sine", tt, f, f, 0.01, d + 0.05), m, out);
        }
        const k = amp(E);
        hit(k.gain, tt, 0.6 * v, 0.05, 0.002);
        chain(tone(E, "sine", tt, 240, 150, 0.04, 0.1), k, out);
      });
    },
    // an old handset lifted off its cradle: two plastic clacks
    phone: (E, out, t) => {
      [[0, 1, 950], [0.085, 0.6, 1250]].forEach(([dt, v, f]) => {
        const tt = t + dt, g = amp(E);
        hit(g.gain, tt, v, 0.035, 0.001);
        chain(noise(E, tt, 0.08, "pink"), filt(E, "bandpass", f, 1.5), g, out);
        const k = amp(E);
        hit(k.gain, tt, 0.4 * v, 0.04, 0.002);
        chain(tone(E, "sine", tt, 170, 130, 0.03, 0.08), k, out);
      });
    },
  };

  // ───── the engine ─────
  class StudioSoundEngine {
    constructor(ctx, seed = 7) {
      this.ctx = ctx;
      this.rand = rng(seed);
      this.noise = noiseBuffers(ctx);
      this.samples = {};
    }
    // optional: a recorded .wav for a track or a kind, e.g. { "Deep": "../sfx-pack/…/hit.wav" }
    async load(map, ctx = this.ctx) {
      for (const [key, url] of Object.entries(map)) {
        const data = await (await fetch(url)).arrayBuffer();
        this.samples[key] = await ctx.decodeAudioData(data);
      }
    }
    // draw one cue into a node, starting at time t of this engine's context
    voice(cue, out, t) {
      const s = this.samples[cue.kind] || this.samples[cue.track];
      if (s) {
        const b = this.ctx.createBufferSource();
        b.buffer = s;
        b.connect(out);
        b.start(t);
        return;
      }
      SOUNDS[cue.kind](this, out, t, cue.o);
    }
    // each cue rendered alone, its peak set under the voice, trimmed to where it falls silent
    static async bake(cues = CUES, sr = 48000, samples = {}) {
      const made = [];
      for (const cue of cues) {
        const len = Math.ceil(sr * ((cue.o.len || 1) + 2.2));
        const off = new OfflineAudioContext(2, len, sr);
        const E = new StudioSoundEngine(off, 7 + cue.id);
        for (const [k, buf] of Object.entries(samples)) E.samples[k] = buf;
        E.voice(cue, off.destination, 0.005);
        const buf = await off.startRendering();
        const L = buf.getChannelData(0), Rt = buf.getChannelData(1);
        let peak = 0, end = 0;
        for (let i = 0; i < L.length; i++) {
          const a = Math.max(Math.abs(L[i]), Math.abs(Rt[i]));
          if (a > peak) peak = a;
        }
        const floor = peak * 0.0003;
        for (let i = L.length - 1; i >= 0; i--) if (Math.abs(L[i]) > floor || Math.abs(Rt[i]) > floor) { end = i + 1; break; }
        const under = UNDER[cue.track] + (cue.o.under || 0);
        const gain = Math.pow(10, (VOICE_PEAK - under) / 20) / (peak || 1);
        const n = Math.min(L.length, end + Math.round(sr * 0.02));
        const l = new Float32Array(n), r = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const fade = i > n - sr * 0.02 ? (n - i) / (sr * 0.02) : 1;
          l[i] = L[i] * gain * fade; r[i] = Rt[i] * gain * fade;
        }
        made.push({ ...cue, start: cue.t - 0.005, dur: n / sr, l, r, peakDb: VOICE_PEAK - under });
      }
      return made;
    }
    // all the cues on one stereo bus, as long as the reel. Where cues stack (a thud, a slap and a whoosh on one hit) a
    // look-ahead limiter holds the bus 12 dB under the voice; a cue on its own passes untouched
    static mix(made, D, sr = 48000) {
      const N = Math.ceil(D * sr), l = new Float32Array(N), r = new Float32Array(N);
      for (const m of made) {
        const at = Math.round(m.start * sr);
        for (let i = 0; i < m.l.length && at + i < N; i++) if (at + i >= 0) { l[at + i] += m.l[i]; r[at + i] += m.r[i]; }
      }
      const ceil = Math.pow(10, (VOICE_PEAK - 12) / 20), look = Math.round(sr * 0.006), rel = 1 - Math.exp(-1 / (sr * 0.18));
      const g = new Float32Array(N);
      for (let i = 0; i < N; i++) { const a = Math.max(Math.abs(l[i]), Math.abs(r[i])); g[i] = a > ceil ? ceil / a : 1; }
      // the lowest gain needed anywhere in the next few ms, eased into, then let go slowly
      for (let i = N - 2; i >= 0; i--) g[i] = Math.min(g[i], g[i + 1] + 1 / look);
      let cur = 1;
      for (let i = 0; i < N; i++) {
        cur = g[i] < cur ? g[i] : cur + (1 - cur) * rel;
        l[i] *= cur; r[i] *= cur;
      }
      return { l, r, sr };
    }
  }

  root.StudioSoundEngine = StudioSoundEngine;
  root.SFX = { CUES, TRACKS, UNDER, KIND, VOICE_PEAK };
})(typeof module !== "undefined" ? module.exports : window);
