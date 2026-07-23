// Render the Excalidraw-style SVGs to Substack-ready PNGs at 2x, with the
// Virgil handwriting font embedded. Pure JS (no librsvg/rsvg-convert needed) —
// the hand-drawn wobble is baked into the path geometry by excali.py.
import { Resvg } from '@resvg/resvg-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'images-src')
const OUT = path.join(ROOT, 'public', 'illustrations')
const FONT = path.join(ROOT, 'public', 'fonts', 'Virgil.ttf')

fs.mkdirSync(OUT, { recursive: true })

const svgs = fs.readdirSync(SRC).filter((f) => f.endsWith('.svg')).sort()
if (svgs.length === 0) {
  console.error('No .svg files in images-src/. Run make_images.py first.')
  process.exit(1)
}

for (const file of svgs) {
  const svg = fs.readFileSync(path.join(SRC, file), 'utf8')
  const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/)
  const width = m ? Number(m[1]) : 1200
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width * 2 },
    background: '#ffffff',
    font: {
      fontFiles: [FONT],
      loadSystemFonts: true,
      defaultFontFamily: 'Virgil',
    },
  })
  const png = resvg.render().asPng()
  const out = path.join(OUT, file.replace(/\.svg$/, '.png'))
  fs.writeFileSync(out, png)
  console.log(`rendered ${path.basename(out)} (${width * 2}px)`)
}
