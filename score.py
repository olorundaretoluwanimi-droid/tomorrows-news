# Original score for "Tomorrow's News": 80 bpm, 4/4 (bar = 3 s), E minor → E major at the end.
# Motifs: the phone (glockenspiel B–E–F#) and time (a pizzicato clock tick on the beat).
# Instruments: harp, glockenspiel, alto recorder, string sections (arco, tremolo, pizzicato), horn, timpani, gong.
# Usage: <LIB>/.venv/bin/python score.py   → out/score.wav
import sys, os, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR

S.seed(80)
BPM = 80; B = 60 / BPM; BAR = 4 * B
DUR = 480.0
bt = lambda bar, beat=0: (bar - 1) * BAR + beat * B
EV = []
def ev(t, inst, pitch, dur, vel, pan=0, gain=1.0, **kw):
    if 0 <= t < DUR: EV.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain, **kw))

CH = {'Em': ['E2', 'B2', 'E3', 'G3', 'B3'], 'C': ['C2', 'G2', 'C3', 'E3', 'G3'], 'G': ['G2', 'D3', 'G3', 'B3', 'D4'], 'D': ['D2', 'A2', 'D3', 'F#3', 'A3'],
      'Am': ['A2', 'E3', 'A3', 'C4', 'E4'], 'B': ['B1', 'F#2', 'B2', 'D#3', 'F#3'], 'E': ['E2', 'B2', 'E3', 'G#3', 'B3'], 'A': ['A2', 'E3', 'A3', 'C#4', 'E4'],
      'Cmaj7': ['C2', 'G2', 'E3', 'B3', 'G4'], 'F#m': ['F#2', 'C#3', 'F#3', 'A3', 'C#4']}
P_DARK = ['Em', 'C', 'Am', 'B']
P_CUR = ['Em', 'C', 'G', 'D']
P_WARM = ['Am', 'D', 'G', 'Em']
P_END = ['C', 'G', 'D', 'E']

def pad(t0, bars, prog, vel=.3, upper='violas', low='cellos', bass=False, att=.4, gain=1.0):
    for i in range(bars):
        c = CH[prog[i % len(prog)]]; s = t0 + i * BAR
        if low: ev(s, low, c[1] if low == 'violas' else c[0], BAR * 1.03, vel, -.2, gain, attack=att)
        if bass: ev(s, 'contrabass', c[0], BAR * 1.03, vel * .9, 0, gain, attack=att)
        if upper: ev(s, upper, c[3], BAR * 1.03, vel * .8, .25, gain * .8, attack=att); ev(s, upper, c[4], BAR * 1.03, vel * .7, .35, gain * .7, attack=att)

def harp(t0, bars, prog, vel=.38, step=.5, oct=12, pan=.3, gain=1.0):
    for i in range(bars):
        c = [S.midi(x) + oct for x in CH[prog[i % len(prog)]][1:]]
        seq = [c[0], c[1], c[2], c[3], c[2], c[1], c[2], c[3]]
        for k in range(int(round(4 / step))):
            ev(t0 + i * BAR + k * step * B, 'harp', seq[k % len(seq)], 1.4, vel * (1 if k % 4 == 0 else .8), pan, gain)

def tick(t0, beats, vel=.3, sub=1, pitch='E5', gain=1.0):
    """The clock: a pizzicato note on each (sub-)beat; downbeats a low pizz underneath."""
    n = int(beats * sub)
    for k in range(n):
        t = t0 + k * B / sub; down = (k % (4 * sub)) == 0
        ev(t, 'violins_pizz', pitch if k % 2 == 0 else 'B4', .3, vel * (1.0 if down else .75), .25, gain)
        if down: ev(t, 'cellos_pizz', 'E2', .6, vel * 1.1, -.2, gain)

