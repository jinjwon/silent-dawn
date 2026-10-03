import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {createWorld,addPlayer,setInput,act,tick,publicState} from './public/world.mjs';
const ROOT=fileURLToPath(new URL('./public/',import.meta.url));
const MIME={'.png':'image/png','.json':'application/json','.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml'};
export async function startServer(port=4177,host='0.0.0.0'){
 const rooms=new Map();const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 function credentials(room,role){const token=randomBytes(24).toString('hex'),id=randomBytes(6).toString('hex');addPlayer(room.world,id,role);room.members.set(token,{id,last:Date.now()});return {code:room.code,token,id};}
 const snapshot=room=>({code:room.code,mode:room.mode,waiting:room.world.players.length<2,paused:room.paused,world:publicState(room.world)});
 const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(url.pathname.startsWith('/api/')){
 if(req.method==='POST'&&req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(res,403,{error:'다른 사이트의 요청은 허용하지 않아요.'});
 let data={};if(req.method==='POST'){let chunks=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>4096)return json(res,413,{error:'입력이 너무 커요.'});chunks.push(chunk);}try{data=JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{return json(res,400,{error:'잘못된 입력이에요.'});}if(!data||typeof data!=='object')return json(res,400,{error:'잘못된 입력이에요.'});}
 if(req.method==='POST'&&url.pathname==='/api/rooms'){if(rooms.size>=120)return json(res,503,{error:'잠시 후 다시 시도해 주세요.'});let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));let room={code,mode:data.mode==='coop'?'coop':'solo',world:createWorld(),members:new Map(),streams:new Set(),last:Date.now(),paused:false};rooms.set(code,room);let session=credentials(room,'wanderer');if(room.mode==='solo')addPlayer(room.world,'companion','seria',true);return json(res,200,session);}
 const code=String(data.code||url.searchParams.get('code')||'').trim().toUpperCase(),room=rooms.get(code);if(!room)return json(res,404,{error:'방을 찾을 수 없어요. 코드를 다시 확인해 주세요.'});
 if(req.method==='POST'&&url.pathname==='/api/join'){if(room.world.players.length>=2)return json(res,409,{error:'이미 두 명이 함께하고 있는 방이에요.'});room.last=Date.now();return json(res,200,credentials(room,'seria'));}
 const token=data.token||url.searchParams.get('token'),member=room.members.get(token);if(!member)return json(res,403,{error:'접속 정보가 만료됐어요. 새 방으로 시작해 주세요.'});member.last=Date.now();room.last=Date.now();const player=room.world.players.find(p=>p.id===member.id);player.ai=false;player.connected=true;
 if(req.method==='GET'&&url.pathname==='/api/state')return json(res,200,snapshot(room));
 if(req.method==='GET'&&url.pathname==='/api/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(`data: ${JSON.stringify(snapshot(room))}\n\n`);room.streams.add(res);res.on('close',()=>room.streams.delete(res));return;}
 if(req.method==='POST'&&url.pathname==='/api/input'){if(data.input)setInput(room.world,member.id,data.input);if(data.action==='pause'&&room.mode==='solo')room.paused=true;else if(data.action==='resume')room.paused=false;else if(typeof data.action==='string'&&!room.paused)act(room.world,member.id,data.action);return json(res,200,{ok:true});}
 return json(res,404,{error:'없는 요청이에요.'});
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 let path;try{path=decodeURIComponent(url.pathname);}catch{res.writeHead(400);return res.end();}if(path==='/')path='/index.html';let target=resolve(ROOT,'.'+path);if(!target.startsWith(ROOT)||!MIME[extname(target)]){res.writeHead(404);return res.end();}
 try{let content=await readFile(target);res.writeHead(200,{'Content-Type':MIME[extname(target)],'Cache-Control':target.includes('/assets/')?'public, max-age=86400':'no-cache'});res.end(req.method==='HEAD'?undefined:content);}catch{res.writeHead(404);res.end('Not found');}
 }catch(error){if(!res.headersSent)json(res,500,{error:'요청을 처리하지 못했어요.'});else res.end();}});
 let frames=0;const timer=setInterval(()=>{for(const [code,r]of rooms){if(Date.now()-r.last>30*60*1000){r.streams.forEach(s=>s.end());rooms.delete(code);continue;}for(const m of r.members.values()){let p=r.world.players.find(p=>p.id===m.id);if(Date.now()-m.last>6500){p.connected=false;p.ai=true;}}
 if(!r.paused&&r.world.players.length===2&&[...r.members.values()].some(m=>Date.now()-m.last<6500))tick(r.world,1/30);
 if(frames%2===0){let msg=`data: ${JSON.stringify(snapshot(r))}\n\n`;r.streams.forEach(s=>{if(s.writableLength>100000)s.destroy();else s.write(msg);});}}
 frames++;},1000/30);
 server.shutdown=()=>new Promise(done=>{clearInterval(timer);rooms.forEach(r=>r.streams.forEach(s=>s.end()));server.closeAllConnections();server.close(done);});
 try{await new Promise((ok,no)=>{server.once('error',no);server.listen(port,host,ok);});}catch(error){clearInterval(timer);throw error;}return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const server=await startServer(Number(process.env.PORT)||4177);console.log(`종이 잠든 새벽: http://localhost:${server.address().port}`);process.on('SIGTERM',()=>server.shutdown());process.on('SIGINT',()=>server.shutdown());}
