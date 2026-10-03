import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
const base=new URL('../public/assets/art-v2/',import.meta.url);await mkdir(base,{recursive:true});
const source=name=>new URL(`source/${name}.png`,base);
const out=name=>new URL(name,base);
const manifest={version:2,tool:'sharp',assets:{}};
async function build(name,input,box,width,height,fit='contain'){
 let raw=await sharp(fileURLToPath(input)).extract(box).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Preserve the cutout, remove only fringe alpha before nearest-neighbor pixel sampling.
 for(let i=3;i<raw.data.length;i+=4)raw.data[i]=raw.data[i]<100?0:255;
 if(name==='chapel.png'){
  const {width:w,height:h}=raw.info,seen=new Uint8Array(w*h);let biggest=[];
  for(let i=0;i<w*h;i++){if(seen[i]||!raw.data[i*4+3])continue;let group=[i];seen[i]=1;for(let at=0;at<group.length;at++){const n=group[at],x=n%w,y=Math.floor(n/w);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*w+xx;if(xx>=0&&xx<w&&yy>=0&&yy<h&&!seen[j]&&raw.data[j*4+3]){seen[j]=1;group.push(j);}}}if(group.length>biggest.length)biggest=group;}
  const keep=new Set(biggest);for(let i=0;i<w*h;i++)if(!keep.has(i))raw.data[i*4+3]=0;
 }
 const cropped=await sharp(raw.data,{raw:{width:raw.info.width,height:raw.info.height,channels:4}}).trim({threshold:1}).png().toBuffer();
 await sharp(cropped).resize(width,height,{fit,kernel:sharp.kernel.nearest,position:'bottom',background:{r:0,g:0,b:0,alpha:0}}).png({palette:true,colours:128,dither:0}).toFile(fileURLToPath(out(name)));
 manifest.assets[name]={width,height,source:input.pathname.split('/').at(-1),crop:box};return cropped;
}
const chars=source('characters');
for(const [name,left,top]of [['seria-front',0,0],['seria-back',627,0],['wanderer-front',0,627],['wanderer-back',627,627]]){
 const crop=await build(name+'.png',chars,{left,top,width:627,height:627},64,80);
 if(name.endsWith('front')){let m=await sharp(crop).metadata();await sharp(crop).extract({left:Math.round(m.width*.16),top:0,width:Math.round(m.width*.68),height:Math.round(m.height*.38)}).resize(160,176,{fit:'cover',position:'top',kernel:'nearest'}).png({palette:true,colours:160,dither:0}).toFile(fileURLToPath(out(name.replace('front','portrait')+'.png')));}
}
const env=source('environment');
await build('cottage.png',env,{left:0,top:0,width:454,height:574},144,184);
await build('pine.png',env,{left:454,top:0,width:354,height:631},112,192);
await build('oak.png',env,{left:808,top:0,width:446,height:633},160,192);
await build('chapel.png',env,{left:0,top:574,width:452,height:663},192,280);
await build('well.png',env,{left:454,top:724,width:343,height:504},96,124);
await build('market.png',env,{left:801,top:750,width:453,height:479},160,160);
const support=source('support');
await build('guardian.png',support,{left:0,top:0,width:630,height:670},96,112);
await build('shadowbeast.png',support,{left:630,top:0,width:569,height:662},64,72);
await build('villager-herbalist.png',support,{left:0,top:670,width:599,height:642},48,64);
await build('villager-elder.png',support,{left:599,top:665,width:600,height:647},48,64);
const combat=source('combat');
for(const [role,top,height] of [['wanderer',0,436],['seria',436,451]]){
 const columns=role==='wanderer'?[[0,425],[425,559],[984,345],[1329,445]]:[[0,430],[430,514],[944,376],[1320,454]];
 for(const [i,pose] of ['windup','slash',role==='seria'?'cast':'heavy','dodge'].entries()){
  const [left,width]=columns[i];
  await build(`${role}-${pose}.png`,combat,{left,top,width,height},96,80);
 }
}
await writeFile(out('manifest.json'),JSON.stringify(manifest,null,2));
await copyFile(new URL('../node_modules/sharp/LICENSE',import.meta.url),out('Sharp-LICENSE.txt'));
console.log('Built 24 pixel assets and crop manifest with Sharp.');
