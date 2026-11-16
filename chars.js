// Pixel characters for "Tomorrow's News": drawn pixel by pixel (3/4 view facing right), one frame per pose, packed in an atlas.
// Poses are data: every frame is a parameter object; a new pose is a new table entry.
import * as THREE from 'three';
import { PX, ramp, hex, texOf, billboard, blob } from './px.js';

export const SPX = 1 / 30;            // character pixel → metres (50 px ≈ 1.67 m)
export const FW = 56, FH = 50;        // frame (wide enough for a lying figure)
const CX = 28;                        // body centre column of a standing figure
const D = .22;                        // sprite dither band
const R = cols => ramp(cols, D);
const INK = hex('#1c1214');

export const PAL = {
  skinHero: R(['#6e4432', '#9a6448', '#c08462', '#deaa86']),
  skinOld: R(['#7c5848', '#a87a64', '#c99c82', '#e2bfa6']),
  skinOlive: R(['#6e4630', '#9a6644', '#bf885e', '#dcab80']),
  skinDeep: R(['#3a2218', '#5a3626', '#7a4c36', '#96644a']),
  skinPale: R(['#8a6656', '#b88e78', '#dab298', '#f0d0b6']),
  jacket: R(['#5a1c04', '#a83a08', '#e8600e', '#ff8e2a', '#ffc070']),
  trousers: R(['#101218', '#1c2028', '#2a303a']),
  shoe: R(['#5e6068', '#a8aab0', '#e2e2e6']),
  shoeDark: R(['#141414', '#262626', '#3a3a3a']),
  hairDark: R(['#120c0a', '#281a14', '#40281c']),
  hairGrey: R(['#5e5a62', '#8e8a92', '#bdb9c1', '#e2dfe6']),
  hairBlack: R(['#0e0a0a', '#1e1614', '#33241c']),
  hairBrown: R(['#2a160c', '#4a2a16', '#6a4022']),
  hairRed: R(['#3a1408', '#6a2810', '#94401c']),
  cardigan: R(['#1a2a22', '#28402f', '#36583e', '#4a7050']),
  apron: R(['#6a665c', '#8e897c', '#b0aa9a', '#cec8b6']),
  skirt: R(['#1e1a22', '#2e2834', '#403848']),
  coatNavy: R(['#0e1424', '#1a2238', '#28344e', '#384664']),
  coatGrey: R(['#24262a', '#36393e', '#4a4e54', '#62666c']),
  coatCamel: R(['#4a3220', '#6e4c30', '#906842', '#ae8456']),
  coatMaroon: R(['#2a0e12', '#44181e', '#5e242a', '#783238']),
  coatOlive: R(['#22261a', '#343a26', '#485036', '#5e6848']),
  coatTeal: R(['#0e2424', '#183636', '#244a4a', '#346262']),
  coatPlum: R(['#22142a', '#34203e', '#483054', '#5e426c']),
  jeans: R(['#121a2c', '#203050', '#304a70']),
  bag: R(['#0e0e10', '#1c1c20', '#2c2c32']),
  phone: R(['#0a0a0c', '#1a1a20', '#2a2a30']),
  screen: R(['#5ab4e8', '#a8e2ff', '#e8f8ff']),
  bike: R(['#0a0a0c', '#24262a', '#4a4e54', '#7a7e86']),
  belt: R(['#1a100a', '#33200f', '#4f3218']),
};

