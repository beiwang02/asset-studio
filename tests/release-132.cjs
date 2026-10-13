// This is a historical release snapshot, not a freeze of today's product.
// Use the exact approved cache132 commit; never intercept live fs reads.
const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),path=require('node:path');
const read=fs.readFileSync,normal=require('./release-132-normalize.cjs').normalize;
assert.equal(fs.readFileSync,read,'Historical normalizer must not patch fs');
const root=path.resolve(__dirname,'..');
const historical=(revision,file)=>cp.execFileSync('git',['show',revision+':'+file],{cwd:root,encoding:'utf8'});
// 4885f22 is the final cache132 source, including the approved OAuth-state expiry fix.
const approved='4885f22',baseline='bbbc2df';
for(const f of ['console.js','server.mjs','ui-refresh.css','index.html','.env.example','README.md'])assert.equal(normal(historical(approved,f),f),historical(baseline,f),'Only exact cache132 authorized changes: '+f);
const css=historical(approved,'ui-refresh.css');assert(css.includes('padding-inline:0 4px;gap:4px'));assert(css.includes('order:-1;flex:0 1 auto;max-width:28%'));assert(css.includes('width:36px;height:36px'));assert(css.includes('width:60px;height:60px'));assert(css.includes('min-height:66px'));
assert.throws(()=>normal(css.replace('padding-inline:0 4px;gap:4px','padding-inline:0 4px;gap:5px'),'ui-refresh.css'));console.log('PASS cache132 exact OAuth/doc/resources + recent-only group-first gap/right-padding + square mobile JSON; all other bytes frozen');
