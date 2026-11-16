# Mix: score (out/score.wav) + ambience beds per place + event foley + voices → out/mix.wav
# Reads events.json (export with: node core/render/events.mjs <project>) for voice and event times.
# Usage: <LIB>/.venv/bin/python mix.py
import sys, os, json, numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *

E = json.load(open(os.path.join(HERE, 'events.json')))
DUR = E['dur']; EV = E['ev']; N = int(DUR * SR); tt = np.arange(N) / SR
rng = np.random.default_rng(13)
def curve(keys): k = np.array(keys, float); return np.interp(tt, k[:, 0], k[:, 1])
def stereo(x, pan=0.0): l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.414, x * r * 1.414], 1)
def place(buf, x, t, pan=0.0, g=1.0):
    s = int(t * SR); x = stereo(x, pan) if x.ndim == 1 else x
    if s >= len(buf) or s < 0: return
    n = min(len(x), len(buf) - s); buf[s:s + n] += x[:n] * g
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
def full(fn): return fn(DUR)[:N]
def gate(*spans, fi=.5, fo=.5):
    """0..1 envelope that is 1 inside the given (a, b) spans, with fades."""
    g = np.zeros(N)
    for a, b in spans: g = np.maximum(g, np.clip(np.minimum((tt - a) / fi + 1, (b - tt) / fo + 1), 0, 1))
    return g

# —— Ambience beds ——
NZ = full(noise); BR = full(brown)
# rain on glass / roofs (night city, rooms), heavy storm
rainLight = hp(bp(NZ, 1200, 9000), 900) * (.7 + .3 * np.abs(np.sin(2 * np.pi * .21 * tt)))
drops = np.zeros(N); idx = rng.integers(0, N, 26000); drops[idx] = rng.uniform(.2, 1, len(idx)) ** 3; drops = bp(drops, 1500, 7000) * 3
storm = bp(NZ, 300, 6000) * .8 + lp(BR, 300) * .6 * (.6 + .4 * np.sin(2 * np.pi * .07 * tt) ** 2)
wind = bp(np.roll(NZ, 7777), 120, 700) * (.4 + .6 * np.sin(2 * np.pi * .11 * tt) ** 2)
g_rainNight = gate((0, 30), fi=1.2, fo=.6) * .55
g_rainDay = gate((45, 70), fi=.6, fo=3)
g_stormRoom = gate((288, 330), fi=.6, fo=.5) * np.clip((tt - 288) / 15, .35, 1)
g_storm = gate((330, 432), fi=.5, fo=.1) + gate((432, 453), fi=.1, fo=2) * .55
# city traffic (distant hum + passing cars), morning birds, noon murmur
traffic = lp(BR, 220) * .8 + bp(np.roll(NZ, 1234), 200, 1200) * .25 * (.5 + .5 * np.sin(2 * np.pi * .05 * tt) ** 2)
birds = np.zeros(N)
for k in range(260):
    t0 = rng.uniform(0, DUR); f0 = rng.uniform(2600, 4300); d = rng.uniform(.06, .16); n = int(d * SR); x = np.arange(n) / SR
    ch = np.sin(2 * np.pi * np.cumsum(f0 * (1 + .35 * np.sin(2 * np.pi * rng.uniform(15, 30) * x))) / SR) * np.sin(np.pi * x / d) ** 2
    s = int(t0 * SR); birds[s:s + n] += ch[:max(0, min(n, N - s))] * rng.uniform(.2, .6)
def babble(seed, voices=10):
    r = np.random.default_rng(seed); out = np.zeros(N)
    for v in range(voices):
        f = r.uniform(250, 700); am = (np.sin(2 * np.pi * r.uniform(3, 6) * tt + r.uniform(0, 6)) > r.uniform(-.2, .4)).astype(float)
        am = uniform_filter1d(am, int(.03 * SR)) * (np.sin(2 * np.pi * r.uniform(.05, .2) * tt + v) > -.3)
        out += bp(np.roll(NZ, int(r.integers(0, N))), f * .7, f * 2.6) * am
    return out / voices