// —— Body parts ——
function head(P, x, y, p, L) {
  P.ellipse(x, y, 4.4, 4.7, (X, Y, dx, dy) => L.skin(.62 - dx * .12 - dy * .28 + (dx > .55 ? -.18 : 0), X, Y));
  // hair
  if (L.hairStyle === 'bun') {
    P.ellipse(x - 1.2, y - 2.6, 4.4, 2.6, (X, Y, dx, dy) => L.hair(.6 - dy * .3, X, Y));
    P.ellipse(x - 4.2, y - 1.5, 2.2, 2.2, (X, Y, dx, dy) => L.hair(.55 - dy * .3, X, Y));
    for (let yy = Math.floor(y - 2); yy < y + 2; yy++) P.set(Math.floor(x - 4), yy, L.hair(.4, 0, 0));
  } else if (L.hairStyle === 'bald') {
    for (let yy = Math.floor(y - 1); yy < y + 3; yy++) P.set(Math.floor(x - 4), yy, L.hair(.4, 0, 0));
  } else {
    P.ellipse(x - .8, y - 2.8, 4.6, 2.4, (X, Y, dx, dy) => L.hair(.62 - dy * .3 + ((X * 7) % 3 === 0 ? .15 : 0), X, Y));
    for (let yy = Math.floor(y - 3); yy < y + 2; yy++) P.set(Math.floor(x - 4), yy, L.hair(.35, 0, 0));
    for (let yy = Math.floor(y - 2); yy < y + 1; yy++) P.set(Math.floor(x - 3), yy, L.hair(.45, 0, 0));
  }
  if (L.beard) P.poly([[x - 2, y + 1.5], [x + 4, y + 1], [x + 3.5, y + 4.6], [x - 1, y + 4.6]], (X, Y) => L.hair(.5 + ((X + Y) % 3 === 0 ? -.2 : 0), X, Y));
  if (L.hood === 'palla') {   // shawl drawn over the head
    P.poly([[x - 5.5, y - 2], [x - 1, y - 5.6], [x + 2.2, y - 5], [x + .8, y - 3.8], [x - 2.5, y - 2], [x - 3, y + 6], [x - 6, y + 7]], (X, Y) => L.palla(.55 - (X - x) * .05 + ((X + Y) % 4 === 0 ? -.15 : 0), X, Y));
  }
  const ex = Math.round(x + 2 + (p.look ?? 0)), ey = Math.round(y + (p.lookUp ? -1 : 0));
  if (p.closed || p.blink) { P.set(ex, ey, L.skin(.18, 0, 0)); P.set(ex - 3, ey, L.skin(.18, 0, 0)); if (p.closed) { P.set(ex + 1, ey, L.skin(.18, 0, 0)); } }
  else { P.set(ex, ey, INK); P.set(ex, ey - 1, INK); P.set(ex - 3, ey, INK); P.set(ex - 3, ey - 1, INK); }
  if (L.brow) { P.set(ex, ey - 2 + (p.brow ?? 0), L.hair(.2, 0, 0)); P.set(ex + 1, ey - 2, L.hair(.2, 0, 0)); }
  P.set(Math.round(x + 4.2), ey + 1, L.skin(.4, 0, 0));
  if (p.mouth) { P.set(ex - 1, ey + 3, INK); P.set(ex, ey + 3, INK); }
}
// Arm as a 2-px polyline from shoulder; hand at the end
function arm(P, pts, sleeve, skin, back = false, hand = 2) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let k = 0; k <= n; k++) { const x = Math.round(ax + (bx - ax) * k / n), y = Math.round(ay + (by - ay) * k / n); const s = back ? .25 : .62; P.set(x, y, sleeve(s, x, y)); P.set(x + 1, y, sleeve(s - .2, x, y)); }
  }
  const [hx, hy] = pts[pts.length - 1]; P.rect(hx, hy, hand, 2, skin(back ? .3 : .62, 0, 0));
}
const ARMS = {      // front-arm polylines relative to (CX, top) — top = shoulder row
  down: [[4, 1], [5, 5], [5, 9], [5, 11]],
  fwd: [[4, 1], [7, 3], [10, 4], [12, 4]],
  up: [[4, 0], [6, -3], [7, -7], [7, -10]],
  cross: [[4, 1], [5, 5], [3, 7], [0, 7]],
  mouth: [[4, 1], [6, 5], [6, 2], [5, -2]],
  out: [[4, 1], [6, 5], [7, 9], [8, 11]],
  back: [[4, 1], [2, 5], [-2, 8], [-5, 9]],
  point: [[4, 0], [8, 1], [12, 0], [15, -1]],
  beckon: [[4, 1], [8, 2], [10, -1], [10, -3]],
  offer: [[4, 1], [8, 3], [12, 3], [14, 3]],
  hold: [[4, 1], [6, 4], [8, 6], [10, 6]],
  phone: [[4, 1], [7, 5], [9, 3], [9, -1]],        // phone held up in front of the face
  type: [[4, 1], [6, 5], [8, 7], [9, 6]],          // phone at the chest
  ear: [[4, 1], [6, 4], [5, 0], [3, -4]],          // phone at the ear
  up2: [[4, 0], [8, -3], [10, -7], [11, -10]],      // arm raised, swaying
  reach: [[4, 1], [7, 5], [9, 9], [11, 13]],       // reaching down (unplug)
};
const BACK = { down: [[-4, 1], [-5, 5], [-5, 10]], swing: [[-4, 1], [-3, 5], [-1, 9]], out: [[-4, 1], [-6, 5], [-7, 10]], up: [[-4, 0], [-6, -3], [-7, -7], [-7, -10]], fwd: [[-4, 1], [-1, 4], [3, 5], [6, 5]] };

