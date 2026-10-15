// CURRENT: execute today's console.js; never load a historical normalizer.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('console.js','utf8');
assert(!js.includes('silentTokenLogin'));assert(!js.includes("fetch('/api/auth/token'"));assert(!js.includes('tokenLoginForm'));assert(!js.includes('retry-auth'));
const login=js.slice(js.indexOf('function loginView()'),js.indexOf('const collatorC'));
for(const enabled of [false,true])for(const error of ['', 'forbidden','oauth_denied','oauth_state','logged_out','unknown']){
 const c={S:{oauthEnabled:enabled},location:{search:error?'?auth_error='+error:''},URLSearchParams,escC:String};
 vm.createContext(c);vm.runInContext(login,c);const html=c.loginView();
 assert.equal(html.includes('href="/api/auth/github"'),enabled);assert(html.includes('data-action="oauth-login"'));assert(!/Token|PAT|rememberToken|tokenLoginForm/.test(html));
 assert.equal(html.includes('auth-login-message'),false);assert(html.includes('登录控制台'));
}
const c={S:{auth:{login:'fixture-user'},repo:{owner:'fixture-user',repo:'images',branch:'main',assetsPath:'assets'},connected:true},compatibleRepos:()=>[],escC:String};
vm.createContext(c);vm.runInContext(js.slice(js.indexOf('function settingsPage()'),js.indexOf('async function loadAdminPolicy()')),c);
const settings=c.settingsPage();assert(settings.includes('GitHub OAuth'));assert(!/Token|PAT|记住|经典/.test(settings));for(const value of ['fixture-user/images','main','assets'])assert(settings.includes(value));
const store=new Map([['gh-image-remembered-token','fixture-credential'],['gh-image-repo','keep']]);
const clear={localStorage:{removeItem:key=>store.delete(key)}};vm.createContext(clear);vm.runInContext(js.slice(js.indexOf('function clearLegacyCredentialC'),js.indexOf('function finePointerC')),clear);
assert(!store.has('gh-image-remembered-token'));assert.equal(store.get('gh-image-repo'),'keep');
const admin={S:{adminConfigured:true,isAdmin:true,allowAll:false,allowedUsers:['existing-user']},escC:String};vm.createContext(admin);vm.runInContext(js.slice(js.indexOf('function adminPage()'),js.indexOf('function renderC()')),admin);
assert(admin.adminPage().includes('不是昵称或邮箱'));assert(!admin.adminPage().includes('或 Token'));assert(admin.adminPage().includes('existing-user'));
console.log('PASS CURRENT OAuth-only login enabled/disabled/errors, no Token fallback/retry/persistence, legacy credential deletion preserves repository, settings identity and admin whitelist copy');
