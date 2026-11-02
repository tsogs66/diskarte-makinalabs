/* The dashboard's program list. To add a system: add one entry here and put its pages in www through scripts/build-web.js. Nothing else changes. */
const ico=(p)=>`<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
export const PROGRAMS=[
 {id:'pur',name:'Oil Purifier',page:'purifier.html',phone:'mobile-purifier.html',models:'Alfa Laval S 826, P 605 · Mitsubishi SJ30G, SJ30G HIDENS',
  desc:'Run a fuel oil purifier from cold. Line up the system, start the bowl, work the control panel, and clear faults like a blocked strainer or a failed discharge.',
  icon:'<img src="purifier-simulator-logo.svg" alt="">'},
 {id:'fwg',name:'Fresh Water Generator',page:'fwg-simulator-app.html',phone:'mobile-fwg.html',models:'Alfa Laval JWP-26-C80, AQUA Blue E1 C · Il Seung ISF-80',
  desc:'Make fresh water from sea water. Pull vacuum, feed the evaporator, bring on jacket water heat, and keep salinity and output in the window.',
  icon:'<img src="fwg-simulator-logo.svg" alt="">'},
 {id:'next',name:'More systems',soon:true,models:'Boilers, compressors, main engine and more',desc:'New engine room systems will appear here as they are built.',
  icon:ico('<circle cx="24" cy="24" r="18"/><path d="M24 15v18M15 24h18"/>')}];