// Standing / walking figure. L = look (palettes and garment), p = pose
function figure(P, E, L, p) {
  const by = p.bob || 0, top = 17 + by;                       // shoulder row
  const garmentBot = L.long ? 46 : L.tunic ? 35 : 31;
  // Legs
  const st = p.step ?? -1;
  const legs = st < 0 ? [[CX - 4, 0], [CX + 1, 0]] : [[[CX - 6, 0], [CX + 3, -1]], [[CX - 3, -1], [CX, 0]], [[CX + 3, -1], [CX - 6, 0]], [[CX, 0], [CX - 3, -1]]][st];
  legs.forEach(([lx, ly], i) => {
    for (let y = garmentBot - 2; y < 47 + ly; y++) for (let x = lx; x < lx + 4; x++) P.set(x, y, L.leg((i ? .55 : .8) - (x === lx ? .25 : 0), x, y));
    P.rect(lx, 47 + ly, 5, 2, L.foot(i ? .5 : .85, 0, 0)); P.rect(lx + 1, 47 + ly, 4, 1, L.foot(.95, 0, 0));
  });
  // Back arm (behind the body)
  const bk = BACK[p.barm || (st >= 0 ? 'swing' : 'down')];
  arm(P, bk.map(([x, y]) => [CX + x, top + y + (st === 1 || st === 3 ? 1 : 0)]), L.top, L.skin, true);
  // Torso / garment
  const shL = CX - 5, shR = CX + 5, hmL = L.long ? CX - 8 : CX - 6, hmR = L.long ? CX + 8 : CX + 6;
  P.poly([[shL, top], [shR, top], [hmR, garmentBot], [hmL, garmentBot]], (x, y) => {
    const u = (y - top) / (garmentBot - top), l = hmL * u + shL * (1 - u), r = hmR * u + shR * (1 - u), s = (x - l) / Math.max(1, r - l);
    let v = .7 - s * .42 + (1 - u) * .12;
    if (L.folds && (x + (y >> 2)) % 5 === 0 && u > .2) v -= .16;
    if (s > .8) v -= .1;
    return L.top(v, x, y);
  });
  if (L.jeansTop) for (let y = 29 + by; y < 33; y++) for (let x = CX - 5; x < CX + 6; x++) P.set(x, y, L.leg(.7 - (x - CX + 5) * .04, x, y));   // hoodie ends at the hips; jeans show
  if (L.hoodiePocket) { P.rect(CX - 2, top + 9, 7, 3, L.top(.45, 0, 0)); P.rect(CX - 2, top + 9, 7, 1, L.top(.3, 0, 0)); }
  if (L.hoodRoll) { P.ellipse(CX - 2, top - .5, 5, 2.2, (x, y, dx, dy) => L.top(.75 - dy * .3, x, y)); P.set(CX + 2, top + 2, L.foot(.9, 0, 0)); P.set(CX + 2, top + 3, L.foot(.9, 0, 0)); }
  if (L.belt) P.rect(CX - 5, top + 11, 11, 1, PAL.belt(.6, 0, 0));
  if (L.strap) { for (let k = 0; k < 12; k++) P.set(CX - 4 + Math.round(k * .75), top + 1 + k, PAL.bag(.4, 0, 0)); P.rect(CX - 8, top + 9, 4, 5, PAL.bag(.6, 0, 0)); P.rect(CX - 8, top + 9, 4, 1, PAL.bag(.9, 0, 0)); }
  if (L.zip) for (let y = top + 2; y < garmentBot - 1; y++) P.set(CX + 3, y, L.top(.2, 0, 0));
  if (L.reflect) P.rect(CX - 4, top + 7, 9, 1, [235, 235, 220]);
  if (L.apron) P.poly([[CX - 1, top + 4], [CX + 6, top + 4], [CX + 7, garmentBot - 1], [CX - 1, garmentBot - 1]], (x, y) => PAL.apron(.6 - (x - CX) * .04, x, y));
  if (L.hood === 'palla') P.poly([[CX - 6, top - 1], [CX + 4, top - 1], [CX + 6, top + 8], [CX - 7, top + 10]], (x, y) => L.palla(.6 - (x - CX) * .03 + ((x + y) % 4 === 0 ? -.14 : 0), x, y));
  // Head
  head(P, CX + 1, top - 7 + (L.short ? 1 : 0), p, L);
  // Front arm
  const a = ARMS[p.arm || 'down'];
  arm(P, a.map(([x, y]) => [CX + x, top + y]), L.top, L.skin);
  const [hx, hy] = a[a.length - 1].map((v, i) => v + (i ? top : CX));
  if (p.pockets) { P.rect(CX - 6, top + 13, 2, 3, L.foot(.9, 0, 0)); P.rect(CX + 4, top + 13, 2, 3, L.foot(.85, 0, 0)); }
  if (p.phone != null) phone(P, E, hx, hy - 2, p.phone);
}
// Phone in the hand: dark body, screen lit by `lit` (1 bright, .5 dim, 0 dead); lit pixels also go to the emissive canvas
function phone(P, E, x, y, lit) {
  P.rect(x, y, 2, 4, PAL.phone(.5, 0, 0));
  if (lit > .05) { const c = PAL.screen(lit > .7 ? .95 : lit > .3 ? .55 : .2, 0, 0); for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]]) { P.set(x + i, y + j, c); E.set(x + i, y + j, c); } }
}
const wheel = (P, wx, wy, r) => { const Bk = PAL.bike; for (let a = 0; a < 44; a++) { const t = a / 44 * Math.PI * 2; P.set(Math.round(wx + Math.cos(t) * r), Math.round(wy + Math.sin(t) * r), Bk(.15, 0, 0)); P.set(Math.round(wx + Math.cos(t) * (r - 1)), Math.round(wy + Math.sin(t) * (r - 1)), Bk(.4, 0, 0)); } P.set(wx, wy, Bk(.8, 0, 0)); };
function bikeFrame(P) {
  const Bk = PAL.bike, wy = 42, xb = CX - 13, xf = CX + 14, cx = CX, cy = 42, seat = [CX - 4, 30], bar = [CX + 10, 28];
  wheel(P, xb, wy, 6.5); wheel(P, xf, wy, 6.5);
  for (const [a, b] of [[[xb, wy], [cx, cy]], [[xb, wy], seat], [seat, [cx, cy]], [[cx, cy], [bar[0] - 1, bar[1] + 3]], [seat, [bar[0] - 1, bar[1] + 3]], [[bar[0] - 1, bar[1] + 3], [xf, wy]]]) P.line(a[0], a[1], b[0], b[1], Bk(.7, 0, 0));
  P.rect(seat[0] - 2, seat[1] - 1, 5, 1, Bk(.2, 0, 0)); P.rect(bar[0] - 1, bar[1] - 1, 3, 1, Bk(.2, 0, 0));
  return { seat, bar, cx, cy };
}
// Riding a bike (side view facing right): crank phase p.crank 0..3
function ride(P, E, L, p) {
  const ph = (p.crank ?? 0) * Math.PI / 2, B = bikeFrame(P);
  const hip = [CX - 3, 28], sh = [CX + 4, 19 + (p.bob || 0)];
  [[ph + Math.PI, .45], [ph, .8]].forEach(([a, v]) => {
    const pd = [B.cx + Math.cos(a) * 3.5, B.cy + Math.sin(a) * 3.5], kx = (hip[0] + pd[0]) / 2 + 4, ky = (hip[1] + pd[1]) / 2 - 2;
    for (const [A, Bb] of [[hip, [kx, ky]], [[kx, ky], pd]]) { const n = Math.max(Math.abs(Bb[0] - A[0]), Math.abs(Bb[1] - A[1]), 1); for (let k = 0; k <= n; k++) { const x = Math.round(A[0] + (Bb[0] - A[0]) * k / n), y = Math.round(A[1] + (Bb[1] - A[1]) * k / n); P.rect(x - 1, y, 3, 1, L.leg(v, x, y)); } }
    P.rect(Math.round(pd[0]) - 1, Math.round(pd[1]), 4, 1, L.foot(v + .1, 0, 0));
  });
  arm(P, [[sh[0] - 1, sh[1] + 1], [sh[0] + 3, sh[1] + 5], [B.bar[0] - 1, B.bar[1] - 1]], L.top, L.skin, true);
  P.poly([[sh[0] - 4, sh[1] - 1], [sh[0] + 4, sh[1] + 1], [hip[0] + 4, hip[1] + 1], [hip[0] - 4, hip[1] - 1]], (x, y) => L.top(.72 - (x - hip[0]) * .02 - (y - sh[1]) * .01, x, y));
  if (L.strap) { for (let k = 0; k < 9; k++) P.set((sh[0] - 3 + k * .3) | 0, sh[1] + k, PAL.bag(.4, 0, 0)); P.rect(hip[0] - 6, hip[1] - 6, 4, 5, PAL.bag(.6, 0, 0)); }
  if (L.reflect) P.rect(sh[0] - 3, sh[1] + 5, 7, 1, [235, 235, 220]);
  head(P, sh[0] + 2, sh[1] - 7, { ...p, look: 1 }, L);
  arm(P, [[sh[0] + 1, sh[1] + 1], [sh[0] + 5, sh[1] + 5], [B.bar[0], B.bar[1] - 1]], L.top, L.skin);
}
function bikeOnly(P) { bikeFrame(P); }

