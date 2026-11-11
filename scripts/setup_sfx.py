"""
Freesound API & Sound Effects helper.
Provides capability to download sound effects from Freesound API (if API KEY provided)
and synthesizes/downloads fallbacks for animal sounds, cheer, correct, wrong, click, drag, win.
"""
import os
import math
import wave
import struct
import json
import urllib.request
import urllib.parse

SFX_DIR = os.path.join(os.path.dirname(__file__), "..", "audio", "sfx")
os.makedirs(SFX_DIR, exist_ok=True)

FREESOUND_API_KEY = os.environ.get("FREESOUND_API_KEY", "")

def fetch_freesound(query, output_filename, max_duration=3):
    """Fetch preview mp3 from Freesound API if key exists."""
    if not FREESOUND_API_KEY:
        print(f"No FREESOUND_API_KEY found, skipping live Freesound search for '{query}'.")
        return False
    try:
        url = f"https://freesound.org/apiv2/search/text/?query={urllib.parse.quote(query)}&filter=duration:[0.1+TO+{max_duration}]&fields=id,name,previews&token={FREESOUND_API_KEY}"
        req = urllib.request.Request(url, headers={'User-Agent': 'AnubanKidsGame/1.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if results:
                preview_url = results[0].get('previews', {}).get('preview-lq-mp3')
                if preview_url:
                    out_path = os.path.join(SFX_DIR, output_filename)
                    req_dl = urllib.request.Request(preview_url, headers={'User-Agent': 'AnubanKidsGame/1.0'})
                    with urllib.request.urlopen(req_dl, timeout=8) as dl_resp:
                        with open(out_path, 'wb') as f:
                            f.write(dl_resp.read())
                    print(f"Downloaded '{query}' from Freesound -> {output_filename}")
                    return True
    except Exception as e:
        print(f"Freesound fetch error for {query}: {e}")
    return False

def make_wav(filename, samples, sample_rate=22050):
    filepath = os.path.join(SFX_DIR, filename)
    with wave.open(filepath, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        packed = struct.pack(f'<{len(samples)}h', *[max(-32767, min(32767, int(s))) for s in samples])
        wf.writeframes(packed)
    print(f"Synthesized clean SFX -> {filename}")

def generate_cat_meow():
    # Cat meow: starts around 400Hz, glides to 850Hz, then down to 500Hz with vibrato
    sr = 22050
    dur = 0.65
    samples = []
    total = int(sr * dur)
    for i in range(total):
        t = i / sr
        # envelope
        env = math.sin(math.pi * (t / dur)) ** 1.5
        # frequency glide
        if t < 0.25:
            freq = 420 + (820 - 420) * (t / 0.25)
        else:
            freq = 820 - (820 - 500) * ((t - 0.25) / (dur - 0.25))
        # vibrato
        vib = 15 * math.sin(2 * math.pi * 6 * t)
        phase = 2 * math.pi * (freq + vib) * t
        # harmonic mix
        val = 0.7 * math.sin(phase) + 0.3 * math.sin(2 * phase)
        samples.append(int(val * env * 25000))
    make_wav('cat.wav', samples, sr)

def generate_dog_bark():
    # Short punchy bark: low noise + burst at 220-400Hz
    sr = 22050
    samples = []
    for rep in range(2):
        dur = 0.16
        total = int(sr * dur)
        for i in range(total):
            t = i / sr
            env = math.exp(-t * 22)
            freq = 320 - t * 600
            val = math.sin(2 * math.pi * max(120, freq) * t)
            # slight pitch drop
            samples.append(int(val * env * 26000))
        # pause between barks
        samples.extend([0] * int(sr * 0.08))
    make_wav('dog.wav', samples, sr)

def generate_frog_croak():
    # Frog ribbit: rhythmic modulations around 180-260Hz
    sr = 22050
    samples = []
    for _ in range(2):
        dur = 0.18
        total = int(sr * dur)
        for i in range(total):
            t = i / sr
            env = math.sin(math.pi * (t / dur))
            mod = (math.sin(2 * math.pi * 45 * t) + 1) / 2
            val = math.sin(2 * math.pi * 200 * t) * mod
            samples.append(int(val * env * 28000))
        samples.extend([0] * int(sr * 0.06))
    make_wav('frog.wav', samples, sr)

def generate_rabbit_hop():
    # Cute cartoon hop/boing
    sr = 22050
    dur = 0.3
    total = int(sr * dur)
    samples = []
    for i in range(total):
        t = i / sr
        env = math.exp(-t * 9)
        freq = 300 + 400 * (t / dur)
        val = math.sin(2 * math.pi * freq * t)
        samples.append(int(val * env * 26000))
    make_wav('rabbit.wav', samples, sr)

def generate_cheer_win():
    # Major triad chime fanfare (C5, E5, G5, C6)
    sr = 22050
    freqs = [523.25, 659.25, 783.99, 1046.50]
    samples = []
    for f in freqs:
        dur = 0.14
        total = int(sr * dur)
        for i in range(total):
            t = i / sr
            env = math.sin(math.pi * (t / dur))
            val = math.sin(2 * math.pi * f * t) + 0.4 * math.sin(4 * math.pi * f * t)
            samples.append(int(val * env * 18000))
    # final sustained ring
    total_ring = int(sr * 0.4)
    for i in range(total_ring):
        t = i / sr
        env = math.exp(-t * 5)
        val = math.sin(2 * math.pi * 1046.50 * t) + 0.5 * math.sin(2 * math.pi * 1318.51 * t)
        samples.append(int(val * env * 20000))
    make_wav('win.wav', samples, sr)

def generate_correct():
    # Happy ascending 2-tone chime
    sr = 22050
    samples = []
    for f in [587.33, 880.0]:
        dur = 0.12
        total = int(sr * dur)
        for i in range(total):
            t = i / sr
            env = math.sin(math.pi * (t / dur))
            val = math.sin(2 * math.pi * f * t)
            samples.append(int(val * env * 24000))
    make_wav('correct.wav', samples, sr)

def generate_wrong():
    # Low "uh-oh" buzzer
    sr = 22050
    dur = 0.22
    total = int(sr * dur)
    samples = []
    for i in range(total):
        t = i / sr
        env = math.exp(-t * 6)
        freq = 190 - 40 * (t / dur)
        val = math.sin(2 * math.pi * freq * t) + 0.5 * math.sin(4 * math.pi * freq * t)
        samples.append(int(val * env * 25000))
    make_wav('wrong.wav', samples, sr)

def main():
    # Attempt Freesound queries if API key is provided
    fetch_freesound("cat meow", "cat.mp3")
    fetch_freesound("dog bark", "dog.mp3")
    fetch_freesound("frog croak", "frog.mp3")
    fetch_freesound("cheer victory", "win.mp3")
    fetch_freesound("correct chime", "correct.mp3")
    fetch_freesound("wrong buzzer", "wrong.mp3")

    # Generate offline high-clarity wav fallbacks
    generate_cat_meow()
    generate_dog_bark()
    generate_frog_croak()
    generate_rabbit_hop()
    generate_cheer_win()
    generate_correct()
    generate_wrong()
    print("All SFX generation complete!")

if __name__ == '__main__':
    main()

