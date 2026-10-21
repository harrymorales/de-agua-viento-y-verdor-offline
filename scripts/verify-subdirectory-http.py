"""Prueba cuatro rutas HTTP del paquete en un subdirectorio local."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import mimetypes
from pathlib import Path
from threading import Thread
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
mimetypes.add_type("image/webp", ".webp")
handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT / "delivery"))
server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
base = f"http://127.0.0.1:{server.server_port}/maguare-webp-revision/"
paths = {
    "index.html": "text/html",
    "territories/palenque/index.html": "text/html",
    "images/cofan/web/conoce/01-cuando-un-nino-cofan-llega-al-mundo.webp": "image/webp",
    "og.webp": "image/webp",
}
try:
    for path, expected_type in paths.items():
        with urlopen(Request(base + path, method="HEAD"), timeout=10) as response:
            actual_type = response.headers.get_content_type()
            if response.status != 200 or actual_type != expected_type:
                raise AssertionError(f"{path}: {response.status}, {actual_type}")
            print(f"200 {actual_type}: {path}")
finally:
    server.shutdown()
    thread.join(timeout=5)
    server.server_close()
