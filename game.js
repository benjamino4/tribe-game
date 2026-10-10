/* ============================================================
   TRIBES  —  Telegram Mini App  —  FF-style top-down RPG
   Top-down overworld (named towns, castles, NPCs, roaming
   named monsters) + side-view turn-based battle with real
   attack animations and magic spell VFX.
   Art: Tiny Swords (world/buildings) + Pixel Crawler
   (hero/NPCs/monsters) + Super Pixel Effects (magic).
   ============================================================ */
(function(){
'use strict';

/* ---------- Telegram WebApp ---------- */
var TG = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (TG){ try{
  TG.ready(); TG.expand();
  if(TG.disableVerticalSwipes) TG.disableVerticalSwipes();
  if(TG.setHeaderColor) TG.setHeaderColor('#12230f');
  if(TG.setBackgroundColor) TG.setBackgroundColor('#0b1a0b');
}catch(e){} }
function haptic(type){ try{ if(TG&&TG.HapticFeedback){ if(type==='sel')TG.HapticFeedback.selectionChanged(); else TG.HapticFeedback.impactOccurred(type||'light'); } }catch(e){} }

/* ---------- On-screen error reporting ---------- */
window.addEventListener('error', function(e){
  var el=document.getElementById('loading');
  if(el){ el.classList.remove('hide'); el.style.opacity=1;
    el.textContent='JS Error: '+((e&&e.message)||'')+' @'+(((e&&e.filename)||'').split('/').pop())+':'+((e&&e.lineno)||'?'); }
});

/* ---------- Canvas / viewport (portrait) ---------- */
var canvas=document.getElementById('game'), ctx=canvas.getContext('2d');
var VW=0,VH=0,DPR=1;
function resize(){
  var w=window.innerWidth, h=(TG&&TG.viewportStableHeight)?TG.viewportStableHeight:window.innerHeight;
  DPR=Math.min(window.devicePixelRatio||1,2);
  VW=w; VH=h;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  canvas.width=Math.round(w*DPR); canvas.height=Math.round(h*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.imageSmoothingEnabled=false;   // crisp pixel art
}
window.addEventListener('resize',resize);
if(TG&&TG.onEvent){ try{TG.onEvent('viewportChanged',resize);}catch(e){} }
resize();
/* ---------- Asset manifest (baked from processed packs) ---------- */
var A={"hero":{"idle":{"down":{"file":"assets2/hero/idle_down.png","frames":4,"fw":64,"fh":64},"up":{"file":"assets2/hero/idle_up.png","frames":4,"fw":64,"fh":64},"side":{"file":"assets2/hero/idle_side.png","frames":4,"fw":64,"fh":64}},"walk":{"down":{"file":"assets2/hero/walk_down.png","frames":6,"fw":64,"fh":64},"up":{"file":"assets2/hero/walk_up.png","frames":6,"fw":64,"fh":64},"side":{"file":"assets2/hero/walk_side.png","frames":6,"fw":64,"fh":64}},"run":{"down":{"file":"assets2/hero/run_down.png","frames":6,"fw":64,"fh":64},"up":{"file":"assets2/hero/run_up.png","frames":6,"fw":64,"fh":64},"side":{"file":"assets2/hero/run_side.png","frames":6,"fw":64,"fh":64}},"slice":{"down":{"file":"assets2/hero/slice_down.png","frames":8,"fw":64,"fh":64},"up":{"file":"assets2/hero/slice_up.png","frames":8,"fw":64,"fh":64},"side":{"file":"assets2/hero/slice_side.png","frames":8,"fw":64,"fh":64}},"hit":{"down":{"file":"assets2/hero/hit_down.png","frames":4,"fw":64,"fh":64},"up":{"file":"assets2/hero/hit_up.png","frames":4,"fw":64,"fh":64},"side":{"file":"assets2/hero/hit_side.png","frames":4,"fw":64,"fh":64}},"death":{"down":{"file":"assets2/hero/death_down.png","frames":8,"fw":64,"fh":64},"up":{"file":"assets2/hero/death_up.png","frames":8,"fw":64,"fh":64},"side":{"file":"assets2/hero/death_side.png","frames":8,"fw":64,"fh":64}}},"npc":{"peasant":{"file":"assets2/npc/peasant.png","frames":4,"fw":64,"fh":64},"tavern":{"file":"assets2/npc/tavern.png","frames":4,"fw":64,"fh":64},"knight":{"file":"assets2/npc/knight.png","frames":4,"fw":32,"fh":32},"wizard":{"file":"assets2/npc/wizard.png","frames":4,"fw":32,"fh":32},"rogue":{"file":"assets2/npc/rogue.png","frames":4,"fw":32,"fh":32}},"mob":{"skel_base":{"idle":{"file":"assets2/mob/skel_base_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/skel_base_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/skel_base_death.png","frames":12,"fw":64,"fh":64}},"skel_warrior":{"idle":{"file":"assets2/mob/skel_warrior_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/skel_warrior_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/skel_warrior_death.png","frames":8,"fw":48,"fh":48}},"skel_mage":{"idle":{"file":"assets2/mob/skel_mage_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/skel_mage_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/skel_mage_death.png","frames":6,"fw":64,"fh":64}},"skel_rogue":{"idle":{"file":"assets2/mob/skel_rogue_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/skel_rogue_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/skel_rogue_death.png","frames":6,"fw":64,"fh":64}},"orc":{"idle":{"file":"assets2/mob/orc_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/orc_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/orc_death.png","frames":6,"fw":64,"fh":64}},"orc_warrior":{"idle":{"file":"assets2/mob/orc_warrior_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/orc_warrior_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/orc_warrior_death.png","frames":7,"fw":82,"fh":80}},"orc_shaman":{"idle":{"file":"assets2/mob/orc_shaman_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/orc_shaman_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/orc_shaman_death.png","frames":7,"fw":64,"fh":64}},"orc_rogue":{"idle":{"file":"assets2/mob/orc_rogue_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/orc_rogue_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/orc_rogue_death.png","frames":6,"fw":64,"fh":64}}},"build":{"blue_castle":{"file":"assets2/build/blue_castle.png","w":320,"h":256},"blue_tower":{"file":"assets2/build/blue_tower.png","w":128,"h":256},"blue_house1":{"file":"assets2/build/blue_house1.png","w":128,"h":192},"blue_house2":{"file":"assets2/build/blue_house2.png","w":128,"h":192},"blue_house3":{"file":"assets2/build/blue_house3.png","w":128,"h":192},"blue_monastery":{"file":"assets2/build/blue_monastery.png","w":192,"h":320},"blue_barracks":{"file":"assets2/build/blue_barracks.png","w":192,"h":256},"blue_archery":{"file":"assets2/build/blue_archery.png","w":192,"h":256},"red_castle":{"file":"assets2/build/red_castle.png","w":320,"h":256},"red_tower":{"file":"assets2/build/red_tower.png","w":128,"h":256},"red_house1":{"file":"assets2/build/red_house1.png","w":128,"h":192},"red_house2":{"file":"assets2/build/red_house2.png","w":128,"h":192},"red_house3":{"file":"assets2/build/red_house3.png","w":128,"h":192},"red_monastery":{"file":"assets2/build/red_monastery.png","w":192,"h":320},"red_barracks":{"file":"assets2/build/red_barracks.png","w":192,"h":256},"red_archery":{"file":"assets2/build/red_archery.png","w":192,"h":256}},"terr":{"grass":{"file":"assets2/terr/grass.png","w":64,"h":64},"water":{"file":"assets2/terr/water.png","w":64,"h":64},"tree":{"file":"assets2/terr/tree.png","w":192,"h":256},"rock":{"file":"assets2/terr/rock.png","w":64,"h":64},"bush":{"file":"assets2/terr/bush.png","w":128,"h":128}},"spell":{"fire":{"file":"assets2/spell/fire.png","frames":13,"fw":128,"fh":128},"heal":{"file":"assets2/spell/heal.png","frames":16,"fw":128,"fh":128},"poison":{"file":"assets2/spell/poison.png","frames":17,"fw":128,"fh":128},"lightning":{"file":"assets2/spell/lightning.png","frames":7,"fw":128,"fh":128},"slash":{"file":"assets2/spell/slash.png","frames":7,"fw":96,"fh":96}}};
/* ---------- Image loader (progress + watchdog) ---------- */
var images={}; var toLoad=0, loaded=0, failed=[];
function load(key,src){ if(images[key])return; toLoad++; var im=new Image();
  im.onload=function(){loaded++;};
  im.onerror=function(){loaded++; failed.push(src);};
  im.src=src; images[key]=im; }
function setLoadMsg(t){ var el=document.getElementById('loading'); if(el&&!el.classList.contains('hide')) el.textContent=t; }
function walk(obj,prefix){
  for(var k in obj){ var v=obj[k];
    if(v && typeof v==='object' && v.file){ load(prefix+'_'+k, v.file); }
    else if(v && typeof v==='object'){ walk(v, prefix+'_'+k); }
  }
}
function loadAll(cb){
  walk(A.hero,'hero'); walk(A.npc,'npc'); walk(A.mob,'mob');
  walk(A.build,'build'); walk(A.terr,'terr'); walk(A.spell,'spell');
  var waited=0, MAXW=12000;
  (function wait(){
    setLoadMsg('Mustering the tribe\u2026 '+loaded+'/'+toLoad);
    if(loaded>=toLoad || waited>=MAXW){ cb(); }
    else { waited+=60; setTimeout(wait,60); }
  })();
}

/* ---------- Utility ---------- */
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
// a broken(404) image is truthy but drawImage() on it THROWS in a real browser.
function imgReady(im){ return !!(im && im.complete && im.naturalWidth>0); }
function lerp(a,b,t){ return a+(b-a)*t; }
function rand(a,b){ return a+Math.random()*(b-a); }
function randint(a,b){ return Math.floor(rand(a,b+1)); }
function choice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function dist(ax,ay,bx,by){ return Math.hypot(ax-bx,ay-by); }

/* ---------- Sprite helpers ---------- */
// draw one frame of a horizontal strip, anchored bottom-centre at (dx,dy)
function drawFrame(img,fw,fh,fi,dx,dy,scale,flip){
  if(!imgReady(img)) return false;
  var w=fw*scale, h=fh*scale;
  ctx.save(); ctx.translate(dx,dy); if(flip)ctx.scale(-1,1);
  ctx.drawImage(img, fi*fw,0, fw,fh, -w/2,-h, w,h);
  ctx.restore(); return true;
}
// draw a static image anchored bottom-centre
function drawStatic(img,w,h,dx,dy,scale){
  if(!imgReady(img)) return false;
  ctx.drawImage(img, dx-w*scale/2, dy-h*scale, w*scale, h*scale); return true;
}
function drawShadow(dx,dy,rw){ ctx.save(); ctx.globalAlpha=0.3; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(dx,dy,rw,rw*0.4,0,0,6.283); ctx.fill(); ctx.restore(); }
/* ---------- Input ---------- */
var keys={up:false,down:false,left:false,right:false,a:false,b:false};
var pressed={a:false,b:false};
function setKey(k,v){ if(!(k in keys))return; if(v&&!keys[k]&&(k==='a'||k==='b'))pressed[k]=true; keys[k]=v; }
Array.prototype.forEach.call(document.querySelectorAll('.dbtn,.abtn'),function(btn){
  var k=btn.getAttribute('data-k');
  function dn(e){ e.preventDefault(); setKey(k,true); btn.classList.add('pressed'); if(k==='a'||k==='b')haptic('light'); }
  function up(e){ e.preventDefault(); setKey(k,false); btn.classList.remove('pressed'); }
  btn.addEventListener('touchstart',dn,{passive:false});
  btn.addEventListener('touchend',up,{passive:false});
  btn.addEventListener('touchcancel',up,{passive:false});
  btn.addEventListener('mousedown',dn); btn.addEventListener('mouseup',up); btn.addEventListener('mouseleave',up);
});
var KMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',j:'a',z:'a',Enter:'a',k:'b',x:'b',Shift:'b'};
window.addEventListener('keydown',function(e){ var k=KMAP[e.key]; if(k){ setKey(k,true); e.preventDefault(); } });
window.addEventListener('keyup',function(e){ var k=KMAP[e.key]; if(k){ setKey(k,false); e.preventDefault(); } });
function consume(k){ if(pressed[k]){ pressed[k]=false; return true; } return false; }
var navHold={up:0,down:0};
function navEdge(k){ if(keys[k]){ if(navHold[k]<=0){ navHold[k]=0.18; return true; } navHold[k]-=1/60; } else navHold[k]=0; return false; }

/* ---------- VFX: particles / floating text / screen-shake ---------- */
var PP=[],PP_MAX=260; for(var _i=0;_i<PP_MAX;_i++)PP.push({a:0});
function emit(x,y,n,opt){ opt=opt||{}; for(var i=0;i<PP_MAX&&n>0;i++){ var p=PP[i]; if(p.a>0)continue; n--;
  p.a=1; p.x=x;p.y=y; var ang=opt.ang!=null?opt.ang:rand(0,6.283), sp=rand(opt.sp0||40,opt.sp1||140);
  p.vx=Math.cos(ang)*sp+(opt.dvx||0); p.vy=Math.sin(ang)*sp+(opt.dvy||0);
  p.life=rand(opt.l0||0.4,opt.l1||0.9); p.t=p.life; p.r=rand(opt.r0||2,opt.r1||5);
  p.col=opt.col||'#ffcf6b'; p.g=opt.g||140; } }
function updPP(dt){ for(var i=0;i<PP_MAX;i++){ var p=PP[i]; if(p.a<=0)continue; p.t-=dt; if(p.t<=0){p.a=0;continue;}
  p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; } }
function drawPP(ox,oy){ for(var i=0;i<PP_MAX;i++){ var p=PP[i]; if(p.a<=0)continue; var k=p.t/p.life;
  ctx.globalAlpha=k; ctx.fillStyle=p.col; var r=p.r*(0.4+0.6*k);
  ctx.beginPath(); ctx.arc(p.x-ox,p.y-oy,r,0,6.283); ctx.fill(); } ctx.globalAlpha=1; }
var floats=[];
function floatText(x,y,txt,col){ floats.push({x:x,y:y,txt:txt,col:col||'#fff',t:1.1}); }
function updFloats(dt){ for(var i=floats.length-1;i>=0;i--){ var f=floats[i]; f.t-=dt*0.85; f.y-=36*dt; if(f.t<=0)floats.splice(i,1); } }
function drawFloats(ox,oy){ ctx.textAlign='center'; for(var i=0;i<floats.length;i++){ var f=floats[i];
  ctx.globalAlpha=clamp(f.t,0,1); ctx.font='bold 20px Trebuchet MS';
  ctx.lineWidth=3; ctx.strokeStyle='rgba(0,0,0,.8)'; ctx.strokeText(f.txt,f.x-ox,f.y-oy);
  ctx.fillStyle=f.col; ctx.fillText(f.txt,f.x-ox,f.y-oy);} ctx.globalAlpha=1; ctx.textAlign='left'; }
var shake={t:0,mag:0};
function doShake(m,t){ shake.mag=Math.max(shake.mag,m); shake.t=Math.max(shake.t,t); }
function shakeOff(dt){ if(shake.t>0){ shake.t-=dt; var k=clamp(shake.t*4,0,1); return {x:rand(-1,1)*shake.mag*k,y:rand(-1,1)*shake.mag*k}; } return {x:0,y:0}; }

/* ---------- Spell FX player (one-shot Super-Pixel-Effects @15fps) ---------- */
var fxActive=[];   // {key,x,y,scale,t,done}
function playFX(key,x,y,scale){ var s=A.spell[key]; if(!s)return; fxActive.push({key:key,x:x,y:y,scale:scale||1,t:0,frames:s.frames}); }
function updFX(dt){ for(var i=fxActive.length-1;i>=0;i--){ var f=fxActive[i]; f.t+=dt;
  if(Math.floor(f.t*15)>=f.frames) fxActive.splice(i,1); } }
function drawFXAll(ox,oy){ for(var i=0;i<fxActive.length;i++){ var f=fxActive[i]; var s=A.spell[f.key]; var img=images['spell_'+f.key];
  if(!imgReady(img))continue; var fi=Math.min(f.frames-1,Math.floor(f.t*15));
  var w=s.fw*f.scale, h=s.fh*f.scale; ctx.globalCompositeOperation='lighter';
  ctx.drawImage(img, fi*s.fw,0, s.fw,s.fh, f.x-ox-w/2, f.y-oy-h/2, w,h);
  ctx.globalCompositeOperation='source-over'; } }
function fxBusy(){ return fxActive.length>0; }
/* ---------- World constants ---------- */
var TILE=40;                 // world px per tile (also draw size of ground tile)
var MW=44, MH=44;            // map size in tiles
var WMAX_X=MW*TILE, WMAX_Y=MH*TILE;

/* ---------- Player / save ---------- */
var player={
  wx:0, wy:0, dir:'down', facing:1, moving:false, anim:'idle', t:0, frame:0,
  level:1, xp:0, xpNext:30, job:'Vanguard',
  hp:120, hpMax:120, mp:28, mpMax:28, atk:14, def:6,
  gold:0, invuln:0, potions:3, ethers:2
};
var SAVE_KEY='tribes_save_v2';
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify({
  level:player.level,xp:player.xp,xpNext:player.xpNext,
  hp:player.hp,hpMax:player.hpMax,mp:player.mp,mpMax:player.mpMax,atk:player.atk,def:player.def,
  gold:player.gold,potions:player.potions,ethers:player.ethers,wx:player.wx,wy:player.wy
})); }catch(e){} }
function loadSave(){ try{ var s=JSON.parse(localStorage.getItem(SAVE_KEY)); if(s){ for(var k in s) player[k]=s[k]; return true; } }catch(e){} return false; }
function hasSave(){ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } }

