"""Run the built site locally without keeping a terminal open."""

from __future__ import annotations

import ctypes
import json
import os
from pathlib import Path
import threading
import time
from urllib.error import URLError
from urllib.request import urlopen
import webbrowser


ROOT = Path(__file__).resolve().parent
URL = "http://localhost:5173"
HEALTH_URL = f"{URL}/api/health"


def message(text: str) -> None:
    ctypes.windll.user32.MessageBoxW(None, text, "Drop-It English", 0x30)


def is_our_server() -> bool:
    try:
        with urlopen(HEALTH_URL, timeout=1) as response:
            return json.load(response).get("app") == "infinite-canvas-note"
    except (OSError, ValueError, URLError):
        return False


def port_is_busy() -> bool:
    import socket

    try:
        with socket.create_connection(("127.0.0.1", 5173), timeout=1):
            return True
    except OSError:
        return False


def open_when_ready() -> None:
    for _ in range(60):
        if is_our_server():
            webbrowser.open(URL)
            return
        time.sleep(0.25)
    message("Local service did not start. Check the local log or reopen the website.")


def main() -> None:
    if is_our_server():
        webbrowser.open(URL)
        return
    if port_is_busy():
        message("Port 5173 is in use. Close the existing development service and run open_site.bat again.")
        return
    if not (ROOT / "frontend" / "dist" / "index.html").is_file():
        message("Frontend build is missing. Run npm run build in frontend first.")
        return

    os.chdir(ROOT)
    log_dir = Path(os.environ.get("LOCALAPPDATA", ROOT)) / "DropItEnglish"
    log_dir.mkdir(parents=True, exist_ok=True)
    with (log_dir / "local_site.log").open("a", encoding="utf-8") as log:
        import sys
        sys.stdout = log
        sys.stderr = log
        threading.Thread(target=open_when_ready, daemon=True).start()
        try:
            import uvicorn
            uvicorn.run("backend.main:app", host="127.0.0.1", port=5173, access_log=False)
        except Exception as error:
            print(f"Local service failed: {error!r}", file=log, flush=True)
            message("Local service failed. Check the log: " + str(log_dir / "local_site.log"))


if __name__ == "__main__":
    main()
