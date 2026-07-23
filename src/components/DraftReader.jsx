import { useCallback, useEffect, useRef, useState } from 'react'
import { formatDraft, linkify, draftWordCount } from '../lib/draft.js'
import { claudeUrl } from '../data/skillPrompt.js'
import { SUBSCRIBE } from '../lib/newsletter.js'

function Line({ text }) {
  return linkify(text).map((tok, i) =>
    tok.t === 'link' ? (
      <a key={i} href={tok.v} target="_blank" rel="noreferrer">
        {tok.v}
      </a>
    ) : (
      <span key={i}>{tok.v}</span>
    )
  )
}

function Block({ b }) {
  switch (b.t) {
    case 'h3':
      return <h3>{b.text}</h3>
    case 'beat':
      return (
        <p className="my-4 inline-flex rounded-lg bg-marker/60 px-3 py-2 text-[0.98rem] font-semibold text-ink">
          {b.text}
        </p>
      )
    case 'subscribe':
      return (
        <p className="my-6 rounded-xl border border-dashed border-accent/50 bg-accent/5 px-5 py-4 text-center text-[0.98rem] font-medium text-accentink">
          {SUBSCRIBE}
        </p>
      )
    case 'quote':
      return (
        <blockquote className="my-5 whitespace-pre-line rounded-lg border border-hair bg-paper px-5 py-4 text-[0.96rem] italic text-ink/85">
          {b.text}
        </blockquote>
      )
    case 'img':
      return (
        <p className="my-5 flex items-start gap-2 rounded-lg border border-dashed border-hair bg-panel px-4 py-3 text-sm text-ink/55">
          <span aria-hidden>🖼️</span>
          <span>
            <span className="font-semibold text-ink/70">Illustration here: </span>
            {b.text}
          </span>
        </p>
      )
    case 'signoff':
      return <p className="font-hand text-xl leading-tight">{b.text}</p>
    default:
      return (
        <p>
          <Line text={b.text} />
        </p>
      )
  }
}

function Panel({ title, children, actions }) {
  return (
    <div className="rounded-xl border border-hair bg-panel p-6">
      <p className="font-hand text-2xl text-ink">{title}</p>
      <div className="mt-2 text-ink/70">{children}</div>
      <div className="mt-5 flex flex-wrap gap-3">{actions}</div>
    </div>
  )
}