crowd = babble(3, 14)
g_traffic = gate((0, 30), fi=1, fo=.6) * .3 + gate((36, 102), fi=.5, fo=.5) * .8 + gate((141, 171), fi=1, fo=.5) * .8 + gate((216, 288), fi=.5, fo=.5) * .6 + gate((171, 189)) * .25
g_birds = gate((36, 45), fo=1.5) * .8 + gate((66, 102), fi=3) * .7 + gate((141, 171)) * .5 + gate((216, 288)) * .6 + gate((453, 480), fi=2) * .9
g_crowd = gate((90, 102)) * .3 + gate((141, 171)) * .35 + gate((216, 267.05), fi=1, fo=.02) * np.clip((tt - 210) / 50, .35, 1.0) + gate((267.05, 288), fi=.02) * .5
# café room tone + espresso hiss + heater hum (stops when unplugged)
cafeTone = lp(BR, 400) * .4 + bp(np.roll(NZ, 4242), 400, 2000) * .08
hiss = hp(np.roll(NZ, 999), 3000) * (np.sin(2 * np.pi * .03 * tt) > .7)
hum = (np.sin(2 * np.pi * 100 * tt) + .4 * np.sin(2 * np.pi * 200 * tt) + .2 * np.sin(2 * np.pi * 300 * tt)) * .3
g_cafe = gate((102, 141), fi=.4, fo=.4)
g_hum = gate((102, 120.0), fi=.4, fo=.03) * g_cafe
# overhead: high wind; river; gulls at dawn
hiwind = bp(np.roll(NZ, 31337), 200, 1500) * (.5 + .5 * np.sin(2 * np.pi * .09 * tt) ** 2)
g_hiw = gate((189, 216), fi=.8, fo=.6)
river = bp(np.roll(NZ, 2718), 180, 1400) * (.7 + .3 * np.sin(2 * np.pi * .3 * tt))
g_river = gate((375, 432), fi=1, fo=.1) * 1.0 + gate((435, 480), fi=2) * .6
gulls = np.zeros(N)
for k in range(24):
    t0 = rng.uniform(454, 478); d = rng.uniform(.35, .7); n = int(d * SR); x = np.arange(n) / SR; f = 1500 * (1 - .35 * x / d) + 200 * np.sin(2 * np.pi * 9 * x)
    ch = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * x / d) ** 2; s = int(t0 * SR); gulls[s:s + n] += lp(ch, 3000)[:max(0, min(n, N - s))] * rng.uniform(.1, .3)
amb = (stereo((rainLight + drops) * (g_rainNight + g_rainDay * 1.2 + g_stormRoom * .6), 0) + stereo(np.roll(rainLight, 3001) * (g_rainNight + g_rainDay), .4)
       + stereo(storm * g_storm, -.25) + stereo(np.roll(storm, 5001) * g_storm, .25) + stereo(wind * (g_storm + g_stormRoom * .4), 0)
       + stereo(traffic * g_traffic, -.2) + stereo(np.roll(traffic, 8001) * g_traffic, .2)
       + stereo(birds * g_birds, -.3) + stereo(np.roll(birds, 9001) * g_birds, .35)
       + stereo(crowd * g_crowd, -.3) + stereo(np.roll(crowd, 7001) * g_crowd, .3)
       + stereo((cafeTone + hiss * .3) * g_cafe, 0) + stereo(hum * g_hum * .25, .3)
       + stereo(hiwind * g_hiw, 0) + stereo(river * g_river, -.15) + stereo(np.roll(river, 6007) * g_river, .2) + stereo(gulls, .2))

# —— Foley ——
fx = np.zeros((N, 2))
def tone(f, d, tau, v=1.0, h=((1, 1),)):
    x = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * m * x) for m, a in h) * np.exp(-x / tau) * np.minimum(1, x / .004)) * v
def ping(v=1.0, f=1568): return tone(f, .5, .14, v, ((1, 1), (2, .25)))
def notify(v=1.0): o = np.zeros(int(.7 * SR)); [place_m(o, ping(v, f), i * .09) for i, f in enumerate([1245, 1661, 1865])]; return o
def place_m(buf, x, t): s = int(t * SR); n = min(len(x), len(buf) - s); buf[s:s + n] += x[:n]
def buzz(v=1.0):
    d = .9; x = t_(d); sq = np.sign(np.sin(2 * np.pi * 165 * x)) * ((x % .45) < .3); return norm(lp(sq, 900) * .8 + bp(noise(d), 120, 400) * .3 * ((x % .45) < .3)) * v
