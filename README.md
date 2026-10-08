# BOLT Outside 15

An experimental **local open-weight AI micro-break planner** for the Hacktoberfest Open-Source AI Challenge Week 1 (October 5–11, 2026), “Touch Grass”.

**Author:** Omar Baró · Unfire · Spain. Started October 8, 2026.

## The problem

When somebody wants to step outside after a long screen session, choosing an activity can itself become another scrolling session. The goal is deliberately tiny: generate one short idea, decide whether conditions are safe, put the screen away.

## How it works

BOLT Outside 15 is a standalone Node.js CLI. It validates a requested mode and time budget, constructs a conservative activity prompt, and sends it to a **locally hosted open-weight Qwen2.5 1.5B model via Ollama** on localhost only. The LLM genuinely generates the suggestion; the app returns an error if that model is unavailable. There is no cloud API key, login, location tracking or database.

```text
CLI mode + duration
       ↓ deterministic validation
Safety-aware prompt
       ↓ localhost (Ollama API)
Qwen2.5 1.5B inference
       ↓
Four-part outdoor micro-plan
       ↓
Human decides; no autonomous action
```

## Run

Prerequisites: Node.js 20+, Ollama, local model `qwen2.5:1.5b`.

```sh
ollama pull qwen2.5:1.5b
ollama serve
node src.mjs
node src.mjs --mode walk --minutes 20
node src.mjs --mode garden --minutes 15
npm test
```

On a system where Ollama is already running, do not start it twice. The model download requires internet; after download inference uses `127.0.0.1:11434` only.

## Verification — October 8

- 5/5 Node.js automated tests passed.
- A separate live call to the installed Qwen2.5 1.5B model produced a structured Prepare / First Two Minutes / Next Steps / Stop or Alternative plan.
- The live example showed model imperfections, including a suggestion to speak to someone, even though the prompt discouraged approaching strangers. **The system does not guarantee that the model obeys every constraint**.

## Responsible use

Not a medical, navigation, accessibility or weather app. Do not follow unsafe suggestions. It has no knowledge of local hazards or actual accessible routes. Human consent is necessary before going outside; there are no tool actions. The model response is **unvalidated free-form text**, so do not depend on it for safety decisions.

## What open source changes

The model can be replaced by another Ollama-served open-weight model through `BOLT_MODEL`. The data stays on the user's machine rather than requiring a hosted model or sending location to a provider. People can inspect, fork and change the prompt and checks. This is not a derivative of the private BOLT application; it is a fresh, bounded public experiment for this challenge.

## Limitations

- CLI, no graphical user interface.
- English responses, quality varies by model and sampling.
- Needs Ollama and a downloaded model.
- Does not measure actual changes in outdoor activity or health.
- No external user adoption or commercial deployment claimed.

MIT license.
