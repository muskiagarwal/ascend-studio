const STEPS = [
  {
    n: '1',
    title: 'Pick or type an idea',
    body: 'Choose a suggested topic from Jugal’s real beats, or type your own. The green “Ready” ideas already have a full edition behind them.',
  },
  {
    n: '2',
    title: 'Get the full edition',
    body: 'It arrives written to Jugal’s style guide: the opener ritual, the receipts, the do-this-today beats, real links, no em dashes. Copy it straight into Substack.',
  },
  {
    n: '3',
    title: 'Grab the artwork',
    body: 'Download the hand-drawn illustrations for each section, upload them at their markers, and hit publish. No login, no export step.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-hair py-16">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="font-hand text-4xl text-ink sm:text-5xl">How it works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="sketch bg-panel p-6 shadow-card">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink font-hand text-2xl text-ink">
                {s.n}
              </div>
              <h3 className="font-hand text-2xl text-ink">{s.title}</h3>
              <p className="mt-2 text-ink/70">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
