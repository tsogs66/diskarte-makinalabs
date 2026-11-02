/* --- control unit faces drawn in SVG, in the same coordinates as the hot spots and lamps in panels.js: EPC 50 (S 826), EPC 60 (P 605), Samgong panel (SJ) --- */
const FF='font-family="Arial,Roboto,sans-serif"';
const fT=(x,y,t,fs,c,o='')=>`<text x="${x}" y="${y}" ${FF} font-size="${fs}" font-weight="700" fill="${c}" ${o}>${t}</text>`;
const fArrow=(x,y,d,c,s=1)=>`<path transform="translate(${x} ${y}) rotate(${d}) scale(${s})" d="M0 -16L40 0L0 16L9 0Z" fill="${c}"/>`;
/* EPC 50 mimic parts */
const e5Dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="21" fill="#dfe3e6" stroke="#3a3f43" stroke-width="3"/><circle cx="${x}" cy="${y}" r="14" fill="#8d9193"/>`;
const e5Sq=(x,y)=>`<rect x="${x-21}" y="${y-20}" width="42" height="40" fill="#dfe3e6" stroke="#3a3f43" stroke-width="3"/><circle cx="${x}" cy="${y}" r="13" fill="#8d9193"/>`;
const e5Tag=(x,y,t,c='#3a3f43')=>`<circle cx="${x}" cy="${y}" r="27" fill="#cfd4da" stroke="${c}" stroke-width="4"/><text x="${x}" y="${y+9}" text-anchor="middle" ${FF} font-size="25" font-weight="700" fill="${c}">${t}</text>`;
const e5Valve=(x,y)=>`<path d="M${x-23} ${y-17}V${y+17}L${x+23} ${y-17}V${y+17}Z" fill="#dfe3e6" stroke="#3a3f43" stroke-width="4" stroke-linejoin="round"/>`;
function faceEPC50(){const I='#3a3f43',L='<path d="M';
 return `<rect width="1680" height="944" fill="#0360bf"/>${fT(1460,82,'OP',74,'#fff','font-style="italic"')}
 <rect x="33" y="105" width="1020" height="443" fill="#cfd4da"/>
 <g fill="none" stroke="${I}" stroke-linejoin="round"><path d="M66 230H985M592 230V308H570M678 230V290M697 305V230" stroke-width="9"/><path d="M722 353H955V385" stroke-width="7"/>
 <path d="M112 357H603V330H662M184 357V410H507V442H612M265 357V410" stroke-width="3"/>
 <path d="M665 340L680 308H705L720 345L755 385L770 392V414H790L812 390H860L870 405V480L858 486V505L870 510V520L855 525L805 530V546H617V530H657V482L617 450V398H637Z" stroke-width="4" fill="#cfd4da"/></g>
 ${fArrow(978,230,0,I,1.1)}${fArrow(574,308,180,I,1)}${fArrow(678,290,90,I,.75)}${fArrow(955,380,90,I,1)}${fArrow(652,330,0,I,.35)}${fArrow(602,442,0,I,.35)}
 <circle cx="270" cy="232" r="28" fill="#dfe3e6" stroke="${I}" stroke-width="4"/><path d="M254 208L296 232L254 256Z" fill="${I}"/>
 <rect x="326" y="205" width="54" height="52" fill="#dfe3e6" stroke="#7d8286" stroke-width="3"/><path d="M328 226L350 244L364 224L379 240" fill="none" stroke="${I}" stroke-width="4"/>
 ${e5Tag(433,230,'TT')}${e5Tag(510,230,'PT')}${e5Tag(749,230,'MT')}${e5Tag(828,230,'PT')}${e5Tag(791,356,'PT')}
 ${e5Valve(590,231)}<path d="M578 247H602L590 226Z" fill="#dfe3e6" stroke="${I}" stroke-width="4"/>${e5Valve(906,230)}${e5Valve(868,356)}${e5Valve(147,357)}${e5Valve(228,357)}${e5Valve(311,357)}
 ${[[511,276,'1',24],[566,276,'1',24],[827,274,'4',24],[901,272,'4',24],[750,346,'5',26],[905,346,'5',26],[148,396,'16',28],[229,396,'15',28],[312,396,'10',28]].map(([x,y,t,f])=>fT(x,y,t,f,I,'text-anchor="middle"')).join('')}
 ${[[270,176],[352,175],[433,175],[510,176],[749,176],[829,176],[791,304],[831,430]].map(p=>e5Dot(...p)).join('')}${[[590,176],[905,176],[147,304],[228,304],[311,304],[868,304]].map(p=>e5Sq(...p)).join('')}
 ${fT(68,544,'EPC 50',31,I)}
 <rect x="33" y="572" width="443" height="318" fill="#d3d6da"/><rect x="33" y="572" width="443" height="65" fill="#f3f4f5"/><text x="58" y="616" ${FF} font-size="39" fill="${I}">INFO</text><path d="M33 637H476" stroke="${I}" stroke-width="3"/><path d="M53 665H451M53 715H451M53 763H451M53 811H451M53 859H451" stroke="#8f959a" stroke-width="2"/>
 <rect x="502" y="572" width="551" height="318" fill="#f3f4f5"/><rect x="524" y="587" width="505" height="116" fill="#1b1d20"/>
 ${[[520,134,534,107],[685,134,698,106],[850,186,862,162]].map(([x,w,kx,kw])=>`<rect x="${x}" y="715" width="${w}" height="162" rx="24" fill="#f3f4f5" stroke="#1b1d20" stroke-width="3"/><rect x="${kx}" y="761" width="${kw}" height="103" rx="20" fill="#1b1d20"/>`).join('')}
 ${fT(587,752,'−',44,'#3a3f43','text-anchor="middle"')}${fT(751,754,'+',46,'#3a3f43','text-anchor="middle"')}<text x="943" y="752" text-anchor="middle" ${FF} font-size="39" fill="#3a3f43">ENTER</text>
 <rect x="1079" y="105" width="570" height="785" fill="#f3f4f5"/><rect x="1252" y="118" width="384" height="756" fill="#cfd4da"/>
 ${[[115,156],[272,200],[473,127],[601,115],[717,160]].map(([y,h])=>`<rect x="1094" y="${y}" width="545" height="${h}" rx="26" fill="none" stroke="#1b1d20" stroke-width="3"/>`).join('')}
 ${[[1107,164,99,92],[1107,324,99,95],[1107,501,99,86],[1107,763,99,95]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#1b1d20"/>`).join('')}
 ${[139,296,449,657,739].map(y=>`<circle cx="1179" cy="${y}" r="15" fill="#8d9193" stroke="#3a3f43" stroke-width="3"/>`).join('')}
 <g fill="none" stroke="${I}" stroke-width="3" stroke-linejoin="round"><path d="M1293 183H1357V247H1293ZM1293 215L1318 193L1343 238L1357 222"/>
 <path id="e5sep" d="M1280 292H1345M1320 294L1303 325L1322 335L1303 350V363H1355L1360 340L1335 328L1320 294"/><path d="M1280 382H1345M1320 384L1303 415L1322 425L1303 440V452H1355L1360 430L1335 418L1320 384M1280 372L1298 392M1298 372L1280 392"/>
 <path d="M1314 512V548L1294 556L1312 572H1342L1366 556L1348 548V512M1278 554H1296M1366 554H1386" stroke-width="4"/><path d="M1327 778L1282 856H1372Z" stroke-width="3"/><path d="M1338 784Q1362 806 1374 842" stroke-width="7"/></g>
 ${fArrow(1362,292,0,I,.5)}${fArrow(1362,382,0,I,.5)}
 ${[[1397,246,'HEATER'],[1397,360,'SEPARATION'],[1398,448,'STOP'],[1399,568,'DISCHARGE'],[1400,683,'OP ACTIVE'],[1403,853,'ALARM']].map(([x,y,t])=>fT(x,y,t,27,I)).join('')}`;}
/* EPC 60 keys: white caps, grey lamp hole in the corner */
const e6Key=(x,y,w,h,inner,c='#e9ecec')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${c}" stroke="#111" stroke-width="5"/>${inner||''}`;
const e6Lamp=(x,y)=>`<circle cx="${x}" cy="${y}" r="11" fill="#9aa0a3" stroke="#6d7276" stroke-width="2"/>`;
const e6Cap=(x,y,t,f=19)=>fT(x,y,t,f,'#111','text-anchor="middle"');
const e6Pump=(x,y)=>`<circle cx="${x}" cy="${y}" r="29" fill="none" stroke="#111" stroke-width="5"/><path d="M${x-13} ${y-20}L${x+20} ${y}L${x-13} ${y+20}Z" fill="none" stroke="#111" stroke-width="5" stroke-linejoin="round"/>`;
function faceEPC60(){const B='<g fill="none" stroke="#111" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">';
 return `<rect width="1264" height="1264" rx="26" fill="#b9c0c6"/><rect x="16" y="16" width="1232" height="1232" rx="24" fill="none" stroke="#111" stroke-width="3"/>
 ${fT(156,298,'EPC 60',42,'#eef1f3')}<rect x="154" y="321" width="660" height="244" rx="8" fill="#2c3231"/><rect x="172" y="335" width="626" height="217" fill="#4f8f64"/>
 ${[['7',857,173],['8',988,173],['9',1118,173],['4',857,319],['5',988,319],['6',1118,319],['1',857,465],['2',988,465],['3',1118,465],['.',857,611],['0',988,611]].map(([t,x,y])=>e6Key(x-4,y-4,104,108,fT(x+50,y+74,t,68,'#111','text-anchor="middle"'))).join('')}
 ${e6Key(1114,607,104,108,`${B}<path d="M1192 632V662H1140" stroke-width="10"/></g><path d="M1160 640L1128 662L1160 686Z" fill="#111"/>`)}
 ${e6Key(993,772,104,110,'<path d="M1045 797L1077 856H1013Z" fill="#111"/>')}${e6Key(885,898,104,110,`${B}<path d="M906 932H950Q970 932 970 952Q970 976 950 976H920" stroke-width="10"/></g><path d="M928 912L902 932L928 956Z" fill="#111"/>`)}
 ${e6Key(1109,898,104,110,'<circle cx="1161" cy="922" r="8" fill="#111"/><rect x="1153" y="938" width="16" height="48" fill="#111"/>')}${e6Key(993,1014,104,110,'<path d="M1045 1099L1013 1040H1077Z" fill="#111"/>')}
 ${e6Key(97,789,140,142,'<rect x="161" y="822" width="14" height="76" fill="#fff"/>','#0ca64b')}${e6Key(97,969,140,142,'<circle cx="168" cy="1041" r="35" fill="none" stroke="#fff" stroke-width="13"/>','#ef2b24')}
 ${e6Lamp(117,808)}${e6Lamp(117,988)}
 ${[[268,790],[424,790],[580,790],[736,790],[268,971],[424,971],[580,971],[736,971]].map(([x,y])=>e6Key(x,y,128,142)).join('')}
 ${[[287,809],[443,809],[600,809],[755,808],[287,990],[444,989],[600,990],[755,990]].map(p=>e6Lamp(...p)).join('')}
 ${B}<path d="M307 816H362V875H307ZM307 846L329 824L350 868L362 852" stroke-width="5"/><path d="M482 808L470 830L486 838L464 852V874H518L522 840L500 838L494 814Q490 804 482 808Z" stroke-width="5"/><path d="M630 818L650 842L630 866M652 842H684" stroke-width="5" stroke-dasharray="11 0"/>
 <path d="M778 824H826V866H778ZM798 810H842V852H826M784 878H820M802 866V878" stroke-width="5"/><path d="M485 1012L450 1074H522Z" stroke-width="10"/></g>
 ${e6Pump(333,1022)}${e6Pump(646,1022)}
 ${e6Cap(332,902,'HEATER')}${e6Cap(488,902,'SEPARATOR')}${e6Cap(644,902,'DISCHARGE')}${e6Cap(797,893,'REMOTE',18)}${e6Cap(797,914,'CONTROL',18)}${e6Cap(331,1076,'FEED',18)}${e6Cap(331,1098,'PUMP',18)}${e6Cap(644,1076,'SLUDGE',18)}${e6Cap(644,1098,'PUMP',18)}${e6Cap(800,1038,'CIP',42)}${e6Cap(798,1076,'CLEANING',18)}${e6Cap(798,1098,'IN PLACE',18)}`;}
/* Samgong panel: white pipes on black, the purifier in red */
const sgV=(x,y)=>`<path d="M${x-30} ${y-20}V${y+20}L${x+30} ${y-20}V${y+20}Z" fill="#000" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M${x-16} ${y+30}H${x+16}L${x} ${y}Z" fill="#000" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>`;
const sgRing=(x,y)=>`<circle cx="${x}" cy="${y}" r="24" fill="#27292b" stroke="#f4ea1a" stroke-width="10"/>`;
const sgRing2=(x,y)=>`<circle cx="${x}" cy="${y}" r="14" fill="#27292b" stroke="#f4ea1a" stroke-width="5"/>`;
const sgCapKey=(x,y,w,h,c,lines,fc='#111')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c}" stroke="#55585a" stroke-width="2"/>${lines.map(([t,yy,f])=>fT(x+w/2,y+yy,t,f||31,fc,'text-anchor="middle"')).join('')}`;
function faceSG(){const W='#fff',Y='#f4ea1a',C='#f5dfb8',p=d=>`<path d="${d}" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="miter"/>`;
 return `<rect width="1680" height="944" fill="#000"/><rect x="28" y="24" width="1626" height="894" rx="26" fill="none" stroke="${Y}" stroke-width="8"/>
 ${['SV3:171','SV2:258','SV1:343','SV9:437','SV4:902'].map(v=>{const[t,x]=v.split(':');return fT(x,105,t,31,W,'text-anchor="middle"');}).join('')}
 <path d="M606 133Q594 142 592 178H576L572 205L515 250L510 300L482 318H458V352H452V398H500V486H478V562L490 578L482 610L500 620H712L724 600L700 580L705 575H720V410H800V335L780 322H745L740 315H700L695 250L640 205L636 178H620Q618 142 606 133Z" fill="#fb1420"/>
 ${p('M100 280V214H470M171 165V375H458M258 165V358H458M343 165V344H458M437 165V326')}${p('M170 421H500M716 421H820V330M902 165V175H998M902 195H998M860 175V240M864 318V640M820 330V300M896 300H964V640M168 487H330M368 487H512M580 487H708M740 487H964M168 640H888M932 640H964')}
 <path d="M444 500V640M776 616V640" stroke="#fff" stroke-width="6"/><path d="M444 650V690M776 650V690" stroke="#fff" stroke-width="6" stroke-dasharray="14 8"/>
 ${p('M584 180V340Q584 395 545 410Q530 420 515 421M628 180V340Q628 395 665 410Q680 420 695 421')}
 <path d="M572 335H596M616 335H640M572 375H596M616 375H640" stroke="#fff" stroke-width="6"/><path d="M500 390V450M528 390V450M684 390V450M712 390V450M335 455V515M362 455V515M712 455V515M736 455V515" stroke="#fff" stroke-width="7"/>
 <rect x="515" y="467" width="62" height="40" fill="#fb1420" stroke="#fff" stroke-width="6"/><path d="M528 487H564M552 478L566 487L552 496" fill="none" stroke="#fff" stroke-width="5"/>
 <path d="M436 395Q436 388 492 392" fill="none" stroke="#fb1420" stroke-width="16"/><path d="M424 438L444 470L462 438M444 470V450" fill="none" stroke="#fff" stroke-width="5"/>
 <rect x="755" y="400" width="46" height="180" fill="#fb1420"/><path d="M755 460H801M755 540H801M734 582H824M734 610H824M742 596H816" stroke="#fff" stroke-width="6"/>
 ${sgV(171,214)}${sgV(258,214)}${sgV(343,214)}${sgV(437,214)}${sgV(903,191)}${sgV(864,304)}
 <rect x="841" y="240" width="44" height="28" fill="#000" stroke="#fff" stroke-width="5"/><path d="M804 343L834 386V343L804 386Z" fill="#000" stroke="#fff" stroke-width="5"/><path d="M888 625V655L932 625V655Z" fill="#000" stroke="#fff" stroke-width="5"/>
 ${fArrow(1010,214,180,W,1)}${fArrow(100,300,-90,W,1)}${fArrow(118,421,180,W,1)}${fArrow(158,487,0,W,1)}${fArrow(118,640,180,W,1)}${fArrow(444,712,90,W,.8)}${fArrow(776,712,90,W,.8)}
 ${fT(607,544,'MOTOR',29,W,'text-anchor="middle"')}<circle cx="608" cy="576" r="21" fill="#1a2a1e" stroke="#0a8f30" stroke-width="9"/>
 ${[171,258,343,437,903].map(x=>sgRing(x,141)).join('')}
 <path d="M478 748H180Q162 748 162 766V852Q162 870 180 870H976Q994 870 994 852V766Q994 748 976 748H686" fill="none" stroke="${W}" stroke-width="5"/>${fT(582,759,'CONDITION',31,W,'text-anchor="middle"')}
 ${[232,389,543,710,862].map(x=>sgRing2(x,799)).join('')}${fT(258,806,'LEAK',27,W)}${fT(415,806,'NO-DIS',27,W)}${fT(568,803,'HIDENS',27,W)}${fT(568,836,'ALARM',27,W)}${fT(737,806,'T(H)',27,W)}${fT(888,806,'T(L)',27,W)}
 <path d="M1138 77H1115Q1100 77 1100 92V232Q1100 250 1118 250H1550Q1568 250 1568 232V92Q1568 77 1553 77H1468M1262 77H1362" fill="none" stroke="${W}" stroke-width="5"/>${fT(1200,89,'ADDR.',31,W,'text-anchor="middle"')}${fT(1416,89,'DATA',31,W,'text-anchor="middle"')}
 <rect x="1120" y="105" width="174" height="126" rx="14" fill="#170406" stroke="#e8222a" stroke-width="5"/><rect x="1307" y="105" width="243" height="126" rx="14" fill="#170406" stroke="#e8222a" stroke-width="5"/>
 <rect x="1100" y="390" width="468" height="372" rx="18" fill="none" stroke="${W}" stroke-width="5"/>
 ${sgCapKey(1125,409,113,99,C,[['Ent',46]])}<path d="M1206 464V486H1170M1182 476L1166 486L1182 496" fill="none" stroke="#111" stroke-width="4"/>${sgCapKey(1276,409,112,99,'#2d2f31',[['Mon',60]],'#eee')}${sgCapKey(1427,409,114,99,'#1fb24a',[['AUTO',44],['START',76]])}
 ${sgCapKey(1125,526,112,98,C,[['Set',60]])}<path d="M1200 568L1222 552M1196 582L1226 562" stroke="#111" stroke-width="6"/>${sgCapKey(1276,526,112,98,C,[['DIS-T',77]])}<path d="M1356 552H1312M1324 543L1308 552L1324 561" fill="none" stroke="#111" stroke-width="4"/>${sgCapKey(1428,527,112,97,'#ee1f2a',[['AUTO',44],['STOP',76]])}
 ${sgCapKey(1125,643,113,99,C,[])}<path d="M1162 678H1202L1182 708Z" fill="#111"/>${sgCapKey(1276,643,112,99,C,[])}<path d="M1314 704H1350L1332 676Z" fill="#111"/>${sgCapKey(1428,644,112,97,'#ee1f2a',[['ALARM',43],['RESET',76]])}`;}
const FACE={epc50:faceEPC50,epc60:faceEPC60,samgong:faceSG};
