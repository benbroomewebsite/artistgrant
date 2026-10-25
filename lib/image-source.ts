import variants from './image-variants.json'

type DisplayImage = {
  width: number
  height: number
  blurDataURL: string
  variants: { width: number; path: string }[]
}

export const judgeImageSizes = '(max-width: 769px) 88vw, calc((88vw - 180px) / 6)'

export function imageDetails(src: string): DisplayImage | undefined {
  const path = src.startsWith('https://') ? new URL(src).pathname : src
  return (variants as Record<string, DisplayImage>)[path]
}

export function displayImageUrl(src: string, width: number) {
  const image = imageDetails(src)
  if (!image) return src
  const variant = image.variants.find((item) => item.width >= width) ?? image.variants.at(-1)!
  return src.startsWith('https://') ? new URL(variant.path, src).href : variant.path
}
