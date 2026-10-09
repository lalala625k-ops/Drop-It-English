# Architecture

Updated 2026-10-08. Product behavior is documented in `product_requirements_document.md`; visual rules in `DESIGN_SPEC.md`; protected parsing boundaries in `image_parsing_rules.md`.

## Stack

React 18, TypeScript and Vite provide the shared frontend. FastAPI and SQLite WAL provide local storage and content parsing. The Windows desktop launcher uses pywebview with system Edge WebView2. PyInstaller freezes a launcher and an adjacent local service; the distribution does not bundle Chromium, Python or Node.js.

The English edition uses `%LOCALAPPDATA%/DropItEnglish` for runtime data and application preferences. It does not import the original edition's desktop database. The designated example is `desktop/Template/Template English.drop`, copied into `Files/Template` in distributions.

## Main modules

| Area | Module | Responsibility |
|---|---|---|
| Composition | `frontend/src/App.tsx` | Canvas layers, hooks, selection targets, dialogs and commands |
| Entry | `frontend/src/main.tsx` | Load language preference before mounting React |
| Language | `frontend/src/i18n/languageStore.ts` | English default, confirmed first-use preference, subscriptions and localized API headers |
| Translation | `frontend/src/i18n/index.ts`, `messages.en.json` | Interface translations and parameterized application errors; user content is excluded |
| Language UI | `components/LanguagePicker.tsx` | First-use choice and the Settings language action |
| Canvas state | `hooks/useCanvasActions.ts`, `useCanvasInit.ts` | Object changes, initialization and history/storage coordination |
| Viewport | `hooks/useViewport.ts`, `useVirtualViewport.ts` | Pan/zoom, focus, fit, viewport persistence and visible-object culling |
| Selection | `hooks/useSelection.ts`, `utils/marqueeSelection.ts` | Cards, groups, origins and pins; additive selection |
| Interactions | `hooks/useCanvasInteractions.ts`, `useCardDrag.ts`, `useCardResize.ts` | Drag, marquee, links and resize gestures |
| Groups | `hooks/useBundleGroups.ts`, `useGroups.ts` | Outer groups and circular origins; geometry and linked movement |
| Relationships | `utils/groupRelations.ts`, `linkEndpoints.ts` | Single-parent trees, cycle prevention and border-to-border links |
| Clipboard | `hooks/useCardClipboard.ts`, `utils/canvasClipboard.ts` | Full snapshots, safe cut, ID remapping and click-to-place paste |
| Clipboard transport | `utils/canvasClipboardTransport.ts`, `clipboardImages.ts` | Structured JSON and standard HTML; null-field compatibility and embedded images |
| External content | `hooks/useClipboardPaste.ts`, `useCanvasDrop.ts` | Shared intake for files, links, images and text |
| Pinterest | `utils/pinterestTransfer.ts` | Read private drag formats, validate Pin IDs and trusted preview URLs |
| Images | `utils/ingestScreenshot.ts`, `pendingImages.ts` | Local image staging and upload; keep original if remote asset is unavailable |
| Card UI | `components/CardComponent.tsx`, `components/card/` | Body, floating title, badges, resize handles and image rendering |
| Commands | `utils/radialMenuModel.ts`, `radialMenuGeometry.ts`, `components/RadialCommandMenu.tsx` | Fixed angles, circular hit targets, four submenus and tree-like links |
| Settings | `components/SettingsModal.tsx`, `components/settings/` | Settings tree, shortcut catalog, file/recovery/canvas controls and language button |
| Search/pins | `components/SearchModal.tsx`, `hooks/useCanvasPins.ts` | Search navigation and eight persistent numbered pins |
| Files | `utils/storage.ts`, `workspaceApi.ts`, `workspaceCache.ts` | Immediate cache, revision-aware object synchronization and `.drop` operations |
| Drafts | `hooks/useWorkspaceDraft.ts` | Idle/continuous autosave and close checkpoint |
| Window | `components/DesktopWindowControls.tsx`, `desktop/app.py`, `desktop/window_chrome.py` | Frameless shell, 40px hover title bar, native edge/corner resizing and Windows Snap |
| Desktop services | `desktop/dev_server.py`, `close_checkpoint.py` | Independent backend/Vite ports and cleanup of owned processes |
| API | `backend/main.py`, `backend/routes/` | Cards, assets, parsing, settings, workspaces and language preference |
| Backend locale | `backend/services/localization.py`, `backend/locale/messages.en.json` | Native titles and API message translation at the response boundary |
| Preferences | `backend/routes/preferences.py` | Application-wide language choice; shared by boards and changing launcher ports |
| Persistence | `backend/services/storage.py`, `atomic_files.py`, `workspace_session.py` | SQLite revisions, atomic disk writes and independent board identity |
| Recovery | `backend/services/draft_store.py`, `draft_resources.py` | Version retention, resource checksums and restoring complete snapshots |
| Templates | `backend/services/template_paths.py` | Find/copy the sole English example relative to the application |
| Packaging | `build_desktop.ps1`, `scripts/build_dropit_installer.py` | Two frozen executables, verified four-file payload, ZIP and English NSIS installer |

## Data and translation boundaries

Cards store their content, title, floating title, tags, date, dimensions, position, styling, URL, image and internal parent/group references. Origins and outer groups share the Group model; `kind` distinguishes them. Existing persistence keys and shortcut identifiers are retained.

Language changes update rendering without reloading or remounting the board. Memoized card components subscribe to language changes. Static command/shortcut catalogs keep their original stable identifiers and geometry; labels are translated when rendered. Language never changes a user-authored card, webpage title, OCR text, relationship or viewport.

Language choice is stored in the shared config using only `language_preference`. LocalStorage provides a same-origin cache, while the backend preference remains authoritative across new windows and ports. Native requests carry `Accept-Language`. First-run confirmation is saved only after the backend successfully writes the choice. Resetting canvas preferences does not reset the first-use language confirmation.

The frontend and backend English JSON catalogs must remain identical. Backend response localization is limited to application message fields (`detail`, `message`, `reason`, `migration_error`). Card contents and fetched metadata remain unchanged. Protected scrapers, their registry and dispatch behavior retain the original parsing rules.

## Save and restore

Object edits update React and immediately cache the full state. A 400ms debounce posts revision-aware object changes to SQLite WAL. Stale changes receive HTTP 409; local edits are kept and the user is notified. Uploaded images are separately staged in IndexedDB before the backend asset becomes readable.

Complete drafts include cards, groups, viewport and pins. Default idle autosave is 5 seconds; continuous edits checkpoint within 30 seconds. The last five distinct versions are kept. Drafts use shared image blobs and atomic manifests. Closing the native window waits for a checkpoint and keeps the window open on failure.

Formal `.drop` saves are ZIP archives with `meta.json` and referenced resources. First Save asks for a personal file, including when the initial workspace came from Template. Opening the template does not overwrite it. New boards start empty in independent data directories.

## Verification

Frontend tests cover language lifecycle, translation parameters, clipboard/selection invariants, radial hit geometry and Pinterest payloads. Backend tests cover language/config boundaries, protected scraper rules, storage, template distribution and complete workspace recovery. Desktop tests cover service startup and cleanup. Release checks verify isolated first run, actual embedded assets, payload allowlists and the absence of local secrets or personal boards.