def motif(t0, inst='glockenspiel', notes=('B5', 'E6', 'F#6'), vel=.45, step=.5, pan=0, dur=1.6):
    for i, p in enumerate(notes): ev(t0 + i * step * B, inst, p, dur, vel, pan)

def roll(t0, beats, pitch='E3', v0=.15, v1=.6, rate=4):
    n = int(beats * rate)
    for k in range(n): ev(t0 + k * B / rate, 'timpani', pitch, 1.4, v0 + (v1 - v0) * k / max(1, n - 1), 0)

def melody(t0, inst, notes, vel=.45, pan=.1, oct=0, gain=1.0):
    """notes: (beat, pitch, beats)"""
    for b, p, d in notes:
        if p: ev(t0 + b * B, inst, S.midi(p) + 12 * oct, d * B * .96, vel, pan, gain, attack=.08)

THEME = [(0, 'B4', 1), (1, 'E5', 1), (2, 'F#5', 2), (4, 'G5', 1), (5, 'F#5', 1), (6, 'E5', 1), (7, 'D5', 1),
         (8, 'B4', 2), (10, 'A4', 1), (11, 'G4', 1), (12, 'A4', 2), (14, 'B4', 2)]
LAMENT = [(0, 'G3', 2), (2, 'F#3', 1), (3, 'E3', 1), (4, 'B3', 3), (7, 'A3', 1), (8, 'G3', 2), (10, 'F#3', 2), (12, 'E3', 4)]

