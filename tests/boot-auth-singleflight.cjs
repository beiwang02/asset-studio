const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('console.js','utf8');
const start=source.indexOf('let bootAuthFlight=null;'),end=source.indexOf("document.addEventListener('click'",start);
assert(start>=0&&end>start);const code=source.slice(start,end);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
(async()=>{
let gate=deferred(),policy=deferred(),requests=0,reads=0,choices=0,policies=0,renders=0;const events={};
const client={id:'same-client'},S={auth:null,repo:{owner:'fixture',repo:'images',branch:'main',assetsPath:'assets'}};
const context={S,location:{protocol:'https:'},window:{addEventListener:(n,f)=>events[n]=f},fetch:async(url,options)=>{assert.equal(url,'/api/auth/me');assert.equal(options.credentials,'include');requests++;await gate.promise;return {ok:true,json:async()=>({user:{login:'fixture'},csrf:'mock',oauthEnabled:true})}},loadAdminPolicy:async()=>{policies++;await policy.promise},renderC:()=>renders++,sessionStorage:{getItem:()=>null},notify:()=>{},refreshRepositoryChoicesC:()=>{choices++;assert.equal(context.currentClient(),client)},readRepo:async()=>{reads++;assert.equal(context.currentClient(),client)},currentClient:()=>client,autoSelectRepository:async()=>{throw Error('unexpected automatic selection')}};
vm.createContext(context);vm.runInContext(code,context);
const first=context.bootAuth();const second=context.bootAuth();events.online();assert.equal(first,second);assert.equal(requests,1);assert.equal(reads,0);
gate.resolve();await new Promise(setImmediate);assert.equal(policies,1);assert.equal(context.bootAuth(),first);events.online();assert.equal(requests,1);policy.resolve();await first;
assert.equal(reads,1);assert.equal(choices,1);assert.equal(S.auth.login,'fixture');assert(renders>0);
gate=deferred();policy=deferred();const next=context.bootAuth();assert.notEqual(first,next);assert.equal(requests,2);gate.reject(Error('transient'));await next;assert.equal(S.auth.login,'fixture');assert.equal(reads,1);
gate=deferred();const retry=context.bootAuth();gate.resolve();policy.resolve();await retry;assert.equal(requests,3);assert.equal(reads,2);assert.equal(choices,2);
console.log('PASS bootAuth startup/online parallel calls share identical promise, one auth/policy/read/client path; settled retry and transient identity retention');
})().catch(e=>{console.error(e);process.exitCode=1});
