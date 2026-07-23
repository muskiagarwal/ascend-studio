import { useCallback, useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import IdeaStudio from './components/IdeaStudio.jsx'
import Gallery from './components/Gallery.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Footer from './components/Footer.jsx'
import ArticleReader from './components/ArticleReader.jsx'
import DraftReader from './components/DraftReader.jsx'

export default function App() {
  // overlay = null
  //   | { kind:'article', id }            hand-written edition
  //   | { kind:'draft', idea, text }      generated edition, or handoff when text is null
  const [overlay, setOverlay] = useState(null)

  const close = useCallback(() => setOverlay(null), [])
  const openArticle = useCallback((id) => setOverlay({ kind: 'article', id }), [])
  const openDraft = useCallback(
    (idea, text) => setOverlay({ kind: 'draft', idea, text }),
    []
  )

  // Esc to close, and lock body scroll while an overlay is open
  useEffect(() => {
    if (!overlay) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [overlay, close])

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <IdeaStudio onOpenArticle={openArticle} onOpenDraft={openDraft} />
        <Gallery />
        <HowItWorks />
      </main>
      <Footer />

      {overlay?.kind === 'article' && (
        <div onClick={close}>
          <ArticleReader articleId={overlay.id} onClose={close} />
        </div>
      )}
      {overlay?.kind === 'draft' && (
        <div onClick={close}>
          <DraftReader idea={overlay.idea} text={overlay.text} onClose={close} />
        </div>
      )}
    </div>
  )
}
