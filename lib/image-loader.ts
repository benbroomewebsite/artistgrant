'use client'

import type { ImageLoaderProps } from 'next/image'
import { displayImageUrl } from './image-source'

export default function imageLoader({ src, width }: ImageLoaderProps) {
  return displayImageUrl(src, width)
}
