# Windows Desktop

This directory contains the native pywebview/Edge WebView2 launcher, development server lifecycle, close checkpoint and icons. `Template/Template English.drop` is the only published example.

Use `run.bat` for normal source startup and `run_dev.bat` for Vite hot reload. Build from the project root with `npm run desktop:dist`. The distribution runs DropIt.exe beside pinboard-service.exe and requires the system WebView2 Runtime.

Language defaults to English. First-use confirmation and runtime data are stored separately under `%LOCALAPPDATA%/DropItEnglish`. Files/Template, Save and Temporary are created beside the app. The frameless window supports four-edge/four-corner resizing and Windows Snap half-screen/maximize when its title bar is dragged to a screen edge. Native close waits for a full draft checkpoint. See the root desktop specification for details.
