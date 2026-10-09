/* ============================================================
   TRIBES  —  Telegram Mini App  —  FF3-style hybrid prototype
   Top-down overworld exploration + side-view turn-based battle.
   Code-only VFX (parallax, shadows, lighting, screen-shake).
   Slice 1: single-player local prototype (localStorage save).
   ============================================================ */
(function(){
'use strict';

/* ---------- Telegram WebApp ---------- */
var TG = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (TG){ try{
  TG.ready(); TG.expand();
  if(TG.disableVerticalSwipes) TG.disableVerticalSwipes();   // stop swipe-to-close fighting the D-pad
  if(TG.setHeaderColor) TG.setHeaderColor('#0a0b10');
  if(TG.setBackgroundColor) TG.setBackgroundColor('#070810');
}catch(e){} }
function haptic(type){ try{ if(TG&&TG.HapticFeedback){ if(type==='sel')TG.HapticFeedback.selectionChanged(); else TG.HapticFeedback.impactOccurred(type||'light'); } }catch(e){} }

/* ---------- On-screen error reporting (mobile has no console) ---------- */
window.addEventListener('error', function(e){
  var el=document.getElementById('loading');
  if(el){ el.classList.remove('hide'); el.style.opacity=1;
    el.textContent='JS Error: '+((e&&e.message)||'')+' @'+(((e&&e.filename)||'').split('/').pop())+':'+((e&&e.lineno)||'?'); }
});

/* ---------- Asset manifest (baked from processed packs) ---------- */
var HERO = {
  idle :{file:'assets/hero/idle.png' ,frames:4,fw:75 ,fh:200,fps:6},
  walk :{file:'assets/hero/walk.png' ,frames:6,fw:130,fh:200,fps:10},
  run  :{file:'assets/hero/run.png'  ,frames:6,fw:119,fh:200,fps:14},
  jump :{file:'assets/hero/jump.png' ,frames:6,fw:139,fh:200,fps:10},
  slide:{file:'assets/hero/slide.png',frames:3,fw:209,fh:200,fps:12},
  throw:{file:'assets/hero/throw.png',frames:3,fw:122,fh:200,fps:14},
  hurt :{file:'assets/hero/hurt.png' ,frames:2,fw:104,fh:200,fps:8},
  faint:{file:'assets/hero/faint.png',frames:4,fw:218,fh:200,fps:6}
};
var ENEMIES = {
  demon1:{file:'assets/enemies/demon1.png',fw:93 ,fh:210,name:'Ashen Imp'   ,hp:38 ,atk:9 ,def:2,xp:12,gold:7 },
  demon3:{file:'assets/enemies/demon3.png',fw:105,fh:210,name:'Bog Stalker' ,hp:52 ,atk:12,def:4,xp:20,gold:12},
  demon5:{file:'assets/enemies/demon5.png',fw:122,fh:210,name:'Horned Reaver',hp:70,atk:15,def:6,xp:34,gold:20},
  demon8:{file:'assets/enemies/demon8.png',fw:72 ,fh:210,name:'Gloom Whelp' ,hp:30 ,atk:8 ,def:1,xp:9 ,gold:5 }
};
var FX = {};
['heal','bleed','poisonbubble','sleep','rage','stun','shield','regen','burn','shock','haste','weaken']
  .forEach(function(k){ FX[k]={file:'assets/fx/'+k+'.png',cols:4,rows:4,size:64}; });
// map icons baked from the Kenney cartography pack (cream line-art, 64px)
var MAPICON = {};
['castle','church','house','houseSmall','tower','well','mill','graveyard','tent',
 'flag','mine','campfire','chest','treePine','treePineLarge','rocks','rocksTall','cactus','ship']
  .forEach(function(k){ MAPICON[k]={file:'assets/map/'+k+'.png'}; });
// UI 9-slice frame + panel baked from the Kenney fantasy-ui-borders pack
var UI = { frame:{file:'assets/ui/frame.png'}, panel:{file:'assets/ui/panel.png'} };

/* ---------- Image loader (with progress + watchdog) ---------- */
var images={}; var toLoad=0, loaded=0, failed=[];
function load(key,src){ toLoad++; var im=new Image();
  im.onload=function(){loaded++;};
  im.onerror=function(){loaded++; failed.push(src);};
  im.src=src; images[key]=im; }
function setLoadMsg(t){ var el=document.getElementById('loading'); if(el&&!el.classList.contains('hide')) el.textContent=t; }
function loadAll(cb){
  for(var k in HERO) load('hero_'+k,HERO[k].file);
  for(var e in ENEMIES) load('ene_'+e,ENEMIES[e].file);
  for(var f in FX) load('fx_'+f,FX[f].file);
  for(var m in MAPICON) load('map_'+m,MAPICON[m].file);
  for(var u in UI) load('ui_'+u,UI[u].file);
  var waited=0, MAXW=12000;   // boot anyway after 12s so it never hangs on the loading screen
  (function wait(){
    setLoadMsg('Awakening the tribe\u2026 '+loaded+'/'+toLoad);
    if(loaded>=toLoad || waited>=MAXW){ cb(); }
    else { waited+=60; setTimeout(wait,60); }
  })();
}

/* ---------- Canvas / viewport ---------- */
var canvas=document.getElementById('game'), ctx=canvas.getContext('2d');
var VW=0,VH=0,DPR=1;
function resize(){
  var w=window.innerWidth, h=(TG&&TG.viewportStableHeight)?TG.viewportStableHeight:window.innerHeight;
  DPR=Math.min(window.devicePixelRatio||1,2);
  VW=w; VH=h;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  canvas.width=Math.round(w*DPR); canvas.height=Math.round(h*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize',resize);
if(TG&&TG.onEvent){ try{TG.onEvent('viewportChanged',resize);}catch(e){} }
resize();

/* ---------- Input ---------- */
var keys={up:false,down:false,left:false,right:false,a:false,b:false};
var pressed={a:false,b:false}; // edge-triggered (consumed per frame)
function setKey(k,v){ if(!(k in keys))return; if(v&&!keys[k]&&(k==='a'||k==='b'))pressed[k]=true; keys[k]=v; }
// touch buttons
Array.prototype.forEach.call(document.querySelectorAll('.dbtn,.abtn'),function(btn){
  var k=btn.getAttribute('data-k');
  function dn(e){ e.preventDefault(); setKey(k,true); btn.classList.add('pressed'); if(k==='a'||k==='b')haptic('light'); }
  function up(e){ e.preventDefault(); setKey(k,false); btn.classList.remove('pressed'); }
  btn.addEventListener('touchstart',dn,{passive:false});
  btn.addEventListener('touchend',up,{passive:false});
  btn.addEventListener('touchcancel',up,{passive:false});
  btn.addEventListener('mousedown',dn); btn.addEventListener('mouseup',up); btn.addEventListener('mouseleave',up);
});
// keyboard
var KMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',j:'a',z:'a',Enter:'a',k:'b',x:'b',Shift:'b'};
window.addEventListener('keydown',function(e){ var k=KMAP[e.key]; if(k){ setKey(k,true); e.preventDefault(); } });
window.addEventListener('keyup',function(e){ var k=KMAP[e.key]; if(k){ setKey(k,false); e.preventDefault(); } });
function consume(k){ if(pressed[k]){ pressed[k]=false; return true; } return false; }

/* ---------- Utility ---------- */
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
// a 404'd/broken image is still a truthy object, so `if(!img)` does NOT catch it;
// calling ctx.drawImage() on a broken image throws InvalidStateError in a real
// browser (headless harness can't see this). Only draw when truly decoded.
function imgReady(im){ return !!(im && im.complete && im.naturalWidth>0); }
function lerp(a,b,t){ return a+(b-a)*t; }
function rand(a,b){ return a+Math.random()*(b-a); }
function randint(a,b){ return Math.floor(rand(a,b+1)); }
function choice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* ---------- Player / save ---------- */
var player={
  x:0,y:0, dir:1, moving:false, anim:'idle', t:0, frame:0,
  level:1, xp:0, xpNext:30, job:'Wanderer',
  hp:100, hpMax:100, mp:20, mpMax:20, atk:12, def:5,
  gold:0,
  hunger:100, energy:100,   // survival meters
  invuln:0
};
var SAVE_KEY='tribes_save_v1';
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify({
  level:player.level,xp:player.xp,xpNext:player.xpNext,job:player.job,
  hp:player.hp,hpMax:player.hpMax,mp:player.mp,mpMax:player.mpMax,atk:player.atk,def:player.def,
  gold:player.gold,hunger:player.hunger,energy:player.energy,x:player.x,y:player.y
})); }catch(e){} }
function loadSave(){ try{ var s=JSON.parse(localStorage.getItem(SAVE_KEY)); if(s){ for(var k in s) player[k]=s[k]; return true; } }catch(e){} return false; }
function hasSave(){ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } }

