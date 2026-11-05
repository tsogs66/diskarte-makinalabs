/* --- DK where: for every step of every procedure, the exact control to operate and the page it is on, or a wait.
   A step is a list of parts. The coach takes the first part whose chk is still false:
     {pnl, css | lab, via, say, chk, un}   operate this control.
         pnl = the panel it is on (mimic is the plant page, so every valve points there)
         css = a selector (a comma list tries each); lab = text of the control's aria-label, title or button text
         via = a selector to point at when the control is not drawn yet (for example a page button on the HMI)
         un  = only for these units (the simulator's own M.id)
     {wait, say, chk, pnl, css}            nothing to operate: the plant or the control unit is working. wait = who is working.
   chk is a JavaScript expression read in the page (u, s, f, M and sim are the simulator's own names). The simulators are not edited.
   m is tested against the step text; the first rule that matches is used. --- */
var DK_WHERE=(function(){
 const P=(pnl,css,say,chk,o)=>Object.assign({pnl,css,say,chk},o),Lb=(pnl,lab,say,chk,o)=>Object.assign({pnl,lab,say,chk},o),W=(who,say,chk,pnl,css)=>({wait:who,say,chk,pnl,css});
 const S=(m,p)=>({m,p});
 const mv=(k,say,chk)=>P('mimic','[data-k="'+k+'"]',say,chk);
 /* ---------- oil purifier ---------- */
 const KSEP='[data-key="k50s"],[data-key="k60s"]',KHEAT='[data-key="k50h"],[data-key="k60h"]',KNO='[data-key="k50m"],[data-key="k60O"]',CPW='control unit';
 const CP=(say,chk)=>W(CPW,say,chk,'cp','#cp');
 const pur=[
  S(/^Check (sump oil|gear oil) level/,[mv('sump','Click the bottom of the bowl, the dashed box with the oil drop. It shows the oil level. Top it up there if it is low.','u.oilChk'),P('starter','#brk','Open the starter panel and look at the Brake box. It must be unticked. Untick it if it is ticked.','u.stSeen&&!u.brake')]),
  S(/^Open control air/,[mv('aOn','Click the control air valve (Air in) and open it.','u.aOn')]),
  S(/^Open operating water/,[mv('wOn','Click the operating water valve (Water in) and open it.','u.wOn')]),
  S(/^Line up tank suction/,[mv('suc','Click the tank suction valve and open it.','u.suc'),mv('ret','Click the recirculation valve and open it.','u.ret'),mv('out','Click the outlet valve and open it.','u.out'),mv('slv','Click the sludge tank valve and open it.','u.slv')]),
  S(/^Confirm V5 to V10/,[mv('suc','Click the suction valve and open it.','u.suc'),mv('ret','Click the recirculation valve and open it.','u.ret'),mv('out','Click the outlet valve and open it.','u.out'),mv('aOn','Click the control air valve and open it.','u.aOn'),mv('wOn','Click the operating water valve and open it.','u.wOn'),mv('slv','Click the sludge tank valve and open it.','u.slv')]),
  S(/^(Main switch ON at the separator starter|Starter breaker ON)/,[P('starter','[data-pk="stBr"]','On the starter panel, switch the main switch (breaker) ON.','u.mccb')]),
  S(/^CONT\. SOURCE ON/,[P('starter','[data-pk="cSrc"]','On the starter panel, switch CONT. SOURCE on. The panel and Multi-Monitor light.','u.pw')]),
  S(/^MM FUNCTION on/,[P('starter','[data-pk="mmF"]','On the starter panel, switch the MM FUNCTION switch on.','u.mm'),P('cp','[data-key="kLM"]','On the control panel, press LM ALARM OUTPUT to switch it off for now.','!u.lmOn||s.ph===\'sep\'')]),
  S(/^Start the feed pump/,[P('starter','[data-pk="onP"]','On the starter panel, press Start under Feed pump.','s.pump')]),
  S(/^Open steam, switch the heater on/,[mv('stm','Click the steam valve (Steam in) and open it.','u.stm'),P('cp',KHEAT,'On the control unit, press the HEATER key.','s.heaterOn')]),
  S(/^Start the oil heater/,[mv('stm','Click the steam valve (Steam in) and open it.','u.stm'),mv('heater','Click the heater and switch it on.','s.heaterOn')]),
  S(/^Press .* and answer the bowl questions/,[P('cp',KSEP,'On the control unit, press the SEPARATION key. The display then asks the bowl questions.','s.ph!==\'standst\'||s.asked')]),
  S(/^Answer the display/,[P('cp',KNO,'The display asks if the bowl was dismantled. It was not, so press NO (the minus key).','!s.asked')]),
  S(/^(Push|Press) START on the/,[P('starter','[data-pk="stOn"]','On the starter panel, press START under the separator motor.','s.motor')]),
  S(/^Wait for full speed/,[W('bowl','Nothing to operate. The bowl is running up to speed. Watch the motor ammeter on the starter panel: current peaks, then falls to a low steady value.','s.rpm>=.97','starter','#starter')]),
  S(/^Wait for \d+ .C, display shows Standby/,[CP('Wait. The control unit holds the start until the oil is hot, then shows Standby and starts the sequence by itself. Do not press anything.','[\'closing\',\'sep\',\'dis\'].includes(s.ph)')]),
  S(/^Sequence closes bowl/,[CP('Wait. The control unit is closing the bowl and making the water seal. It opens the feed by itself. Do not press anything.','s.ph===\'sep\'||s.ph===\'dis\'')]),
  S(/^Set back pressure/,[mv('back','Click the back pressure valve and set it to the normal pressure.','Math.abs(s.Pout-M.Pb)<.25')]),
  S(/^Check display, outlets and vibration/,[W('you','Nothing to operate. Watch the control unit display, the outlets and the vibration for one minute.','s.tSince>60','cp','#cp')]),
  S(/^Wait for rated speed and/,[W('bowl','Nothing to operate. The bowl is reaching rated speed and the oil is heating to the set temperature.','s.rpm>=.97&&Math.abs(s.T-u.Ts)<6','mimic','#mimic')]),
  S(/^Press AUTO START/,[P('cp','[data-key="kAS"]','On the control panel, press AUTO START.','[\'closing\',\'sep\',\'dis\'].includes(s.ph)')]),
  S(/^Confirm discharge by current/,[CP('Wait. The control unit is running opening, discharge, sealing water and feed by itself. Watch the current and listen for the discharge. Do not press anything.','s.ph===\'sep\'')]),
  S(/^Set feed rate with/,[mv('flow','Click the feed flow valve and set the feed rate. Check there is no oil at the outlets.','Math.abs(s.Q-u.q)<u.q*.1')]),
  S(/^Adjust V6/,[mv('back','Click the back pressure valve V6 and adjust it to 0.15 MPa.','Math.abs(s.Pout-1.5)<.2')]),
  S(/^Multi-Monitor FUNCTION off then on/,[P('cp','[data-key="kLM"]','On the control panel, press LM ALARM OUTPUT to switch it on.','u.lmOn')]),
  S(/^Set circulation line to/,[mv('v12','Click valve V12 and set the circulation line to 0.1 MPa.','u.v12'),P('cp','[data-key="kWD"]','On the control panel, press WD OUTPUT to switch the water detector on.','u.wd')]),
  /* stop */
  S(/^Press [A-Z]+$/,[P('cp',KSEP,'On the control unit, press the SEPARATION key. Never stop with the motor switch.','[\'stopseq\',\'rundown\',\'standst\',\'dis\'].includes(s.ph)||s.stopAfter')]),
  S(/^Press AUTO STOP/,[P('cp','[data-key="kSt"]','On the control panel, press AUTO STOP.','s.stopAfter||[\'stopseq\',\'rundown\',\'off\'].includes(s.ph)')]),
  S(/^Last sludge discharge runs/,[CP('Wait. The control unit is doing the last sludge discharge. Do not press anything.','[\'stopseq\',\'rundown\',\'standst\'].includes(s.ph)')]),
  S(/^Sequence finishes, motor stops/,[CP('Wait. The control unit finishes the sequence and stops the motor by itself. Do not press anything.','[\'rundown\',\'off\'].includes(s.ph)')]),
  S(/^Heater off, pump stops when oil cools/,[CP('Wait. The control unit switches the heater off and stops the pump when the oil has cooled. Do not press anything.','[\'rundown\',\'standst\'].includes(s.ph)')]),
  S(/^Stop the oil heater/,[mv('heater','Click the heater and switch it off.','!s.heaterOn')]),
  S(/^Wait for standstill/,[W('bowl','Nothing to operate. The bowl is slowing down. Do not use the brake. Wait for standstill before anything is opened.','s.rpm<=0','starter','#starter')]),
  S(/^Wait for stop, watch the safety joint/,[W('bowl','Nothing to operate. The bowl is slowing down. Watch the safety joint. Wait for standstill.','s.rpm<=0','starter','#starter')]),
  S(/^Close steam, operating water and air/,[mv('stm','Click the steam valve and close it.','!u.stm'),mv('wOn','Click the operating water valve and close it.','!u.wOn'),mv('aOn','Click the control air valve and close it.','!u.aOn')]),
  S(/^Close feed valves V7 and V10/,[mv('suc','Click the suction valve (V7) and close it.','!u.suc'),mv('out','Click the outlet valve (V10) and close it.','!u.out'),mv('wOn','Click the operating water valve and close it.','!u.wOn'),mv('aOn','Click the control air valve and close it.','!u.aOn'),mv('stm','Click the steam valve and close it.','!u.stm')])
 ];
 /* ---------- fresh water generator ---------- */
 const PN=(k,say,chk)=>P('door','[data-pk="'+k+'"]',say,chk),PLW=(say,chk)=>W('plant','Nothing to operate. '+say,chk,'mimic','#mimic');
 const fwg=[
  S(/^Check the ship is at sea/,[P('ship','#c_nearShore','On the Ship page, untick Near shore. The ship must be clear of the coast.','!u.nearShore'),P('ship','#c_meLoad','On the Ship page, set Main engine load to 40 % or more. The heat comes from the engine.','u.meLoad>=40'),PLW('Wait for the jacket water to reach 70 °C.','s.Tj>=70')]),
  S(/^Main switch ON/,[PN('main','On the control panel, turn the Main switch to ON. The white source lamp lights.','u.mainSw')]),
  S(/^Close the vacuum valve/,[mv('vent','Click the vacuum valve and close it.','u.vent===0'),mv('jwIn','Click the jacket water inlet valve and keep it shut.','u.jwIn===0'),mv('jwOut','Click the jacket water outlet valve and keep it shut.','u.jwOut===0'),mv('byp','Click the bypass valve and open it fully, so it reads 0 % closed.','u.byp===0')]),
  S(/^Open sea suction, overboard/,[mv('ov','Click the overboard valve and open it first.','u.ov>=95'),mv('sv','Click the sea suction valve and open it.','u.sv>=95'),mv('cv','Click the condenser sea water valve and open it.','u.cv>=50')]),
  S(/^Start the ejector pump/,[PN('sE','On the control panel, press the green Start under EJECTOR PUMP.','s.rpm>0.9'),mv('cv','The sea water pressure is still low. Click the condenser sea water valve and open it further until the pressure reads 3 bar or more.','s.rpm<0.9||s.d.Pe>=3||u.cv>=99'),PLW('The pump is coming up to pressure. Check the sea water inlet pressure is at least 3 bar.','s.d.Pe>=3')]),
  S(/^Wait for vacuum/,[PLW('The ejector is pulling vacuum. Do not open the jacket water yet. Watch the vacuum gauge.','s.d.vac>=(M.id===\'aqua\'?85:90)')]),
  S(/^Open the feed valve, start dosing/,[mv('fv','Click the feed water valve and open it to about 50 %.','u.fv>=40'),Lb('mimic','Antiscalant dosing pump','Click the antiscalant dosing pump on the plant to start it.','u.doseOn',{css:'#c_doseOn'}),PLW('Brine is collecting in the sump. Wait for the level to rise.','s.Lb>=(M.flooded?0.25:0.12)')]),
  S(/^Open the jacket water outlet/,[mv('jwOut','Click the jacket water outlet valve and open it first.','u.jwOut>=90'),mv('jwIn','Click the jacket water inlet valve and open it.','u.jwIn>=90')]),
  S(/^Close the bypass slowly/,[mv('byp','Click the bypass valve and close it slowly until boiling starts.','u.byp>=30'),PLW('The liquid is warming. Boiling starts when it reaches saturation temperature. Vacuum dips, then recovers.','s.d.mv>0.03')]),
  S(/^Set the distillate valve/,[mv('dv','Click the distillate valve and set it to about 50 %.','u.dv>=30'),mv('tankV','Click the distillate tank valve and open it.','u.tankV>=90'),PN('skPw','On the salinity indicator, press POWER SW.','u.salinoOn')].map((x,i,a)=>i===2?Object.assign(x,{un:['isf']}):x)),
  S(/^When the well shows about 30/,[PLW('Wait until the well shows about 30 %.','s.Ld>=0.3||s.distOn'),PN('sF','On the control panel, press the green Start under F.W. PUMP.','s.distOn')]),
  S(/^Close the bypass further/,[mv('byp','Click the bypass valve and close it further, to about 80 %.','u.byp>=(typeof auto!==\'undefined\'&&auto?79.9:75)')]),
  S(/^Confirm salinity falls/,[PLW('The dump valve closes by itself when the salinity is below the set point. This takes a few minutes. Watch the salinometer.','s.d.toTank')]),
  S(/^Trim:/,[mv('vent','Click the vacuum valve and trim the vacuum into the band.','s.d.vac>=M.vac[1]&&s.d.vac<=M.vac[2]'),mv('byp','Click the bypass valve and trim the boiling temperature into the band.','s.d.Tb>=M.tb[0]-2&&s.d.Tb<=M.tb[1]'),mv('dv','Click the distillate valve and hold the well level steady.','s.Ld>0.15&&s.Ld<0.7'),PLW('Watch the salinity settle and the level stay steady.','s.salRead<4')]),
  /* stop */
  S(/^Open the jacket water bypass fully/,[mv('byp','Click the bypass valve and open it fully. That takes the heat away.','u.byp===0')]),
  S(/^Close the jacket water inlet and outlet/,[mv('jwIn','Click the jacket water inlet valve and close it.','u.jwIn===0'),mv('jwOut','Click the jacket water outlet valve and close it.','u.jwOut===0')]),
  S(/^When the well runs low/,[PLW('Wait for the well level to run low.','s.d.md<0.05||s.Ld<0.15||!s.distOn'),PN('pF','On the control panel, press the red Stop under F.W. PUMP.','!s.distOn'),mv('dv','Click the distillate valve and close it.','u.dv===0'),mv('tankV','Click the distillate tank valve and close it.','u.tankV===0')]),
  S(/^(Salinometer stays on|Press POWER SW to switch off)/,[Object.assign(PN('skPw','On the salinity indicator, press POWER SW to switch it off.','!u.salinoOn'),{un:['isf']}),Object.assign(W('you','Nothing to operate. The salinometer stays on until the main switch goes off. Ignore its reading from here.','true','door','#door'),{un:['jwp','aqua']})]),
  S(/^Keep the ejector pump running/,[PLW('The ejector pump keeps running for about 5 minutes to cool the unit.','sim.heatOffAt!==null&&s.t-sim.heatOffAt>=300')]),
  S(/^Close the feed valve and stop dosing/,[Lb('mimic','Antiscalant dosing pump','Click the antiscalant dosing pump on the plant to stop it.','!u.doseOn',{css:'#c_doseOn'}),mv('fv','Click the feed water valve and close it.','u.fv===0')]),
  S(/^Stop the ejector pump/,[PN('pE','On the control panel, press the red Stop under EJECTOR PUMP.','!s.pumpOn')]),
  S(/^Open the vacuum valve/,[mv('vent','Click the vacuum valve and open it to break the vacuum.','u.vent>=90')]),
  S(/^Close sea suction and overboard/,[mv('sv','Click the sea suction valve and close it.','u.sv===0'),mv('ov','Click the overboard valve and close it.','u.ov===0')]),
  S(/^Main switch OFF/,[PN('main','On the control panel, turn the Main switch to OFF.','!u.mainSw')])
 ];
 /* ---------- boiler ---------- */
 const hv=(k,say,chk)=>P('mimic','[data-hv="'+k+'"]',say,chk),ST=(lab,say,chk)=>Lb('starters',lab,say,chk),BW=(say,chk)=>W('plant',say,chk,'mimic','#mimic');
 const casc=[hv('mk','Click the distilled make-up valve on the plant and open it.','hvRaw(\'mk\')'),ST('Start Distillate / make-up','On the Starters page, press Start for the distillate / make-up pump.','u.dist'),P('starters','#bleedBtn','The distillate pump is air-bound and cannot fill the cascade tank. On the Starters page, press BLEED until water comes, not air.','!s.airBound'),BW('The make-up is filling the cascade tank. Wait for the level to pass 35 %.','s.casc/M.cascKg>0.35')];
 const bleed=[P('starters','#bleedBtn','On the Starters page, press BLEED and hold it until water comes, not air.','!s.airBound||!u.dist')];
 const feed=[hv('fStop','Click the feed stop valve on the plant and open it.','hvRaw(\'fStop\')'),hv('fChk','Click the feed check valve on the plant and open it.','hvRaw(\'fChk\')'),ST('Start Feed pump','On the Starters page, press Start for the feed pump.','u.feed'),BW('The feed pump is filling the drum. Watch the glass: it shrinks and swells. Wait for normal level.','s.level>M.Lnml-0.05')];
 const water=[P('water','#runTest','On the Water page, take a sample, apply the recommendation, then press Re-sample to test again.','s.waterApplied.length>0||s.lastSample!=null')];
 const fire=[ST('Start FD fan','On the Starters page, press Start for the FD fan first.','u.fd'),ST('Start FO pump','On the Starters page, press Start for the FO pump.','u.fo'),P('controls','#foHeat','On the Controls page, switch the FO heater on.','u.foHeat'),BW('The fuel oil is heating to the burning viscosity. The burner is blocked until it is hot enough. Wait.','s.FO_T>=(FUELS[u.fuel]||M.FO).Tmin-5')];
 const run='u.burnerStart||(s.seq&&s.seq!==\'off\')||s.flame';
 const stopDone='!s.flame||u.burnerStop';
 const hmiWait=(un)=>W('control unit','Wait. The burner sequencer is running: pre-purge, pilot, then main flame. Do not press anything. Watch the lamps.','s.flame',un==='door'?'door':'hmi',un==='door'?'.b_door':'.b_hmi');
 const post=(un)=>W('control unit','Wait. The burner is in post-purge. It stops by itself. Do not press anything.','!s.flame&&u.mode===\'off\'',un==='door'?'door':'hmi',un==='door'?'.b_door':'.b_hmi');
 const steam=[hv('stop','Click the main steam stop valve on the plant and open it.','u.steamStop'),BW('The pressure is rising to the working pressure.','s.P>=u.Psp-0.3')];
 const eg=[P('controls','#mel','On the Controls page, raise the main engine load so the exhaust gas boiler gives steam.','s.egSteam>0.05||u.meLoad>0.5')];
 const dump=[P('hmi','#dumpToggle','On the HMI Dump page, check Auto holds the pressure. Try Manual, then go back to Auto.','u.dumpAuto',{via:'[data-p="dump"],[data-go="dump"]'})];
 const boiler=[
  S(/^(Touch Overview: check cascade|Check cascade level|Cascade make-up|Panel: confirm cascade)/,casc),
  S(/^(If distillate air-bound|If air-bound)/,bleed),
  S(/^(Start feed pump|Start feed from panel|Feed pump on)/,feed),
  S(/^(Water page|Water lab|Run water test)/,water),
  S(/^(Start FD fan|FD fan then FO pump|FD \+ FO)/,fire),
  S(/^HMI Auto - Burner start/,[P('hmi','#ftStart','On the HMI, press Start at the foot of the screen.',run),hmiWait()]),
  S(/^se@vis Auto - burner start/,[P('hmi','#sw_burn','On the se@vis screen, switch the Burner to ON (AUTO).',run),hmiWait()]),
  S(/^Local\/panel start/,[P('door','#locStart','On the Local panel, press START.',run),hmiWait('door')]),
  S(/^Sequencer start/,[P('hmi','#hmiStart','On the sequencer screen, press Start.',run,{via:'[data-p="seq"],[data-go="seq"]'}),hmiWait()]),
  S(/^(Open steam stop|Steam stop open)/,steam),
  S(/^(Put EG bank in service|EG in service)/,eg),
  S(/^(Dump page|Dump Auto under rising EG|Confirm dump Auto|Observe EG contribution)/,dump),
  S(/^Secure: stop burner/,[P('hmi','#ftStop,#sw_burn','On the HMI, stop the burner.',stopDone),post()]),
  S(/^Secure from panel/,[P('door','#locStop','On the Local panel, press STOP.',stopDone),post('door')]),
  S(/^Secure: stop .* POST lamp/,[P('hmi','#hmiStop','On the sequencer screen, press Stop.',stopDone,{via:'[data-p="seq"],[data-go="seq"]'}),post()])
 ];
 return{pur,fwg,boiler};})();
