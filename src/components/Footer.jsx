export default function Footer() {
  return (
    <footer className="border-t border-hair bg-ink py-12 text-paper">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <img src="./favicon.svg" alt="" className="h-8 w-8" />
              <span className="font-hand text-2xl">Ascend Studio</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-paper/65">
              A drafting studio for “Ascend”, Jugal Bhatt’s weekly Substack for students
              and early-career professionals navigating global education, careers, and US
              visas. Drafts are starting points, always given a final human edit before
              they go out.
            </p>
          </div>
          <div className="flex gap-14">
            <div>
              <p className="font-hand text-lg text-accent">Jugal</p>
              <ul className="mt-2 space-y-2 text-sm text-paper/70">
                <li><a className="hover:text-paper" href="https://jugaldb.substack.com" target="_blank" rel="noreferrer">Ascend on Substack ↗</a></li>
                <li><a className="hover:text-paper" href="https://www.linkedin.com/in/jugaldb" target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
                <li><a className="hover:text-paper" href="https://www.instagram.com/jugaldb" target="_blank" rel="noreferrer">Instagram ↗</a></li>
              </ul>
            </div>
            <div>
              <p className="font-hand text-lg text-accent">On this page</p>
              <ul className="mt-2 space-y-2 text-sm text-paper/70">
                <li><a className="hover:text-paper" href="#studio">Idea studio</a></li>
                <li><a className="hover:text-paper" href="#gallery">Illustrations</a></li>
                <li><a className="hover:text-paper" href="#how">How it works</a></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-paper/15 pt-6 text-xs text-paper/45">
          Built from the jugal-newsletter-writer skill. Not affiliated with Substack.
          Article drafts and illustrations are generated to Jugal’s style guide and are
          meant to be reviewed before publishing.
        </p>
      </div>
    </footer>
  )
}