// Seated on the ground, legs forward
function seated(P, E, L, p) {
  const top = 30 + (p.bob || 0);
  // legs forward
  for (let y = 44; y < 48; y++) for (let x = CX - 4; x < CX + 12; x++) P.set(x, y, L.leg(.75 - (y - 44) * .12, x, y));
  P.rect(CX + 12, 42, 3, 6, L.foot(.85, 0, 0));
  if (L.long) for (let y = 40; y < 48; y++) for (let x = CX - 6; x < CX + 10; x++) P.set(x, y, L.top(.55 - (y - 40) * .03 + ((x + y) % 5 === 0 ? -.12 : 0), x, y));
  arm(P, BACK.down.map(([x, y]) => [CX + x - 1, top + y + 2]), L.top, L.skin, true);
  P.poly([[CX - 5, top], [CX + 5, top], [CX + 6, 46], [CX - 6, 46]], (x, y) => L.top(.68 - (x - CX + 5) * .035, x, y));
  if (L.hoodRoll) P.ellipse(CX - 2, top - .5, 5, 2.2, (x, y, dx, dy) => L.top(.75 - dy * .3, x, y));
  if (L.hood === 'palla') P.poly([[CX - 6, top - 1], [CX + 4, top - 1], [CX + 6, top + 8], [CX - 7, top + 10]], (x, y) => L.palla(.6 - (x - CX) * .03, x, y));
  head(P, CX + 1 + (p.slump ? 1 : 0), top - 7 + (p.slump ? 3 : 0), p, L);
  const a = ARMS[p.arm || 'down'];
  arm(P, a.map(([x, y]) => [CX + x, top + y]), L.top, L.skin);
  const [hx, hy] = a[a.length - 1].map((v, i) => v + (i ? top : CX));
  if (p.phone != null) phone(P, E, hx, hy - 3, p.phone);
}
// Kneeling at the fountain: hands cupped to the mouth
function kneel(P, E, L, p) {
  const top = 26;
  for (let y = 42; y < 48; y++) for (let x = CX - 7; x < CX + 4; x++) P.set(x, y, L.leg(.7 - (y - 42) * .08, x, y));
  P.rect(CX - 9, 46, 3, 2, L.foot(.8, 0, 0));
  P.poly([[CX - 4, top], [CX + 6, top + 1], [CX + 6, 43], [CX - 5, 43]], (x, y) => L.top(.7 - (x - CX + 4) * .035, x, y));
  if (L.hoodRoll) P.ellipse(CX - 1, top - .5, 5, 2.2, (x, y, dx, dy) => L.top(.75 - dy * .3, x, y));
  head(P, CX + 3, top - 6, p, L);
  const a = p.arm === 'cup' ? [[4, 1], [8, 6], [9, 9], [10, 11]] : ARMS.mouth;
  arm(P, a.map(([x, y]) => [CX + x + 1, top + y]), L.top, L.skin, false, 3);
}

