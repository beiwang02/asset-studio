const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('console.js','utf8');
const store=new Map();
const localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))};
const initial=source.slice(0,source.indexOf('const $c'));
const selection=source.match(/if\(action==='use-repo'\)\{[^\n]+/)[0];
const bootStart=source.indexOf('let bootAuthFlight=null;');
const boot=source.slice(bootStart,source.indexOf("document.addEventListener('click'",bootStart));
function context(){const c=vm.createContext({localStorage,Set});vm.runInContext(initial+';globalThis.state=S;',c);return c;}
(async()=>{
 for(const config of [
  {owner:'fixture',repo:'pictures',branch:'feature',assetsPath:'images/custom'},
  {owner:'other-owner',repo:'other-repo'},
 ]){
  const first=context();let renders=0;
  Object.assign(first,{action:'use-repo',target:{dataset:config},renderC:()=>renders++});
  vm.runInContext('(function(){'+selection+'})()',first);
  const expected={owner:config.owner,repo:config.repo,branch:config.branch||'main',assetsPath:config.assetsPath||'assets'};
  assert.deepEqual(JSON.parse(store.get('gh-image-repo')),expected);assert.equal(renders,1);
  // New JS context models a closed/reopened page; only durable storage is shared.
  const reopened=context();assert.deepEqual(JSON.parse(JSON.stringify(reopened.state.repo)),expected);
  let reads=0,scans=0;
  Object.assign(reopened,{location:{protocol:'https:'},window:{addEventListener(){}},fetch:async()=>({ok:true,json:async()=>({user:{login:'fixture'},csrf:'fresh'})}),loadAdminPolicy:async()=>{},renderC(){},sessionStorage:{getItem:()=>null},notify(){},refreshRepositoryChoicesC(){},autoSelectRepository:async()=>scans++,readRepo:async form=>{reads++;for(const [key,value] of Object.entries(expected))assert.equal(form.elements[key].value,value);reopened.state.connected=true;}});
  vm.runInContext(boot,reopened);await reopened.bootAuth();
  assert.equal(reads,1);assert.equal(scans,0);assert.equal(reopened.state.connected,true);
 }
 console.log('PASS repo quick selection persists immediately; fresh page restores latest repo/owner/branch/path and boot reads it without reselection');
})().catch(e=>{console.error(e);process.exitCode=1});
