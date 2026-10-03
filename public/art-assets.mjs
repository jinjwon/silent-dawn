export const artAssets={};
const names=['seria-front','seria-back','wanderer-front','wanderer-back','seria-portrait','wanderer-portrait','cottage','pine','oak','chapel','well','market','guardian','shadowbeast','villager-herbalist','villager-elder','wanderer-windup','wanderer-slash','wanderer-heavy','wanderer-dodge','seria-windup','seria-slash','seria-cast','seria-dodge'];
export async function loadArtAssets(){const results=await Promise.allSettled(names.map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{artAssets[name]=img;resolve(name);};img.onerror=()=>reject(new Error(`Art unavailable: ${name}`));img.src=`/assets/art-v2/${name}.png?v=3`;})));return results.filter(r=>r.status==='fulfilled').length;}
export function drawHero(c,x,y,role,time,moving,down,scale,facing=0,attacking=false,motion=null,reduced=false){
 const age=motion?time-motion.start:99,active=!down&&age>=0&&age<motion?.duration;
 let pose=Math.cos(facing)<-.25?'back':'front';
 if(active){if(motion.kind==='dash')pose='dodge';else if(motion.kind==='skill')pose=role==='seria'?'cast':age<.18?'windup':'heavy';else pose=age<.10?'windup':motion.combo===3?(role==='seria'?'cast':'heavy'):'slash';}
 const img=artAssets[`${role}-${pose}`];if(!img)return false;
 const width=(active?72:48)*scale/2,height=60*scale/2,bob=moving&&!active&&!reduced?Math.round(Math.sin(time*13)):0;
 c.save();c.translate(Math.round(x),Math.round(y));c.imageSmoothingEnabled=false;
 if(active&&motion.kind==='dash'&&!reduced&&motion.from){for(let i=3;i>0;i--){c.globalAlpha=(1-age/motion.duration)*.14;c.drawImage(img,-width/2+(motion.from.x-x)*i/4,-height+(motion.from.y-y)*i/4,width,height);}c.globalAlpha=1;}
 if(down)c.rotate(Math.PI/2);
 if(active&&Math.sin(motion.facing)<-.1)c.scale(-1,1);
 const lunge=active&&motion.kind==='attack'&&!reduced?Math.sin(Math.min(1,age/.3)*Math.PI)*5:0;
 c.drawImage(img,Math.round(-width/2+lunge),Math.round(-height+bob),Math.round(width),Math.round(height));c.restore();
 if(active&&motion.kind!=='dash'){
  c.save();c.translate(x,y-16);const sanctuary=motion.kind==='skill'&&role==='seria';c.strokeStyle=sanctuary?'#b7f1ec':'#ffe8a8';c.lineWidth=motion.kind==='skill'?4:motion.combo===3?3:2;c.globalAlpha=Math.max(0,1-age/motion.duration);
  if(sanctuary){c.scale(1,.45);c.beginPath();c.arc(0,0,55+(reduced?0:age*45),0,Math.PI*2);c.stroke();c.rotate(age);c.strokeRect(-34,-34,68,68);}
  else if(age>=.1){const angle=Math.PI/2-motion.facing,progress=(age-.1)/(motion.duration-.1),radius=motion.kind==='skill'?76:motion.combo===3?52:38;c.beginPath();c.arc(0,0,radius,angle-1.3+progress,angle+.9+progress);c.stroke();}
  c.restore();
 }
 return true;
}
export function drawPortrait(c,role,w,h){const img=artAssets[`${role}-portrait`];if(!img)return false;c.fillStyle=role==='seria'?'#293b51':'#254842';c.fillRect(0,0,w,h);c.imageSmoothingEnabled=false;c.drawImage(img,0,0,w,h);return true;}
