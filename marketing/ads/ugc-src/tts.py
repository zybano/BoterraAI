import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro/kokoro-v1.0.onnx", "kokoro/voices-v1.0.bin")
V = "af_bella"
LINES = [
 "Okay, I need to show you guys this, because it literally gave me my weekends back.",
 "So I run a tiny online store, right? And I was spending, like, ten hours a week on invoices, emails and admin.",
 "Then I found Boterra. It's basically a whole team of AI agents, for your business.",
 "Watch how easy this is. I told it what my business does, picked my industry, and boom. It built my team.",
 "Now I just tell Atlas what I want. Like, chase my unpaid invoices, and plan next week's posts.",
 "And it splits the work between the agents. Tally does the invoices, Echo does my socials. I didn't touch a thing.",
 "Best part? It asks me before anything important. I just tap approve.",
 "And every Monday, I get a briefing. It's like a personal assistant who actually gets my business.",
 "Honestly? I'm saving at least eight hours a week. I'm obsessed.",
 "It's free to start. Go to boterra dot I O, and thank me later.",
]
FPS = 30; out = []
for i, text in enumerate(LINES):
    s, sr = k.create(text, voice=V, speed=1.12, lang="en-us")
    sf.write(f"ugc/vo/{i:02d}.wav", s, sr)
    hop = sr // FPS
    env = [float(np.sqrt(np.mean(s[j:j+hop]**2))) for j in range(0, len(s), hop)]
    m = max(env) or 1
    out.append({"text": text, "dur": round(len(s)/sr, 3), "env": [round(e/m, 3) for e in env]})
    print(i, round(len(s)/sr, 2))
json.dump(out, open("ugc/vo/lines.json", "w"))
print("total", round(sum(o["dur"] for o in out), 2))
