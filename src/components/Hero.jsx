import { illo } from '../lib/assets.js'
import { IDEAS } from '../data/articles.js'
import { generatedFor } from '../data/generated.js'

// Counts stay honest as the publish workflow writes more editions.
const READY = IDEAS.filter((i) => i.articleId || generatedFor(i.id)).length

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-hair bg-panel px-3 py-1 text-xs font-medium text-ink/70">
            <span className="h-2 w-2 rounded-full bg-accent" />
            For Jugal Bhatt’s “Ascend” · 19,000+ subscribers
          </div>

          <h1 className="font-hand text-[2.4rem] leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
            Turn an idea into a <span className="mark">publish-ready</span> newsletter.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75">
            Pick one of the suggested ideas, or type your own. You get a complete Ascend
            edition written in Jugal’s real voice, paste-ready for Substack, plus
            hand-drawn illustrations you can download. No login, nothing to install.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#studio"
              className="sketch bg-accent px-6 py-3 text-base font-bold text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              Start writing →
            </a>
            <a
              href="#gallery"
              className="sketch bg-panel px-6 py-3 text-base font-semibold text-ink transition hover:-translate-y-0.5"
            >
              See the illustrations
            </a>
          </div>

          <p className="mt-6 text-sm text-ink/55">
            {READY} paste-ready editions · 12 downloadable illustrations · built from the{' '}
            <span className="font-hand text-base">jugal-newsletter-writer</span> skill
          </p>
        </div>

        {/* Peeking illustration stack */}
        <div className="relative hidden h-[380px] lg:block">
          <img
            src={illo('04-h1b-header.png')} alt=""
            className="sketch absolute right-8 top-4 w-[78%] rotate-[-4deg] bg-panel p-2 shadow-lift"
          />
          <img
            src={illo('10-free-header.png')} alt=""
            className="sketch absolute left-0 top-24 w-[70%] rotate-[3deg] bg-panel p-2 shadow-card"
          />
          <img
            src={illo('01-leetcode-header.png')} alt=""
            className="sketch absolute bottom-0 right-16 w-[72%] rotate-[-1deg] bg-panel p-2 shadow-lift animate-floaty"
          />
        </div>
      </div>
    </section>
  )
}
