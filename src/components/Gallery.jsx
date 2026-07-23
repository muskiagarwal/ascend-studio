import { GALLERY, illo } from '../lib/assets.js'

function Shot({ img }) {
  return (
    <div className="sketch group relative overflow-hidden bg-panel p-2.5">
      <a href={illo(img.src)} target="_blank" rel="noreferrer">
        <img src={illo(img.src)} alt={img.alt} className="w-full" loading="lazy" />
      </a>
      <div className="mt-2 flex items-center justify-between gap-2 px-1 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/45">
          {img.kind}
        </span>
        <a
          href={illo(img.src)}
          download={img.src}
          className="rounded-full border border-hair bg-paper px-3 py-1 text-xs font-bold text-ink transition hover:border-ink group-hover:bg-accent group-hover:text-ink"
        >
          ↓ Download PNG
        </a>
      </div>
    </div>
  )
}

export default function Gallery() {
  const total = GALLERY.reduce((n, g) => n + g.images.length, 0)
  return (
    <section id="gallery" className="scroll-mt-20 border-t border-hair bg-panel/40 py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="font-hand text-xl text-accentink">Step 2</p>
          <h2 className="mt-1 font-hand text-4xl text-ink sm:text-5xl">
            Illustrations, ready to download
          </h2>
          <p className="mt-3 text-lg text-ink/70">
            Every edition ships with hand-drawn, Excalidraw-style illustrations in the
            look of the “Big Tech Careers” newsletter, rendered at 2x for Substack.
            All {total} are free to download, one click each.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          {GALLERY.map((g) => (
            <div key={g.id}>
              <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hair pb-2">
                <h3 className="font-hand text-2xl text-ink">{g.edition}</h3>
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  {g.archetype} · {g.images.length} images
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.images.map((img) => (
                  <Shot key={img.src} img={img} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