// Rotate a standing drawing 90° to lie on the back (head left)
function lying(P, E, L, p) {
  const T = new PX(FW, FH), TE = new PX(FW, FH);
  figure(T, TE, L, { ...p, arm: 'down' });
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = T.get(x, y); if (!c) continue; const nx = y + 2, ny = 48 - (x - (CX - 8)); if (ny >= 0 && ny < FH) P.set(nx, ny, [c[0], c[1], c[2]]); }
}

// —— Looks ——
export const LOOKS = {
  hero: { skin: PAL.skinHero, hair: PAL.hairDark, top: PAL.jacket, leg: PAL.trousers, foot: PAL.shoe, jeansTop: 1, strap: 1, zip: 1, reflect: 1, brow: 1 },
  rosa: { skin: PAL.skinOld, hair: PAL.hairGrey, hairStyle: 'bun', top: PAL.cardigan, leg: PAL.skirt, foot: PAL.shoeDark, long: 1, apron: 1, short: 1, brow: 1 },
  t1: { skin: PAL.skinPale, hair: PAL.hairBrown, top: PAL.coatNavy, leg: PAL.trousers, foot: PAL.shoeDark, long: 1, belt: 1 },
  t2: { skin: PAL.skinDeep, hair: PAL.hairBlack, top: PAL.coatCamel, leg: PAL.jeans, foot: PAL.shoeDark, long: 1 },
  t3: { skin: PAL.skinOld, hair: PAL.hairGrey, hairStyle: 'bald', top: PAL.coatGrey, leg: PAL.trousers, foot: PAL.shoeDark, long: 1, brow: 1 },
  t4: { skin: PAL.skinOlive, hair: PAL.hairRed, hairStyle: 'bun', top: PAL.coatMaroon, leg: PAL.skirt, foot: PAL.shoeDark, long: 1, short: 1 },
  t5: { skin: PAL.skinHero, hair: PAL.hairDark, top: PAL.coatOlive, leg: PAL.jeans, foot: PAL.shoe, jeansTop: 1 },
  t6: { skin: PAL.skinPale, hair: PAL.hairGrey, hairStyle: 'bun', top: PAL.coatPlum, leg: PAL.skirt, foot: PAL.shoeDark, long: 1, short: 1 },
  t7: { skin: PAL.skinDeep, hair: PAL.hairBlack, hairStyle: 'bald', top: PAL.coatTeal, leg: PAL.trousers, foot: PAL.shoeDark, long: 1, beard: 1 },
  t8: { skin: PAL.skinOlive, hair: PAL.hairBrown, top: PAL.coatGrey, leg: PAL.jeans, foot: PAL.shoe, jeansTop: 1, beard: 1 },
};

