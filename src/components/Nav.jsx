const LINKS = [
  ['Idea studio', '#studio'],
  ['Illustrations', '#gallery'],
  ['How it works', '#how'],
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hair/80 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a href="#top" className="flex shrink-0 items-center gap-2">
          <img src="./favicon.svg" alt="" className="h-8 w-8 shrink-0" />
          <span className="whitespace-nowrap font-hand text-xl leading-none sm:text-2xl">
            Ascend Studio
          </span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-ink/70 transition hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href="https://jugaldb.substack.com"
          target="_blank"
          rel="noreferrer"
          className="sketch-soft shrink-0 whitespace-nowrap bg-ink px-3 py-2 text-xs font-semibold text-paper transition hover:bg-accentink sm:px-4 sm:text-sm"
        >
          Read Ascend ↗
        </a>
      </div>
    </header>
  )
}