/* ---------- Monster catalog (named, with stats + element) ---------- */
// spell = effect an enemy caster throws at the hero; null = melee only
var MOB={
  skel_base:    {name:'Rattlebone',     hp:40, atk:10, def:3, xp:14, gold:8,  draw:2.4, spell:null,      tier:1},
  skel_rogue:   {name:'Grave Stalker',  hp:46, atk:14, def:3, xp:20, gold:12, draw:2.4, spell:null,      tier:1},
  skel_warrior: {name:'Skeleton Knight',hp:64, atk:16, def:7, xp:30, gold:18, draw:2.6, spell:null,      tier:2},
  skel_mage:    {name:'Bone Conjurer',  hp:50, atk:13, def:4, xp:28, gold:20, draw:2.5, spell:'lightning',tier:2},
  orc:          {name:'Orc Grunt',      hp:58, atk:14, def:5, xp:22, gold:14, draw:2.6, spell:null,      tier:1},
  orc_rogue:    {name:'Orc Marauder',   hp:66, atk:17, def:5, xp:30, gold:20, draw:2.6, spell:null,      tier:2},
  orc_shaman:   {name:'Orc Shaman',     hp:70, atk:15, def:6, xp:38, gold:28, draw:2.6, spell:'poison',  tier:3},
  orc_warrior:  {name:'Orc Warchief',   hp:110,atk:22, def:9, xp:70, gold:60, draw:2.8, spell:'fire',    tier:4}
};