const BASE = {
  idle0: {}, idle1: { bob: 1 }, blink: { blink: 1 },
  w0: { step: 0 }, w1: { step: 1, bob: -1 }, w2: { step: 2 }, w3: { step: 3, bob: -1 },
};
const RIDE = { r0: { kind: 'ride', crank: 0 }, r1: { kind: 'ride', crank: 1, bob: 1 }, r2: { kind: 'ride', crank: 2 }, r3: { kind: 'ride', crank: 3, bob: 1 } };
export const TABLES = {
  hero: {
    ...BASE, ...RIDE,
    look: { arm: 'phone', phone: 1 }, look1: { arm: 'phone', phone: 1, bob: 1 }, lookBlink: { arm: 'phone', phone: 1, blink: 1 },
    lookDim: { arm: 'phone', phone: .5 }, lookDead: { arm: 'phone', phone: 0 },
    type: { arm: 'type', phone: 1 }, type1: { arm: 'type', phone: 1, look: -1 },
    ear: { arm: 'ear', phone: 1, mouth: 1 }, ear1: { arm: 'ear', phone: 1, bob: 1 }, earDim: { arm: 'ear', phone: .5 },
    up: { arm: 'up', barm: 'up', phone: 1, mouth: 1 }, up2: { arm: 'up2', barm: 'up', phone: 1 }, upDim: { arm: 'up', barm: 'up', phone: .5 }, upDim2: { arm: 'up2', barm: 'up', phone: .5, mouth: 1 }, upDead: { arm: 'up', barm: 'out', phone: 0 },
    drag0: { arm: 'fwd', barm: 'fwd', step: 0 }, drag1: { arm: 'fwd', barm: 'fwd', step: 2, bob: 1 },
    plead: { arm: 'fwd', mouth: 1 }, lookUp: { lookUp: 1 }, slump: { kind: 'sit', slump: 1, closed: 1 },
    sit: { kind: 'sit' }, sitBlink: { kind: 'sit', blink: 1 }, sitPhone: { kind: 'sit', arm: 'hold', phone: 1 }, sitPhone1: { kind: 'sit', arm: 'hold', phone: 1, bob: 1 },
    sitType: { kind: 'sit', arm: 'hold', phone: 1, look: -1 }, sitDead: { kind: 'sit', arm: 'hold', phone: 0, slump: 1 }, sitDawn: { kind: 'sit', arm: 'hold', phone: .5 },
    lie: { kind: 'lie', closed: 1 }, lieOpen: { kind: 'lie' },
  },
  rosa: { ...BASE, cross: { arm: 'cross' }, cross1: { arm: 'cross', bob: 1 }, shrug: { arm: 'out', barm: 'out', mouth: 1 }, reach: { arm: 'reach', bob: 2 }, talk: { arm: 'fwd', mouth: 1 } },
  folk: { ...BASE, look: { arm: 'phone', phone: 1 }, look1: { arm: 'phone', phone: 1, bob: 1 }, lookBlink: { arm: 'phone', phone: 1, blink: 1 }, ear: { arm: 'ear', phone: 1 }, cross: { arm: 'cross' }, up: { arm: 'up', mouth: 1 }, point: { arm: 'point', mouth: 1 }, lw0: { step: 0, arm: 'phone', phone: 1 }, lw1: { step: 1, bob: -1, arm: 'phone', phone: 1 }, lw2: { step: 2, arm: 'phone', phone: 1 }, lw3: { step: 3, bob: -1, arm: 'phone', phone: 1 } },
  bike: { idle0: { kind: 'bike' } },
};

