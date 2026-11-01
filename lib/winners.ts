import pages from './generated/winners.json'

export type WinnerBlock =
  | { type: 'artist'; name: string; link?: string }
  | { type: 'text'; content: string; large: boolean }
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string; title: string }
  | { type: 'embed'; src: string; title: string }
  | { type: 'divider' }

export type WinnerPage = { year: string; hero: string; cover: string; blocks: WinnerBlock[] }

// Collected from content/winners by scripts/build-winners.mjs, newest year first.
export const winnerPages = pages as unknown as WinnerPage[]
