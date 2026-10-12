const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{},TextDecoder,TextEncoder,atob,btoa};vm.createContext(context);vm.runInContext(fs.readFileSync('github.js','utf8'),context);const Client=context.window.GitHubClient;
const rows=n=>Array.from({length:n},(_,i)=>({id:i+1,name:'repo'+i,owner:{login:'fixture'}}));
(async()=>{
for(const n of [0,1,99,100,101,200,201]){const c=new Client({owner:'saved',repo:'saved'}),all=rows(n),calls=[];c.request=async path=>{calls.push(path);assert(path.includes('sort=updated&affiliation=owner,collaborator,organization_member'));const page=Number(new URL('https://fixture'+path).searchParams.get('page'));return all.slice((page-1)*100,page*100)};const [a,b]=await Promise.all([c.listRepos(),c.listRepos()]);assert.equal(a.length,n);assert.equal(a,b);assert.equal(calls.length,Math.floor(n/100)+1);assert.equal(c.config.owner,'saved');assert.equal(c.repoListFlight,null);}
const c=new Client({owner:'saved',repo:'saved'});let calls=0;c.request=async()=>{calls++;return rows(100)};await assert.rejects(c.listRepos(),/分页重复/);assert.equal(calls,2);assert.equal(c.repoListFlight,null);
for(const error of [Error('network'),Object.assign(Error('aborted'),{name:'AbortError'})]){let count=0;c.request=async()=>{if(++count===1)return rows(100);throw error};await assert.rejects(c.listRepos(),e=>e===error);assert.equal(c.repoListFlight,null);c.request=async()=>rows(1);assert.equal((await c.listRepos()).length,1);assert.equal(c.config.owner,'saved');}
c.request=async()=>({message:'unexpected'});await assert.rejects(c.listRepos(),/响应无效/);
const other=new Client({owner:'other'});c.request=async()=>rows(1);other.request=async()=>[{id:999}];const [a,b]=await Promise.all([c.listRepos(),other.listRepos()]);assert.notEqual(a[0].id,b[0].id);
console.log('PASS 0/1/99/100/101/200/201 pagination, empty terminal page, sorting/affiliation, singleflight, failure/abort/retry preserve config, repeated full-page rejection, invalid response, client isolation');
})().catch(e=>{console.error(e);process.exitCode=1});
