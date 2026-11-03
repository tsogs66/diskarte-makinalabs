# Capsule notes: boiler and phone/tablet work

Copy this file into `project-mind/vault/projects/upaw/`. The vault is not reachable from the cloud agent, so this is the paste-in copy. PRs: [#2](https://github.com/tsogs66/diskarte-makinalabs/pull/2) boiler, [#3](https://github.com/tsogs66/diskarte-makinalabs/pull/3) phone and tablet UI.

## Boiler simulator (`sim-source/boiler-simulator.html`)

- Mimic is the complete system for both Aalborg and SAACKE: boiler with exhaust gas in and out on the left, burner side on the right with the exhaust oil burner top right, feed pumps, hot well, dump condenser, salinometer, chemical dosing, sample cooler, drains.
- Burner and control panel differ per maker: `burnerGlyph()` and `panelGlyph()`.
- HMI is a full-screen touch GUI, not a plain panel list. `paintHmi()` picks a skin: `tc` (Aalborg touch control) or `sv` (SAACKE). Kangrim keeps the plain panel list. The `Full screen` button (`#hmiFs`) uses the Fullscreen API on `#hmi`, with a `.full` class as fallback.
- Condensate return: 70 % returns at 70 C (`COND_RET`, `COND_T`), with `retKg` and `feedKg` totals.
- Tests: `NODE_PATH=<jsdom deps> node scripts/boiler-check.js` (mimic bindings, glyphs, HMI skins, condensate return).
- Docs: `sim-source/MANUAL-MAPS.md`, `src/shared/info-boiler.html`.

## Phone and tablet UI (`src/shared/ws.js`, `ws-phone.css`; applies to FWG, purifier, boiler)

- Scenario selector lives in the top bar (reveal the bar with the menu button), not in Run. Brand and clock hide on narrow screens. The boiler's scenario group (label, select, Initialize) stays together in the bar.
- Actual readings and Results are separate popup tabs: `Actual` (inputs) and `Results` (worked out values and diagnostics). `Show results ›` and `‹ Back to inputs` sit in the popup header. Results no longer cover the input boxes. Popup tab indices are found by label (`where`), not hard-coded.
- Swipe the mimic to change page: right is Control, left is Steps, down is Data, up is Alarms. A swipe only counts if the mimic did not scroll, so a zoomed mimic pans first and a fresh swipe at its edge turns the page. Minimum travel is 56 px or 12 % of the screen, and the swipe must be mostly along one axis.
- Small labelled handles at the middle of each side (`.wsEdge`) open the same pages by tap. They are not at the corners, so the system back gesture stays clear. They hide while the menu is open.
- Tablets: the "Turn your phone sideways" overlay only applies at 560 px wide or less. Popups can be up to 1100 px wide. Actual and Results are top-aligned.

## Known limits

- The real FWG HTML is only in the vault, so the phone/tablet changes were tested against `src/shell.html` with a stub script, not the finished FWG page. Check it once on a device.
- The "dragging edge" you mentioned is not in this repo's code. It may be the Android system-bar swipe from the edge (`MainActivity.java`) or something in the vault FWG file.
