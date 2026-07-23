import { useState } from 'react'
import { ARTICLES } from '../data/articles.js'
import { illo } from '../lib/assets.js'
import {
  parseInline, toPlainText, wordCount,
  SUBSCRIBE, COMMENT, FOLLOW, SIGNOFF,
} from '../lib/newsletter.js'

function Inline({ text }) {
  return parseInline(text).map((tok, i) =>
    tok.t === 'link' ? (
      <a key={i} href={tok.url} target="_blank" rel="noreferrer">
        {tok.label}
      </a>
    ) : (
      <span key={i}>{tok.v}</span>
    )
  )
}

function Figure({ src, alt }) {
  return (
    <figure className="my-8">
      <div className="sketch group relative overflow-hidden bg-panel p-3">
        <img src={illo(src)} alt={alt} className="w-full" />
        <a
          href={illo(src)}
          download={src}
          className="absolute right-4 top-4 rounded-full border border-hair bg-paper/95 px-3 py-1.5 text-xs font-semibold text-ink opacity-0 shadow-card transition group-hover:opacity-100"
        >
          ↓ PNG
        </a>
      </div>
      <figcaption className="mt-2 text-center text-sm text-ink/50">{alt}</figcaption>
    </figure>
  )
}

function Block({ b }) {
  switch (b.t) {
    case 'opener':
      return (
        <div className="opener mb-6 border-l-2 border-accent/60 pl-4">
          {b.lines.map((l, i) => (
            <p key={i} className="mb-1">
              <Inline text={l} />
            </p>
          ))}
        </div>
      )
    case 'p':
      return (
        <p>
          <Inline text={b.text} />
        </p>
      )
    case 'lead':
      return (
        <p className="lead border-l-2 border-ink/15 pl-4 text-lg">
          <Inline text={b.text} />
        </p>
      )
    case 'h3':
      return <h3>{b.text}</h3>
    case 'beat':
      return (
        <p className="my-4 inline-flex rounded-lg bg-marker/60 px-3 py-2 text-[0.98rem] font-semibold text-ink">
          {b.text}
        </p>
      )
    case 'img':
      return <Figure src={b.src} alt={b.alt} />
    case 'subscribe':
      return (
        <p className="my-6 rounded-xl border border-dashed border-accent/50 bg-accent/5 px-5 py-4 text-center text-[0.98rem] font-medium text-accentink">
          {SUBSCRIBE}
        </p>
      )
    case 'list':
      return (
        <ul className="my-4 space-y-2">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2 text-ink/90">
              <span className="mt-1 text-accent">›</span>
              <span><Inline text={it} /></span>
            </li>
          ))}
        </ul>
      )
    case 'quote':
      return (
        <blockquote className="my-5 whitespace-pre-line rounded-lg border border-hair bg-paper px-5 py-4 font-body text-[0.96rem] italic text-ink/85">
          {b.text}
        </blockquote>
      )
    case 'closer':
      return (
        <div className="mt-8 space-y-4 border-t border-hair pt-6 text-ink/90">
          <p><Inline text={b.forward} /></p>
          <p>{COMMENT}</p>
          <p><Inline text={FOLLOW} /></p>
          <p className="font-hand text-xl leading-tight">
            {SIGNOFF[0]}
            <br />
            {SIGNOFF[1]}
          </p>
        </div>
      )
    case 'disclaimer':
      return (
        <p className="mt-6 text-sm italic text-ink/50">
          <Inline text={b.text} />
        </p>
      )
    default:
      return null
  }
}

export default function ArticleReader({ articleId, onClose }) {
  const article = ARTICLES[articleId]
  const [copied, setCopied] = useState(false)

  if (!article) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(article))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const download = () => {
    const blob = new Blob([toPlainText(article)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ascend-${article.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-ink/40 backdrop-blur-sm reader">
      <div
        className="relative my-6 w-full max-w-3xl bg-paper shadow-lift sm:my-10 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-hair bg-paper/95 px-5 py-3 backdrop-blur sm:rounded-t-2xl">
          <div className="flex items-center gap-2 text-xs text-ink/55">
            <span className="rounded-full border border-hair bg-panel px-2.5 py-1 font-semibold uppercase tracking-wide">
              {article.archetype}
            </span>
            <span className="hidden sm:inline">
              {wordCount(article)} words · ~{article.readMins} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="sketch-soft bg-ink px-3.5 py-2 text-sm font-semibold text-paper transition hover:bg-accentink"
            >
              {copied ? 'Copied ✓' : 'Copy for Substack'}
            </button>
            <button
              onClick={download}
              className="sketch-soft bg-panel px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-ink"
            >
              ↓ .txt
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full border border-hair bg-panel px-3 py-2 text-sm font-bold text-ink/70 transition hover:text-ink"
            >
              ✕
            </button>
          </div>
        </div>

        {/* article */}
        <article className="prose-ascend px-6 py-8 sm:px-10">
          <div className="mb-2 flex flex-wrap gap-2">
            {article.altTitles.map((t) => (
              <span
                key={t}
                className="rounded-full border border-hair bg-panel px-3 py-1 text-xs text-ink/60"
                title="Alternative title Jugal could use"
              >
                alt: {t}
              </span>
            ))}
          </div>
          <h1 className="font-hand text-4xl leading-tight text-ink sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-3 text-lg italic text-ink/60">{article.subtitle}</p>
          <div className="my-6">
            <Figure src={article.hero} alt={`${article.archetype} header illustration`} />
          </div>
          {article.blocks.map((b, i) => (
            <Block key={i} b={b} />
          ))}

          <p className="mt-10 rounded-xl border border-hair bg-panel px-5 py-4 text-sm text-ink/55">
            This is a first draft in Jugal’s voice, ready for a final editor pass.
            Copy it into Substack, upload each illustration at its [IMAGE: …] marker,
            then delete the marker line.
          </p>
        </article>
      </div>
    </div>
  )
}