/* ---------- World / tile map ---------- */
var TS=48;              // tile size (world px)
var MAP_W=48, MAP_H=48;
var map=[];             // 0 grass,1 tallgrass,2 water,3 tree,4 rock,5 path,6 flower,7 structure(solid)
var roamers=[];         // wandering enemies on the map
var landmarks=[];       // cartography props: towns, campfires (rest), chests (loot)
function genMap(){
  map=[];
  for(var y=0;y<MAP_H;y++){ var row=[]; for(var x=0;x<MAP_W;x++){ row.push(0);} map.push(row); }
  // scatter tall grass + flowers
  for(var i=0;i<MAP_W*MAP_H*0.14|0;i++){ map[randint(0,MAP_H-1)][randint(0,MAP_W-1)]=1; }
  for(i=0;i<40;i++){ map[randint(0,MAP_H-1)][randint(0,MAP_W-1)]=6; }
  // forest clusters (trees)
  for(var c=0;c<10;c++){ var cx=randint(3,MAP_W-4),cy=randint(3,MAP_H-4),r=randint(2,4);
    for(var dy=-r;dy<=r;dy++)for(var dx=-r;dx<=r;dx++){ var tx=cx+dx,ty=cy+dy;
      if(tx>1&&ty>1&&tx<MAP_W-1&&ty<MAP_H-1&&(dx*dx+dy*dy)<=r*r&&Math.random()<0.6) map[ty][tx]=3; } }
  // a lake
  var lx=randint(6,MAP_W-10),ly=randint(6,MAP_H-10);
  for(dy=0;dy<5;dy++)for(dx=0;dx<7;dx++){ if(Math.random()<0.85) map[ly+dy][lx+dx]=2; }
  // rock outcrops
  for(i=0;i<24;i++){ map[randint(2,MAP_H-3)][randint(2,MAP_W-3)]=4; }
  // a winding path through the middle
  var py=MAP_H>>1;
  for(x=0;x<MAP_W;x++){ py=clamp(py+randint(-1,1),2,MAP_H-3); map[py][x]=5; map[py+1][x]=5; }
  // clear a safe spawn in the center on the path
  player.x=(MAP_W>>1)*TS; player.y=(py)*TS;
  // place roaming demons away from spawn
  roamers=[];
  var kinds=Object.keys(ENEMIES);
  for(i=0;i<7;i++){
    var rx,ry,tries=0;
    do{ rx=randint(2,MAP_W-3); ry=randint(2,MAP_H-3); tries++; }
    while((solidAt(rx,ry)||Math.hypot(rx*TS-player.x,ry*TS-player.y)<TS*6)&&tries<40);
    roamers.push({x:rx*TS,y:ry*TS,kind:choice(kinds),t:rand(0,6),dir:choice([-1,1]),vx:0,vy:0,cool:0});
  }
  // scatter cartography landmarks (towns = solid decor; campfire = rest; chest = loot)
  landmarks=[];
  function freeSpot(minD){ var sx,sy,tries=0;
    do{ sx=randint(3,MAP_W-4); sy=randint(3,MAP_H-4); tries++; }
    while(tries<60 && (map[sy][sx]!==0 && map[sy][sx]!==1 && map[sy][sx]!==6
       || Math.hypot(sx*TS-player.x,sy*TS-player.y)<TS*minD));
    return {tx:sx,ty:sy};
  }
  var decor=['castle','church','house','houseSmall','house','tower','well','mill','graveyard','tent'];
  for(var di=0; di<decor.length; di++){ var sp=freeSpot(4);
    map[sp.ty][sp.tx]=7; // solid structure footprint
    landmarks.push({tx:sp.tx,ty:sp.ty,kind:decor[di],type:'decor'});
  }
  for(var cf=0; cf<4; cf++){ var sc=freeSpot(5);
    landmarks.push({tx:sc.tx,ty:sc.ty,kind:'campfire',type:'rest',used:false}); }
  for(var ch=0; ch<5; ch++){ var sh2=freeSpot(5);
    landmarks.push({tx:sh2.tx,ty:sh2.ty,kind:'chest',type:'loot',used:false}); }
}
function tileAt(wx,wy){ var tx=Math.floor(wx/TS),ty=Math.floor(wy/TS); if(tx<0||ty<0||tx>=MAP_W||ty>=MAP_H)return 3; return map[ty][tx]; }
function solidAt(tx,ty){ if(tx<0||ty<0||tx>=MAP_W||ty>=MAP_H)return true; var t=map[ty][tx]; return t===2||t===3||t===4||t===7; }
function solidWorld(wx,wy){ return solidAt(Math.floor(wx/TS),Math.floor(wy/TS)); }

/* ---------- VFX: particle pool, floating text, screen shake ---------- */
var PP=[],PP_MAX=240; for(var _i=0;_i<PP_MAX;_i++)PP.push({a:0});
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
function floatText(x,y,txt,col){ floats.push({x:x,y:y,txt:txt,col:col||'#fff',t:1.0}); }
function updFloats(dt){ for(var i=floats.length-1;i>=0;i--){ var f=floats[i]; f.t-=dt*0.9; f.y-=38*dt; if(f.t<=0)floats.splice(i,1); } }
function drawFloats(ox,oy){ ctx.textAlign='center'; for(var i=0;i<floats.length;i++){ var f=floats[i];
  ctx.globalAlpha=clamp(f.t,0,1); ctx.font='bold 20px Trebuchet MS';
  ctx.lineWidth=3; ctx.strokeStyle='rgba(0,0,0,.8)'; ctx.strokeText(f.txt,f.x-ox,f.y-oy);
  ctx.fillStyle=f.col; ctx.fillText(f.txt,f.x-ox,f.y-oy);} ctx.globalAlpha=1; ctx.textAlign='left'; }

var shake={t:0,mag:0};
function doShake(m,t){ shake.mag=Math.max(shake.mag,m); shake.t=Math.max(shake.t,t); }
function shakeOff(dt){ if(shake.t>0){ shake.t-=dt; var k=clamp(shake.t*4,0,1); return {x:rand(-1,1)*shake.mag*k,y:rand(-1,1)*shake.mag*k}; } return {x:0,y:0}; }

