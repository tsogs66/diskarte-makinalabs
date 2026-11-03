# Marine Boiler — Manual maps (provisional)

**Status:** provisional until owner PDFs are under `boiler-manuals/` (gitignored for copyright). Do not invent HMI menus beyond this map; mark gaps **estimated** in Basis.

Shared SI plant physics; each unit’s HMI / sequences / trips / recommended actions follow that maker only.

See vault `boiler-manuals/MANUAL-MAPS.md` for the full checklist. Source of truth for the live page is `sim-source/boiler-simulator.html` (mirrored from vault `boiler-simulator.html`).

## Units

### Mission OC (Aalborg / Alfa Laval) — Mission Control Touch (provisional)
- Touch-style pages: Overview · Burner · Dump · Alarms · Water · PID · Service
- Cold start: cascade → feed → FD/FO → Auto burner → steam stop → EG observe oil vs EG t/h
- Dump Auto / Manual on Dump page; pressure→burner separate
- **Estimated:** exact Touch menu tree and password service paths

### SAACKE FMB-VM — BMS + EG circ when fitted
- BMS sequence cues (purge / pilot / main / post) on HMI home
- Forced EG circulating pump when `egCirc` fitted; dry-run protection if water unsafe
- Dump Auto PID independent of burner PID
- **Estimated:** full BMS parameter pages and proprietary fault codes

### Kangrim PC — panel provisional
- Panel-first cues: fewer Touch pages; local lamps + starters emphasise panel workflow
- Pin-tube / composite oil+EG same shared plant
- **Estimated:** exact panel legend and switch labels from maker drawing

### Miura GK — sequencer provisional
- Sequencer lamps: OFF · PURGE · PILOT · MAIN · POST · TRIP
- Step gates for light-up match shared physics
- **Estimated:** SOM detail screens and Japanese/English menu wording

## Shared (all units)
- Dump Auto PID + Manual bumpless · distillate air-bleed (bleed, not restart alone)
- Dosing pump + manual dose · water tests → recommendations → apply → retest
- Chloride never dosed away; blowdown reduces Cl / conductivity
- Inspection: LWL / LLWL / flame fail / high P. The test cause stays latched until ack → clear → reset. PASS is refused until that path is done. LWL is alarm-only (no lockout reset).
- FO viscosity gate by fuel grade · shrink/swell teaching on indicated level
- Local soot blow (needs steam stop and about 2 bar) clears an EG soot drill: ΔP down, EG t/h up
- FO filter change-over restores FO pressure after a dirty in-service filter
- Dirty flame scanner: clean on the local panel, then reset. Reset stays blocked while the eye is dirty. An inspection flame-fail test is a separate cause.
- Water exercise includes a seawater leak drill. Blowdown lowers chloride; isolating the leak stops the rebound. Dosing never removes chloride. Leak rate is a drill, not a measured ship value.
- Mimic layout (owner reference, complete system for all units): EG gas in bottom left, out top left through the tube bank; furnace, flame and burner on the right; oil flue out top right. Steam header feeds service steam (steam stop) and the dump condenser; condensate returns to the hot well (dump 100 %, service steam 70 % at 70 °C, both estimated). Feed pumps, chemical dosing into the feed line, sample cooler, salinometer (shows boiler-water Cl) and blowdown overboard follow the model. Burner and control-panel glyphs are per maker and provisional: Aalborg touch panel + pressure-jet style, SAACKE BMS cabinet + blue blower housing, Kangrim relay panel, Miura sequencer panel. Replace the glyphs when maker drawings are filed. Dump-condenser cooling water is assumed available. SAACKE adds the EG circ loop. Schematic, not a maker drawing.
- Oil+EG composite one drum; EG-only status when oil flame off and EG steaming
- Cold cascade feed is charged as sensible heat (no economiser credit)
- HMI look (public brochures, not maker screens): Aalborg Touch Control is a full-screen colour touch GUI with a title bar, page tabs, a boiler system view with live pipe/valve status, a fuel state box and a bottom button bar (Alfa Laval Touch Control brochure; OC-TCi uses Aalborg Control Touch). SAACKE uses se@vis / seavis touch screens (5.7 in or 10.4 in) with a tile overview (load dial, pressure, level, flue gas, lamps) and function keys; a Siemens KTP1000 BBMS retrofit also exists, and which one a given FMB-VM carries is unconfirmed. The simulator draws both as full-screen touch GUIs with a Full screen button; page names and layout are provisional. Kangrim and Miura keep the plain list HMI.
