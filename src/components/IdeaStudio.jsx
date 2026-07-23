import { useMemo, useState } from 'react'
import { IDEAS } from '../data/articles.js'
import { generatedFor } from '../data/generated.js'

// An idea is ready if it has a hand-written edition or one written by the
// publish workflow.
function isReady(idea) {
  return Boolean(idea.articleId) || Boolean(generatedFor(idea.id))
}

function IdeaCard({ idea, onClick }) {
  const ready = isReady(idea)
  return (
    <button
      onClick={() => onClick(idea)}
      className="sketch group flex h-full flex-col bg-panel p-5 text-left shadow-card transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full border border-hair bg-paper px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink/60">
          {idea.archetype}
        </span>
        {ready ? (
          <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-grass">
            <span className="h-2 w-2 rounded-full bg-grass" /> Ready
          </span>
        ) : (
          <span className="text-[0.7rem] font-semibold text-accentink">Idea</span>
        )}
      </div>
      <h3 className="font-hand text-2xl leading-tight text-ink">{idea.title}</h3>
      <p className="mt-2 text-sm text-ink/60">{idea.who}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-ink group-hover:text-accentink">
        {ready ? 'Read the draft' : 'Write this edition'}
        <span className="transition group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  )
}

export default function IdeaStudio({ onOpenArticle, onOpenDraft }) {
  const [custom, setCustom] = useState('')
  const [filter, setFilter] = useState('All')

  const archetypes = useMemo(
    () => ['All', 'Ready now', ...Array.from(new Set(IDEAS.map((i) => i.archetype)))],
    []
  )

  const shown = useMemo(() => {
    if (filter === 'All') return IDEAS
    if (filter === 'Ready now') return IDEAS.filter(isReady)
    return IDEAS.filter((i) => i.archetype === filter)
  }, [filter])

  const select = (idea) => {
    if (idea.articleId) return onOpenArticle(idea.articleId)
    onOpenDraft(idea.brief || idea.title, generatedFor(idea.id))
  }

  const submitCustom = (e) => {
    e.preventDefault()
    const v = custom.trim()
    if (v.length < 4) return
    onOpenDraft(v, null) // a brand-new topic has no pre-written edition
  }

  return (
    <section id="studio" className="scroll-mt-20 border-t border-hair bg-paper py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="font-hand text-xl text-accentink">Step 1</p>
          <h2 className="mt-1 font-hand text-4xl text-ink sm:text-5xl">
            Pick an idea, or bring your own
          </h2>
          <p className="mt-3 text-lg text-ink/70">
            These ideas come straight from the threads Jugal writes about, immigration,
            FAANG interviews, studying abroad, and the AI job market. The green
            <span className="font-semibold text-grass"> Ready</span> ones open as a
            complete, paste-ready edition. Type any other topic and it gets written for
            you, to the same style guide.
          </p>
        </div>

        {/* Custom idea box */}
        <form
          onSubmit={submitCustom}
          className="sketch mt-8 flex flex-col gap-3 bg-panel p-5 shadow-card sm:flex-row sm:items-center"
        >
          <label htmlFor="custom" className="sr-only">
            Your own idea
          </label>
          <input
            id="custom"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Or type your own topic… e.g. “How to answer ‘why this company’ in a FAANG loop”"
            className="w-full flex-1 bg-transparent px-2 py-2 text-base text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <button
            type="submit"
            className="sketch-soft shrink-0 bg-accent px-5 py-2.5 text-base font-bold text-ink transition hover:bg-accentink hover:text-paper disabled:opacity-40"
            disabled={custom.trim().length < 4}
          >
            Write the newsletter →
          </button>
        </form>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {archetypes.map((a) => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                filter === a
                  ? 'border-ink bg-ink text-paper'
                  : 'border-hair bg-panel text-ink/70 hover:border-ink/40'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onClick={select} />
          ))}
        </div>
      </div>
    </section>
  )
}
