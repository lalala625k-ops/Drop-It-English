# Local Development and Use

Run `npm --prefix frontend ci` and install `backend/requirements-desktop.txt`. `npm run desktop:start` starts the native WebView2 shell. `npm run dev` enables Vite hot reload. New development boards use separate service ports and the current frontend source.

For browser mode, run `npm run build` and double-click `open_site.bat`. Browser and desktop modes share card data formats and parsing. Published packages do not need Python or Node.js.

English is the default UI language. The first-use choice is stored in `%LOCALAPPDATA%/DropItEnglish/config.json`; native windows send the selected language with API requests. Do not reset user preferences to demonstrate first use; use isolated `PINBOARD_CONFIG_DIR`, `PINBOARD_DATA_DIR` and `PINBOARD_APP_ROOT` directories for tests.

`Open Portable.bat` opens `release/Drop-It English 0.1`. Rebuild packages after source changes; existing ZIPs and installers do not update themselves. Save all boards and close app windows before replacing an executable.

Keep service credentials in ignored `.local.json`, `.local.csv` or `.env` files. Never copy runtime Files/data or private configurations into a public source export or release payload.
