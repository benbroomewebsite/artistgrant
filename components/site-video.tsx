'use client'

import { useEffect, useRef, useState } from 'react'

export function SiteVideo({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setReady(true)
      else video.pause()
    }, { rootMargin: '300px' })
    observer.observe(video)
    return () => observer.disconnect()
  }, [])
  return <video ref={ref} controls loop muted playsInline preload="metadata" src={ready ? src : undefined} aria-label={title} />
}
