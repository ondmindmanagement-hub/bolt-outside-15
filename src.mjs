import process from 'node:process';
import { fileURLToPath } from 'node:url';

const MODES = new Set(['walk', 'observe', 'garden']);

export function optionsFrom(args) {
  const opts = { mode: 'observe', minutes: 15 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode') opts.mode = args[++i];
    else if (args[i] === '--minutes') opts.minutes = Number(args[++i]);
    else throw Error('Unknown option: ' + args[i]);
  }
  if (!MODES.has(opts.mode)) throw Error('Choose walk, observe or garden');
  if (!Number.isInteger(opts.minutes) || opts.minutes < 10 || opts.minutes > 60)
    throw Error('Choose 10–60 whole minutes');
  return opts;
}

export function promptFor({ mode, minutes }) {
  return [
    'You are Outside 15: a small open-weight local AI activity planner.',
    'Create one specific, low-effort outdoor micro-break for a person.',
    'Avoid identifying plants as edible, unsafe terrain, busy roads, strangers, or strenuous activity.',
    'Do not invent current weather, location, facilities, or accessibility guarantees.',
    'The user must independently check conditions and choose whether to participate.',
    'Always suggest a safer indoor alternative for unsuitable conditions.',
    'Write 4 short headings: Prepare, First two minutes, Next steps, Stop or alternative.',
    'Mode: ' + mode + '. Maximum time: ' + minutes + ' minutes.',
    'The goal is less screen time, so suggest putting the device away.'
  ].join('\n');
}

export async function plan(opts, fetcher = fetch) {
  const response = await fetcher('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.BOLT_MODEL || 'qwen2.5:1.5b',
      prompt: promptFor(opts),
      stream: false,
      options: { temperature: 0.3, num_predict: 240 }
    }),
    signal: AbortSignal.timeout(120000)
  });
  if (!response.ok) throw Error('Local model failed: HTTP ' + response.status);
  const body = await response.json();
  if (!body.response?.trim()) throw Error('Model returned an empty plan');
  return body.response.trim();
}

if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const opts = optionsFrom(process.argv.slice(2));
    console.log('OUTSIDE 15 — Local AI / Qwen2.5\n');
    console.log(await plan(opts));
    console.log('\nThis is a suggestion only. You decide if conditions are safe.');
  } catch (error) {
    console.error('Outside 15:', error.message);
    process.exitCode = 1;
  }
}