/* ---------- Sprite drawing ---------- */
function drawHero(anim,frame,dx,dy,scale,flip){
  var def=HERO[anim], img=images['hero_'+anim];
  var fw=def.fw, fh=def.fh, w=fw*scale, h=fh*scale;
  ctx.save(); ctx.translate(dx,dy);
  if(flip){ ctx.scale(-1,1); }
  if(imgReady(img)){ ctx.drawImage(img, frame*fw,0,fw,fh, -w/2,-h, w,h); }
  else { ctx.fillStyle='#6cc5ff'; ctx.fillRect(-w*0.3,-h,w*0.6,h); } // placeholder so game stays visible if sprite missing
  ctx.restore();
}
function drawEnemySprite(kind,dx,dy,scale,flip){
  var def=ENEMIES[kind], img=images['ene_'+kind];
  var w=def.fw*scale,h=def.fh*scale;
  ctx.save(); ctx.translate(dx,dy); if(flip)ctx.scale(-1,1);
  if(imgReady(img)){ ctx.drawImage(img,-w/2,-h,w,h); }
  else { ctx.fillStyle='#c0392b'; ctx.fillRect(-w*0.3,-h,w*0.6,h); } // placeholder
  ctx.restore();
}
function drawShadow(dx,dy,rw){ ctx.save(); ctx.globalAlpha=0.33; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(dx,dy,rw,rw*0.38,0,0,6.283); ctx.fill(); ctx.restore(); }
// animated status-effect sheet (4x4 @64) played by time
function drawFX(key,dx,dy,size,time,alpha){ var f=FX[key],img=images['fx_'+key]; if(!imgReady(img))return;
  var fr=Math.floor(time*14)%(f.cols*f.rows), sx=(fr%f.cols)*f.size, sy=((fr/f.cols)|0)*f.size;
  ctx.globalAlpha=alpha==null?1:alpha; ctx.drawImage(img,sx,sy,f.size,f.size, dx-size/2,dy-size/2,size,size); ctx.globalAlpha=1; }

/* ---------- Map-icon + 9-slice UI drawing (new packs) ---------- */
// draw a cartography icon centred-bottom at (dx,dy) in world->screen space
function drawMapIcon(name,dx,dy,size){
  var img=images['map_'+name]; if(!imgReady(img)) return false;
  var s=size||TS*1.1;
  ctx.drawImage(img, dx-s/2, dy-s, s, s); return true;
}
// 9-slice stretch of a 48px frame/panel with a ~16px corner
function draw9(name,x,y,w,h,corner){
  var img=images['ui_'+name]; if(!imgReady(img)) return false;
  var sw=img.naturalWidth, sh=img.naturalHeight, c=corner||16;
  var cs=Math.min(c, w/2-1, h/2-1); if(cs<1)cs=1;
  // src thirds
  var s0=c, s1=sw-c, m=sw-2*c;
  function part(sx,sy,sw2,sh2,dx,dy,dw,dh){ ctx.drawImage(img,sx,sy,sw2,sh2,dx,dy,dw,dh); }
  var midw=w-2*cs, midh=h-2*cs;
  // corners
  part(0,0,c,c, x,y,cs,cs);
  part(s1,0,c,c, x+w-cs,y,cs,cs);
  part(0,s1,c,c, x,y+h-cs,cs,cs);
  part(s1,s1,c,c, x+w-cs,y+h-cs,cs,cs);
  // edges
  if(midw>0){ part(c,0,m,c, x+cs,y,midw,cs); part(c,s1,m,c, x+cs,y+h-cs,midw,cs); }
  if(midh>0){ part(0,c,c,m, x,y+cs,cs,midh); part(s1,c,c,m, x+w-cs,y+cs,cs,midh); }
  if(midw>0&&midh>0) part(c,c,m,m, x+cs,y+cs,midw,midh); // center
  return true;
}

/* ---------- Overworld ---------- */
var cam={x:0,y:0};
var encMeter=0, worldTime=0, forageCool=0, restFx=0;
var grassWave=0;

function overworldUpdate(dt){
  grassWave+=dt*2;
  // movement input
  var ix=(keys.right?1:0)-(keys.left?1:0), iy=(keys.down?1:0)-(keys.up?1:0);
  var running=keys.b && (ix||iy);
  var sp = (running?168:112) * (player.energy<15?0.55:1);
  if(ix||iy){
    if(ix!==0) player.dir=ix>0?1:-1;
    var len=Math.hypot(ix,iy)||1; var nx=player.x+ix/len*sp*dt, ny=player.y+iy/len*sp*dt;
    // axis-separated collision (feet at player.y)
    if(!solidWorld(nx,player.y+2)&&!solidWorld(nx,player.y-14)) player.x=nx;
    if(!solidWorld(player.x,ny+2)&&!solidWorld(player.x,ny-14)) player.y=ny;
    player.x=clamp(player.x,TS*0.5,(MAP_W-0.5)*TS); player.y=clamp(player.y,TS,(MAP_H-0.3)*TS);
    player.moving=true; player.anim=running?'run':'walk';
    // encounters while walking through grass
    var t=tileAt(player.x,player.y-6);
    encMeter += dt*(t===1?22:(t===0?12:6));
    if(encMeter>rand(70,120)){ encMeter=0; startBattle(choice(Object.keys(ENEMIES))); return; }
  } else { player.moving=false; player.anim='idle'; }
  // animate
  var def=HERO[player.anim]; player.t+=dt; if(player.t>=1/def.fps){ player.t=0; player.frame=(player.frame+1)%def.frames; }
  // survival meters
  player.hunger=clamp(player.hunger-dt*0.9,0,100);
  player.energy=clamp(player.energy-dt*(running?1.4:0.55),0,100);
  if(player.hunger<=0) player.energy=clamp(player.energy-dt*2,0,100);
  if(player.energy<=0) { player.hp=clamp(player.hp-dt*2,0,player.hpMax); if(player.hp<=0){ gameOver('You collapsed, starving in the wilds.'); return; } }
  // actions
  forageCool-=dt; if(restFx>0)restFx-=dt;
  if(consume('a')){
    // interact with a nearby landmark first (chest loot / campfire rest)
    var acted=false;
    for(var li2=0; li2<landmarks.length; li2++){ var L=landmarks[li2];
      if(L.type==='decor') continue;
      var lcx=L.tx*TS+TS/2, lcy=L.ty*TS+TS/2;
      if(Math.hypot(player.x-lcx, player.y-lcy) > TS*1.3) continue;
      if(L.type==='loot'){ if(!L.used){ L.used=true;
          var gg=randint(18,45), ff=randint(8,20); player.gold+=gg; player.hunger=clamp(player.hunger+ff,0,100);
          floatText(lcx,lcy-TS,'+'+gg+'g','#ffd36b'); floatText(lcx,lcy-TS*1.5,'+'+ff+' food','#8fe36b');
          emit(lcx,lcy-TS*0.5,16,{col:'#ffd36b',sp0:30,sp1:90,g:-20}); haptic('medium');
        } else { floatText(lcx,lcy-TS,'Empty','#cfc6a8'); }
        acted=true; break;
      } else if(L.type==='rest'){
        var er=randint(30,45); player.energy=clamp(player.energy+er,0,100); player.hp=clamp(player.hp+randint(6,14),0,player.hpMax);
        restFx=1.6; floatText(lcx,lcy-TS,'Camp rest +'+er,'#ffb347');
        emit(lcx,lcy-TS*0.4,12,{col:'#ffb347',sp0:20,sp1:60,g:-30}); haptic('light');
        acted=true; break;
      }
    }
    if(!acted){
      var tx=Math.floor(player.x/TS),ty=Math.floor((player.y-6)/TS), tt=map[ty]&&map[ty][tx];
      if((tt===1||tt===6)&&forageCool<=0){ map[ty][tx]=0; forageCool=0.3;
        var food=randint(6,14); player.hunger=clamp(player.hunger+food,0,100);
        floatText(player.x,player.y-TS,'+'+food+' food','#8fe36b');
        if(Math.random()<0.3){ var g=randint(1,5); player.gold+=g; floatText(player.x,player.y-TS*1.5,'+'+g+'g','#ffd36b'); }
        emit(player.x,player.y-TS*0.6,10,{col:'#8fe36b',sp0:20,sp1:70,g:-30}); haptic('light');
      } else { floatText(player.x,player.y-TS,'Nothing here','#cfc6a8'); }
    }
  }
  if(consume('b') && !player.moving){
    var e=randint(18,30); player.energy=clamp(player.energy+e,0,100); player.hunger=clamp(player.hunger-6,0,100);
    restFx=1.4; floatText(player.x,player.y-TS,'Rested +'+e,'#86c5ff'); haptic('light');
  }
  // roamers wander + chase
  for(var i=0;i<roamers.length;i++){ var r=roamers[i]; r.t+=dt; r.cool-=dt;
    var dx=player.x-r.x, dy=player.y-r.y, d=Math.hypot(dx,dy);
    if(d<TS*3.2){ r.vx=dx/d*60; r.vy=dy/d*60; } // chase
    else { if(r.t>2){ r.t=0; r.vx=rand(-30,30); r.vy=rand(-30,30);} }
    var rnx=r.x+r.vx*dt, rny=r.y+r.vy*dt;
    if(!solidWorld(rnx,r.y)) r.x=rnx; else r.vx*=-1;
    if(!solidWorld(r.x,rny)) r.y=rny; else r.vy*=-1;
    if(r.vx) r.dir=r.vx>0?1:-1;
    if(d<26 && player.invuln<=0){ roamers.splice(i,1); startBattle(r.kind); return; }
  }
  if(player.invuln>0)player.invuln-=dt;
  // camera
  cam.x=lerp(cam.x, clamp(player.x-VW/2, 0, MAP_W*TS-VW), 0.12);
  cam.y=lerp(cam.y, clamp(player.y-VH/2, 0, MAP_H*TS-VH), 0.12);
  if(MAP_W*TS<VW)cam.x=(MAP_W*TS-VW)/2; if(MAP_H*TS<VH)cam.y=(MAP_H*TS-VH)/2;
  updPP(dt); updFloats(dt); save._t=(save._t||0)+dt; if(save._t>3){save._t=0;save();}
}