def keytap(v=1.0): d = .03; x = t_(d); return norm(bp(noise(d), 2000, 7000) * np.exp(-x / .005)) * v
def flipc(v=1.0): o = np.zeros(int(.3 * SR)); place_m(o, clack(1.4, v), 0); place_m(o, clack(1.7, v * .7), .07); return o
def metal(v=1.0, d=1.6):
    x = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / tau) for f, a, tau in [(173, 1, .5), (311, .7, .35), (547, .5, .25), (893, .35, .2)]) + bp(noise(d), 600, 6000) * np.exp(-x / .04) * 2) * v
def slam(v=1.0): o = np.zeros(int(2.2 * SR)); place_m(o, thump(1, 55) * 1.2, 0); place_m(o, metal(.9, 2.0), 0); place_m(o, crash(.6), .01); return norm(o) * v
def thunder(v=1.0, d=4.0):
    x = t_(d); crack = bp(noise(d), 800, 8000) * np.exp(-x / .06) * 1.2; body = lp(brown(d), 160) * np.exp(-x / 1.2) * (1 + .6 * np.sin(2 * np.pi * 1.3 * x)); return norm(crack + body * 1.4) * v
def horn(v=1.0, d=.7):
    x = t_(d); s = np.sign(np.sin(2 * np.pi * 415 * x)) + np.sign(np.sin(2 * np.pi * 523 * x)); return norm(lp(s, 2200) * np.minimum(1, x / .01) * np.minimum(1, (d - x) / .04)) * v
def engine(d, v=1.0):
    x = t_(d); return norm(lp(brown(d), 140) * (1 + .3 * np.sin(2 * np.pi * 28 * x)) + bp(noise(d), 300, 2500) * .25) * v
def tyres(d, v=1.0): x = t_(d); return norm(bp(noise(d), 1500, 7000) * np.sin(np.pi * np.minimum(1, x / d)) ** .5) * v
def freewheel(d, v=1.0):
    x = t_(d); clk = np.zeros(len(x)); clk[(np.arange(len(x)) % int(SR / 22)) == 0] = 1
    return norm(bp(np.convolve(clk, np.exp(-np.arange(200) / 25), 'same'), 2500, 7000) * .5 + bp(noise(d), 600, 3000) * .25) * v
def scrape(d, v=1.0): x = t_(d); return norm(bp(noise(d), 500, 3500) * (.6 + .4 * np.sin(2 * np.pi * 7 * x)) * (rng.random(len(x)) > .3)) * v
def groan(d=2.6, v=1.0):
    x = t_(d); f = 90 + 40 * np.sin(2 * np.pi * .6 * x) + 25 * x; return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + .5 * np.sin(2 * np.pi * 11 * x)) * np.minimum(1, x / .3) + bp(noise(d), 300, 1800) * .3) * v
def boom(v=1.0):
    d = 4.5; x = t_(d); return norm(np.sin(2 * np.pi * (48 - 14 * x / d) * x) * np.exp(-x / 1.3) * 1.4 + lp(brown(d), 120) * np.exp(-x / 1.0) + crash(1)[:len(x)].sum() * 0 + bp(noise(d), 2000, 9000) * np.exp(-x / .4) * .3) * v
def bigsplash(v=1.0): d = 3.0; x = t_(d); return norm(bp(noise(d), 300, 6000) * np.exp(-x / .7) * (1 + .5 * np.sin(2 * np.pi * 5 * x)) + lp(brown(d), 200) * np.exp(-x / .5)) * v
def bell(v=1.0): o = np.zeros(int(1.2 * SR)); place_m(o, tone(2637, 1.0, .35, v, ((1, 1), (2.4, .3))), 0); place_m(o, tone(2093, 1.0, .35, v * .8, ((1, 1), (2.4, .3))), .16); return o
def dialtone(d=.9, v=1.0): x = t_(d); return norm((np.sin(2 * np.pi * 350 * x) + np.sin(2 * np.pi * 440 * x)) * np.minimum(1, x / .01) * np.minimum(1, (d - x) / .01)) * v
def busy(v=1.0): o = np.zeros(int(2.0 * SR)); x = t_(.25); b = norm((np.sin(2 * np.pi * 480 * x) + np.sin(2 * np.pi * 620 * x))) * v; [place_m(o, b, k * .5) for k in range(4)]; return radio(o) if False else o
def stone(v=1.0): d = .09; x = t_(d); return norm(bp(noise(d), 700, 4500) * np.exp(-x / .014) + np.sin(2 * np.pi * 240 * x) * np.exp(-x / .012) * .35) * v
def steps(a, b, every, v, pan=0.0):
    t = a
    while t < b: place(fx, stone(v * rng.uniform(.8, 1.1)), t + rng.uniform(-.012, .012), pan); t += every

