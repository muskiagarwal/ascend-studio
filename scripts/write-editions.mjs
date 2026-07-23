// Writes a full Ascend edition for every idea that doesn't have one yet.
//
// Runs in GitHub Actions, where ANTHROPIC_API_KEY comes from a repository
// secret. The key never reaches the site: this writes plain-text editions into
// src/data/generated/, which get committed and shipped as static content.
//
//   node scripts/write-editions.mjs           # only ideas with no edition yet
//   node scripts/write-editions.mjs --force   # rewrite everything
//   node scripts/write-editions.mjs --only i-opt,i-linkedin

import Anthropic from '@anthropic-ai/sdk'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { IDEAS } from '../src/data/articles.js'
import { SKILL_SYSTEM, userPrompt } from '../src/data/skillPrompt.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '..', 'src', 'data', 'generated')

const MODEL = 'claude-opus-4-8'
const MAX_TOKENS = 8000
const EFFORT = 'high' // build-time, so buy the quality
const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const ONLY = (args.find((a) => a.startsWith('--only'))?.split('=')[1] ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function targetFor(id) {
  return path.join(OUT_DIR, `${id}.txt`)
}

// Cheap guards against shipping a draft that breaks the house rules.
function lint(text) {
  const problems = []
  if (/[—–]/.test(text)) problems.push('contains an em dash or en dash')
  if (/(^|\n)\s*(#|\*\*|>\s)/.test(text)) problems.push('contains markdown tokens')
  if (!text.includes('Hey, Jugal here')) problems.push('missing the opener ritual')
  const words = text.split(/\s+/).filter(Boolean).length
  if (words < 700) problems.push(`only ${words} words`)
  return problems
}

async function writeOne(client, idea) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: 'adaptive' },
    output_config: { effort: EFFORT },
    system: SKILL_SYSTEM,
    messages: [{ role: 'user', content: userPrompt(idea.brief || idea.title) }],
  })
  const message = await stream.finalMessage()

  if (message.stop_reason === 'refusal') {
    throw new Error('the model declined this topic')
  }
  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
  if (!text) throw new Error('empty response')
  return { text, truncated: message.stop_reason === 'max_tokens' }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      'ANTHROPIC_API_KEY is not set. In GitHub: Settings > Secrets and variables > Actions.'
    )
    process.exit(1)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const client = new Anthropic()

  // Ideas without a hand-written edition are the ones worth generating.
  const queue = IDEAS.filter((i) => !i.articleId).filter((i) =>
    ONLY.length ? ONLY.includes(i.id) : true
  )

  let written = 0
  let skipped = 0
  const failed = []

  for (const idea of queue) {
    const target = targetFor(idea.id)
    if (!FORCE && fs.existsSync(target)) {
      skipped++
      continue
    }
    process.stdout.write(`writing ${idea.id} … `)
    try {
      const { text, truncated } = await writeOne(client, idea)
      const problems = lint(text)
      if (truncated) problems.push('hit the length cap')
      fs.writeFileSync(target, text.endsWith('\n') ? text : `${text}\n`)
      written++
      console.log(
        problems.length ? `ok (check: ${problems.join('; ')})` : 'ok'
      )
    } catch (err) {
      failed.push(idea.id)
      console.log(`FAILED (${err.message})`)
    }
  }

  console.log(
    `\n${written} written, ${skipped} already had one, ${failed.length} failed.`
  )
  // A failed draft shouldn't fail the whole publish — the rest still ship.
  if (failed.length) console.log(`Failed: ${failed.join(', ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
