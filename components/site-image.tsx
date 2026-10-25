import Image, { type ImageProps } from 'next/image'
import { imageDetails } from '@/lib/image-source'

export function SiteImage(props: ImageProps) {
  const details = typeof props.src === 'string' ? imageDetails(props.src) : undefined
  return <Image {...(details ? { placeholder: 'blur' as const, blurDataURL: details.blurDataURL } : {})} {...props} />
}