/* ---------- Hero spells (FF-style Magic menu) ---------- */
var SPELLS=[
  {name:'Firaga',  mp:6,  fx:'fire',     col:'#ff8a3c', pow:1.6, kind:'atk', desc:'Hurl a burst of flame.'},
  {name:'Thundara',mp:8,  fx:'lightning',col:'#c9a6ff', pow:1.9, kind:'atk', desc:'Call down lightning.'},
  {name:'Venom',   mp:5,  fx:'poison',   col:'#8fe36b', pow:1.1, kind:'poison', desc:'Poison the foe over time.'},
  {name:'Cura',    mp:7,  fx:'heal',     col:'#ffe08a', pow:0,   kind:'heal', desc:'Restore your health.'}
];
var ITEMS=[
  {name:'Potion', key:'potions', desc:'Restore 60 HP.'},
  {name:'Ether',  key:'ethers',  desc:'Restore 18 MP.'}
];
/* ---------- World state ---------- */
var BSCALE=0.7;
var buildings=[];   // {key,wx,wy,scale,name,town}
var npcs=[];        // {name,sprite,wx,wy,lines,t,frame,fw,fh,frames,scale}
var deco=[];        // {kind,wx,wy,scale,solid}
var roamers=[];     // {kind,wx,wy,name,t,frame,vx,vy,dir,cool,hp}
var towns=[];       // {name,wx,wy}
var lake={x0:18,y0:20,x1:24,y1:26};
var solids=[];      // collision rects {x,y,w,h}

function addBuild(key,tx,ty,name,town){
  var m=A.build[key]; var wx=tx*TILE+TILE/2, wy=ty*TILE+TILE;
  buildings.push({key:key,wx:wx,wy:wy,scale:BSCALE,name:name,town:town});
  var bw=m.w*BSCALE*0.55;
  solids.push({x:wx-bw/2, y:wy-18, w:bw, h:20});
}
function addNPC(sprite,tx,ty,name,lines){
  var m=A.npc[sprite];
  npcs.push({name:name,sprite:sprite,wx:tx*TILE+TILE/2,wy:ty*TILE+TILE,
    lines:lines,t:rand(0,2),frame:0,fw:m.fw,fh:m.fh,frames:m.frames,scale:m.fh>=64?0.9:1.7});
}
function addDeco(kind,tx,ty,solid){
  var m=A.terr[kind]; var sc = kind==='tree'?0.6:(kind==='bush'?0.5:0.9);
  var wx=tx*TILE+TILE/2, wy=ty*TILE+TILE;
  deco.push({kind:kind,wx:wx,wy:wy,scale:sc,solid:!!solid});
  if(solid) solids.push({x:wx-14,y:wy-14,w:28,h:16});
}
function addRoamer(kind,tx,ty){
  roamers.push({kind:kind,wx:tx*TILE+TILE/2,wy:ty*TILE+TILE/2,name:MOB[kind].name,
    t:rand(0,4),frame:0,vx:0,vy:0,dir:1,cool:0});
}

