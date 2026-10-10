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
var A={"hero":{"idle":{"down":{"file":"assets2/hero/idle_down.png","frames":4,"fw":64,"fh":64},"up":{"file":"assets2/hero/idle_up.png","frames":4,"fw":64,"fh":64},"side":{"file":"assets2/hero/idle_side.png","frames":4,"fw":64,"fh":64}},"walk":{"down":{"file":"assets2/hero/walk_down.png","frames":6,"fw":64,"fh":64},"up":{"file":"assets2/hero/walk_up.png","frames":6,"fw":64,"fh":64},"side":{"file":"assets2/hero/walk_side.png","frames":6,"fw":64,"fh":64}},"run":{"down":{"file":"assets2/hero/run_down.png","frames":6,"fw":64,"fh":64},"up":{"file":"assets2/hero/run_up.png","frames":6,"fw":64,"fh":64},"side":{"file":"assets2/hero/run_side.png","frames":6,"fw":64,"fh":64}},"slice":{"down":{"file":"assets2/hero/slice_down.png","frames":8,"fw":64,"fh":64},"up":{"file":"assets2/hero/slice_up.png","frames":8,"fw":64,"fh":64},"side":{"file":"assets2/hero/slice_side.png","frames":8,"fw":64,"fh":64}},"hit":{"down":{"file":"assets2/hero/hit_down.png","frames":4,"fw":64,"fh":64},"up":{"file":"assets2/hero/hit_up.png","frames":4,"fw":64,"fh":64},"side":{"file":"assets2/hero/hit_side.png","frames":4,"fw":64,"fh":64}},"death":{"down":{"file":"assets2/hero/death_down.png","frames":8,"fw":64,"fh":64},"up":{"file":"assets2/hero/death_up.png","frames":8,"fw":64,"fh":64},"side":{"file":"assets2/hero/death_side.png","frames":8,"fw":64,"fh":64}}},"npc":{"peasant":{"file":"assets2/npc/peasant.png","frames":4,"fw":64,"fh":64},"tavern":{"file":"assets2/npc/tavern.png","frames":4,"fw":64,"fh":64},"knight":{"file":"assets2/npc/knight.png","frames":4,"fw":32,"fh":32},"wizard":{"file":"assets2/npc/wizard.png","frames":4,"fw":32,"fh":32},"rogue":{"file":"assets2/npc/rogue.png","frames":4,"fw":32,"fh":32}},"mob":{"skel_base":{"idle":{"file":"assets2/mob/skel_base_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/skel_base_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/skel_base_death.png","frames":12,"fw":64,"fh":64}},"skel_warrior":{"idle":{"file":"assets2/mob/skel_warrior_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/skel_warrior_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/skel_warrior_death.png","frames":8,"fw":48,"fh":48}},"skel_mage":{"idle":{"file":"assets2/mob/skel_mage_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/skel_mage_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/skel_mage_death.png","frames":6,"fw":64,"fh":64}},"skel_rogue":{"idle":{"file":"assets2/mob/skel_rogue_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/skel_rogue_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/skel_rogue_death.png","frames":6,"fw":64,"fh":64}},"orc":{"idle":{"file":"assets2/mob/orc_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/orc_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/orc_death.png","frames":6,"fw":64,"fh":64}},"orc_warrior":{"idle":{"file":"assets2/mob/orc_warrior_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/orc_warrior_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/orc_warrior_death.png","frames":7,"fw":82,"fh":80}},"orc_shaman":{"idle":{"file":"assets2/mob/orc_shaman_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/orc_shaman_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/orc_shaman_death.png","frames":7,"fw":64,"fh":64}},"orc_rogue":{"idle":{"file":"assets2/mob/orc_rogue_idle.png","frames":4,"fw":32,"fh":32},"run":{"file":"assets2/mob/orc_rogue_run.png","frames":6,"fw":64,"fh":64},"death":{"file":"assets2/mob/orc_rogue_death.png","frames":6,"fw":64,"fh":64}},"demon":{"idle":{"file":"assets2/mob/demon_idle.png","frames":6,"fw":100,"fh":100},"run":{"file":"assets2/mob/demon_run.png","frames":8,"fw":100,"fh":100},"attack":{"file":"assets2/mob/demon_attack.png","frames":7,"fw":100,"fh":100},"death":{"file":"assets2/mob/demon_death.png","frames":4,"fw":100,"fh":100},"hurt":{"file":"assets2/mob/demon_hurt.png","frames":4,"fw":100,"fh":100}},"blood":{"idle":{"file":"assets2/mob/blood_idle.png","frames":6,"fw":100,"fh":100},"run":{"file":"assets2/mob/blood_run.png","frames":8,"fw":100,"fh":100},"attack":{"file":"assets2/mob/blood_attack.png","frames":8,"fw":100,"fh":100},"death":{"file":"assets2/mob/blood_death.png","frames":4,"fw":100,"fh":100},"hurt":{"file":"assets2/mob/blood_hurt.png","frames":4,"fw":100,"fh":100}}},"build":{"blue_castle":{"file":"assets2/build/blue_castle.png","w":320,"h":256},"blue_tower":{"file":"assets2/build/blue_tower.png","w":128,"h":256},"blue_house1":{"file":"assets2/build/blue_house1.png","w":128,"h":192},"blue_house2":{"file":"assets2/build/blue_house2.png","w":128,"h":192},"blue_house3":{"file":"assets2/build/blue_house3.png","w":128,"h":192},"blue_monastery":{"file":"assets2/build/blue_monastery.png","w":192,"h":320},"blue_barracks":{"file":"assets2/build/blue_barracks.png","w":192,"h":256},"blue_archery":{"file":"assets2/build/blue_archery.png","w":192,"h":256},"red_castle":{"file":"assets2/build/red_castle.png","w":320,"h":256},"red_tower":{"file":"assets2/build/red_tower.png","w":128,"h":256},"red_house1":{"file":"assets2/build/red_house1.png","w":128,"h":192},"red_house2":{"file":"assets2/build/red_house2.png","w":128,"h":192},"red_house3":{"file":"assets2/build/red_house3.png","w":128,"h":192},"red_monastery":{"file":"assets2/build/red_monastery.png","w":192,"h":320},"red_barracks":{"file":"assets2/build/red_barracks.png","w":192,"h":256},"red_archery":{"file":"assets2/build/red_archery.png","w":192,"h":256}},"terr":{"grass":{"file":"assets2/terr/grass_set.png","fw":64,"fh":64,"cols":4,"rows":4},"water":{"file":"assets2/terr/water.png","w":64,"h":64},"foam":{"file":"assets2/terr/foam.png","frames":16,"fw":192,"fh":192},"water_rock":{"file":"assets2/terr/water_rock.png","frames":16,"fw":64,"fh":64},"tree":{"file":"assets2/terr/tree.png","frames":8,"fw":192,"fh":256},"rock":{"file":"assets2/terr/rock.png","w":64,"h":64},"bush":{"file":"assets2/terr/bush.png","frames":8,"fw":128,"fh":128},"cobble":{"file":"assets2/terr/cobble.png","w":64,"h":64},"cobble2":{"file":"assets2/terr/cobble2.png","w":64,"h":64},"dirt":{"file":"assets2/terr/dirt.png","w":64,"h":64},"sand":{"file":"assets2/terr/sand.png","w":64,"h":64},"scorch":{"file":"assets2/terr/scorch.png","w":64,"h":64},"flower1":{"file":"assets2/terr/flower1.png","w":43,"h":54},"flower2":{"file":"assets2/terr/flower2.png","w":23,"h":21},"tuft1":{"file":"assets2/terr/tuft1.png","w":17,"h":40},"tuft2":{"file":"assets2/terr/tuft2.png","w":21,"h":40},"pebble":{"file":"assets2/terr/pebble.png","w":10,"h":9}},"spell":{"fire":{"file":"assets2/spell/fire.png","frames":13,"fw":128,"fh":128},"heal":{"file":"assets2/spell/heal.png","frames":16,"fw":128,"fh":128},"poison":{"file":"assets2/spell/poison.png","frames":17,"fw":128,"fh":128},"lightning":{"file":"assets2/spell/lightning.png","frames":7,"fw":128,"fh":128},"slash":{"file":"assets2/spell/slash.png","frames":7,"fw":96,"fh":96},"smite":{"file":"assets2/spell/smite.png","frames":16,"fw":144,"fh":144},"curse":{"file":"assets2/spell/curse.png","frames":22,"fw":64,"fh":64},"ward":{"file":"assets2/spell/ward.png","frames":18,"fw":128,"fh":128},"fury":{"file":"assets2/spell/fury.png","frames":18,"fw":128,"fh":128},"haste":{"file":"assets2/spell/haste.png","frames":22,"fw":128,"fh":128}},"status":{"bleed":{"file":"assets2/status/bleed.png","frames":16,"fw":64,"fh":64},"burn":{"file":"assets2/status/burn.png","frames":16,"fw":64,"fh":64},"poison":{"file":"assets2/status/poison.png","frames":16,"fw":64,"fh":64},"shock":{"file":"assets2/status/shock.png","frames":16,"fw":64,"fh":64},"heal":{"file":"assets2/status/heal.png","frames":16,"fw":64,"fh":64},"shield":{"file":"assets2/status/shield.png","frames":16,"fw":64,"fh":64},"stun":{"file":"assets2/status/stun.png","frames":16,"fw":64,"fh":64},"rage":{"file":"assets2/status/rage.png","frames":16,"fw":64,"fh":64},"regen":{"file":"assets2/status/regen.png","frames":16,"fw":64,"fh":64}},"prop":{"tent":{"file":"assets2/prop/tent.png","w":73,"h":65},"tent2":{"file":"assets2/prop/tent2.png","w":65,"h":62},"crate":{"file":"assets2/prop/crate.png","w":20,"h":22},"barrel":{"file":"assets2/prop/barrel.png","w":18,"h":25},"house_s":{"file":"assets2/prop/house_s.png","w":116,"h":112},"house_m":{"file":"assets2/prop/house_m.png","w":156,"h":135},"bigdecor":{"file":"assets2/prop/bigdecor.png","w":48,"h":26},"fence":{"file":"assets2/prop/fence.png","w":63,"h":64}},"critter":{"cat":{"file":"assets2/critter/cat.png","frames":6,"fw":96,"fh":96}},"ui":{"frame":{"file":"assets2/ui/frame.png","w":48,"h":48,"corner":16}}};
/*__MANIFEST_END__*/
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
  walk(A.build,'build'); walk(A.terr,'terr'); walk(A.spell,'spell'); walk(A.status,'status');
  walk(A.prop,'prop'); walk(A.critter,'critter'); walk(A.ui,'ui');
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
/* ---------- Status FX (animated status-icon overlays) ---------- */
var statFX=[];   // transient bursts {key,x,y,t,life}
function addStatusFX(key,x,y,life){ if(!A.status[key])return; statFX.push({key:key,x:x,y:y,t:0,life:life||1.3}); }
function updStatusFX(dt){ for(var i=statFX.length-1;i>=0;i--){ var f=statFX[i]; f.t+=dt; if(f.t>=f.life) statFX.splice(i,1); } }
function drawStatusIcon(key,x,y,size){ var m=A.status[key], img=images['status_'+key]; if(!imgReady(img))return;
  var fi=Math.floor(bclock*12)%m.frames; size=size||28;
  ctx.drawImage(img, fi*m.fw,0, m.fw,m.fh, x-size/2, y-size, size, size); }
