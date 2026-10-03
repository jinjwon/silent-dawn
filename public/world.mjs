import {STORY} from './story.mjs';
export const WIDTH=768,HEIGHT=960;
export const BLOCKS=[{x:76,y:448,w:130,h:115},{x:546,y:348,w:140,h:104},{x:72,y:242,w:122,h:88},{x:548,y:655,w:128,h:100},{x:296,y:80,w:176,h:154}];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const enemy=(id,x,y)=>({id,x,y,hp:64,maxHp:64,cool:1+id*.22,wind:0,tx:0,ty:0,hit:0});
function enemies(){return [enemy(1,266,672),enemy(2,430,648),enemy(3,550,544),enemy(4,482,470),enemy(5,276,400),enemy(6,354,332)];}
export function createWorld(){return {time:0,phase:'explore',checkpoint:'explore',scene:'intro',line:0,ready:[],players:[],enemies:enemies(),villagers:[{id:1,x:158,y:650,saved:false},{id:2,x:618,y:538,saved:false},{id:3,x:218,y:390,saved:false}],seal:0,resonance:0,resonanceAt:-10,effects:[],serial:0,kills:0,elapsed:0};}
export function addPlayer(w,id,role='wanderer',ai=false){if(w.players.length>=2)return null;let p={id,role,name:role==='seria'?'세리아':'방랑자',x:role==='seria'?420:370,y:828,hp:100,maxHp:100,attack:0,skill:0,dash:0,invuln:0,shield:0,facing:0,anim:0,combo:0,lastAttack:-10,motion:null,pending:null,input:{x:0,y:0},inputAt:0,ai,connected:true};w.players.push(p);return p;}
export function setInput(w,id,input={}){const p=w.players.find(p=>p.id===id);if(!p)return;let x=Number(input.x),y=Number(input.y);x=Number.isFinite(x)?clamp(x,-1,1):0;y=Number.isFinite(y)?clamp(y,-1,1):0;let n=Math.max(1,Math.hypot(x,y));p.input={x:x/n,y:y/n};p.inputAt=w.time;}
function effect(w,type,x,y,text=''){w.effects.push({id:++w.serial,type,x,y,text,ttl:type==='slash'?.25:1});}
function scene(w,name){w.scene=name;w.line=0;w.ready=[];w.players.forEach(p=>{p.input={x:0,y:0};p.pending=null;p.motion=null;});}
function canMove(x,y){return x>=28&&x<=WIDTH-28&&y>=178&&y<=HEIGHT-32&&!BLOCKS.some(b=>x>b.x-10&&x<b.x+b.w+10&&y>b.y-5&&y<b.y+b.h+7);}
function clearPath(a,b){const d=dist(a,b),n=Math.ceil(d/6);for(let i=1;i<=n;i++)if(!canMove(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n))return false;return true;}
function waypoint(p,target){if(clearPath(p,target))return target;const points=[p,target];for(const b of BLOCKS)for(const x of [b.x-15,b.x+b.w+15])for(const y of [b.y-12,b.y+b.h+14])if(canMove(x,y))points.push({x,y});const costs=points.map(()=>Infinity),prev=points.map(()=>-1),seen=new Set();costs[0]=0;for(let step=0;step<points.length;step++){let i=-1;for(let j=0;j<points.length;j++)if(!seen.has(j)&&(i<0||costs[j]<costs[i]))i=j;if(i<0||!Number.isFinite(costs[i]))break;if(i===1)break;seen.add(i);for(let j=0;j<points.length;j++){if(!seen.has(j)&&clearPath(points[i],points[j])){let cost=costs[i]+dist(points[i],points[j]);if(cost<costs[j]){costs[j]=cost;prev[j]=i;}}}}let at=1;if(prev[at]<0)return target;while(prev[at]>0)at=prev[at];return points[at];}
function move(p,dx,dy){if(canMove(p.x+dx,p.y))p.x+=dx;if(canMove(p.x,p.y+dy))p.y+=dy;}
function damage(w,p,n){if(p.hp<=0||p.invuln>0)return;const guarded=p.shield>0||w.players.some(a=>a.role==='seria'&&a.shield>0&&a.hp>0&&dist(a,p)<115);n=guarded?Math.ceil(n*.25):n;p.hp=Math.max(0,p.hp-n);p.invuln=.5;effect(w,'damage',p.x,p.y-25,`−${n}`);}
function hit(w,p,range,n,link=true){
 const targets=w.enemies.filter(e=>e.hp>0&&dist(p,e)<range);
 for(const e of targets){
  if(link){if(e.lastHero&&e.lastHero!==p.id&&w.time-e.lastHit<1.4&&w.time-w.resonanceAt>.35){w.resonance=Math.min(100,w.resonance+25);w.resonanceAt=w.time;effect(w,'link',e.x,e.y-40,w.resonance===100?'공명 준비':'연계 +25');}e.lastHero=p.id;e.lastHit=w.time;}
  e.hp=Math.max(0,e.hp-n);e.hit=.18;effect(w,'hit',e.x,e.y-25,String(n));if(e.hp===0)w.kills++;
 }
 effect(w,'slash',p.x,p.y);p.anim=.25;
}
function motion(w,p,kind,duration){const foe=w.enemies.filter(e=>e.hp>0&&dist(p,e)<150).sort((a,b)=>dist(p,a)-dist(p,b))[0];if(foe&&kind!=='dash')p.facing=Math.atan2(foe.x-p.x,foe.y-p.y);p.motion={kind,start:w.time,duration,combo:p.combo,facing:p.facing};}
export function act(w,id,action){const p=w.players.find(p=>p.id===id);if(!p)return false;
 if(action==='next'&&w.scene){if(!w.ready.includes(id))w.ready.push(id);let humans=w.players.filter(a=>!a.ai&&a.connected);if(humans.every(a=>w.ready.includes(a.id))){w.ready=[];w.line++;if(w.line>=STORY[w.scene].length){let old=w.scene;w.scene=null;w.line=0;if(old==='rescued'){w.phase='seals';w.checkpoint='seals';}if(old==='guardian'){w.phase='boss';w.checkpoint='boss';w.players.forEach((a,i)=>{a.x=345+i*70;a.y=475;a.hp=100;});w.enemies=[{id:100,x:384,y:310,hp:880,maxHp:880,cool:2,wind:0,hit:0,boss:true,cycle:0}];}if(old==='victory')w.phase='ending';}}return true;}
 if(action==='retry'&&w.phase==='defeat'){w.phase=w.checkpoint;w.scene=null;w.resonance=0;w.players.forEach((a,i)=>{a.hp=100;a.x=350+i*60;a.y=w.phase==='boss'?475:828;a.input={x:0,y:0};a.shield=0;a.pending=null;a.motion=null;a.combo=0;a.lastAttack=-10;});if(w.phase==='boss')w.enemies=[{id:100,x:384,y:310,hp:880,maxHp:880,cool:2,wind:0,hit:0,boss:true,cycle:0}];else w.enemies=w.enemies.filter(e=>e.hp>0).map(e=>({...e,hp:e.maxHp,wind:0,cool:2}));return true;}
 if(w.scene||p.hp<=0||['defeat','ending'].includes(w.phase))return false;
 if(action==='attack'&&p.attack<=0&&!p.pending){p.combo=w.time-p.lastAttack<1.05?p.combo%3+1:1;p.lastAttack=w.time;p.attack=p.combo===3?.56:.42;motion(w,p,'attack',p.attack);p.pending={at:w.time+.1,range:p.combo===3?88:72,damage:(p.role==='seria'?20:26)+(p.combo===3?16:0)};return true;}
 if(action==='skill'&&p.skill<=0&&!p.pending){p.skill=7;motion(w,p,'skill',.65);if(p.role==='seria'){p.shield=3.5;w.players.filter(a=>a.hp>0&&dist(a,p)<160).forEach(a=>a.hp=Math.min(100,a.hp+24));effect(w,'heal',p.x,p.y,'성역');}else{p.pending={at:w.time+.18,range:125,damage:65};effect(w,'burst',p.x,p.y,'서광 베기');}if(w.resonance>=100){w.resonance=0;hit(w,p,155,40,false);w.players.filter(a=>a.hp>0&&dist(a,p)<180).forEach(a=>a.hp=Math.min(100,a.hp+10));effect(w,'resonance',p.x,p.y,'두 사람의 서약');}return true;}
 if(action==='dash'&&p.dash<=0){p.dash=2.5;p.invuln=.45;p.pending=null;motion(w,p,'dash',.36);p.motion.from={x:p.x,y:p.y};let {x,y}=p.input;if(Math.hypot(x,y)<.1){x=Math.sin(p.facing);y=Math.cos(p.facing);}for(let i=0;i<12;i++)move(p,x*7,y*7);effect(w,'dash',p.x,p.y);return true;}
 if(action==='interact'){
 const down=w.players.find(a=>a.id!==id&&a.hp<=0&&dist(a,p)<68);if(down){down.hp=45;down.invuln=2;effect(w,'heal',down.x,down.y,'다시 함께');return true;}
 const npc=w.villagers.find(a=>!a.saved&&dist(a,p)<65);if(npc&&w.phase==='explore'&&!w.enemies.some(e=>e.hp>0&&dist(e,npc)<95)){npc.saved=true;w.players.forEach(a=>{if(a.hp>0)a.hp=Math.min(100,a.hp+25);});effect(w,'heal',npc.x,npc.y,'구출 + 회복');if(w.villagers.every(n=>n.saved)){w.enemies=[];scene(w,'rescued');}return true;}
 }return false;
}
function runAI(w,p,dt){const leader=w.players.find(a=>!a.ai&&a.connected)||w.players[0];let target=leader;let foe=w.enemies.find(e=>e.hp>0&&dist(e,p)<150);
 if(w.phase==='seals'){let occupied=dist(leader,{x:288,y:260})<dist(leader,{x:480,y:260});target={x:occupied?480:288,y:260};}
 else if(leader.hp<=0){target=leader;if(dist(p,leader)<64)act(w,p.id,'interact');}
 else if(foe){target=foe;if(dist(p,foe)<70)act(w,p.id,'attack');if(p.skill<=0&&(p.hp<85||leader.hp<85||w.phase==='boss'))act(w,p.id,'skill');}
 let d=dist(p,target),stop=w.phase==='seals'?5:foe?48:42;
 if(d>stop){let next=waypoint(p,target),nd=dist(p,next)||1;let x=(next.x-p.x)/nd,y=(next.y-p.y)/nd;p.input={x,y};move(p,x*105*dt,y*105*dt);p.facing=Math.atan2(x,y);}else p.input={x:0,y:0};
}
export function tick(w,dt){dt=clamp(dt,0,1);w.time+=dt;w.effects.forEach(e=>e.ttl-=dt);w.effects=w.effects.filter(e=>e.ttl>0);
 if(w.scene){const humans=w.players.filter(p=>!p.ai&&p.connected);if(humans.length&&humans.every(p=>w.ready.includes(p.id)))act(w,humans[0].id,'next');return;}if(['ending','defeat'].includes(w.phase))return;w.elapsed+=dt;
 for(const p of w.players){for(const k of ['attack','skill','dash','invuln','shield','anim'])p[k]=Math.max(0,p[k]-dt);if(p.hp<=0){p.pending=null;continue;}if(p.pending&&w.time>=p.pending.at){const strike=p.pending;p.pending=null;hit(w,p,strike.range,strike.damage);}if(p.ai){runAI(w,p,dt);continue;}if(w.time-p.inputAt>.35)p.input={x:0,y:0};const {x,y}=p.input;move(p,x*120*dt,y*120*dt);if(x||y)p.facing=Math.atan2(x,y);}
 if(w.players.length&&w.players.every(p=>p.hp<=0)){w.phase='defeat';return;}
 for(const e of w.enemies){e.hit=Math.max(0,(e.hit||0)-dt);if(e.hp<=0)continue;e.cool-=dt;let target=w.players.filter(p=>p.hp>0).sort((a,b)=>dist(a,e)-dist(b,e))[0];if(!target)continue;
 if(e.wind>0){e.wind-=dt;if(e.wind<=0){for(const p of w.players){if(dist(p,{x:e.tx,y:e.ty})<(e.boss?e.radius:43))damage(w,p,e.boss?30:12);}effect(w,'impact',e.tx,e.ty);e.cool=e.boss?(e.hp<440?1.5:2.2):1.7;}continue;}
 let d=dist(e,target);if(!e.boss&&d>220)continue;if((d<(e.boss?240:55))&&e.cool<=0){e.wind=e.boss?1.1:.7;e.tx=target.x;e.ty=target.y;e.radius=e.boss?(e.hp<440?106:82):43;e.cycle=(e.cycle||0)+1;}
 else if(d>(e.boss?110:38)){let speed=e.boss?30:47;e.x=clamp(e.x+(target.x-e.x)/d*speed*dt,30,738);e.y=clamp(e.y+(target.y-e.y)/d*speed*dt,190,925);}
 }
 if(w.phase==='seals'){let alive=w.players.filter(p=>p.hp>0),left=alive.find(p=>dist(p,{x:288,y:260})<38),right=alive.find(p=>dist(p,{x:480,y:260})<38);w.seal=left&&right&&left.id!==right.id?w.seal+dt:Math.max(0,w.seal-dt);if(w.seal>=1.5)scene(w,'guardian');}
 if(w.phase==='boss'&&w.enemies.every(e=>e.hp<=0))scene(w,'victory');
}
export function publicState(w){return {...w,players:w.players.map(({input,inputAt,token,...p})=>({...p,moving:!!(input.x||input.y)}))};}