function genWorld(){
  buildings=[]; npcs=[]; deco=[]; roamers=[]; towns=[]; solids=[];
  // ---- Emberhold (friendly capital, NW) ----
  towns.push({name:'Emberhold',wx:10*TILE,wy:7*TILE});
  addBuild('blue_castle',10,8,'Emberhold Castle','Emberhold');
  addBuild('blue_tower',6,7,'Watchtower','Emberhold');
  addBuild('blue_monastery',14,8,'Monastery of Dawn','Emberhold');
  addBuild('blue_house1',7,11,'Cottage','Emberhold');
  addBuild('blue_house2',13,12,'Tavern of the Ember','Emberhold');
  addNPC('knight',10,11,'King Aldric',['Welcome home, Vanguard.','Grimspire Keep stirs in the north-east.','Drive back the Warchief and the realm is yours.']);
  addNPC('wizard',8,10,'Sage Morwen',['Magic flows through you, child.','Press Magic in battle to unleash Firaga or Thundara.','Thunder bites hardest against the undead.']);
  addNPC('peasant',13,11,'Old Hensel',['These fields were green before the orcs came.','Rest at a tavern to heal fully, free of charge.']);
  addNPC('tavern',14,12,'Brida the Keep',['A hot meal mends all wounds.','Step close and press A — I\'ll patch you right up.']);
  // ---- Ravenmoor (border village, SE) ----
  towns.push({name:'Ravenmoor',wx:33*TILE,wy:31*TILE});
  addBuild('blue_barracks',33,32,'Ravenmoor Barracks','Ravenmoor');
  addBuild('blue_archery',37,33,'Archery Range','Ravenmoor');
  addBuild('blue_house3',30,33,'Fisher\'s Hut','Ravenmoor');
  addBuild('blue_tower',37,30,'South Watchtower','Ravenmoor');
  addNPC('knight',33,35,'Capt. Doran',['Hold, soldier. The roads crawl with orc raiders.','Train hard — each kill makes you stronger.']);
  addNPC('rogue',31,34,'Sly Finn',['Psst. Potions sell cheap if you had any coin.','Venom magic? Cowardly. I love it.']);
  // ---- Grimspire Keep (enemy stronghold, NE) ----
  towns.push({name:'Grimspire Keep',wx:34*TILE,wy:7*TILE});
  addBuild('red_castle',34,8,'Grimspire Keep','Grimspire');
  addBuild('red_tower',30,7,'Blood Tower','Grimspire');
  addBuild('red_barracks',38,10,'War Pit','Grimspire');
  /*__DECO__*/
  // scatter trees (forests), rocks, bushes avoiding towns/lake
  function far(tx,ty){
    if(tx<2||ty<2||tx>MW-2||ty>MH-2) return false;
    if(tx>=lake.x0-1&&tx<=lake.x1+1&&ty>=lake.y0-1&&ty<=lake.y1+1) return false;
    for(var i=0;i<buildings.length;i++){ if(dist(tx*TILE,ty*TILE,buildings[i].wx,buildings[i].wy)<TILE*3) return false; }
    return true;
  }
  var forests=[[20,6],[26,14],[6,20],[14,30],[24,36],[38,20],[16,16]];
  for(var fi=0;fi<forests.length;fi++){ var cx=forests[fi][0],cy=forests[fi][1];
    for(var n=0;n<14;n++){ var tx=cx+randint(-3,3),ty=cy+randint(-3,3);
      if(far(tx,ty)&&Math.random()<0.7) addDeco('tree',tx,ty,true); } }
  for(var r=0;r<26;r++){ var rx=randint(2,MW-2),ry=randint(2,MH-2); if(far(rx,ry)) addDeco('rock',rx,ry,true); }
  for(var b=0;b<34;b++){ var bx=randint(2,MW-2),by=randint(2,MH-2); if(far(bx,by)) addDeco('bush',bx,by,false); }
  // roaming named monsters: skeletons mid, orcs near Grimspire
  var skel=['skel_base','skel_rogue','skel_warrior','skel_mage'];
  var orcs=['orc','orc_rogue','orc_shaman'];
  var spots=[[18,14],[22,18],[16,24],[24,26],[20,30],[28,22]];
  for(var si=0;si<spots.length;si++) addRoamer(choice(skel),spots[si][0],spots[si][1]);
  var ospots=[[30,12],[36,14],[32,16],[34,18]];
  for(var oi=0;oi<ospots.length;oi++) addRoamer(choice(orcs),ospots[oi][0],ospots[oi][1]);
  addRoamer('orc_warrior',34,11);   // the Warchief guards the keep
  // spawn hero at Emberhold gate
  if(!player.wx){ player.wx=10*TILE; player.wy=14*TILE; }
}

/* ---------- Collision ---------- */
function inLake(wx,wy){ var tx=Math.floor(wx/TILE),ty=Math.floor(wy/TILE);
  return tx>=lake.x0&&tx<=lake.x1&&ty>=lake.y0&&ty<=lake.y1; }
function blocked(wx,wy){
  if(wx<TILE*0.5||wy<TILE*0.5||wx>WMAX_X-TILE*0.5||wy>WMAX_Y-TILE*0.3) return true;
  if(inLake(wx,wy)) return true;
  for(var i=0;i<solids.length;i++){ var s=solids[i];
    if(wx>s.x&&wx<s.x+s.w&&wy>s.y&&wy<s.y+s.h) return true; }
  return false;
}
/* ---------- Overworld ---------- */
var cam={x:0,y:0};
var dlg={active:false,name:'',lines:[],idx:0};
var nearInfo='';      // town/building name shown as a banner
var waterT=0;

