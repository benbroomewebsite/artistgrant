import { collection, config, fields } from '@keystatic/core'
import { editorBanner, pageBlocks } from './lib/editor-blocks'

// Locally the editor writes straight to content/winners. With
// NEXT_PUBLIC_KEYSTATIC_STORAGE=github it signs editors in with GitHub and
// commits their changes to the repository, which redeploys the site.
const github = process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === 'github'
export const editorEnabled = github || process.env.NODE_ENV === 'development'

// Only the main branch is published. Should a save land on a new branch made in
// the editor, it is named editor/… and .github/workflows/publish-editor-branches.yml
// merges it into main.
export default config({
  storage: github ? { kind: 'github', repo: 'benbroomewebsite/artistgrant', branchPrefix: 'editor/' } : { kind: 'local' },
  ui: { brand: { name: 'Artist Grant' } },
  collections: {
    winners: collection({
      label: 'Grant years',
      slugField: 'year',
      path: 'content/winners/*',
      format: { data: 'json' },
      schema: {
        year: fields.slug({
          name: { label: 'Year', validation: { isRequired: true } },
          slug: {
            label: 'Page address',
            description: 'The last part of the page URL. Use the four-digit year.',
            validation: { pattern: { regex: /^\d{4}$/, message: 'Use the four-digit year, e.g. 2025.' } },
          },
        }),
        blocks: pageBlocks,
        hero: editorBanner('Banner picture', 'The wide picture behind the title at the top of this year’s page.'),
        cover: editorBanner('Previous Winners picture', 'The picture for this year on the Previous Winners page.'),
      },
    }),
  },
})
