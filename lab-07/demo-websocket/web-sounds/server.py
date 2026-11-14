"""
Option 2: audio engine lives in the browser (Web Audio API).
Python only sends *control* messages over a WebSocket: which note to play,
when, and any parameter changes. No audio samples ever cross the wire.

Run:  ../../../.venv/bin/python server.py
Then open index.html in a browser (plain double-click is enough, no web
server needed for this demo).
"""
import asyncio
import json

import websockets

SCALE = [0, 2, 4, 5, 7, 9, 11, 12]   # major scale, in semitones
ROOT = 57                            # A3 in MIDI


def midi_to_freq(midi):
    return 440 * 2 ** ((midi - 69) / 12)


async def arpeggiate(ws):
    """The 'sequencer': Python decides WHEN and WHAT, the browser decides HOW it sounds."""
    i = 0
    while True:
        freq = midi_to_freq(ROOT + SCALE[i % len(SCALE)])
        await ws.send(json.dumps({"type": "note_on", "freq": freq}))
        await asyncio.sleep(0.15)
        await ws.send(json.dumps({"type": "note_off", "freq": freq}))
        i += 1


async def handler(ws):
    print("browser connected")
    arp_task = None
    try:
        async for message in ws:               # messages coming FROM the browser
            data = json.loads(message)

            if data.get("type") == "start" and arp_task is None:
                arp_task = asyncio.create_task(arpeggiate(ws))
                print("arpeggio started")

            elif data.get("type") == "stop" and arp_task is not None:
                arp_task.cancel()
                arp_task = None
                await ws.send(json.dumps({"type": "all_notes_off"}))
                print("arpeggio stopped")

            else:
                print("from browser:", data)    # e.g. a knob moved: {"cutoff": 0.4}
    finally:
        if arp_task is not None:
            arp_task.cancel()
        print("browser disconnected")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("listening on ws://localhost:8765 ...")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