function startDialogue(npc){
  dlg.active=true; dlg.name=npc.name; dlg.lines=npc.lines; dlg.idx=0; haptic('light');
  if(npc.sprite==='tavern'){ player.hp=player.hpMax; player.mp=player.mpMax;
    floatText(player.wx,player.wy-TILE,'Fully healed!','#8fe36b'); }
}
function overworldUpdate(dt){
  waterT+=dt;
  if(dlg.active){
    if(consume('a')){ dlg.idx++; haptic('sel'); if(dlg.idx>=dlg.lines.length) dlg.active=false; }
    if(consume('b')) dlg.active=false;
    return;
  }
  var ix=(keys.right?1:0)-(keys.left?1:0), iy=(keys.down?1:0)-(keys.up?1:0);
  var running=keys.b && (ix||iy);
  var sp=running?170:118;
  if(ix||iy){
    // facing / direction for sprite sheet
    if(ix!==0){ player.dir='side'; player.facing=ix>0?1:-1; }
    if(iy>0 && ix===0) player.dir='down';
    if(iy<0 && ix===0) player.dir='up';
    var len=Math.hypot(ix,iy)||1, nx=player.wx+ix/len*sp*dt, ny=player.wy+iy/len*sp*dt;
    if(!blocked(nx,player.wy)) player.wx=nx;
    if(!blocked(player.wx,ny)) player.wy=ny;
    player.moving=true; player.anim=running?'run':'walk';
  } else { player.moving=false; player.anim='idle'; }
  // animate hero
  var hd=A.hero[player.anim][player.dir], fps=player.anim==='run'?12:(player.anim==='walk'?9:5);
  player.t+=dt; if(player.t>=1/fps){ player.t=0; player.frame=(player.frame+1)%hd.frames; }
  if(player.invuln>0) player.invuln-=dt;
  // nearby town/building banner + NPC
  nearInfo='';
  var nearNPC=null, nd=1e9;
  for(var i=0;i<npcs.length;i++){ var np=npcs[i]; var d=dist(player.wx,player.wy,np.wx,np.wy);
    np.t+=dt; if(np.t>=0.28){ np.t=0; np.frame=(np.frame+1)%np.frames; }
    if(d<TILE*1.3 && d<nd){ nd=d; nearNPC=np; } }
  for(var ti=0;ti<towns.length;ti++){ if(dist(player.wx,player.wy,towns[ti].wx,towns[ti].wy)<TILE*5){ nearInfo=towns[ti].name; break; } }
  if(nearNPC) nearInfo=nearNPC.name+'  ▸ press A';
  // interact
  if(consume('a') && nearNPC) startDialogue(nearNPC);
  // roamers wander + chase, contact -> battle
  for(var ri=0;ri<roamers.length;ri++){ var ro=roamers[ri]; ro.t+=dt; ro.cool-=dt;
    var dx=player.wx-ro.wx, dy=player.wy-ro.wy, dd=Math.hypot(dx,dy);
    if(dd<TILE*3.5){ ro.vx=dx/dd*70; ro.vy=dy/dd*70; }
    else if(ro.t>2){ ro.t=0; ro.vx=rand(-34,34); ro.vy=rand(-34,34); }
    var rnx=ro.wx+ro.vx*dt, rny=ro.wy+ro.vy*dt;
    if(!blocked(rnx,ro.wy)) ro.wx=rnx; else ro.vx*=-1;
    if(!blocked(ro.wx,rny)) ro.wy=rny; else ro.vy*=-1;
    if(ro.vx) ro.dir=ro.vx>0?1:-1;
    ro.frame=(ro.frame+ (dd<TILE*3.5?0.18:0.1))%4;
    if(dd<24 && player.invuln<=0){ startBattle(ro); return; }
  }
  // camera follows hero (clamped)
  cam.x=clamp(player.wx-VW/2, 0, WMAX_X-VW); if(WMAX_X<VW)cam.x=(WMAX_X-VW)/2;
  cam.y=clamp(player.wy-VH/2, 0, WMAX_Y-VH); if(WMAX_Y<VH)cam.y=(WMAX_Y-VH)/2;
  updPP(dt); updFloats(dt);
}
/* ---------- Overworld draw ---------- */
function drawGround(){
  var g=images['terr_grass'], w=images['terr_water'];
  var sc=TILE/64;
  var tx0=Math.floor(cam.x/TILE), ty0=Math.floor(cam.y/TILE);
  var tx1=Math.ceil((cam.x+VW)/TILE), ty1=Math.ceil((cam.y+VH)/TILE);
  for(var ty=ty0;ty<=ty1;ty++) for(var tx=tx0;tx<=tx1;tx++){
    var dx=tx*TILE-cam.x, dy=ty*TILE-cam.y;
    if(imgReady(g)) ctx.drawImage(g,0,0,64,64,dx,dy,TILE+1,TILE+1);
    else { ctx.fillStyle='#4a7a3a'; ctx.fillRect(dx,dy,TILE+1,TILE+1); }
  }
  // lake water (slight shimmer via alpha bob)
  for(var ly=lake.y0;ly<=lake.y1;ly++) for(var lx=lake.x0;lx<=lake.x1;lx++){
    var wx=lx*TILE-cam.x, wy=ly*TILE-cam.y;
    if(wx<-TILE||wy<-TILE||wx>VW||wy>VH) continue;
    if(imgReady(w)) ctx.drawImage(w,0,0,64,64,wx,wy,TILE+1,TILE+1);
    else { ctx.fillStyle='#2d6fb0'; ctx.fillRect(wx,wy,TILE+1,TILE+1); }
    ctx.globalAlpha=0.12+0.06*Math.sin(waterT*2+lx+ly); ctx.fillStyle='#bfe6ff'; ctx.fillRect(wx,wy,TILE+1,TILE+1); ctx.globalAlpha=1;
  }
}
function overworldDraw(sh){
  ctx.save(); ctx.translate(sh.x,sh.y);
  drawGround();
  // build y-sorted drawable list
  var list=[];
  for(var i=0;i<deco.length;i++){ (function(o){ list.push({y:o.wy,fn:function(){ var m=A.terr[o.kind];
    drawStatic(images['terr_'+o.kind], m.w,m.h, o.wx-cam.x, o.wy-cam.y, o.scale); }}); })(deco[i]); }
  for(i=0;i<buildings.length;i++){ (function(o){ list.push({y:o.wy,fn:function(){ var m=A.build[o.key];
    drawShadow(o.wx-cam.x, o.wy-cam.y, m.w*o.scale*0.3);
    drawStatic(images['build_'+o.key], m.w,m.h, o.wx-cam.x, o.wy-cam.y, o.scale); }}); })(buildings[i]); }
  for(i=0;i<npcs.length;i++){ (function(o){ list.push({y:o.wy,fn:function(){
    drawShadow(o.wx-cam.x, o.wy-cam.y, 12);
    drawFrame(images['npc_'+o.sprite], o.fw,o.fh, o.frame|0, o.wx-cam.x, o.wy-cam.y, o.scale, false); }}); })(npcs[i]); }
  for(i=0;i<roamers.length;i++){ (function(o){ list.push({y:o.wy,fn:function(){ var m=A.mob[o.kind].idle;
    drawShadow(o.wx-cam.x, o.wy-cam.y, 13);
    drawFrame(images['mob_'+o.kind+'_idle'], m.fw,m.fh, o.frame|0, o.wx-cam.x, o.wy-cam.y, 1.35, o.dir<0); }}); })(roamers[i]); }
  // hero
  list.push({y:player.wy, fn:function(){ var hd=A.hero[player.anim][player.dir];
    drawShadow(player.wx-cam.x, player.wy-cam.y, 15);
    var fl=(player.dir==='side'&&player.facing<0);
    if(!drawFrame(images['hero_'+player.anim+'_'+player.dir], hd.fw,hd.fh, Math.min(player.frame,hd.frames-1), player.wx-cam.x, player.wy-cam.y, 0.9, fl)){
      ctx.fillStyle='#6cc5ff'; ctx.fillRect(player.wx-cam.x-10, player.wy-cam.y-40, 20,40); } }});
  list.sort(function(a,b){return a.y-b.y;});
  for(i=0;i<list.length;i++) list[i].fn();
  drawPP(cam.x,cam.y); drawFloats(cam.x,cam.y);
  ctx.restore();
  // ---- HUD ----
  drawHUD();
  if(nearInfo){ ctx.font='bold 15px Trebuchet MS'; var tw=ctx.measureText(nearInfo).width;
    ctx.fillStyle='rgba(10,20,10,.72)'; roundRect(VW/2-tw/2-14, 10, tw+28, 28, 8); ctx.fill();
    ctx.strokeStyle='rgba(150,210,120,.6)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#eafbe0'; ctx.textAlign='center'; ctx.fillText(nearInfo, VW/2, 29); ctx.textAlign='left'; }
  if(dlg.active) drawDialogue();
}
function drawDialogue(){
  var h=118, y=VH-h-150;
  ctx.fillStyle='rgba(8,14,8,.9)'; roundRect(12,y,VW-24,h,12); ctx.fill();
  ctx.strokeStyle='rgba(180,150,90,.8)'; ctx.lineWidth=2.5; ctx.stroke();
  ctx.fillStyle='#ffd98a'; ctx.font='bold 16px Trebuchet MS'; ctx.fillText(dlg.name, 28, y+28);
  ctx.fillStyle='#f3e9d2'; ctx.font='15px Trebuchet MS';
  wrapText(dlg.lines[Math.min(dlg.idx,dlg.lines.length-1)]||'', 28, y+54, VW-56, 22, 'left');
  ctx.fillStyle='#9fd4ff'; ctx.font='12px Trebuchet MS'; ctx.textAlign='right';
  ctx.fillText('A ▸', VW-28, y+h-14); ctx.textAlign='left';
}
/* ---------- Shared UI helpers ---------- */
function roundRect(x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function bar(x,y,w,h,val,max,col){ ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(x,y,w,h);
  var k=clamp(max?val/max:0,0,1); ctx.fillStyle=col; ctx.fillRect(x,y,w*k,h);
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1; ctx.strokeRect(x+.5,y+.5,w-1,h-1); }
function wrapText(txt,x,y,maxw,lh,align){ var prev=ctx.textAlign; if(align)ctx.textAlign=align;
  var words=(''+txt).split(' '),line='',yy=y;
  for(var i=0;i<words.length;i++){ var t=line+words[i]+' '; if(ctx.measureText(t).width>maxw&&line){ ctx.fillText(line,x,yy); line=words[i]+' '; yy+=lh; } else line=t; }
  ctx.fillText(line,x,yy); ctx.textAlign=prev; }
function drawHUD(){
  ctx.fillStyle='rgba(8,14,8,.68)'; roundRect(8,VH-150-46,186,42,8); ctx.fill();
  ctx.strokeStyle='rgba(150,210,120,.4)'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle='#eafbe0'; ctx.font='bold 12px Trebuchet MS';
  ctx.fillText(player.job+' Lv.'+player.level, 16, VH-150-30);
  ctx.fillStyle='#ffd98a'; ctx.font='11px Trebuchet MS'; ctx.textAlign='right';
  ctx.fillText(player.gold+'g', 186, VH-150-30); ctx.textAlign='left';
  bar(16,VH-150-24,100,7,player.hp,player.hpMax,'#d2443a');
  bar(16,VH-150-14,100,7,player.mp,player.mpMax,'#3f74d6');
  ctx.fillStyle='#cfe0b0'; ctx.font='9px Trebuchet MS';
  ctx.fillText('HP',120,VH-150-18); ctx.fillText('MP',120,VH-150-8);
}
/* ============================================================
   BATTLE  (side-view, turn-based, animated + magic VFX)
   ============================================================ */
var B=null, bclock=0, evq=[];
function after(delay,fn){ evq.push({at:bclock+delay, fn:fn}); }
function clearEv(){ evq.length=0; }
function gy(){ return VH*0.54; }
function heroX(){ return VW*0.28 + (B?B.heroDX:0); }
function eneX(){ return VW*0.72 + (B?B.eneDX:0); }

function startBattle(roamer){
  var kind=roamer.kind, m=MOB[kind];
  // scale stats slightly by hero level so late fights stay tense
  var lv=player.level, sc=1+(lv-1)*0.12;
  B={ kind:kind, name:m.name, hpMax:Math.round(m.hp*sc), hp:Math.round(m.hp*sc),
      atk:Math.round(m.atk*sc), def:m.def, xp:Math.round(m.xp*sc), gold:Math.round(m.gold*sc),
      draw:m.draw, spell:m.spell,
      phase:'intro', menu:'root', cursor:0, msg:'',
      heroAnim:'idle', heroFrame:0, heroT:0, heroDX:0, eneDX:0,
      flashE:0, flashH:0, eneBob:0, poisonE:0, poisonH:0, over:false,
      roamer:roamer, dead:false, deathT:0 };
  state='battle'; clearEv(); bclock=0; fxActive.length=0;
  B.msg=m.name+' blocks your path!';
  after(1.1, function(){ backToMenu(); });
  haptic('medium'); doShake(6,0.3);
}
function heroPose(anim){ B.heroAnim=anim; B.heroFrame=0; B.heroT=0; }
function backToMenu(){ if(B.over)return; clearEv(); B.phase='menu'; B.menu='root'; B.cursor=0;
  heroPose('idle'); B.msg='What will '+player.job+' do?'; }
function dmg(atk,def,variance){ var base=Math.max(1, atk - def*0.6);
  var d=base*(1+rand(-variance,variance)); return Math.max(1,Math.round(d)); }

/* ---------- Hero actions ---------- */
function heroAttack(){ B.phase='anim'; clearEv(); B.msg=player.job+' strikes!'; heroPose('slice');
  after(0.12,function(){ B.heroDX=46; });                 // lunge in
  after(0.34,function(){ // impact
    playFX('slash', eneX(), gy()-70, 1.0);
    var d=dmg(player.atk, B.def, 0.18); B.hp=clamp(B.hp-d,0,B.hpMax); B.flashE=0.3; doShake(9,0.26); haptic('heavy');
    floatText(eneX(),gy()-90,'-'+d,'#fff'); emit(eneX(),gy()-70,14,{col:'#ffd27a',sp0:40,sp1:150});
  });
  after(0.6,function(){ B.heroDX=0; });
  after(0.85,function(){ if(B.hp<=0){ enemyDies(); return; } enemyTurn(); });
}
function heroMagic(i){ var s=SPELLS[i]; if(player.mp<s.mp){ B.msg='Not enough MP!'; after(0.9,backToMenu); return; }
  player.mp-=s.mp; B.phase='anim'; clearEv(); B.menu='root'; heroPose('slice');
  B.msg=player.job+' casts '+s.name+'!';
  emit(heroX(),gy()-70,16,{col:s.col,sp0:30,sp1:90,g:-30});
  if(s.kind==='heal'){
    after(0.3,function(){ playFX('heal', heroX(), gy()-70, 1.1);
      var h=Math.round(player.hpMax*0.5); player.hp=clamp(player.hp+h,0,player.hpMax);
      floatText(heroX(),gy()-100,'+'+h,'#8fe36b'); haptic('medium'); });
    after(1.1, backToMenu);
  } else {
    after(0.35,function(){ playFX(s.fx, eneX(), gy()-70, 1.15); doShake(10,0.3); B.flashE=0.35; haptic('heavy');
      var d=dmg(player.atk*s.pow, B.def*0.4, 0.14); B.hp=clamp(B.hp-d,0,B.hpMax);
      floatText(eneX(),gy()-95,'-'+d,s.col); emit(eneX(),gy()-70,18,{col:s.col,sp0:50,sp1:170});
      if(s.kind==='poison'){ B.poisonE=3; floatText(eneX(),gy()-120,'POISONED','#8fe36b'); } });
    after(1.15,function(){ if(B.hp<=0){ enemyDies(); return; } enemyTurn(); });
  }
}
function heroItem(i){ var it=ITEMS[i];
  if(player[it.key]<=0){ B.msg='None left!'; after(0.8,backToMenu); return; }
  player[it.key]--; B.phase='anim'; clearEv(); B.menu='root';
  if(it.key==='potions'){ player.hp=clamp(player.hp+60,0,player.hpMax); floatText(heroX(),gy()-100,'+60 HP','#8fe36b'); }
  else { player.mp=clamp(player.mp+18,0,player.mpMax); floatText(heroX(),gy()-100,'+18 MP','#6cc5ff'); }
  playFX('heal', heroX(), gy()-70, 0.8); haptic('light'); B.msg='Used '+it.name+'.';
  after(1.0, enemyTurn);
}
function heroFlee(){ B.phase='anim'; clearEv();
  if(Math.random()<0.6){ B.msg='Got away safely!'; after(0.9,function(){ endBattle(false); }); }
  else { B.msg='Could not escape!'; after(0.9, enemyTurn); } }
/* ---------- Enemy turn + resolutions ---------- */
function enemyTurn(){ if(B.over)return; clearEv(); B.phase='enemy';
  // poison DoT on enemy
  if(B.poisonE>0){ B.poisonE--; var pd=Math.round(B.hpMax*0.06)+3; B.hp=clamp(B.hp-pd,0,B.hpMax);
    playFX('poison',eneX(),gy()-70,0.7); floatText(eneX(),gy()-95,'-'+pd,'#8fe36b');
    after(0.6,function(){ if(B.hp<=0){ enemyDies(); return; } enemyAct(); }); return; }
  enemyAct();
}
function enemyAct(){
  var casts = B.spell && Math.random()<0.5;
  B.msg=B.name+(casts?' chants a dark spell!':' attacks!');
  if(casts){
    after(0.3,function(){ playFX(B.spell, heroX(), gy()-70, 1.0); doShake(10,0.3); B.flashH=0.35; heroPose('hit'); haptic('heavy');
      var d=dmg(B.atk*1.3, player.def, 0.2); if(player.invuln>0)d=0; player.hp=clamp(player.hp-d,0,player.hpMax);
      floatText(heroX(),gy()-100,'-'+d,'#ff8a3c'); emit(heroX(),gy()-70,14,{col:'#ff8a3c',sp0:40,sp1:150}); });
    after(1.0, afterEnemy);
  } else {
    after(0.18,function(){ B.eneDX=-54; });
    after(0.4,function(){ heroPose('hit'); B.flashH=0.3; doShake(8,0.26); haptic('heavy');
      var d=dmg(B.atk, player.def, 0.2); if(player.invuln>0)d=0; player.hp=clamp(player.hp-d,0,player.hpMax);
      floatText(heroX(),gy()-100,'-'+d,'#ff6b6b'); emit(heroX(),gy()-70,12,{col:'#ff6b6b',sp0:40,sp1:130}); });
    after(0.62,function(){ B.eneDX=0; });
    after(0.95, afterEnemy);
  }
}
function afterEnemy(){ if(player.hp<=0){ heroDies(); return; } backToMenu(); }
function enemyDies(){ if(B.over)return; B.over=true; B.phase='dying'; clearEv(); B.dead=true; B.deathT=0;
  B.msg=B.name+' is slain!'; emit(eneX(),gy()-60,26,{col:'#ffd27a',sp0:40,sp1:170}); haptic('medium');
  var dm=A.mob[B.kind].death; var dur=dm.frames/12;
  after(dur+0.5, victory);
}
function heroDies(){ if(B.over)return; B.over=true; B.phase='defeat'; clearEv(); heroPose('death');
  B.msg='You have fallen...'; haptic('heavy');
  after(1.9, function(){ gameOver('You were slain by '+B.name+'.'); });
}
function victory(){ B.phase='victory'; clearEv();
  player.gold+=B.gold; player.xp+=B.xp; B.msg='Victory!  +'+B.xp+' XP, +'+B.gold+'g';
  var lv=false; while(player.xp>=player.xpNext){ player.xp-=player.xpNext; player.level++; player.xpNext=Math.round(player.xpNext*1.5);
    player.hpMax+=16; player.mpMax+=5; player.atk+=3; player.def+=1; player.hp=player.hpMax; player.mp=player.mpMax; lv=true; }
  after(1.5,function(){ if(lv){ B.msg='Level up!  Now Lv.'+player.level; after(1.3,function(){ endBattle(true); }); }
    else endBattle(true); });
}
function endBattle(won){
  // remove the roamer we fought (if defeated), grant brief invuln
  if(won && B && B.roamer){ var ix=roamers.indexOf(B.roamer); if(ix>=0) roamers.splice(ix,1); }
  state='overworld'; player.invuln=1.2; B=null; save();
}
/* ---------- Battle: input + update ---------- */
var ROOT=['Fight','Magic','Item','Flee'];
function battleInput(){
  if(!B || B.phase!=='menu')return;
  var list = B.menu==='root'?ROOT : (B.menu==='magic'?SPELLS:ITEMS);
  if(navEdge('up')){ B.cursor=(B.cursor+list.length-1)%list.length; haptic('sel'); }
  if(navEdge('down')){ B.cursor=(B.cursor+1)%list.length; haptic('sel'); }
  if(consume('a')){
    if(B.menu==='root'){
      if(B.cursor===0) heroAttack();
      else if(B.cursor===1){ B.menu='magic'; B.cursor=0; haptic('sel'); }
      else if(B.cursor===2){ B.menu='item'; B.cursor=0; haptic('sel'); }
      else heroFlee();
    } else if(B.menu==='magic'){ heroMagic(B.cursor); }
    else heroItem(B.cursor);
  }
  if(consume('b')){ if(B.menu!=='root'){ B.menu='root'; B.cursor=0; haptic('light'); } }
}
function battleUpdate(dt){
  if(!B)return;
  bclock+=dt;
  evq.sort(function(a,b){return a.at-b.at;});
  while(evq.length && evq[0].at<=bclock){ var ev=evq.shift(); ev.fn(); if(!B)return; }
  B.eneBob+=dt;
  // hero anim
  var hd=A.hero[B.heroAnim].side; B.heroT+=dt;
  var fps=B.heroAnim==='slice'?14:(B.heroAnim==='hit'?10:(B.heroAnim==='death'?9:5));
  if(B.heroT>=1/fps){ B.heroT=0;
    if(B.heroAnim==='idle') B.heroFrame=(B.heroFrame+1)%hd.frames;
    else if(B.heroFrame<hd.frames-1) B.heroFrame++; }
  if(B.dead) B.deathT+=dt;
  if(B.flashE>0)B.flashE-=dt; if(B.flashH>0)B.flashH-=dt;
  if(player.invuln>0)player.invuln-=dt;
  updFX(dt); updPP(dt); updFloats(dt);
  battleInput();
}
/* ---------- Battle: render ---------- */
function battleDraw(sh){
  var g=gy();
  // sky
  var sky=ctx.createLinearGradient(0,0,0,g); sky.addColorStop(0,'#223a52'); sky.addColorStop(0.6,'#4a6a74'); sky.addColorStop(1,'#8fae7a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,VW,g);
  ctx.fillStyle='rgba(255,245,210,.5)'; ctx.beginPath(); ctx.arc(VW*0.72,g*0.34,38,0,6.283); ctx.fill();
  // distant hills
  function hill(by,col,amp,ph){ ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,g);
    for(var x=0;x<=VW;x+=22){ ctx.lineTo(x, by+Math.sin(x*0.012+ph)*amp); } ctx.lineTo(VW,g); ctx.closePath(); ctx.fill(); }
  hill(g-66,'#3f5e46',24,B.eneBob*0.1); hill(g-34,'#355139',18,B.eneBob*0.16+2);
  // ground
  var gnd=ctx.createLinearGradient(0,g,0,VH); gnd.addColorStop(0,'#5a7a3e'); gnd.addColorStop(1,'#30451f');
  ctx.fillStyle=gnd; ctx.fillRect(0,g,VW,VH-g);
  ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1;
  for(var i=1;i<6;i++){ var yy=g+(VH-g)*(i/6)*(i/6); ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(VW,yy); ctx.stroke(); }

  ctx.save(); ctx.translate(sh.x,sh.y);
  var hx=heroX(), ex=eneX();
  drawShadow(ex,g,46); drawShadow(hx,g,34);
  // enemy (idle, or death sheet while dying)
  var mdef=A.mob[B.kind];
  if(B.dead){ var dm=mdef.death, dfi=Math.min(dm.frames-1,Math.floor(B.deathT*12)), dsc=118/dm.fh;
    if(B.deathT < dm.frames/12 + 0.4) drawFrame(images['mob_'+B.kind+'_death'], dm.fw,dm.fh, dfi, ex, g, dsc, true);
  } else {
    var im=mdef.idle, ifi=Math.floor(B.eneBob*6)%im.frames, isc=108/im.fh, bob=Math.sin(B.eneBob*3)*3;
    drawFrame(images['mob_'+B.kind+'_idle'], im.fw,im.fh, ifi, ex, g-bob, isc, true);
    if(B.flashE>0){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=clamp(B.flashE*2.5,0,0.9);
      drawFrame(images['mob_'+B.kind+'_idle'], im.fw,im.fh, ifi, ex, g-bob, isc, true);
      ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; }
  }
  // hero (faces right toward enemy)
  var hdef=A.hero[B.heroAnim].side;
  drawFrame(images['hero_'+B.heroAnim+'_side'], hdef.fw,hdef.fh, Math.min(B.heroFrame,hdef.frames-1), hx, g, 1.7, false);
  if(B.flashH>0){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=clamp(B.flashH*2.5,0,0.9);
    drawFrame(images['hero_'+B.heroAnim+'_side'], hdef.fw,hdef.fh, Math.min(B.heroFrame,hdef.frames-1), hx, g, 1.7, false);
    ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; }
  drawFXAll(0,0); drawPP(0,0); drawFloats(0,0);
  ctx.restore();

  // enemy nameplate + HP
  ctx.fillStyle='rgba(8,14,8,.68)'; roundRect(VW/2-130,14,260,36,8); ctx.fill();
  ctx.strokeStyle='rgba(224,120,90,.5)'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#f3e9d2'; ctx.font='bold 14px Trebuchet MS'; ctx.textAlign='center';
  ctx.fillText(B.name, VW/2, 30); ctx.textAlign='left'; bar(VW/2-112,34,224,8,Math.max(0,B.hp),B.hpMax,'#d2443a');
  if(B.poisonE>0){ ctx.fillStyle='#8fe36b'; ctx.font='10px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText('POISON '+B.poisonE, VW/2, 48); ctx.textAlign='left'; }
  battleUI();
}
/* ---------- Battle UI (message + stats + command window) ---------- */
function battleUI(){
  var by=VH-150-96;
  // message bar
  ctx.fillStyle='rgba(8,14,8,.8)'; roundRect(10,by,VW-20,34,8); ctx.fill();
  ctx.strokeStyle='rgba(224,163,90,.5)'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#f3e9d2'; ctx.font='14px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText(B.msg, VW/2, by+22); ctx.textAlign='left';
  var py=by+42;
  // hero stat panel
  ctx.fillStyle='rgba(8,14,8,.8)'; roundRect(10,py,150,90,8); ctx.fill(); ctx.strokeStyle='rgba(150,210,120,.4)'; ctx.stroke();
  ctx.fillStyle='#eafbe0'; ctx.font='bold 13px Trebuchet MS'; ctx.fillText(player.job+' Lv.'+player.level,20,py+18);
  ctx.font='11px Trebuchet MS'; ctx.fillStyle='#cfe0b0';
  ctx.fillText('HP '+Math.round(player.hp)+'/'+player.hpMax,20,py+36); bar(20,py+40,120,6,player.hp,player.hpMax,'#d2443a');
  ctx.fillStyle='#cfe0b0'; ctx.fillText('MP '+player.mp+'/'+player.mpMax,20,py+58); bar(20,py+62,120,6,player.mp,player.mpMax,'#3f74d6');
  bar(20,py+78,120,5,player.xp,player.xpNext,'#b06bd6');
  // command window
  if(B.phase==='menu'){
    var list = B.menu==='root'?ROOT:(B.menu==='magic'?SPELLS:ITEMS);
    var cx=170, cw=VW-180, ch=90;
    ctx.fillStyle='rgba(8,14,8,.8)'; roundRect(cx,py,cw,ch,8); ctx.fill(); ctx.strokeStyle='rgba(224,163,90,.5)'; ctx.stroke();
    ctx.font='14px Trebuchet MS';
    for(var i=0;i<list.length;i++){ var it=list[i];
      var label = B.menu==='root'? it : (it.name + (B.menu==='magic'?('  '+it.mp+'MP'):('  x'+player[it.key])));
      var ly=py+20+i*20;
      if(i===B.cursor){ ctx.fillStyle='rgba(224,163,90,.25)'; roundRect(cx+6,ly-14,cw-12,19,4); ctx.fill(); ctx.fillStyle='#ffd98a'; ctx.fillText('\u25b8',cx+10,ly); }
      ctx.fillStyle=i===B.cursor?'#fff':'#cfe0b0'; ctx.fillText(label,cx+26,ly);
    }
    if(B.menu!=='root'){ var d=list[B.cursor]&&list[B.cursor].desc; if(d){ ctx.font='10px Trebuchet MS'; ctx.fillStyle='#9c957f'; wrapText(d,cx+10,py+ch-8,cw-16,12,'left'); } }
  }
}
/* ---------- Title / Game Over ---------- */
var state='boot', gameOverMsg='', titleT=0, emberT=0;
function newGame(){
  player.level=1;player.xp=0;player.xpNext=30;player.job='Vanguard';
  player.hp=120;player.hpMax=120;player.mp=28;player.mpMax=28;player.atk=14;player.def=6;
  player.gold=0;player.potions=3;player.ethers=2;player.invuln=1.2;
  player.wx=0;player.wy=0; genWorld(); state='overworld'; try{localStorage.removeItem(SAVE_KEY);}catch(e){}
}
function continueGame(){ loadSave(); genWorld(); state='overworld'; }
function gameOver(msg){ gameOverMsg=msg; state='gameover'; B=null; try{localStorage.removeItem(SAVE_KEY);}catch(e){} haptic('heavy'); }

function titleUpdate(dt){ titleT+=dt; emberT+=dt;
  if(emberT>0.05){ emberT=0; emit(rand(VW*0.2,VW*0.8), VH*0.5, 1, {col:choice(['#ffcf6b','#ff8a3c','#ffe3a0']),sp0:10,sp1:40,ang:-1.57,g:-40,l0:1.0,l1:1.8,r0:1.5,r1:3}); }
  updPP(dt);
  if(consume('a')) newGame();
  if(consume('b') && hasSave()) continueGame();
}
function titleDraw(){
  var gg=ctx.createLinearGradient(0,0,0,VH); gg.addColorStop(0,'#132a16'); gg.addColorStop(1,'#060a05');
  ctx.fillStyle=gg; ctx.fillRect(0,0,VW,VH); drawPP(0,0);
  ctx.textAlign='center';
  ctx.font='bold 64px Trebuchet MS'; var ty=VH*0.4;
  ctx.fillStyle='#0c1708'; ctx.fillText('TRIBES',VW/2+3,ty+3);
  var grd=ctx.createLinearGradient(0,ty-50,0,ty+10); grd.addColorStop(0,'#ffe3a0'); grd.addColorStop(1,'#d2672e');
  ctx.fillStyle=grd; ctx.fillText('TRIBES',VW/2,ty);
  ctx.font='14px Trebuchet MS'; ctx.fillStyle='#c9b071'; ctx.fillText('An Olden Fantasy Saga',VW/2,ty+30);
  var a=0.5+0.5*Math.sin(titleT*3);
  ctx.globalAlpha=a; ctx.font='bold 18px Trebuchet MS'; ctx.fillStyle='#f3e9d2';
  ctx.fillText('Press  A  —  New Saga', VW/2, VH*0.66); ctx.globalAlpha=1;
  if(hasSave()){ ctx.fillStyle='#9fd4ff'; ctx.font='15px Trebuchet MS'; ctx.fillText('Press  B  —  Continue', VW/2, VH*0.72); }
  ctx.textAlign='left';
}
function gameoverUpdate(dt){ updPP(dt); if(consume('a')) state='title'; }
function gameoverDraw(){
  ctx.fillStyle='#060a05'; ctx.fillRect(0,0,VW,VH); ctx.textAlign='center';
  ctx.font='bold 40px Trebuchet MS'; ctx.fillStyle='#d2443a'; ctx.fillText('You Have Fallen',VW/2,VH*0.4);
  ctx.font='15px Trebuchet MS'; ctx.fillStyle='#cfe0b0'; wrapText(gameOverMsg,VW/2,VH*0.47,VW*0.8,20,'center');
  ctx.fillStyle='#f3e9d2'; ctx.font='bold 16px Trebuchet MS'; ctx.fillText('Press  A  —  Return',VW/2,VH*0.6);
  ctx.textAlign='left';
}

/* ---------- Main loop ---------- */
var last=0;
function frame(ts){
  var dt=last?Math.min((ts-last)/1000,0.05):0.016; last=ts;
  var sh=shakeOff(dt);
  ctx.clearRect(0,0,VW,VH);
  if(state==='title'){ titleUpdate(dt); titleDraw(); }
  else if(state==='overworld'){ overworldUpdate(dt); overworldDraw(sh); }
  else if(state==='battle'){ battleUpdate(dt); if(B) battleDraw(sh); }
  else if(state==='gameover'){ gameoverUpdate(dt); gameoverDraw(); }
  pressed.a=false; pressed.b=false;
  requestAnimationFrame(frame);
}

/* ---------- Boot ---------- */
try {
  loadAll(function(){
    var el=document.getElementById('loading');
    if(failed.length && el){ el.textContent='Missing '+failed.length+' asset(s): '+(failed[0]||'').split('/').pop();
      setTimeout(function(){ el.classList.add('hide'); }, 2500);
    } else if(el){ el.classList.add('hide'); }
    state='title'; requestAnimationFrame(frame);
  });
} catch(err){ setLoadMsg('Boot error: '+((err&&err.message)||err)); }
/*__END__*/
})();