function drawStatusFX(ox,oy){ for(var i=0;i<statFX.length;i++){ var f=statFX[i];
  var a=clamp((f.life-f.t)*2,0,1); ctx.globalAlpha=a; drawStatusIcon(f.key, f.x-ox, f.y-oy-10, 36); ctx.globalAlpha=1; } }
// draw the row of active persistent status badges above a combatant
function drawStatusRow(keys,cx,topY){ var n=keys.length; if(!n)return; var gap=28, x0=cx-(n-1)*gap/2;
  for(var i=0;i<n;i++) drawStatusIcon(keys[i], x0+i*gap, topY, 26); }
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
  orc_warrior:  {name:'Orc Warchief',   hp:110,atk:22, def:9, xp:70, gold:60, draw:2.8, spell:'fire',    tier:4},
  demon:        {name:'Infernal Reaver', hp:155,atk:26, def:10,xp:130, gold:120,draw:1.0, spell:'fire',    tier:5, boss:true},
  blood:        {name:'Gorehulk',       hp:195,atk:31, def:13,xp:170, gold:170,draw:1.0, spell:null,     tier:5, boss:true}
};

/* ---------- Hero spells (FF-style Magic menu) ---------- */
var SPELLS=[
  {name:'Firaga',  mp:6,  fx:'fire',     col:'#ff8a3c', pow:1.6, kind:'atk', desc:'Hurl a burst of flame.'},
  {name:'Thundara',mp:8,  fx:'lightning',col:'#c9a6ff', pow:1.9, kind:'atk', desc:'Call down lightning.'},
  {name:'Smite',   mp:7,  fx:'smite',    col:'#ffe9a0', pow:1.7, kind:'atk', desc:'Searing light \u2014 scourge of the undead.'},
  {name:'Curse',   mp:6,  fx:'curse',    col:'#c86bd6', pow:1.2, kind:'curse', desc:'A withering hex that bleeds the foe.'},
  {name:'Venom',   mp:5,  fx:'poison',   col:'#8fe36b', pow:1.1, kind:'poison', desc:'Poison the foe over time.'},
  {name:'Ward',    mp:5,  fx:'ward',     col:'#9fd4ff', pow:0,   kind:'ward', desc:'Raise a shield that blunts the next blow.'},
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
var props=[];       // {kind,wx,wy,scale}  village props (tents/houses/crates/fences)
var critters=[];    // {wx,wy,t,frame,vx,vy,dir,hx,hy}  ambient animals
var biomeGrid=null; // Uint8Array MW*MH : 0 meadow 1 forest 2 farm 3 sand 4 scorch 5 cobble
var roadSet=null;   // Uint8Array MW*MH : 1 = dirt road tile

function addBuild(key,tx,ty,name,town){
  var m=A.build[key]; var wx=tx*TILE+TILE/2, wy=ty*TILE+TILE;
  buildings.push({key:key,wx:wx,wy:wy,scale:BSCALE,name:name,town:town,enter:buildEnterType(key,name)});
  var bw=m.w*BSCALE*0.55;
  solids.push({x:wx-bw/2, y:wy-18, w:bw, h:20});
}
function buildEnterType(key,name){
  var n=(name||'').toLowerCase();
  if(n.indexOf('tavern')>=0) return 'tavern';
  if(n.indexOf('castle')>=0||n.indexOf('keep')>=0) return 'castle';
  if(n.indexOf('barrack')>=0||n.indexOf('war pit')>=0||n.indexOf('archery')>=0) return 'barracks';
  if(n.indexOf('monastery')>=0||n.indexOf('temple')>=0) return 'temple';
  if(n.indexOf('tower')>=0) return 'tower';
  return 'home';
}
function addNPC(sprite,tx,ty,name,lines){
  var m=A.npc[sprite];
  npcs.push({name:name,sprite:sprite,wx:tx*TILE+TILE/2,wy:ty*TILE+TILE,
    lines:lines,t:rand(0,2),frame:0,fw:m.fw,fh:m.fh,frames:m.frames,scale:m.fh>=64?0.9:1.7});
}
function addDeco(kind,tx,ty,solid){
  var m=A.terr[kind];
  var sc = kind==='tree'?0.52:(kind==='bush'?0.5:(kind==='water_rock'?0.7:0.9));
  var wx=tx*TILE+TILE/2, wy=ty*TILE+TILE;
  deco.push({kind:kind,wx:wx,wy:wy,scale:sc,solid:!!solid,frames:(m.frames||1),frame:0,ft:rand(0,1)});
  if(solid) solids.push({x:wx-14,y:wy-14,w:28,h:16});
}
function addRoamer(kind,tx,ty){
  roamers.push({kind:kind,wx:tx*TILE+TILE/2,wy:ty*TILE+TILE/2,name:MOB[kind].name,
    t:rand(0,4),frame:0,vx:0,vy:0,dir:1,cool:0});
}
function addProp(kind,tx,ty,solid,sc){
  var m=A.prop[kind]; if(!m)return; sc=sc||0.6;
  var wx=tx*TILE+TILE/2, wy=ty*TILE+TILE;
  props.push({kind:kind,wx:wx,wy:wy,scale:sc});
  if(solid){ var bw=m.w*sc*0.7; solids.push({x:wx-bw/2,y:wy-14,w:bw,h:16}); }
}
function addCritter(tx,ty){
  critters.push({wx:tx*TILE+TILE/2,wy:ty*TILE+TILE/2,t:rand(0,3),frame:0,
    vx:0,vy:0,dir:1,hx:tx*TILE+TILE/2,hy:ty*TILE+TILE/2,wt:rand(0,2)});
}
// deterministic 2D hash -> uint32
function hash2(x,y){ var h=((x|0)*73856093)^((y|0)*19349663); h^=h>>>13; return h>>>0; }
function nearestTownDist(tx,ty){ var best=1e9; for(var i=0;i<towns.length;i++){
  var d=Math.hypot(tx-towns[i].wx/TILE, ty-towns[i].wy/TILE); if(d<best)best=d; } return best; }
function waterWithin(tx,ty,rad){ for(var dy=-rad;dy<=rad;dy++)for(var dx=-rad;dx<=rad;dx++){
  if(isWaterTile(tx+dx,ty+dy)) return true; } return false; }
function buildBiomes(){
  biomeGrid=new Uint8Array(MW*MH); roadSet=new Uint8Array(MW*MH);
  var grim=[34,8];                 // Grimspire -> scorched earth
  var farmC=[[8,34],[9,33]];        // Mirefen hamlet -> tilled farmland
  var forestC=[[20,6],[26,14],[6,20],[14,30],[24,36],[38,20],[16,16]];
  for(var ty=0;ty<MH;ty++)for(var tx=0;tx<MW;tx++){
    var idx=ty*MW+tx; if(isWaterTile(tx,ty)){ biomeGrid[idx]=0; continue; }
    var hs=hash2(tx,ty), b=0;
    // meadow with hashed forest/meadow blending for organic patches
    var dG=Math.hypot(tx-grim[0],ty-grim[1]);
    var dT=nearestTownDist(tx,ty);
    var inForest=false; for(var f=0;f<forestC.length;f++){ if(Math.hypot(tx-forestC[f][0],ty-forestC[f][1])< (3.2+ (hs%100)/60)) { inForest=true; break; } }
    var inFarm=false; for(var fa=0;fa<farmC.length;fa++){ if(Math.hypot(tx-farmC[fa][0],ty-farmC[fa][1])<4.5){ inFarm=true; break; } }
    if(dT<2.1) b=5;                       // town plaza cobble
    else if(dG<6.5+ (hs%100)/50) b=4;     // scorched ring around Grimspire
    else if(waterWithin(tx,ty,2)) b=3;    // sandy shore
    else if(inFarm) b=2;                  // farmland
    else if(inForest) b=1;                // deep forest grass
    else b=0;                             // meadow
    biomeGrid[idx]=b;
  }
  // carve dirt roads between hubs (simple sampled segments, width 1)
  function road(ax,ay,bx,by){ var steps=Math.ceil(Math.hypot(bx-ax,by-ay)*1.3);
    for(var i=0;i<=steps;i++){ var t=i/steps, x=Math.round(ax+(bx-ax)*t), y=Math.round(ay+(by-ay)*t);
      for(var oy=0;oy<=1;oy++){ var xx=x, yy=y+oy; if(xx>0&&yy>0&&xx<MW-1&&yy<MH-1&&!isWaterTile(xx,yy)) roadSet[yy*MW+xx]=1; } } }
  road(10,8, 34,8);     // Emberhold -> Grimspire
  road(10,8, 33,32);    // Emberhold -> Ravenmoor
  road(10,8, 8,34);     // Emberhold -> Mirefen
  road(33,32, 16,27);   // Ravenmoor -> Dunewatch
}

function genWorld(){
  buildings=[]; npcs=[]; deco=[]; roamers=[]; towns=[]; solids=[]; props=[]; critters=[];
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
  // ---- Mirefen Hamlet (farming village, SW) ----
  towns.push({name:'Mirefen Hamlet',wx:8*TILE,wy:34*TILE});
  addProp('house_m',8,33,true,0.6); addProp('house_s',11,35,true,0.6);
  addProp('tent',6,36,true,0.7); addProp('tent2',10,37,true,0.7);
  addProp('fence',6,34,false,0.6); addProp('fence',7,34,false,0.6); addProp('fence',8,35,false,0.6);
  addProp('crate',9,36,false,0.8); addProp('barrel',10,35,false,0.8); addProp('bigdecor',7,37,false,0.7);
  addNPC('tavern',7,34,'Innkeep Odo',['Rest your boots, traveller \u2014 the hearth is warm.','Step close and press A and I\u2019ll mend you, free of charge.','The orcs burned our east field. Avenge it, aye?']);
  addNPC('peasant',9,35,'Goodwife Mara',['We farm what the raiders leave us.','Mind the roads at dusk \u2014 skeletons walk them.']);
  addCritter(9,36); addCritter(7,35);
  // ---- Dunewatch (coastal outpost by the lake, S) ----
  towns.push({name:'Dunewatch',wx:16*TILE,wy:27*TILE});
  addProp('tent',15,27,true,0.7); addProp('house_s',18,28,true,0.55);
  addProp('barrel',17,27,false,0.8); addProp('crate',14,28,false,0.8);
  addNPC('rogue',16,28,'Fisher Cael',['The lake gives, when the drowned things sleep.','Shore stones hide coin \u2014 and worse.']);
  addCritter(17,28);
  /*__DECO__*/
  buildBiomes();   // compute biome map + dirt roads first so scatter avoids them
  // scatter trees (forests), rocks, bushes avoiding towns/lake
  function far(tx,ty){
    if(tx<2||ty<2||tx>MW-2||ty>MH-2) return false;
    if(tx>=lake.x0-1&&tx<=lake.x1+1&&ty>=lake.y0-1&&ty<=lake.y1+1) return false;
    if(roadSet && roadSet[ty*MW+tx]) return false;
    for(var ci=0;ci<towns.length;ci++){ if(dist(tx*TILE,ty*TILE,towns[ci].wx,towns[ci].wy)<TILE*4.5) return false; }
    for(var i=0;i<buildings.length;i++){ if(dist(tx*TILE,ty*TILE,buildings[i].wx,buildings[i].wy)<TILE*3) return false; }
    for(var pi=0;pi<props.length;pi++){ if(dist(tx*TILE,ty*TILE,props[pi].wx,props[pi].wy)<TILE*2) return false; }
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
  addRoamer('demon',31,11);         // demon lords prowl Grimspire
  addRoamer('blood',38,12);
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
var moveTarget=null;   // tap-to-move destination (world px)
var gNearNPC=null, gNearBuild=null;
var dlg={active:false,name:'',lines:[],idx:0};
var nearInfo='';      // town/building name shown as a banner
var waterT=0;

function startDialogue(npc){
  dlg.active=true; dlg.name=npc.name; dlg.lines=npc.lines; dlg.idx=0; moveTarget=null; haptic('light');
  if(npc.sprite==='tavern'){ player.hp=player.hpMax; player.mp=player.mpMax;
    floatText(player.wx,player.wy-TILE,'Fully healed!','#8fe36b'); }
}
function overworldUpdate(dt){
  waterT+=dt;
  for(var di=0;di<deco.length;di++){ var _o=deco[di]; if(_o.frames>1){ _o.ft+=dt; if(_o.ft>=0.14){ _o.ft=0; _o.frame=(_o.frame+1)%_o.frames; } } }
  for(var ci=0;ci<critters.length;ci++){ var ct=critters[ci]; ct.t+=dt; ct.wt-=dt;
    if(ct.wt<=0){ ct.wt=rand(1.2,3.2); if(Math.random()<0.5){ ct.vx=rand(-26,26); ct.vy=rand(-20,20); } else { ct.vx=0; ct.vy=0; } }
    // leash the cat to its home tile
    if(dist(ct.wx,ct.wy,ct.hx,ct.hy)>TILE*2.4){ ct.vx=(ct.hx-ct.wx)*0.6; ct.vy=(ct.hy-ct.wy)*0.6; }
    var cnx=ct.wx+ct.vx*dt, cny=ct.wy+ct.vy*dt;
    if(!blocked(cnx,ct.wy)) ct.wx=cnx; else ct.vx*=-1;
    if(!blocked(ct.wx,cny)) ct.wy=cny; else ct.vy*=-1;
    if(ct.vx) ct.dir=ct.vx>0?1:-1;
    var moving=(ct.vx||ct.vy); if(ct.t>=(moving?0.12:0.26)){ ct.t=0; ct.frame=(ct.frame+1)%6; } }
  if(dlg.active){
    if(consume('a')){ dlg.idx++; haptic('sel'); if(dlg.idx>=dlg.lines.length) dlg.active=false; }
    if(consume('b')) dlg.active=false;
    return;
  }
  var ix=(keys.right?1:0)-(keys.left?1:0), iy=(keys.down?1:0)-(keys.up?1:0);
  var usingTap=false;
  if(!ix && !iy && moveTarget){ var ddx=moveTarget.x-player.wx, ddy=moveTarget.y-player.wy, dm=Math.hypot(ddx,ddy);
    if(dm<6){ moveTarget=null; } else { ix=ddx/dm; iy=ddy/dm; usingTap=true; } }
  var running=keys.b && (ix||iy);
  var sp=running?170:118;
  if(ix||iy){
    // facing / direction for sprite sheet
    if(Math.abs(ix)>Math.abs(iy)){ player.dir='side'; player.facing=ix>0?1:-1; }
    else { player.dir = iy>0?'down':'up'; }
    var len=Math.hypot(ix,iy)||1, nx=player.wx+ix/len*sp*dt, ny=player.wy+iy/len*sp*dt;
    var mvd=false;
    if(!blocked(nx,player.wy)){ player.wx=nx; mvd=true; }
    if(!blocked(player.wx,ny)){ player.wy=ny; mvd=true; }
    if(usingTap && !mvd) moveTarget=null;   // stuck against a wall — give up
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
  // nearest enterable building
  var nearBuild=null, bd=1e9;
  for(var bi=0;bi<buildings.length;bi++){ var bb=buildings[bi]; var dbld=dist(player.wx,player.wy,bb.wx,bb.wy+8);
    if(dbld<TILE*1.7 && dbld<bd){ bd=dbld; nearBuild=bb; } }
  gNearNPC=nearNPC; gNearBuild=nearBuild;
  if(nearNPC) nearInfo=nearNPC.name+'  ▸ press A';
  else if(nearBuild) nearInfo='Enter '+nearBuild.name+'  ▸ press A';
  // interact
  if(consume('a')){ if(nearNPC) startDialogue(nearNPC); else if(nearBuild) enterInterior(nearBuild); }
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
function isWaterTile(tx,ty){
  if(tx<1||ty<1||tx>=MW-1||ty>=MH-1) return true;              // sea border
  if(tx>=lake.x0&&tx<=lake.x1&&ty>=lake.y0&&ty<=lake.y1) return true; // inland lake
  return false;
}
function isGrassTile(tx,ty){ return !isWaterTile(tx,ty); }
// 9-slice autotile pick from the 4x4 Tiny Swords grass block (cols/rows 0..3)
function grassSrc(tx,ty){
  var n=isGrassTile(tx,ty-1), s=isGrassTile(tx,ty+1), e=isGrassTile(tx+1,ty), w=isGrassTile(tx-1,ty);
  var col = (w&&e)?1 : (!w?0:3);
  var row = (n&&s)?1 : (!n?0:3);
  if(col===1&&row===1){ var h=((tx*73856093)^(ty*19349663))>>>0; col=1+(h%2); } // texture variety on fill
  return {sx:col*64, sy:row*64};
}
function biomeTileImg(b){
  if(b===2) return images['terr_dirt'];
  if(b===3) return images['terr_sand'];
  if(b===4) return images['terr_scorch'];
  if(b===5) return images['terr_cobble'];
  return null;
}
var BIOME_FB=['#4a7a3a','#3c5e30','#7a5a34','#cebd8a','#4a543a','#8a7d66'];
// small ground flora scattered deterministically to break up the terrain
function scatterAt(tx,ty,dx,dy){
  var hd=hash2(tx*3+11,ty*7+5), r=hd%100;
  if(r>=20) return;                               // ~20% of grassy tiles get flora
  var pick=(hd>>>8)%6, k, sc;
  if(pick===0){ k='flower1'; sc=0.42; } else if(pick===1){ k='flower2'; sc=0.7; }
  else if(pick===2){ k='tuft1'; sc=0.5; } else if(pick===3){ k='tuft2'; sc=0.5; }
  else { k='pebble'; sc=1.3; }
  var m=A.terr[k], img=images['terr_'+k]; if(!imgReady(img)) return;
  var ox=(hd%(TILE-10))+5, oy=((hd>>>5)%(TILE-10))+5;
  var w=m.w*sc, h=m.h*sc;
  ctx.drawImage(img, dx+ox-w/2, dy+oy-h, w, h);
}
function drawGround(){
  var g=images['terr_grass'], w=images['terr_water'], foam=images['terr_foam'];
  var tx0=Math.floor(cam.x/TILE)-1, ty0=Math.floor(cam.y/TILE)-1;
  var tx1=Math.ceil((cam.x+VW)/TILE)+1, ty1=Math.ceil((cam.y+VH)/TILE)+1;
  // pass 1 — base ground: water, biome tiles, or autotiled grass (+ dirt roads)
  for(var ty=ty0;ty<=ty1;ty++) for(var tx=tx0;tx<=tx1;tx++){
    var dx=tx*TILE-cam.x, dy=ty*TILE-cam.y;
    if(isWaterTile(tx,ty)){
      if(imgReady(w)) ctx.drawImage(w,0,0,64,64,dx,dy,TILE+1,TILE+1);
      else { ctx.fillStyle='#2b6db0'; ctx.fillRect(dx,dy,TILE+1,TILE+1); }
      ctx.globalAlpha=0.10+0.06*Math.sin(waterT*2+tx*0.7+ty*0.9);
      ctx.fillStyle='#bfe6ff'; ctx.fillRect(dx,dy,TILE+1,TILE+1); ctx.globalAlpha=1;
      continue;
    }
    var inb = (tx>=0&&ty>=0&&tx<MW&&ty<MH), idx=ty*MW+tx;
    var b = inb && biomeGrid ? biomeGrid[idx] : 0;
    var isRoad = inb && roadSet && roadSet[idx];
    if(isRoad){
      var di=images['terr_dirt'];
      if(imgReady(di)) ctx.drawImage(di,0,0,64,64,dx,dy,TILE+1,TILE+1);
      else { ctx.fillStyle='#7a5a34'; ctx.fillRect(dx,dy,TILE+1,TILE+1); }
    } else if(b===0||b===1){                     // grassy biomes use the autotile
      if(imgReady(g)){ var sp=grassSrc(tx,ty); ctx.drawImage(g,sp.sx,sp.sy,64,64,dx,dy,TILE+1,TILE+1); }
      else { ctx.fillStyle=BIOME_FB[b]; ctx.fillRect(dx,dy,TILE+1,TILE+1); }
      if(b===1){ ctx.globalAlpha=0.26; ctx.fillStyle='#14300f'; ctx.fillRect(dx,dy,TILE+1,TILE+1); ctx.globalAlpha=1; }
    } else {                                     // dirt / sand / scorch / cobble tiles
      var bi=biomeTileImg(b);
      if(imgReady(bi)) ctx.drawImage(bi,0,0,64,64,dx,dy,TILE+1,TILE+1);
      else { ctx.fillStyle=BIOME_FB[b]; ctx.fillRect(dx,dy,TILE+1,TILE+1); }
    }
    // subtle deterministic brightness jitter — kills the flat, repetitive look
    var hv=hash2(tx,ty)%100;
    ctx.globalAlpha=0.05+ (hv%4)*0.012;
    ctx.fillStyle = hv<50 ? '#000' : '#fff';
    ctx.fillRect(dx,dy,TILE+1,TILE+1); ctx.globalAlpha=1;
    // ground flora on grass / farm (not roads)
    if(!isRoad && (b===0||b===1||b===2)) scatterAt(tx,ty,dx,dy);
  }
  // pass 2 — animated surf foam on the shoreline (water tiles touching grass)
  if(imgReady(foam)){
    var ff=Math.floor(waterT*12)%16;
    for(var qy=ty0;qy<=ty1;qy++) for(var qx=tx0;qx<=tx1;qx++){
      if(!isWaterTile(qx,qy))continue;
      if(isGrassTile(qx-1,qy)||isGrassTile(qx+1,qy)||isGrassTile(qx,qy-1)||isGrassTile(qx,qy+1)){
        var cx2=qx*TILE-cam.x+TILE/2, cy2=qy*TILE-cam.y+TILE/2, fs=TILE*1.4;
        ctx.globalAlpha=0.72; ctx.drawImage(foam, ff*192,0,192,192, cx2-fs/2, cy2-fs/2, fs, fs); ctx.globalAlpha=1;
      }
    }
  }
}
function overworldDraw(sh){
  ctx.save(); ctx.translate(sh.x,sh.y);
  drawGround();
  // build y-sorted drawable list
  var list=[];
  for(var i=0;i<deco.length;i++){ (function(o){ list.push({y:o.wy,fn:function(){ var m=A.terr[o.kind];
    if(o.frames>1) drawFrame(images['terr_'+o.kind], m.fw,m.fh, o.frame|0, o.wx-cam.x, o.wy-cam.y, o.scale, false);
    else drawStatic(images['terr_'+o.kind], m.w,m.h, o.wx-cam.x, o.wy-cam.y, o.scale); }}); })(deco[i]); }
  for(i=0;i<props.length;i++){ (function(o){ list.push({y:o.wy,fn:function(){ var m=A.prop[o.kind];
    drawShadow(o.wx-cam.x, o.wy-cam.y, m.w*o.scale*0.3);
    drawStatic(images['prop_'+o.kind], m.w,m.h, o.wx-cam.x, o.wy-cam.y, o.scale); }}); })(props[i]); }
  for(i=0;i<critters.length;i++){ (function(o){ list.push({y:o.wy,fn:function(){ var m=A.critter.cat;
    drawShadow(o.wx-cam.x, o.wy-cam.y, 10);
    drawFrame(images['critter_cat'], m.fw,m.fh, o.frame|0, o.wx-cam.x, o.wy-cam.y, 0.5, o.dir<0); }}); })(critters[i]); }
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
    panel(VW/2-tw/2-16, 8, tw+32, 32);
    ctx.fillStyle='#eafbe0'; ctx.textAlign='center'; ctx.fillText(nearInfo, VW/2, 29); ctx.textAlign='left'; }
  if(dlg.active) drawDialogue();
}
function drawDialogue(){
  var h=118, y=VH-h-150;
  panel(12,y,VW-24,h);
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
// ornate framed panel: leather fill + gold double border + pack-art corner flourishes
function panel(x,y,w,h,accent){
  var gg=ctx.createLinearGradient(0,y,0,y+h);
  gg.addColorStop(0,'rgba(30,23,14,.94)'); gg.addColorStop(1,'rgba(13,10,6,.96)');
  ctx.fillStyle=gg; roundRect(x,y,w,h,9); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.55)'; ctx.lineWidth=3; ctx.stroke();
  ctx.strokeStyle=accent||'#c9a24a'; ctx.lineWidth=2; roundRect(x+2.5,y+2.5,w-5,h-5,7); ctx.stroke();
  ctx.strokeStyle='rgba(255,232,170,.32)'; ctx.lineWidth=1; roundRect(x+5,y+5,w-10,h-10,5); ctx.stroke();
  var fr=images['ui_frame'];
  if(imgReady(fr)){ var c=16,d=19;
    ctx.drawImage(fr,0,0,c,c, x-3,y-3,d,d);
    ctx.drawImage(fr,48-c,0,c,c, x+w-d+3,y-3,d,d);
    ctx.drawImage(fr,0,48-c,c,c, x-3,y+h-d+3,d,d);
    ctx.drawImage(fr,48-c,48-c,c,c, x+w-d+3,y+h-d+3,d,d);
  }
}
function drawHUD(){
  panel(8,VH-150-46,186,42);
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
      burnE:0, bleedE:0, stun:0, guard:false, enraged:false, atkBase:Math.round(m.atk*sc),
      boss:!!m.boss, eneAnim:null, eneFrame:0, eneT:0,
      roamer:roamer, dead:false, deathT:0 };
  state='battle'; clearEv(); bclock=0; fxActive.length=0; statFX.length=0; moveTarget=null;
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
    var crit=Math.random()<0.22;
    var d=dmg(player.atk, B.def, 0.18); if(crit) d=Math.round(d*1.8);
    B.hp=clamp(B.hp-d,0,B.hpMax); B.flashE=0.3; doShake(crit?15:9,crit?0.34:0.26); haptic('heavy');
    if(crit){ B.msg='CRITICAL HIT!'; floatText(eneX(),gy()-112,'CRITICAL!','#ffd24a');
      B.bleedE=3; playFX('slash', eneX(), gy()-60, 1.3); emit(eneX(),gy()-70,22,{col:'#ff5a5a',sp0:60,sp1:200}); }
    floatText(eneX(),gy()-90,'-'+d,crit?'#ffd24a':'#fff'); emit(eneX(),gy()-70,14,{col:'#ffd27a',sp0:40,sp1:150});
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
  } else if(s.kind==='ward'){
    after(0.3,function(){ playFX('ward', heroX(), gy()-70, 1.0); B.guard=true;
      addStatusFX('shield', heroX(), gy()-70, 1.6);
      floatText(heroX(),gy()-100,'WARDED','#9fd4ff'); haptic('medium'); });
    after(1.1, backToMenu);
  } else {
    after(0.35,function(){ playFX(s.fx, eneX(), gy()-70, 1.15); doShake(10,0.3); B.flashE=0.35; haptic('heavy');
      var d=dmg(player.atk*s.pow, B.def*0.4, 0.14); B.hp=clamp(B.hp-d,0,B.hpMax);
      floatText(eneX(),gy()-95,'-'+d,s.col); emit(eneX(),gy()-70,18,{col:s.col,sp0:50,sp1:170});
      if(s.kind==='poison'){ B.poisonE=3; floatText(eneX(),gy()-120,'POISONED','#8fe36b'); }
      if(s.kind==='curse'){ B.bleedE=3; floatText(eneX(),gy()-120,'CURSED','#c86bd6'); }
      if(s.fx==='fire'){ B.burnE=3; floatText(eneX(),gy()-120,'BURNING','#ff8a3c'); }
      if(s.fx==='lightning' && Math.random()<0.4){ B.stun=1; floatText(eneX(),gy()-120,'STUNNED','#c9a6ff'); } });
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
function heroDefend(){ B.phase='anim'; clearEv(); B.menu='root'; heroPose('idle');
  B.guard=true; player.mp=clamp(player.mp+6,0,player.mpMax);
  playFX('heal', heroX(), gy()-70, 0.7); addStatusFX('shield', heroX(), gy()-70);
  floatText(heroX(),gy()-100,'DEFEND','#9fd4ff'); haptic('light');
  B.msg=player.job+' braces for impact!';
  after(1.0, enemyTurn);
}
/* ---------- Enemy turn + resolutions ---------- */
function enemyTurn(){ if(B.over)return; clearEv(); B.phase='enemy';
  // resolve damage-over-time on the enemy (bleed + burn + poison stack)
  var tot=0, cols=[];
  if(B.bleedE>0){ B.bleedE--; tot+=Math.round(B.hpMax*0.05)+4; cols.push('bleed'); }
  if(B.burnE>0){ B.burnE--;  tot+=Math.round(B.hpMax*0.055)+3; cols.push('burn'); }
  if(B.poisonE>0){ B.poisonE--; tot+=Math.round(B.hpMax*0.06)+3; cols.push('poison'); }
  if(tot>0){ B.hp=clamp(B.hp-tot,0,B.hpMax);
    for(var i=0;i<cols.length;i++) addStatusFX(cols[i], eneX(), gy()-70);
    floatText(eneX(),gy()-95,'-'+tot,'#9fe36b');
    after(0.6,function(){ if(B.hp<=0){ enemyDies(); return; } enemyAfterDot(); }); return; }
  enemyAfterDot();
}
function enemyAfterDot(){
  // enrage once, when driven below 35% HP
  if(!B.enraged && B.hp>0 && B.hp < B.hpMax*0.35){ B.enraged=true; B.atk=Math.round(B.atkBase*1.35);
    B.flashE=0.5; addStatusFX('rage', eneX(), gy()-70, 1.6); doShake(8,0.3);
    B.msg=B.name+' flies into a RAGE!'; haptic('heavy');
    after(1.0, enemyMaybeAct); return; }
  enemyMaybeAct();
}
function enemyMaybeAct(){
  if(B.stun>0){ B.stun--; addStatusFX('stun', eneX(), gy()-70); B.msg=B.name+' is stunned and cannot move!';
    after(0.9, afterEnemy); return; }
  enemyAct();
}
function enemyAct(){
  var casts = B.spell && Math.random()<0.5;
  B.msg=B.name+(casts?' chants a dark spell!':' attacks!');
  var g2 = B.guard?0.5:1;   // Defend halves this hit
  if(casts){
    after(0.3,function(){ playFX(B.spell, heroX(), gy()-70, 1.0); doShake(10,0.3); B.flashH=0.35; heroPose('hit'); haptic('heavy');
      var d=Math.round(dmg(B.atk*1.3, player.def, 0.2)*g2); if(player.invuln>0)d=0; player.hp=clamp(player.hp-d,0,player.hpMax);
      floatText(heroX(),gy()-100,(g2<1?'blocked -':'-')+d,'#ff8a3c'); emit(heroX(),gy()-70,14,{col:'#ff8a3c',sp0:40,sp1:150}); });
    after(1.0, afterEnemy);
  } else {
    if(B.boss && A.mob[B.kind].attack){ B.eneAnim='attack'; B.eneFrame=0; B.eneT=0; }
    after(0.18,function(){ B.eneDX=-54; });
    after(0.45,function(){ heroPose('hit'); B.flashH=0.3; doShake(B.boss?12:8,0.26); haptic('heavy');
      var d=Math.round(dmg(B.atk, player.def, 0.2)*g2); if(player.invuln>0)d=0; player.hp=clamp(player.hp-d,0,player.hpMax);
      floatText(heroX(),gy()-100,(g2<1?'blocked -':'-')+d,'#ff6b6b'); emit(heroX(),gy()-70,12,{col:'#ff6b6b',sp0:40,sp1:130}); });
    after(0.7,function(){ B.eneDX=0; B.eneAnim=null; });
    after(0.95, afterEnemy);
  }
}
function afterEnemy(){ B.guard=false; if(player.hp<=0){ heroDies(); return; } backToMenu(); }
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
var ROOT=['Fight','Magic','Defend','Item','Flee'];
function battleInput(){
  if(!B || B.phase!=='menu')return;
  var list = B.menu==='root'?ROOT : (B.menu==='magic'?SPELLS:ITEMS);
  if(navEdge('up')){ B.cursor=(B.cursor+list.length-1)%list.length; haptic('sel'); }
  if(navEdge('down')){ B.cursor=(B.cursor+1)%list.length; haptic('sel'); }
  if(consume('a')){
    if(B.menu==='root'){
      if(B.cursor===0) heroAttack();
      else if(B.cursor===1){ B.menu='magic'; B.cursor=0; haptic('sel'); }
      else if(B.cursor===2) heroDefend();
      else if(B.cursor===3){ B.menu='item'; B.cursor=0; haptic('sel'); }
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
  // enemy attack-animation advance (bosses only)
  if(B.eneAnim){ var ea=A.mob[B.kind][B.eneAnim]; if(ea){ B.eneT+=dt; if(B.eneT>=1/12){ B.eneT=0; if(B.eneFrame<ea.frames-1) B.eneFrame++; } } }
  if(B.flashE>0)B.flashE-=dt; if(B.flashH>0)B.flashH-=dt;
  if(player.invuln>0)player.invuln-=dt;
  updFX(dt); updStatusFX(dt); updPP(dt); updFloats(dt);
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
    var im=mdef.idle, isc=108/im.fh, bob=Math.sin(B.eneBob*3)*3;
    if(B.eneAnim && mdef[B.eneAnim]){ var am=mdef[B.eneAnim], afi=Math.min(am.frames-1,B.eneFrame), asc=108/am.fh;
      drawFrame(images['mob_'+B.kind+'_'+B.eneAnim], am.fw,am.fh, afi, ex, g-bob, asc, true);
    } else {
      var ifi=Math.floor(B.eneBob*6)%im.frames;
      drawFrame(images['mob_'+B.kind+'_idle'], im.fw,im.fh, ifi, ex, g-bob, isc, true);
    }
    if(B.flashE>0){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=clamp(B.flashE*2.5,0,0.9);
      var ffi=Math.floor(B.eneBob*6)%im.frames;
      drawFrame(images['mob_'+B.kind+'_idle'], im.fw,im.fh, ffi, ex, g-bob, isc, true);
      ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; }
  }
  // hero (faces right toward enemy)
  var hdef=A.hero[B.heroAnim].side;
  drawFrame(images['hero_'+B.heroAnim+'_side'], hdef.fw,hdef.fh, Math.min(B.heroFrame,hdef.frames-1), hx, g, 1.7, false);
  if(B.flashH>0){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=clamp(B.flashH*2.5,0,0.9);
    drawFrame(images['hero_'+B.heroAnim+'_side'], hdef.fw,hdef.fh, Math.min(B.heroFrame,hdef.frames-1), hx, g, 1.7, false);
    ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; }
  drawFXAll(0,0); drawPP(0,0); drawFloats(0,0);
  // persistent status badges above the combatants + transient status bursts
  var es=[]; if(B.bleedE>0)es.push('bleed'); if(B.burnE>0)es.push('burn'); if(B.poisonE>0)es.push('poison'); if(B.stun>0)es.push('stun'); if(B.enraged&&B.hp>0)es.push('rage');
  if(!B.dead) drawStatusRow(es, ex, g-124);
  if(B.guard) drawStatusRow(['shield'], hx, g-110);
  drawStatusFX(0,0);
  ctx.restore();

  // enemy nameplate + HP
  panel(VW/2-130,14,260,36,'#e0785a');
  ctx.fillStyle='#f3e9d2'; ctx.font='bold 14px Trebuchet MS'; ctx.textAlign='center';
  ctx.fillText(B.name, VW/2, 30); ctx.textAlign='left'; bar(VW/2-112,34,224,8,Math.max(0,B.hp),B.hpMax,'#d2443a');
  battleUI();
}
/* ---------- Battle UI (message + stats + command window) ---------- */
function battleUI(){
  var by=VH-150-96;
  // message bar
  panel(10,by,VW-20,34);
  ctx.fillStyle='#f3e9d2'; ctx.font='14px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText(B.msg, VW/2, by+22); ctx.textAlign='left';
  var py=by+42;
  // hero stat panel
  panel(10,py,150,90);
  ctx.fillStyle='#eafbe0'; ctx.font='bold 13px Trebuchet MS'; ctx.fillText(player.job+' Lv.'+player.level,20,py+18);
  ctx.font='11px Trebuchet MS'; ctx.fillStyle='#cfe0b0';
  ctx.fillText('HP '+Math.round(player.hp)+'/'+player.hpMax,20,py+36); bar(20,py+40,120,6,player.hp,player.hpMax,'#d2443a');
  ctx.fillStyle='#cfe0b0'; ctx.fillText('MP '+player.mp+'/'+player.mpMax,20,py+58); bar(20,py+62,120,6,player.mp,player.mpMax,'#3f74d6');
  bar(20,py+78,120,5,player.xp,player.xpNext,'#b06bd6');
  // command window
  if(B.phase==='menu'){
    var list = B.menu==='root'?ROOT:(B.menu==='magic'?SPELLS:ITEMS);
    var cx=170, cw=VW-180, ch=90;
    panel(cx,py,cw,ch);
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

/* ============================================================
   BUILDING INTERIORS  (enterable rooms + keepers + services)
   ============================================================ */
var INTERIORS={
  tavern:  {title:'The Ember Tavern',  floor:'#5a3b26', wall:'#3a2416', accent:'#e0a35a', keeper:'tavern', keeperName:'Brida the Keep',
            lines:['Rest easy, Vanguard \u2014 your wounds are mended.','A warm hearth and a full tankard, free for our champion.','Come back weary and I\u2019ll patch you up again.'], heal:true},
  castle:  {title:'The Throne Hall',   floor:'#3b4a66', wall:'#222c42', accent:'#9fb6e0', keeper:'knight', keeperName:'King Aldric',
            lines:['Rise, Vanguard. The realm leans upon your blade.','Grimspire\u2019s demons grow bold \u2014 fell their Warchief and the beasts beyond.','My healers have restored your strength. Go bravely.'], heal:true},
  barracks:{title:'The War Hall',      floor:'#43402f', wall:'#2a271c', accent:'#d0b45a', keeper:'knight', keeperName:'Drillmaster Doran',
            lines:['Steel is earned in sweat, soldier.','In battle, Defend to brace \u2014 then punish with a counter.','Dismissed. Back to the field with you.'], heal:false},
  temple:  {title:'Monastery of Dawn', floor:'#4a4660', wall:'#2c2940', accent:'#cbb9ff', keeper:'wizard', keeperName:'Sage Morwen',
            lines:['The light flows through you once more.','Thunder bites hardest against the undead; flame against the fiend.','Go in peace, child of the ember.'], heal:true},
  tower:   {title:'The Watchtower',    floor:'#3a4238', wall:'#242a22', accent:'#9fd4a0', keeper:'rogue',  keeperName:'The Watchman',
            lines:['From here I see the whole vale.','Dark banners mass to the north-east \u2014 Grimspire stirs.','Keep your blade close on the roads.'], heal:false},
  home:    {title:'A Humble Dwelling', floor:'#4e3b2a', wall:'#30241a', accent:'#c9a06a', keeper:'peasant',keeperName:'Villager',
            lines:['Welcome, friend. Mind the dust.','We pray for your victory each dawn.','Safe travels out there.'], heal:false}
};
var INT=null;
function enterInterior(b){
  var cfg=INTERIORS[b.enter]||INTERIORS.home;
  INT={cfg:cfg, name:b.name, idx:0, dlg:false, t:0, bx:b.wx, by:b.wy};
  state='interior'; moveTarget=null; haptic('medium');
  if(cfg.heal){ player.hp=player.hpMax; player.mp=player.mpMax; floatText(VW/2,VH*0.5,'Restored!','#8fe36b'); }
  save();
}
function exitInterior(){
  if(!INT)return;
  state='overworld'; player.invuln=0.6;
  player.wx=INT.bx; player.wy=INT.by+TILE*1.2;   // step out below the door
  player.dir='down'; player.anim='idle'; moveTarget=null;
  INT=null; haptic('light');
}
function interiorUpdate(dt){
  INT.t+=dt;
  var cfg=INT.cfg;
  if(consume('a')){ if(!INT.dlg){ INT.dlg=true; INT.idx=0; } else { INT.idx++; if(INT.idx>=cfg.lines.length) INT.dlg=false; } haptic('sel'); }
  if(consume('b')) exitInterior();
  updPP(dt); updFloats(dt);
}
function interiorDraw(){
  var cfg=INT.cfg, fy=VH*0.46;
  ctx.fillStyle=cfg.wall; ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle=cfg.floor; ctx.fillRect(0,fy,VW,VH-fy);
  // floor boards (converging perspective)
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=2;
  for(var i=1;i<8;i++){ var x=VW*i/8; ctx.beginPath(); ctx.moveTo(x,fy); ctx.lineTo(VW*0.5+(x-VW*0.5)*2.1,VH); ctx.stroke(); }
  for(var j=1;j<5;j++){ var yy=fy+(VH-fy)*(j/5)*(j/5); ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(VW,yy); ctx.stroke(); }
  ctx.fillStyle='rgba(0,0,0,.28)'; ctx.fillRect(0,fy-8,VW,8);
  // wall torches
  function torch(tx){ var ty=fy*0.52; ctx.fillStyle='#2a1c10'; ctx.fillRect(tx-3,ty,6,34);
    ctx.globalCompositeOperation='lighter'; var fl=4+Math.sin(INT.t*8+tx)*2;
    var gr=ctx.createRadialGradient(tx,ty-2,2,tx,ty-2,24); gr.addColorStop(0,'#ffd98a'); gr.addColorStop(1,'rgba(255,140,40,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(tx,ty-2,20+fl,0,6.283); ctx.fill(); ctx.globalCompositeOperation='source-over'; }
  torch(VW*0.18); torch(VW*0.82);
  if(Math.random()<0.5){ emit(VW*0.18, fy*0.52-2, 1, {col:'#ffb86b',sp0:4,sp1:16,ang:-1.57,g:-30,l0:0.6,l1:1.2,r0:1,r1:2});
    emit(VW*0.82, fy*0.52-2, 1, {col:'#ffb86b',sp0:4,sp1:16,ang:-1.57,g:-30,l0:0.6,l1:1.2,r0:1,r1:2}); }
  // keeper on the back wall
  var kx=VW*0.5, ky=fy+14, km=A.npc[cfg.keeper];
  drawShadow(kx,ky,16);
  if(imgReady(images['npc_'+cfg.keeper])) drawFrame(images['npc_'+cfg.keeper], km.fw,km.fh, Math.floor(INT.t*4)%km.frames, kx, ky, km.fh>=64?1.6:2.8, false);
  // hero before the keeper
  var hm=A.hero.idle.down; drawShadow(VW*0.5, VH*0.78, 15);
  drawFrame(images['hero_idle_down'], hm.fw,hm.fh, Math.floor(INT.t*5)%hm.frames, VW*0.5, VH*0.78, 1.4, false);
  // title
  ctx.textAlign='center'; ctx.fillStyle=cfg.accent; ctx.font='bold 20px Trebuchet MS'; ctx.fillText(INT.name, VW/2, 42);
  ctx.fillStyle='rgba(243,233,210,.7)'; ctx.font='12px Trebuchet MS'; ctx.fillText(cfg.title, VW/2, 62); ctx.textAlign='left';
  drawPP(0,0); drawFloats(0,0);
  // exit banner
  panel(VW/2-96,VH-150-44,192,32);
  ctx.fillStyle='#eafbe0'; ctx.font='13px Trebuchet MS'; ctx.textAlign='center';
  ctx.fillText(INT.dlg?'A \u25b8 continue':'Tap keeper to talk \u00b7 B / tap here to leave', VW/2, VH-150-23); ctx.textAlign='left';
  if(INT.dlg) drawInteriorDialogue();
}
function drawInteriorDialogue(){
  var h=108, y=VH-h-150, cfg=INT.cfg;
  panel(12,y,VW-24,h);
  ctx.fillStyle='#ffd98a'; ctx.font='bold 16px Trebuchet MS'; ctx.fillText(cfg.keeperName, 28, y+28);
  ctx.fillStyle='#f3e9d2'; ctx.font='15px Trebuchet MS';
  wrapText(cfg.lines[Math.min(INT.idx,cfg.lines.length-1)]||'', 28, y+54, VW-56, 22, 'left');
}
/* ============================================================
   TOUCH \u2014 tap-to-move / tap-to-act (native mobile controls)
   ============================================================ */
function canvasTap(cx,cy){
  if(state==='title'){ newGame(); return; }
  if(state==='gameover'){ state='title'; return; }
  if(state==='interior'){ handleInteriorTap(cx,cy); return; }
  if(state==='overworld'){ handleOverworldTap(cx,cy); return; }
  if(state==='battle'){ handleBattleTap(cx,cy); return; }
}
function handleOverworldTap(cx,cy){
  if(dlg.active){ dlg.idx++; if(dlg.idx>=dlg.lines.length) dlg.active=false; haptic('sel'); return; }
  var wx=cam.x+cx, wy=cam.y+cy;
  for(var i=0;i<npcs.length;i++){ if(dist(wx,wy,npcs[i].wx,npcs[i].wy)<TILE && dist(player.wx,player.wy,npcs[i].wx,npcs[i].wy)<TILE*2.4){ startDialogue(npcs[i]); return; } }
  for(i=0;i<buildings.length;i++){ var bb=buildings[i], m=A.build[bb.key], bw=m.w*bb.scale, bh=m.h*bb.scale;
    if(wx>bb.wx-bw/2 && wx<bb.wx+bw/2 && wy>bb.wy-bh && wy<bb.wy+12){
      if(dist(player.wx,player.wy,bb.wx,bb.wy+8)<TILE*2.6){ enterInterior(bb); return; }
    } }
  moveTarget={x:clamp(wx,TILE,WMAX_X-TILE), y:clamp(wy,TILE,WMAX_Y-TILE)};
}
function handleInteriorTap(cx,cy){
  if(cy>VH-150-50 && cy<VH-150-6){ exitInterior(); return; }
  var cfg=INT.cfg;
  if(!INT.dlg){ INT.dlg=true; INT.idx=0; } else { INT.idx++; if(INT.idx>=cfg.lines.length) INT.dlg=false; }
  haptic('sel');
}
function handleBattleTap(cx,cy){
  if(!B || B.phase!=='menu') return;
  var by=VH-150-96, py=by+42;
  var list=B.menu==='root'?ROOT:(B.menu==='magic'?SPELLS:ITEMS);
  var mx=170, mw=VW-180, mh=90;
  if(cx>=mx && cx<=mx+mw && cy>=py && cy<=py+mh){
    var i=Math.floor((cy-(py+6))/20);
    if(i>=0 && i<list.length){ B.cursor=i; haptic('sel');
      if(B.menu==='root'){ if(i===0)heroAttack(); else if(i===1){B.menu='magic';B.cursor=0;} else if(i===2)heroDefend(); else if(i===3){B.menu='item';B.cursor=0;} else heroFlee(); }
      else if(B.menu==='magic') heroMagic(i);
      else heroItem(i);
    }
    return;
  }
  if(B.menu!=='root' && cx<162 && cy>=py){ B.menu='root'; B.cursor=0; haptic('light'); }
}
(function(){
  function tapAt(e){ var r=canvas.getBoundingClientRect(); var pt=(e.touches&&e.touches[0])||e;
    canvasTap(pt.clientX-r.left, pt.clientY-r.top); }
  canvas.addEventListener('touchstart',function(e){ e.preventDefault(); tapAt(e); },{passive:false});
  canvas.addEventListener('mousedown',function(e){ tapAt(e); });
})();
/* ---------- Main loop ---------- */
var last=0;
function frame(ts){
  var dt=last?Math.min((ts-last)/1000,0.05):0.016; last=ts;
  var sh=shakeOff(dt);
  ctx.clearRect(0,0,VW,VH);
  if(state==='title'){ titleUpdate(dt); titleDraw(); }
  else if(state==='overworld'){ overworldUpdate(dt); overworldDraw(sh); }
  else if(state==='interior'){ interiorUpdate(dt); interiorDraw(); }
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
