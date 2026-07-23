// One source of truth for both renderings of an edition:
//  - parseInline(text)  -> tokens the React view maps to <a> links
//  - toPlainText(article) -> the exact paste-ready newsletter.txt (no markdown,
//    links written as "label (url)", images as [IMAGE: file.png])

export const SUBSCRIBE =
  'Thanks for reading Ascend! Subscribe for free to receive new posts and support my work.'
export const COMMENT =
  'What should I break down next? Drop a comment on this post. I read every single one.'
export const FOLLOW =
  'And for the daily version of this, I share job search and AI career content on [[LinkedIn|https://www.linkedin.com/in/jugaldb]] and [[Instagram|https://www.instagram.com/jugaldb]]. Come say hi.'
export const SIGNOFF = ['Until next week,', 'Jugal']

const LINK_RE = /\[\[([^|\]]+)\|([^\]]+)\]\]/g

// -> [{ t:'text', v }, { t:'link', label, url }, ...]
export function parseInline(text) {
  const out = []
  let last = 0
  let m
  LINK_RE.lastIndex = 0
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) })
    out.push({ t: 'link', label: m[1], url: m[2] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) })
  return out
}

// "[[HiringCafe|https://hiring.cafe]]" -> "HiringCafe (https://hiring.cafe)"
export function toPlainInline(text) {
  return text.replace(LINK_RE, (_, label, url) => `${label} (${url})`)
}

function imageMarker(src) {
  return `[IMAGE: ${src}]`
}

// Build the paste-ready plain text for an edition, exactly to the skill's rules.
export function toPlainText(article) {
  const lines = []
  const push = (s = '') => lines.push(s)

  push(article.title)
  push(article.subtitle)
  push()

  for (const b of article.blocks) {
    switch (b.t) {
      case 'opener':
        b.lines.forEach((l) => push(toPlainInline(l)))
        push()
        break
      case 'p':
      case 'lead':
      case 'beat':
        push(toPlainInline(b.text))
        push()
        break
      case 'h3':
        push(toPlainInline(b.text))
        push()
        break
      case 'img':
        push(imageMarker(b.src))
        push()
        break
      case 'subscribe':
        push(SUBSCRIBE)
        push()
        break
      case 'list':
        b.items.forEach((it) => push(toPlainInline(it)))
        push()
        break
      case 'quote':
        // templates and DMs sit in quotation marks on their own lines
        b.text.split('\n').forEach((l) => push(l.length ? `"${toPlainInline(l)}"` : ''))
        push()
        break
      case 'closer':
        push(toPlainInline(b.forward))
        push()
        push(COMMENT)
        push()
        push(toPlainInline(FOLLOW))
        push()
        SIGNOFF.forEach((l) => push(l))
        push()
        break
      case 'disclaimer':
        push(toPlainInline(b.text))
        push()
        break
      default:
        break
    }
  }
  // collapse any accidental triple blank lines
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

export function wordCount(article) {
  return toPlainText(article).split(/\s+/).filter(Boolean).length
}
