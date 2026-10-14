'use strict';
const fs=require('./snapshot.cjs').at('5c39725'),cp=require('node:child_process'),assert=require('node:assert/strict');
const base=f=>cp.execFileSync('git',['show','b4531f6:'+f],{encoding:'utf8'}),read=f=>fs.readFileSync(f,'utf8');
assert.equal(read('ui-refresh.css'),base('ui-refresh.css')+"\n/* Release 159: recent overview only; horizontal gap and edge-aligned names. */\n@media(max-width:700px){body .quick-assets-grid{column-gap:9px}}\nbody .quick-asset .quick-asset-name-row{padding-inline:0}\n");
assert.equal(read('index.html'),base('index.html').replace('clean-ui-release-158','clean-ui-release-159'));
for(const f of cp.execFileSync('git',['ls-tree','-r','--name-only','b4531f6'],{encoding:'utf8'}).trim().split('\n').filter(f=>!f.startsWith('tests/')&&!['ui-refresh.css','index.html'].includes(f)))assert.equal(read(f),base(f),f+' frozen');
console.log('PASS159 exact two recent-only rules, original row gap and Assets/JSON/checkbox/fonts/render handlers frozen');
