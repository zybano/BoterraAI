"""Original trap-pop bed + SFX for the Boterra UGC ad (synthesized here, royalty-free)."""
import json
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, lfilter
SR = 44100
TL = json.load(open("timeline.json")); S, Dd, TOTAL = TL["starts"], TL["durs"], TL["total"]
N = int(TOTAL * SR); mus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); rng = np.random.default_rng(5)
BPM = 100; BEAT = 60 / BPM; SIX = BEAT / 4; BAR = 4 * BEAT
def midi(n): return 440 * 2 ** ((n - 69) / 12)
f = lambda k, c: butter(2, c, btype=k, fs=SR, output="sos")
LP = lambda x, c: sosfilt(f("low", c), x); HP = lambda x, c: sosfilt(f("high", c), x); BP = lambda x, a, b: sosfilt(f("band", [a, b]), x)
def add(buf, sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig, i = sig[-i:], 0
    sig = sig[:N - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * g * l * 1.41; buf[i:i + len(sig), 1] += sig * g * r * 1.41
tt = lambda d: np.arange(int(d * SR)) / SR
def kick808(note):
    t = tt(0.7); fr = midi(note) + 120 * np.exp(-t / 0.03)
    return np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(fr) / SR)) * np.exp(-t / 0.35)
def clap():
    t = tt(0.3); n = BP(rng.standard_normal(len(t)), 900, 4000)
    env = np.exp(-t / 0.08) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03))
    return n * env
def hat(d=0.04): t = tt(d); return HP(rng.standard_normal(len(t)), 8000) * np.exp(-t / (d / 3))
def pluck(fr, d=0.35):
    t = tt(d); return (np.sign(np.sin(2 * np.pi * fr * t)) * 0.3 + np.sin(2 * np.pi * fr * t)) * np.exp(-t / 0.09)
CH = [[65, 69, 72], [60, 64, 67], [62, 65, 69], [58, 62, 65]]   # F C Dm Bb
RT = [41, 36, 38, 34]
DROP = S[8]                                    # "Honestly?" — beat stops for a beat, then slams back
bar = 0
while bar * BAR < S[9] + Dd[9] + 0.2:
    tb = bar * BAR
    for s16 in range(16):
        t = tb + s16 * SIX
        if DROP - 0.55 < t < DROP: continue
        intro = t < S[1]
        if s16 in (0, 10) and not intro: add(mus, kick808(RT[bar % 4] - 12 + 12), t, 0.5)
        if s16 in (4, 12) and not intro: add(mus, clap(), t, 0.3, 0.05)
        roll = (bar % 2 == 1 and s16 >= 12)
        if s16 % 2 == 0 or roll: add(mus, hat(0.03 if roll else 0.045), t, 0.10 if s16 % 4 == 0 else 0.06, 0.3)
        if s16 in (2, 6, 7, 11, 14):
            for j, n in enumerate(CH[bar % 4]): add(mus, LP(pluck(midi(n + 12)), 3500), t + j * 0.004, 0.05 * (0.6 if intro else 1), -0.3 + 0.3 * j)
    bar += 1
# end sting
end_t = S[9] + Dd[9] + 0.15
for j, n in enumerate([53, 60, 65, 69, 72]): add(mus, LP(pluck(midi(n), 1.6), 3000) * np.exp(-tt(1.6) / 0.6), end_t + j * 0.01, 0.08, -0.2 + 0.1 * j)
add(mus, kick808(29), end_t, 0.55)
# ----- SFX -----
def pop(): t = tt(0.12); fr = 500 + 900 * np.exp(-t / 0.02); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.035)
def whoosh(d=0.45):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); ch = 1024
    for i in range(0, n, ch): fr = i / n; out[i:i + ch] = BP(x[i:i + ch], 400 + 3000 * fr, 900 + 6000 * fr)
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2
def ding(): t = tt(1.0); return (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t) + 0.3 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t / 0.3)
def sparkle():
    out = np.zeros(int(1.2 * SR))
    for k in range(10):
        t = tt(0.4); s = np.sin(2 * np.pi * (2000 + 300 * k) * t) * np.exp(-t / 0.08); i = int(k * 0.07 * SR); out[i:i + len(s)] += s[:len(out) - i]
    return out
def click(): t = tt(0.025); return HP(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.006)
STK_T = [(0, .15), (1, 1.0), (1, 3.4), (2, 1.0), (2, 2.6), (3, 3.3), (3, 5.0), (4, .4), (5, 2.7), (5, 3.6), (5, 5.1), (6, 3.3), (7, .6), (7, 3.4), (8, .2), (8, 2.3)]
for l, o in STK_T: add(sfx, pop(), S[l] + o, 0.22, 0.2)
for t in (S[3] - 0.15, S[8] - 0.2, end_t - 0.1): add(sfx, whoosh(), t, 0.35)
add(sfx, ding(), S[6] + 3.3, 0.22)
add(sfx, sparkle(), S[8] + 0.2, 0.12, 0.3)
add(sfx, pop(), S[9] + 0.6, 0.25)
t = S[4] + 1.2
while t < S[4] + 4.8: add(sfx, click(), t + rng.uniform(0, 0.03), 0.10, -0.3); t += 0.085
for buf in (mus, sfx):
    buf[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))[:, None]
mus /= np.max(np.abs(mus)) / 0.89; sfx /= max(1.0, np.max(np.abs(sfx)) / 0.89)
sf.write("music.wav", mus, SR); sf.write("sfx.wav", sfx, SR); print("ok")
