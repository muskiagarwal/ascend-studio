// Editions written by the GitHub Actions workflow and committed as plain text.
// Vite inlines them at build time, so they ship as static content and open
// instantly, with no API key anywhere in the site.

const files = import.meta.glob('./generated/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default',
})

// { 'i-opt': '<the edition>', ... }
export const GENERATED = Object.fromEntries(
  Object.entries(files).map(([filePath, text]) => [
    filePath.replace(/^.*\/(.+)\.txt$/, '$1'),
    String(text).trim(),
  ])
)

export function generatedFor(ideaId) {
  return GENERATED[ideaId] || null
}
