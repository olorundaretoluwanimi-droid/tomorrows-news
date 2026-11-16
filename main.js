// Tomorrow's News — page contract: window.DUR, window.render(t), window.READY, window.TEXTS, window.EV
import * as THREE from 'three';
import { makePost } from './post_ts.js';
import { DUR, SHOTS, shotAt, VO, T, PHONE, CHIPS } from './story.js';
import { buildCity } from './city.js';
import { drawOverlay, overlayReady } from './ui.js';

const W = 1920, H = 1080, Q = new URLSearchParams(location.search);
const SS = +(Q.get('ss') ?? 1);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
const camera = new THREE.PerspectiveCamera(32, W / H, .3, 2000);
const city = buildCity();
const post = makePost(renderer, city.scene, camera, W, H, { ssaa: SS });
const V = post.vig.uniforms;
if (Q.has('nobloom')) post.bloom.enabled = false;
await overlayReady();

const TILT = !Q.has('notilt');
const _v = new THREE.Vector3();
window.DUR = DUR;
window.render = t => {
  const shot = shotAt(t);
  if (shot.id !== 'dark') {
    post.dof.scene = city.scene;
    V.fade.value = 1; V.warm.value = .1; V.sat.value = 1.05; V.amt.value = .6; V.contrast.value = .2;
    post.bloom.radius = .7;
    const r = city.update(t, shot, camera, post, renderer) || {};
    if (TILT) {
      let c = r.tiltC;
      if (c == null && r.track) { camera.updateMatrixWorld(); _v.copy(r.track).project(camera); c = Math.min(.8, Math.max(.2, _v.y * .5 + .5)); }
      post.dof.tiltAmt = r.tiltAmt ?? 17; post.dof.tiltC = c ?? .45; post.dof.tiltW = (r.tiltW ?? .075) * (r.band ?? 1); post.dof.tiltF = .3;
      post.dof.maxCoc = Math.max(post.dof.maxCoc, 22); V.sat.value *= 1.12; V.contrast.value = .26;
    }
    post.composer.render();
  } else { renderer.setRenderTarget(null); renderer.setClearColor('#000'); renderer.clear(); }
  drawOverlay(t);
};
window.TEXTS = t => drawOverlay(t);   // 2D only: cheap
// Sound events for the mixer (exported by events.mjs)
const typed = [];
for (const P of PHONE) for (const [t0, text, , re, alt] of P.items) { typed.push({ t: t0, type: 'type', n: text.length }); if (re != null) typed.push({ t: re, type: 'type', n: alt.length }); }
window.EV = [
  ...VO.map(v => ({ t: v.t, type: 'voice', id: v.id, dlg: !!v.dlg, sub: v.sub, who: v.who })),
  ...VO.filter(v => v.dlg).map(v => ({ t: v.t - .45, type: 'chime' })),
  ...PHONE.map(P => ({ t: P.a, type: 'notify' })), ...CHIPS.map(c => ({ t: c.a, type: 'tick' })), ...typed,
  ...PHONE.filter(P => P.items.some(i => i[2] != null)).map(P => ({ t: P.items.find(i => i[2] != null)[2], type: 'strike' })),
  { t: T.midnight, type: 'buzz' }, { t: T.flip742, type: 'flip' }, { t: T.flip742, type: 'rainStart' },
  { t: T.cafeIn, type: 'doorbell' }, { t: T.heaterOff, type: 'unplug' }, { t: T.twoTen, type: 'flip' },
  { t: T.send, type: 'send' }, { t: T.spread0, type: 'spread' }, { t: T.shutter, type: 'shutter' },
  { t: 303.4, type: 'dial' }, { t: T.hangup, type: 'hangup' },
  ...T.flashes.map(f => ({ t: f, type: 'thunder' })), ...T.horn.map(h => ({ t: h, type: 'horn' })),
  ...T.cars.map(([a, b]) => ({ t: a, type: 'carIn', b })),
  { t: T.arrive + 1.1, type: 'bikeDrop' }, { t: T.drag, type: 'drag', b: T.dragEnd },
  { t: T.fall, type: 'fall' }, { t: T.splash, type: 'splash' }, { t: T.dead, type: 'dead' },
  { t: 458.6, type: 'boot' },
];
window.READY = true;
