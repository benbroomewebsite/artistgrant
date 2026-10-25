import mediaPaths from './media-paths.json'

const DEFAULT_MEDIA_BASE_URL = 'https://pub-8a5603baa7c14b72b81d23aa7715704e.r2.dev'

export function mediaUrl(path: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || DEFAULT_MEDIA_BASE_URL).replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const canonicalPath = (mediaPaths as Record<string, string>)[normalizedPath] || normalizedPath
  return `${baseUrl}${canonicalPath}`
}
