const assert = require('node:assert');
const {spawn} = require('node:child_process');
const {once} = require('node:events');
const {join} = require('node:path');
const net = require('node:net');
(async () => {
  const listener = net.createServer().listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  const app = spawn(process.execPath, [join(__dirname, '../server.mjs')], {env:{...process.env, HOST:'127.0.0.1', PORT:String(port), POLICY_FILE:join(__dirname, 'missing-oauth-test-policy.json'), GITHUB_CLIENT_ID:'test-client', GITHUB_CLIENT_SECRET:'test-secret', PUBLIC_BASE_URL:'https://old.example', GITHUB_OAUTH_REDIRECT_URI:'https://old.example/api/auth/github/callback'}, stdio:['ignore','pipe','inherit']});
  try {
    await Promise.race([once(app.stdout, 'data'),once(app,'exit').then(() => {throw Error('app exited');})]);
    const get = (path, headers={}) => fetch(`http://127.0.0.1:${port}${path}`,{headers,redirect:'manual'});
    const start = await get('/api/auth/github', {'X-Forwarded-Host':'untrusted.example','X-Forwarded-Proto':'http'});
    assert.equal(start.status,302);
    const authorization = new URL(start.headers.get('location'));
    assert.equal(authorization.origin,'https://github.com');
    assert.equal(authorization.searchParams.get('client_id'),'test-client');
    assert.equal(authorization.searchParams.has('redirect_uri'),false);
    const cookie = start.headers.get('set-cookie');
    assert.match(cookie,/; HttpOnly; SameSite=Lax; Max-Age=600; Secure$/);
    const state = authorization.searchParams.get('state');
    assert.match(state,/^[a-f0-9]{64}$/);
    const denied = await get(`/api/auth/github/callback?state=${state}&error=access_denied`,{cookie:cookie.split(';')[0]});
    assert.equal(denied.headers.get('location'),'/?auth_error=oauth_denied');
    const replay = await get(`/api/auth/github/callback?state=${state}&error=access_denied`,{cookie:cookie.split(';')[0]});
    assert.equal(replay.headers.get('location'),'/?auth_error=oauth_state');
    console.log('OAuth default callback, Secure cookie, state replay and relative redirects OK');
  } finally { app.kill(); }
})().catch(e => {console.error(e);process.exitCode=1;});
