'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const old=f=>cp.execFileSync('git',['show','fbd0322:'+f],{encoding:'utf8'}),read=f=>fs.readFileSync(f,'utf8');
const delta="\n/* Release 150: intrinsic group-first wrapping; filename alone may truncate. */\nbody .quick-asset .quick-asset-name-row{align-items:baseline;gap:4px;row-gap:2px;flex-wrap:wrap}\nbody .quick-asset-name-row small{flex:0 0 auto;max-width:100%;white-space:normal;overflow-wrap:anywhere;overflow:visible;text-overflow:clip}\nbody .quick-asset-name-row b{flex:1 1 18px;min-width:0}\n";
assert.equal(read('ui-refresh.css'),old('ui-refresh.css')+delta,'only approved intrinsic CSS');
assert.equal(read('index.html'),old('index.html').replace('ui-refresh.css?v=https-initial-caption-103&amp;revision=clean-ui-release-149','ui-refresh.css?v=https-initial-caption-103&amp;revision=clean-ui-release-150'),'only CSS cache bumped');
for(const f of cp.execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n').filter(f=>!f.startsWith('tests/')&&!['ui-refresh.css','index.html'].includes(f)))assert.equal(read(f),old(f),f+' bytes frozen');
assert(delta.includes('flex:0 0 auto'));assert(delta.includes('flex:1 1 18px'));assert(delta.includes('overflow-wrap:anywhere'));assert(!delta.includes('ellipsis'));
console.log('PASS150 intrinsic complete group, 18px filename wrap threshold, all unrelated production bytes frozen');
