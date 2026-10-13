'use strict';
// Explicit, local snapshot reader. Never assign to node:fs or transform live bytes.
const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function at(revision){
 const commit=cp.execFileSync('git',['rev-parse',revision+'^{commit}'],{cwd:root,encoding:'utf8'}).trim();
 const cache=new Map();
 function readFileSync(file,options){
  const input=file instanceof URL?require('node:url').fileURLToPath(file):String(file);
  const name=path.relative(root,path.resolve(root,input)).split(path.sep).join('/');
  assert(name&&!name.startsWith('../')&&!path.isAbsolute(name),'Snapshot path must stay in repository');
  if(!cache.has(name))cache.set(name,cp.execFileSync('git',['show',commit+':'+name],{cwd:root,maxBuffer:16*1024*1024}));
  const bytes=cache.get(name),encoding=typeof options==='string'?options:options?.encoding;
  return encoding?bytes.toString(encoding):Buffer.from(bytes);
 }
 function existsSync(file){try{readFileSync(file);return true;}catch{return false;}}
 return Object.freeze({...fs,readFileSync,existsSync,promises:Object.freeze({...fs.promises,readFile:async(file,options)=>readFileSync(file,options)}),revision:commit});
}
module.exports={at,root};
