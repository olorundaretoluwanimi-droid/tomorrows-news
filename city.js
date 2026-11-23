// Northgate: one diorama for the whole film. Tram Street (tram stop, Rosa's café, Northgate Savings, your building with
// the rooftop room), a grid of city blocks for the overhead shots, the river and the Old River Bridge.
// Every shot is a camera + light key + cast state in this one world.
import * as THREE from 'three';
import { glow, blob } from './px.js';
import { box } from './kit.js';
import { sky, stars, sea, particles, rain as rainFx, flick } from './fx.js';
import { cmats, Windows, building, shopFront, lampPost, car, tram, barrier, kiosk, truss, bed, desk, heater, screen, pixText, sign, solid } from './city_art.js';
import { makeChar } from './chars.js';
import { T, battery } from './story.js';
import { track, seg, ss, lerp, clamp, mulberry } from '/core/lib.js';

const C = c => new THREE.Color(c);
// —— Light keys ——
const KEYS = {
  night: { top: '#03050c', mid: '#0b1428', hor: '#1e2c46', sun: '#8ea8e0', sunI: .9, sunDir: [-20, 34, 16], hemiS: '#3a4c7a', hemiG: '#0a0c14', hemiI: 1.6, fog: '#101a2e', fogD: .0062, exp: 1.45, moon: .3 },
  grey: { top: '#4c5462', mid: '#7a8290', hor: '#a8acb2', sun: '#d8dce4', sunI: .9, sunDir: [24, 30, 30], hemiS: '#a4acbc', hemiG: '#3a3a3e', hemiI: 1.9, fog: '#8a909a', fogD: .0078, exp: 1.15, moon: 0 },
  rain: { top: '#2e343e', mid: '#4c545e', hor: '#6e747c', sun: '#a8b0bc', sunI: .45, sunDir: [24, 30, 30], hemiS: '#8a94a8', hemiG: '#2a2c32', hemiI: 1.9, fog: '#565e6a', fogD: .011, exp: 1.2, moon: 0 },
  morning: { top: '#46689a', mid: '#90a8c8', hor: '#d8d4c8', sun: '#fff0d8', sunI: 2.0, sunDir: [30, 26, 34], hemiS: '#a8b8d0', hemiG: '#3c3830', hemiI: 1.15, fog: '#a4aab4', fogD: .0058, exp: 1.08, moon: .2 },
  noon: { top: '#3a70b4', mid: '#88b0dc', hor: '#e2dccc', sun: '#fff4dc', sunI: 2.6, sunDir: [12, 44, 22], hemiS: '#b8c8e0', hemiG: '#463e30', hemiI: 1.0, fog: '#bcbcb4', fogD: .005, exp: 1.0, moon: .15 },
  dawnCold: { top: '#2a3450', mid: '#6a7896', hor: '#d8b4a8', sun: '#ffd0b8', sunI: 1.3, sunDir: [44, 12, 20], hemiS: '#94a2c4', hemiG: '#34323a', hemiI: 1.8, fog: '#7c849c', fogD: .0072, exp: 1.25, moon: .4 },
  dusk: { top: '#141a26', mid: '#2e3646', hor: '#5a5258', sun: '#c8a090', sunI: .5, sunDir: [-30, 12, 10], hemiS: '#5a6478', hemiG: '#141418', hemiI: 1.7, fog: '#262c38', fogD: .0095, exp: 1.35, moon: .1 },
  storm: { top: '#05080c', mid: '#0e161c', hor: '#1c2830', sun: '#9ab4c8', sunI: .55, sunDir: [-24, 36, 12], hemiS: '#3a5262', hemiG: '#080a0c', hemiI: 1.8, fog: '#121c22', fogD: .0105, exp: 1.5, moon: 0 },
  dawnGold: { top: '#3a4a6e', mid: '#9a8ea0', hor: '#f4c08a', sun: '#ffc690', sunI: 1.9, sunDir: [60, 10, 10], hemiS: '#b0a8c0', hemiG: '#3a3430', hemiI: 1.45, fog: '#b8a49c', fogD: .0062, exp: 1.12, moon: .9 },
};
function mixKey(a, b, k) {
  const A = KEYS[a], B = KEYS[b], o = {};
  for (const n in A) { if (typeof A[n] === 'number') o[n] = lerp(A[n], B[n], k); else if (Array.isArray(A[n])) o[n] = A[n].map((v, i) => lerp(v, B[n][i], k)); else o[n] = C(A[n]).lerp(C(B[n]), k); }
  return o;
}
// Lightning: strike, dip, re-strike, decay
function flash(t) { let f = 0; for (const s of T.flashes) { const d = t - s; if (d < 0 || d > 1.2) continue; f = Math.max(f, d < .03 ? d / .03 : d < .12 ? 1 - (d - .03) / .09 * .7 : d < .18 ? .3 + (d - .12) / .06 * .5 : .8 * Math.exp(-(d - .18) * 5)); } return f; }

// —— Layout constants ——
const HB = { x: 19, z: -11.4, w: 12, d: 12, floors: 6 };          // your building
const RH = 3.6 + 3.1 * (HB.floors - 1);                           // its roof height (19.1)
const ROOM = { x: 17, z: -8.6, w: 5, d: 4, h: 2.8, y: RH + .33 };  // rooftop room
const CAFE = { x: 2, w: 10 }, BANK = { x: -18, w: 16 };
const BR = { x: 40, z0: -56, z1: -84, p1: -63.5, p2: -76.5, w: 9 }; // Old River Bridge
const RIV = { z: -70, w: 24 };

