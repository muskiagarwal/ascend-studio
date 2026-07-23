// Resolve an illustration path that works in dev (/) and on the GitHub Pages
// project subpath (/ascend-studio/), since vite base is './'.
export function illo(src) {
  return `${import.meta.env.BASE_URL}illustrations/${src}`
}

import { ARTICLES } from '../data/articles.js'

// Flat, ordered gallery grouped by edition: hero first, then inline images.
export const GALLERY = Object.values(ARTICLES).map((a) => ({
  id: a.id,
  edition: a.title,
  archetype: a.archetype,
  images: [
    { src: a.hero, alt: `${a.archetype} header`, kind: 'Header' },
    ...a.blocks
      .filter((b) => b.t === 'img')
      .map((b) => ({ src: b.src, alt: b.alt, kind: 'Inline' })),
  ],
}))