/* ---------- Overworld render ---------- */
function groundColor(t,x,y){
  // base grass with subtle code-art variation
  var n=((x*7+y*13)%5);
  if(t===5) return n<1?'#6b5a3c':'#7a6744';            // path
  if(t===2) return '#1e4e6b';                            // water (overdrawn w/ shimmer)
  var greens=['#2f6d33','#2b662f','#357a3a','#2f6d33','#328037'];
  return greens[n];
}
function overworldDraw(sh){
  var ox=cam.x+sh.x, oy=cam.y+sh.y;
  var t0x=Math.floor(ox/TS), t0y=Math.floor(oy/TS);
  var cols=Math.ceil(VW/TS)+2, rowsN=Math.ceil(VH/TS)+2;
  // ground
  for(var yy=t0y; yy<t0y+rowsN; yy++){ for(var xx=t0x; xx<t0x+cols; xx++){
    if(xx<0||yy<0||xx>=MAP_W||yy>=MAP_H){ ctx.fillStyle='#0b1a12'; ctx.fillRect(xx*TS-ox,yy*TS-oy,TS,TS); continue; }
    var t=map[yy][xx]; var sx=xx*TS-ox, sy=yy*TS-oy;
    ctx.fillStyle=groundColor(t===3||t===4||t===7?0:t,xx,yy); ctx.fillRect(sx,sy,TS,TS);
    if(t===2){ // water shimmer
      ctx.fillStyle='rgba(120,200,230,'+(0.08+0.06*Math.sin(worldTime*2+xx+yy))+')';
      ctx.fillRect(sx,sy+ (Math.sin(worldTime*1.5+xx)*2+TS*0.4), TS, 3);
    }
    if(t===6){ ctx.fillStyle='#e9d85a'; ctx.beginPath(); ctx.arc(sx+TS*0.5,sy+TS*0.55,3,0,6.283); ctx.fill(); ctx.fillStyle='#f06b8b'; ctx.beginPath(); ctx.arc(sx+TS*0.3,sy+TS*0.35,2,0,6.283); ctx.fill(); }
    if(t===1){ // tall grass blades (sway)
      ctx.strokeStyle='#3f8a3e'; ctx.lineWidth=2; var sw=Math.sin(grassWave+xx*0.7+yy*0.3)*3;
      for(var b=0;b<3;b++){ var bx=sx+10+b*14; ctx.beginPath(); ctx.moveTo(bx,sy+TS-4); ctx.quadraticCurveTo(bx+sw,sy+TS-18,bx+sw*1.6,sy+TS-30); ctx.stroke(); } }
  }}
  // depth objects (trees, rocks) + actors, y-sorted
  var drawList=[];
  for(yy=t0y-1; yy<t0y+rowsN+1; yy++){ for(xx=t0x-1; xx<t0x+cols+1; xx++){
    if(xx<0||yy<0||xx>=MAP_W||yy>=MAP_H)continue; var tt=map[yy][xx];
    if(tt===3) drawList.push({y:yy*TS+TS, kind:'tree', x:xx*TS+TS/2, by:yy*TS+TS});
    else if(tt===4) drawList.push({y:yy*TS+TS, kind:'rock', x:xx*TS+TS/2, by:yy*TS+TS});
  }}
  for(var ri=0;ri<roamers.length;ri++){ var r=roamers[ri]; drawList.push({y:r.y,kind:'roamer',ref:r}); }
  for(var li=0; li<landmarks.length; li++){ var L=landmarks[li];
    if(L.tx*TS< ox-TS*2 || L.tx*TS> ox+VW+TS*2 || L.ty*TS< oy-TS*3 || L.ty*TS> oy+VH+TS*2) continue;
    drawList.push({y:L.ty*TS+TS, kind:'landmark', x:L.tx*TS+TS/2, by:L.ty*TS+TS+6, ref:L}); }
  drawList.push({y:player.y, kind:'player'});
  drawList.sort(function(a,b){ return a.y-b.y; });
  for(var di=0; di<drawList.length; di++){ var o=drawList[di];
    if(o.kind==='tree'){ var tx=o.x-ox, ty=o.by-oy; drawShadow(tx,ty-4,20);
      if(!drawMapIcon('treePine',tx,ty+6,TS*1.15)){
        ctx.fillStyle='#5a3b22'; ctx.fillRect(tx-5,ty-26,10,26);
        ctx.fillStyle='#1f5a2a'; ctx.beginPath(); ctx.arc(tx,ty-40,22,0,6.283); ctx.fill();
        ctx.fillStyle='#2a7a38'; ctx.beginPath(); ctx.arc(tx-8,ty-46,14,0,6.283); ctx.arc(tx+10,ty-44,13,0,6.283); ctx.fill(); } }
    else if(o.kind==='rock'){ var rx=o.x-ox, ry=o.by-oy; drawShadow(rx,ry-2,18);
      if(!drawMapIcon('rocksTall',rx,ry+6,TS)){
        ctx.fillStyle='#5c5c66'; ctx.beginPath(); ctx.moveTo(rx-18,ry); ctx.lineTo(rx-10,ry-22); ctx.lineTo(rx+8,ry-26); ctx.lineTo(rx+18,ry-6); ctx.lineTo(rx+14,ry); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#777784'; ctx.beginPath(); ctx.moveTo(rx-10,ry-22); ctx.lineTo(rx+8,ry-26); ctx.lineTo(rx+2,ry-14); ctx.closePath(); ctx.fill(); } }
    else if(o.kind==='landmark'){ var L2=o.ref, mx=o.x-ox, my=o.by-oy;
      if(L2.type!=='rest') drawShadow(mx,my-6,L2.type==='decor'?22:12);
      var icon=L2.kind; if(L2.type==='loot'&&L2.used) icon='chest';
      var sz=L2.type==='decor'?TS*1.3:TS*0.95;
      if(!drawMapIcon(icon,mx,my,sz)){ ctx.fillStyle='#f3e9d2'; ctx.globalAlpha=.8; ctx.fillRect(mx-10,my-20,20,20); ctx.globalAlpha=1; }
      if(L2.type==='rest'){ var fl=0.5+0.5*Math.sin(worldTime*6+L2.tx); ctx.save(); ctx.globalAlpha=0.5*fl;
        var fg=ctx.createRadialGradient(mx,my-10,2,mx,my-10,26); fg.addColorStop(0,'#ffb347'); fg.addColorStop(1,'rgba(255,120,40,0)');
        ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(mx,my-10,26,0,6.283); ctx.fill(); ctx.restore(); } }
    else if(o.kind==='roamer'){ var r2=o.ref; var ex=r2.x-ox, ey=r2.y-oy; drawShadow(ex,ey,16);
      var bob=Math.sin(worldTime*4+r2.t)*3; drawEnemySprite(r2.kind, ex, ey-bob, 0.42, r2.dir<0); }
    else { // player
      var px=player.x-ox, py=player.y-oy; drawShadow(px,py,18);
      drawHero(player.anim, player.frame, px, py, 0.34, player.dir<0);
      if(restFx>0) drawFX('sleep', px, py-62, 42, worldTime, clamp(restFx,0,1));
    }
  }
  drawPP(ox,oy); drawFloats(ox,oy);
  // ambient lighting / vignette (depth)
  var vg=ctx.createRadialGradient(VW/2,VH*0.42,VH*0.2, VW/2,VH*0.42,VH*0.8);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(5,6,16,0.55)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,VW,VH);
  drawHUD();
}

/* ---------- HUD ---------- */
function bar(x,y,w,h,val,max,col,bg){
  ctx.fillStyle=bg||'rgba(0,0,0,.55)'; roundRect(x-2,y-2,w+4,h+4,4); ctx.fill();
  ctx.fillStyle='#1b1724'; roundRect(x,y,w,h,3); ctx.fill();
  ctx.fillStyle=col; var fw=Math.max(0,w*clamp(val/max,0,1)); roundRect(x,y,fw,h,3); ctx.fill();
}
function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawHUD(){
  var pad=10, top=(TG&&TG.safeAreaInset&&TG.safeAreaInset.top)||8;
  // panel
  ctx.fillStyle='rgba(10,10,20,.6)'; roundRect(pad,top,196,70,8); ctx.fill();
  if(!draw9('frame', pad-3, top-3, 202, 76, 16)){ // ornate gold frame from UI pack; fallback = thin stroke
    ctx.strokeStyle='rgba(224,163,90,.5)'; ctx.lineWidth=1.5; ctx.stroke(); }
  ctx.fillStyle='#f3e9d2'; ctx.font='bold 13px Trebuchet MS'; ctx.textAlign='left';
  ctx.fillText(player.job+'  Lv.'+player.level, pad+10, top+16);
  bar(pad+10, top+22, 150, 7, player.hp, player.hpMax, '#d2443a');
  bar(pad+10, top+32, 150, 7, player.mp, player.mpMax, '#3f74d6');
  bar(pad+10, top+42, 150, 7, player.hunger, 100, '#8fae3a');
  bar(pad+10, top+52, 150, 7, player.energy, 100, '#49b6c9');
  ctx.font='10px Trebuchet MS'; ctx.fillStyle='#cfc6a8';
  ctx.fillText('HP',pad+166,top+29); ctx.fillText('MP',pad+166,top+39);
  ctx.fillText('FOOD',pad+166,top+49); ctx.fillText('REST',pad+166,top+58);
  // gold + xp
  ctx.textAlign='right'; ctx.fillStyle='#ffd36b'; ctx.font='bold 13px Trebuchet MS';
  ctx.fillText(player.gold+' g', VW-pad-4, top+16);
  bar(VW-pad-110, top+22, 106, 6, player.xp, player.xpNext, '#b06bd6');
  ctx.textAlign='left';
  // low-status warnings (animated fx chips)
  var cy=top+82, cx=pad+2;
  if(player.hunger<25){ drawFX('weaken',cx+14,cy+10,30,worldTime); cx+=34; }
  if(player.energy<25){ drawFX('sleep',cx+14,cy+10,30,worldTime); cx+=34; }
  if(player.hp<player.hpMax*0.3){ drawFX('bleed',cx+14,cy+10,30,worldTime); }
  // hint line
  ctx.textAlign='center'; ctx.fillStyle='rgba(243,233,210,.7)'; ctx.font='11px Trebuchet MS';
  ctx.fillText('A: forage / open chests / camp  •  B: run / rest  •  explore the realm', VW/2, VH-186);
  ctx.textAlign='left';
}

/* ---------- Battle ---------- */
var B=null;              // battle state
var SKILLS=[
  {name:'Ember Bolt', mp:6, desc:'Fire damage + Burn', k:'burn'},
  {name:'Thunderclap',mp:8, desc:'Shock + chance Stun', k:'shock'},
  {name:'Mend',       mp:5, desc:'Heal self + Regen',  k:'heal'}
];
var ITEMS=[
  {name:'Herb Poultice', k:'heal', n:3, desc:'Restore 45 HP'},
  {name:'Venom Dart',    k:'poison', n:3, desc:'Poison the foe'}
];
var bclock=0, evq=[];
function after(t,fn){ evq.push({at:bclock+t, fn:fn}); }
function clearEv(){ evq.length=0; }

function startBattle(kind){
  var e=ENEMIES[kind];
  var scale=1+(player.level-1)*0.12;
  B={
    kind:kind, name:e.name,
    hp:Math.round(e.hp*scale), hpMax:Math.round(e.hp*scale),
    atk:Math.round(e.atk*scale), def:e.def, xp:Math.round(e.xp*scale), gold:Math.round(e.gold*scale),
    phase:'intro', cursor:0, menu:'root', sub:0,
    heroX:0, eneX:0, flashE:0, flashH:0, fxE:null, fxH:null, fxT:0,
    statusE:[], statusH:[], msg:e.name+' appears!', heroAnim:'idle', heroFrame:0, heroT:0,
    bgT:0, over:false, items:[ITEMS[0].n, ITEMS[1].n]
  };
  bclock=0; clearEv(); state='battle'; haptic('medium');
  after(0.9,function(){ B.phase='menu'; B.msg='What will you do?'; });
}

function heroPose(a){ B.heroAnim=a; B.heroFrame=0; B.heroT=0; }
function dmgCalc(atk,def,variance){ var d=Math.max(1, atk - def*0.6); return Math.round(d*rand(1-variance,1+variance)); }
function addStatus(list,key,turns,val){ for(var i=0;i<list.length;i++){ if(list[i].key===key){ list[i].turns=Math.max(list[i].turns,turns); return; } } list.push({key:key,turns:turns,val:val||0}); }
function hasStatus(list,key){ for(var i=0;i<list.length;i++) if(list[i].key===key)return list[i]; return null; }

/* ---------- Battle: status ticks ---------- */
function tickStatus(who){ // who 'E' or 'H'; returns true if stunned (skip turn)
  var list=who==='E'?B.statusE:B.statusH, stunned=false, px=who==='E'?eneScreenX():heroScreenX(), py=groundY()-70;
  for(var i=list.length-1;i>=0;i--){ var s=list[i];
    if(s.key==='burn'||s.key==='poison'||s.key==='bleed'){ var d=s.val||6;
      if(who==='E'){ B.hp-=d; B.flashE=0.25; } else { player.hp=clamp(player.hp-d,0,player.hpMax); B.flashH=0.25; }
      floatText2(px,py,'-'+d, s.key==='poison'?'#9be36b':(s.key==='burn'?'#ff9a3c':'#ff6b6b'));
      showFxOn(who,s.key==='poison'?'poisonbubble':s.key,0.5);
    } else if(s.key==='regen'){ var h=s.val||8; if(who==='H'){ player.hp=clamp(player.hp+h,0,player.hpMax); floatText2(px,py,'+'+h,'#8fe36b'); showFxOn(who,'regen',0.5); } }
    else if(s.key==='stun'){ stunned=true; }
    s.turns--; if(s.turns<=0) list.splice(i,1);
  }
  return stunned;
}
function floatText2(x,y,txt,col){ floats.push({x:x+cam0.x,y:y+cam0.y,txt:txt,col:col,t:1.0}); }
var cam0={x:0,y:0}; // battle uses screen coords; floats drawn with 0 offset in battle
function showFxOn(who,key,dur){ if(who==='E'){B.fxE=key;} else {B.fxH=key;} B.fxT=dur; }

/* ---------- Battle: hero actions ---------- */
function heroAttack(){
  B.phase='action'; B.msg='You strike!'; clearEv(); heroPose('throw');
  after(0.18,function(){ B.heroX=-70; });
  after(0.34,function(){ var d=dmgCalc(player.atk*1.0, B.def, 0.18);
    if(hasStatus(B.statusH,'rage')) d=Math.round(d*1.3);
    B.hp-=d; B.flashE=0.3; doShake(7,0.25); haptic('medium');
    floatText2(eneScreenX(),groundY()-90,'-'+d,'#fff'); emit2(eneScreenX(),groundY()-80,14,'#ffd27a'); });
  after(0.5,function(){ B.heroX=0; heroPose('idle'); });
  after(0.8,endHeroTurn);
}
function heroSkill(idx){ var s=SKILLS[idx];
  if(player.mp<s.mp){ B.msg='Not enough MP!'; B.menu='root'; B.phase='menu'; return; }
  player.mp-=s.mp; B.phase='action'; B.menu='root'; clearEv(); heroPose('throw');
  if(s.k==='heal'){ B.msg='You channel Mend.';
    after(0.3,function(){ var h=Math.round(player.hpMax*0.35); player.hp=clamp(player.hp+h,0,player.hpMax);
      addStatus(B.statusH,'regen',2,8); showFxOn('H','heal',0.9); floatText2(heroScreenX(),groundY()-90,'+'+h,'#8fe36b'); emit2(heroScreenX(),groundY()-80,16,'#8fe36b'); haptic('light'); });
    after(1.0,function(){heroPose('idle');}); after(1.2,endHeroTurn); return;
  }
  // offensive magic
  B.msg='You cast '+s.name+'!';
  after(0.35,function(){ var d=dmgCalc(player.atk*1.25+player.level*2, B.def*0.4, 0.2); B.hp-=d; B.flashE=0.35; doShake(9,0.3);
    showFxOn('E',s.k==='burn'?'burn':'shock',0.9); floatText2(eneScreenX(),groundY()-90,'-'+d, s.k==='burn'?'#ff9a3c':'#9bd4ff'); emit2(eneScreenX(),groundY()-80,20,s.k==='burn'?'#ff7a3c':'#9bd4ff'); haptic('medium');
    if(s.k==='burn') addStatus(B.statusE,'burn',3,7);
    if(s.k==='shock' && Math.random()<0.4){ addStatus(B.statusE,'stun',1,0); floatText2(eneScreenX(),groundY()-120,'STUN!','#ffe36b'); } });
  after(0.9,function(){heroPose('idle');}); after(1.15,endHeroTurn);
}
function heroItem(idx){ var it=ITEMS[idx];
  if(B.items[idx]<=0){ B.msg='None left!'; B.menu='root'; B.phase='menu'; return; }
  B.items[idx]--; B.phase='action'; B.menu='root'; clearEv();
  if(it.k==='heal'){ B.msg='You use '+it.name+'.'; after(0.3,function(){ player.hp=clamp(player.hp+45,0,player.hpMax); showFxOn('H','heal',0.8); floatText2(heroScreenX(),groundY()-90,'+45','#8fe36b'); haptic('light'); }); }
  else { B.msg='You hurl a '+it.name+'!'; after(0.3,function(){ addStatus(B.statusE,'poison',3,6); showFxOn('E','poisonbubble',0.8); floatText2(eneScreenX(),groundY()-100,'POISON','#9be36b'); }); }
  after(1.0,endHeroTurn);
}
function heroFlee(){ B.phase='action'; clearEv();
  if(Math.random()<0.6){ B.msg='Got away safely!'; after(0.6,function(){ state='overworld'; player.invuln=1.2; }); }
  else { B.msg="Couldn't escape!"; after(0.7,enemyTurn); }
}

/* ---------- Battle: screen helpers + turn flow ---------- */
function groundY(){ return VH*0.60; }
function heroScreenX(){ return VW*0.70 + B.heroX; }
function eneScreenX(){ return VW*0.26 + B.eneX; }
function emit2(x,y,n,col){ emit(x,y,n,{col:col,sp0:40,sp1:150,g:120,l0:0.4,l1:0.8}); }

function endHeroTurn(){ clearEv();
  if(B.hp<=0){ victory(); return; }
  // tick enemy status then enemy acts
  var stunned=tickStatus('E');
  after(0.5,function(){ if(B.hp<=0){victory();return;} if(stunned){ B.msg=B.name+' is stunned!'; after(0.8,backToMenu); } else enemyTurn(); });
}
function enemyTurn(){ B.phase='enemy'; clearEv(); B.msg=B.name+' attacks!';
  after(0.2,function(){ B.eneX=70; });
  after(0.4,function(){ var def=player.def*(hasStatus(B.statusH,'shield')?1.8:1); if(hasStatus(B.statusH,'weaken'))def*=0.7;
    var d=dmgCalc(B.atk, def, 0.2); if(player.invuln>0)d=0;
    player.hp=clamp(player.hp-d,0,player.hpMax); B.flashH=0.3; doShake(8,0.28); haptic('heavy');
    floatText2(heroScreenX(),groundY()-90,'-'+d,'#ff6b6b'); emit2(heroScreenX(),groundY()-70,12,'#ff6b6b');
    // chance status
    if(B.kind==='demon3'&&Math.random()<0.35){ addStatus(B.statusH,'bleed',3,5); floatText2(heroScreenX(),groundY()-120,'BLEED','#ff6b6b'); showFxOn('H','bleed',0.6); }
    if(B.kind==='demon5'&&Math.random()<0.3){ addStatus(B.statusH,'weaken',3,0); floatText2(heroScreenX(),groundY()-120,'WEAKEN','#c9a6e0'); showFxOn('H','weaken',0.6); }
  });
  after(0.6,function(){ B.eneX=0; });
  after(0.95,function(){ if(player.hp<=0){ defeat(); return; } var st=tickStatus('H'); after(st?0.6:0.0, function(){ if(player.hp<=0){defeat();return;} backToMenu(); }); });
}
function backToMenu(){ clearEv(); B.phase='menu'; B.menu='root'; B.cursor=0; B.msg='What will you do?'; }
function victory(){ B.phase='victory'; B.over=true; clearEv(); heroPose('idle');
  player.gold+=B.gold; player.xp+=B.xp; B.msg='Victory!  +'+B.xp+' XP, +'+B.gold+' gold';
  emit2(eneScreenX(),groundY()-60,30,'#ffd27a'); haptic('medium');
  var lvup=false; while(player.xp>=player.xpNext){ player.xp-=player.xpNext; player.level++; player.xpNext=Math.round(player.xpNext*1.5);
    player.hpMax+=14; player.mpMax+=4; player.atk+=3; player.def+=1; player.hp=player.hpMax; player.mp=player.mpMax; lvup=true; }
  after(1.6,function(){ if(lvup){ B.msg='Level up!  Now Lv.'+player.level; after(0,function(){}); }
    after(lvup?1.4:0, function(){ state='overworld'; player.invuln=1.0; save(); }); });
}
function defeat(){ B.phase='defeat'; B.over=true; clearEv(); heroPose('faint'); B.msg='You have fallen...';
  after(1.8,function(){ gameOver('You were slain by '+B.name+'.'); });
}

/* ---------- Battle: input + update ---------- */
var ROOT=['Fight','Skill','Item','Flee'];
function battleInput(){
  if(B.phase!=='menu')return;
  var list = B.menu==='root'?ROOT : (B.menu==='skill'?SKILLS : ITEMS);
  // navigation (edge-triggered via simple repeat guard)
  if(navEdge('up')) { B.cursor=(B.cursor+list.length-1)%list.length; haptic('sel'); }
  if(navEdge('down')) { B.cursor=(B.cursor+1)%list.length; haptic('sel'); }
  if(pressed.a){ pressed.a=false;
    if(B.menu==='root'){ B.sub=0;
      if(B.cursor===0) heroAttack();
      else if(B.cursor===1){ B.menu='skill'; B.cursor=0; }
      else if(B.cursor===2){ B.menu='item'; B.cursor=0; }
      else heroFlee();
    } else if(B.menu==='skill'){ heroSkill(B.cursor); }
    else if(B.menu==='item'){ heroItem(B.cursor); }
  }
  if(pressed.b){ pressed.b=false; if(B.menu!=='root'){ B.menu='root'; B.cursor=0; haptic('light'); } }
}
var navHold={up:0,down:0};
function navEdge(k){ if(keys[k]){ if(navHold[k]<=0){ navHold[k]=0.18; return true; } navHold[k]-=1/60; } else navHold[k]=0; return false; }

function battleUpdate(dt){
  B.bgT+=dt; bclock+=dt;
  // run due events in time order
  evq.sort(function(a,b){return a.at-b.at;});
  while(evq.length && evq[0].at<=bclock){ var ev=evq.shift(); ev.fn(); }
  // hero frame anim
  var def=HERO[B.heroAnim]; B.heroT+=dt; if(B.heroT>=1/def.fps){ B.heroT=0; B.heroFrame=(B.heroFrame+1)% (B.heroAnim==='faint'?def.frames:def.frames); if(B.heroAnim==='faint'&&B.heroFrame===def.frames-1){/*hold*/} }
  if(B.flashE>0)B.flashE-=dt; if(B.flashH>0)B.flashH-=dt; if(B.fxT>0)B.fxT-=dt;
  if(player.invuln>0)player.invuln-=dt;
  updPP(dt); updFloats(dt);
  battleInput();
}

/* ---------- Battle: render ---------- */
function battleDraw(sh){
  var gy=groundY();
  // sky (dusk gradient)
  var sky=ctx.createLinearGradient(0,0,0,gy); sky.addColorStop(0,'#2a2140'); sky.addColorStop(0.6,'#5a3a4e'); sky.addColorStop(1,'#8a5a44');
  ctx.fillStyle=sky; ctx.fillRect(0,0,VW,gy);
  // sun/moon
  ctx.fillStyle='rgba(255,214,150,.55)'; ctx.beginPath(); ctx.arc(VW*0.75,gy*0.4,42,0,6.283); ctx.fill();
  // parallax hills (two layers, subtle drift)
  function hills(baseY,col,amp,ph){ ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,gy);
    for(var x=0;x<=VW;x+=24){ ctx.lineTo(x, baseY + Math.sin((x*0.01)+ph)*amp); } ctx.lineTo(VW,gy); ctx.closePath(); ctx.fill(); }
  hills(gy-70,'#3b2b45',26, B.bgT*0.1);
  hills(gy-36,'#2c2236',20, B.bgT*0.18+2);
  // ground plane with perspective lines (pseudo-3D)
  var gnd=ctx.createLinearGradient(0,gy,0,VH); gnd.addColorStop(0,'#4a3a28'); gnd.addColorStop(1,'#241a12');
  ctx.fillStyle=gnd; ctx.fillRect(0,gy,VW,VH-gy);
  ctx.strokeStyle='rgba(255,220,170,.07)'; ctx.lineWidth=1;
  for(var i=-6;i<=6;i++){ ctx.beginPath(); ctx.moveTo(VW/2+i*30, gy); ctx.lineTo(VW/2+i*220, VH); ctx.stroke(); }
  for(i=1;i<6;i++){ var yy=gy+(VH-gy)*(i/6)*(i/6); ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(VW,yy); ctx.stroke(); }

  // --- combatants (apply shake) ---
  ctx.save(); ctx.translate(sh.x,sh.y);
  var ex=eneScreenX(), hx=heroScreenX();
  drawShadow(ex,gy,ENEMIES[B.kind].fw*0.5*0.5); drawShadow(hx,gy,30);
  // enemy
  if(B.hp>0 || B.phase!=='victory'){
    var ebob=Math.sin(B.bgT*3)*4;
    drawEnemySprite(B.kind, ex, gy-ebob, 0.9, false);
    if(B.flashE>0){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=clamp(B.flashE*2.5,0,0.9); drawEnemySprite(B.kind,ex,gy-ebob,0.9,false); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; }
    if(B.fxE&&B.fxT>0) drawFX(B.fxE, ex, gy-110, 70, B.bgT, clamp(B.fxT,0,1));
  }
  // hero (faces left -> flip)
  drawHero(B.heroAnim, Math.min(B.heroFrame,HERO[B.heroAnim].frames-1), hx, gy, 0.75, true);
  if(B.flashH>0){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=clamp(B.flashH*2.5,0,0.9); drawHero(B.heroAnim,Math.min(B.heroFrame,HERO[B.heroAnim].frames-1),hx,gy,0.75,true); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; }
  if(B.fxH&&B.fxT>0) drawFX(B.fxH, hx, gy-120, 70, B.bgT, clamp(B.fxT,0,1));
  // persistent status icons floating above
  drawStatusIcons(B.statusE, ex, gy-170); drawStatusIcons(B.statusH, hx, gy-185);
  drawPP(0,0); drawFloats(0,0);
  ctx.restore();

  // --- enemy nameplate / HP (top) ---
  ctx.fillStyle='rgba(10,10,20,.6)'; roundRect(VW/2-130,14,260,34,8); ctx.fill();
  ctx.strokeStyle='rgba(224,120,90,.5)'; ctx.stroke();
  ctx.fillStyle='#f3e9d2'; ctx.font='bold 14px Trebuchet MS'; ctx.textAlign='center';
  ctx.fillText(B.name, VW/2, 30); bar(VW/2-110,34,220,8,Math.max(0,B.hp),B.hpMax,'#d2443a');
  ctx.textAlign='left';

  // --- hero stat panel + command window ---
  drawBattleUI();
}
function drawStatusIcons(list,x,y){ var n=list.length; var sx=x-(n-1)*16;
  for(var i=0;i<n;i++){ var key=list[i].key; var mapk={burn:'burn',poison:'poisonbubble',bleed:'bleed',stun:'stun',regen:'regen',weaken:'weaken',shield:'shield',rage:'rage'}[key]||'shield';
    drawFX(mapk, sx+i*32, y, 26, worldTime); } }

