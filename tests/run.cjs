'use strict';
// Execute every manifest contract; helpers are never counted as business passes.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),manifest=require('./suite-manifest.json'),freeze=require('./production-freeze.json');
const args=process.argv.slice(2),outputAt=args.indexOf('--output'),output=outputAt>=0?path.resolve(args[outputAt+1]):null;
assert(args.every((a,i)=>a==='--output'||i===outputAt+1),'Usage: node tests/run.cjs [--output path]');
const entries=manifest.entries,listed=entries.map(e=>e.file).sort(),actual=fs.readdirSync(__dirname).filter(f=>f.endsWith('.cjs')&&f!=='run.cjs').sort();assert.deepEqual(listed,actual,'Every CJS must be explicitly classified');assert.equal(manifest.workers,4);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function protect(){for(const [f,h]of Object.entries(freeze.files))assert.equal(hash(fs.readFileSync(path.join(root,f))),h,'Production frozen relative to '+freeze.baseline+': '+f);}
const env={...process.env};delete env.NODE_OPTIONS;
const result={stage:'running',baseline:freeze.baseline,workers:4,nodeOptions:null,productionFileCount:Object.keys(freeze.files).length,rows:[],syntax:[]};
function save(){if(output)fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');}
function execute(file,syntax=false){return new Promise(resolve=>{
 const start=Date.now(),child=cp.spawn(process.execPath,syntax?['--check',file]:[file],{cwd:root,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='',timedOut=false;
 child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},180000);
 child.on('error',e=>stderr+=String(e));child.on('close',(code,signal)=>{clearTimeout(timer);resolve({file,exit:timedOut?124:code,signal,seconds:(Date.now()-start)/1000,stdout,stderr});});
});}
async function pool(tasks,fn){let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<tasks.length){const task=tasks[next++];await fn(task);}}));}
(async()=>{
 protect();save();
 await pool(entries,async entry=>{const row=await execute('tests/'+entry.file);Object.assign(row,{kind:entry.kind,approvedRevisions:entry.approvedRevisions||[],helperSelfTest:entry.selfTest||false});result.rows.push(row);console.log(`${entry.kind.toUpperCase()} ${row.exit===0?'OK':'FAIL'} ${entry.file}`);save();});
 const files=cp.execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(f=>/\.(?:js|cjs|mjs)$/.test(f));
 await pool(files,async file=>{result.syntax.push(await execute(file,true));save();});
 protect();result.productionHashesUnchanged=true;result.stage='completed';result.counts={};
 for(const kind of ['current','historical','helper']){const rows=result.rows.filter(r=>r.kind===kind);result.counts[kind]={total:rows.length,passed:rows.filter(r=>r.exit===0).length,failed:rows.filter(r=>r.exit!==0).length};}
 result.businessPassed=result.counts.current.passed+result.counts.historical.passed;result.helpersCountedAsBusinessPassed=false;
 result.syntaxCounts={total:result.syntax.length,passed:result.syntax.filter(r=>r.exit===0).length,failed:result.syntax.filter(r=>r.exit!==0).length};save();console.log(JSON.stringify({counts:result.counts,syntax:result.syntaxCounts,productionHashesUnchanged:true},null,2));
 if(result.rows.some(r=>r.exit!==0)||result.syntax.some(r=>r.exit!==0))process.exitCode=1;
})().catch(e=>{result.stage='infrastructure-error';result.error=String(e.stack||e);save();console.error(e);process.exitCode=1;});