function draw(P, E, L, p) {
  if (p.kind === 'ride') return ride(P, E, L, p);
  if (p.kind === 'bike') return bikeOnly(P);
  if (p.kind === 'sit') return seated(P, E, L, p);
  if (p.kind === 'kneel') return kneel(P, E, L, p);
  if (p.kind === 'lie') return lying(P, E, L, p);
  return figure(P, E, L, p);
}

export function atlas(table, L) {
  const names = Object.keys(table), n = names.length;
  const P = new PX(FW * n, FH), E = new PX(FW * n, FH);
  names.forEach((k, i) => {
    const p1 = new PX(FW, FH), e1 = new PX(FW, FH);
    draw(p1, e1, L, table[k]); p1.outline(.3);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = p1.get(x, y); if (c) P.set(i * FW + x, y, c); const e = e1.get(x, y); if (e) E.set(i * FW + x, y, e); }
  });
  const tex = texOf(P.done()), em = texOf(E.done());
  for (const t of [tex, em]) t.repeat.set(1 / n, 1);
  return { tex, em, names, n, canvas: P.c };
}

const _AT = {};   // one atlas per (kind, look); every character gets its own texture view of it
// Character object. kind: table name; look: LOOKS key
export function makeChar(kind, look = kind, o = {}) {
  const TB = TABLES[kind], key = kind + ":" + look, A0 = _AT[key] || (_AT[key] = atlas(TB, LOOKS[look] ?? LOOKS.hero));
  const A = { ...A0, tex: A0.tex.clone(), em: A0.em.clone() }; A.tex.needsUpdate = A.em.needsUpdate = true;
  const mesh = billboard(A.tex, FW * SPX, FH * SPX, { em: A.em, emCol: '#ffffff', emI: 2.4 });
  const root = new THREE.Group(); root.add(mesh); root.userData.char = o.tag ?? kind;
  const sh = blob(.42, .5); sh.position.y = .015; root.add(sh);
  let cur = TB.idle0 ? 'idle0' : A.names[0];
  return {
    root, mesh, atlas: A, shadowBlob: sh,
    get cur() { return cur; },
    frame(name) { const i = A.names.indexOf(name); if (i < 0) throw new Error(kind + ' frame ' + name); cur = name; A.tex.offset.x = A.em.offset.x = i / A.n; },
    // face the camera (yaw only); lean tips the sprite back toward a steep camera; flip mirrors to face left
    face(cam, flip = false, lean = 0) {
      root.rotation.set(0, 0, 0); root.rotation.order = 'YXZ';
      root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); root.rotation.x = -lean;
      mesh.scale.x = flip ? -1 : 1;
    },
    // world position of the hand-held phone for the current frame (approx.)
    phonePos(flip = false) {
      const p = TB[cur] || {}, a = ARMS[p.arm || 'phone'], hx = CX + a[a.length - 1][0] + 4, top = (p.kind === 'sit' ? 30 : 17) + (p.bob || 0), hy = top + a[a.length - 1][1] - 2;
      const v = new THREE.Vector3((hx - FW / 2) * SPX * (flip ? -1 : 1), (FH - hy) * SPX, .06);
      v.applyEuler(root.rotation); return v.add(root.position);
    },
  };
}
