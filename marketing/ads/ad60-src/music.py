"""Original background track for the Boterra 60s ad (royalty-free, synthesized here)."""
import json
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, sosfilt

SR = 44100
TL = json.load(open("timeline.json"))
TOTAL = TL["total"]
S = TL["starts"]
DROP = S[3]            # "Meet Boterra AI"
TENSE_END = S[2]       # "What if you had a whole team behind you?"
FINAL = S[11]          # closing line
BEAT = 0.6             # 100 BPM
BAR = 4 * BEAT
T0 = DROP - round(DROP / BAR) * BAR  # bar grid aligned so a downbeat lands on the drop

N = int(TOTAL * SR)
mix = np.zeros((N, 2))
rng = np.random.default_rng(7)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

# A minor / C major loop: Am F C G (one chord per bar)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55, 60], [55, 59, 62]]
ROOTS = [45, 41, 36, 43]

def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig, i = sig[-i:], 0
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i + len(sig), 0] += sig * gain * l * 1.41
    mix[i:i + len(sig), 1] += sig * gain * r * 1.41

def env(n, a, d, sus=1.0, rel=0.0):
    e = np.ones(n) * sus
    na, nr = int(a * SR), int(rel * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if d: e[na:] *= np.exp(-np.arange(n - na) / (d * SR))
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0, detune):
        ph = (t * f * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / 3

def lowpass(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, btype="low", fs=SR, output="sos"), x)

def bandpass(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)

def highpass(x, cutoff):
    return sosfilt(butter(2, cutoff, btype="high", fs=SR, output="sos"), x)

def bar_index(t): return int(np.floor((t - T0) / BAR))

# ---------- Pad (whole track, swells up at the drop) ----------
b = bar_index(0)
while T0 + b * BAR < FINAL:
    t = T0 + b * BAR
    chord = CHORDS[b % 4]
    n = int((BAR + 0.6) * SR)
    sig = sum(saw(midi(nn), n, 0.004) for nn in chord) / len(chord)
    cutoff = 900 if t < TENSE_END else (2200 if t >= DROP else 900 + 1300 * (t - TENSE_END) / (DROP - TENSE_END))
    sig = lowpass(sig, cutoff) * env(n, 0.35, 0, 1, 0.6)
    add(sig, t, 0.10 if t < DROP else 0.13, -0.3)
    add(sig, t + 0.012, 0.10 if t < DROP else 0.13, 0.3)
    b += 1

# ---------- Pluck arpeggio (8ths); muted ticking before the drop ----------
k = int(np.floor((0 - T0) / (BEAT / 2)))
while T0 + k * BEAT / 2 < FINAL:
    t = T0 + k * BEAT / 2
    if t >= 0:
        bi = bar_index(t)
        chord = CHORDS[bi % 4]
        note = chord[k % len(chord)] + 12 + (12 if (k % 8) in (5, 6) and t >= DROP else 0)
        n = int(0.5 * SR)
        tt = np.arange(n) / SR
        f = midi(note)
        sig = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt / (0.09 if t < DROP else 0.16))
        g = 0.07 if t < TENSE_END else (0.0 if t < DROP else 0.09)
        if g:
            add(sig, t, g, 0.4 if k % 2 else -0.4)
            add(sig, t + 0.225, g * 0.35, -0.4 if k % 2 else 0.4)   # dotted-8th echo
    k += 1

# ---------- Tension tick (16ths) in the problem section ----------
t = 0.0
while t < TENSE_END:
    n = int(0.03 * SR)
    sig = highpass(rng.standard_normal(n), 6000) * np.exp(-np.arange(n) / (0.008 * SR))
    add(sig, t, 0.05 if int(round(t / (BEAT / 4))) % 4 else 0.09, 0.2)
    t += BEAT / 4

# ---------- Riser into the drop ----------
n = int((DROP - TENSE_END) * SR)
noise = rng.standard_normal(n)
sweep = np.zeros(n)
chunk = 2048
for i in range(0, n, chunk):
    frac = i / n
    seg = noise[i:i + chunk]
    sweep[i:i + chunk] = bandpass(seg, 300 + 5000 * frac, 600 + 9000 * frac)
add(sweep * np.linspace(0, 1, n) ** 2, TENSE_END, 0.25)

# ---------- Drums, bass after the drop ----------
def kick():
    n = int(0.35 * SR); tt = np.arange(n) / SR
    f = 45 + 80 * np.exp(-tt / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.12)

def clap():
    n = int(0.25 * SR)
    return bandpass(rng.standard_normal(n), 900, 3500) * np.exp(-np.arange(n) / (0.06 * SR))

def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    return highpass(rng.standard_normal(n), 7500) * np.exp(-np.arange(n) / ((0.06 if open_ else 0.015) * SR))

beat = 0
t = DROP
while t < FINAL - 0.01:
    add(kick(), t, 0.55)
    if beat % 2 == 1: add(clap(), t, 0.22, 0.1)
    add(hat(open_=(beat % 4 == 3)), t + BEAT / 2, 0.10, -0.2)
    add(hat(), t + BEAT / 4, 0.04, 0.3)
    # bass: root 8ths with sidechain-style pump
    root = ROOTS[bar_index(t) % 4]
    for half in (0, 1):
        n = int(BEAT / 2 * SR); tt = np.arange(n) / SR
        f = midi(root)
        sig = lowpass(np.sin(2 * np.pi * f * tt) + 0.4 * saw(f, n), 700) * np.minimum(1, tt / 0.06) * np.exp(-tt / 0.25)
        add(sig, t + half * BEAT / 2, 0.22)
    beat += 1
    t += BEAT

# Crash / impact on the drop and on the CTA
def crash():
    n = int(1.8 * SR)
    return highpass(rng.standard_normal(n), 4000) * np.exp(-np.arange(n) / (0.5 * SR))
add(crash(), DROP, 0.12)
add(crash(), S[10], 0.08)

# ---------- Final resolving chord ----------
n = int((TOTAL - FINAL) * SR)
final = sum(saw(midi(nn), n, 0.005) for nn in [48, 55, 60, 64, 67]) / 5
final = lowpass(final, 2400) * env(n, 0.02, 1.8)
add(final, FINAL, 0.22, -0.2)
add(final, FINAL + 0.015, 0.22, 0.2)
add(kick(), FINAL, 0.6)
add(crash(), FINAL, 0.14)

# ---------- Simple reverb + master ----------
def reverb(x, mixamt=0.18):
    out = np.zeros_like(x)
    for d, g in ((1557, .80), (1617, .78), (1491, .79), (1422, .77)):
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g
        out += lfilter([1], a, x)
    for d in (225, 556):
        bcoef = np.zeros(d + 1); bcoef[0] = -0.5; bcoef[d] = 1
        acoef = np.zeros(d + 1); acoef[0] = 1; acoef[d] = -0.5
        out = lfilter(bcoef, acoef, out)
    return x + mixamt * out / 4

for ch in (0, 1):
    mix[:, ch] = reverb(mix[:, ch])
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix[: int(0.25 * SR)] *= np.linspace(0, 1, int(0.25 * SR))[:, None]
mix /= np.max(np.abs(mix)) / 0.89
sf.write("music.wav", mix, SR)
print("music written", mix.shape[0] / SR, "s; drop at", DROP, "grid t0", T0)
