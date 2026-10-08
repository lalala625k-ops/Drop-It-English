# Desktop Quick Start

Download the portable ZIP or installer from the project Releases page. Portable users should extract the whole folder and run DropIt.exe. Windows 10/11 and Microsoft Edge WebView2 Runtime are required.

First use opens Template English.drop and offers English or Chinese. English is selected by default. The language picker does not repeat once confirmed; Settings → Language changes it later.

Keep `Files` when moving or updating the app. Save stores formal `.drop` boards; Temporary stores recoverable drafts. Runtime data uses `%LOCALAPPDATA%/DropItEnglish`. The English edition is separate from the original edition.

From source, install Python requirements and frontend dependencies, then use `Start Desktop.bat` or `npm run desktop:start`. Use `npm run dev` for hot reload. See `DESKTOP_SPEC.md` for build and release details.
