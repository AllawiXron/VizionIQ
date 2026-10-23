// EasingEngine: the only speed graphs the reel may use. Each one is registered with GSAP under its name and carries the
// cubic Bézier the After Effects exporter turns into keyframe speed and influence. A polynomial up to the cube (back,
// and GSAP's power1 = quad and power2 = cubic) is a Bézier with its handles at 1/3 and 2/3 of the time, so those are
// exact; expo.out gets the usual Bézier fit; the elastic has no Bézier and is baked into keys by the exporter.
(function (Core) {
  gsap.registerPlugin(CustomEase);
  const E = {
    whipPan: { bez: [0.87, 0, 0.13, 1] }, // camera whips and pushes: long ease out of the hold, long ease into the next
    snapPop: { gsap: "back.out(2.2)", bez: [1 / 3, 5.2 / 3, 2 / 3, 1] }, // overshoot on every slam and pill
    snapElastic: { gsap: "elastic.out(1, 0.5)", bez: null }, // the Smart Bounce wobble on the big hits
    kineticSlam: { gsap: "expo.out", bez: [0.16, 1, 0.3, 1] }, // words out of their masks, bars, wipes
    liftOff: { bez: [0.7, 0, 0.84, 0] }, // exits: they gather speed and leave
    settle: { bez: [0.33, 0, 0, 1] }, // the camera's drift on a hold, the light following it
    gravity: { gsap: "power1.in", bez: [1 / 3, 0, 2 / 3, 1 / 3] }, // drops
    rise: { gsap: "power1.out", bez: [1 / 3, 2 / 3, 2 / 3, 1] }, // the way up of a bounce
    kickIn: { gsap: "power2.in", bez: [1 / 3, 0, 2 / 3, 0] }, // the tilt and pull-out building into the middle of a whip
    kickOut: { gsap: "power2.out", bez: [1 / 3, 1, 2 / 3, 1] },
    glide: { bez: [0.3, 0.12, 0.7, 0.88] }, // crowds walking through
    swing: { gsap: "sine.inOut", bez: [0.37, 0, 0.63, 1] }, // one half of a shake or of the sine micro-motion
  };
  for (const [name, e] of Object.entries(E)) {
    if (e.gsap) gsap.registerEase(name, gsap.parseEase(e.gsap));
    else CustomEase.create(name, `M0,0 C${e.bez.join(",")} 1,1`);
  }
  Core.Ease = {
    names: Object.keys(E),
    bez: (name) => (E[name] ? E[name].bez : undefined),
    fn: (name) => gsap.parseEase(name),
  };
})(window.Core = window.Core || {});
