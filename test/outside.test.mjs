import test from 'node:test';
import assert from 'node:assert/strict';
import { optionsFrom, promptFor, plan } from '../src.mjs';

test('uses a small outdoor break by default', () => {
  assert.deepEqual(optionsFrom([]), { mode: 'observe', minutes: 15 });
});

test('rejects invalid or overly long plans', () => {
  assert.throws(() => optionsFrom(['--mode', 'unsafe']), /Choose/);
  assert.throws(() => optionsFrom(['--minutes', '999']), /Choose/);
});

test('requires caution, avoids fabricated conditions', () => {
  const p = promptFor(optionsFrom(['--mode', 'walk']));
  assert.match(p, /Do not invent current weather/);
  assert.match(p, /independently check/);
});

test('uses a real local model endpoint with a mock transport in the test', async () => {
  let endpoint, body;
  const mock = async (url, init) => {
    endpoint = url;
    body = JSON.parse(init.body);
    return { ok: true, json: async () => ({ response: 'Prepare: shoes. First two minutes: open the door.' }) };
  };
  const result = await plan(optionsFrom([]), mock);
  assert.match(endpoint, /^http:\/\/127\.0\.0\.1/);
  assert.equal(body.model, 'qwen2.5:1.5b');
  assert.equal(body.stream, false);
  assert.match(result, /Prepare/);
});

test('fails rather than inventing an AI response', async () => {
  await assert.rejects(plan(optionsFrom([]), async () => ({ ok: false, status: 503 })), /503/);
});