for e in EV:
    t0, k = e['t'], e['type']
    if k == 'chime': place(fx, ping(.14, 1318), t0)
    elif k == 'notify': place(fx, notify(.3), t0, .1)
    elif k == 'tick': place(fx, ping(.22, 2093), t0, .3)
    elif k == 'type':
        for i in range(e['n']): place(fx, keytap(.08), t0 + i / 34 + rng.uniform(-.004, .004), .15)
    elif k == 'strike': place(fx, scrape(.45, .25), t0, .1)
    elif k == 'buzz': place(fx, buzz(.3), t0, .1)
    elif k == 'flip': place(fx, flipc(.5), t0, .3)
    elif k == 'doorbell': place(fx, bell(.35), t0, -.1)
    elif k == 'unplug': place(fx, click(.8, .6), t0, .3); place(fx, pop(.25), t0 + .02, .3)
    elif k == 'send': place(fx, whoosh(.5, .5), t0, .2); place(fx, ping(.25, 2349), t0 + .1, .2)
    elif k == 'shutter': place(fx, slam(.9), t0 - .02)
    elif k == 'dial': place(fx, dialtone(.8, .14), t0, .2); place(fx, dialtone(.8, .14), t0 + 2.6, .2) if False else None
    elif k == 'hangup': place(fx, click(1.2, .7), t0, .2); place(fx, busy(.12), t0 + .35, .2)
    elif k == 'thunder': place(fx, thunder(.85 if t0 < 420 else 1.0, 4.0), t0 + rng.uniform(.25, 1.1), rng.uniform(-.5, .5))
    elif k == 'horn': place(fx, horn(.35, .55), t0, -.2); place(fx, horn(.3, .35), t0 + .75, -.2)
    elif k == 'carIn':
        d = e['b'] - t0 + 2.5; env = np.concatenate([np.linspace(.2, 1, int((d - 2.5) * SR)), np.linspace(1, .45, int(2.5 * SR))])
        x = engine(d, .5)[:len(env)] * env[:len(engine(d, 1))] + tyres(d, .25)[:len(env)] * np.concatenate([np.ones(int((d - 2.5) * SR)), np.linspace(1, 0, int(2.5 * SR))])[:len(tyres(d, 1))]
        place(fx, x, t0, -.25)
    elif k == 'bikeDrop': place(fx, crash(.35), t0, .3); place(fx, clack(.8, .4), t0 + .12, .3)
    elif k == 'drag': place(fx, scrape(e['b'] - t0, .45), t0, .1)
    elif k == 'fall': place(fx, groan(2.8, .6), t0 - .1, 0); place(fx, metal(.8, 3.0), t0 + .6, 0); place(fx, boom(1.0), t0 + 2.4, 0)
    elif k == 'splash': place(fx, bigsplash(.9), t0, 0)
    elif k == 'dead': place(fx, tone(880, .4, .08, .25) * np.linspace(1, 0, int(.4 * SR)), t0, .1)
    elif k == 'boot': place(fx, notify(.3), t0, .1)
    elif k == 'rainStart': pass
# bikes and steps
place(fx, freewheel(24, .22) * np.sin(np.pi * t_(24) / 24) ** .3, 66, 0); place(fx, tyres(24, .18), 66, 0)
place(fx, freewheel(21, .25), 354, 0); place(fx, tyres(21, .3), 354, 0)
steps(90.2, 93.6, .25, .3, -.1); steps(117.6, 119.3, .28, .2, .2); steps(120.6, 122.4, .28, .2, .2)
steps(383.0, 383.6, .25, .3, 0); steps(436, 440.4, .26, .3, -.2)
# tram bell at the stop and on the ride; spread pings multiply
for t0 in [70.4, 80.2, 95.0, 152.0]: place(fx, bell(.3), t0, -.4)
pt = 189.5
while pt < 212:
    place(fx, ping(.06 + .05 * (pt - 189.5) / 22, rng.choice([1661, 1865, 2093, 2489])), pt, rng.uniform(-.8, .8)); pt += max(.025, .9 * np.exp(-(pt - 189.5) / 5.5))
