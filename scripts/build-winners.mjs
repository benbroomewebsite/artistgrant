// Collects the per-year files in content/winners into one generated file the
// site imports, and makes the display sizes of images uploaded in the editor.
// Runs before dev and build; do not edit the output.
//
// Whatever the editor saves must still build: a failed build leaves the live
// site on its previous version without telling the editor why. So a broken
// reference (a missing file, a video address it cannot read) is left out with a
// warning in the build log, rather than stopping the build.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Markdoc from '@markdoc/markdoc'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'))
const mediaPaths = read('lib/media-paths.json')
const storedImages = read('lib/image-variants.json')
const sizes = [320, 480, 640, 960, 1440, 1920, 2560]
const largeVideoBytes = 25 * 1024 * 1024

const warnings = []
const warn = (year, message) => warnings.push(`${year}: ${message}`)

// A path is usable when it is an object in the media bucket or a file uploaded
// through the editor, which the site serves from public/.
const inPublic = (path) => path.startsWith('/uploads/') && !path.includes('..') && existsSync(join(root, 'public', path))
const resolves = (path) => Boolean(mediaPaths[path] || storedImages[path]) || inPublic(path)

const hasContent = (text) => text.replace(/\\\s*$/gm, '').trim().length > 0

function isWebAddress(href) {
  try {
    return ['http:', 'https:'].includes(new URL(href).protocol)
  } catch {
    return false
  }
}

// Accepts any address copied from YouTube or Vimeo and returns its player address.
function playerAddress(href) {
  if (!isWebAddress(href)) return undefined
  const { hostname, pathname, searchParams } = new URL(href)
  const host = hostname.replace(/^www\./, '')
  const part = pathname.split('/').filter(Boolean)
  if (host === 'youtu.be' && part[0]) return `https://www.youtube-nocookie.com/embed/${part[0]}`
  if (['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(host)) {
    const id = searchParams.get('v') ?? (['embed', 'shorts', 'live'].includes(part[0]) ? part[1] : undefined)
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined
  }
  if (host === 'vimeo.com' && /^\d+$/.test(part[0] ?? '')) return `https://player.vimeo.com/video/${part[0]}`
  if (host === 'player.vimeo.com' && part[0] === 'video' && part[1]) return `https://player.vimeo.com/video/${part[1]}`
  return undefined
}

function picture(year, value, kind) {
  const path = value?.upload || value?.src
  if (!path) return undefined
  if (resolves(path)) return path
  warn(year, `${kind} not found, left out: ${path}`)
  return undefined
}

function collectBlock(year, { discriminant: type, value }) {
  switch (type) {
    case 'artist':
      if (!value?.name?.trim()) return undefined
      if (value.link && !isWebAddress(value.link)) warn(year, `the link for ${value.name} is not a web address, so the name is shown without it`)
      return { type, name: value.name.trim(), link: value.link && isWebAddress(value.link) ? value.link : undefined }
    case 'text': {
      const content = value?.content ?? ''
      if (!hasContent(content)) return undefined
      const problems = Markdoc.validate(Markdoc.parse(content)).filter((problem) => ['error', 'critical'].includes(problem.error.level))
      if (problems.length) {
        warn(year, `text left out because it could not be read: ${content.slice(0, 60)}…`)
        return undefined
      }
      return { type, content, large: Boolean(value.large) }
    }
    case 'image': {
      const src = picture(year, value, 'image')
      return src && { type, src, alt: value.alt ?? '' }
    }
    case 'video': {
      const src = picture(year, value, 'video')
      if (src && inPublic(src) && statSync(join(root, 'public', src)).size > largeVideoBytes) warn(year, `video over 25 MB, consider YouTube or Vimeo: ${src}`)
      return src && { type, src, title: value.title || `${year} Grant artist film` }
    }
    case 'embed': {
      if (!value?.url) return undefined
      const src = playerAddress(value.url)
      if (!src) warn(year, `only YouTube and Vimeo addresses can be shown, left out: ${value.url}`)
      return src && { type, src, title: value.title || `${year} Grant video` }
    }
    case 'divider':
      return { type }
    default:
      warn(year, `unknown block left out: ${type}`)
      return undefined
  }
}

function collect(name) {
  const year = name.replace(/\.json$/, '')
  if (!/^\d{4}$/.test(year)) {
    warn(year, 'left off the site because its page address is not a four-digit year')
    return undefined
  }
  const content = read(`content/winners/${name}`)
  const blocks = (content.blocks ?? []).map((block) => collectBlock(year, block)).filter(Boolean)
  const firstImage = blocks.find((block) => block.type === 'image')?.src
  const hero = picture(year, content.hero, 'banner picture') ?? firstImage
  const cover = picture(year, content.cover, 'Previous Winners picture') ?? hero
  if (!hero) warn(year, 'has no pictures, so its banner and Previous Winners picture are blank')
  return { year, hero: hero ?? '', cover: cover ?? '', blocks }
}

// Uploaded images get the same treatment as the media bucket's: a set of WebP
// sizes and a blurred placeholder. Should that fail, the original is shown.
async function displaySizes(path, year) {
  const source = readFileSync(join(root, 'public', path))
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 16)
  const directory = join(root, 'public/generated/winners')
  mkdirSync(directory, { recursive: true })
  try {
    const image = sharp(source, { failOn: 'error' }).rotate()
    const { data, info } = await image.clone().toBuffer({ resolveWithObject: true })
    const blur = await sharp(data).resize(12).webp({ quality: 20 }).toBuffer()
    const largest = Math.min(info.width, sizes.at(-1))
    const variants = []
    for (const width of [...sizes.filter((size) => size < largest), largest]) {
      const file = `${hash}-${width}.webp`
      if (!existsSync(join(directory, file))) await sharp(data).resize(width).webp({ quality: 82 }).toFile(join(directory, file))
      variants.push({ width, path: `/generated/winners/${file}` })
    }
    return { width: info.width, height: info.height, blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`, variants }
  } catch (error) {
    warn(year, `could not prepare ${path}, so the original is used: ${error.message}`)
    return undefined
  }
}

const directory = join(root, 'content/winners')
const pages = readdirSync(directory)
  .filter((name) => name.endsWith('.json'))
  .map(collect)
  .filter(Boolean)
  .sort((a, b) => b.year.localeCompare(a.year))

const uploads = {}
for (const page of pages) {
  const images = [page.hero, page.cover, ...page.blocks.filter((block) => block.type === 'image').map((block) => block.src)]
  for (const path of new Set(images)) {
    if (!path.startsWith('/uploads/') || uploads[path]) continue
    const details = await displaySizes(path, page.year)
    if (details) uploads[path] = details
  }
}

mkdirSync(join(root, 'lib/generated'), { recursive: true })
writeFileSync(join(root, 'lib/generated/winners.json'), `${JSON.stringify(pages, null, 2)}\n`)
writeFileSync(join(root, 'lib/generated/upload-variants.json'), `${JSON.stringify(uploads)}\n`)

for (const warning of warnings) console.warn(`[winners] ${warning}`)
console.log(`[winners] ${pages.length} grant years, ${Object.keys(uploads).length} uploaded images prepared, ${warnings.length} warnings`)
