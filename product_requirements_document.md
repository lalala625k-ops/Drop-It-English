# Product Behavior — Drop-It English 0.1

Updated 2026-10-08. This edition translates the interface and example while retaining the original application features, shortcuts, geometry and data formats.

## Language and first use

English is the default. First use opens `Template English.drop` and displays a language picker with English and Chinese. Confirmation is saved in the application preference so it does not repeat after restart, reload, new boards or changing launcher ports. Settings contains a Language button for later changes. Language changes leave board content, relationships, selection and viewport intact.

The sole shipped example contains 57 cards, eight groups/origins and two pins. Its text and metadata are English; embedded images remain in the archive. English text cards are sized to fit the translated content. Tracking parameters and personal document references are removed. Normal user content is never automatically translated.

## Content

- Text cards support Markdown, editing, floating titles, tags and dates.
- Image cards support paste, drag, proportional sizing, OCR and source-link recognition.
- Web links create cards with the original URL, title, description and available cover. Missing or unreadable covers fall back to compact links.
- Native image files and ordinary image URLs create image cards. Ordinary pasted text creates a text card.
- Pinterest closeup and grid drag MIME formats and `pinterest-pin:` text restore the Pin URL. These references take priority over accompanying image files/CDN links. A trusted Pinterest preview may be retained if metadata fails.
- OCR/source recognition failure keeps the original image. Source recognition uses explicit references first, then configured AI/search services. No service keys are included in releases.

## Canvas interactions

Space/Alt + left drag or middle drag pans. The wheel zooms around the pointer. Alt + middle drag provides continuous zoom. Double-click a card to focus it and repeat to return to the previous view. Double-click empty canvas for search.

Marquee selection includes cards, origins, outer groups and pins. Shift adds or toggles selection. Crossing a group boundary or enclosing it selects the group; a small marquee inside an expanded group selects its individual members. Ctrl+marquee may target a group area directly.

Normal dragging moves an object and its linked descendants. Ctrl/Cmd+drag moves only that object, including a group's own members. Resize handles and proportional scaling retain existing behavior. Nearby cards can snap during a single-card drag with Shift+Space.

## Groups and links

Origins are circular root-like nodes. Outer groups collect cards in expandable/collapsible outlines. Ctrl+G groups selected cards, Ctrl+Shift+G ungroups, and Ctrl+Alt+G detaches selected members. These operations preserve linked objects where appropriate and enter history.

Ctrl+Shift+drag creates links from cards, groups or origins to a target. Each node has a single parent. Cycles are rejected. Release on empty canvas or use the existing unlink command to detach a parent. Groups inherit upstream connections when dissolved or detached.

## Clipboard

Ctrl+C and Ctrl+X collect selected cards, origins, outer groups and pins. Selecting a group includes its members; selecting individual members does not implicitly copy the rest of the group. Titles, content, geometry, styles, tags, dates and internal connections are retained.

Cut removes originals only after complete clipboard data is written successfully. If the original changed during writing, it is kept. Image originals are embedded for cross-board persistence. Failed clipboard writes keep originals.

Ctrl+V reads complete structured objects first and shows a pointer-following preview. Click to place; Escape cancels. IDs and internal references are remapped. Cross-board external links are detached. Pins use free numbers; insufficient pin capacity cancels the whole paste. External text, URLs and images are added directly through the common intake path.

## Menus

Common commands retain the same clock angles even when some actions are unavailable. New Note and Title occupy 12 o'clock; adjacent related commands keep their original directions. Only these branches are nested:

| Branch | Children |
|---|---|
| Files | Open, Save, Save As, New Board |
| Layout | Reset, Equal Width, Auto Layout |
| Group | Group, Ungroup, Detach, Unlink |
| Recognize | OCR, Source, Parse |

Cut, Copy, Paste, Origin, Title, Tags and Color remain top-level where applicable. Duplicate, Undo and Fit are not added to the right-click menu. Every visible child circle has hit priority over neighboring main sectors. Links join the menu circles in the same visual language as canvas tree links.

## Navigation and settings

Search includes titles, content, URLs, descriptions and tags. Arrow keys choose results; Enter navigates. Pins use numbers 1–8 and Ctrl+number to jump. M expands the minimap; minimap click/marquee navigates. Shift+1 fits the canvas.

Settings retains its tree layout and six shortcut sections: Navigation, Cards, Groups, Layout, Workspace and Editing. General contains Files, Recovery and Canvas. The removed Maintenance section remains absent. Settings exposes seven editable shortcut bindings; other entries document fixed operations and gestures.

## Files and recovery

`Files/Template`, `Files/Save` and `Files/Temporary` live beside the app. If that location is not writable, the app falls back to its per-user folder and shows the actual locations. First Open starts in Template; later successful personal opens remember their path. First Save/Save As starts in Save and uses native `.drop` dialogs.

Cards/groups use immediate local cache and revision-aware SQLite WAL synchronization. Pins and viewport are also persisted. The default autosave delay is five idle seconds and at most 30 seconds during continuous edits. Keep five distinct recovery versions by default. Settings changes these folders/intervals and displays recoverable versions.

Restoring a version first preserves current edits in a separate draft. Formal saves are not overwritten by background drafts. Corrupt or incomplete versions do not silently replace valid data. Native close performs a final checkpoint; failure leaves the window open.

English edition runtime data lives under `%LOCALAPPDATA%/DropItEnglish`, independently of the original edition. Installer uninstall retains user boards, drafts and runtime data. Source and release payloads contain no personal boards or configured credentials.

## Rendering and desktop shell

The frameless desktop window keeps transparent window buttons. Hovering the top 40px shows a draggable title bar; double-click maximizes/restores. Its four edges and four corners retain native Windows resize hit areas, and dragging the title bar to a screen edge invokes Windows Snap for half-screen layouts or maximization. The minimum window size is 480×320. It hides on leave and stays visible while dragging or focused. This behavior and canvas gestures are unchanged.

The parchment canvas, paper cards, dark outlines, origin colors, group outlines, typography, minimap and distant-object rendering retain the existing design. Offscreen objects use spatial culling; dense distant views use simplified rendering. FPS and recognition diagnostic panels remain unmounted.

## Distribution

Publish source under MIT in `Drop-It-English`. Windows packages consist of DropIt.exe, pinboard-service.exe, README.txt and the sole English template. Include an English per-user installer, portable ZIP and SHA256SUMS.txt. Save/Temporary start empty. Personal data, local credentials, caches and build output must not be committed or packaged.