/* ---------- Battle UI (command window + message) ---------- */
function drawBattleUI(){
  var bw=VW, bh=132, by=VH-bh-170; if(by<VH*0.5)by=VH*0.52;
  // message box
  ctx.fillStyle='rgba(10,10,20,.72)'; roundRect(10,by,VW-20,34,8); ctx.fill();
  ctx.strokeStyle='rgba(224,163,90,.5)'; ctx.lineWidth=1.5;
  if(!draw9('frame',7,by-3,VW-14,40,16)) ctx.stroke();
  ctx.fillStyle='#f3e9d2'; ctx.font='14px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText(B.msg, VW/2, by+22); ctx.textAlign='left';
  // hero stats (left) + command list (right) only during menu-ish phases
  var py2=by+44;
  ctx.fillStyle='rgba(10,10,20,.72)'; roundRect(10,py2,150,86,8); ctx.fill(); if(!draw9('frame',7,py2-3,156,92,16)) ctx.stroke();
  ctx.fillStyle='#f3e9d2'; ctx.font='bold 13px Trebuchet MS'; ctx.fillText(player.job+' Lv.'+player.level,20,py2+18);
  ctx.font='11px Trebuchet MS'; ctx.fillStyle='#cfc6a8';
  ctx.fillText('HP '+Math.round(player.hp)+'/'+player.hpMax,20,py2+36); bar(20,py2+40,120,6,player.hp,player.hpMax,'#d2443a');
  ctx.fillText('MP '+player.mp+'/'+player.mpMax,20,py2+58); bar(20,py2+62,120,6,player.mp,player.mpMax,'#3f74d6');
  bar(20,py2+76,120,5,player.xp,player.xpNext,'#b06bd6');
  // command window
  if(B.phase==='menu'){
    var list = B.menu==='root'?ROOT:(B.menu==='skill'?SKILLS:ITEMS);
    var cw=VW-180, cx=170, ch=86;
    ctx.fillStyle='rgba(10,10,20,.72)'; roundRect(cx,py2,cw,ch,8); ctx.fill(); if(!draw9('frame',cx-3,py2-3,cw+6,ch+6,16)) ctx.stroke();
    ctx.font='14px Trebuchet MS';
    for(var i=0;i<list.length;i++){ var it=list[i]; var label=B.menu==='root'?it:(it.name+ (B.menu==='skill'?('  '+it.mp+'MP'):('  x'+B.items[i])) );
      var ly=py2+20+i*20;
      if(i===B.cursor){ ctx.fillStyle='rgba(224,163,90,.25)'; roundRect(cx+6,ly-14,cw-12,19,4); ctx.fill(); ctx.fillStyle='#ffd98a'; ctx.fillText('\u25b8',cx+10,ly); }
      ctx.fillStyle=i===B.cursor?'#fff':'#cfc6a8';
      ctx.fillText(label, cx+26, ly);
    }
    // description for skill/item
    if(B.menu!=='root'){ var d=list[B.cursor]&&list[B.cursor].desc; if(d){ ctx.font='10px Trebuchet MS'; ctx.fillStyle='#9c957f'; ctx.fillText(d,cx+26,py2+ch-6);} }
  }
}

