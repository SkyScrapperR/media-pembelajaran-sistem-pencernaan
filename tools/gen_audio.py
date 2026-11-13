"""Membuat file narasi MP3 dari narasi.json dengan edge-tts.

Pemakaian: python gen_audio.py narasi.json folder_keluaran
"""
import asyncio
import json
import os
import sys

import edge_tts

VOICE = os.environ.get("NARASI_VOICE", "id-ID-GadisNeural")
RATE = os.environ.get("NARASI_RATE", "-4%")
LABEL = os.environ.get("NARASI_LABEL", "Gadis")
SAMPLES = [
    ("gadis", "id-ID-GadisNeural", "Gadis (perempuan, Indonesia)"),
    ("ardi", "id-ID-ArdiNeural", "Ardi (laki-laki, Indonesia)"),
    ("ava", "en-US-AvaMultilingualNeural", "Ava (perempuan, multibahasa)"),
    ("emma", "en-US-EmmaMultilingualNeural", "Emma (perempuan, multibahasa)"),
    ("andrew", "en-US-AndrewMultilingualNeural", "Andrew (laki-laki, multibahasa)"),
    ("brian", "en-US-BrianMultilingualNeural", "Brian (laki-laki, multibahasa)"),
]


async def say(text, voice, rate, path, pitch="+0Hz"):
    for attempt in range(3):
        try:
            await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(path)
            if os.path.getsize(path) > 1000:
                return True
        except Exception as e:  # noqa: BLE001
            print("  gagal", voice, os.path.basename(path), e)
            await asyncio.sleep(1.5)
    return False


async def main(src, out):
    clips = json.load(open(src, encoding="utf-8"))
    os.makedirs(out, exist_ok=True)
    done = {}
    for key, item in clips.items():
        if isinstance(item, dict):
            ok = await say(item["teks"], item.get("voice", VOICE), item.get("rate", RATE), os.path.join(out, key + ".mp3"), item.get("pitch", "+0Hz"))
        else:
            ok = await say(item, VOICE, RATE, os.path.join(out, key + ".mp3"))
        print(("ok  " if ok else "GAGAL ") + key)
        if ok:
            done[key] = key + ".mp3"
    if done:
        json.dump({"voice": VOICE, "label": LABEL, "files": done},
                  open(os.path.join(out, "manifest.json"), "w"), ensure_ascii=False)
    if os.environ.get("TANPA_CONTOH") or "coba" not in clips:
        return
    sample_dir = os.path.join(out, "contoh")
    os.makedirs(sample_dir, exist_ok=True)
    text = clips["coba"] + " " + clips["tahap-1"]
    made = []
    for slug, voice, label in SAMPLES:
        if await say(text, voice, RATE, os.path.join(sample_dir, slug + ".mp3")):
            made.append((slug, label))
    rows = "".join(
        f'<li><b>{label}</b><audio controls preload="none" src="{slug}.mp3"></audio></li>' for slug, label in made)
    html = ('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Contoh suara narasi</title><style>body{font-family:system-ui,sans-serif;max-width:640px;margin:32px auto;'
            'padding:0 16px;background:#10191a;color:#eef}li{margin:14px 0;list-style:none}audio{display:block;width:100%;margin-top:6px}</style>'
            f'<h1>Contoh suara narasi</h1><p>Teks yang sama dibacakan oleh setiap suara.</p><ul>{rows}</ul>')
    open(os.path.join(sample_dir, "index.html"), "w", encoding="utf-8").write(html)


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], sys.argv[2]))
