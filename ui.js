// 2D overlay: chapter cards, title, the phone's news window, status chips, dialogue boxes, narration subtitles, fades.
// Also reports on-screen text for readcheck (window.TEXTS).
import { VO, CHAPTERS, T, DUR, PHONE, CHIPS, COLD, COLD_PHONE } from './story.js';

const cv = document.getElementById('ov'), g = cv.getContext('2d');
const W = 1920, H = 1080;
let DURS = {};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const SILVER = '#cfd6de', SILVER_D = 'rgba(190,200,212,', PAPER = '#f4f1ea';

export async function overlayReady() {
  await Promise.all(['500 40px Cinzel', '700 40px Cinzel', 'italic 500 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '500 40px "Cormorant Garamond"'].map(f => document.fonts.load(f)));
  DURS = await (await fetch('voices/dur.json')).json();
}
const dur = v => DURS[v.id] || 3;

function ornament(cx, y, w, a, col = '#cfd6de') {
  g.save(); g.globalAlpha = a; g.fillStyle = col; g.lineWidth = 1.5;
  for (const s of [-1, 1]) {
    const gr = g.createLinearGradient(cx, 0, cx + s * w, 0); gr.addColorStop(0, SILVER_D + '1)'); gr.addColorStop(1, SILVER_D + '0)');
    g.strokeStyle = gr; g.beginPath(); g.moveTo(cx + s * 16, y); g.lineTo(cx + s * w, y); g.stroke();
    g.beginPath(); g.arc(cx + s * 26, y, 2.5, 0, 7); g.fill();
  }
  g.strokeStyle = col; g.beginPath(); g.moveTo(cx, y - 8); g.lineTo(cx + 8, y); g.lineTo(cx, y + 8); g.lineTo(cx - 8, y); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(cx, y - 3.5); g.lineTo(cx + 3.5, y); g.lineTo(cx, y + 3.5); g.lineTo(cx - 3.5, y); g.closePath(); g.fill();
  g.restore();
}
function spaced(text, x, y, sp) {
  const ws = [...text].map(c => g.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let cx = x - tot / 2; [...text].forEach((c, i) => { g.fillText(c, cx + ws[i] / 2, y); cx += ws[i] + sp; });
  return tot;
}
function spacedLeft(text, x, y, sp) { const ws = [...text].map(c => g.measureText(c).width); let cx = x; [...text].forEach((c, i) => { g.fillText(c, cx, y); cx += ws[i] + sp; }); return cx - x; }
function glowText(fn, col, blur) { g.save(); g.shadowColor = col; g.shadowBlur = blur; fn(); g.restore(); fn(); }
function corners(x, y, w, h, col) { for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) { g.fillStyle = col; g.beginPath(); g.moveTo(cx, cy - 7); g.lineTo(cx + 7, cy); g.lineTo(cx, cy + 7); g.lineTo(cx - 7, cy); g.fill(); } }

// —— Chapter card ——
const CH_LEN = 5.0;
function chapter(t, c) {
  const a0 = ss(seg(t, c.t, c.t + .6)), a1 = ss(seg(t, c.t + .35, c.t + 1.0)), out = 1 - ss(seg(t, c.t + CH_LEN - .6, c.t + CH_LEN));
  if (t < c.t || t > c.t + CH_LEN) return null;
  g.save();
  const band = g.createLinearGradient(0, 120, 0, 380); band.addColorStop(0, 'rgba(4,6,12,0)'); band.addColorStop(.5, `rgba(4,6,12,${.55 * a0 * out})`); band.addColorStop(1, 'rgba(4,6,12,0)');
  g.fillStyle = band; g.fillRect(0, 120, W, 260);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = a0 * out; g.fillStyle = '#d6dde6'; g.font = '500 32px Cinzel'; spaced('CHAPTER  ' + c.n, W / 2, 196, 10);
  ornament(W / 2, 236, 220 * (.4 + .6 * a0), a0 * out);
  g.globalAlpha = a1 * out; g.fillStyle = PAPER; g.font = 'italic 500 70px "Cormorant Garamond"';
  glowText(() => g.fillText(c.name, W / 2, 300 - (1 - a1) * 10), 'rgba(140,200,255,.35)', 22);
  g.restore();
  return { id: 'ch' + c.n, text: 'CHAPTER ' + c.n + ' ' + c.name, x0: 560, y0: 170, x1: 1360, y1: 340 };
}

// —— Title card (opening: two lines) and end title ——
function titleCard(t, a, b, lines, sub, size) {
  const ain = ss(seg(t, a, a + 1.1)), out = 1 - ss(seg(t, b - .7, b));
  if (t < a || t > b) return null;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = ain * out * .5; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.globalAlpha = ain * out; g.font = `700 ${size}px Cinzel`;
  const y0 = 470 - (lines.length - 1) * size * .62;
  lines.forEach((L, i) => { const y = y0 + i * size * 1.24, gr = g.createLinearGradient(0, y - size / 2, 0, y + size / 2); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.55, '#cfe4f4'); gr.addColorStop(1, '#8aa6c0'); g.fillStyle = gr; glowText(() => spaced(L, W / 2, y, size * .1), 'rgba(140,210,255,.5)', 36); });
  const oy = y0 + (lines.length - 1) * size * 1.24 + size * .85;
  ornament(W / 2, oy, 330 * (.3 + .7 * ain), ain * out);
  const bA = ss(seg(t, a + .6, a + 1.4));
  if (sub) { g.globalAlpha = bA * out; g.font = 'italic 500 50px "Cormorant Garamond"'; g.fillStyle = PAPER; g.fillText(sub, W / 2, oy + 68); }
  g.restore();
  return [{ id: 'title' + a, text: lines.join(' ') + ' ' + (sub || ''), x0: 260, y0: y0 - size, x1: 1660, y1: oy + 100 }];
}

// —— The phone: a framed news window, typed headlines, struck out and retyped when tomorrow changes ——
function battIcon(x, y, pct, a) {
  g.save(); g.globalAlpha = a; g.strokeStyle = SILVER; g.lineWidth = 2; g.strokeRect(x, y, 46, 22); g.fillStyle = SILVER; g.fillRect(x + 46, y + 7, 4, 8);
  const low = pct <= 10; g.fillStyle = low ? '#ff5a3a' : '#9ae0ff'; g.fillRect(x + 4, y + 4, Math.max(2, 38 * pct / 100), 14);
  g.font = '600 26px "Cormorant Garamond"'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillStyle = low ? '#ff8a6a' : '#dfe8f0'; g.fillText(pct + '%', x - 10, y + 12);
  g.restore();
}
const PH_S = 1.5;   // headline panel scale: drawn in its 1060-px layout, shown 1.5× (1590 px wide, 57-px headlines)
function phoneWindow(t, P) {
  const al = ss(seg(t, P.a, P.a + .35)) * (1 - ss(seg(t, P.b - .35, P.b)));
  if (al <= 0) return null;
  const bw = 1060, bh = 120 + P.items.length * 82, x = 0, y = 0;
  const X0 = (W - bw * PH_S) / 2, Y0 = 196 + (1 - al) * 16;
  g.save(); g.translate(X0, Y0); g.scale(PH_S, PH_S); g.globalAlpha = al;
  const bgr = g.createLinearGradient(0, y, 0, y + bh); bgr.addColorStop(0, 'rgba(10,16,24,.9)'); bgr.addColorStop(1, 'rgba(6,8,14,.93)');
  g.fillStyle = bgr; g.fillRect(x, y, bw, bh);
  g.strokeStyle = SILVER_D + '.9)'; g.lineWidth = 2; g.strokeRect(x + .5, y + .5, bw - 1, bh - 1);
  g.strokeStyle = SILVER_D + '.3)'; g.lineWidth = 1; g.strokeRect(x + 7.5, y + 7.5, bw - 15, bh - 15);
  corners(x, y, bw, bh, '#dbe2ea');
  // header
  g.textBaseline = 'middle'; g.textAlign = 'left'; g.font = '500 26px Cinzel'; g.fillStyle = '#aebccc'; spacedLeft('NORTHGATE  NEWS', x + 40, y + 46, 4);
  g.font = '700 28px Cinzel'; g.fillStyle = '#f0e6c8'; const dw = spacedLeft(P.date, x + 430, y + 46, 3);
  const tagCol = P.tag === 'TODAY' ? '#8ae0a8' : '#ff9a6a';
  g.font = '600 20px Cinzel'; const tw = g.measureText(P.tag).width + 24; g.strokeStyle = tagCol; g.lineWidth = 1.5; g.strokeRect(x + 454 + dw, y + 32, tw + 8, 28); g.fillStyle = tagCol; spacedLeft(P.tag, x + 466 + dw, y + 47, 2);
  g.font = '600 28px "Cormorant Garamond"'; g.fillStyle = '#dfe8f0'; g.textAlign = 'right'; g.fillText(P.time, x + bw - 170, y + 46);
  battIcon(x + bw - 100, y + 35, P.bat, al);
  g.globalAlpha = al; g.strokeStyle = SILVER_D + '.35)'; g.beginPath(); g.moveTo(x + 32, y + 82); g.lineTo(x + bw - 32, y + 82); g.stroke();
  const texts = [{ id: 'ph' + P.a, text: 'NORTHGATE NEWS ' + P.date + ' ' + P.tag + ' ' + P.time, x0: x, y0: y, x1: x + bw, y1: y + 82 }];
  // items
  P.items.forEach(([t0, text, strike, re, alt], i) => {
    if (t < t0) return;
    const iy = y + 128 + i * 82; g.textAlign = 'left'; g.font = '600 38px Cinzel';
    const CPS = 34; let s = text, n = Math.floor((t - t0) * CPS), struck = 0, retyped = null;
    if (strike != null && t >= strike) struck = ss(seg(t, strike, strike + .5));
    if (re != null && t >= re) { retyped = alt; n = Math.floor((t - re) * CPS); }
    // bullet
    g.fillStyle = retyped ? '#8ae0a8' : '#9ad8ff'; g.fillRect(x + 44, iy - 6, 10, 10);
    if (retyped == null) {
      const shown = s.slice(0, Math.max(0, n)); g.fillStyle = struck ? `rgba(244,241,234,${1 - struck * .55})` : PAPER; const w = spacedLeft(shown, x + 74, iy, 1.5);
      if (n < s.length && Math.floor(t * 4) % 2 === 0) { g.fillStyle = '#9ad8ff'; g.fillRect(x + 76 + w, iy - 18, 3, 34); }
      if (struck) { g.strokeStyle = '#ff6a4a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 70, iy); g.lineTo(x + 70 + (w + 8) * struck, iy); g.stroke(); }
      texts.push({ id: 'ph' + P.a + '_' + i, text, x0: x + 60, y0: iy - 30, x1: x + bw - 30, y1: iy + 30 });
    } else {
      const shown = retyped.slice(0, Math.max(0, n)); g.fillStyle = '#eaffef'; const w = spacedLeft(shown, x + 74, iy, 1.5);
      if (n < retyped.length && Math.floor(t * 4) % 2 === 0) { g.fillStyle = '#8ae0a8'; g.fillRect(x + 76 + w, iy - 18, 3, 34); }
      texts.push({ id: 'ph' + P.a + '_' + i + 'r', text: retyped, x0: x + 60, y0: iy - 30, x1: x + bw - 30, y1: iy + 30 });
    }
  });
  g.restore();
  // text boxes back to screen pixels (readcheck)
  return texts.map(b => ({ ...b, x0: X0 + b.x0 * PH_S, y0: Y0 + b.y0 * PH_S, x1: X0 + b.x1 * PH_S, y1: Y0 + b.y1 * PH_S }));
}
function chip(t, c) {
  const al = ss(seg(t, c.a, c.a + .3)) * (1 - ss(seg(t, c.b - .3, c.b)));
  if (al <= 0) return null;
  const x = W - 380, y = 64, bw = 316, bh = 62;
  g.save(); g.globalAlpha = al; g.fillStyle = 'rgba(8,12,18,.86)'; g.fillRect(x, y, bw, bh); g.strokeStyle = SILVER_D + '.85)'; g.lineWidth = 1.5; g.strokeRect(x + .5, y + .5, bw - 1, bh - 1);
  corners(x, y, bw, bh, '#dbe2ea');
  g.font = '700 30px Cinzel'; g.fillStyle = '#f0e6c8'; g.textAlign = 'left'; g.textBaseline = 'middle'; spacedLeft(c.time, x + 26, y + bh / 2 + 1, 2);
  g.restore(); battIcon(x + bw - 80, y + 20, c.bat, al);
  return { id: 'chip' + c.a, text: c.time + ' ' + c.bat + '%', x0: x, y0: y, x1: x + bw, y1: y + bh };
}

// —— Dialogue box ——
function wrap(text, maxW) { const words = text.split(' '), lines = []; let cur = ''; for (const w of words) { const n = cur ? cur + ' ' + w : w; if (g.measureText(n).width > maxW && cur) { lines.push(cur); cur = w; } else cur = n; } if (cur) lines.push(cur); return lines; }
const dlgSpan = v => [v.t - .45, Math.max(v.t + dur(v) + 1.6, v.t + (v.who.length + 1 + v.sub.length) / 15 + 1.6)];   // long enough to read (readcheck)
function dialog(t, v) {
  const [a, b] = dlgSpan(v), al = ss(seg(t, a, a + .35)) * (1 - ss(seg(t, b - .35, b)));
  if (al <= 0) return null;
  const bw = 1180, bh = 210, x = (W - bw) / 2, y = H - bh - 58 + (1 - al) * 14;
  g.save(); g.globalAlpha = al;
  const bgr = g.createLinearGradient(0, y, 0, y + bh); bgr.addColorStop(0, 'rgba(12,16,22,.86)'); bgr.addColorStop(1, 'rgba(6,8,12,.9)');
  g.fillStyle = bgr; g.fillRect(x, y, bw, bh);
  g.strokeStyle = SILVER_D + '.9)'; g.lineWidth = 2; g.strokeRect(x + .5, y + .5, bw - 1, bh - 1);
  g.strokeStyle = SILVER_D + '.35)'; g.lineWidth = 1; g.strokeRect(x + 7.5, y + 7.5, bw - 15, bh - 15);
  corners(x, y, bw, bh, '#dbe2ea');
  g.font = '600 34px "Cormorant Garamond"'; const nw = g.measureText(v.who).width + 56;
  g.fillStyle = 'rgba(10,12,18,.96)'; g.fillRect(x + 36, y - 26, nw, 50); g.strokeStyle = SILVER_D + '.9)'; g.lineWidth = 1.5; g.strokeRect(x + 36.5, y - 25.5, nw - 1, 49);
  g.fillStyle = v.who === 'You' ? '#ffb070' : '#e2e8ee'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(v.who, x + 64, y - 1);
  g.font = '500 46px "Cormorant Garamond"'; g.fillStyle = PAPER;
  const n = v.sub.length, shown = Math.floor(n * clamp((t - v.t + .05) / (dur(v) * .9)));
  const lines = wrap(v.sub, bw - 150); let k = shown;
  lines.forEach((L, i) => { const s = L.slice(0, Math.max(0, k)); k -= L.length + 1; g.fillText(s, x + 72, y + 80 + i * 60); });
  if (shown >= n && Math.floor(t * 2.5) % 2 === 0) { g.fillStyle = '#dbe2ea'; const tx = x + bw - 56, ty = y + bh - 38; g.beginPath(); g.moveTo(tx - 9, ty - 5); g.lineTo(tx + 9, ty - 5); g.lineTo(tx, ty + 6); g.fill(); }
  g.restore();
  return { id: v.id, text: v.who + ' ' + v.sub, x0: x, y0: y - 26, x1: x + bw, y1: y + bh };
}

// —— Narration subtitle (two lines for long clips) ——
const NARR = VO.filter(v => !v.dlg).sort((a, b) => a.t - b.t);
export const subSpan = v => { const nx = VO.filter(w => w.t > v.t).sort((a, b) => a.t - b.t)[0]; return [v.t - .35, Math.min(v.t + dur(v) + .7, nx ? nx.t - .4 : 1e9)]; };
function subtitle(t, v) {
  const [a, b] = subSpan(v), al = ss(seg(t, a, a + .3)) * (1 - ss(seg(t, b - .35, b)));
  if (al <= 0) return null;
  g.save(); g.globalAlpha = al; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = 'italic 500 50px "Cormorant Garamond"';
  const lines = g.measureText(v.sub).width > 1500 ? wrap(v.sub, 1300) : [v.sub];
  const y1 = H - 84, y0 = y1 - (lines.length - 1) * 58, tw = Math.max(...lines.map(L => g.measureText(L).width));
  const sh = g.createLinearGradient(0, y0 - 70, 0, y1 + 40); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(.5, 'rgba(0,0,0,.42)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh; g.fillRect(W / 2 - tw / 2 - 160, y0 - 70, tw + 320, y1 - y0 + 110);
  g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 10; g.shadowOffsetY = 2; g.fillStyle = PAPER;
  lines.forEach((L, i) => g.fillText(L, W / 2, y0 + i * 58));
  g.restore();
  return { id: v.id, text: v.sub, x0: W / 2 - tw / 2, y0: y0 - 50, x1: W / 2 + tw / 2, y1: y1 + 14 };
}

// —— Fades: dips to black between chapters, the dark after the fall, the end ——
const FADES = [[30, .4, .5], [36, .35, .45], [90, .35, .45], [171, .4, .5], [288, .4, .5], [354, .35, .45], [453, .5, .9]];
function blackout(t) {
  let a = 1 - ss(seg(t, 0, 1.2));
  for (const [c, o, i] of FADES) { if (t < c && t > c - o) a = Math.max(a, ss((t - (c - o)) / o)); if (t >= c && t < c + i) a = Math.max(a, 1 - ss((t - c) / i)); }
  a = Math.max(a, ss(seg(t, DUR - 1.0, DUR - .05)));
  if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); }
}

// —— Cold open (film time 0..COLD): the bridge headline types in over the storm, then a dip to black ——
export function drawCold(t) {
  g.clearRect(0, 0, W, H);
  const texts = phoneWindow(t, COLD_PHONE) || [];
  const a = Math.max(1 - ss(seg(t, 0, .9)), ss(seg(t, COLD - .6, COLD - .02)));
  if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); }
  return texts;
}

export function drawOverlay(t) {
  g.clearRect(0, 0, W, H);
  const texts = [];
  for (const c of CHAPTERS) { const r = chapter(t, c); if (r) texts.push(r); }
  const tc = titleCard(t, T.titleIn, T.titleOut, ['WHAT IF YOUR PHONE', 'SHOWED TOMORROW’S NEWS?'], null, 92); if (tc) texts.push(...tc);
  const te = titleCard(t, T.endTitle, DUR - .3, ['TOMORROW’S NEWS'], 'What you do with what you know.', 104); if (te) texts.push(...te);
  for (const P of PHONE) { const r = phoneWindow(t, P); if (r) texts.push(...r); }
  for (const c of CHIPS) { const r = chip(t, c); if (r) texts.push(r); }
  for (const v of VO) { if (v.dlg) { const r = dialog(t, v); if (r) texts.push(r); } else subtitle(t, v); }   // narration subtitles follow the voice (not read-checked)
  blackout(t);
  return texts;
}