# heartbeat in the 7:03 silence and in the dark
place(fx, heartbeat(.45), 419.2); place(fx, heartbeat(.4), 432.3)
# hazard lights ticking in the aftermath
for k in range(int(17 * 1.6)): place(fx, click(1.6, .12), 435.6 + k / 1.6, -.3)

# —— Voices ——
VT = {e['id']: e['t'] for e in EV if e['type'] == 'voice'}
DLG = {e['id'] for e in EV if e['type'] == 'voice' and e.get('dlg')}
PHONEV = {'d01', 'd02', 'd03'}
Dd = json.load(open(os.path.join(HERE, 'voices', 'dur.json')))
vo = np.zeros((N, 2)); vmask = np.zeros(N)
for k, t0 in VT.items():
    y, sr = sf.read(os.path.join(HERE, 'voices', k + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    if sr != SR: y = resample_poly(y, SR, sr)
    y = compress(norm(y, .9), thr=.25, ratio=3.2)
    act = np.abs(y) > .02 * np.abs(y).max(); y = y * (10 ** (-20 / 20)) / (np.sqrt(np.mean(y[act] ** 2)) + 1e-9)
    if k in PHONEV: y = bp(y, 350, 3200) * 1.6        # the dispatcher is on the phone line
    elif k in DLG: y = lp(y, 7000) * 1.05
    place(vo, y, t0); s = int(t0 * SR); vmask[s:s + len(y)] = 1

# —— Music ——
m, sr = sf.read(os.path.join(HERE, 'out', 'score.wav'), always_2d=True)
mus = np.zeros((N, 2)); n = min(len(m), N); mus[:n] = m[:n]
duck = uniform_filter1d(vmask, int(.35 * SR)); mus *= (1 - .2 * np.clip(duck * 1.6, 0, 1))[:, None]

def lvl(x, db): sel = np.abs(x).sum(1) > 1e-4; r = np.sqrt(np.mean(x[sel] ** 2)) if sel.any() else 1; return x * (10 ** (db / 20)) / (r + 1e-9)
voS = lvl(vo, -17); musS = lvl(mus, -21); ambS = lvl(amb, -30); fxS = lvl(fx, -27)
keys = [(0, 1.0)]
for k, t0 in sorted(VT.items(), key=lambda kv: kv[1]):
    a, b = int(t0 * SR), int((t0 + Dd[k]) * SR); need = rms_db(voS[a:b]) - 10 - rms_db((musS + ambS)[a:b]); g = min(1.0, 10 ** (need / 20))
    keys += [(t0 - .35, 1.0), (t0 - .05, g), (t0 + Dd[k] + .1, g), (t0 + Dd[k] + .6, 1.0)]
keys.sort(); gk = np.array(keys); bedG = np.interp(tt, gk[:, 0], gk[:, 1])
musS *= bedG[:, None]; ambS *= (.3 + .7 * bedG)[:, None]; fxS *= (.45 + .55 * bedG)[:, None]
mix = voS + musS + ambS + fxS
pk = np.abs(mix).max(); mix = np.tanh(mix / max(pk, 1e-6) * 1.2) * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print('wrote out/mix.wav', DUR, 's | vo', round(rms_db(voS), 1), 'mus', round(rms_db(musS), 1), 'amb', round(rms_db(ambS), 1), 'fx', round(rms_db(fxS), 1))
low = []
for k, t0 in sorted(VT.items(), key=lambda kv: kv[1]):
    a, b = int(t0 * SR), int((t0 + Dd[k]) * SR); gap = rms_db(voS[a:b]) - rms_db((musS + ambS + fxS)[a:b])
    if gap < 7: low.append(f'{k}@{t0:.1f}:{gap:.1f}dB')
print('voice over bed below 7 dB:', low or 'none')
