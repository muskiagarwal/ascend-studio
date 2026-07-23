// Turn the streamed plain-text newsletter into display blocks.
//
// The model returns paste-ready plain text (that is the deliverable), so this
// classifies each line by shape rather than by markup. It runs on partial text
// while streaming, so it must never throw on a half-written line.

import { SUBSCRIBE } from './newsletter.js'

const IMAGE_RE = /^\[IMAGE:/i
const BEAT_RE = /^(Do this today:|Ask yourself:)/i
const SIGNOFF_RE = /^(Until next week,|Until next time,|See you next week\.)$/i
const NAME_RE = /^(Jugal|Jugaldb)$/i
const EMOJI_START_RE = /^(💡|⚠️|🚨|👉|👇|✅|❌|❤️|👋)/u
const URL_RE = /(https?:\/\/[^\s)<>"']+)/g

export function formatDraft(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n')

  let title = ''
  let subtitle = ''
  const blocks = []

  let i = 0
  // first non-empty line is the title, the next is the subtitle
  while (i < lines.length && !lines[i].trim()) i++
  if (i < lines.length) title = lines[i++].trim()
  while (i < lines.length && !lines[i].trim()) i++
  if (i < lines.length) subtitle = lines[i++].trim()

  for (; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    if (IMAGE_RE.test(line)) {
      blocks.push({ t: 'img', text: line.replace(/^\[IMAGE:\s*/i, '').replace(/\]$/, '') })
    } else if (line === SUBSCRIBE) {
      blocks.push({ t: 'subscribe', text: line })
    } else if (BEAT_RE.test(line)) {
      blocks.push({ t: 'beat', text: line })
    } else if (SIGNOFF_RE.test(line) || NAME_RE.test(line)) {
      blocks.push({ t: 'signoff', text: line })
    } else if (line.startsWith('"') && line.endsWith('"') && line.length > 2) {
      blocks.push({ t: 'quote', text: line.slice(1, -1) })
    } else if (isHeading(line)) {
      blocks.push({ t: 'h3', text: line })
    } else {
      blocks.push({ t: 'p', text: line })
    }
  }

  return { title, subtitle, blocks }
}

// Section headers are short, unpunctuated lines that don't start with a
// functional emoji and aren't a sentence.
function isHeading(line) {
  if (line.length > 70) return false
  if (EMOJI_START_RE.test(line)) return false
  if (/[.?!,;:"]$/.test(line)) return false
  if (line.split(/\s+/).length > 10) return false
  return true
}

// Split a line into text and clickable URL segments.
export function linkify(text) {
  const out = []
  let last = 0
  let m
  URL_RE.lastIndex = 0
  while ((m = URL_RE.exec(text)) !== null) {
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) })
    out.push({ t: 'link', v: m[1].replace(/[.,]$/, '') })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) })
  return out
}

export function draftWordCount(text) {
  return String(text || '').split(/\s+/).filter(Boolean).length
}