export default function DraftReader({ idea, text: preWritten, onClose }) {
  // status: ready | writing | done | offline | nokey | error
  const [status, setStatus] = useState(preWritten ? 'ready' : 'writing')
  const [text, setText] = useState(preWritten || '')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const abortRef = useRef(null)
  const bodyRef = useRef(null)

  const run = useCallback(async () => {
    setText('')
    setError('')
    setStatus('writing')
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
        signal: controller.signal,
      })
      // No server behind this address: a static host serving the built site.
      if (res.status === 404 || res.status === 405) return setStatus('offline')
      if (!res.ok || !res.body) {
        let msg = 'The draft could not be written just now.'
        try {
          const data = await res.json()
          if (data?.error) msg = data.error
        } catch {
          /* non-JSON body */
        }
        if (/ANTHROPIC_API_KEY/i.test(msg)) {
          setError(msg)
          return setStatus('nokey')
        }
        throw new Error(msg)
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setText(acc)
      }
      setStatus('done')
    } catch (e) {
      if (e.name === 'AbortError') return
      setError(e.message || 'Something went wrong.')
      setStatus('error')
    }
  }, [idea])

  useEffect(() => {
    if (preWritten) return // already have it, nothing to fetch
    run()
    return () => abortRef.current?.abort()
  }, [preWritten, run])

  useEffect(() => {
    if (status === 'writing' && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [text, status])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ascend-draft.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const { title, subtitle, blocks } = text
    ? formatDraft(text)
    : { title: '', subtitle: '', blocks: [] }
  const showArticle = Boolean(text)
  const finished = status === 'ready' || status === 'done'

  const claudeButton = (
    <a
      href={claudeUrl(idea)}
      target="_blank"
      rel="noreferrer"
      className="sketch bg-accent px-5 py-2.5 text-base font-bold text-ink transition hover:-translate-y-0.5"
    >
      Write it in Claude ↗
    </a>
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-ink/40 p-0 backdrop-blur-sm sm:p-4">
      <div
        className="relative my-0 flex w-full max-w-3xl flex-col bg-paper shadow-lift sm:my-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-hair bg-paper/95 px-5 py-3 backdrop-blur sm:rounded-t-2xl">
          <div className="flex min-w-0 items-center gap-2 text-xs text-ink/55">
            {status === 'writing' ? (
              <span className="inline-flex items-center gap-2 font-semibold text-accentink">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                Writing in Jugal’s voice…
              </span>
            ) : finished ? (
              <span className="font-semibold text-grass">
                Ready to paste · {draftWordCount(text)} words
              </span>
            ) : status === 'error' ? (
              <span className="font-semibold text-crimson">Could not write it</span>
            ) : (
              <span className="font-semibold text-ink/60">One more step</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {finished && (
              <>
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
              </>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full border border-hair bg-panel px-3 py-2 text-sm font-bold text-ink/70 transition hover:text-ink"
            >
              ✕
            </button>
          </div>
        </div>

        <div ref={bodyRef} className="reader max-h-none overflow-y-auto sm:max-h-[80vh]">
          <article className="prose-ascend px-6 py-8 sm:px-10">
            {!showArticle && (
              <p className="mb-6 text-sm text-ink/50">
                <span className="font-semibold text-ink/70">Your idea:</span> “{idea}”
              </p>
            )}

            {status === 'nokey' ? (
              <Panel
                title="Add your key and this writes itself."
                actions={[claudeButton]}
              >
                <p>{error}</p>
                <p className="mt-2">
                  Once the key is in <code className="text-ink">.env</code> and you
                  restart, typing any topic writes the full edition right here. In the
                  meantime you can write this one in Claude.
                </p>
              </Panel>
            ) : status === 'offline' ? (
              <Panel title="This copy of the site is static." actions={[claudeButton]}>
                <p>
                  It can’t write new editions on its own. Run it locally with{' '}
                  <code className="text-ink">npm run dev</code> and a key in{' '}
                  <code className="text-ink">.env</code> and it writes any topic on the
                  page. For now, open this one in Claude and you’ll get the same
                  edition, to the same style guide.
                </p>
              </Panel>
            ) : status === 'error' ? (
              <Panel
                title="That didn’t work."
                actions={[
                  <button
                    key="retry"
                    onClick={run}
                    className="sketch bg-accent px-5 py-2.5 text-base font-bold text-ink transition hover:-translate-y-0.5"
                  >
                    Try again
                  </button>,
                  <a
                    key="claude"
                    href={claudeUrl(idea)}
                    target="_blank"
                    rel="noreferrer"
                    className="sketch bg-panel px-5 py-2.5 text-base font-semibold text-ink transition hover:-translate-y-0.5"
                  >
                    Write it in Claude ↗
                  </a>,
                ]}
              >
                <p>{error}</p>
              </Panel>
            ) : !showArticle ? (
              <div className="space-y-3 py-6">
                <div className="h-8 w-2/3 animate-pulse rounded bg-hair" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-hair" />
                <div className="mt-8 h-4 w-full animate-pulse rounded bg-hair" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-hair" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-hair" />
                <p className="pt-4 text-sm text-ink/45">
                  Reading the style guide and planning the edition. This takes about half
                  a minute.
                </p>
              </div>
            ) : (
              <>
                <h1 className="font-hand text-4xl leading-tight text-ink sm:text-5xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-3 text-lg italic text-ink/60">{subtitle}</p>
                )}
                <div className="mt-6">
                  {blocks.map((b, i) => (
                    <Block key={i} b={b} />
                  ))}
                </div>
                {status === 'writing' && (
                  <span className="ml-0.5 inline-block h-5 w-2 animate-pulse bg-accent align-middle" />
                )}
                {finished && (
                  <p className="mt-10 rounded-xl border border-hair bg-panel px-5 py-4 text-sm text-ink/55">
                    A first draft in Jugal’s voice, ready for a final editor pass. Check
                    every number and link before publishing, then paste it into Substack
                    and drop an illustration at each marker.
                  </p>
                )}
              </>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
