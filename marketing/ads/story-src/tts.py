import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro/kokoro-v1.0.onnx", "kokoro/voices-v1.0.bin")
print(sorted(k.get_voices()))
LINES = [
 ("narrator", "bm_george", "Meet three business owners, in three different cities."),
 ("amaka",    "af_heart",  "I run a café in Lagos. Between suppliers, staff and taxes, I hardly sleep."),
 ("kofi",     "am_puck",   "My tailoring shop in Accra is growing. But chasing late payments takes all my time."),
 ("wanjiru",  "af_nicole", "In my pharmacy, one missed licence renewal could shut us down."),
 ("narrator", "bm_george", "Then each of them hired a new team. An AI team. Boterra AI."),
 ("amaka",    "af_heart",  "Quinn forecasts my cash flow, and Vendor finds me better supplier deals."),
 ("kofi",     "am_puck",   "Tally sends my invoice reminders. I just approve, and I get paid."),
 ("wanjiru",  "af_nicole", "Sentinel tracks every licence and deadline. Now I sleep well."),
 ("narrator", "bm_george", "Twenty-six AI agents, from finance to legal and compliance. Working together, with your approval on every big decision."),
 ("narrator", "bm_george", "Three cities. Three businesses. One AI workforce."),
 ("narrator", "bm_george", "Start free today, at boterra dot I O."),
]
FPS = 30
out = []
for i, (who, voice, text) in enumerate(LINES):
    samples, sr = k.create(text, voice=voice, speed=1.0, lang="en-us" if not voice.startswith("b") else "en-gb")
    sf.write(f"ad3/vo/{i:02d}.wav", samples, sr)
    hop = sr // FPS
    env = [float(np.sqrt(np.mean(samples[j:j+hop]**2))) for j in range(0, len(samples), hop)]
    m = max(env) or 1
    out.append({"i": i, "who": who, "voice": voice, "text": text, "dur": round(len(samples)/sr, 3), "env": [round(e/m, 3) for e in env]})
    print(i, who, round(len(samples)/sr, 2))
json.dump(out, open("ad3/vo/lines.json", "w"))
print("total", round(sum(o["dur"] for o in out), 2))
