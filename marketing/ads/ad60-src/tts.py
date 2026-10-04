import json, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro/kokoro-v1.0.onnx", "kokoro/voices-v1.0.bin")
LINES = [
 "Running a business means doing ten jobs at once. Invoices. Taxes. Hiring. Licences. Marketing.",
 "And somehow, you still have to serve your customers.",
 "What if you had a whole team behind you?",
 "Meet Boterra AI. The AI workforce that runs your business.",
 "Twenty-six AI agents, across every department. Finance, operations, sales, HR, legal, and compliance.",
 "Just give Atlas, your AI chief of staff, one goal. Like: open a second café by Q3.",
 "Quinn forecasts your cash flow. Sentinel checks your licences. Nova plans the launch.",
 "And nothing risky happens without you. You approve every big decision, and every action is logged.",
 "With industry packs for retail, restaurants, clinics, logistics, and more.",
 "Run your business like a company ten times your size.",
 "Start free today, with a fourteen-day full trial. No card needed.",
 "Boterra AI. Visit w w w, dot boterra, dot I O.",
]
out = []
for i, text in enumerate(LINES):
    samples, sr = k.create(text, voice="af_heart", speed=1.0, lang="en-us")
    path = f"ad60/vo/{i:02d}.wav"
    sf.write(path, samples, sr)
    out.append({"i": i, "text": text, "dur": round(len(samples) / sr, 3), "sr": sr})
    print(i, round(len(samples)/sr, 2))
json.dump(out, open("ad60/vo/lines.json", "w"), indent=1)
print("total", round(sum(o["dur"] for o in out), 2))
