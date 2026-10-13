const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),path=require('node:path');
const original=fs.readFileSync,current=original('console.js','utf8');
for(const file of ['historical-133','historical-134','historical-135','historical-136','historical-137','release-127-normalize','release-128-normalize','release-129-normalize','release-130-normalize','release-131-normalize','release-132-normalize','release-133-normalize'])require('./'+file+'.cjs');
assert.equal(fs.readFileSync,original);assert.equal(fs.readFileSync('console.js','utf8'),current);
const {at,root}=require('./snapshot.cjs'),before=at('c75e7eb'),approved=at('9d611be');
assert.equal(approved.readFileSync('console.js','utf8'),cp.execFileSync('git',['show','9d611be:console.js'],{cwd:root,encoding:'utf8'}));
assert(before.readFileSync('console.js','utf8').includes('tokenLoginForm'));assert(!approved.readFileSync('console.js','utf8').includes('tokenLoginForm'));
assert.throws(()=>before.readFileSync('../outside','utf8'),/Snapshot path/);
const bytes=approved.readFileSync('console.js');bytes[0]^=255;assert.notEqual(bytes[0],approved.readFileSync('console.js')[0]);
const normal=require('./release-133-normalize.cjs').normalize;
assert.equal(normal(approved.readFileSync('console.js','utf8'),'console.js'),before.readFileSync('console.js','utf8'));
const pairs=require('./release-133-authorized.json');for(const file of ['console.js','server.mjs','index.html']){const s=approved.readFileSync(file,'utf8'),literal=pairs[file][0][0];// Exact baseline comparison, not normalization alone, rejects extra bytes.
 assert.notEqual(normal(s+'\n/* unauthorized */',file),before.readFileSync(file,'utf8'));
 assert.throws(()=>normal(s.replace(literal,'/* changed approved literal */'),file));
}
assert.equal(fs.readFileSync,original);assert.equal(fs.readFileSync('console.js','utf8'),current);
console.log('PASS CURRENT fs isolation, exact historical authorization, denied mutation/missing literal, immutable snapshot cache, Token-era and OAuth-only distinction');
