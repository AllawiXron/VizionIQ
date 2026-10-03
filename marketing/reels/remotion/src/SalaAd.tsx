import React from 'react';
import {Img, staticFile} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {clamp, prog, sp} from './anim';

// The Sala ad (../../sala-ad/ad.html) rebuilt live, 1080x1350, so every part can move on its own.
// `b` is build time in frames: each layer enters at its own moment (S.*). b >= B_END is the finished ad.
export const S = {bg: 14, food: 59, card: 104, click: 130, txt: 149, stamp: 180, arrow: 189, logo: 234};
export const B_END = 262;

const RED = '#e10b17';
const WORDS = ['لا', 'تخلي', 'البيض', 'كله', 'بسلة', 'وحدة'];
const ARROW = 'M622 492 C 520 506, 330 508, 214 488 C 160 478, 150 520, 176 560 C 196 592, 220 610, 250 624';
const HEAD = 'M216 622 L 252 626 L 250 590';
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.9 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")`;

export const SalaAd: React.FC<{b: number}> = ({b}) => {
  // L1: Sala's red floods out from the centre, then their doodles settle in
  const flood = sp(b, S.bg, {damping: 22, stiffness: 70});
  const doodle = prog(b, S.bg + 8, S.bg + 30);
  // L2: the basket drops in and bounces once
  const drop = sp(b, S.food, {damping: 9, stiffness: 115, mass: 1.05});
  const landed = clamp(drop * 1.4);
  // L3: the app card slides in; the cursor taps its button later
  const card = sp(b, S.card, {damping: 15, stiffness: 150});
  const tapped = b >= S.click;
  const tap = sp(b, S.click, {damping: 9, stiffness: 260});
  // L4: grandma's line types in word by word, the answer stamps down, the arrow draws itself
  const lead = prog(b, S.txt, S.txt + 8);
  const stamp = sp(b, S.stamp, {damping: 11, stiffness: 170});
  const arrow = evolvePath(prog(b, S.arrow, S.arrow + 24, (t) => 1 - Math.pow(1 - t, 2.2)), ARROW);
  const head = evolvePath(prog(b, S.arrow + 22, S.arrow + 27), HEAD);
  // L5: footer and logo
  const foot = sp(b, S.logo, {damping: 15, stiffness: 140});
  const logo = sp(b, S.logo + 2, {damping: 10, stiffness: 190});
  const cta = sp(b, S.logo + 6, {damping: 10, stiffness: 190});

  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1350, overflow: 'hidden', fontFamily: 'Alexandria', color: '#fff', direction: 'rtl'}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `circle(${flood * 900}px at 540px 700px)`,
        background: 'radial-gradient(70% 55% at 50% 60%, #f0222c 0%, #e10b17 45%, #b9000d 100%)'}}>
        <Img src={staticFile('img/doodles.png')} style={{position: 'absolute', left: -310, top: 392, width: 1700, opacity: 0.2 * doodle, transform: `scale(${1.04 - 0.04 * doodle})`}} />
        <div style={{position: 'absolute', left: 90, top: 430, width: 900, height: 900, borderRadius: '50%', opacity: landed,
          background: 'radial-gradient(closest-side, rgba(255, 120, 110, 0.38), rgba(255, 120, 110, 0))'}} />
      </div>

      <div style={{position: 'absolute', left: 255, top: 1148, width: 620, height: 70, borderRadius: '50%', filter: 'blur(4px)', opacity: landed,
        transform: `scaleX(${0.6 + 0.4 * landed})`, background: 'radial-gradient(closest-side, rgba(70, 0, 4, 0.55), rgba(70, 0, 4, 0))'}} />
      {b >= S.food && (
        <Img src={staticFile('img/basket.png')} style={{position: 'absolute', left: 200, top: 556, width: 680,
          transform: `translateY(${(1 - drop) * -820}px) rotate(${-7 + (1 - drop) * 14}deg)`,
          filter: 'saturate(1.06) sepia(0.06) drop-shadow(0 26px 22px rgba(80, 0, 4, 0.5)) drop-shadow(0 4px 6px rgba(50, 0, 2, 0.4))'}} />
      )}

      {/* headline */}
      <div style={{position: 'absolute', top: 58, left: 0, right: 0, textAlign: 'center', fontWeight: 700, fontSize: 50, lineHeight: 1.35, color: 'rgba(255,255,255,0.9)'}}>
        <div style={{fontWeight: 600, fontSize: 24, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.75)', marginBottom: 4, opacity: lead, transform: `translateY(${(1 - lead) * 10}px)`}}>بيبيتك تگول:</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: '0.27em', whiteSpace: 'nowrap'}}>
          {WORDS.map((w, i) => {
            const s = sp(b, S.txt + 3 + i * 3, {damping: 13, stiffness: 180});
            return <span key={w} style={{display: 'inline-block', opacity: clamp(s * 1.6), transform: `translateY(${(1 - s) * 34}px) scale(${0.85 + 0.15 * s})`}}>{w}</span>;
          })}
        </div>
      </div>
      <div style={{position: 'absolute', top: 182, left: 0, right: 0, textAlign: 'center', fontWeight: 900, fontSize: 196, lineHeight: 1.25, whiteSpace: 'nowrap',
        letterSpacing: '-0.01em', textShadow: '0 16px 40px rgba(110, 0, 6, 0.4)', opacity: clamp(stamp * 3), transform: `scale(${2.3 - 1.3 * stamp})`}}>إلا هاي.</div>
      <svg viewBox="0 0 1080 1350" style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1350}} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        {b >= S.arrow && <path d={ARROW} strokeDasharray={arrow.strokeDasharray} strokeDashoffset={arrow.strokeDashoffset} />}
        {b >= S.arrow + 22 && <path d={HEAD} strokeDasharray={head.strokeDasharray} strokeDashoffset={head.strokeDashoffset} />}
      </svg>

      {/* the app card, in their own UI language */}
      {b >= S.card && (
        <div style={{position: 'absolute', left: 452, top: 616, opacity: clamp(card * 2), transform: `translateX(${(1 - card) * 560}px) rotate(${(1 - card) * 6}deg)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', color: '#1d1d1f', borderRadius: 22, padding: '14px 16px 14px 22px',
            boxShadow: '0 20px 44px rgba(80, 0, 4, 0.45)', whiteSpace: 'nowrap'}}>
            <Img src={staticFile('img/thumb-eggs.jpg')} style={{width: 62, height: 62, borderRadius: 14, objectFit: 'cover', flex: 'none'}} />
            <div>
              <b style={{display: 'block', fontWeight: 800, fontSize: 25, lineHeight: 1.3}}>طبقة بيض، ٣٠ حبة</b>
              <span style={{display: 'block', fontWeight: 500, fontSize: 16, color: '#6b6b70', lineHeight: 1.4}}>توصيل للرمادي والفلوجة</span>
            </div>
            <div style={{flex: 'none', borderRadius: 12, padding: '10px 14px', fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8,
              background: tapped ? RED : '#fff', color: tapped ? '#fff' : RED, boxShadow: `inset 0 0 0 2px ${RED}`,
              transform: `scale(${tapped ? 0.9 + 0.1 * tap : 1})`}}>
              {tapped && <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{transform: `scale(${tap})`}}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
              {tapped ? 'أضيفت للسلة' : 'إضافة إلى السلة'}
            </div>
          </div>
          <i style={{position: 'absolute', left: 250, bottom: -12, width: 26, height: 26, background: '#fff', transform: 'rotate(45deg)', borderRadius: 4}} />
        </div>
      )}

      {/* footer */}
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity: clamp(foot * 2), transform: `translateY(${(1 - foot) * 70}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <Img src={staticFile('img/logo-white.png')} style={{height: 58, display: 'block', transform: `scale(${logo})`}} />
          <span style={{fontWeight: 600, fontSize: 20, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', paddingRight: 22, borderRight: '2px solid rgba(255,255,255,0.4)'}}>تسوّق بذكاء من بيتك</span>
        </div>
        <div style={{background: '#fff', color: RED, fontWeight: 800, fontSize: 22, padding: '14px 26px', borderRadius: 16, transform: `scale(${cta})`}}>حمّل التطبيق</div>
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: 0.22 * flood, mixBlendMode: 'overlay', backgroundImage: GRAIN, pointerEvents: 'none'}} />
    </div>
  );
};
