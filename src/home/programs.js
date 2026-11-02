/* The dashboard's program list. To add a system: add one entry here and put its pages in www through scripts/build-web.js. Nothing else changes. */
const ico=(p)=>`<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
export const PROGRAMS=[
 {id:'pur',name:'Oil Purifier',page:'purifier.html',phone:'mobile-purifier.html',models:'Alfa Laval S 826, P 605 · Mitsubishi SJ30G, SJ30G HIDENS',
  desc:'Run a fuel oil purifier from cold. Line up the system, start the bowl, work the control panel, and clear faults like a blocked strainer or a failed discharge.',
  icon:'<img src="purifier-simulator-logo.svg" alt="">'},
 {id:'fwg',name:'Fresh Water Generator',page:'fwg-simulator-app.html',phone:'mobile-fwg.html',models:'Alfa Laval JWP-26-C80, AQUA Blue E1 C · Il Seung ISF-80',
  desc:'Make fresh water from sea water. Pull vacuum, feed the evaporator, bring on jacket water heat, and keep salinity and output in the window.',
  icon:'<img src="fwg-simulator-logo.svg" alt="">'},
 {id:'boiler',name:'Marine Boiler',page:'boiler-simulator-app.html',phone:'mobile-boiler.html',models:'Aalborg Mission OC · SAACKE FMB-VM · Kangrim PC · Miura GK',
  desc:'Run a composite oil + exhaust-gas boiler. Cascade and feed, light the burner, balance oil vs EG steam, dump, water tests, and inspection trips.',
  icon:ico('<path d="M14 6h20v28H14zM18 10h12M18 34h12M10 14h4M10 24h4M34 18c4 2 6 6 6 10s-2 8-6 10"/><circle cx="24" cy="22" r="3"/>')},
 {id:'next',name:'More systems',soon:true,models:'Compressors, main engine and more',desc:'New engine room systems will appear here as they are built.',
  icon:ico('<circle cx="24" cy="24" r="18"/><path d="M24 15v18M15 24h18"/>')}];
