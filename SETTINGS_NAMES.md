# Settings and Shortcuts

The interface supports English and Chinese. Default English names are stored in `frontend/src/i18n/messages.en.json`; the original Chinese labels and stable IDs are in the shortcut and general catalogs. Switching language changes presentation only.

Shortcut sections: Navigation, Cards, Groups, Layout, Workspace and Editing. General sections: Files, Recovery and Canvas. The Settings header contains Language, Fit All and Close. Editable shortcuts are New Card, Search, Auto Layout, Group, New Origin, Reset Size and Settings; the remaining bindings/gestures are fixed.

The source catalog in `frontend/src/components/settings/shortcutCatalog.ts` lists every action, default binding and explanatory note. `generalCatalog.ts` lists the file, autosave, recovery and canvas controls. The application displays the active values in the same tree layout in either language.

For a quick control table see README.md. Settings → Language remembers the choice across restarts and boards. Reset Defaults does not reset the confirmed language preference.
