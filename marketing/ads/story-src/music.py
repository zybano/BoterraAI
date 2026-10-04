"""Original Afro-pop groove for the Boterra story ad (synthesized here, royalty-free)."""
import json
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, sosfilt

SR = 44100
TL = json.load(open("timeline.json"))
TOTAL, S = TL["total"], TL["starts"]
DROP = S[4]          # "Then each of them hired a new team..."
FINAL = S[10]        # call to action
BPM = 108
BEAT = 60 / BPM
SIX = BEAT / 4       # sixteenth
BAR = 4 * BEAT
T0 = DROP - round(DROP / BAR) * BAR
N = int(TOTAL * SR)
mix = np.zeros((N, 2))
rng = np.random.default_rng(11)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def sos(kind, f, order=2): return butter(order, f, btype=kind, fs=SR, output="sos")
LP = lambda x, f: sosfilt(sos("low", f), x)
HP = lambda x, f: sosfilt(sos("high", f), x)
BP = lambda x, lo, hi: sosfilt(sos("band", [lo, hi]), x)

def add(sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig, i = sig[-i:], 0
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i + len(sig), 0] += sig * gain * l * 1.41
    mix[i:i + len(sig), 1] += sig * gain * r * 1.41

# Progressions: sparse minor before the drop, bright after it.
SAD = [[57, 60, 64, 67], [50, 57, 60, 65], [52, 59, 62, 67], [57, 60, 64, 67]]     # Am7 Dm7 Em7 Am7
BRIGHT = [[53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62], [57, 60, 64, 67]]  # Fmaj7 G7 Em7 Am7
ROOTS_SAD = [45, 38, 40, 45]
ROOTS_BRIGHT = [41, 43, 40, 45]

def ep(freq, dur):
    """Warm electric-piano-like tone with tremolo."""
    n = int(dur * SR); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t) * np.exp(-t / 0.3) + 0.12 * np.sin(6 * np.pi * freq * t) * np.exp(-t / 0.1)
    return tone * np.exp(-t / 1.1) * (1 + 0.15 * np.sin(2 * np.pi * 5 * t)) * np.minimum(1, t / 0.004)

def log_drum(freq, dur=0.32):
    n = int(dur * SR); t = np.arange(n) / SR
    f = freq * (1 + 0.6 * np.exp(-t / 0.02))
    return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.13)

def kick():
    n = int(0.3 * SR); t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.11)

def rim():
    n = int(0.08 * SR); t = np.arange(n) / SR
    return (BP(rng.standard_normal(n), 1500, 4500) * 0.6 + np.sin(2 * np.pi * 1750 * t) * 0.5) * np.exp(-t / 0.018)

def shaker(acc):
    n = int(0.07 * SR)
    return HP(rng.standard_normal(n), 6500) * np.exp(-np.arange(n) / ((0.02 if acc else 0.012) * SR))

def bell(freq=1568):
    n = int(0.25 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t)) * np.exp(-t / 0.06)

CHORD_STABS = [0, 3, 6, 10]          # syncopated 16th positions within a bar
BELL = [0, 3, 6, 10, 12]             # 3-2 bell feel
LOG = [(0, 0), (3, 0), (6, 7), (10, 5), (14, 3)]  # (16th, semitone offset)
SHAKE_ACC = {2, 6, 10, 14}

bar = int(np.floor((0 - T0) / BAR))
while T0 + bar * BAR < TOTAL:
    tb = T0 + bar * BAR
    bright = tb >= DROP - 1e-6
    prog, roots = (BRIGHT, ROOTS_BRIGHT) if bright else (SAD, ROOTS_SAD)
    chord, root = prog[bar % 4], roots[bar % 4]
    ending = tb >= FINAL + BAR
    if not ending:
        # Electric piano
        if bright:
            for pos in CHORD_STABS:
                for j, nn in enumerate(chord):
                    add(ep(midi(nn + 12), 0.9), tb + pos * SIX + j * 0.006, 0.035, -0.3 + 0.2 * j)
        else:
            for j, nn in enumerate(chord):
                add(ep(midi(nn), BAR + 0.5), tb + j * 0.012, 0.045, -0.3 + 0.2 * j)
        # Shaker 16ths (quieter before the drop)
        for s in range(16):
            add(shaker(s in SHAKE_ACC), tb + s * SIX + (0.012 if s % 2 else 0), (0.08 if s in SHAKE_ACC else 0.045) * (1 if bright else 0.6), 0.35)
        # Rim on 2 and 4
        for b in (1, 3):
            add(rim(), tb + b * BEAT, 0.18 if bright else 0.10, -0.15)
        if bright:
            for b in (0, 2):
                add(kick(), tb + b * BEAT, 0.6)
            add(kick(), tb + 1.5 * BEAT, 0.35)
            for pos in BELL:
                add(bell(), tb + pos * SIX, 0.05, 0.5)
            for pos, semi in LOG:
                add(log_drum(midi(root - 12 + semi + 12)), tb + pos * SIX, 0.28)
            # Sub bass on the root
            n = int(BAR * SR); t = np.arange(n) / SR
            bass = np.sin(2 * np.pi * midi(root - 12) * t) * np.minimum(1, t / 0.02) * np.exp(-t / 1.4)
            add(bass, tb, 0.22)
    bar += 1

# Transition swell into the drop
n = int(BAR * SR)
sw = BP(rng.standard_normal(n), 800, 6000) * np.linspace(0, 1, n) ** 3
add(sw, DROP - BAR, 0.25)

# Final hit: bright chord + log drum on the closing line's end
end_hit = min(TOTAL - 2.2, S[10] + TL["durs"][10] - 0.6)
for j, nn in enumerate([48, 55, 60, 64, 67, 72]):
    add(ep(midi(nn), 2.4), end_hit + j * 0.01, 0.06, -0.3 + 0.12 * j)
add(log_drum(midi(36)), end_hit, 0.35)
add(kick(), end_hit, 0.6)

def reverb(x, amt=0.14):
    out = np.zeros_like(x)
    for d, g in ((1557, .78), (1617, .77), (1491, .79), (1422, .76)):
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g
        out += lfilter([1], a, x)
    for d in (225, 556):
        b = np.zeros(d + 1); b[0] = -0.5; b[d] = 1
        a = np.zeros(d + 1); a[0] = 1; a[d] = -0.5
        out = lfilter(b, a, out)
    return x + amt * out / 4

for ch in (0, 1):
    mix[:, ch] = reverb(mix[:, ch])
f_in, f_out = int(0.3 * SR), int(1.5 * SR)
mix[:f_in] *= np.linspace(0, 1, f_in)[:, None]
mix[-f_out:] *= np.linspace(1, 0, f_out)[:, None]
mix /= np.max(np.abs(mix)) / 0.89
sf.write("music.wav", mix, SR)
print("ok drop", DROP, "t0", T0)
