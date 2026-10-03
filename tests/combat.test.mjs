import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,addPlayer,act,tick} from '../public/world.mjs';
function arena(){const w=createWorld();w.scene=null;const a=addPlayer(w,'a'),b=addPlayer(w,'b','seria');b.x=a.x+10;b.y=a.y;w.enemies=[{id:1,x:a.x+25,y:a.y,hp:2000,maxHp:2000,cool:99}];return {w,a,b,e:w.enemies[0]};}
test('strikes land after anticipation, combo finisher deals more, and combo expires',()=>{const {w,a,e}=arena();for(let i=1;i<=3;i++){const before=e.hp;assert.equal(act(w,a.id,'attack'),true);assert.equal(e.hp,before);tick(w,.12);assert.equal(before-e.hp,i===3?42:26);tick(w,.5);}tick(w,1.1);act(w,a.id,'attack');assert.equal(a.combo,1);});
test('dodge cancels an unlanded strike',()=>{const {w,a,e}=arena();act(w,a.id,'attack');act(w,a.id,'dash');tick(w,.2);assert.equal(e.hp,2000);assert.equal(a.motion.kind,'dash');});
test('alternating allies build resonance, solo hits do not, charged skill consumes it',()=>{const {w,a,b}=arena();for(let i=0;i<3;i++){act(w,a.id,'attack');tick(w,.5);}assert.equal(w.resonance,0);for(let i=0;i<4;i++){act(w,(i%2? a:b).id,'attack');tick(w,.6);}assert.equal(w.resonance,100);act(w,a.id,'skill');assert.equal(w.resonance,0);assert.ok(w.effects.some(e=>e.type==='resonance'));});
