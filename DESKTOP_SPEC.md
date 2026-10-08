# Desktop and Release Specification

Drop-It English 0.1 uses pywebview and the system Microsoft Edge WebView2 Runtime on Windows 10/11. The React frontend and FastAPI backend are shared with browser mode. No bundled Chromium or Python/Node installation is required for released packages.

## Startup

`desktop/app.py` starts an adjacent frozen service in a distribution, or runs FastAPI directly from source. Backend readiness is checked before the window loads. Development uses a managed Vite server with an IPv4 localhost proxy; each new board has separate backend/Vite ports and current source. Closing the window only stops owned processes after its draft checkpoint.

The shell is frameless. Hovering the top 40px shows its title bar; drag moves the window and double-click maximizes/restores. Native buttons remain available. F5 reloads the page. Language choice loads before React mounts; it defaults to English and persists in the shared English-edition config.

## Build

```powershell
python -m pip install -r backend/requirements-desktop.txt
npm --prefix frontend ci
npm run desktop:dist
```

PyInstaller, 7-Zip and NSIS are needed on the build host. `PINBOARD_MAKENSIS` can identify a portable NSIS compiler. The build script freezes the frontend inside the service and includes the English translation catalog in both executables.

```text
release/
├── Drop-It English 0.1/
│   ├── DropIt.exe
│   ├── pinboard-service.exe
│   ├── README.txt
│   └── Files/
│       ├── Template/Template English.drop
│       ├── Save/
│       └── Temporary/
├── Drop-It-English-0.1-Portable.zip
└── Drop-It-English-Setup-0.1.exe
```

Packaging validates this exact four-file payload and rejects symlinks, junctions, extra examples and runtime data. Rebuilding over a folder containing personal files is refused. English NSIS installs to the current user's local application directory, creates desktop/Start menu shortcuts and writes a separate uninstall entry. Uninstall keeps user files.

## Data boundaries

Runtime config, SQLite databases and images use `%LOCALAPPDATA%/DropItEnglish`. Formal boards and drafts use the Files folders beside the app unless configured otherwise or the directory is unwritable. Data is independent of the original Chinese edition. Neither the build process nor public repository copies local credentials or existing boards.

## Release checks

Run frontend language, clipboard, menu and Pinterest tests; backend tests; and desktop startup tests. Verify first-use language selection, restart persistence, English template loading, native labels, board save/recovery and an isolated compiled-service launch. Inspect frozen archives for unwanted private files. Validate ZIP/installer payloads and SHA256 hashes before publishing through the official GitHub CLI.
