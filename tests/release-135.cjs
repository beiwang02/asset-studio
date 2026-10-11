const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm');
const pairs=require('./release-135-authorized.json'),read=f=>fs.readFileSync(f,'utf8'),old=f=>cp.execFileSync('git',['show','be5a55f:'+f],{encoding:'utf8'});
for(const f of Object.keys(pairs)){let s=read(f);for(const [now,before] of pairs[f]){assert.equal(s.split(now).length-1,1);s=s.replace(now,before);}assert.equal(s,old(f),'Exact authorized login delta only: '+f);}
const js=read('console.js'),block=js.slice(js.indexOf('function loginView()'),js.indexOf('const collatorC'));
for(const enabled of [false,true])for(const problem of ['', 'forbidden','oauth_denied','oauth_state','logged_out','unknown']){
 const html=vm.runInNewContext(block+';loginView()',{S:{oauthEnabled:enabled},URLSearchParams,location:{search:problem?'?auth_error='+problem:''},escC:x=>String(x)});
 assert(html.includes('登录控制台'));assert(html.includes('管理你的图片与 JSON 资源。'));assert(!/Token|预览模式|dialog|disabled/.test(html));assert.equal(html.includes('auth-login-message'),!!problem);assert.equal(html.includes('href="/api/auth/github"'),enabled);assert(html.includes('data-action="oauth-login"'));
}
const css=read('console.css').slice(old('console.css').length);
for(const selector of css.matchAll(/([^{}]+)\{/g)){const s=selector[1].trim();if(s.startsWith('@media'))continue;assert(s.includes('.auth-page'),'Auth-page scoped selector '+s);}
assert(!/(?:^|[;{])\s*filter\s*:|:active|:hover|--[a-z-]+\s*:|(?:^|[ .])\.card\b|(?:^|[ .])\.title\b/.test(css),'No theme state/global/new click effect');
for(const f of ['server.mjs','github.js','popup.js','styles.css','ui-refresh.css','responsive.css','compose.yaml','Dockerfile','.env.example'])assert.equal(read(f),old(f),'Protected source '+f);
for(const f of cp.execFileSync('git',['ls-tree','-r','--name-only','be5a55f','icons'],{encoding:'utf8'}).trim().split('\n'))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),crypto.createHash('sha256').update(cp.execFileSync('git',['show','be5a55f:'+f])).digest('hex'),'Historical icons frozen '+f);
assert.equal(read('console.js').replace(block,''),old('console.js').replace(old('console.js').slice(old('console.js').indexOf('function loginView()'),old('console.js').indexOf('const collatorC')),''),'Internal views/handlers/theme exact bytes');
console.log('PASS release135 exact login-only scope, internal DOM/CSS hashes, errors, OAuth enabled/disabled, original handlers and icons frozen');
