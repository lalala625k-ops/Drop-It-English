# Project Instructions

This is an infinite canvas for text, images and links, built with React/TypeScript/Vite and FastAPI. The English edition defaults to English and supports Chinese through a shared language preference.

- Use `product_requirements_document.md` for product behavior, `DESIGN_SPEC.md` for visual changes and `ARCHITECTURE.md` to locate code.
- Before modifying protected scrapers, the fallback scraper or parsing dispatch, read `image_parsing_rules.md`. Do not change locked parsing logic without an explicit user instruction for that rule.
- When changing cards, groups, origins, pins or viewport state, verify save and restore behavior.
- Translate interface labels and messages using the i18n catalogs. Never translate or rewrite user-authored cards, OCR content or fetched webpage metadata when the user switches language.
- Keep frontend and backend English catalogs identical. Retain stable action IDs, shortcut keys and persistence formats.
- Treat `.local.json`, `.local.csv` and credential files as private. Read them only when the user explicitly asks to configure or troubleshoot the relevant service. Do not print credential values or publish these files.
- `.gitignore` is not encryption. Inspect every public export and packaged payload. Only `desktop/Template/Template English.drop` may be shipped as an example.
- Use official GitHub and Feishu/Lark APIs or CLIs for platform operations. Do not switch to browser automation without the user's instruction. Inspect task-specific help and use structured JSON/body files. Authorization to use a CLI is not authorization to publish or message others.