export function buildCity() {
  const M = cmats(), scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#101a2e', .006);
  const SK = sky(); scene.add(SK.mesh);
  const ST = stars(500, 11); scene.add(ST);
  const sun = new THREE.DirectionalLight('#ffffff', 1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 24; sc.bottom = -24; sc.near = 1; sc.far = 200; sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  const sunT = new THREE.Object3D(); scene.add(sunT); sun.target = sunT; scene.add(sun);
  const hemi = new THREE.HemisphereLight('#ffffff', '#222222', 1); scene.add(hemi);
  const W = new Windows(7000); scene.add(W.mesh);
  const R = mulberry(2026);

  // —— Ground: asphalt city floor (two halves around the river), river bed, embankments ——
  const gS = box(420, .2, 200, M.asphalt, { cast: false }); gS.position.set(0, -.2, RIV.z + RIV.w / 2 + 100); scene.add(gS);
  const gN = box(420, .2, 140, M.asphalt, { cast: false }); gN.position.set(0, -.2, RIV.z - RIV.w / 2 - 70); scene.add(gN);
  const bedB = box(420, .2, RIV.w, M.dark, { cast: false }); bedB.position.set(0, -6, RIV.z); scene.add(bedB);
  for (const s of [-1, 1]) { const e = box(420, 4.2, .8, M.stone, { cast: false }); e.position.set(0, -4.2, RIV.z + s * (RIV.w / 2 + .4)); scene.add(e); const rl = box(420, .9, .2, M.metal, { cast: false }); rl.position.set(0, 0, RIV.z + s * (RIV.w / 2 - .1)); scene.add(rl); }
  const RV = sea(600, { deep: '#04080e', shallow: '#0c1a26', crest: '#2a4a5e', ppm: 8 }); RV.mesh.scale.set(1, RIV.w / 600, 1); RV.mesh.position.set(0, -3.4, RIV.z); scene.add(RV.mesh);

  // —— Tram Street: road, tram rails, kerbs and pavements ——
  const road = box(240, .04, 6, M.asphalt, { cast: false }); road.position.set(0, -.02, 0); scene.add(road);
  for (const z of [-.72, .72]) { const r = box(240, .05, .12, M.rail, { cast: false }); r.position.set(0, 0, z); scene.add(r); }
  for (const s of [-1, 1]) { const pv = box(240, .14, 2.4, M.paving, { cast: false }); pv.position.set(0, 0, s * 4.2); scene.add(pv); const kb = box(240, .16, .2, M.kerb, { cast: false }); kb.position.set(0, 0, s * 3.05); scene.add(kb); }
  for (let x = -110; x < 110; x += 4) { const d = box(2, .03, .12, M.paint, { cast: false }); d.position.set(x, .01, s0(x) ); scene.add(d); }
  function s0() { return 2.2; }
  // road from Tram Street north to the bridge (x = 40), with pavements
  const r2 = box(9, .04, 50, M.asphalt, { cast: false }); r2.position.set(BR.x, -.02, -31); scene.add(r2);
  for (const s of [-1, 1]) { const pv = box(2.2, .14, 50, M.paving, { cast: false }); pv.position.set(BR.x + s * 5.6, 0, -31); scene.add(pv); }
  for (let z = -8; z > -54; z -= 4) { const d = box(.12, .03, 2, M.paint, { cast: false }); d.position.set(BR.x, .01, z); scene.add(d); }

  // —— North row of Tram Street ——
  const phoneT = p => { const d = Math.hypot(p[0] - HB.x, p[2] - HB.z); return T.spread0 + 1.0 + 6.0 * Math.log(Math.max(d, 10) / 10) + (R() - .5) * 1.4; };
  const phone = (p, r) => r() < .72 ? phoneT(p) : Infinity;
  const row = [
    { x: -50, w: 16, mat: 'concreteW', floors: 4 }, { x: -34, w: 16, mat: 'brickY', floors: 5 },
    { x: BANK.x, w: BANK.w, mat: 'stone', floors: 4, bank: 1 }, { x: -6.5, w: 7, mat: 'brick', floors: 5 },
    { x: CAFE.x, w: CAFE.w, mat: 'brickY', floors: 4, cafe: 1 }, { x: 10, w: 6, mat: 'concrete', floors: 5 },
    { x: HB.x, w: HB.w, mat: 'brickD', floors: HB.floors, hero: 1 }, { x: 30, w: 10, mat: 'concreteB', floors: 6 },
    { x: 52, w: 16, mat: 'brick', floors: 5 }, { x: 70, w: 18, mat: 'concreteW', floors: 4 },
  ];
  const fronts = {};
  for (const b of row) {
    const g = building(W, { x: b.x, z: -5.4 - 6, w: b.w, d: 12, floors: b.floors, mat: b.mat, shop: true, hollow: !!b.cafe, rnd: R, phone, lampP: .4, wpm: b.bank ? .3 : .45, roofBoxes: b.hero ? 0 : 2 });
    scene.add(g); fronts[b.x] = g;
  }
  // ground-floor shop fronts
  const shops = [];
  for (const [x, w, sg, inside] of [[-50, 12, 'PHARMACY', '#c8f0d8'], [-34, 10, 'BOOKS', '#ffd090'], [-6.5, 5, 'FLORIST', '#ffc8a0'], [10, 4.6, 'LAUNDRY', '#d8e8ff'], [30, 8, 'BAKERY', '#ffc070'], [52, 12, 'HARDWARE', '#ffd8a0'], [19, 8, 'DELI', '#ffcf8a']]) {
    const s = shopFront(w, 3.6, { sign: sg, inside, signO: { bg: '#16181e', fg: '#d8c890', k: .55 } }); s.position.set(x, 0, -5.38); scene.add(s); shops.push(s);
  }
  // Rosa's café: open front (glass), interior: floor, back wall, counter, heater, tables, wall clock
  const cafeF = shopFront(CAFE.w, 3.6, { sign: 'ROSA’S CAFÉ', inside: '#ffb468', opacity: .3, signO: { bg: '#2a1410', fg: '#f0d8a0', k: .6, font: '"Cormorant Garamond"' } }); cafeF.position.set(CAFE.x, 0, -5.38); scene.add(cafeF); shops.push(cafeF);
  const cfl = box(CAFE.w - .4, .05, 5.4, M.wood, { cast: false }); cfl.position.set(CAFE.x, 0, -8.2); scene.add(cfl);
  const cbk = box(CAFE.w - .4, 3.5, .2, M.plaster); cbk.position.set(CAFE.x, 0, -11.0); scene.add(cbk);
  for (const s of [-1, 1]) { const sw = box(.2, 3.5, 5.6, M.plaster); sw.position.set(CAFE.x + s * (CAFE.w / 2 - .25), 0, -8.2); scene.add(sw); }
  const cceil = box(CAFE.w - .4, .2, 5.6, M.plaster, { cast: false }); cceil.position.set(CAFE.x, 3.5, -8.2); scene.add(cceil);
  const counter = box(3.6, 1.05, .7, M.wood); counter.position.set(CAFE.x + 1.4, 0, -10.3); scene.add(counter);
  const machine = box(.6, .5, .4, M.metal); machine.position.set(CAFE.x + 2.4, 1.05, -10.4); scene.add(machine);
  for (const [x, z] of [[-1.8, -6.6], [-2.2, -8.8]]) { const tb = box(.8, .74, .8, M.wood); tb.position.set(CAFE.x + x, 0, z); scene.add(tb); }
  const HT = heater(); HT.position.set(CAFE.x + 3.7, 0, -6.2); scene.add(HT);
  const cafeClock = screen(24, 9, (P, s) => pixText(P, s, 2, 2, [255, 214, 140]));
  const ccm = new THREE.Mesh(new THREE.PlaneGeometry(.9, .34), new THREE.MeshBasicMaterial({ map: cafeClock.tex, transparent: true, color: new THREE.Color(1.6, 1.6, 1.6) }));
  const ccb = box(1.0, .44, .06, M.dark); ccb.position.set(CAFE.x + 3.0, 2.5, -10.88); scene.add(ccb); ccm.position.set(CAFE.x + 3.0, 2.72, -10.84); scene.add(ccm);
  const cafeL = new THREE.PointLight('#ffb468', 0, 9, 2); cafeL.position.set(CAFE.x, 2.9, -7.6); scene.add(cafeL);
  const heatL = new THREE.PointLight('#ff4a18', 0, 4, 2); heatL.position.set(CAFE.x + 3.7, .7, -5.6); scene.add(heatL);
  const heatG = glow('#ff5a20', 1.2, .8); heatG.position.set(CAFE.x + 3.7, .6, -5.95); scene.add(heatG);
  // Northgate Savings: columns, sign, door, steel shutter
  for (let i = 0; i < 6; i++) { const c = box(.7, 3.8, .7, M.stone); c.position.set(BANK.x - 6.5 + i * 2.6, 0, -4.9); scene.add(c); }
  const ent = box(BANK.w, .7, 1.4, M.stone); ent.position.set(BANK.x, 3.8, -5.0); scene.add(ent);
  const bs = sign('NORTHGATE SAVINGS', 9, .8, { bg: '#20242a', fg: '#e2cf96', k: .55 }); bs.position.set(BANK.x, 4.15, -4.28); scene.add(bs);
  const steps = box(8, .3, 1.2, M.stone, { cast: false }); steps.position.set(BANK.x, 0, -4.7); scene.add(steps);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.0), new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: C('#ffcf8a'), emissiveIntensity: 0, roughness: .6 })); door.position.set(BANK.x, 1.8, -5.36); scene.add(door);
  const shutter = box(3.6, 3.2, .12, solid(['#2a2c30', '#3e4146', '#55585e', '#6c7076'], 4)); shutter.position.set(BANK.x, 3.2, -5.2); scene.add(shutter);

  // your building: rooftop room (cut away for interiors: front wall + roof hide)
  const room = new THREE.Group(); scene.add(room);
  const rf = box(ROOM.w, .1, ROOM.d, M.wood, { cast: false }); rf.position.set(ROOM.x, ROOM.y - .1, ROOM.z); room.add(rf);
  const rug = box(1.8, .02, 1.3, M.rug, { cast: false }); rug.position.set(ROOM.x + .2, ROOM.y, ROOM.z + .3); room.add(rug);
  const back = box(ROOM.w, ROOM.h, .16, M.plaster); back.position.set(ROOM.x, ROOM.y, ROOM.z - ROOM.d / 2); room.add(back);
  const left = box(.16, ROOM.h, ROOM.d, M.plaster); left.position.set(ROOM.x - ROOM.w / 2, ROOM.y, ROOM.z); room.add(left);
  const right = box(.16, ROOM.h, ROOM.d, M.plaster); right.position.set(ROOM.x + ROOM.w / 2, ROOM.y, ROOM.z); room.add(right);
  const front = new THREE.Group(); room.add(front);
  for (const [x0, x1] of [[-2.5, -.2], [1.4, 2.5]]) { const p = box(x1 - x0, ROOM.h, .16, M.plaster); p.position.set(ROOM.x + (x0 + x1) / 2, ROOM.y, ROOM.z + ROOM.d / 2); front.add(p); }
  const sill = box(1.6, .95, .16, M.plaster); sill.position.set(ROOM.x + .6, ROOM.y, ROOM.z + ROOM.d / 2); front.add(sill);
  const lint = box(1.6, .5, .16, M.plaster); lint.position.set(ROOM.x + .6, ROOM.y + ROOM.h - .5, ROOM.z + ROOM.d / 2); front.add(lint);
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.35), new THREE.MeshBasicMaterial({ color: '#0a1220' })); winGlass.position.set(ROOM.x + .6, ROOM.y + 1.62, ROOM.z + ROOM.d / 2 + .09); front.add(winGlass);
  const roofR = box(ROOM.w + .4, .2, ROOM.d + .4, M.concrete); roofR.position.set(ROOM.x, ROOM.y + ROOM.h, ROOM.z); room.add(roofR);
  const BD = bed(); BD.position.set(ROOM.x - 1.35, ROOM.y, ROOM.z - .9); room.add(BD);
  const DK = desk(); DK.position.set(ROOM.x + 1.5, ROOM.y, ROOM.z - 1.55); room.add(DK);
  const dlamp = box(.12, .45, .12, M.metal); dlamp.position.set(ROOM.x + 2.0, ROOM.y + .77, ROOM.z - 1.6); room.add(dlamp);
  const lampL = new THREE.PointLight('#ffb870', 0, 6, 2); lampL.position.set(ROOM.x + 1.9, ROOM.y + 1.4, ROOM.z - 1.0); scene.add(lampL);
  const lampG = glow('#ffc070', .5, 1); lampG.position.set(ROOM.x + 2.0, ROOM.y + 1.25, ROOM.z - 1.55); scene.add(lampG);
  const roomClock = screen(24, 9, (P, s) => pixText(P, s, 2, 2, [255, 120, 90]));
  const rcm = new THREE.Mesh(new THREE.PlaneGeometry(.66, .25), new THREE.MeshBasicMaterial({ map: roomClock.tex, transparent: true, color: new THREE.Color(1.8, 1.8, 1.8) }));
  const rcb = box(.74, .32, .05, M.dark); rcb.position.set(ROOM.x + 1.4, ROOM.y + 1.95, ROOM.z - ROOM.d / 2 + .1); room.add(rcb); rcm.position.set(ROOM.x + 1.4, ROOM.y + 2.11, ROOM.z - ROOM.d / 2 + .14); room.add(rcm);
  const poster = sign('NORTHGATE · TRAM 9', 1.2, .8, { bg: '#2c3a4a', fg: '#e8c070', k: .2 }); poster.position.set(ROOM.x - 1.2, ROOM.y + 1.7, ROOM.z - ROOM.d / 2 + .1); room.add(poster);
  const roomWin = glow('#7ac8ff', 2.2, .0); roomWin.position.set(ROOM.x + .6, ROOM.y + 1.6, ROOM.z + ROOM.d / 2 + .3); scene.add(roomWin);

  // —— South side: low one-storey shops (the diorama's cut-away near edge), tram stop, clock, kiosk, lamps, parked cars ——
  for (const [x0, x1] of [[-90, -60], [-58, -30], [-28, -2], [0, 22], [24, 35], [45, 70], [72, 100]]) { const b = box(x1 - x0, 3.4, 10, M[['brick', 'concrete', 'brickY', 'concreteW'][Math.abs(x0) % 4]], { cast: false }); b.position.set((x0 + x1) / 2, 0, 30); scene.add(b); const pl = box(x1 - x0 - 1, .8, 1.0, M.stone, { cast: false }); pl.position.set((x0 + x1) / 2, 0, 6.2); scene.add(pl); }
  const sq = box(240, .1, 20, M.paving, { cast: false }); sq.position.set(0, -.04, 16); scene.add(sq);
  const STOP = { x: 8.6, z: 4.4 };
  const shelter = new THREE.Group(); scene.add(shelter); shelter.position.set(STOP.x - 2, 0, 4.9);
  { const rf2 = box(3.6, .12, 1.3, M.metal); rf2.position.y = 2.5; shelter.add(rf2); for (const x of [-1.7, 1.7]) { const p = box(.1, 2.5, .1, M.metal); p.position.set(x, 0, .5); shelter.add(p); } const bench = box(2.4, .45, .4, M.wood); bench.position.set(0, 0, .3); shelter.add(bench); const ts = sign('TRAM 9', 1.2, .35, { bg: '#183048', fg: '#ffd060', k: .6 }); ts.position.set(0, 2.32, -.2); shelter.add(ts); }
  const flipClock = screen(26, 9, (P, s) => pixText(P, s, 2, 2, [255, 236, 190]));
  const fpost = box(.16, 2.6, .16, M.metal); fpost.position.set(STOP.x + 2.4, 0, 4.7); scene.add(fpost);
  const fbox = box(1.5, .62, .3, M.dark); fbox.position.set(STOP.x + 2.4, 2.6, 4.7); scene.add(fbox);
  const fface = new THREE.Mesh(new THREE.PlaneGeometry(1.36, .47), new THREE.MeshBasicMaterial({ map: flipClock.tex, color: new THREE.Color(2.2, 2.2, 2.2) })); fface.position.set(STOP.x + 2.4, 2.91, 4.86); scene.add(fface);
  const KS = kiosk(); KS.position.set(-4, 0, 4.5); KS.rotation.y = Math.PI; scene.add(KS);
  const lamps = [];
  for (const x of [-42, -28, -14, 0, 14, 28, 56, 70]) { const L = lampPost(4.8); L.position.set(x, 0, 4.95); L.rotation.y = Math.PI / 2; scene.add(L); lamps.push(L); }
  for (const z of [-12, -24, -36, -48]) for (const s of [-1, 1]) { const L = lampPost(4.8); L.position.set(BR.x + s * 5.2, 0, z); L.rotation.y = s < 0 ? 0 : Math.PI; scene.add(L); lamps.push(L); }
  const lampGlows = lamps.map(L => { const g = glow('#ffd9a0', 1.6, .9); g.position.copy(L.localToWorld(L.userData.head.clone())); g.material.depthTest = false; g.renderOrder = 6; scene.add(g); return g; });
  const parked = [];
  for (const [x, col] of [[-44, ['#1a2a3a', '#2a4058', '#3c5878', '#527296']], [44.5, ['#3a1a1a', '#5a2828', '#7a3a38', '#9a5048']], [24, ['#2a2a2a', '#404040', '#5a5a5a', '#787878']], [62, ['#3a3420', '#585030', '#786c44', '#988a5a']]]) { const c = car(col, { seed: x & 7 }); c.position.set(x, 0, 2.15); scene.add(c); parked.push(c); }
  const TR = tram(); TR.position.set(-22, 0, 0); scene.add(TR);

  const square = box(18, .1, 34, M.paving, { cast: false }); square.position.set(52.5, -.03, -39); scene.add(square);
  for (const [x, z] of [[49, -26], [56, -34], [50, -44], [57, -50]]) { const tr = box(.9, .5, .9, M.stone, { cast: false }); tr.position.set(x, 0, z); scene.add(tr); }
  // —— City grid (overhead map, wide shots) ——
  const mats = ['concrete', 'brick', 'brickD', 'brickY', 'concreteW', 'concreteB', 'stone'];
  const zRows = [-30, -48, -96, -120, -144, -168, 28, 52, 76, 100];
  for (let gx = -164; gx <= 164; gx += 24) for (const gz of zRows) {
    if (gz > 20 && gz < 30 && gx > -100 && gx < 100) continue;   // keep the south cut-away low near the street
    const n = 1 + Math.floor(R() * 2.5);
    for (let k = 0; k < n; k++) {
      const w = 16 / n - .6, x = gx - 8 + (k + .5) * 16 / n, d = 12 + R() * 3, fl = 3 + Math.floor(R() * (Math.abs(gz) > 90 ? 6 : 4));
      if (gz === -48 && Math.abs(x - BR.x) < 10) continue;
      if ((gz === -30 || gz === -48) && x > 43 && x < 61) continue;   // riverside square east of the bridge road
      const g = building(W, { x, z: gz, w, d, floors: fl, mat: mats[Math.floor(R() * mats.length)], rnd: R, phone, lampP: .3, wpm: .34, cast: Math.abs(gz) < 40, sides: Math.abs(x) < 60 && gz > -60 && gz < 0 });
      scene.add(g);
    }
  }
  // spread dots: one soft point per window, visible from above
  const WL = W.list;
  const dots = particles(WL.length, (i, t, o) => { const w = WL[i]; o.x = w.p[0]; o.y = w.p[1] + .8; o.z = w.p[2] + .6; const a = t - w.ph; o.a = a >= 0 && isFinite(w.ph) ? Math.min(1, a / .1) * (.35 + .65 * Math.exp(-a * 1.8)) : 0; o.s = 3.2; o.r = .6; o.g = 1.1; o.b = 1.4; }, { soft: 1, scale: 1 });
  dots.visible = false; scene.add(dots);

  // —— Old River Bridge: piers, deck spans, trusses, rails, lamps; the middle span is its own group (it falls) ——
  const bridge = new THREE.Group(); scene.add(bridge);
  for (const pz of [BR.p1, BR.p2]) { const p = box(BR.w + 2, 6, 3, M.stone); p.position.set(BR.x, -6.4, pz); bridge.add(p); }
  const span = (z0, z1) => { const g = new THREE.Group(), L = z0 - z1; const d = box(BR.w, .6, L, M.asphalt); d.position.set(0, -.6, 0); g.add(d);
    for (const s of [-1, 1]) { const tr = truss(L, 5.2, { n: Math.max(2, Math.round(L / 3.2)) }); tr.rotation.y = Math.PI / 2; tr.position.set(s * (BR.w / 2 - .1), 0, 0); g.add(tr); const rl = box(.12, 1.0, L, M.metal); rl.position.set(s * (BR.w / 2 - .6), 0, 0); g.add(rl); }
    for (let i = 0; i < Math.max(1, Math.round(L / 3)); i++) { const bm = box(BR.w, .25, .25, M.steel); bm.position.set(0, 4.95, -L / 2 + (i + .5) * L / Math.max(1, Math.round(L / 3))); g.add(bm); }
    g.position.set(BR.x, 0, (z0 + z1) / 2); return g; };
  const spS = span(BR.z0, BR.p1), spM = span(BR.p1, BR.p2), spN = span(BR.p2, BR.z1);
  bridge.add(spS, spN); scene.add(spM);
  const bLamps = [[BR.x - 4.6, -60], [BR.x + 4.6, -66], [BR.x - 4.6, -74], [BR.x + 4.6, -80]].map(([x, z]) => { const g = glow('#ffd9a0', 1.4, .9); g.position.set(x, 5.6, z); g.material.depthTest = false; g.renderOrder = 6; (Math.abs(z - RIV.z) < 6.5 ? spM : scene).attach ? null : null; scene.add(g); return g; });
  const bLampM = bLamps.filter((g, i) => i === 1 || i === 2);   // these two sit on the middle span
  const BAR = barrier(4.2); scene.add(BAR);
  const cars = [['#2a3a4a', '#3a5268', '#4e6c88', '#6a8aa8'], ['#3e3e44', '#56565e', '#707078', '#8c8c94'], ['#4a1c1a', '#6a2a26', '#8c3c34', '#ac5444'], ['#2a3424', '#3c4a34', '#52644a', '#6c8062']].map((col, i) => { const c = car(col, { seed: 3 + i }); c.rotation.y = Math.PI / 2; scene.add(c); return c; });
  const CAR = [{ x: BR.x - 2.2, z: -47.6 }, { x: BR.x + 2.2, z: -49.0 }, { x: BR.x - 2.2, z: -41.8 }, { x: BR.x + 2.2, z: -43.2 }];
  const headL = [0, 1].map(() => { const l = new THREE.PointLight('#fff0d0', 0, 22, 1.6); scene.add(l); return l; });
  const headG = [0, 1, 2, 3, 4, 5, 6, 7].map(() => { const g = glow('#fff2d8', 1.1, 1.2); g.material.depthTest = false; g.renderOrder = 7; scene.add(g); return g; });

  // —— Atmosphere: rain, splash, dust ——
  const RN = rainFx(2600, [-30, 0, -30, 30, 28, 30], { opacity: .4, speed: 24, len: 1.0 }); scene.add(RN);
  const R2 = mulberry(77), splSeeds = [...Array(240)].map(() => [R2(), R2(), R2(), R2()]);
  const splash = particles(240, (i, t, o) => { const s = splSeeds[i], a = t - T.splash; o.x = BR.x + (s[0] - .5) * 12; o.z = RIV.z + (s[1] - .5) * 12; const v = 6 + s[2] * 10; o.y = -3.4 + Math.max(0, v * a - 4.9 * a * a); o.a = a > 0 && a < 2.4 ? .8 * (1 - a / 2.4) : 0; o.s = .25 + s[3] * .3; o.r = .75; o.g = .85; o.b = .95; }, { soft: 1, blend: THREE.NormalBlending });
  splash.visible = false; scene.add(splash);
  const R4 = mulberry(5), dustSeeds = [...Array(140)].map(() => [R4(), R4(), R4(), R4()]);
  const dust = particles(140, (i, t, o) => { const s = dustSeeds[i]; o.x = DUSTC.x - 12 + s[0] * 24 + Math.sin(t * .3 + i) * .5; o.y = .5 + s[1] * 5; o.z = DUSTC.z - 5 + s[2] * 9; o.s = .05; o.a = .3 * s[3]; o.r = 1; o.g = .94; o.b = .8; }, { soft: 1 });
  const DUSTC = { x: 0, z: 0 }; scene.add(dust);

  // —— Cast ——
  const hero = makeChar('hero', 'hero', { tag: 'hero' }); scene.add(hero.root);
  const bike = makeChar('bike', 'hero'); scene.add(bike.root);
  const rosa = makeChar('rosa'); scene.add(rosa.root);
  const LK = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];
  const folk = [...Array(46)].map((_, i) => { const c = makeChar('folk', LK[(i * 5 + 3) % 8]); scene.add(c.root); return c; });
  const driver = makeChar('folk', 't2'); scene.add(driver.root);
  const all = [hero, bike, rosa, driver, ...folk];
  const phoneL = new THREE.PointLight('#9ad8ff', 0, 7, 2); phoneL.castShadow = true; phoneL.shadow.mapSize.set(512, 512); phoneL.shadow.bias = -.004; scene.add(phoneL);
  const phoneG = glow('#a8e0ff', .55, 1.2); scene.add(phoneG);
  const fill = new THREE.PointLight('#c8d4f0', 0, 9, 2); scene.add(fill);
  const P0 = new THREE.PointLight('#ffd09a', 0, 16, 1.8); scene.add(P0);
  const P1 = new THREE.PointLight('#ffd09a', 0, 16, 1.8); scene.add(P1);
  const P1col = P1.color.clone();

  const walk4 = (t, fps = 8) => ['w0', 'w1', 'w2', 'w3'][Math.floor(t * fps) % 4];
  const ride4 = (t, fps = 9) => ['r0', 'r1', 'r2', 'r3'][Math.floor(t * fps) % 4];
  const idle = (t, s = 0) => (Math.floor(t * 1.4 + s) % 2 ? 'idle1' : 'idle0');
  const blinkOr = (t, f, b, s = 0) => (((t + s) % 3.7) < .12 ? b : f);
  const place = (c, x, y, z) => { c.root.visible = true; c.root.position.set(x, y, z); };
  const look2 = (t, s = 0) => blinkOr(t, Math.floor(t * 1.1 + s) % 2 ? 'look1' : 'look', 'lookBlink', s);

  // —— Cameras per shot (local time) ——
  const RX = ROOM.x, RY = ROOM.y, RZ = ROOM.z;
  const HERO_BED = [RX - .9, RY + .38, RZ - .3];
  const CAM = {
    city0: { p: track([[0, [78, 82, 92]], [12, [36, 36, 22]]]), l: track([[0, [10, 6, -24]], [12, [RX + .3, RY + 1.2, RZ + 1.5]]]), fov: track([[0, [36]], [12, [30]]]) },
    room0: { p: track([[0, [RX + 6.2, RY + 5.6, RZ + 8.2]], [9, [RX + 3.4, RY + 3.3, RZ + 5.2]]]), l: track([[0, [HERO_BED[0] + .6, RY + .7, RZ - .4]], [9, [HERO_BED[0] + .3, RY + .7, RZ - .5]]]), fov: 30 },
    ui0: { p: track([[0, [RX + 3.4, RY + 3.3, RZ + 5.2]], [9, [RX + 3.1, RY + 3.1, RZ + 4.9]]]), l: track([[0, [HERO_BED[0] + .3, RY + .7, RZ - .5]], [9, [HERO_BED[0] + .3, RY + .7, RZ - .5]]]), fov: 30 },
    title: { p: track([[0, [-60, 64, 74]], [6, [-44, 62, 72]]]), l: track([[0, [0, 0, -30]], [6, [8, 0, -30]]]), fov: 34 },
    stop741: { p: track([[0, [13.4, 4.4, 12.2]], [9, [13.0, 4.2, 11.6]]]), l: track([[0, [9.0, 1.5, 3.2]], [9, [9.0, 1.5, 3.2]]]), fov: 30 },
    rain742: { p: track([[0, [13.0, 4.2, 11.6]], [6, [12.8, 4.1, 11.3]]]), l: track([[0, [9.0, 1.5, 3.2]], [6, [9.0, 1.5, 3.2]]]), fov: 30 },
    pullback: { p: track([[0, [12.8, 4.1, 11.3]], [4, [15, 8, 18]], [15, [26, 30, 48]]]), l: track([[0, [9.0, 1.5, 3.2]], [15, [0, 0, -10]]]), fov: track([[0, [30]], [15, [34]]]) },
    noonUI: { p: track([[0, [4.6, 5.2, 7.6]], [12, [3.6, 4.6, 6.4]]]), l: track([[0, [.4, 1.3, -4.4]], [12, [.4, 1.3, -4.6]]]), fov: 30 },
    cafe: { p: track([[0, [4.2, 4.7, 1.8]], [21, [3.6, 4.4, 1.0]]]), l: track([[0, [CAFE.x + .9, .9, -8.2]], [21, [CAFE.x + 1.2, .9, -8.3]]]), fov: 30 },
    heater: { p: track([[0, [CAFE.x + 3.2, 2.3, -1.2]], [9, [CAFE.x + 3.5, 1.7, -2.7]]]), l: track([[0, [CAFE.x + 3.4, 1.2, -7.6]], [9, [CAFE.x + 3.5, 1.15, -7.8]]]), fov: 30 },
    rewrite: { p: track([[0, [CAFE.x + 2.2, 3.6, -1.6]], [9, [CAFE.x + 1.9, 3.3, -2.2]]]), l: track([[0, [CAFE.x - 1.2, 1.1, -7.0]], [9, [CAFE.x - 1.2, 1.1, -7.0]]]), fov: 30 },
    lorenz: { p: track([[0, [5, 5.5, 9]], [8, [10, 14, 24]], [30, [34, 48, 70]]]), l: track([[0, [1, 1.2, -5]], [30, [0, 0, -24]]]), fov: track([[0, [30]], [30, [36]]]) },
    room1: { p: track([[0, [RX + 6.0, RY + 5.4, RZ + 8.0]], [18, [RX + 3.6, RY + 3.4, RZ + 5.4]]]), l: track([[0, [HERO_BED[0] + .5, RY + .7, RZ - .4]], [18, [HERO_BED[0] + .3, RY + .7, RZ - .5]]]), fov: 30 },
    spread: { p: track([[0, [16, 230, 52]], [27, [16, 196, 34]]]), l: track([[0, [14, 0, -40]], [27, [14, 0, -42]]]), fov: 34 },
    bankwide: { p: track([[0, [-2, 31, 36]], [27, [-7, 22, 25]]]), l: track([[0, [-12, 0, -6]], [27, [-14, 0, -6]]]), fov: 32 },
    shutter: { p: track([[0, [BANK.x + 3.2, 2.9, 7.8]], [6, [BANK.x + 2.8, 2.7, 7.2]]]), l: track([[0, [BANK.x, 1.4, -4.6]], [6, [BANK.x, 1.4, -4.6]]]), fov: 32 },
    room2: { p: track([[0, [RX + 6.0, RY + 5.2, RZ + 7.6]], [15, [RX + 4.4, RY + 4.0, RZ + 6.0]]]), l: track([[0, [HERO_BED[0] + .5, RY + .7, RZ - .4]], [15, [HERO_BED[0] + .5, RY + .7, RZ - .4]]]), fov: 30 },
    call: { p: track([[0, [RX + 4.6, RY + 3.8, RZ + 5.6]], [27, [RX + 3.0, RY + 2.6, RZ + 3.8]]]), l: track([[0, [RX + .6, RY + 1.0, RZ - .2]], [27, [RX + .6, RY + 1.1, RZ - .3]]]), fov: 30 },
    cassandra: { p: track([[0, [-70, 120, 96]], [24, [-12, 74, 30]]]), l: track([[0, [10, 0, -40]], [24, [BR.x - 6, 0, -60]]]), fov: 36 },
    bridgehead: { p: track([[0, [49.5, 6.8, -41.5]], [39, [47.8, 6.0, -44.2]]]), l: track([[0, [40.8, 1.0, -52.4]], [39, [40.6, 1.0, -52.8]]]), fov: 32 },
    seven03: { p: track([[0, [45.4, 3.6, -45.2]], [9, [43.4, 2.5, -48.4]]]), l: track([[0, [40.2, 1.7, -52.4]], [9, [40.2, 1.8, -52.6]]]), fov: 30 },
    fall: { p: track([[0, [86, 21, -63]], [9, [82, 19.5, -65]]]), l: track([[0, [BR.x, -.5, -68]], [9, [BR.x, -1.5, -69]]]), fov: 34 },
    // the collapse up close, from the east bank: the middle span drops (426.15–428.6), hits the river, sinks
    fallClose: { p: track([[0, [69, 8.5, -65]], [8.7, [64.5, 6.4, -67]]]), l: track([[0, [BR.x, -1, -70]], [8.7, [BR.x, -2.6, -70]]]), fov: 40 },
    // cold open: the bridge still standing in the storm, a slow push in
    cold: { p: track([[0, [104, 30, -54]], [7, [92, 24.5, -58]]]), l: track([[0, [BR.x - 22, 8, -73]], [7, [BR.x - 22, 7, -73]]]), fov: 34 },
    aftermath: { p: track([[0, [55, 11.5, -35]], [18, [52.5, 10, -39]]]), l: track([[0, [41, .5, -55]], [18, [41.5, .5, -55.5]]]), fov: 32 },
    dawnAfter: { p: track([[0, [136, 44, -58]], [27, [96, 27, -60]]]), l: track([[0, [BR.x + 2, -1, -64]], [27, [BR.x + 3, 0, -58]]]), fov: 34 },
  };

  function applyKey(K, renderer, f = 0) {
    SK.u.top.value.copy(K.top); SK.u.mid.value.copy(K.mid); SK.u.hor.value.copy(K.hor);
    const sd = new THREE.Vector3(...K.sunDir).normalize();
    SK.u.moonDir.value.copy(sd); SK.u.moonCol.value.copy(K.sun); SK.u.moonI.value = K.moon;
    sun.color.copy(K.sun); sun.intensity = K.sunI + f * 2.5; sun.position.copy(sunT.position).addScaledVector(sd, 90);
    hemi.color.copy(K.hemiS).lerp(C('#d8e6ff'), f * .7); hemi.groundColor.copy(K.hemiG); hemi.intensity = K.hemiI + f * 3.2;
    scene.fog.color.copy(K.fog).lerp(C('#8aa4c0'), f * .5); scene.fog.density = K.fogD; renderer.toneMappingExposure = K.exp + f * .35;
    if (f > 0) { SK.u.top.value.lerp(C('#6a7c94'), f * .6); SK.u.mid.value.lerp(C('#9cb0c8'), f * .7); SK.u.hor.value.lerp(C('#c4d4e4'), f * .7); }
  }
  const KEY_OF = {
    city0: 'night', room0: 'night', ui0: 'night', title: 'night', stop741: 'grey', rain742: 'grey', pullback: 'rain', ride: 'morning', noonUI: 'noon', cafe: 'noon', heater: 'noon', rewrite: 'noon', lorenz: 'noon',
    room1: 'night', spread: 'night', queue: 'dawnCold', bankwide: 'dawnCold', shutter: 'dawnCold', guilt: 'dawnCold', room2: 'dusk', call: 'storm', cassandra: 'storm', rideStorm: 'storm', bridgehead: 'storm', seven03: 'storm', fall: 'storm', fallClose: 'storm', cold: 'storm', aftermath: 'storm', dawnAfter: 'dawnGold',
  };

  function update(t, shot, cam, post, renderer) {
    const lt = t - shot.a, id = shot.id, bat = battery(t);
    all.forEach(c => { c.root.visible = false; });
    phoneL.intensity = 0; phoneG.visible = false; fill.intensity = 0; P0.intensity = 0; P1.intensity = 0; P1.color.copy(P1col); lampL.intensity = 0; lampG.visible = false;
    cafeL.intensity = 0; heatL.intensity = 0; heatG.visible = false; headL.forEach(l => { l.intensity = 0; }); headG.forEach(g => { g.visible = false; });
    RN.visible = false; splash.visible = false; dust.visible = false; dots.visible = false; ST.visible = false; roomWin.material.opacity = 0;
    front.visible = true; roofR.visible = true; cafeF.userData.glass.opacity = .3; door.material.emissiveIntensity = 0;
    cars.forEach(c => { c.visible = false; }); BAR.visible = false; TR.visible = true;

    // ——— key ———
    let K;
    if (id === 'rain742') K = mixKey('grey', 'rain', ss(seg(t, T.flip742, T.flip742 + 2.5)));
    else if (id === 'pullback') K = mixKey('rain', 'rain', 0);
    else if (id === 'ride') K = mixKey('rain', 'morning', ss(seg(t, 66, 74)));
    else if (id === 'guilt') K = mixKey('dawnCold', 'morning', ss(seg(t, 270, 288)) * .5);
    else if (id === 'room2') K = mixKey('dusk', 'storm', ss(seg(t, 288, 303)) * .6);
    else K = mixKey(KEY_OF[id] || 'night', KEY_OF[id] || 'night', 0);
    if (['spread', 'cassandra', 'title', 'city0', 'dawnAfter', 'fall', 'fallClose', 'cold'].includes(id)) K.fogD *= id === 'spread' ? .22 : .55;
    const stormy = ['call', 'cassandra', 'rideStorm', 'bridgehead', 'seven03', 'fall', 'fallClose', 'cold', 'aftermath'].includes(id);
    const fl = stormy || id === 'room2' ? flash(t) * (id === 'aftermath' ? .5 : 1) : 0;
    const CK = CAM[id];
    // camera first (sun shadow follows the look target)
    let look = null;
    if (CK) { cam.position.set(...CK.p(lt)); look = new THREE.Vector3(...CK.l(lt)); cam.fov = typeof CK.fov === 'number' ? CK.fov : CK.fov(lt)[0]; }
    // ride / rideStorm / queue / guilt cameras are computed from the action below
    let hx = 0, hz = 0;
    if (id === 'ride') { const k = seg(t, 66.2, 89.8); hx = lerp(-48, 46, k); hz = 1.6; cam.position.set(hx + 4.0, 5.2, 12.2); look = new THREE.Vector3(hx + 2.2, 1.0, -.4); cam.fov = 30; }
    if (id === 'rideStorm') { const k = seg(t, 354.4, 375.6); hz = lerp(-19, -50.5, k); hx = BR.x + 1.8; cam.position.set(hx + 7.2, 4.9, hz + 1.6); look = new THREE.Vector3(hx, 1.0, hz - 2.6); cam.fov = 32; }
    if (id === 'queue') { const k = ss(seg(t, 216, 237)); const x = lerp(26, -12, k); cam.position.set(x - 2.2, 4.8, 8.4); look = new THREE.Vector3(x - 3.8, 1.2, -4.2); cam.fov = 30; }
    if (id === 'guilt') { const k = ss(seg(t, 270, 288)); cam.position.set(lerp(-3.6, -5.4, k), lerp(3.6, 2.4, k), lerp(10.2, 7.6, k)); look = new THREE.Vector3(-6.4, 1.15, 3.9); cam.fov = 30; }
    if (look) cam.lookAt(look);
    sunT.position.copy(look || new THREE.Vector3()); sunT.position.y = 0;
    applyKey(K, renderer, fl);
    const night = ['night', 'storm', 'dusk'].includes(KEY_OF[id]);
    ST.visible = KEY_OF[id] === 'night'; ST.material.uniforms.t.value = t;
    W.update(t, { night: night ? 1 : (KEY_OF[id] === 'dawnCold' ? .45 : 0), day: night ? null : [K.mid.r * .5, K.mid.g * .5, K.mid.b * .55], phones: id === 'spread', warm: id === 'spread' ? .55 : 1 });
    lampGlows.forEach(g => { g.visible = night || KEY_OF[id] === 'dawnCold'; g.material.opacity = 1; });
    bLamps.forEach(g => { g.visible = night; });
    lamps.forEach(L => { L.userData.bulb.material.color.setRGB(night ? 3 : .6, night ? 2.5 : .55, night ? 1.6 : .5); });
    // river: reflections of lamps / headlights
    RV.u.t.value = t; RV.u.camPos.value.copy(cam.position); RV.u.fogColor.value.copy(scene.fog.color); RV.u.fogDensity.value = scene.fog.density; RV.u.calm.value = stormy ? 0 : .6; RV.u.bright.value = 1 + fl * 2;
    RV.setLights(night ? bLamps.filter(g => g.visible).map(g => ({ p: g.position, c: C('#ffd09a'), i: .32 })) : [{ p: new THREE.Vector3(BR.x + 30, 20, -70), c: K.hor, i: .5 }]);

    // ——— rain ———
    const rainK = id === 'rain742' ? ss(seg(t, T.flip742, T.flip742 + 1.2)) : id === 'pullback' ? 1 : id === 'ride' ? 1 - ss(seg(t, 66, 72)) : id === 'city0' || id === 'room0' || id === 'ui0' || id === 'title' ? .7 : stormy ? (id === 'aftermath' ? .5 : 1) : id === 'room2' ? .8 : 0;
    if (rainK > 0) { RN.visible = true; const c = look || new THREE.Vector3(); RN.position.set(c.x, Math.max(0, c.y - 4), c.z); const big = ['city0', 'title', 'cassandra', 'fall', 'cold'].includes(id); RN.scale.setScalar(big ? 3.2 : 1); RN.material.opacity = .42 * rainK * (big ? .8 : 1); RN.userData.update(t, [-7, 0]); }
    M.asphalt.roughness = (id === 'pullback' || id === 'rain742' && t > T.flip742 + 1 || stormy || id === 'ride') ? .38 : .92;

    // ——— the bridge (falls at T.fall) ———
    const fk = ss(seg(t, T.fall + .15, T.fall + 2.6));
    spM.position.set(BR.x, -fk * 8.2, (BR.p1 + BR.p2) / 2 - fk * 1.2); spM.rotation.set(fk * .32, 0, fk * .12);
    bLampM.forEach(g => { g.visible = night && t < T.fall + .3; });
    if (t > T.splash - .2 && t < T.splash + 3) { splash.visible = true; splash.userData.update(t); }

    // ——— tram ———
    TR.position.set(-22, 0, 0); TR.userData.winM.emissiveIntensity = night ? 1.6 : 0;
    if (id === 'noonUI' || id === 'lorenz') TR.position.x = lerp(-80, 70, seg(t, id === 'lorenz' ? 141 : 90, id === 'lorenz' ? 171 : 102));
    if (id === 'stop741' || id === 'rain742' || id === 'shutter' || id === 'queue' || id === 'guilt') TR.position.x = -70;
    if (id === 'room0' || id === 'ui0' || id === 'room1' || id === 'room2' || id === 'call') TR.visible = false;

    // ——— rooftop room ———
    const inRoom = ['room0', 'ui0', 'room1', 'room2', 'call'].includes(id);
    if (inRoom) { front.visible = false; roofR.visible = false; }
    roomClock.set(id === 'room0' ? (t < T.midnight ? '23:59' : '00:00') : id === 'ui0' ? '00:00' : id === 'room1' ? '23:48' : id === 'room2' ? '18:31' : id === 'call' ? '18:38' : '00:00');
    roomWin.material.opacity = id === 'city0' ? .9 : 0; roomWin.visible = id === 'city0';
    if (id === 'room2' || id === 'call') { lampL.intensity = 2.2; lampG.visible = true; }

    // ——— café ———
    const cafeOpen = ['noonUI', 'cafe', 'heater', 'rewrite', 'lorenz', 'ride'].includes(id);
    cafeF.userData.glass.emissiveIntensity = cafeOpen ? .25 : night ? .4 : .05;
    if (id === 'cafe' || id === 'heater' || id === 'rewrite') { cafeF.userData.glass.opacity = .08; cafeL.intensity = 6; }
    const heatOn = t < T.heaterOff;
    HT.userData.coil.emissiveIntensity = (heatOn ? 2.4 : 0) * flick(t, 3);
    if ((id === 'cafe' || id === 'heater') && heatOn) { heatL.intensity = 3 * flick(t, 5); heatG.visible = true; }
    cafeClock.set(id === 'heater' ? (t < T.twoTen ? '2:09' : '2:10') : id === 'rewrite' ? '2:10' : t < 120 ? '1:52' : '2:10');
    flipClock.set(id === 'stop741' ? '7:41' : id === 'rain742' ? '7:42' : id === 'pullback' ? '7:42' : id === 'ride' ? '7:51' : id === 'noonUI' ? '12:00' : night ? '23:48' : '6:58');

    // ——— bank ———
    const shutK = id === 'shutter' ? ss(seg(t, T.shutter - .25, T.shutter)) : (['guilt', 'room2', 'call'].includes(id) || t > T.shutter) ? 1 : 0;
    shutter.position.y = 3.2 - shutK * 3.2; door.material.emissiveIntensity = (id === 'queue' || id === 'bankwide' || id === 'shutter') && shutK < 1 ? .5 : 0;
    if (id === 'shutter') { const d = t - T.shutter; if (d > 0 && d < .25) cam.position.y += Math.sin(d * 90) * .05 * (1 - d / .25); }

    // ——— cast per shot ———
    const showPhone = (c, flip, k = 1) => { const p = c.phonePos(flip), toCam = cam.position.clone().sub(p).setY(0).normalize(); phoneL.position.copy(p).addScaledVector(toCam, .45).add(new THREE.Vector3(0, .15, 0)); phoneL.intensity = 2.6 * k; phoneG.visible = k > .02; phoneG.position.copy(p); phoneG.material.opacity = Math.min(1, k * 1.4); phoneG.scale.setScalar(.4 + .35 * k); };
    const bk = clamp(bat / .62) * .7 + .3;   // light level the battery allows
    let flip = false, tiltC = null, focusOn = null;

    if (id === 'city0' || id === 'room0' || id === 'ui0' || id === 'room1' || id === 'room2') {
      place(hero, ...HERO_BED);
      let f;
      if (id === 'city0') f = 'sitPhone';
      else if (id === 'room0') f = t < T.midnight ? blinkOr(t, 'sitPhone', 'sitBlink') : (Math.floor(t * 1.2) % 2 ? 'sitPhone1' : 'sitPhone');
      else if (id === 'ui0') f = t < 26.6 ? 'sitPhone' : 'sit';
      else if (id === 'room1') f = t < T.typeA ? (Math.floor(t * 1.1) % 2 ? 'sitPhone1' : 'sitPhone') : t < T.send + .4 ? (Math.floor(t * 6) % 2 ? 'sitType' : 'sitPhone') : 'sitPhone';
      else f = blinkOr(t, Math.floor(t * 1.1) % 2 ? 'sitPhone1' : 'sitPhone', 'sitBlink');
      hero.frame(f); hero.face(cam, false);
      if (f.startsWith('sitP') || f === 'sitType') { const p = new THREE.Vector3(HERO_BED[0] + .42, RY + .95, RZ - .2); phoneL.position.copy(p).add(new THREE.Vector3(.25, .25, .5)); phoneL.intensity = (id === 'room1' && Math.abs(t - T.send) < .4 ? 4 : 2.4) * bk; phoneG.visible = true; phoneG.position.copy(p); phoneG.material.opacity = bk; phoneG.scale.setScalar(.45); }
      fill.position.set(RX + .5, RY + 2.0, RZ + 2.0); fill.intensity = id === 'room2' ? 1.2 : 1.0; fill.color.set(id === 'room2' ? '#ffc890' : '#7a94d0');
      const bp = new THREE.Vector3(RX + 1.8, RY, RZ + .9); place(bike, bp.x, bp.y, bp.z); bike.frame('idle0'); bike.face(cam, false);
      focusOn = hero.root.position.clone().add(new THREE.Vector3(0, .6, 0));
      if (id === 'ui0' && t > 21.2 && t < 29.4) focusOn = cam.position.clone().add(new THREE.Vector3(0, -1, -1.2));
      if (id === 'city0') { focusOn = new THREE.Vector3(RX, RY + 1, RZ + 2); tiltC = null; }
    }
    if (id === 'call') {
      const p = [RX + .6, RY, RZ - .2]; place(hero, ...p);
      const f = t < T.hangup ? (t > 309.1 && t < 313.1 ? 'ear' : blinkOr(t, Math.floor(t * 1.2) % 2 ? 'ear1' : 'ear', 'earDim')) : t < T.hangup + 1.2 ? 'earDim' : 'lookDim';
      hero.frame(f); hero.face(cam, false); showPhone(hero, false, bk * .9);
      fill.position.set(RX + 1, RY + 2, RZ + 2); fill.intensity = .8; fill.color.set('#9ab0e0');
      focusOn = hero.root.position.clone().add(new THREE.Vector3(0, .9, 0));
    }
    if (id === 'title') { focusOn = new THREE.Vector3(0, 0, -30); tiltC = .5; }
    if (id === 'stop741' || id === 'rain742' || id === 'pullback') {
      place(hero, STOP.x, 0, 3.75); place(bike, STOP.x - 1.8, 0, 3.9); bike.frame('idle0'); bike.face(cam, false);
      const f = id === 'stop741' ? (t < 41.6 ? blinkOr(t, idle(t), 'blink') : look2(t)) : id === 'rain742' ? (t < 46.6 ? 'lookUp' : look2(t)) : 'lookUp';
      hero.frame(f); hero.face(cam, false); if (f.startsWith('look') && f !== 'lookUp') showPhone(hero, false, bk);
      // two commuters wait at the stop
      [[STOP.x - 3.3, 4.2, 0], [STOP.x + 1.4, 4.0, 1]].forEach(([x, z, i]) => { const c = folk[i]; place(c, x, 0, z); c.frame(id === 'stop741' ? idle(t, i) : (i ? 'up' : 'cross')); c.face(cam, i === 1); });
      focusOn = id === 'pullback' ? new THREE.Vector3(STOP.x, 1, 3) : hero.root.position.clone().add(new THREE.Vector3(.8, 1.0, 0));
      fill.position.set(STOP.x + .5, 2, 6.5); fill.intensity = 1.2; fill.color.set('#c8d4f0');
    }
    if (id === 'ride') {
      place(hero, hx, 0, hz); hero.frame(ride4(t)); hero.face(cam, false);
      TR.position.x = -24; TR.userData.winM.emissiveIntensity = .3;
      // the late tram: passengers waiting; a kiosk; the café's early regulars
      for (let i = 0; i < 8; i++) { const c = folk[i]; place(c, -30 + i * 1.3, 0, 4.3 + (i % 2) * .4); c.frame(i % 3 ? idle(t, i) : look2(t, i)); c.face(cam, i % 2 === 0); }
      for (let i = 8; i < 11; i++) { const c = folk[i]; place(c, CAFE.x - 2 + (i - 8) * 1.5, 0, -4.4); c.frame(idle(t, i)); c.face(cam, i % 2 === 0); }
      focusOn = hero.root.position.clone().add(new THREE.Vector3(0, .8, 0));
      DUSTC.x = hx; DUSTC.z = 0; dust.visible = true; dust.userData.update(t);
    }
    if (id === 'noonUI') {
      const k = seg(t, 90.2, 93.6); const x = lerp(-14, -.4, k);
      if (k < 1) { place(hero, x, 0, -4.0); hero.frame(walk4(t)); }
      else { place(hero, -.4, 0, -4.0); hero.frame(t < 94.4 ? blinkOr(t, 'idle0', 'blink') : look2(t)); if (hero.cur.startsWith('look')) showPhone(hero, false, bk); }
      hero.face(cam, false);
      place(bike, -2.2, 0, -3.6); bike.frame('idle0'); bike.face(cam, false); if (k < 1) bike.root.visible = false;
      place(rosa, CAFE.x + 1.3, 0, -9.3); rosa.frame(idle(t)); rosa.face(cam, true);
      for (let i = 0; i < 4; i++) { const c = folk[12 + i], dir = i % 2 ? 1 : -1; place(c, (i * 9 - 12) + dir * (t - 90) * 1.1, 0, i % 2 ? 4.1 : -4.6); c.frame(walk4(t + i * .3, 7 + i)); c.face(cam, dir < 0); }
      focusOn = hero.root.position.clone().add(new THREE.Vector3(0, .9, 0));
      DUSTC.x = 0; DUSTC.z = 0; dust.visible = true; dust.userData.update(t);
    }
    if (id === 'cafe' || id === 'heater' || id === 'rewrite') {
      const HX = CAFE.x - 1.2, HZ = -7.0;
      // you
      place(hero, HX, 0, HZ);
      let hf;
      if (id === 'cafe') hf = (t > 103 && t < 105.6) || (t > 113.3 && t < 115.3) ? 'plead' : blinkOr(t, idle(t), 'blink', .4);
      else if (id === 'heater') hf = blinkOr(t, 'idle0', 'blink', .4);
      else hf = look2(t);
      hero.frame(hf); hero.face(cam, false); if (hf.startsWith('look')) showPhone(hero, false, bk);
      // Rosa: behind the counter, then to the heater to unplug it
      let rx = CAFE.x + 1.3, rz = -9.3, rf;
      if (t < 117.6) { rf = t > 107.6 && t < 110.6 ? (t < 109.2 ? 'talk' : 'shrug') : t > 117.1 && t < 117.6 ? 'talk' : blinkOr(t, Math.floor(t * 1.4) % 2 ? 'cross1' : 'cross', 'blink'); }
      else if (t < T.unplug) { const k = seg(t, 117.6, T.unplug); rx = lerp(CAFE.x + 1.3, CAFE.x + 2.7, k); rz = lerp(-9.3, -6.6, k); rf = walk4(t); }
      else if (t < T.heaterOff + .6) { rx = CAFE.x + 2.7; rz = -6.6; rf = 'reach'; }
      else if (t < T.heaterOff + 2.4) { const k = seg(t, T.heaterOff + .6, T.heaterOff + 2.4); rx = lerp(CAFE.x + 2.7, CAFE.x + 1.6, k); rz = lerp(-6.6, -9.2, k); rf = walk4(t); }
      else { rx = CAFE.x + 1.6; rz = -9.2; rf = blinkOr(t, Math.floor(t * 1.4) % 2 ? 'cross1' : 'cross', 'blink'); }
      place(rosa, rx, 0, rz); rosa.frame(rf); rosa.face(cam, t < 117.6 || t > T.heaterOff + .6);
      fill.position.set(CAFE.x, 2.2, -4.6); fill.intensity = 1.4; fill.color.set('#ffd8b0');
      focusOn = id === 'heater' ? new THREE.Vector3(CAFE.x + 3.6, .9, -6.4) : id === 'rewrite' ? hero.root.position.clone().add(new THREE.Vector3(0, .9, 0)) : new THREE.Vector3((HX + rx) / 2, 1, (HZ + rz) / 2);
      if (id === 'rewrite' && t > 132.3 && t < 141.6) focusOn = cam.position.clone().add(new THREE.Vector3(0, -1, -1.4));
    }
    if (id === 'lorenz') {
      place(hero, CAFE.x - 3.4, 0, -4.0); hero.frame(blinkOr(t, 'lookUp', 'blink')); hero.face(cam, false);
      place(bike, -2.2, 0, -3.6); bike.frame('idle0'); bike.face(cam, false);
      place(rosa, CAFE.x - 2.2, 0, -4.4); rosa.frame(blinkOr(t, idle(t), 'blink', 1)); rosa.face(cam, true);
      for (let i = 0; i < 10; i++) { const c = folk[12 + i], dir = i % 2 ? 1 : -1; place(c, (i * 8 - 40) + dir * (t - 141) * 1.0, 0, i % 2 ? 4.1 : -4.6); c.frame(walk4(t + i * .3, 7 + i % 3)); c.face(cam, dir < 0); }
      focusOn = hero.root.position.clone().add(new THREE.Vector3(0, .8, 0)); DUSTC.x = 0; DUSTC.z = -2; dust.visible = true; dust.userData.update(t);
    }
    if (id === 'spread') { dots.visible = true; dots.userData.update(t); focusOn = new THREE.Vector3(14, 0, -40); tiltC = .5; }
    if (id === 'queue' || id === 'bankwide' || id === 'shutter' || id === 'guilt') {
      // the queue along the north pavement, from the bank door eastwards; it grows during the shot
      const grow = id === 'queue' ? 34 + Math.floor(seg(t, 216, 237) * 10) : 46;
      for (let i = 0; i < folk.length; i++) {
        const c = folk[i]; if (i >= grow) continue;
        const x = BANK.x + 1.2 + i * .95 + (i % 3) * .12, z = -4.35 + (i % 2) * .32;
        place(c, id === 'shutter' && i < 8 ? BANK.x - 1.4 + i * .55 : x, 0, id === 'shutter' && i < 8 ? -3.6 + (i % 2) * .5 : z);
        let f = i % 4 === 0 ? 'ear' : i % 3 === 0 ? look2(t, i) : idle(t, i);
        if (id === 'shutter' && t > T.shutter) f = i % 2 ? 'up' : 'point';
        if (id === 'guilt') f = i % 2 ? 'cross' : 'up';
        c.frame(f); c.face(cam, true);
      }
      if (id === 'guilt' || id === 'bankwide') {
        place(hero, -6.4, 0, 3.9); hero.frame(id === 'guilt' ? (t < 279 ? look2(t) : 'lookDim') : look2(t)); hero.face(cam, false); showPhone(hero, false, bk * .9);
        place(bike, -8.2, 0, 4.1); bike.frame('idle0'); bike.face(cam, false);
      }
      fill.position.set(cam.position.x, 2.4, 3); fill.intensity = id === 'guilt' ? 1.4 : .8; fill.color.set('#d0d8f0');
      focusOn = id === 'guilt' ? hero.root.position.clone().add(new THREE.Vector3(0, 1, 0)) : id === 'shutter' ? new THREE.Vector3(BANK.x, 1.6, -5.2) : id === 'bankwide' ? new THREE.Vector3(BANK.x + 6, 1, -4.4) : new THREE.Vector3(look.x, 1.2, -4.2);
      if (id === 'guilt' && t > 270.8 && t < 278.8) focusOn = cam.position.clone().add(new THREE.Vector3(0, -1, -1.4));
      if (id === 'queue' || id === 'bankwide') { P0.position.set(BANK.x, 3.2, -3.0); P0.intensity = 4; }
    }
    if (id === 'cassandra') { focusOn = new THREE.Vector3(BR.x - 6, 0, -60); tiltC = .45; }
    if (id === 'cold') { focusOn = new THREE.Vector3(BR.x, 0, -67); tiltC = .5; }
    if (id === 'rideStorm') {
      place(hero, hx, 0, hz); hero.frame(ride4(t, 10)); hero.face(cam, true);
      hero.mesh.scale.x = -1;   // riding away from the camera-right: facing north
      fill.position.set(hx + 2.5, 2.2, hz + 1.5); fill.intensity = 1.6; fill.color.set('#a8c0e0');
      P0.position.set(BR.x + 5.2 - .8, 4.4, Math.round((hz) / 12) * 12); P0.intensity = 6;
      P1.position.set(hx + 1.5, 3.2, hz + 1.2); P1.intensity = 5; P1.color.set('#c8d8ff');
      focusOn = hero.root.position.clone().add(new THREE.Vector3(0, .9, 0));
    }
    const HP = [BR.x + .2, 0, -52.6];
    if (id === 'bridgehead' || id === 'seven03' || id === 'fall' || id === 'fallClose' || id === 'aftermath' || id === 'dawnAfter') {
      // cars approach and stop in front of you
      T.cars.forEach(([a, b], i) => { const c = cars[i], k = ss(seg(t, a, b)); if (t < a && id === 'bridgehead') return; c.visible = true; c.position.set(CAR[i].x, 0, lerp(CAR[i].z + 46, CAR[i].z, k)); });
      const lit = id !== 'dawnAfter';
      cars.forEach((c, i) => { if (!c.visible) return; const on = lit ? 1 : .2; c.userData.hl.color.setRGB(4 * on, 3.8 * on, 3.2 * on); c.userData.tl.color.setRGB(3, .3, .2);
        for (const s of [-1, 1]) { const g = headG[i * 2 + (s > 0 ? 1 : 0)]; g.visible = lit; g.position.set(c.position.x + s * .6, .58, c.position.z - 2.25); }
        if (i < 2 && lit) { headL[i].position.set(c.position.x, 1.0, c.position.z - 3.2); headL[i].intensity = 14; } });
      if (id === 'aftermath' || id === 'dawnAfter') cars.forEach((c, i) => { const blink = Math.floor(t * 1.6 + i) % 2 === 0 && id === 'aftermath'; c.userData.tl.color.setRGB(blink ? 5 : 1, blink ? 2.4 : .2, blink ? .2 : .1); });
      // barrier: on the pavement, then dragged across the lanes
      BAR.visible = true; const dk = ss(seg(t, T.drag, T.dragEnd));
      BAR.position.set(lerp(BR.x + 5.8, BR.x + .2, dk), 0, -55.0); BAR.rotation.y = lerp(Math.PI / 2, 0, dk); BAR.userData.mat.emissiveIntensity = lit ? .25 : 0;
      // you
      let f, px = HP[0], pz = HP[2];
      if (id === 'bridgehead') {
        if (t < T.arrive + 1.2) { const k = seg(t, 375, T.arrive + 1.2); px = BR.x + 3.4; pz = lerp(-46, -51.2, k); f = ride4(t, 10); }
        else if (t < T.drag) { px = BR.x + 4.6; pz = -52.4; f = 'idle0'; }
        else if (t < T.dragEnd) { const k = ss(seg(t, T.drag, T.dragEnd)); px = lerp(BR.x + 5.2, BR.x + .6, k); pz = -54.4; f = Math.floor(t * 4) % 2 ? 'drag1' : 'drag0'; }
        else if (t < T.stand) { const k = seg(t, T.dragEnd, T.stand); px = lerp(BR.x + .6, HP[0], k); pz = lerp(-54.4, HP[2], k); f = walk4(t); }
        else f = t > 399.3 && t < 402.4 ? (Math.floor(t * 3) % 2 ? 'up' : 'up2') : (Math.floor(t * 1.2) % 2 ? 'up2' : 'up');
        if (bat < .1 && f.startsWith('up')) f = f === 'up' ? 'upDim' : 'upDim2';
      } else if (id === 'seven03') f = Math.floor(t * 1.1) % 2 ? 'upDim2' : 'upDim';
      else if (id === 'fall' || id === 'fallClose') f = t < T.dead ? (Math.floor(t * 1.1) % 2 ? 'upDim2' : 'upDim') : 'upDead';
      else if (id === 'aftermath') { px = BR.x + 4.9; pz = -52.3; f = t > 440.6 && t < 445 ? 'sitDead' : 'slump'; }
      else { px = BR.x + 4.9; pz = -52.3; f = t > 458.6 ? 'sitDawn' : 'sitDead'; }
      place(hero, px, f.startsWith('sit') || f === 'slump' ? .14 : 0, pz); hero.frame(f); hero.face(cam, id === 'bridgehead' && t < T.arrive + 1.2 ? true : false, id === 'fall' || id === 'fallClose' || id === 'dawnAfter' ? .35 : 0);
      if (id === 'bridgehead' && t < T.arrive + 1.2) hero.mesh.scale.x = -1;
      const bkOn = t > T.arrive + 1.2 || id !== 'bridgehead';
      if (bkOn) { place(bike, BR.x + 5.9, 0, -51.2); bike.frame('idle0'); bike.face(cam, false); }
      // the carried light
      if (f.startsWith('up') && f !== 'upDead') showPhone(hero, false, Math.max(.15, bat / .1) * .9);
      if (id === 'dawnAfter' && f === 'sitDawn') { const p = hero.root.position.clone().add(new THREE.Vector3(.4, .75, 0)); phoneG.visible = true; phoneG.position.copy(p); phoneG.material.opacity = .7; phoneG.scale.setScalar(.35); }
      // bystanders after the fall; the driver comes over
      if (id === 'aftermath' || id === 'dawnAfter') {
        for (let i = 0; i < 7; i++) { const c = folk[i]; place(c, BR.x - 3.4 + i * 1.1, 0, -57.5 - (i % 2) * .6); c.frame(i % 3 === 0 ? look2(t, i) : i % 3 === 1 ? 'cross' : idle(t, i)); c.face(cam, i % 2 === 0, id === 'dawnAfter' ? .35 : 0); }
        const dk2 = seg(t, 436, 440.4); place(driver, lerp(BR.x - 2.2, BR.x + 3.7, dk2), 0, lerp(-47.0, -52.0, dk2)); driver.frame(id === 'aftermath' ? (dk2 < 1 ? walk4(t) : t < 446 ? 'point' : idle(t)) : idle(t)); driver.face(cam, false, id === 'dawnAfter' ? .35 : 0);
      }
      fill.position.set(px + 1.5, 2.2, pz + 3); fill.intensity = id === 'dawnAfter' ? 0 : 1.6; fill.color.set('#c0d0ff');
      P0.position.set(BR.x - 4.6, 5.2, -60); P0.intensity = id === 'dawnAfter' ? 0 : 7; P1.position.set(BR.x + 5.2, 4.4, -48); P1.intensity = id === 'dawnAfter' ? 0 : 6;
      if (id === 'fallClose') { P1.position.set(BR.x + 10, 7, -67); P1.intensity = 10; }   // an embankment lamp lights the falling span
      focusOn = id === 'fall' ? new THREE.Vector3(BR.x, 0, -64) : id === 'fallClose' ? new THREE.Vector3(BR.x, -1.5, -70) : hero.root.position.clone().add(new THREE.Vector3(0, .9, 0));
      if (id === 'fall') tiltC = .5;
      if (id === 'fallClose') tiltC = .52;
    }
    // lightning makes everything flash
    if (fl > 0) { hemi.intensity += 0; }

    cam.updateProjectionMatrix();
    const fo = focusOn || look || new THREE.Vector3();
    post.dof.focus = cam.position.distanceTo(fo);
    const far = ['city0', 'title', 'spread', 'cassandra', 'fall', 'cold', 'dawnAfter', 'lorenz', 'pullback', 'bankwide'].includes(id);
    post.dof.aper = far ? 420 : 260; post.dof.maxCoc = far ? 20 : 16;
    if (id === 'ui0' || id === 'rewrite' || id === 'guilt') post.dof.aper = 300;
    if (id === 'heater' || id === 'seven03') { post.dof.aper = 110; post.dof.maxCoc = 10; }
    post.bloom.strength = night ? .75 : .45; post.bloom.threshold = night ? .78 : .9;
    post.vig.uniforms.warm.value = id === 'cafe' || id === 'heater' ? .2 : id === 'dawnAfter' ? .22 : night ? .02 : .1;
    post.vig.uniforms.amt.value = night ? .7 : .55;
    const tc = tiltC != null ? tiltC : null;
    return { tiltC: tc, track: tc == null ? fo : null, tiltW: id === 'heater' || id === 'seven03' ? .2 : id === 'cafe' || id === 'call' ? .11 : null, band: id === 'dawnAfter' ? 1 - ss(seg(t, 469, 479)) * .6 : 1 };
  }
  return { scene, update, hero };
}
