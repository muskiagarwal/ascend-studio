// The /api/generate handler, shared by the Vite dev server and `npm run preview`.
//
// This runs in Node on your machine, never in the browser, so the API key stays
// on your side. It reads ANTHROPIC_API_KEY from .env (or your shell) exactly the
// way a normal server project does.

import Anthropic from '@anthropic-ai/sdk'
import { SKILL_SYSTEM, userPrompt } from '../src/data/skillPrompt.js'

const MODEL = 'claude-opus-4-8'
const EFFORT = 'medium' // low | medium | high | xhigh | max
const MAX_TOKENS = 8000

const IDEA_MIN = 4
const IDEA_MAX = 300

function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 10_000) req.destroy()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'))
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export async function handleGenerate(req, res, apiKey) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' })

  if (!apiKey) {
    return json(res, 500, {
      error:
        'No ANTHROPIC_API_KEY found. Copy .env.example to .env, put your key in it, and restart the dev server.',
    })
  }

  const body = await readBody(req)
  const idea = String(body.idea ?? '').trim()
  if (idea.length < IDEA_MIN || idea.length > IDEA_MAX) {
    return json(res, 400, {
      error: `Describe the idea in ${IDEA_MIN} to ${IDEA_MAX} characters.`,
    })
  }

  const client = new Anthropic({ apiKey })

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'adaptive' },
      output_config: { effort: EFFORT },
      system: SKILL_SYSTEM,
      messages: [{ role: 'user', content: userPrompt(idea) }],
    })

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Accel-Buffering', 'no')

    stream.on('text', (chunk) => res.write(chunk))
    const message = await stream.finalMessage()

    if (message.stop_reason === 'refusal') {
      res.write('\n\n[This topic was declined. Try a different angle.]')
    } else if (message.stop_reason === 'max_tokens') {
      res.write('\n\n[Draft hit the length cap and stops here.]')
    }
    res.end()
  } catch (err) {
    const status = err?.status ?? 500
    const msg =
      status === 401
        ? 'That API key was rejected. Check ANTHROPIC_API_KEY in your .env.'
        : status === 429
          ? 'Rate limited. Try again shortly.'
          : `Could not write the draft (${err?.message || 'unknown error'}).`
    if (!res.headersSent) return json(res, status, { error: msg })
    res.write(`\n\n[${msg}]`)
    res.end()
  }
}

// Mounts /api/generate on the Vite dev server and on `npm run preview`.
// The key is read in vite.config.js (via loadEnv) and passed in here.
export function ascendApi(apiKey) {
  const mount = (server) => {
    server.middlewares.use('/api/generate', (req, res) =>
      handleGenerate(req, res, apiKey)
    )
  }
  return {
    name: 'ascend-api',
    configureServer: mount,
    configurePreviewServer: mount,
  }
}
