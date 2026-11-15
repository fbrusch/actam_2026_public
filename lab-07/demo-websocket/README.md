## Running itWS

Requires `websockets` in the venv (`pip install websockets`).

```
cd option2_control && ../../../.venv/bin/python server.py   # ws://localhost:8765
cd option3_stream  && ../../../.venv/bin/python server.py   # ws://localhost:8766SSS
```

Open the matching `index.html` directly in the browser (file://, no web server needed, only the WebSocket endpoint needs a server).