# —— 1. Cold open (bars 1–10, 0–30): night pad, harp from bar 3, the phone motif at midnight ——
pad(bt(1), 10, P_DARK, vel=.24, upper='violas')
harp(bt(3), 8, P_DARK, vel=.28, step=1)
motif(15.0, vel=.5)
motif(21.3, vel=.32, pan=.2)
# —— 2. Title (bars 11–12, 30–36): roll into bar 11, horn states the motif ——
roll(bt(10, 2), 2, 'E3', .12, .5)
ev(bt(11), 'timpani', 'E3', 1.5, .7, 0); ev(bt(11), 'gong', None, None, .35, 0)
pad(bt(11), 2, ['Em', 'C'], vel=.38, upper='violins', bass=True)
melody(bt(11), 'horn', THEME[:7], vel=.55, pan=-.05, oct=-1)
# —— 3. Chapter I (bars 13–30, 36–90): the clock starts; rain at 7:42 brings the cellos; the ride ——
tick(bt(13), 12, vel=.26)                                     # 7:41 ... (bars 13–15)
pad(bt(13), 3, ['Em', 'C', 'Em'], vel=.18, upper=None)
ev(45.0, 'cellos', 'E3', BAR * 2, .5, -.2, attack=.2); ev(45.0, 'contrabass', 'E2', BAR * 2, .45, 0, attack=.2)   # 7:42 downbeat
ev(45.0, 'timpani', 'E3', 1.5, .45, 0)
tick(bt(16), 24, vel=.22)
pad(bt(16), 7, P_DARK, vel=.32, upper='violas', bass=True)
harp(bt(18), 5, P_DARK, vel=.3, step=.5)
melody(bt(18), 'cellos', LAMENT, vel=.42, pan=-.15)
# the ride: curious, light (pizz + glock + recorder over a major-ish loop)
tick(bt(23), 32, vel=.24, sub=2, pitch='G5')
pad(bt(23), 8, P_CUR, vel=.22, upper='violas')
melody(bt(23), 'recorder', THEME, vel=.42, pan=.2)
melody(bt(27), 'recorder', THEME, vel=.4, pan=.2)
for k in range(8): motif(bt(23 + k, 3), 'glockenspiel', ('E6', 'F#6'), vel=.16, step=.5, pan=.35, dur=.8)
# —— 4. Chapter II (bars 31–57, 90–171) ——
harp(bt(31), 4, P_WARM, vel=.3, step=1)
pad(bt(31), 4, P_WARM, vel=.2, upper=None)
# the café: warm, harp + recorder
harp(bt(35), 7, P_WARM, vel=.3, step=.5)
pad(bt(35), 7, P_WARM, vel=.2, upper='violas')
melody(bt(36), 'recorder', [(b, p, d) for b, p, d in THEME], vel=.32, pan=.25, oct=0)
ev(120.0, 'cellos_pizz', 'E2', .8, .5, -.2)                   # heater off
# near-silence: 2:10 (bars 42–44, 123–132): two soft notes only
ev(123.0, 'violas', 'B3', 8.6, .16, -.2, attack=1.0); ev(123.0, 'violas', 'E4', 8.6, .13, .2, attack=1.0)
# the rewrite: the motif turns (minor sixth)
motif(136.4, vel=.4, notes=('B5', 'E6', 'G6')); motif(137.1, vel=.45, notes=('B5', 'E6', 'F#6', 'B6'))
pad(bt(45), 3, ['Am', 'B', 'Em'], vel=.24, upper='violas')
# Lorenz: the strings open out; the motif inverted in the violins
pad(bt(48), 10, ['Em', 'C', 'G', 'D', 'Am', 'C', 'G', 'B', 'Em', 'Em'], vel=.3, upper='violins', bass=True)
harp(bt(48), 10, ['Em', 'C', 'G', 'D', 'Am', 'C', 'G', 'B', 'Em', 'Em'], vel=.26, step=.5)
melody(bt(50), 'violins', [(0, 'F#5', 2), (2, 'E5', 2), (4, 'B4', 4), (8, 'A5', 2), (10, 'G5', 2), (12, 'D5', 4)], vel=.32, pan=.25)
melody(bt(54), 'violins', [(0, 'F#5', 2), (2, 'E5', 2), (4, 'B4', 4), (8, 'G5', 2), (10, 'F#5', 2), (12, 'E5', 4)], vel=.28, pan=.25)
# —— 5. Chapter III (bars 58–89, 171–267) ——
pad(bt(58), 6, P_DARK, vel=.28, upper='violas', bass=True)
for k in range(3): ev(bt(58 + 2 * k), 'timpani', 'E3', 1.5, .25, 0)
motif(174.6, vel=.4)
ev(186.0, 'glockenspiel', 'B6', 2, .5, .2); ev(186.0, 'gong', None, None, .3, 0)   # send
# the spread (bars 64–72, 189–216): accelerando by density — beats → eighths → triplets → sixteenths
ACC = [(64, 2, 1), (66, 2, 2), (68, 2, 3), (70, 2, 4), (72, 1, 4)]
for b0, nb, sub in ACC:
    tick(bt(b0), nb * 4, vel=.22 + .05 * sub, sub=sub)
    harp(bt(b0), nb, ['Em', 'C', 'Am', 'B'][(b0 - 64) // 2 % 4:] + ['Em'], vel=.26 + .04 * sub, step=1 / sub if sub > 1 else .5)
for i in range(9):
    c = CH[['Em', 'Em', 'C', 'C', 'Am', 'Am', 'B', 'B', 'B'][i]]; s = bt(64 + i); k = i / 8
    ev(s, 'violins_trem', c[3], BAR * 1.03, .18 + .45 * k, .3, attack=.2); ev(s, 'violins_trem', c[4], BAR * 1.03, .15 + .4 * k, .4, attack=.2)
    ev(s, 'cellos', c[0], BAR * 1.03, .25 + .35 * k, -.25, attack=.2); ev(s, 'contrabass', c[0], BAR * 1.03, .2 + .35 * k, 0, attack=.2)
roll(bt(70), 8, 'B2', .15, .7, rate=6)
ev(bt(72), 'timpani', 'E3', 1.5, .75, 0); ev(bt(72), 'gong', None, None, .45, 0)
melody(bt(68), 'horn', THEME[:4], vel=.6, oct=-1)
# dawn queue (bars 73–79): horns, tense; the clock steady
tick(bt(73), 28, vel=.2)
pad(bt(73), 7, ['Em', 'Em', 'C', 'C', 'Am', 'B', 'B'], vel=.3, upper='violas', bass=True)
for i, p in enumerate(['B3', 'C4', 'B3', 'A3']): ev(bt(74 + i), 'horn', p, BAR * .9, .38, -.1, attack=.2)
# Merton (bars 80–89): low, under the voice, the clock and a held pedal
tick(bt(80), 40, vel=.16)
pad(bt(80), 9, ['Em', 'Em', 'C', 'C', 'Am', 'Am', 'B', 'B', 'B'], vel=.22, upper=None, bass=True)
roll(bt(89), 4, 'B2', .06, .45, rate=6)
for p in ['B2', 'F#3', 'B3', 'D#4']: ev(bt(89), 'horn' if S.midi(p) > 50 else 'cellos', p, BAR, .3, 0, attack=.5)
# HARD STOP at the shutter (267.0) — rendered below
# guilt (bars 91–96): a lone cello lament
melody(bt(91, 1), 'cellos', LAMENT, vel=.4, pan=-.1)
ev(bt(91), 'violas', 'E4', BAR * 5, .14, .2, attack=1.2)
# —— 6. Chapter IV (bars 97–118, 288–354): storm; the clock at half time ——
for i in range(22):
    s = bt(97 + i); c = CH[['Em', 'C', 'Am', 'B'][(i // 2) % 4]]
    ev(s, 'violins_trem', c[3], BAR * 1.03, .14 + (.08 if i > 13 else 0), .3, attack=.4)
    ev(s, 'cellos', c[0], BAR * 1.03, .22, -.25, attack=.4)
    ev(s, 'cellos_pizz', 'E2', .6, .3, -.2); ev(s + 2 * B, 'violins_pizz', 'E5', .3, .18, .25)
motif(292.6, vel=.35)
ev(325.1, 'contrabass_pizz', 'E1', .8, .7, 0); ev(325.1, 'timpani', 'B2', 1.5, .5, 0)       # the line goes dead
melody(bt(111), 'horn', [(0, 'B3', 2), (2, 'E4', 2), (4, 'F#4', 4), (8, 'G4', 2), (10, 'F#4', 2), (12, 'E4', 4)], vel=.4, oct=0, pan=-.1)
melody(bt(115), 'horn', [(0, 'B3', 2), (2, 'E4', 2), (4, 'F#4', 6), (10, 'B3', 2)], vel=.42, pan=-.1)
# —— 7. Chapter V (bars 119–142, 354–426): the race, the road, the last minute ——
for i in range(7):
    s = bt(119 + i); c = CH[['Em', 'Em', 'C', 'C', 'Am', 'B', 'B'][i]]; k = i / 6
    ev(s, 'violins_trem', c[3], BAR * 1.03, .35 + .3 * k, .3, attack=.1); ev(s, 'violins_trem', c[4], BAR * 1.03, .3 + .3 * k, .4, attack=.1)
    ev(s, 'cellos_spic', c[0], .3, .5, -.25)
    for b in range(8): ev(s + b * B / 2, 'cellos_spic', c[0] if b % 2 == 0 else c[1], .25, .38 + .2 * k, -.25)
    ev(s, 'contrabass', c[0], BAR * 1.03, .4 + .3 * k, 0, attack=.1)
    ev(s, 'timpani', 'E3', 1.5, .45 + .3 * k, 0); ev(s + 2 * B, 'timpani', 'B2', 1.5, .35 + .3 * k, 0)
    tick(s, 4, vel=.22, sub=2)
melody(bt(119), 'horn', THEME[:7], vel=.62, oct=-1)
melody(bt(123), 'horn', THEME[:4] + [(4, 'B4', 4)], vel=.7, oct=-1)
# the bridge head (bars 126–138): held tension under the voice; the clock
tick(bt(126), 52, vel=.2)
pad(bt(126), 13, ['Em', 'Em', 'C', 'C', 'Am', 'Am', 'B', 'B', 'Em', 'C', 'Am', 'B', 'B'], vel=.26, upper='violas', bass=True)
# 7:03 (bars 139–142): only the clock and a heartbeat on the timpani, then a long crescendo
tick(bt(139), 12, vel=.24)
for k in range(6): ev(bt(139) + k * 1.5, 'timpani', 'E3', 1.2, .28 + .05 * k, 0); ev(bt(139) + k * 1.5 + .28, 'timpani', 'E3', 1.0, .18 + .04 * k, 0)
for i in range(4):
    s = bt(139 + i); c = CH[['B', 'B', 'B', 'B'][i]]
    ev(s, 'violins_trem', c[3], BAR * 1.03, .15 + .2 * i, .3, attack=.3); ev(s, 'cellos', c[0], BAR * 1.03, .2 + .15 * i, -.25, attack=.3)
roll(bt(142), 4, 'B2', .2, .85, rate=8)
# HARD STOP at 7:04 (426.0) — rendered below; then rain only. A soft pad returns after the driver speaks.
ev(445.5, 'violas', 'E4', 7.5, .14, .2, attack=1.5); ev(445.5, 'cellos', 'B2', 7.5, .14, -.2, attack=1.5)
# —— 8. Epilogue (bars 152–160, 453–480): harp and strings; the motif resolved in E major ——
harp(bt(152), 7, P_END, vel=.3, step=.5)
pad(bt(152), 7, P_END, vel=.26, upper='violins', bass=True)
motif(459.4, vel=.42, notes=('B5', 'E6', 'G#6'))
melody(bt(154), 'violins', [(0, 'B4', 1), (1, 'E5', 1), (2, 'F#5', 2), (4, 'G#5', 3), (8, 'F#5', 1), (9, 'E5', 1), (10, 'B4', 2), (12, 'E5', 4)], vel=.32, pan=.2)
for p in ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4']: ev(bt(159), 'violins' if S.midi(p) >= 55 else 'cellos', p, 9.0, .28, 0, attack=.8)
ev(bt(159), 'horn', 'G#3', 8.0, .3, -.1, attack=.6); ev(bt(159), 'horn', 'B3', 8.0, .26, .1, attack=.6)
harp(bt(159), 2, ['E', 'E'], vel=.24, step=1)
motif(bt(159, 2), vel=.3, notes=('B6', 'E7'))

# —— Render ——
mus = S.render(EV, dur=DUR, master=False)
N = int(DUR * SR); mus = mus[:N]
def hard_stop(at, until):
    cut = int(at * SR)
    tail = np.zeros((int(2.4 * SR), 2), np.float32); tail[:int(.35 * SR)] = mus[cut - int(.35 * SR):cut]
    tail = S.room(tail, size=.95, mix=.92)
    mus[cut:int(until * SR)] = 0
    L = min(len(tail) - int(.35 * SR), N - cut)
    mus[cut:cut + L] += tail[int(.35 * SR):int(.35 * SR) + L] * np.linspace(1, 0, L)[:, None]
hard_stop(267.0, 270.0)      # the shutter
hard_stop(426.0, 445.4)      # 7:04
mus[int(123.0 * SR):int(126.0 * SR)] *= .7
mus = S.room(mus, size=.6, mix=.2)
fade = int(1.2 * SR); mus[-fade:] *= np.linspace(1, 0, fade)[:, None]
mus /= max(1e-6, np.abs(mus).max()) / .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'score.wav'), mus.astype(np.float32), SR)
used = sorted({e['inst'] for e in EV})
open(os.path.join(HERE, 'out', 'score_instruments.txt'), 'w').write('\n'.join(used))
print('score', DUR, 's', len(EV), 'notes', used)