/* ---------- Title / Game Over / New game ---------- */
var state='boot', gameOverMsg='', titleT=0, emberT=0;
function newGame(){
  player.level=1;player.xp=0;player.xpNext=30;player.job='Wanderer';
  player.hp=100;player.hpMax=100;player.mp=20;player.mpMax=20;player.atk=12;player.def=5;
  player.gold=0;player.hunger=100;player.energy=100;player.invuln=1.0;
  genMap(); state='overworld'; try{localStorage.removeItem(SAVE_KEY);}catch(e){}
}
function continueGame(){ loadSave(); genMap(); state='overworld'; }
function gameOver(msg){ gameOverMsg=msg; state='gameover'; try{localStorage.removeItem(SAVE_KEY);}catch(e){} haptic('heavy'); }

function titleUpdate(dt){ titleT+=dt; emberT+=dt;
  if(emberT>0.05){ emberT=0; emit(rand(VW*0.2,VW*0.8), VH*0.46, 1, {col:choice(['#ffcf6b','#ff8a3c','#ffe3a0']),sp0:10,sp1:40,ang:-1.57,g:-40,l0:1.0,l1:1.8,r0:1.5,r1:3}); }
  updPP(dt);
  if(consume('a')) newGame();
  if(consume('b') && hasSave()) continueGame();
}
function titleDraw(){
  var g=ctx.createLinearGradient(0,0,0,VH); g.addColorStop(0,'#1a1327'); g.addColorStop(1,'#060509');
  ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  drawPP(0,0);
  ctx.textAlign='center';
  ctx.font='bold 64px Trebuchet MS'; var ty=VH*0.4;
  ctx.fillStyle='#1a0f08'; ctx.fillText('TRIBES',VW/2+3,ty+3);
  var grd=ctx.createLinearGradient(0,ty-50,0,ty+10); grd.addColorStop(0,'#ffe3a0'); grd.addColorStop(1,'#d2672e');
  ctx.fillStyle=grd; ctx.fillText('TRIBES',VW/2,ty);
  ctx.font='14px Trebuchet MS'; ctx.fillStyle='#c9b071'; ctx.fillText('An Olden Survival Saga',VW/2,ty+30);
  var a=0.5+0.5*Math.sin(titleT*3);
  ctx.globalAlpha=a; ctx.font='bold 18px Trebuchet MS'; ctx.fillStyle='#f3e9d2';
  ctx.fillText('Press  A  —  New Tribe', VW/2, VH*0.66); ctx.globalAlpha=1;
  if(hasSave()){ ctx.fillStyle='#9fd4ff'; ctx.font='15px Trebuchet MS'; ctx.fillText('Press  B  —  Continue', VW/2, VH*0.72); }
  ctx.textAlign='left';
}
function gameoverUpdate(dt){ updPP(dt); if(consume('a')) state='title'; }
function gameoverDraw(){
  ctx.fillStyle='#060509'; ctx.fillRect(0,0,VW,VH);
  ctx.textAlign='center';
  ctx.font='bold 40px Trebuchet MS'; ctx.fillStyle='#d2443a'; ctx.fillText('You Have Fallen',VW/2,VH*0.4);
  ctx.font='15px Trebuchet MS'; ctx.fillStyle='#cfc6a8'; wrapText(gameOverMsg,VW/2,VH*0.47,VW*0.8,20);
  ctx.fillStyle='#f3e9d2'; ctx.font='bold 16px Trebuchet MS'; ctx.fillText('Press  A  —  Return',VW/2,VH*0.6);
  ctx.textAlign='left';
}
function wrapText(txt,x,y,maxw,lh){ var words=txt.split(' '),line='',yy=y;
  for(var i=0;i<words.length;i++){ var t=line+words[i]+' '; if(ctx.measureText(t).width>maxw&&line){ ctx.fillText(line,x,yy); line=words[i]+' '; yy+=lh; } else line=t; } ctx.fillText(line,x,yy); }

