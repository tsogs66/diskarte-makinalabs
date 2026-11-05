/* --- DK data: alarm guidance, safety, lessons, quizzes, fidelity ledger. Plain words, short sentences. ---
   Alarm fields: why = cause, now = do this first, fix = how to rectify, esc = stop and call the Chief Engineer if.
   Where the simulator already has a Why / What to do table (purifier ALW, FWG F_ALW) it is used too and these add the missing parts. */
var DK_DATA={
 disclaimer:"Training aid. Suggestions come from a simplified model and general practice. The maker's manual, the ship's SMS and company procedures, and the Chief Engineer's orders always come first. Never use this program to override a trip, an alarm or a work permit.",

 alarms:{
  pur:{
   hiT:{now:"Check that the heater is off and the feed is on recirculation. The control does this itself.",esc:"Stop the purifier and call the Chief Engineer if the temperature keeps rising with the steam shut. Hot fuel near its flash point is a fire risk."},
   loT:{now:"Cold oil separates badly. Check the steam supply, the steam trap and the control valve.",fix:"Restore heating before sending oil to the clean tank."},
   vibW:{now:"Watch the vibration reading. If it keeps rising, start the stop sequence.",esc:"Stop and call the Chief Engineer if vibration reaches the shutdown level, or if you hear grinding or knocking."},
   vibS:{now:"The machine stops itself. Keep the bowl filled during run-down. Do not restart.",esc:"Always report it. Do not open the bowl until it has fully stopped and the cause is found."},
   spdH:{now:"Stop the machine.",esc:"Over-speed can burst a bowl. Report to the Chief Engineer before any restart."},
   spdL:{now:"Check that the bowl is closed, then check the clutch pads or belt and the motor current.",esc:"Never feed oil to a bowl that is running slow. If speed does not recover, stop."},
   runup:{now:"Check that the brake is off and the coupling is not slipping.",esc:"A brake left on will burn the pads. Stop and find the cause."},
   leak:{now:"The feed stops by itself and a discharge runs. Wait for the sequence to finish.",esc:"If oil leaks from the frame or the seal ring again after restart, stop and call the Chief Engineer."},
   nodis:{now:"Feed goes to recirculation and the motor keeps running.",fix:"Check the operating water supply, the strainer and the discharge valve.",esc:"If it repeats, stop for inspection. Do not keep feeding."},
   sludge:{now:"Pump the sludge tank out to the ship's sludge system.",esc:"Never pump sludge overboard. MARPOL Annex I applies."},
   slback:{now:"Open the sludge tank valve and check the line for a blockage.",esc:"Stop discharges until the line is clear. A discharge into a shut line can over-pressure the frame."},
   air:{now:"Check the air compressor, the receiver drain and the filter regulator."},
   water:{now:"Check the water supply valve and strainer. With low operating water the bowl may not open or close correctly."},
   foulS:{now:"Shorten the discharge interval, or clean the bowl at the next stop."},
   tFail:{now:"Water transducer has failed. The Alcap cannot drain water correctly, so water can carry over.",fix:"Check the cable, clean the transducer, check the reference. Run on manual drain until it is fixed.",esc:"Do not run on without checking the clean oil for water."},
   hidens:{now:"Water has been detected in the oil outlet. Send the feed to circulation and check the oil density and water content."}
  },
  fwg:{
   vac:{now:"Read the ejector pressures first. If the inlet pressure is low, fix that before looking for air leaks."},
   dml:{now:"Reduce the heat (open the jacket water bypass) and check the brine level.",esc:"If salinity rises, keep distillate off the tank."},
   tbh:{now:"Reduce the heat. Boiling above 55 °C builds scale fast.",fix:"Check the vacuum. Start antiscalant dosing if it is off."},
   tbl:{now:"Open the air screw a little, or reduce the condenser sea water."},
   ejp:{now:"Compare the suction and inlet pressure. Clean the suction strainer, check valves and pump rotation."},
   bkp:{now:"Check the overboard valve and pipe for a partly shut valve or a blockage."},
   sea:{now:"Check the sea chest valve and the strainer.",esc:"Stop the pump if it is cavitating. It will be damaged."},
   swf:{now:"Check the valve line-up and the pump."},
   swo:{now:"Check sea water flow, then the condenser for fouling. Reduce the heat."},
   jwh:{now:"Reduce the heat taken by the FWG, then check the jacket water cooler.",esc:"High jacket water temperature is an engine problem. Tell the watchkeeper or the Chief Engineer."},
   jwl:{now:"Open the jacket water bypass so the FWG takes less heat."},
   fdl:{now:"Clean the feed orifice and check the feed pressure.",fix:"Do not run above the rated output."},
   dry:{now:"Reduce the heat now. Dry patches on the plates mean scale builds fast.",fix:"Check the feed flow and the brine level."},
   prm:{now:"Reduce the heat. Priming sends salt droplets into the distillate. Keep the distillate on dump.",esc:"If salinity stays high, do not send distillate to the tank."},
   blv:{now:"Check that the brine ejector is pulling. High brine level carries salt water over."},
   bcn:{now:"Brine is too strong. Raise the feed or lower the output.",fix:"Clean the feed orifice."},
   dlh:{now:"Check the distillate pump and its discharge valves."},
   dll:{now:"Stop the distillate pump. Running dry will damage the seal.",fix:"Restart when the well level has recovered."},
   dpp:{now:"Open the discharge path or stop the pump. It is running against a closed line."},
   sal:{now:"The dump valve should send the distillate back to the unit. Do not put it in the tank. Check the salinometer.",esc:"If distillate already went to the tank, test the tank before anyone uses it for drinking water. Report it."},
   sof:{now:"Switch the salinometer on. Without it nothing protects the tank."},
   sac:{now:"Cancel the external alarm cut-out. It must stay active."},
   edc:{now:"Check the electrode cable and plug. The distillate is dumped until it is fixed."},
   ovl:{now:"Find the cause before you reset: blocked or seized pump, wrong valve line-up, motor.",esc:"Do not reset again and again. A thermal trip means overload. Call the electrician or the Chief Engineer if it repeats."},
   scl:{now:"Plan an acid cleaning. Check that antiscalant dosing is on."},
   tnk:{now:"Stop sending water to the tank. Check the salinometer.",esc:"Isolate the tank from the drinking water system until it is tested. Report to the Chief Engineer."},
   shr:{now:"Stop making fresh water for drinking when you are close to land or in polluted water.",esc:"Follow the company SMS and flag state rules. Water made near land may be contaminated."},
   cap:{now:"Check the jacket water flow and temperature, then the vacuum, then the feed orifice."}
  },
  boiler:{
   LWL:{why:"Level is below the low-water mark. Feed is not keeping up, or an instrument is wrong.",now:"Compare the gauge glass with the level transmitter. Start the standby feed pump. Check the hot well level.",fix:"Find the cause: blocked suction strainer, feed valve, low hot well, tripped pump.",esc:"If the level is not visible in the glass, stop the burner. Do not feed cold water into a hot boiler. Call the Chief Engineer."},
   LLWL:{why:"Level is below the low-low cut-out. The burner has tripped to protect the furnace from overheating.",now:"Do not feed water until you know the real level. Check the gauge glass. If no water is visible, let the boiler cool.",fix:"After it has cooled and a safe level is confirmed, find the cause, restore feed, then reset the lockout as the maker says.",esc:"Always inform the Chief Engineer. If water went out of the glass, the boiler needs an inspection."},
   HWL:{why:"Level is above the high-water mark. A feed valve is stuck open, the level control has failed, there is swell after a pressure drop, or a glass cock is blocked.",now:"Stop feeding. Compare the glass with the transmitter. A swell after a load change falls back by itself.",fix:"Repair the level control or the feed valve. Blow down only if the level is truly high.",esc:"A very high level sends water into the steam system. Tell the Chief Engineer if it stays high."},
   HP:{why:"Steam pressure is above the cut-out. The steam stop may be shut, the dump valve may not be opening, or the pressure transmitter is wrong.",now:"The burner trips. Check the steam stop and the dump valve to the condenser.",fix:"Find why steam was not taken or dumped. Reset when the pressure is safe.",esc:"If pressure keeps rising towards safety valve lift, tell the Chief Engineer at once. Exhaust gas heat is still going in."},
   FF:{why:"The flame scanner sees no flame. Dirty scanner, no fuel, bad ignition or wrong air.",now:"The burner shuts and purges. Do not relight again and again.",fix:"Clean the flame scanner. Check FO pressure, FO temperature, the filter and ignition. Reset and try one restart.",esc:"After repeated failures, stop and find the cause. Never bypass the flame scanner. Unburnt fuel in a hot furnace can explode."},
   FO_T:{why:"FO is too cold to atomise. Heater, heater steam or thermostat.",now:"Check the heater steam and its trap and valve. The viscosity gate holds the burner until the oil is hot enough.",fix:"Restore the heating. Check that the fuel grade matches the temperature."},
   FO_P:{why:"FO pressure is low although the pump runs. The filter in use is usually clogged.",now:"Change over the duplex filter.",fix:"Clean the dirty basket. Check the FO pump if the pressure is still low."},
   FD:{why:"The forced draught fan has failed or tripped. No combustion air.",now:"The burner trips. Check the fan starter, the overload and the damper linkage.",esc:"Never light off without a full air purge."},
   CASC:{why:"The cascade tank level is low. Make-up is short or there is a leak.",now:"Top up with distilled water. Look for leaks.",fix:"Find the loss before the feed pump runs short."},
   AIR:{why:"Air is trapped in the distilled make-up line.",now:"Open the casing bleed to vent the air, then check the tank level."},
   EGDP:{why:"Gas-side differential pressure is high. The exhaust gas tubes are sooted.",now:"Soot blow with the steam stop open. ΔP should fall and EG steam rise.",esc:"High ΔP with a rising EG outlet temperature can be a soot fire. See the EG outlet temperature alarm."},
   EGDRY:{why:"The EG circulation pump would run dry. The level is too low.",now:"The pump is blocked on purpose. Restore the water level first.",fix:"Restart the circulation pump only when the level is normal."},
   FEEDP:{why:"A feed pump tripped or lost suction. Hot well low or strainer blocked.",now:"Start the standby pump.",fix:"Check the hot well and the suction strainer. Find why the first pump tripped.",esc:"If water is out of the glass, stop the burner. Do not feed until it has cooled and been inspected."},
   OILHW:{why:"Oil has reached the hot well. A leaking FO heating coil is the usual source.",now:"Isolate the suspected coil. Skim the hot well. Do not feed oily water to the boiler.",esc:"Oil in feed water overheats tubes. If it reached the boiler, stop the burner and tell the Chief Engineer."},
   SMOKE:{why:"Too little air. The damper is stuck, the linkage slipped, or the fan inlet is blocked.",now:"Free the damper and check the air and fuel setting.",esc:"Lasting black smoke builds soot in the EG section. Tell the Chief Engineer."},
   EGHT:{why:"Exhaust gas outlet temperature is high. A soot fire in the EG section is possible.",now:"Tell the Chief Engineer and the bridge. Do not soot blow. Air feeds the fire.",fix:"Reduce main engine load as the Chief orders, then water wash and follow the ship's EG boiler fire procedure.",esc:"This is an emergency until proven otherwise."},
   LOCK:{why:"The burner is locked out after a trip.",now:"Read the first-up fault. Clear its cause first.",fix:"Acknowledge, then reset. The reset stays blocked while the cause is present or the water or pressure is unsafe."},
   ESTOP:{why:"The emergency stop was pressed. Fuel and fan are stopped.",now:"Find out why it was pressed and make the area safe.",fix:"Release the button, acknowledge and reset."}
  }
 },

 safety:{
  all:["This program is a training aid. It does not replace the maker's manual, the ship's SMS or the Chief Engineer's orders.","Never override a trip or alarm because the simulator allows it. On a real plant the trip protects people and the machine.","Work permits, lock-out and tag-out, and PPE apply to real work. The steps here show the order of operation, not a permit."],
  pur:[
   ["Electrical","Switch off and lock out the starter before any work. Tag it."],
   ["Rotation","Do not open or touch the bowl until it has fully stopped. Run-down takes many minutes. Check the standstill by the rpm indication or the spindle."],
   ["Heat","Heater, pipes and bowl cover are hot. Fuel is heated close to its flash point. Keep ignition sources away."],
   ["Pressure","Operating water and control air are under pressure. Close and bleed them before dismantling."],
   ["Spills","Fuel oil and sludge make decks slippery and are a pollution risk. Clean up at once. Never discharge sludge overboard."],
   ["Lifting","Bowl parts are heavy. Use the lifting tool and the correct tackle."]
  ],
  fwg:[
   ["Hot water","Jacket water is 60 to 90 °C and can scald. Isolate before opening."],
   ["Vacuum","Break the vacuum with the vacuum valve before you open any cover. Let the unit cool."],
   ["Chemicals","Antiscalant and cleaning acid need gloves, goggles and ventilation. Neutralise and dispose of used acid as the ship's procedure says."],
   ["Electrical","Switch off the main switch and lock out before opening the control panel."],
   ["Drinking water","Do not make fresh water for drinking close to land or in polluted water. Treat and test it before it goes to the drinking water tank."]
  ],
  boiler:[
   ["Low water","Never feed cold water into a hot boiler that has lost its water level. Thermal shock can rupture tubes. Stop the burner and let it cool."],
   ["Furnace explosion","Always purge before light-off. Never bypass the flame scanner, low-water or high-pressure trips."],
   ["Steam and heat","Steam lines, the casing and the uptake are hot. Isolate and drain before opening."],
   ["Confined space","Entry to a boiler or furnace needs a permit, ventilation, a gas test, lock-out of all sources and a person standing by outside."],
   ["Soot fire","If the EG outlet temperature climbs fast, do not soot blow. Tell the Chief Engineer and the bridge and follow the ship's procedure."],
   ["Chemicals","Boiler water treatment chemicals are caustic. Wear gloves, goggles and an apron."]
  ]
 },

 /* fidelity: v = verified from a maker document, p = partly, e = estimated, u = no source recorded. Built from the project notes (Changelog and Basis). The owner should review it. */
 fidelity:{
  pur:[
   {u:"P 605",m:/p605/i,s:"v",t:"Valve timing: 372 for 1 s, 373 for 40 s, 206 for 12 s, then 201. Discharge: 201 off, 206 and 373 on, 372 for 1 s after 8 s, 206 and 373 off 12 s later.",src:"Alfa Laval P 605 manual, book 9010961-02, 8.3.1 ref. 565819"},
   {u:"P 605",m:/p605/i,s:"v",t:"Flows 206 at 8 L/min, 372 at 18 L/min, 373 at 0.9 L/min. Discharge interval 2 to 60 min. Start-up 2.4 to 3.2 min. Run-down 14 min. Vibration limit 9 mm/s. Disc set 50.5 to 73 mm.",src:"Same manual, 7.3, 7.4, 8.3.3"},
   {u:"P 605",m:/p605/i,s:"p",t:"Bowl drawing traced from the owner's reference picture of the cutaway.",src:"Owner's reference picture"},
   {u:"P 605",m:/p605/i,s:"e",t:"EPC 50 panel face is the S 826 photograph. Its printed valve tags belong to the S 826.",src:"Known gap in the notes"},
   {u:"S 826",m:/s826/i,s:"p",t:"Alcap layout and logic: TT, PT oil, V1, PT clean oil, MT water transducer, shut-off valve, drain valve V5.",src:"Alfa Laval Flex S leaflet"},
   {u:"S 826",m:/s826/i,s:"u",t:"Start and stop sequence from the EPC list. No readable maker source was found to check it.",src:"None recorded"},
   {u:"S 826",m:/s826/i,s:"p",t:"Bowl drawing built from the workshop photo.",src:"Owner's photo"},
   {u:"Flex P605/P626",m:/p626/i,s:"v",t:"EPC 60, CentriShoot, CentriLock, no operating water tank, one water block C1/C2/C3. Water 2 to 8 bar, air 5 to 8 bar.",src:"Alfa Laval P 626/636/646 leaflet"},
   {u:"Flex P605/P626",m:/p626/i,s:"e",t:"Seal and displacement times are taken from the P 605. Opening and closing follow the Flex S sequence.",src:"Assumed, in the Basis tab"},
   {u:"Flex P605/P626",m:/p626/i,s:"e",t:"Bowl volume and gravity discs are the P 605 values. Connection numbers are shown as C1, C2, C3.",src:"No P 626 manual found"},
   {u:"SJ30G and HIDENS",m:/sj30|hid/i,s:"u",t:"MKK start and stop timing. No readable maker source was found to check it.",src:"None recorded"}
  ],
  fwg:[
   {u:"JWP-26-C80",m:/jwp/i,s:"v",t:"Limits: SW inlet pressure, back pressure, distillate pressure, salinity, jacket water range, minimum vacuum, dosing rule.",src:"JWP-26-C80B instruction manual and order sheet"},
   {u:"AQUA Blue E1 C",m:/aqua/i,s:"p",t:"Limits are from the AQUA-80-HW manual, used for the E1 C.",src:"AQUA-80-HW instruction manual"},
   {u:"ISF-80",m:/isf/i,s:"p",t:"Limits are from the Il Seung catalogue (20 t/day, 10 ppm), otherwise general practice.",src:"Il Seung catalogue"},
   {u:"ISF-80",m:/isf/i,s:"v",t:"One combined brine and air ejector, as on the owner's ship.",src:"Owner's ship"},
   {u:"All three",m:/./,s:"e",t:"Boiling point rise, jacket water heat balance and priming are a lumped model. Good for training. Not a class calculation.",src:"Basis tab"}
  ],
  boiler:[
   {u:"All makers",m:/./,s:"p",t:"Composite boiler section drawn from the owner's photos and a composite section drawing.",src:"Owner's photos"},
   {u:"Aalborg, SAACKE",m:/mission|saacke|cmb/i,s:"p",t:"HMI pages follow the maker's product sheets and the owner's photos.",src:"Aalborg Control Touch listing, SAACKE se@vis HMI 10 sheet"},
   {u:"All makers",m:/./,s:"e",t:"Condensate return, burner and panel glyphs, and HMI menus are provisional.",src:"Basis table in the Actual tab"},
   {u:"All makers",m:/./,s:"e",t:"Dump condenser cooling water is assumed to be available. It is not modelled.",src:"Basis table"},
   {u:"All makers",m:/./,s:"u",t:"Water treatment bands (P-alk 6 to 18, pH 9.5 to 11, chloride under 80 ppm, conductivity under 400, scavenger 0.2 to 1.0). No source is recorded. Use your treatment supplier's limits.",src:"None recorded"},
   {u:"SAACKE CMB-VS",m:/saacke|cmb/i,s:"v",t:"No EG circulation pump, by the owner's choice.",src:"Owner's decision"}
  ]
 },

 /* lessons: theory first, then operation (opens the coach), then exercises, then a quiz. lv 1 cadet, 2 rating, 3 engineer. */
 learn:{
  pur:{
   title:"Oil purifier",
   mods:[
    {id:"why",t:"1. Why and how a purifier works",th:[
      "A bowl spins at thousands of rpm. The centrifugal force is many thousand times gravity. Oil, water and solids separate by density.",
      "Settling speed rises with the density difference and falls with viscosity. So fuel is heated, usually near 98 °C for heavy fuel, to cut viscosity.",
      "A purifier separates two liquids and solids. A clarifier takes out solids only. Alcap and HIDENS types have no gravity disc. A sensor detects water and the machine drains it.",
      "Before feed starts, the bowl is filled with water. This water seal stops oil escaping through the water outlet.",
      "Sludge collects at the bowl wall. At set intervals the bowl opens for a moment and throws the sludge out. This is the discharge."]},
    {id:"seq",t:"2. Start, run and stop",th:[
      "Check the brake is off, the gear oil level and the supply of air and water. Power goes on at the starter.",
      "Start the motor and wait for full speed before any oil is fed. Heat the oil while it circulates on the bypass.",
      "Start the automatic sequence. It closes the bowl, fills the water seal and then feeds oil.",
      "To stop, run the stop sequence so a last discharge runs. Never stop the machine by the motor switch.",
      "Wait for standstill. Do not open anything while the bowl turns. Then close steam, water and air."],op:"start"},
    {id:"gd",t:"3. The interface and the gravity disc",th:[
      "The oil and water meet at the interface. Its radius depends on the gravity disc, the oil density and the temperature.",
      "Heavier oil moves the interface outwards. A smaller disc hole brings it back inwards.",
      "A disc that is too large lets the seal break. Oil then goes out through the water outlet. A disc that is too small pushes the interface inwards and wastes separation.",
      "Alcap and HIDENS units do not use a disc. A water transducer or detector does the work."]},
    {id:"alm",t:"4. Alarms and faults",th:[
      "Vibration: a warning means stop and check. A shutdown means keep the bowl filled during run-down and do not restart.",
      "Oil leak or no discharge: the feed goes to recirculation. Check operating water, the strainer and seals.",
      "Low oil temperature gives poor separation. Check steam, trap and control valve.",
      "Use the alarm log. Click an alarm for the cause and the action."]}
   ],
   quiz:[
    {lv:1,q:"What makes separation in the bowl better?",o:["A bigger density difference and a lower viscosity","A lower bowl speed","Colder oil","A smaller bowl"],a:0,why:"Settling speed rises with the density difference and falls with viscosity. Heating the oil lowers the viscosity."},
    {lv:1,q:"Why is the bowl filled with water before oil is fed?",o:["To cool the bowl","To make a water seal so oil cannot escape through the water outlet","To clean the discs","To raise the speed"],a:1,why:"The water seal keeps the oil from leaving by the water outlet."},
    {lv:1,q:"How do you stop a purifier correctly?",o:["Press the motor stop at once","Cut the power at the main breaker","Run the stop sequence so a last discharge runs, then wait for standstill","Close the oil valve only"],a:2,why:"The stop sequence discharges the sludge and finishes cleanly. Never stop by the motor switch."},
    {lv:1,q:"When may you start to open the bowl for cleaning?",o:["After 1 minute","When the motor is switched off","Only after the bowl has fully stopped and the starter is locked out","When the rpm falls below half"],a:2,why:"The bowl turns for many minutes after the motor stops. Wait for standstill and lock out the starter."},
    {lv:2,q:"The oil temperature falls well below set. What is the first effect?",o:["Viscosity rises and separation gets worse","Density falls","The bowl speeds up","Sludge discharge stops"],a:0,why:"Colder oil is thicker, so particles and water settle more slowly."},
    {lv:2,q:"The fuel is heavier than before. What do you do with the gravity disc?",o:["Use a larger hole","Use a smaller hole","Leave it","Remove it"],a:1,why:"Heavier oil moves the interface outwards. A smaller hole brings it back."},
    {lv:2,q:"What is the purpose of the sludge discharge?",o:["To cool the bowl","To remove the sludge that has collected at the bowl wall","To change the gravity disc","To flush the heater"],a:1,why:"Without discharges the sludge space fills and vibration and fouling follow."},
    {lv:3,q:"A vibration shutdown has just stopped the machine. What is right?",o:["Restart at once","Open the bowl while it still turns","Keep the bowl filled during run-down, do not restart, report it","Switch off the oil heater only"],a:2,why:"Keeping the bowl filled avoids more imbalance. The cause must be found before a restart."}
   ]
  },
  fwg:{
   title:"Fresh water generator",
   mods:[
    {id:"why",t:"1. Why it makes water at low temperature",th:[
      "Water boils at a lower temperature when the pressure is lower. The unit holds a vacuum of about 90 %, so sea water boils near 40 to 50 °C.",
      "The heat comes from the engine jacket cooling water at about 60 to 90 °C. Heat that would be wasted makes drinking water.",
      "The vapour rises through the demister, which stops salt droplets. The condenser cools it with sea water and it falls as distillate.",
      "The rest of the feed leaves as brine. The ejector removes brine and air. The ejector pump drives the ejector and feeds the condenser."]},
    {id:"seq",t:"2. Start and stop",th:[
      "Open the sea valves, start the ejector pump and wait for vacuum before any heat goes in.",
      "Open the jacket water to the unit slowly. Set feed and start antiscalant dosing.",
      "Distillate goes to the tank only when the salinometer says it is good. Until then it is dumped back.",
      "To stop: remove the heat first. Keep the ejector pump running about 5 minutes to carry heat away. Close feed and dosing. Stop the pump and open the vacuum valve.",
      "Keep the jacket water bypass fully open when the unit is stopped."],op:"start"},
    {id:"q",t:"3. Quality and rules",th:[
      "Salinity limits are small, a few ppm. The dump valve protects the tank. Do not let it be switched off.",
      "Boiling above 55 °C builds scale fast. Dosing slows scale. Acid cleaning removes it.",
      "A feed ratio that is too low makes the brine too strong. Scale and carry-over follow.",
      "Do not make fresh water for drinking close to land or in polluted water. Treat and test the water before it is used."]},
    {id:"alm",t:"4. Faults and the companion",th:[
      "Low vacuum: read the ejector pressures first. Then look for air leaks.",
      "High salinity: check the salinometer, then priming, then the condenser for a leak.",
      "Type your real readings in the Actual page. The companion compares them with a healthy unit and suggests causes.",
      "Check any suggestion against the maker's manual before you act."]}
   ],
   quiz:[
    {lv:1,q:"Why can sea water boil at 40 to 50 °C in the unit?",o:["Salt lowers the boiling point","The pressure is low (a vacuum)","The jacket water is very hot","The ejector heats it"],a:1,why:"Water boils at a lower temperature when the pressure falls."},
    {lv:1,q:"Where does the heat come from?",o:["An electric heater","Steam only","The engine jacket cooling water","The sea water"],a:2,why:"The FWG uses heat that the engine would waste."},
    {lv:1,q:"The salinometer says the distillate is too salty. What should happen?",o:["It goes to the tank","The dump valve sends it back to the unit","The ejector stops","The feed closes"],a:1,why:"The dump valve protects the fresh water tank."},
    {lv:2,q:"Why keep the ejector pump running about 5 minutes after the heat is off?",o:["To make more water","To carry the remaining heat away and flush the unit","To raise the vacuum","To dose chemicals"],a:1,why:"Feed and sea water remove the leftover heat."},
    {lv:2,q:"Vacuum is low and the sea water inlet pressure to the ejector is low. First action?",o:["Look for air leaks","Fix the pressure: clean the strainer, check valves and pump","Raise the jacket water temperature","Stop dosing"],a:1,why:"The ejector cannot hold vacuum without enough pressure. Fix that first."},
    {lv:2,q:"Boiling temperature is above 55 °C. What is the main risk?",o:["Low salinity","Fast scale build-up","Too much vacuum","Cold distillate"],a:1,why:"Scale grows quickly at high boiling temperature."},
    {lv:2,q:"Why is the jacket water bypass left fully open when the unit is stopped?",o:["So the engine cooling is not disturbed by a cold unit","To fill the unit","To make vacuum","To stop the pump"],a:0,why:"Jacket water then flows past the unit and the engine temperature stays steady."},
    {lv:3,q:"The feed ratio is below 2.5 to 1. What follows?",o:["The brine is too weak","The brine is too strong, so scale and carry-over risk rise","Output doubles","Salinity falls"],a:1,why:"Less feed means more concentrated brine. Clean the orifice and check the feed pressure."}
   ]
  },
  boiler:{
   title:"Composite boiler",
   mods:[
    {id:"why",t:"1. What a composite boiler is",th:[
      "One drum is heated two ways: by an oil burner, and by exhaust gas from the main engine.",
      "At sea the exhaust gas makes most steam. In port or at low load the burner makes it up.",
      "Steam pressure is held by the burner. Extra steam is dumped to the dump condenser.",
      "Water level is the most important thing to watch. It has a normal band between low and high marks."]},
    {id:"seq",t:"2. The burner sequence",th:[
      "Permissives first: water level, FO temperature and pressure, fan, no trips.",
      "The fan purifies the furnace of any unburnt fuel. Only then the ignition and the fuel valves open.",
      "The flame scanner must see the flame in a few seconds. If not, the burner locks out.",
      "After a lockout, find and clear the cause. Then acknowledge and reset."],op:"start"},
    {id:"wat",t:"3. Water treatment and blowdown",th:[
      "Test the boiler water: alkalinity, pH, chloride, conductivity and oxygen scavenger.",
      "Dosing raises alkalinity and pH. It cannot lower chloride. Only blowdown does.",
      "High chloride means sea water is getting in. Find the leak: condenser, cooler or the dump condenser.",
      "Surface blowdown removes scum. Bottom blowdown removes sludge. Use your treatment supplier's limits."]},
    {id:"saf",t:"4. Safety and trips",th:[
      "Shrink and swell: when pressure drops, bubbles form and the level seems to rise. Then it falls. Do not feed on the first rise.",
      "If the gauge glass and the level transmitter disagree, blow through the glass. Trust neither until you know.",
      "If the level is lost, stop the burner. Never feed cold water into a hot dry boiler.",
      "Never bypass the low-water, high-pressure or flame trips."]}
   ],
   quiz:[
    {lv:1,q:"What heats a composite boiler?",o:["Only an oil burner","Only exhaust gas","An oil burner and exhaust gas, into one drum","Electric elements"],a:2,why:"That is why it is called composite."},
    {lv:1,q:"What does the burner do before ignition?",o:["Opens the steam stop","Purges the furnace with the fan","Raises the pressure","Starts the feed pump"],a:1,why:"The purge clears unburnt fuel vapour that could explode."},
    {lv:1,q:"The low-low water trip has stopped the burner. What must you NOT do?",o:["Check the gauge glass","Tell the Chief Engineer","Feed cold water at once","Let the boiler cool"],a:2,why:"Cold water on hot dry tubes can cause thermal shock and rupture."},
    {lv:2,q:"Steam demand jumps and the pressure falls. What does the level do first?",o:["It swells upward","It falls at once","It stays still","It is unaffected"],a:0,why:"Bubbles form in the water as pressure falls, so the level seems to rise. It then falls back."},
    {lv:2,q:"The gauge glass reads full but the level transmitter is normal. Likely cause?",o:["A blocked steam cock on the glass","High pressure","Low alkalinity","Dirty scanner"],a:0,why:"A blocked steam cock makes the glass read full. Blow through the glass."},
    {lv:2,q:"Boiler water chloride is high. What is correct?",o:["Add more dosing chemicals","Find and stop the sea water leak, and blow down","Raise the pressure","Do nothing"],a:1,why:"Dosing never lowers chloride. Blowdown removes it only after the leak is stopped."},
    {lv:2,q:"The flame fails and the burner locks out. What is the right order?",o:["Reset at once and retry many times","Clear the cause such as a dirty scanner, then acknowledge and reset","Bypass the scanner","Raise the FO temperature"],a:1,why:"The cause must be cleared first. Never bypass the scanner."},
    {lv:3,q:"The EG outlet temperature climbs fast and the gas-side ΔP is high. What do you NOT do?",o:["Tell the Chief Engineer and the bridge","Start soot blowing","Follow the ship's EG boiler fire procedure","Reduce engine load as ordered"],a:1,why:"Soot blowing adds air to a possible soot fire."}
   ]
  }
 }
};
