const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

async function withServer(run) {
  const server = createApp().listen(0);
  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    await run(`http://127.0.0.1:${server.address().port}/api/v1`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('health endpoint responds with service status', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'tyagiji-learning-api');
    assert.ok(Number.isFinite(Date.parse(body.timestamp)));
    assert.ok(['connected', 'disconnected'].includes(body.database));
  });
});

test('unknown API routes return a JSON 404', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/route-that-does-not-exist`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).message, 'API route not found.');
  });
});

test('auth session check returns an explicit signed-out state for anonymous visitors', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/auth/me`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.authenticated, false);
    assert.equal(body.user, null);
  });
});

test('glossary and cheatsheet endpoints return authored learning content', async () => {
  await withServer(async base => {
    const [glossaryResponse, cheatsheetsResponse] = await Promise.all([
      fetch(`${base}/glossary`), fetch(`${base}/cheatsheets`)
    ]);
    assert.equal(glossaryResponse.status, 200);
    assert.ok((await glossaryResponse.json()).entries.length >= 5);
    assert.equal(cheatsheetsResponse.status, 200);
    assert.ok((await cheatsheetsResponse.json()).cheatsheets.length >= 3);
  });
});


test('malformed JSON returns a client error instead of an internal server error', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not-json'
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, 'Request body contains invalid JSON.');
  });
});
