'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const base=f=>cp.execFileSync('git',['show','5c39725:'+f],{encoding:'utf8'}),read=f=>fs.readFileSync(f,'utf8');
const suffix='\n/* Release 160: match Assets\' resting selection stroke without changing either shape.\n   Keyboard JSON focus keeps its existing distinct inset ring. */\nbody .json-reference-row.selected:not(:focus-visible){outline:2px solid var(--ui-line-focus);outline-offset:0;box-shadow:0 0 0 2px var(--ui-selection-shadow)}\n/* Selected sidebar only: retain gradient, white ink, hit area and keyboard outline. */\nbody .sidebar .nav-item.active,body.dark .sidebar .nav-item.active{box-shadow:none!important;filter:none!important;color:#fff!important}\n';
function frameContract(css){assert.equal(css,base('ui-refresh.css')+suffix);assert(css.includes('selected:not(:focus-visible){outline:2px solid var(--ui-line-focus);outline-offset:0;box-shadow:0 0 0 2px var(--ui-selection-shadow)}'));}
frameContract(read('ui-refresh.css'));
for(const [from,to] of [['outline:2px solid','outline:1px solid'],['outline-offset:0','outline-offset:2px'],['box-shadow:0 0 0 2px var(--ui-selection-shadow)}\n/* Selected','box-shadow:none}\n/* Selected'],['.selected:not(:focus-visible){outline','.selected{outline']])assert.throws(()=>frameContract(read('ui-refresh.css').replace(from,to)),'mutation rejected '+from);
assert.equal(read('console.js'),base('console.js').replace('fill="#6562dc"','fill="#6671fc"'));
assert.equal(read('index.html'),base('index.html').replace('fill="#6562dc"','fill="#6671fc"').replaceAll('brand-1','brand-160').replace('clean-ui-release-159','clean-ui-release-160').replace('clean-ui-release-151','clean-ui-release-160'));
assert.equal(read('icons/purplebrand.svg'),base('icons/purplebrand.svg').replace('#6562dc','#6671fc'));
assert.equal(read('icons/favicon.svg'),base('icons/favicon.svg').replace('#5965f2','#6671fc').replace('#7462dc','#6671fc'));
assert.equal(read('icons/build_icons.py'),base('icons/build_icons.py').replace('(89, 101, 242), (116, 98, 220)','(102, 113, 252), (102, 113, 252)'));
const allowed=['console.js','index.html','ui-refresh.css','icons/purplebrand.svg','icons/favicon.svg','icons/build_icons.py','icons/apple-touch-icon.png','icons/favicon-16.png','icons/favicon-32.png','icons/favicon-48.png','icons/favicon-64.png','icons/favicon.ico','icons/icon-192.png','icons/icon-512.png'];
for(const f of cp.execFileSync('git',['ls-tree','-r','--name-only','5c39725'],{encoding:'utf8'}).trim().split('\n').filter(f=>!f.startsWith('tests/')&&!allowed.includes(f)))assert.deepEqual(fs.readFileSync(f),cp.execFileSync('git',['show','5c39725:'+f]),f+' frozen outside exact scope');
console.log('PASS160 exact selection-outline, selected-sidebar shadow, three brand placements; four selection mutations rejected; remaining production bytes frozen');