/* ---------- Main loop ---------- */
var last=0;
function frame(ts){
  var dt=last?Math.min((ts-last)/1000,0.05):0.016; last=ts;
  worldTime+=dt;
  var sh=shakeOff(dt);
  ctx.clearRect(0,0,VW,VH);
  if(state==='title'){ titleUpdate(dt); titleDraw(); }
  else if(state==='overworld'){ overworldUpdate(dt); overworldDraw(sh); }
  else if(state==='battle'){ battleUpdate(dt); battleDraw(sh); }
  else if(state==='gameover'){ gameoverUpdate(dt); gameoverDraw(); }
  // clear per-frame edge presses not consumed
  pressed.a=false; pressed.b=false;
  requestAnimationFrame(frame);
}

/* ---------- Boot ---------- */
try {
  loadAll(function(){
    var el=document.getElementById('loading');
    if(failed.length && el){ // show what failed, but still start
      el.textContent='Missing '+failed.length+' asset(s): '+failed[0];
      setTimeout(function(){ el.classList.add('hide'); }, 2500);
    } else if(el){ el.classList.add('hide'); }
    state='title';
    requestAnimationFrame(frame);
  });
} catch(err){ setLoadMsg('Boot error: '+((err&&err.message)||err)); }

/*__END__*/
})();
